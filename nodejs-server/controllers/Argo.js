'use strict';

var utils = require('../utils/writer.js');
var Argo = require('../service/ArgoService');

module.exports.argoBGC = function argoBGC (req, res, next) {
  Argo.argoBGC()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoDACs = function argoDACs (req, res, next) {
  Argo.argoDACs()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoOverview = function argoOverview (req, res, next) {
  Argo.argoOverview()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.argoVocab = function argoVocab (req, res, next, parameter) {
  Argo.argoVocab(parameter)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgo = function findArgo (req, res, next, id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, mostrecent, data, presRange, verticalRange, batchmeta, page) {
  Argo.findArgo(id, startDate, endDate, polygon, box, center, radius, metadata, platform, platform_type, positionqc, source, compression, mostrecent, data, presRange, verticalRange, batchmeta, page)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.findArgometa = function findArgometa (req, res, next, id, platform, page) {
  Argo.findArgometa(id, platform, page)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
