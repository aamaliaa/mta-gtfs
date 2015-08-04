var _ = require('underscore');
var request = require('superagent');
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

  request(url)
  .parse(parsers.serviceXml)
  .end(function (err, res) {
    if (err) {
      callback(err);
      return;
    }

    if (service) {
      callback(null, res.body[service]);
    } else {
      callback(null, res.body);
    }
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
  request(feedUrl)
  .parse(parsers.gtfs)
  .buffer()
  .end(function (err, res) {
    if (err || !res.body.entity || !Array.isArray(res.body.entity)) {
      callback(err || new Error('malformed MTA response'));
      return;
    }

    msg = res.body;
    msg.entity.map(function (t) {
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
        updatedOn: msg.header.timestamp.low
      } : {});
  });
};
