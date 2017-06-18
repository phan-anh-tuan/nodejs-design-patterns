'use strict';

const EventEmitter = require('events').EventEmitter;
const Fs = require('fs');

class FindPattern extends EventEmitter {
    constructor(regex) {
        super();
        this.regex = regex;
        this.files = [];
    }

    addFile(file) {
        this.files.push(file);
        return this;
    }

    find() {
        //var _self = this;
        this.files.forEach((file) => {
                                Fs.readFile(file, 'utf-8', (err,data) => {
                                        //console.log(this.regex);
                                        if (err) { return this.emit('error', err, file);}
                                        this.emit('fileread', file);
                                        let matches;
                                        if (matches = data.match(this.regex)){
                                            matches.forEach((match) => {
                                                this.emit('match',file,match);
                                            })
                                        }
                                });
        });    
        return this;
    }
}
/*
function findPattern(files, regex) {
    let emitter = new EventEmitter();
    files.forEach(function(file) {
        Fs.readFile(file, 'utf-8', (err,data) => {
            if (err) { return emitter.emit('error', err, file);}
            emitter.emit('fileread', file);
            let matches;
            if (matches = data.match(regex)){
                matches.forEach(function(match) {
                    emitter.emit('match',file,match);
                })
            }
        })
    });
    return emitter;
}

findPattern(['./files/fileA.txt', './files/fileB.json'],/hello \w* /g).on('fileread', (file) => console.log(`fileread ${file}`))
                .on('match', (file,match) => console.log(`matched ${match} in file ${file}`))
                .on('error', (err,file) => console.log(`error ${err.message} in reading file ${file}`));
*/
var obj = new FindPattern(/hello \w*/g);
obj.addFile('./files/fileA.txt')
    .addFile('./files/fileB.json')
    .on('fileread', (file) => console.log(`fileread ${file}`))
    .on('match', (file,match) => console.log(`matched ${match} in file ${file}`))
    .on('error', (err,file) => console.log(`error ${err.message} in reading file ${file}`))
    .find();
