var mongoose = require("mongoose");
var crypto = require("crypto");
var util = require("util");
var randomstring = require("randomstring");
var winston = require("winston");
winston.loggers.add("user.js",{});
var log = winston.loggers.get("user.js");


function hashPassword(salt,password){
	log.debug("hashing",password,"with",salt)
	var shasum = crypto.createHash("sha512");
	shasum.update(salt+password);
	var d = shasum.digest("base64");
	log.debug("hash",d);
	return d;
}
var User = new mongoose.Schema({
		name: String,
		username:String,
		password:String,
		email:String,
		avatar:String,
		textEmail:String
	});
User.virtual("password.salt").get(function(){
	log.debug("getting %s's password salt",this.username);
	return this.password.split("$")[2];
});
User.virtual("password.hash").get(function(){
	log.debug("getting %s's password hash",this.username);
	return this.password.split("$")[3];
});
User.virtual("password.set").set(function(password){
	var salt = randomstring.generate(12);
	var pw = hashPassword(salt,password)
	this.password = util.format("$6$%s$%s",salt,pw)
});
User.statics.findUsersNamed = function(name,cb){
	return this.find({"name":new RegExp(name,"i")}).sort("name").limit(20).exec(cb);
}
User.statics.validateUser = function(username,password,cb){
	log.debug("Looking for user:%s",username);
	return this.findOne(
		{
			username:username
		},
		function(err,user){
			log.debug("DB Results, err:%s, user found:%s",err,!!user)
			if(user && !err){
				log.debug("found user",user.name)
				var inHash = hashPassword(user.get("password.salt"),password);
				var knownHash = user.get("password.hash");
				log.debug("Input:",inHash);
				log.debug("Known:",knownHash)
				if(knownHash === inHash){
					cb(null,user.toObject());
				}else{
					cb(null,false,{message:"Incorrect Password"});
				}
			}else if(!user && !err){
				log.info("user.js","user Not found")
				cb(null,null)
			}else{
				log.warn("user.js","db error");
				cb(err);
			}
		}
	);
}
module.exports = mongoose.model("User",User);