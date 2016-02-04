var _ = require('underscore');
var parseString = require('xml2js').parseString;

function parseXML (xml) {
  return new Promise(function (resolve, reject) {
    parseString(xml, function (err, res) {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

function clean (val) {
  return val.map(function (v) {
    return _.mapObject(v, function (val) {
      if (_.isArray(val) && val.length === 1) {
        return val[0];
      } else {
        return val;
      }
    });
  });
}

module.exports = function (res) {
  return res.text()
  .then(parseXML)
  .then(function(data) {
    data = _.pick(data.service, ['subway', 'bus', 'BT', 'LIRR', 'MetroNorth']);
    data = _.mapObject(data, function (val) {
      return clean(val[0].line);
    });
    return data;
  });
};
