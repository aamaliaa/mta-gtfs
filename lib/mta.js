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
    feed_id: 1,
  }, this.options);

  if (this.options.key === 'your-api-key') {
    this.options.key = null;
  }

};

/**
 * Gets MTA subway stop info
 * @param  {String} stopId
 * @return {Object}
 */
Mta.prototype.stop = function (stopId) {
  var file = fs.readFileSync(path.join(__dirname, '/data/gtfs/stops.txt'));

  return new Promise(function (resolve, reject) {
    csvParse(file, {
      columns: true,
      objname: 'stop_id'
    }, function (err, data) {
      if (err) {
        return reject(err);
      }

      if (_.isNumber(stopId) || _.isString(stopId)) {
        data = data[stopId];
      } else if (_.isArray(stopId)) {
        data = _.pick(data, stopId);
      } else if (!_.isEmpty(stopId)){
        return reject(new Error('Invalid stop id(s).'))
      }

      return resolve(data);
    });
  });

};

/**
 * Gets MTA service status
 * @param  {String}       service   optional ('subway', 'bus', 'BT', 'LIRR', 'MetroNorth')
 * @return {Array|Object} status
 */
Mta.prototype.status = function (service) {

  var url = this.urls.status;

  return fetch(url)
  .then(parsers.serviceXml)
  .then(function(res) {
    if (service) {
      return res[service];
    }
    return res;
  });

};

/**
 * Gets MTA schedule status
 * @param  {String|Array} stopId
 * @param  {String}       feedId    optional
 * @return {Object}       schedule
 */
Mta.prototype.schedule = function (stopId, feedId) {

  var schedule = {};
  var results = false;
  var stopIds;
  var direction, obj;
  var options = _.pick(this.options, [ 'feed_id', 'key' ]);

  if (feedId) {
    options.feed_id = feedId;
  }

  var feedUrl = this.urls.gtfs + qs.stringify(options);

  if (!this.options.key) {
    throw new Error('schedule method requires MTA API key');
  }

  // TODO remove this requirement
  if (!stopId || typeof stopId === 'function') {
    throw new Error('stop id(s) are required');
  }

  if (_.isArray(stopId)) {
    stopIds = stopId;
  } else if (_.isNumber(stopId) || _.isString(stopId)) {
    stopIds = [ stopId ];
  } else {
    throw new Error('invalid stop id(s)');
  }

  _.each(stopIds, function (stop) {
    schedule[stop] = { N: [], S: [] };
  });

  // get binary feed
  return fetch(feedUrl)
  .then(parsers.gtfs)
  .then(function(data) {
    if (!data.entity || !Array.isArray(data.entity)) {
      throw (err || new Error('malformed MTA response'));
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

    return results ? {
        schedule: schedule,
        updatedOn: data.header.timestamp.low
      } : {};
  });

};
