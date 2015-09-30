var log = require("npmlog");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Chore = new Schema({
		name: String,
		schedule: String,
		notes: String,
		done: Boolean,
		snooze: Date,
		assignees:[{type:Schema.Types.ObjectId,ref:"User"}],
		value: Number
	});
Chore.methods.choreDone = function(done,cb){
	this.done = done;
	return this.save(cb);
}
Chore.statics.done = function(id, done, cb){
	log.info('db.js',"entered done",id,done);
	return this.findById(id).then(function(chore){
		chore.choreDone(done,cb);
	});
}
Chore.methods.alterAssignee = function(user,mode,cb){
	if(mode !== 'del'){
		this.assignees.push(user);
	}else{
		var idx = this.assignees.indexOf(user);
		if(idx>0){
			this.assignees.splice(idx,1);
		}
	}
	return this.save(cb);
}
Chore.methods.Snooze = function(seconds,cb){
	var d = new Date();
	d.setSeconds(d.getSeconds() + seconds);
	if(seconds === null){
		this.snooze = undefined;
	}else{
		this.snooze = d;
	}
	return this.save(cb);
}
Chore.statics.getChores=function(data,cb){
    log.info("db.js","entered getChores",data);
    var id = data.id||null;
    return this.find().populate("assignees").exec(cb);
}
module.exports = mongoose.model("Chore",Chore);