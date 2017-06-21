'use strict';

const Http = require('http');
const Fs = require('fs');
const Gzip = require('zlib');
const Path = require('path');
const Crypto = require('crypto');

let file = Path.join(__dirname,'../',process.argv[2]);
let server = process.argv[3];

let options = {
    hostname: server || 'localhost',
    port: 3000,
    path: '/',
    method: 'PUT',
    headers: {
        filename: Path.basename(file),
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'gzip'
    }
}
let request = Http.request(options, (response) => {
    console.log(`Server response: ${response.statusCode}`);
})

Fs.createReadStream(file)
    .pipe(Gzip.createGzip())
    .pipe(Crypto.createCipher('aes192','my first secured transport'))
    .pipe(request)
    .on('finish',() => { console.log(`File successfully sent`)});