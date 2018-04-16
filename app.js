var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const cacheManager = require('cache-manager');
const fsStore = require('cache-manager-fs');
exports.cache =  cacheManager.caching({
	store: fsStore,
	options: {
		ttl: 60*60,
		maxsize: 1000*1000*1000,
		path: 'cache/',
		preventfill:true
	}
})

var bodyParser = require('body-parser');
var session = require('cookie-session');
var indexRouter = require('./routes/index');
var model = require('./model');
var parser = require('./controllers/parserContoller');
var shedule = require('node-schedule');
const db = model.sequelize;

const cookieParser = require('cookie-parser');
var app = express();
app.use(logger('dev'));

app.use(cookieParser());
app.use(bodyParser.json());
var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour
app.use(session({
    resave: true,
    saveUninitialized: true,
    name: 'session',
    keys: ['super-key1', 'super-key2'],
    cookie: {
        path: 'cookie',
        expires: expiryDate
    }

}));
app.use(express.static(path.join(__dirname, 'files')));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use('/', indexRouter);
shedule.scheduleJob({minute: '0' }, function () {
parser()
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json(err.message);
});

module.exports = app;
