var fs = require('fs');
var http = require('http');
var querystring = require('querystring');

var Tail = require('tail').Tail;
var tail = new Tail("/var/log/keystroke.log");
var historylength = 20;

var history = [];
for (var i=0; i<historylength; i++)
	history.push('');

var config = JSON.parse(fs.readFileSync('config.json'));

tail.on("line", function(data) {

	var a = data.split(' ');

	history.push(a[2]);
	if (history.length >= historylength)
		history = history.slice(1, historylength);

	// console.log('log', data, a, history);

	config.patterns.forEach(function(matcher) {
		// //console.log('Match pattern', matcher.pattern);
		// console.log('Against history', history, 'at', history.length - matcher.pattern.length);
		var historypart = history.slice(history.length - matcher.pattern.length);
		// console.log('Against history', historypart);
		var match = true;
		for (var i=0; i<historypart.length; i++)
			if (historypart[i] != matcher.pattern[i])
				match = false;
		if (match) {
			console.log('Log emotion:', matcher.scoring);
			for(var k in matcher.scoring) {
				var v = matcher.scoring[k];

				console.log('Log key', k, 'value', v);

				var data = querystring.stringify({key: k, value: v});

				var options = {
				    host: '192.168.200.37',
				    port: 8089,
				    path: '/emo',
				    method: 'POST',
				    headers: {
				        'Content-Type': 'application/x-www-form-urlencoded',
				        'Content-Length': data.length
				    }
				};

				var req = http.request(options, function(res) {
				    res.setEncoding('utf8');
				    res.on('data', function (chunk) {
				        console.log("body: " + chunk);
				    });
				});

				req.write(data);
				req.end();
			}
		}
	});

});
