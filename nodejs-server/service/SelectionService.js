'use strict';
const Profile = require('../models/profile');
const helper = require('../helpers/profileHelperFunctions')
const HELPER_CONST = require('../helpers/profileHelperConstants')

/**
 * Get a list of profile metadata for all profiles in a given time window.
 *
 * startDate Date date-time formatted string indicating the beginning of a time period
 * endDate Date date-time formatted string indicating the end of a time period
 * returns List
 **/
exports.selectionGlobalMapProfiles = function(startDate,endDate) {
  return new Promise(function(resolve, reject) {
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    if ((endDate - startDate)/3600000 > 72) reject({"code": 400, "message": "Please request <= 72 hours of data at a time."});

    const query = Profile.aggregate([
        {$match:  {date: {$lte: endDate, $gte: startDate}}},
        {$project: HELPER_CONST.MAP_META_AGGREGATE},
    ]);
    query.exec(function (err, meta) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(meta.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(meta);
    })
  });
}


/**
 * Provides a summary of the profile database.
 *
 * returns profileCollectionSummary
 **/
exports.selectionOverview = function() {
  return new Promise(function(resolve, reject) {
    Promise.all([
        Profile.estimatedDocumentCount({}),
        Profile.distinct('dac'),
        Profile.find({'isDeep':true}).countDocuments(),
        Profile.find({'containsBGC':true}).countDocuments(),
        Profile.aggregate([{ $sort: { date: -1 } }, {$project: {'date_added': 1}}, { $limit : 1 }])
    ]).then( ([ numberOfProfiles, dacs, numberDeep, numberBgc, lastAdded ]) => {
        const date = lastAdded[0].date_added
        let overviewData = {'numberOfProfiles': numberOfProfiles, 'dacs': dacs, 'numberDeep': numberDeep, 'numberBgc': numberBgc, 'lastAdded': lastAdded[0]['date_added']}
        resolve(overviewData);
    }).catch(error => {
        reject({"code": 500, "message": "Server error"});
    });

  });
}


/**
 * Get a list of profiles by ID, keeping only levels within a range of pressures.
 *
 * presRange List Pressure range (optional)
 * ids List List of profile IDs (optional)
 * returns List
 **/
exports.selectionProfileList = function(presRange,ids) {
  return new Promise(function(resolve, reject) {
<<<<<<< HEAD

    let agg = [{$match: {_id: { $in: ids}}}]
    if (presRange){
        agg.push(helper.make_pres_project(presRange[0], presRange[1], 'measurements'))
=======
    var examples = {};
    examples['application/json'] = [ {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "date_qc" : 1,
  "euroargoPlatform" : "euroargoPlatform",
  "dac" : "dac",
  "lon" : 2.3021358869347655,
  "WMO_INST_TYPE" : "WMO_INST_TYPE",
  "station_parameters_in_nc" : [ "station_parameters_in_nc", "station_parameters_in_nc" ],
  "roundLat" : "roundLat",
  "strLon" : "strLon",
  "station_parameters" : [ "station_parameters", "station_parameters" ],
  "pres_min_for_PSAL" : 4.145608029883936,
  "PLATFORM_TYPE" : "PLATFORM_TYPE",
  "bgcMeas" : [ {
    "psal_qc" : 9,
    "pres" : 6.84685269835264,
    "pres_qc" : 7,
    "doxy_qc" : 9,
    "nitrate" : 2.8841621266687802,
    "down_irradiance412_qc" : 3,
    "cndx" : 9.369310271410669,
    "cdom" : 6.965117697638846,
    "bbp700" : 6.878052220127876,
    "psal" : 5.025004791520295,
    "nitrate_qc" : 6,
    "down_irradiance442" : 3.0937452626664474,
    "temp" : 1.1730742509559433,
    "doxy" : 8.762042012749001,
    "cndx_qc" : 6,
    "downwelling_par" : 6.519180951018382,
    "cdom_qc" : 1,
    "chla" : 6.438423552598547,
    "down_irradiance490" : 0.8851374739011653,
    "downwelling_par_qc" : "downwelling_par_qc",
    "chla_qc" : 3,
    "down_irradiance490_qc" : 7,
    "down_irradiance412" : 6.704019297950036,
    "down_irradiance442_qc" : 7,
    "temp_qc" : 4,
    "bbp700_qc" : 5
  }, {
    "psal_qc" : 9,
    "pres" : 6.84685269835264,
    "pres_qc" : 7,
    "doxy_qc" : 9,
    "nitrate" : 2.8841621266687802,
    "down_irradiance412_qc" : 3,
    "cndx" : 9.369310271410669,
    "cdom" : 6.965117697638846,
    "bbp700" : 6.878052220127876,
    "psal" : 5.025004791520295,
    "nitrate_qc" : 6,
    "down_irradiance442" : 3.0937452626664474,
    "temp" : 1.1730742509559433,
    "doxy" : 8.762042012749001,
    "cndx_qc" : 6,
    "downwelling_par" : 6.519180951018382,
    "cdom_qc" : 1,
    "chla" : 6.438423552598547,
    "down_irradiance490" : 0.8851374739011653,
    "downwelling_par_qc" : "downwelling_par_qc",
    "chla_qc" : 3,
    "down_irradiance490_qc" : 7,
    "down_irradiance412" : 6.704019297950036,
    "down_irradiance442_qc" : 7,
    "temp_qc" : 4,
    "bbp700_qc" : 5
  } ],
  "date_formatted" : "2000-01-23",
  "isDeep" : true,
  "platform_number" : 7,
  "BASIN" : 7.386281948385884,
  "lat" : 5.637376656633329,
  "VERTICAL_SAMPLING_SCHEME" : "VERTICAL_SAMPLING_SCHEME",
  "pres_max_for_TEMP" : 9.301444243932576,
  "measurements" : [ {
    "temp" : 1.0246457001441578,
    "pres" : 1.2315135367772556,
    "psal" : 1.4894159098541704
  }, {
    "temp" : 1.0246457001441578,
    "pres" : 1.2315135367772556,
    "psal" : 1.4894159098541704
  } ],
  "roundLon" : "roundLon",
  "bgcMeasKeys" : [ "bgcMeasKeys", "bgcMeasKeys" ],
  "position_qc" : 0,
  "DIRECTION" : "DIRECTION",
  "pres_max_for_PSAL" : 3.616076749251911,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "DATA_CENTRE" : "DATA_CENTRE",
  "url" : "url",
  "nc_url" : "nc_url",
  "PARAMETER_DATA_MODE" : [ "PARAMETER_DATA_MODE", "PARAMETER_DATA_MODE" ],
  "date_added" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 6,
  "PI_NAME" : "PI_NAME",
  "pres_min_for_TEMP" : 2.027123023002322,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "jcommopsPlatform" : "jcommopsPlatform",
  "core_data_mode" : "core_data_mode",
  "formatted_station_parameters" : [ "formatted_station_parameters", "formatted_station_parameters" ],
  "max_pres" : 5.962133916683182,
  "containsBGC" : true,
  "strLat" : "strLat",
  "_id" : "_id"
}, {
  "date" : "2000-01-23T04:56:07.000+00:00",
  "date_qc" : 1,
  "euroargoPlatform" : "euroargoPlatform",
  "dac" : "dac",
  "lon" : 2.3021358869347655,
  "WMO_INST_TYPE" : "WMO_INST_TYPE",
  "station_parameters_in_nc" : [ "station_parameters_in_nc", "station_parameters_in_nc" ],
  "roundLat" : "roundLat",
  "strLon" : "strLon",
  "station_parameters" : [ "station_parameters", "station_parameters" ],
  "pres_min_for_PSAL" : 4.145608029883936,
  "PLATFORM_TYPE" : "PLATFORM_TYPE",
  "bgcMeas" : [ {
    "psal_qc" : 9,
    "pres" : 6.84685269835264,
    "pres_qc" : 7,
    "doxy_qc" : 9,
    "nitrate" : 2.8841621266687802,
    "down_irradiance412_qc" : 3,
    "cndx" : 9.369310271410669,
    "cdom" : 6.965117697638846,
    "bbp700" : 6.878052220127876,
    "psal" : 5.025004791520295,
    "nitrate_qc" : 6,
    "down_irradiance442" : 3.0937452626664474,
    "temp" : 1.1730742509559433,
    "doxy" : 8.762042012749001,
    "cndx_qc" : 6,
    "downwelling_par" : 6.519180951018382,
    "cdom_qc" : 1,
    "chla" : 6.438423552598547,
    "down_irradiance490" : 0.8851374739011653,
    "downwelling_par_qc" : "downwelling_par_qc",
    "chla_qc" : 3,
    "down_irradiance490_qc" : 7,
    "down_irradiance412" : 6.704019297950036,
    "down_irradiance442_qc" : 7,
    "temp_qc" : 4,
    "bbp700_qc" : 5
  }, {
    "psal_qc" : 9,
    "pres" : 6.84685269835264,
    "pres_qc" : 7,
    "doxy_qc" : 9,
    "nitrate" : 2.8841621266687802,
    "down_irradiance412_qc" : 3,
    "cndx" : 9.369310271410669,
    "cdom" : 6.965117697638846,
    "bbp700" : 6.878052220127876,
    "psal" : 5.025004791520295,
    "nitrate_qc" : 6,
    "down_irradiance442" : 3.0937452626664474,
    "temp" : 1.1730742509559433,
    "doxy" : 8.762042012749001,
    "cndx_qc" : 6,
    "downwelling_par" : 6.519180951018382,
    "cdom_qc" : 1,
    "chla" : 6.438423552598547,
    "down_irradiance490" : 0.8851374739011653,
    "downwelling_par_qc" : "downwelling_par_qc",
    "chla_qc" : 3,
    "down_irradiance490_qc" : 7,
    "down_irradiance412" : 6.704019297950036,
    "down_irradiance442_qc" : 7,
    "temp_qc" : 4,
    "bbp700_qc" : 5
  } ],
  "date_formatted" : "2000-01-23",
  "isDeep" : true,
  "platform_number" : 7,
  "BASIN" : 7.386281948385884,
  "lat" : 5.637376656633329,
  "VERTICAL_SAMPLING_SCHEME" : "VERTICAL_SAMPLING_SCHEME",
  "pres_max_for_TEMP" : 9.301444243932576,
  "measurements" : [ {
    "temp" : 1.0246457001441578,
    "pres" : 1.2315135367772556,
    "psal" : 1.4894159098541704
  }, {
    "temp" : 1.0246457001441578,
    "pres" : 1.2315135367772556,
    "psal" : 1.4894159098541704
  } ],
  "roundLon" : "roundLon",
  "bgcMeasKeys" : [ "bgcMeasKeys", "bgcMeasKeys" ],
  "position_qc" : 0,
  "DIRECTION" : "DIRECTION",
  "pres_max_for_PSAL" : 3.616076749251911,
  "POSITIONING_SYSTEM" : "POSITIONING_SYSTEM",
  "DATA_CENTRE" : "DATA_CENTRE",
  "url" : "url",
  "nc_url" : "nc_url",
  "PARAMETER_DATA_MODE" : [ "PARAMETER_DATA_MODE", "PARAMETER_DATA_MODE" ],
  "date_added" : "2000-01-23T04:56:07.000+00:00",
  "cycle_number" : 6,
  "PI_NAME" : "PI_NAME",
  "pres_min_for_TEMP" : 2.027123023002322,
  "geoLocation" : {
    "coordinates" : [ 0.8008281904610115, 0.8008281904610115 ],
    "type" : "type"
  },
  "DATA_MODE" : "DATA_MODE",
  "jcommopsPlatform" : "jcommopsPlatform",
  "core_data_mode" : "core_data_mode",
  "formatted_station_parameters" : [ "formatted_station_parameters", "formatted_station_parameters" ],
  "max_pres" : 5.962133916683182,
  "containsBGC" : true,
  "strLat" : "strLat",
  "_id" : "_id"
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
>>>>>>> templates
    }
    agg.push({$match: {measurements: {$not: {$size: 0}}}})
    agg.push({$sort: { date: -1}})
    const query = Profile.aggregate(agg)
    query.exec(function (err, profs) {
        if (err) reject({"code": 500, "message": "Server error"});
        if(profs.length == 0) reject({"code": 404, "message": "Not found: No matching results found in database."});
        resolve(profs);
    })
  });
}

