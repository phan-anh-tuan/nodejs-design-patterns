'use strict';
const MySchema = require('./schema.js');

function MyDB() {
    let _collections = new Map();
    let connection;

    this.connect = function(uri) {
        //connect to db
        connection = uri;
    }
    
    this.createSchema = function(schema) {
        return MySchema(schema);
    }

    this.addModel = function (name,schema) {
       _collections.set(schema,name);
    }

    this.getCollection = function(schema) {
        if (_collections.has(schema)) {
            return _collections.get(schema);
        }
        return null;
    }
};

(function(){
    
    
    this.update = function(obj) {
        let collection = this.getCollection(obj.constructor);
        console.log(`update an existing record in collection ${collection} with value ${JSON.stringify(obj)}`);
    };
    
    this.delete = function(obj) {
        let collection = this.getCollection(obj.constructor);
        console.log(`delete an existing record in collection ${collection} with id ${JSON.stringify(obj._id)}`);
    };
    this.create = function(obj){
        let collection = this.getCollection(obj.constructor);
        console.log(`create new record in collection ${collection} with value ${JSON.stringify(obj)}`);
        obj._id = 'faked id';
    };
}).call(MyDB.prototype);

module.exports = MyDB;