'use strict';

const RandomStream = require('./modules/randomStream.js');

let randomstream = new RandomStream();

randomstream.setEncoding('utf8')
            .on('readable', ()=>{
                    let chunk;
                    while( (chunk = randomstream.read()) !== null) {
                        console.log(`Read: ${chunk}`);
                    }
                })
            .on('end', () => { console.log('End of stream')})