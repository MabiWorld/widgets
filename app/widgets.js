require('reflect-metadata');

const angular = require('angular')
require('./mss/serverStat.module.js');

angular.module('widgets', ['serverStat']);