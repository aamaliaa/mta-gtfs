var _ = require('underscore');
var fetch = require('node-fetch');
var path = require('path');
var fs = require('fs');
var qs = require('querystring');
var csvParse = require('csv-parse');
var parsers = require('./parsers');
var utils = require('./utils');

/**
 * Mta constructor
 * @param {Object} options
 */
var Mta = module.exports = function (options) {

  this.urls = {
    gtfs: 'http://datamine.mta.info/mta_esi.php?',
    status: 'http://web.mta.info/status/serviceStatus.txt'
  };

  this.options = options || {};

  _.extend({
    feed_id: 0
  }, this.options);

  if (this.options.key === 'your-api-key') {
    this.options.key = null;
  }

};

/**
 * Gets MTA subway stop info
 * @param  {String}   stopId
 * @param  {Function} callback
 * @return {Object}
 */
Mta.prototype.stop = function (stopId, callback) {
  var file = fs.readFileSync(path.join(__dirname, '/data/gtfs/stops.txt'));

  if (typeof stopId === 'function') {
    callback = stopId;
    stopId = null;
  }

  csvParse(file, {
    columns: true,
    objname: 'stop_id'
  }, function (err, data) {
    if (err) {
      callback(err);
    }

    if (_.isNumber(stopId)) {
      data = data[stopId];
    } else if (_.isArray(stopId)) {
      data = _.pick(data, stopId);
    }

    callback(null, data);
  });

};

/**
 * Gets MTA service status
 * @param  {String}         service   optional ('subway', 'bus', 'BT', 'LIRR', 'MetroNorth')
 * @param  {Function}       callback
 * @return {Array|Object}   status
 */
Mta.prototype.status = function (service, callback) {

  var url = this.urls.status;

  if (typeof service === 'function') {
    callback = service;
    service = null;
  }

  fetch(url)
  .then(parsers.serviceXml)
  .then(function(res) {
    if (service) {
      callback(null, res[service]);
    } else {
      callback(null, res);
    }
  })
  .catch(function(err) {
    callback(err);
  });

};

/**
 * Gets MTA schedule status
 * @param  {String|Array}   stopId
 * @param  {Function}       callback
 * @return {Object}         schedule
 */
Mta.prototype.schedule = function (stopId, callback) {

  var schedule = {};
  var results = false;
  var stopIds;
  var feedUrl = this.urls.gtfs + qs.stringify(_.pick(this.options, [ 'feed_id', 'key' ]));
  var msg, direction, obj;

  if (!this.options.key) {
    callback(new Error('schedule method requires MTA API key'));
  }

  // TODO remove this requirement
  if (!stopId || typeof stopId === 'function') {
    callback(new Error('stop id(s) are required'));
  }

  stopIds = _.isArray(stopId) ? stopId : [ stopId ];

  _.each(stopIds, function (stop) {
    schedule[stop] = { N: [], S: [] };
  });

  // get binary feed
  fetch(feedUrl)
  .then(parsers.gtfs)
  .then(function(data) {
    if (!data.entity || !Array.isArray(data.entity)) {
      callback(err || new Error('malformed MTA response'));
      return;
    }

    data.entity.map(function (t) {
      if (_.isEmpty(t.trip_update)) {
        return;
      }

      t.trip_update.stop_time_update.map(function (s) {
        _.each(stopIds, function (stop) {
          if (s.stop_id.indexOf(stop) > -1) {
            direction = s.stop_id.replace(stop, '');
            obj = utils.parseObj(t.trip_update.trip, s);
            if (_.isNull(obj.arrival)) {
              return;
            }
            utils.binaryInsert('arrivalTime', obj, schedule[stop][direction]);
            results = true;
          }
        });
      });
    });

    callback(null, results ? {
        schedule: schedule,
        updatedOn: data.header.timestamp.low
      } : {});
  })
  .catch(function(err) {
    callback(err);
  });
};
