var fs = require('fs');
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
		}
	});

});
