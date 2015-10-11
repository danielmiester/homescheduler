var log = require("npmlog");
var passport = require('passport');
var Strategy = require('passport-http').BasicStrategy;

function index(express,app,db){
    var that = this;
    this.express = express;
    this.app = app; 
    this.db = db;
    passport.use(new Strategy(
        function(userid, password, done) {
            db.User.validateUser(userid,password, function (err, user) {
                console.log(arguments);
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            return done(null, user);
        });
      })
    );
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
      db.User.findById(id, function(err, user) {
        done(err, user.toObject());
      });
    });

    /* GET home page. */
    app.get('/', 
        passport.authenticate('basic'),
        function(req, res, next) {
        log.info("index.js","get Homepage")
        res.render('index',{pretty:"  ",app_version:process.env.npm_package_version});
    });
    app.get(/\/jade\/(.*)\.jade/,
        function(req,res,next){
        var file = req.params[0];
        log.info("index.js","getTemplate",file);
        app.render(file,{},function(err,html){
            res.send(html);
            console.log("html",html)
        });
    })
    app.io.route("initialized",function(req){
        log.info("index.js","Frontend initialized");
    });
    function getChores(req){
        db.Chore.getChores(function(err,chores){
            //log.info("index.js","gotChores:",chores)

            chores = chores.map(function(e,i,a){
                var foo = e.toObject() ;
                foo.assignees.readonly = true;
                return foo;
            })

            req.io.emit("choresResp",chores);
        });
    }
    app.io.route("getChores",function(req){
        var data = req.data || {};
        var id = data.id||null;
        log.info("index.js","getChores() id:" + id);
        getChores(req);
    });
    app.io.route("choreDone",function(req){
        var id = req.data;
        log.info("index.js","choreDone",id);
        db.Chore.done(id,true,function(err,chore){
            getChores(req);
        })
    });
    app.io.route("choreWake",function(req){
        var id = req.data;
        log.info("index.js","choreWake",id);
        db.Chore.wake(id,function(err,chore){
            req.io.emit("choresUpdate",chore);
        })
    });
    console.log("dev",process.env.npm_package_config_dev)
    if(process.env.npm_package_config_dev){
        log.info("index.js","waking all chores")
        db.Chore.wakeAll(function(err,chores){
            log.info("index.js","woken all chores",chores)
        })
    }
    /**
    var cronInterval = process.env.npm_package_config_cronInterval;
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
