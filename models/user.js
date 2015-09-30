var mongoose = require("mongoose");
var User = mongoose.Schema({
		name: String,
		email:String,
		avatar:String
	});
User.statics.findUsersNamed = function(name,cb){
	return this.find({"name":new RegExp(name,"i")}).sort("name").limit(20).exec(cb);
}
module.exports = mongoose.model("User",User);