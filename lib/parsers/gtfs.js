var ProtoBuf = require('protobufjs');
var path = require('path');

// thanks to https://gist.github.com/paul91/d2aa0428bf3cf20ce094
module.exports = function (res, done) {
  var data = [];

  // Initialize from .proto file
  // Requires nyct-subway.proto and gtfs-realtime.proto
  var file = path.resolve(__dirname + '/../data/proto/nyct-subway.proto');

  var transit = ProtoBuf.loadProtoFile(file);
  var builder = transit.build('transit_realtime');

  res.on('data', function (chunk) {
    data.push(chunk);
  });

  res.on('error', function (error) {
    return done(error);
  });

  res.on('end', function () {
    var decodedData;
    data = Buffer.concat(data);

    if (data.length < 1) {
      return done(null, data);
    }

    // added this to handle random malformed responses from API
    try {
      decodedData = builder.FeedMessage.decode(data);
    } catch (error) {
      console.log(error);
      return done(error);
    }

    return done(null, decodedData);
  });
};
