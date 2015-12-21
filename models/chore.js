var log = require('bunyan').createLogger({name: 'chore.js'});
var Promise = require('bluebird');
var mongoose = require("mongoose");
mongoose.Promise = Promise;
var Schema = mongoose.Schema;
var Chore = new Schema({
		name: String,
		schedule: String,
		notes: String,
		done: Boolean,
		snooze: Date,
		assignees:[{type:Schema.Types.ObjectId,ref:"User"}],
		value: Number
	},{minimize:false});

Chore.statics.wake = function(id){
	log.info('chore.js',"entered wake",id);
	return this.findById(id).then(function(chore){
		chore.choreDone(null);
	});
}

Chore.methods.choreDone = function(done,cb){
	this.done = done;
	return this.save(cb);
}
Chore.statics.done = function(id,done, cb){
	log.info('chore.js',"entered done",id,done);
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
Chore.statics.getChores=function(done){
    log.info("chore.js","entered getChores");
    //var id = data.id||null;
    return this
    	.find({done:done})
    	.populate("assignees")
    	.exec(function(err,docs){})
    	.then(function(chores){
    		chores = chores.map(function(e,i,a){
                var foo = e.toObject() ;
                foo.assignees.readonly = true;
                return foo;
            })
            return chores;
    	},function(){log.info("chore.js","getChoresCB",arguments)});
}
Chore.statics.wakeSnoozed = function(cb){
	return this.find({snooze:{"$lt":new Date()}}).exec(
		function(err,chores){
			var ids = [];
			chores.forEach(function(e){
				ids.push(e._id);
				e.done = false;
				e.snooze = undefined;
				e.save(function(e){
					if(e){
						console.warn("error saving record:",err);
					}
				});
			});
			cb(null,ids);
		}
	);
}
Chore.statics.wakeAll = function(){
	return this.update({done:true},{done:false,snooze:undefined},{multi:true}).exec();
}
module.exports = mongoose.model("Chore",Chore);