'use strict';

const ToFileStream = require('./modules/toFileStream.js');

const tfs = new ToFileStream({objectMode: true});

tfs.write({filename: "file1.txt", data: "Hello"});
tfs.write({filename: "file2.txt", data: "Node.js"});
tfs.write({filename: "file3.txt", data: "Stream"});
tfs.end(() => { console.log(`all files were created`)})
