'use strict';
const apihits = require('../models/apihits');
var utils = require('../utils/writer.js');
var Tc = require('../service/TcService');
var helpers = require('../helpers/helpers')

module.exports.findTC = function findTC (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, name, mostrecent, compression, data, batchmeta) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Tc.findTC(res, id, startDate, endDate, polygon, box, center, radius, metadata, name, mostrecent, compression, data, batchmeta)
    .then(pipefittings => helpers.data_pipeline.bind(null, res, batchmeta)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findTCmeta = function findTCmeta (req, res, next, id, name) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})

  Tc.findTCmeta(res,id,name)
   .then(pipefittings => helpers.data_pipeline.bind(null, res, false)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tcVocab = function tcVocab (req, res, next, parameter) {

  apihits.apihits.create({metadata: req.openapi.openApiRoute, query: req.query, isWeb: req.headers.origin === 'https://argovis.colorado.edu', avhTelemetry: req.headers.hasOwnProperty('x-avh-telemetry') ? req.headers['x-avh-telemetry'] : null})
  
  Tc.tcVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    },
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
