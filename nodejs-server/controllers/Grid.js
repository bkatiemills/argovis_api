'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');
var helpers = require('../helpers/helpers')

module.exports.findgrid = function findgrid (req, res, next, id, startDate, endDate, polygon, multipolygon, center, radius, compression, mostrecent, data, presRange, gridName) {
  Grid.findgrid(res,gridName, id, startDate, endDate, polygon, multipolygon, center, radius, compression, mostrecent, data, presRange)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findgridMeta = function findgridMeta (req, res, next, id) {
  Grid.findgridMeta(res,id)
    .then(pipefittings => helpers.data_pipeline.bind(null, res)(pipefittings),
    function (response) {
      utils.writeJson(res, response, response.code);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.gridVocab = function gridVocab (req, res, next) {
  Grid.gridVocab()
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
