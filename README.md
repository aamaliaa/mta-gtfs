# MTA

An NYC MTA API library

## Usage

```
var Mta = require('./');
var mta = new Mta({
  key: 'MY-MTA-API-KEY-HERE', // only needed for mta.schedule() method
  feed_id: 1                  // optional, default = 1
});
```
For feed information, see http://datamine.mta.info/list-of-feeds.

In order to use the MTA real-time APIs, you will need an MTA API key from here: http://datamine.mta.info/user/register.

### Get subway stop info

Get ids, name, and lat/long for all subway stops.

```Javascript
mta.stop(function (err, result) {

});
```

Get info for specific stop, given an id.

```Javascript
mta.stop(635, function (err, result) {

});
```
An array of ids may also be passed to this method.

The stop ids given here are used in `mta.schedule()`.

### Get MTA service status info

You can get ALL service types:

```Javascript
mta.status(function (err, result) {

});
```

Or, specify a specific service type (`subway`, `bus`, `BT`, `LIRR`, `MetroNorth`):

```Javascript
mta.status('subway', function (err, result) {
  
});
```

The API route this method hits is updated by the MTA every 60 seconds.

### Get real-time subway schedule data
Only available for the following routes: 1, 2, 3, 4, 5, 6, S, L, and Staten Island Railway (http://datamine.mta.info/list-of-feeds).

Given a single subway stop id (or an array of stop ids), it gives schedule data for both northbound and southbound trains.

```Javascript
mta.schedule(635, function (err, result) {
  
});
```

The API route this method hits is updated by the MTA every 30 seconds.

## Tests

Replace `'your-api-key'` in `test/config.js` with your own MTA API key then run:

```
npm test
```

## To do

* MTA Bus Time API (http://bustime.mta.info/wiki/Developers/Index)
* return static schedules for lines not included in real-time feeds
