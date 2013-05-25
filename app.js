var fs = require('fs');
var http = require('http');
var restler = require('restler');
var querystring = require('querystring');

var Tail = require('tail').Tail;

var historylength = 20;
var history = [];
for (var i=0; i<historylength; i++)
	history.push('');

var keycounter = 0;

function reportValue(key, value) {

	console.log('Log key ' + key + ', value ' + value);

	restler.post('http://192.168.200.37:8089/emo', {
		data: { 
			key: key,
			value: value	
		}
	}).on('complete', function(data, response) {
		console.log('complete', data);
	});
}

var config = JSON.parse(fs.readFileSync('config.json'));

var tail = new Tail("/var/log/keystroke.log");
tail.on("line", function(data) {

	var a = data.split(' ');

	history.push(a[2]);
	if (history.length >= historylength)
		history = history.slice(1, historylength);

	keycounter ++;

	config.patterns.forEach(function(matcher) {
		var historypart = history.slice(history.length - matcher.pattern.length);
		var match = true;
		for (var i=0; i<historypart.length; i++)
			if (historypart[i] != matcher.pattern[i])
				match = false;
		if (match) {
			console.log('Log emotion:', matcher.scoring);
			for(var k in matcher.scoring) {
				var v = matcher.scoring[k];
				reportValue(k, v);
			}
		}
	});

});

var lastfront = '';
var frontcounter = 0;

var tail2 = new Tail("/var/log/frontmost.log");
tail2.on('line', function(data) {
	data = data.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
	console.log('frontmost app:', data, frontcounter, keycounter);
	if (data != lastfront) {
		lastfront = data;
		console.log('log frontmost app usage:', lastfront, frontcounter, keycounter);
		reportValue('appusage-'+data, frontcounter);
		reportValue('appkeys-'+data, keycounter);
		keycounter = 0;
	}
	else {
		frontcounter ++;
	}
});


