var should = require('should');
var config = require('./config');
var Mta = require('../lib/mta');

describe('MTA', function () {
  var mta,
    serviceType,
    stopId,
    stopIds;

  before(function (done) {
    mta = new Mta({
      key: config.key
    });
    stopId = 635;
    stopIds = [635, 636, 637];
    serviceType = 'subway';
    done();
  });

  it('should return info for all MTA subway stops', function () {
    return mta.stop()
    .then(function (result) {
      result.should.be.an.Object;
    });
  });

  it('should get info for 1 MTA subway stop', function () {
    return mta.stop(stopId)
    .then(function (result) {
      result.stop_id.should.equal(stopId.toString());
      result.should.have.property('stop_name');
    });
  });

  it('should get info for S30S', function() {
    return mta.stop('S30S')
    .then(function (result) {
      result.stop_id.should.equal('S30S');
      result.should.have.property('stop_name');
    });
  });

  it('should get info for multiple MTA subway stop', function () {
    return mta.stop(stopIds)
    .then(function (result) {
      stopIds.forEach(function (val) {
        result.should.have.property(val);
      });
    });
  });

  it('should get MTA service status for all types', function () {
    return mta.status()
    .then(function (result) {
      result.should.have.property('subway');
      result.should.have.property('bus');
      result.should.have.property('BT');
      result.should.have.property('LIRR');
      result.should.have.property('MetroNorth');
    });
  });

  it('should get MTA service status for 1 type', function () {
    return mta.status(serviceType)
    .then(function (result) {
      result.should.be.an.Array;
    });
  });

  it('api key is set in test/config.js', function (done) {
    config.key.should.not.equal('your-api-key');
    done();
  });

  it('should get schedule info for 1 MTA subway station', function () {
    return mta.schedule(stopId)
    .then(function (result) {
      result.should.have.property('schedule');
      result.should.have.property('updatedOn');
      result.schedule[stopId].should.exist;
    });
  });

  it('should get schedule info for multiple MTA subway stations', function () {
    return mta.schedule(stopIds)
    .then(function (result) {
      result.should.have.property('schedule');
      result.should.have.property('updatedOn');
      stopIds.forEach(function (val) {
        result.schedule.should.have.property(val);
      });
    });
  });

});
