var log = require("npmlog");

function index(express,app,db){
    var that = this;
    this.express = express;
    this.app = app;
    this.db = db;
    /* GET home page. */
    app.get('/', function(req, res, next) {
        log.info("index.js","get Homepage")
        res.render('index',{pretty:"  ",app_version:process.env.npm_package_version});
    });
    app.io.route("initialized",function(req){
        log.info("index.js","Frontend initialized");
    });
    app.io.route("getChores",function(req){
        var data = req.data || {};
        var id = data.id||null;
        log.info("index.js","getChores() id:" + id);
        db.Chore.getChores(data,function(err,chores){
            //log.info("index.js","gotChores:",chores)

            chores = chores.map(function(e,i,a){
                var foo = e.toObject() ;
                foo.assignees.readonly = true;
                return foo;
            })

            req.io.emit("choresResp",chores);
        });
    });
    app.io.route("usersAcQuery",function(req){
        var query = req.data;
        log.info("index.js","usersAcQuery(%s)",query);
        db.User.findUsersNamed(query,function(err,users){
            req.io.emit("usersAcResp",users);
        })
    });
    app.io.route("choreDone",function(req){
        var id = req.data;
        log.info("index.js","choreDone",id);
        db.Chore.done(id,function(err,chore){
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

}
module.exports = index;
