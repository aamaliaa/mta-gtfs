var _ = require('underscore');
var parseString = require('xml2js').parseString;

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

module.exports = function (res, done) {
  res.text = '';

  res.on('data', function (chunk) {
    res.text += chunk;
  });

  res.on('end', function () {
    parseString(res.text, function (err, data) {
      if (err) {
        throw new Error(err);
      }
      
      data = _.pick(data.service, ['subway', 'bus', 'BT', 'LIRR', 'MetroNorth']);
      data = _.mapObject(data, function (val) {
        return clean(val[0].line);
      });
      
      done(null, data);
    });
  });
  
};
