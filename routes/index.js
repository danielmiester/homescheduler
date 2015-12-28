var log = require('bunyan').createLogger({name: 'index.js'});
var Promise = require('bluebird');
var mongoose = require("mongoose");
mongoose.Promise = Promise;
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;
var util = require('util');

function index(express,app,db){
    var that = this;
    this.express = express;
    this.app = app; 
    this.db = db;
    passport.use(new Strategy(
        function ppucb(userid, password, done) {
            log.info("index.js","ppucb")
            db.User.validateUser(userid,password).then(function (user) {
                log.info("index.js","passport.use.validateUser",user)
                if (!user) { return done(null, false); }
                return done(null, user);
            }).catch(function(e){
                return done(e)
            });
        })
    );
    passport.serializeUser(function(user, done) {
        log.info("index.js","serializeUser")
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        log.info("index.js","passport.deserializeUser");
        this.db
        db.User
        .findOne({id:id})
        .exec()
        .then(function(user){
            done(null,user.toObject()||null);
        })
        .catch(function(e){
            done(e,null);
        });
    });

    /* GET home page. */
    app.get('/', 
        passport.authenticate('basic'),
        function(req, res, next) {
            log.info("index.js","get Homepage")
            res.render('index',{include_file:"'/jade/tabs.jade'",pretty:"  ",app_version:process.env.npm_package_version});
        }
    );
    app.get(/\/jade\/(.*)\.jade/,
        passport.authenticate('basic'),
        function(req,res,next){
            var file = req.params[0];
            log.info("index.js","getTemplate",file);
            app.render(file,{pretty:"  ",},function(err,html){
                if(err){
                    res.send(JSON.stringify(err))
                }
                res.send(html);
            });
        }
    );
    app.get(/\/test\/(.*\.jade)/,
        function(req,res,next){
            var file = "'/jade/"+req.params[0]+"'";
            log.info("index.js","getTemplate",file);
            res.render('index',{include_file:file,pretty:"  ",app_version:process.env.npm_package_version});
        }
    )
    app.io.route("options",{
        get:function(req){
            log.info("index.js","GetOptions");
            req.io.emit("options:load",req.session.userOptions);
        },
        set:function(req){
            log.info("index.js","SetOption",req.data);
            if(! req.session.userOptions){
                req.session.userOptions = {};
            }
            for(var i in req.data){
                req.session.userOptions[i] = req.data[i];    
            }
            req.session.save(function(){});
            req.io.emit("sessionOptions",req.session.userOptions);
        }
    });
    app.io.route("initialized",function(req){
        log.info("index.js","Frontend initialized");
        req.io.emit("sessionOptions",req.session.userOptions);
    });
    app.io.route("chores",{
        getAll:function(req){
            var data = req.data || {};
            var id = data.id||null;
            var done = data.done||null;
            log.info("index.js","getChores() id:" + id,"done",done);
            db.Chore.getChores(done).then(function(chores){
                log.info("index.js","gotChores:",chores)

                // chores = chores.map(function(e,i,a){
                //     var foo = e.toObject() ;
                //     foo.assignees.readonly = true;
                //     return foo;
                // })
                req.io.emit("chores:update",chores);
            });
            
        }
    });
    app.io.route("chore",{
        done:function(req){
            var id = req.data;
            log.info("index.js","choreDone",id);
            db.Chore.done(id,true,function(err,chore){
                app.io.broadcast("chores:update",chore);
            })
        },
        wake:function(req){
            var id = req.data;
            log.info("index.js","choreWake",id);
            db.Chore.wake(id,function(err,chore){
                log.info("index.js","choreWakeCB",chore);
                app.io.broadcast("chores:update",chore);
            })
        },

    });
    
    console.log("dev",config.dev)
    if(config.dev){
        log.info("index.js","waking all chores")
        db.Chore.wakeAll().then(function(chores){
            log.info("index.js","woken all chores",chores)
        })
    }
    /**
    var cronInterval = config.cronInterval;
    cronInterval *= 1000;
    function cron(){
        log.info("index.js","cron called")
        db.Chore.wakeSnoozed(function(err,chores){
            app.io.broadcast("choresWoken",chores)
        })
    }
    var id = setInterval(cron,cronInterval);
    id.unref();
    */

}
module.exports = index;
