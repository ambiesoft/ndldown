const ndlfunc = require('./ndlfunc')

let v = 100
console.info(v, ndlfunc.getDownRanges(v))

v = 101
console.info(v, ndlfunc.getDownRanges(v))


let ranges = ndlfunc.getDownRanges(269);
ranges.forEach(range => {
    console.log(range);
    let srange = range[0] + '-' + (range.length >= 2 ? range[1] : '');
    console.log(srange);
});