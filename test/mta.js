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
  
  it('should return info for all MTA subway stops', function (done) {
    mta.stop(function (err, result) {
      should.not.exist(err);
      result.should.be.an.Object;
      done();
    });
  });
  
  it('should get info for 1 MTA subway stop', function (done) {    
    mta.stop(stopId, function (err, result) {
      should.not.exist(err);
      result.stop_id.should.equal(stopId.toString());
      result.should.have.property('stop_name');
      done();
    });
  });
  
  it('should get info for multiple MTA subway stop', function (done) {
    mta.stop(stopIds, function (err, result) {
      should.not.exist(err);
      stopIds.forEach(function (val) {
        result.should.have.property(val);
      });
      done();
    });
  });
  
  it('should get MTA service status for all types', function (done) {
    mta.status(function (err, result) {
      should.not.exist(err);
      result.should.have.property('subway');
      result.should.have.property('bus');
      result.should.have.property('BT');
      result.should.have.property('LIRR');
      result.should.have.property('MetroNorth');
      done();
    });
  });
  
  it('should get MTA service status for 1 type', function (done) {
    mta.status(serviceType, function (err, result) {
      should.not.exist(err);
      result.should.be.an.Array;
      done();
    });
  });
  
  it('api key is set in test/config.js', function (done) {
    config.key.should.not.equal('your-api-key');
    done();
  });
  
  it('should get schedule info for 1 MTA subway station', function (done) {
    mta.schedule(stopId, function(err, result) {
      should.not.exist(err);
      result.should.have.property('schedule');
      result.should.have.property('updatedOn');
      result.schedule[stopId].should.exist;
      done();
    });
  });
  
  it('should get schedule info for multiple MTA subway stations', function (done) {
    mta.schedule(stopIds, function (err, result) {
      should.not.exist(err);
      result.should.have.property('schedule');
      result.should.have.property('updatedOn');
      stopIds.forEach(function (val) {
        result.schedule.should.have.property(val);
      });
      done();
    });
  });
    
});
