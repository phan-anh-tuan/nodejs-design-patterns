'use strict';
let fn = function MySchema(schema) {
    let _schema = schema;
    return  function() { Object.assign(this,_schema)}
};
module.exports = fn;

