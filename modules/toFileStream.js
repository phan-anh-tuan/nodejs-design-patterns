'use strict';

const Fs = require('fs');
const Stream = require('stream');
const Path = require('path');
const Mkdirp = require('mkdirp');

class ToFileStream extends Stream.Writable {
    constructor(options) {
        super(options);
    }

    _write(chunk, encoding, callback) {
        let filepath = Path.join(__dirname,'../files',chunk.filename);
        Mkdirp(Path.dirname(filepath), (err) => {
            if (err) { return callback(err);}
            Fs.writeFile(filepath,chunk.data, callback);
        })
    }
}

module.exports = ToFileStream;