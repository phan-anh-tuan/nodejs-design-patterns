'use strict';

const Request = require('request');
const Mkdirp = require('mkdirp');
const Url = require('url');
const UrlParse = Url.parse;
const UrlResolve = Url.resolve;
const Slug = require('slug');
const Fs = require('fs');
const Path = require('path');
const Cheerio = require('cheerio');
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
    Request(uri, (error, response, body) => {
            if (error) { return callback(error); }
            if (response.statusCode == 200) {
                Fs.writeFile(filepath,body,(_err) => {
                    if (_err) { return callback(_err); }
                    console.log(`downloaded ${uri}`);
                    callback(null);
                });
            }
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
    Fs.readFile(filepath, (err,body) => {
        getPageLinks(uri,body)
                            .then( (links) => {
                                    links.forEach((link) => {
                                        tasks.push({uri:link, nesting: nesting-1});
                                    }) ;
                                    return callback(null);
                            })
                            .catch((err) => callback(err));
    })
}

function execute(uri,nesting,callback) {
    resolve(uri)
        .then((filepath) => {
                                isFileExisted(filepath, (err,existed) => {
                                    if (err) { console.log(err.message); process.exit(1);}
                                    if (!existed) {
                                        
                                        downloadFile(uri,filepath,(err) => {
                                            if (err) {
                                                return callback(err);
                                            }
                                            spiderLink(uri,filepath,nesting,callback);
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

const MAX_DOWNLOADER = 1;
let running = 0;
let tasks = [];

function next() {
    while (running < MAX_DOWNLOADER && tasks.length > 0) {    
        let task = tasks.shift();
        execute(task.uri, task.nesting, (err) => {
                                                    running--;
                                                    next();
                                                 });   
        running++;
        console.log(`running ${running} ${task.uri} ${task.nesting}`);
        next();
    }
}    
tasks.push({ uri: process.argv[2],
            nesting: process.argv[3]});
next();