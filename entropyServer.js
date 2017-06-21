'use strict';

const Http = require('http');
const Chance = require('chance');

let chance = new Chance();
const server = Http.createServer((request, response) => {
    response.writeHead(200,'Content-Type: text/plain');
    function generateMore() {
        //console.log(`start sending data`);
        while(chance.bool({likelihood: 95})) {
            let shouldContinue = response.write(`${chance.string({length: (16*1024) - 1})}\n`);
            if (!shouldContinue) {
                console.log('Backpressure');
                return response.once('drain', generateMore)
            }
        }
        response.end(`\nThe end\n`);
    }
    generateMore();
    response.on('finish', () => { console.log(`all data was sent`)})
});

server.listen(3000,() => { console.log(`server is listening on localhost:3000`)});