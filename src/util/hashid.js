const Hashids = require('hashids/cjs');

const salt = 'cSCHDsB58NFdozdYP3wffXBswjUVFdK';
const idLength = 12;

const hashids = new Hashids(salt, idLength)


function encode(raw){
    return hashids.encode(raw);
}

function decode(raw){
    return hashids.decode(raw)[0];
}

module.exports = {
    encode,
    decode
}