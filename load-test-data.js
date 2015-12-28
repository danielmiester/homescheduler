var util = require("util")
var config = require("./config.js")
function DB(cb){
    var that = this;
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
    console.log("loda-data","connecting to",db_url)
    var db = this.mongoose.connect(db_url).connection;
    db.on("error",function(){
        console.log("mongo Connection error:",arguments)
        cb.apply(this,arguments);
    });
    this.User = require("./models/user");
    this.Chore = require("./models/chore");
    console.log(this.Chore)
    db.once("open",function(a,b,c){
        var users = [
            {name:"Joe Bloe",email:"a@b.c",username:"joebloe","password.set":"1234"},
            {name:"J. Schmoe",email:"ab@b.c",username:"jschmoe","password.set":"1234"},
            {name:"Jane Bloke",email:"abc@b.c",username:"jbloke","password.set":"1234"},
            {name:"Daniel De Jager",email:"danielmiester@gmail.com","username":"dainichi","password.set":"1234"}];
        that.User.create(users)
        .then(function(users){
            console.log("created users",users)
            var chores = [{
                name: "Mow Lawn",
                schedule: "every 2w",
                notes: "don't forget to get gas",
                done: true,
                assigned_to:[users[0]._id,users[2]._id],
                value:2000},{
                name: "Empty Trash",
                schedule: "daily",
                notes: "",
                done: false,
                assigned_to:[users[3]._id,users[1]._id,users[2]._id],
                value:1}
                ];
            return that.Chore.create(chores);
        }).then(function(chores){
            console.log("created chores",chores)
            process.exit();
        });
    });
}
var d = new DB();