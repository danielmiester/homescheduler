var log = require('bunyan').createLogger({name: 'user.js'});
var Promise = require('bluebird');
var mongoose = require("mongoose");
mongoose.Progress = Promise;

var crypto = require("crypto");
var util = require("util");
var randomstring = require("randomstring");

function hashPassword(salt,password){
	log.trace("hashing",password,"with",salt)
	var shasum = crypto.createHash("sha512");
	shasum.update(salt+password);
	var d = shasum.digest("base64");
	log.info("hash result",d);
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
	log.debug("setting ",this.username,"password",password);
	log.trace("password",password)
	var salt = randomstring.generate(12);
	log.info("Salt",salt)
	var pw = hashPassword(salt,password)
	log.info("hash",pw)
	this.password = util.format("$6$%s$%s",salt,pw)
});
User.statics.findUsersNamed = function(name){
	log.debug("Finding users named",name)
	return this.find({"name":new RegExp(name,"i")}).sort("name").limit(20).exec();
}
User.statics.validateUser = function(username,password){
	log.info("Looking for user:%s",username);
	var q = {username:username};
	return this
	.findOne(q)
	.exec()
	.then(function(user){
		log.info("DB Results, user found:%s",!!user)
		if(user){
			log.info("found user",user.name)
			var inHash = hashPassword(user.get("password.salt"),password);
			var knownHash = user.get("password.hash");
			log.info("Input:",inHash);
			log.info("Known:",knownHash)
			if(knownHash === inHash){
				return user.toObject();
			}else{
				return false;
			}
		}
		return null;
	})
}
module.exports = mongoose.model("User",User);