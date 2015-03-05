module.exports = {
  
  binaryInsert: function (sortBy, obj, array, start, end) {
    var length = array.length;
    var start = typeof start === 'undefined' ? 0 : start;
    var end = typeof end === 'undefined' ? length - 1 : end;
    var m = start + Math.floor((end - start) / 2);
    var val = obj[sortBy];
    
    if (length === 0) {
      array.push(obj);
      return;
    }
    
    if (val > array[end][sortBy]) {
      array.splice(end + 1, 0, obj);
      return;
    }
    
    if (val < array[start][sortBy]) {
      array.splice(start, 0, obj);
      return;
    }
    
    if (start >= end) {
      return;
    }
    
    if (val < array[m][sortBy]) {
      this.binaryInsert(sortBy, obj, array, start, m - 1);
      return;
    }
    
    if (val > array[m][sortBy]) {
      this.binaryInsert(sortBy, obj, array, m + 1, end);
      return;
    }
    
    // no dupes
  },
  
  parseObj: function (t, s) {
    return {
      routeId: t.route_id,
      delay: (!s.arrival) ? null : s.arrival.delay,
      arrivalTime: (!s.arrival) ? null : s.arrival.time.low,
      departureTime: (!s.departure) ? null : s.departure.time.low
    };
  }

};
