'use strict';

const Stream = require('stream');

class ReplaceStream extends Stream.Transform {
    constructor(searchString, replaceString) {
        super();
        this.searchString = searchString;
        this.replaceString = replaceString;
        this.tailPiece = '';
    }

    _transform(chunk, encoding, cb) {
        let pieces = (this.tailPiece + chunk).split(this.searchString);
        let tailPieceLength = this.searchString - 1;
        this.tailPiece = pieces[pieces.length - 1].slice(-tailPieceLength);
        pieces[pieces.length - 1] = pieces[pieces.length - 1].slice(0,-tailPieceLength);
        this.push(pieces.join(this.replaceString));
        cb();
    }

    _flush(cb) {
        this.push(this.tailPiece);
        cb();
    }
}

module.exports = ReplaceStream;