'use strict';

process.stdin.setEncoding('utf8')
            .on('data', (chunk) =>{
    console.log('data is available for reading');
    console.log(`chunk read: "${chunk}"`);
    /*let chunk;
    while((chunk = process.stdin.read()) !== null) {
        console.log(`chunk read: "${chunk}"`);
    }*/
})
.on('end',()=>{
    process.stdout.write(`End of stream\n`);
});