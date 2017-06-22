'use strict';

const ReplaceStream = require('./modules/replaceStream.js')

const rs = new ReplaceStream('World','Node.js');

rs.on('data', (chunk) => { console.log(chunk.toString())});



rs.write('Hello W');
rs.write('orld!');
rs.end();