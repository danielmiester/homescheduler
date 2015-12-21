require("long-stack-traces");
var log = require('bunyan').createLogger({name: 'app.js'});
var Promise = require('bluebird');
var mongoose = require("mongoose");
mongoose.Promise = Promise;
var morgan = require("morgan");
var express = require('express.io');
var app = express().http().io();
app.use(morgan("dev"));
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var mM = require("./myMongoose.js");
mM.then(function(myMongoose){
    log.debug("db  Loaded",myMongoose);
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');


    // uncomment after placing your favicon in /public
    //app.use(logger('dev'));
    app.use(require('serve-favicon')(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(express.session({
        secret: "flibbity",
        store: new require('session-file-store')(require('express-session'))()
    }))
    app.use(passport.initialize())
    app.use(passport.session());
    // Make our db accessible to our router
    app.use(function (req, res, next) {
        req.myMongoose = myMongoose;
        next();
    });
    new (require('./routes/index'))(express, app, myMongoose);

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    app.locals.pretty = true;

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}).catch(function(){
    log.error("Error loading/connecting to DB. Exiting ",arguments);
    process.exit(-1);
})

app.listen(process.env.npm_package_config_port);
module.exports = app;
