var log = require("npmlog");
var util = require('util');
function DB(cb){
	this.mongo = require('mongodb');
    this.mongoose = require('mongoose');
    var db = this.mongoose.connect(
        util.format("mongodb://%s:%s@%s:%s/%s",
            process.env.npm_package_config_mongoUser,
            process.env.npm_package_config_mongoPass,
            process.env.npm_package_config_mongoHost,
            process.env.npm_package_config_mongoPort,
            process.env.npm_package_config_mongoDbName)
        ).connection;
    db.on("error",function(){
        log.error("db.js","mongo Connection error:",arguments)
        log.error("db.js","please ensure DB is functional: mongod --dbpath data/ --fork --logpath logs/mongo.log")
        cb.apply(this,arguments);
        process.exit();
    });
        this.User = require("./models/user");
        this.Chore = require("./models/chore");
    db.once("open",function(){
        log.info("db.js","db connection open");
        this.db = db;
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