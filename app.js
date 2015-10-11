var winston = require("winston");
var winstonStream = require("winston-stream");
winston.loggers.options.transports = [
  new (winston.transports.Console)({
    level:"debug",
    colorize:true,
    depth:2,
    prettyPrint:true,
    humanReadableUnhandledException:true,
    json:false
  }),
  new (winston.transports.DailyRotateFile)({
    filename:"homescheduler.log",
    timestamp:true,
    maxsize:1024*1024*5,
    tailable:true,
    depth:2,
    prettyPrint:true,
    maxFiles:10,
    json:true,
    level:"info"
  })
  ]
winston.emitErrs = true;
winston.loggers.add("app.js",{});
var log = winston.loggers.get("app.js");

var morgan = require("morgan");
var express = require('express.io');
var app = express().http().io();
app.use(morgan("combined",{stream:log.info.stream}));
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var DB = require("./db.js");
var Index = require('./routes/index');
var passport = require('passport');


var dbo = new DB(function(err,db){
  log.debug("app.js","dbCallback(%s,%j)",err);
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');


  // uncomment after placing your favicon in /public
  app.use(logger('dev'));
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(express.session({secret:"flibbity"}))
  app.use(passport.initialize())
  app.use(passport.session());
  // Make our db accessible to our router
  app.use(function(req,res,next){
    req.db = db;
    next();
  });
  var index = new Index(express,app,dbo);
  

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  app.locals.pretty = true;

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

});


app.listen(process.env.npm_package_config_port);
module.exports = app;
