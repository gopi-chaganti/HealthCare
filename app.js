var express = require('express');
var app = express();
var fs        = require('fs');
var parseString = require('xml2js').parseString;

var bodyParser = require('body-parser');
var multer  = require('multer');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest:'./uploads/'}).array('file'));

// ---mongo client---
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/test';



app.get('/index.html', function (req, res) {
    console.log("Got a GET request");
    res.sendFile(__dirname + "/index.html" );
})

app.get('/api/patients', function (req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findRestaurants(db, function(data) {
            db.close();
            res.send(data);
        });
    });
});

app.post('/file_upload', function (req, res) {

    for(var i=0; i<req.files.length; i++){
        console.log(req.files[i].filename);
        console.log(req.files[i].path);
        console.log(req.files[i].filetype);

        fs.readFile( req.files[i].path, function (err, data) {

            var jsonDoc;
            parseString(data, function (err, result) {
                console.dir(JSON.stringify(result));
                jsonDoc = result;
            });

            //var json = parser.toJson(filedata);
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                insertDocument(db, jsonDoc, function() {
                    db.close();
                });
            });
        });
    }
    res.redirect('/index.html');
});


var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})


var insertDocument = function(db, data, callback) {
    db.collection('patients').insertOne( data, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the patients collection.");
        callback(result);
    });
};

var findDocuments = function(db, callback) {
    var cursor =db.collection('patients').find( );
    var docs = []
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            docs.push(doc)
        } else {
            callback(docs);
        }
    });
};