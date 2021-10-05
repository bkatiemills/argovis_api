'use strict';

var utils = require('../utils/writer.js');
var Platforms = require('../service/PlatformsService');

module.exports.platformList = function platformList (req, res, next) {
  Platforms.platformList()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.platformMetaList = function platformMetaList (req, res, next) {
  Platforms.platformMetaList()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
