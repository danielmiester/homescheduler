var util = require("util")
function DB(cb){
    var that = this;
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