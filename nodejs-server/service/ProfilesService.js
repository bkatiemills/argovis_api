'use strict';
const Profile = require('../models/profile');
const GJV = require('geojson-validation');
const helpers = require('./helpers')

/**
 * Search, reduce and download profile data.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * id String Profile ID (optional)
 * platform String Platform ID (optional)
 * presRange List Pressure range (optional)
 * dac String Data Assembly Center (optional)
 * source String  (optional)
 * woceline String  (optional)
 * datavars List AND list of variables to require in a profile (optional)
 * compression String Data compression strategy (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profile = function(startDate,endDate,polygon,box,center,radius,id,platform,presRange,dac,source,woceline,datavars,compression,data) {
  return new Promise(function(resolve, reject) {

    if ((!endDate || !startDate)) {
      reject({"code": 400, "message": "Please specify at least a date range with startDate and endDate."});
      return; 
    } 
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    let aggPipeline = profile_candidate_agg_pipeline(startDate,endDate,polygon,box,center,radius,id,platform,dac,source,woceline)

    if('code' in aggPipeline){
      reject(aggPipeline);
      return;
    }

    // project out data here if we definitely don't need it
    if(!data && !datavars && !presRange){
      aggPipeline.push({$project: {data: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      if(profiles.length > 1000){
        reject({"code": 400, "message": "Your query is too broad and matched too many profiles; please use the filters to make a narrower request, and feel free to make multiple requests to cover more cases."});
        return; 
      }

      profiles = helpers.filter_data(profiles, data, datavars, presRange)

      // reinflate data by default
      if(data && !compression){
        profiles = profiles.map(p => reinflate(p))
      }

      if(profiles.length == 0) {
        reject({"code": 404, "message": "Not found: No matching results found in database."});
        return;
      }

      resolve(profiles);
    })
  }
)}

/**
 * List profile IDs that match a search
 *
 * startDate Date date-time formatted string indicating the beginning of a time period (optional)
 * endDate Date date-time formatted string indicating the end of a time period (optional)
 * polygon String array of [lon, lat] vertices describing a polygon; final point must match initial point (optional)
 * box String box described as [[lower left lon, lower left lat], [upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from (optional)
 * radius BigDecimal km from centerpoint (optional)
 * dac String Data Assembly Center (optional)
 * source String  (optional)
 * woceline String  (optional)
 * datavars List AND list of variables to require in a profile (optional)
 * platform String Platform ID (optional)
 * presRange List Pressure range (optional)
 * data List Keys of data to include (optional)
 * returns List
 **/
exports.profileList = function(startDate,endDate,polygon,box,center,radius,dac,source,woceline,datavars,platform,presRange,data) {
  return new Promise(function(resolve, reject) {
    if ((!endDate || !startDate)) {
      reject({"code": 400, "message": "Please specify at least a date range with startDate and endDate."});
      return; 
    } 
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    let aggPipeline = profile_candidate_agg_pipeline(startDate,endDate,polygon,box,center,radius,null,platform,dac,source,woceline)

    if('code' in aggPipeline){
      reject(aggPipeline);
      return;
    }

    // project out data here if we definitely don't need it
    if(!data && !datavars && !presRange){
      aggPipeline.push({$project: {data: 0}})
    }

    const query = Profile.aggregate(aggPipeline);

    query.exec(function (err, profiles) {
      if (err){
        reject({"code": 500, "message": "Server error"});
        return;
      }

      if(profiles.length > 10000){
        reject({"code": 400, "message": "Your query is too broad and matched too many profiles; please use the filters to make a narrower request, and feel free to make multiple requests to cover more cases."});
        return; 
      }

      profiles = helpers.filter_data(profiles, data, datavars, presRange)

      if(profiles.length == 0) {
        reject({"code": 404, "message": "Not found: No matching results found in database."});
        return;
      }

      resolve(Array.from(profiles, x => x._id))
    })
  });
}


/**
 * Provides a summary of the profile database.
 *
 * returns profileCollectionSummary
 **/
exports.profilesOverview = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
        Profile.estimatedDocumentCount({}),
        Profile.distinct('data_center'),
        Profile.aggregate([
          {$match: {'source_info.source':'argo_deep' }},
          {$count: "ndeep"}
        ]),
        Profile.aggregate([ // currently really, really slow
          {$match: {'source_info.source':'argo_bgc' }},
          {$count: "nbgc"}
        ]),
        Profile.aggregate([{ $sort: { date_updated_argovis: -1 } }, {$project: {'date_updated_argovis': 1}}, { $limit : 1 }])
    ]).then( ([ numberOfProfiles, dacs, numberDeep, numberBgc, lastAdded ]) => {
        const date = lastAdded[0].date_added
        let overviewData = {'numberOfProfiles': numberOfProfiles, 'dacs': dacs, 'numberDeep': numberDeep[0]['ndeep'], 'numberBgc': numberBgc[0]['nbgc'], 'lastAdded': lastAdded[0]['date_updated_argovis']}
        resolve(overviewData);
    }).catch(error => {
        reject({"code": 500, "message": "Server error"});
        return;
    });

  });
}

// helpers /////////////////////////////////////

const pressureWindow = function(measType, minPres, maxPres){ //todo no longer makes sense with current schema
  // measType == 'measurements' or 'bgcMeas'

  const pWindow = {
    $addFields: {
      [measType]: {
        $filter: {
          input: "$".concat(measType),
          as: "m",
          cond: {$and: [
            {$gt: ['$$m.pres', minPres]},
            {$lt: ['$$m.pres', maxPres]}
          ]},
        }
      }
    }
  }

  return pWindow
}

const reinflate = function(profile){
  // given a profile object with data minified as an array of arrays of floats,
  // reinflate the data key to it's more traditional list of dictionaries.

  let levelinflate = function(data_keys, level){
    let l = {}
    for(let i=0; i<level.length; i++){
      l[data_keys[i]] = level[i]
    }
    return l
  }

  let data = profile.data.map(level => levelinflate.bind(null, profile.data_keys)(level))
  profile.data = data

  return profile
}

const profile_candidate_agg_pipeline = function(startDate,endDate,polygon,box,center,radius,id,platform,dac,source,woceline){
    // return an aggregation pipeline array that describes how we want to filter eligible profiles
    // in case of error, return the object to pass to reject().

    // sanity checks
    if((center && box) || (center && polygon) || (box && polygon)){
      reject({"code": 400, "message": "Please request only one of box, polygon or center."});
      return; 
    }

    if((center && !radius) || (!center && radius)){
      reject({"code": 400, "message": "Please specify both radius and center to filter for profiles less than <radius> km from <center>."});
      return; 
    }

    let aggPipeline = []

    if(center && radius) {
      // $geoNear must be first in the aggregation pipeline
      aggPipeline.push({$geoNear: { near: {type: "Point", coordinates: [center[0], center[1]]}, maxDistance: 1000*radius, distanceField: "distcalculated"}}) 
      aggPipeline.push({ $unset: "distcalculated" })
    }

    if (startDate){
      aggPipeline.push({$match:  {timestamp: {$gte: startDate}}})
    }

    if(endDate){
      aggPipeline.push({$match:  {timestamp: {$lte: endDate}}})
    }

    if(id){
      aggPipeline.push({ $match : { _id : id } })
    }

    if(platform){
      aggPipeline.push({ $match : { platform_id : String(platform) } })
    }

    if(polygon) {
      // sanitation
      try {
        polygon = JSON.parse(polygon);
      } catch (e) {
        return {"code": 400, "message": "Polygon region wasn't proper JSON; format should be [[lon,lat],[lon,lat],...]"};
      }

      if(!helpers.validlonlat(polygon)){
        return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
      }

      polygon = {
        "type": "Polygon",
        "coordinates": [polygon]
      }

      if(!GJV.valid(polygon)){
        return {"code": 400, "message": "Polygon region wasn't proper geoJSON; format should be [[lon,lat],[lon,lat],...]"};
      }

      aggPipeline.push({$match: {geolocation: {$geoWithin: {$geometry: polygon}}}})
    }

    if(box) {
      // sanitation
      try {
        box = JSON.parse(box);
      } catch (e) {
        return {"code": 400, "message": "Box region wasn't proper JSON; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"};
      }
      if(box.length != 2 || 
         box[0].length != 2 || 
         box[1].length != 2 || 
         typeof box[0][0] != 'number' ||
         typeof box[0][1] != 'number' ||
         typeof box[1][0] != 'number' || 
         typeof box[1][1] != 'number') {
        return {"code": 400, "message": "Box region wasn't specified correctly; format should be [[lower left lon,lower left lat],[upper right lon,upper right lat]]"};
      }

      if(!helpers.validlonlat(box)){
        return {"code": 400, "message": "All lon, lat pairs must respect -180<=lon<=180 and -90<=lat<-90"}; 
      }

      aggPipeline.push({$match: {geolocation: {$geoWithin: {$box: box}}}})
    }

    if(dac){
      aggPipeline.push({ $match : { data_center : dac } })
    }

    if(source){
      aggPipeline.push({$match: {'source_info.source': source}})
    }

    if(woceline){
      aggPipeline.push({$match: {'woce_lines': woceline}})
    }

    return aggPipeline
}
