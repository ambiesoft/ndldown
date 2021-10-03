const getDownRanges = (endIndex) => {
    let rets = []
    let delta = 0;
    while(true) {
        let start = 1 + delta;
        let end = start + 50 - 1;
        if(endIndex <= end) {
            rets.push([start])
            return rets
        } else {
            rets.push([start,end])
        }

        delta += 50;
    }
}

exports.getDownRanges = getDownRanges;
