var winston = require("winston");
winston.loggers.options.transports = [
  new (winston.transports.Console)({
    level:"debug",
    colorize:true,
    depth:5,
    prettyPrint:true,
    humanReadableUnhandledException:true,
    json:false
  }),
  new (winston.transports.DailyRotateFile)({
    filename:"homescheduler.log",
    timestamp:true,
    maxsize:1024*1024*5,
    tailable:true,
    depth:5,
    prettyPrint:true,
    maxFiles:10,
    json:true,
    level:"info"
  })]
winston.emitErrs = true;
var logger = new (winston.Logger)({
  exitOnError:false
})
module.exports = logger;
module.exports.stream = {
  write:function(message,encoding){
    logger.info(message)
  }
}