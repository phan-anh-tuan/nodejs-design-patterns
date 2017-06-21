'use strict';

const Http = require('http');
const Gzip = require('zlib');
const Fs = require('fs');
const Path = require('path');
const Crypto = require('crypto');

let server = Http.createServer((request,response) => {
    let filename = request.headers.filename;
    let filepath = Path.join(__dirname,'../files',filename);
    request.pipe(Crypto.createDecipher('aes192','my first secured transport'))
            .pipe(Gzip.createGunzip())
            .pipe(Fs.createWriteStream(filepath))
            .on('error',(err) => {console.log(err)})
            .on('finish',() =>{
        response.writeHead(200,'Content-Type: text/plain');
        response.end('That\'s it');
        console.log(`File saved at ${filepath}`);
    })
}).listen(3000,() => {console.log(`Server is listening on ${JSON.stringify(server.address())}`)});