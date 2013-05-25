var sqlite3 = require('sqlite3').verbose();
var restify = require('restify');
var db = new sqlite3.Database('data.sqlite');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
}

var server = restify.createServer();

server.use(restify.dateParser());
server.use(restify.queryParser());
server.use(restify.jsonp());
server.use(restify.gzipResponse());
server.use(restify.bodyParser());

server.post('/emo', function (req, res, next) {
	//res.send(201, Math.random().toString(36).substr(3, 8));
	var value = req.params.value; 
	var key = req.params.key; 
	console.log('req.params', req.params); 
	res.send('tnx for sending: ' + key + ' : ' + value );
	insert_key_value(key, value, 1); 
	return next();
});

server.get('/emo', function (req, res, next) {
    var start = req.query.start; 
	var stop = req.query.stop; 
	if ( start && stop) {
		selection(start, stop, function(result) { 		
			res.send(result); 
			next();
		});
	} else {
		selection_all(function(result) { 		
			res.send(result); 
			next();
		});
	} 	
});

server.get('/hello', function (req, res, next) {
   res.send("hello"); 
   next();
});

server.head('/hello/:name', respond);

server.listen(8089, function() {
  console.log('%s listening at %s', server.name, server.url);
});

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS emo (key TEXT, value INT, user INT, timestamp INT)"); 
});

function insert_key_value(key, value, user) {
      var time = new Date().getTime();
	  var stmt = db.prepare("INSERT INTO emo VALUES (?,?,?,?)");
      stmt.run(key, value, user, time);
	  stmt.finalize();
}

function selection(starttime, endtime, callback){   
  var values = ''
  db.all("SELECT rowid AS id, key, value, user, timestamp FROM emo WHERE timestamp", function(err, rows) {
	rows.forEach(function (row) {
	  if (row.timestamp > starttime && row.timestamp < endtime) {
		new_values = row.key + " : " + row.value;
		values = values + new_values;  
	  }
	});
	callback(values) 
  });
 
}

function selection_all(callback){   
  var values = []
  db.all("SELECT rowid AS id, key, value, user, timestamp FROM emo ORDER by timestamp asc", function(err, rows) {
	rows.forEach(function (row) {
		values.push({'key': row.key, 
					'value': row.value, 
		  			'time': row.timestamp
					});
		});
	callback(values) 
  });
 
}

function inject_random(points) {
      var key = 'random'; 
      var time = new Date().getTime();
	  var stmt = db.prepare("INSERT INTO emo VALUES (?,?,?,?)");
	  for(var i=0; i<points; i++) {
	      random_time = 24*Math.random()*1000*60;
	      random_ = Math.round(Math.random()*100);
		  time = Math.round(time - random_time); 
		  stmt.run(key, random_, 1, time);
		  var d = new Date(time);
		  var day = d.getDate();
		  var hour = d.getHours(); 
		  var minutes = d.getMinutes(); 
		  console.log(key, random_, 1, time, day, hour, minutes); 
	  }
	  stmt.finalize();
	  
}

insert_key_value('happyness', 4, 1); 

inject_random(100); 
