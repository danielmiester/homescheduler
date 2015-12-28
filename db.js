var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'db.js'});
var util = require('util');
var config = require("config");
function DB(cb){
	this.mongo = require('mongodb');
    this.mongoose = require('mongoose');
    var db_url = "mongodb://";
    if(config.mongoUser){
        db_url += config.mongoUser;
        if(config.mongoPass){
            db_url += ":" + config.mongoPass;
        }
        db_url += "@"
    }
    db_url += config.mongoHost
    if(config.mongoPort){
        db_url += ":" + config.mongoPort;
    }
    db_url += "/" + config.mongoDbName;
    log.info("db.js","connecting to",db_url)
    var db = this.mongoose.connect(db_url).connection;
    db.on("error",function(){
        log.error("db.js","mongo Connection error:",arguments)
        log.error("db.js","please ensure DB is functional: mongod --dbpath data/ --fork --logpath logs/mongo.log");
        cb.apply(this,arguments);
        process.exit();
    });
    db.once("open",function(){
        log.info("db.js","db connection open");
        this.db = db;
        this.User = require("./models/user");
        this.Chore = require("./models/chore");
        cb(null,db);
    });
}
DB.prototype.getUsers=function(ids,cb){
    if(ids){
        if(ids instanceof String){
            ids = [ids];
        }
        this.User.find({
            '_id': { $in: ids}
        }).exec(cb);
    }else{
        cb("ids must be set");
    }
}
module.exports = DB;