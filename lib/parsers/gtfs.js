var ProtoBuf = require('protobufjs');
var path = require('path');

// thanks to https://gist.github.com/paul91/d2aa0428bf3cf20ce094
module.exports = function (res) {
  // Initialize from .proto file
  // Requires nyct-subway.proto and gtfs-realtime.proto
  var file = path.resolve(__dirname + '/../data/proto/nyct-subway.proto');

  var transit = ProtoBuf.loadProtoFile(file);
  var builder = transit.build('transit_realtime');

  return new Promise(function (resolve, reject) {
    var data = [];

    res.body.on('data', function (chunk) {
      data.push(chunk);
    });

    res.body.on('error', function (error) {
      reject(error);
    });

    res.body.on('end', function () {
      var decodedData;
      data = Buffer.concat(data);

      if (data.length < 1) {
        return reject(new Error('Empty response.'));
      }

      // added this to handle random malformed responses from API
      try {
        decodedData = builder.FeedMessage.decode(data);
      } catch (error) {
        console.log(error);
        reject(error);
      }

      resolve(decodedData);
    });
  });
};
