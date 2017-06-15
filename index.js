'use strict';
const MySchema = require('./modules/schema.js');
const MyDB = require('./modules/mydb.js');

var db = new MyDB();
db.connect('mongodb://localhost:27017/mydb');

var User = db.createSchema({firstname: 'string', lastname: 'string'});
db.addModel('users', User);


var Book = db.createSchema({title: 'string',isbn: 'string'});
db.addModel('books', Book);


var person = new User();
person.firstname = 'Tuan';
person.lastname = 'Phan';
db.create(person);
db.update(person);
db.delete(person);


var book = new Book();
book.title = 'getting started with hapi';
book.isbn = '123-123-123-121';
db.create(book);
db.update(book);
db.delete(book);