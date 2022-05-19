'use strict';

var utils = require('../utils/writer.js');
var Grid = require('../service/GridService');

module.exports.gridVocab = function gridVocab (req, res, next, parameter) {
  Grid.gridVocab(parameter)
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

module.exports.gridselect = function gridselect (req, res, next, gridName, presRange, polygon, multipolygon, startDate, endDate) {
  Grid.gridselect(gridName, presRange, polygon, multipolygon, startDate, endDate)
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
