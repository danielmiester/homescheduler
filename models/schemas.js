var mongoose = require("mongoose");


var schemas = {};

schemas.chore = mongoose.Schema({
	name: String,
	schedule: String,
	notes: String,
	done: Boolean,
	snooze: {type:Date, default:function(){return Date.now()+1000*3600}}
});





module.exports = schemas;