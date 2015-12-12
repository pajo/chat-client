var stdin = process.openStdin();
var tty = require('tty');
//process.stdin.setRawMode(true);    

var ansi = require('ansi')
  , cursor = ansi(process.stdout);

console.log(`is TTY: ${process.stdout.isTTY}`);
var colors = [ 'red', 'cyan', 'yellow', 'green', 'blue' ];

var pos = 1;

cursor
	.goto(1, 1)
	.red();

stdin.on('keypress', function (chunk, key) {
	cursor
		.goto(1, pos)
		.write(chunk);
	
	pos += chunk.length;	
  	if (key && key.ctrl && key.name == 'c') {
		cursor.reset();
		process.exit();  
	} 
});

