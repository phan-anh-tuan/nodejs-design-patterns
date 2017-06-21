'use strict';

const Request = require('request');
const Mkdirp = require('mkdirp');
const Url = require('url');
const UrlParse = Url.parse;
const UrlResolve = Url.resolve;
const Slug = require('slug');
const Fs = require('fs');
const Utility = require('./utilities.js');
const FsReadFile = Utility.promisify(Fs.readFile);
const Path = require('path');
const Cheerio = require('cheerio');
const Async = require('async');
const BASE_FOLDER = Path.join(__dirname,'./files/');


// uri = http://www.example.com/segment
// uri = http://www.example.com/segment/index.html
// uri = http://www.example.com/segment/
// this function did not support query string
function resolve(uri) {
    return new Promise((resolve,reject) => {
        try {
            const parsedUrl = Url.parse(uri);
            let filepath = parsedUrl.pathname.split('/')
                                            .filter(function(component) { return !!component} )
                                            .map(function(element){
                                                return Slug(element);
                                            })
                                            .join('/');
            let filename = Path.join(BASE_FOLDER,parsedUrl.hostname,filepath);
            if (!Path.extname(filename).match(/html/)) {
                filename += '.html';
            }
            return resolve(filename);
        } catch (err) {
            reject(err);
        }
    });
}

function isFileExisted(filepath,callback) {
    //callback = (err,boolean)
    Mkdirp(filepath.substr(0,filepath.lastIndexOf('/')), (err) => {
        if (err) {
            return callback(err);
        }
        Fs.access(filepath, Fs.constants.F_OK, (error) => {
            if (error && error.code === 'ENOENT') {
                callback(null,false);
            } else {
                callback(null,true);
            }
        })
    })
}

function downloadFile(uri,filepath,callback) {
    // callback = (err)
    // overwrite if filepath existed
    if (processed_urls.has(uri)) { return process.nextTick(callback,null,false); }
    processed_urls.set(uri,true);
    
    Async.waterfall([
        (cb) => {
            Request(uri, (error, response, body) => {
                if (error) { return cb(error);}
                cb(null,body);
            });
        },
        (content,cb) => {
            Fs.writeFile(filepath,content,(_err) => {
                if (_err) { return cb(_err);}
                cb(null);
            })
        }
       ], (err) => {
            if (err) { return callback(err);}
            console.log(`downloaded ${uri}`);
            callback(null,true);
       });
}

function getPageLinks(currentUrl,content) {
    return new Promise((resolve,reject) => {
        try {
            let $ = Cheerio.load(content)('a');
            let links = [].slice.call(Cheerio.load(content)('a'))
                                .map(function(element) {
                                        const link = UrlResolve(currentUrl, element.attribs.href || "");
                                        const parsedlink = UrlParse(link);
                                        const parsedCurrentUrl = UrlParse(currentUrl);
                                        if (parsedlink.hostname !== parsedCurrentUrl.hostname || !parsedlink.pathname) {
                                            return null;
                                        }
                                        return link;
                                })
                                .filter(function(ele) { return !!ele});
            resolve(links);
        } catch (err) {
            reject(err);
        }
    });

}
function spiderLink(uri,filepath,nesting,callback) {
    if (nesting == 0) { return process.nextTick(callback,null); }
    
    FsReadFile(filepath)
        .then((body) => { return getPageLinks(uri,body);})
        .then((links) => {
                            Async.eachSeries(links, 
                                             (link,cb)=>{
                                                          downloadQueue.push({uri:link, nesting: nesting-1}, (err) => {});
                                                          cb();
                                                        },
                                             callback);
                            })
        .catch((err) => callback(err));
    /*
    Fs.readFile(filepath, (err,body) => {
        getPageLinks(uri,body)
                            .then( (links) => {
                                    Async.eachSeries(links, 
                                                     (link,cb)=>{
                                                                    downloadQueue.push({uri:link, nesting: nesting-1}, (err) => {});
                                                                    cb();
                                                                },
                                                     callback);
                            })
                            .catch((err) => callback(err));
    })*/
}

function execute(task,callback) {
    let uri = task.uri;
    let nesting = task.nesting;
    resolve(uri)
        .then((filepath) => {
                                isFileExisted(filepath, (err,existed) => {
                                    if (err) { return callback(err);}
                                    if (!existed) {
                                        
                                        downloadFile(uri,filepath,(err,downloaded) => {
                                            if (err) { return callback(err); }
                                            if (downloaded) {
                                                spiderLink(uri,filepath,nesting,callback);
                                            } else { // file was downloaded previously
                                                callback(null);
                                            }
                                        })
                                    } else {
                                        spiderLink(uri,filepath,nesting,callback);
                                    }
                                });
                            })
        .catch((error) => {
                                console.log(error.message);
                            });
}

if (process.argv.length < 4) {
    console.log('usage node appjs uri nesting');
    process.exit(1);
}

const MAX_DOWNLOADER = 10;
let running = 0;
const downloadQueue = Async.queue(execute,MAX_DOWNLOADER);
let processed_urls = new Map();

downloadQueue.push({ uri: process.argv[2], nesting: process.argv[3]}, (err) => {});