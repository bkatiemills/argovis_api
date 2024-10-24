'use strict';
const Timeseries = require('../models/timeseries');
const helpers = require('../helpers/helpers')
const GJV = require('geojson-validation');
const summaries = require('../models/summary');

/**
 * Search and filter for timeseries named in path
 *
 * timeseriesName String 
 * id String Unique ID to search for. (optional)
 * startDate Date ISO 8601 UTC date-time formatted string indicating the beginning of the time period of interest. (optional)
 * endDate Date ISO 8601 UTC date-time formatted string indicating the end of the time period of interest. (optional)
 * polygon String array of [lon, lat] vertices describing a polygon bounding the region of interest; final point must match initial point (optional)
 * box String lon, lat pairs of the lower left and upper right corners of a box on a mercator projection, packed like [[lower left lon, lower left lat],[upper right lon, upper right lat]] (optional)
 * center List center to measure max radius from when defining circular region of interest; must be used in conjunction with query string parameter 'radius'. (optional)
 * radius BigDecimal km from centerpoint when defining circular region of interest; must be used in conjunction with query string parameter 'center'. (optional)
 * compression String Data minification strategy to apply. (optional)
 * mostrecent BigDecimal get back only the n records with the most recent values of timestamp. (optional)
 * data List Keys of data to include. Return only documents that have all data requested, within the pressure range if specified. Accepts ~ negation to filter out documents including the specified data. Omission of this parameter will result in metadata only responses. (optional)
 * batchmeta String return the metadata documents corresponding to a temporospatial data search (optional)
 * returns List
 **/
exports.findtimeseries = function(res,timeseriesName,id,startDate,endDate,polygon,box,center,radius,compression,mostrecent,data,batchmeta) {
  return new Promise(function(resolve, reject) {
    // generic helper for all timeseries search and filter routes
    // input sanitization
    let params = helpers.parameter_sanitization(timeseriesName,id,startDate,endDate,polygon,box,false,center,radius)
    if(params.hasOwnProperty('code')){
      // error, return and bail out
      reject(params)
      return
    }

    params.mostrecent = mostrecent
    params.batchmeta = batchmeta
    params.compression = compression

    // decide y/n whether to service this request
    let bailout = helpers.request_sanitation(params.polygon, params.center, params.radius, params.box) 
    if(bailout){
      reject(bailout)
      return
    }

    // local filter: fields in data collection other than geolocation and timestamp 
    let local_filter = {$match:{}}
    if(id){
        local_filter['$match']['_id'] = id
    }
    if(Object.keys(local_filter['$match']).length > 0){
      local_filter = [local_filter]
    } else {
      local_filter = []
    }

    // postprocessing parameters
    let pp_params = {
        compression: compression,
        data: JSON.stringify(data) === '["except-data-values"]' ? null : data, // ie `data=except-data-values` is the same as just omitting the data qsp
        presRange: null,
        dateRange: [params.startDate, params.endDate],
        //mostrecent: mostrecent, // mostrecent filtering done in mongo during stream for timeseries
        suppress_meta: false,
        batchmeta : batchmeta
    }

    // can we afford to project data documents down to a subset in aggregation?
    let projection = null
    if(compression=='minimal' && data==null){
      projection = ['_id', 'metadata', 'geolocation']
    }

    // always fetch the metadata doc so we can pull the full list of timesteps off of it
    let metafilter = Timeseries['timeseriesMeta'].aggregate([{$match: {"_id": timeseriesName}}]).exec()
    params.metafilter = false

    // datafilter must run syncronously after metafilter in case metadata info is the only search parameter for the data collection
    let datafilter = metafilter.then(helpers.datatable_stream.bind(null, Timeseries[timeseriesName], params, local_filter, projection, null))

    Promise.all([metafilter, datafilter])
        .then(search_result => {

          let stub = function(data, metadata){
              // given a data and corresponding metadata document,
              // return the record that should be returned when the compression=minimal API flag is set
              // should be id, long, lat, timestamp, and then anything needed to group this point together with other points in interesting ways.
              return [
                data['_id'], 
                data.geolocation.coordinates[0], 
                data.geolocation.coordinates[1],
                data['metadata']
              ]
          }
          let postprocess = helpers.post_xform(Timeseries['timeseriesMeta'], pp_params, search_result, res, stub)
          res.status(404) // 404 by default
          resolve([search_result[1], postprocess])
        })
  });
}


/**
 * Metadata for timeseries by ID
 *
 * id String Unique ID to search for. (optional)
 * returns List
 **/
exports.findtimeseriesMeta = function(res, id) {
  return new Promise(function(resolve, reject) {
    let match = {
      '_id': id
    }
    Object.keys(match).forEach((k) => match[k] === undefined && delete match[k]);

    const query = Timeseries['timeseriesMeta'].aggregate([{$match:match}]);
    let postprocess = helpers.meta_xform(res)
    res.status(404) // 404 by default
    resolve([query.cursor(), postprocess])  
  })
}


/**
 * List data and lattice for the requested timeseries.
 *
 * timeseriesName String 
 * parameter String categorical timeseries search and filter parameters
 * returns List
 **/
exports.timeseriesVocab = function(timeseriesName,parameter) {
  return new Promise(function(resolve, reject) {
    if(parameter == 'enum'){
      resolve(["data"])
      return
    } else{
      let metaid = {
        "noaasst":"noaasst", 
        "copernicussla":"copernicussla", 
        "ccmpwind":"ccmpwind"
      }[timeseriesName]

      const query = Timeseries['timeseriesMeta'].find({"_id":metaid}).lean()
      query.exec(helpers.queryCallback.bind(null,x=>x[0]["data_info"][0], resolve, reject))
    }
  });
}

