var ProtoBuf = require('protobufjs');

// thanks to https://gist.github.com/paul91/d2aa0428bf3cf20ce094
module.exports = function (res, done) {
  var data = [];

  // Initialize from .proto file
  // Requires nyct-subway.proto and gtfs-realtime.proto
  var transit = ProtoBuf.loadProtoFile('./lib/data/proto/nyct-subway.proto');
  var builder = transit.build('transit_realtime');

  res.on('data', function (chunk) {
    data.push(chunk);
  });

  res.on('end', function () {
    data = Buffer.concat(data);
    done(null, builder.FeedMessage.decode(data));
  });
};
