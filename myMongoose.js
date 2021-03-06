/**
 * Created by daniel.dejager on 12/15/15.
 */
var log = require('bunyan').createLogger({name: 'myMongoose.js'});

var mongo = require('mongodb');
var Promise = require('bluebird');
var mongoose = require("mongoose");
mongoose.Promise = Promise;

//var mongoose = Promise.promisifyAll(require("mongoose"));

function _generateMongoUrl() {
    var db_url = "mongodb://";
    if (config.mongoUser) {
        db_url += config.mongoUser;
        if (config.mongoPass) {
            db_url += ":" + config.mongoPass;
        }
        db_url += "@"
    }
    db_url += config.mongoHost
    if (config.mongoPort) {
        db_url += ":" + config.mongoPort;
    }
    db_url += "/" + config.mongoDbName;
    return db_url;
}
var myMongoose = function(){
    return new Promise(function(resolve,reject){
        var db_url = _generateMongoUrl();
        log.info("db.js", "connecting to", db_url)
        var db = mongoose.connect(db_url).connection;
        db.on("error", function () {
            log.error("db.js", "mongo Connection error:", arguments)
            log.error("db.js", "please ensure DB is functional: mongod --dbpath data/ --fork --logpath logs/mongo.log")
            reject.apply(this, arguments);
        });
        db.once("open", function () {
            log.info("db.js", "db connection open");
            this.db = db;
            //this.User = require("./models/user");
            this.Chore = require("./models/chore");
            resolve(this);
        });
    });
}

module.exports = myMongoose();