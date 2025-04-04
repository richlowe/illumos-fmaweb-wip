
/**
 * Module dependencies.
 */

var express = require('express');
var fmamsg = require('fmamsg');
var sunmsg = require('./sunmsg');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/msg/:code', function(req, res) {
	var obj;
	try {
		obj = fmamsg.decode(req.params.code);
	} catch (errstr) {
		return (res.render('fail.jade', { title: "error", error: errstr }));
	}

	sunmsg.getMessage(obj.name, obj.value, function hand1(err, vals) {
		if (err) {
			return (res.render('fail.jade', { title: "error", error: err }));
		}

		delete vals['dict-entry'];
		delete vals['dictid'];
		for (var key in vals) {
			if (vals[key] === 'XXX')
				delete vals[key];
		}
		var hash = {
			title: "awesome",
			obj: vals,
			msgid: req.params.code
		};
		return (res.render('msg.jade', hash));
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
