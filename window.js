var ansi = require('ansi'),
   	cursor = ansi(process.stdout);

module.exports = {
	createWindow: createWindow
};

function createWindow(options) {
	options = options || {};
	
	return new Window(options)
};

function Window(options) {
	var width = options.width || 80,
		height = options.height || 2,
		title = options.title,
		titleOffset = title ? 1 : 0,
		x = options.left || 1,
		y = (options.top || 1) + titleOffset,
		trueHeight = height - titleOffset,
		content = [];
	
	if (titleOffset > 0) {
		var headerTitle = title.substring(0, width - 6),
			decorator = new Array(Math.floor((width - headerTitle.length)/2)).join('-'),
			header = decorator + headerTitle + decorator;
			
		if (header.length < width) {
			header += '-'
		}
		
		cursor
			.goto(x, y - titleOffset)
			.write(header)
			.reset()
	}
	
	if (options.input) {
		listenKeys(options.input);	
	};
			
	this.write = write;
	
	function write(text, options) {
		options = options || {};
		if (options.clear) {
			content = [];
		}
		
		if (text) {
			var sentences = text.split('\n');
			
			sentences.forEach(function (sentence) {
				var currentIndex = width - 1,
					lineStartIndex = 0;
				
				while (currentIndex < sentence.length) {						
					while (currentIndex > lineStartIndex) {
						if (/ |\.|,|:|!|\?/.test(sentence.charAt(currentIndex))) {
							break;
						} else {
							currentIndex--;
						}
					}
					
					if (lineStartIndex == currentIndex) {
						currentIndex = lineStartIndex + width;
					}
					
					addSentence(sentence.substring(lineStartIndex, currentIndex - lineStartIndex), options);
					
					lineStartIndex = currentIndex;
					currentIndex = lineStartIndex + width;
				}
				
				if (lineStartIndex < sentence.length) {
					addSentence(sentence.substring(lineStartIndex), options);
				}
			});
		}
		
		render(options);
	}
	
	function addSentence(sentence, options) {
		var spaces = new Array(width - sentence.length).join(' ');
		content.push({
			color: options.color || 'white',
			text: (sentence + spaces).substring(0, width)
		});
	}
	
	function render(options) {
		var l = content.length,
			lineIndex = y,
			index = Math.max(l - trueHeight, 0);
		
		for	(index; index < l; index++) {
			var line = content[index];
			
			if (cursor.fg[line.color]) {
				cursor.fg[line.color]();
			}
			
			cursor
				.goto(x, lineIndex)
				.write(line.text);
				
			lineIndex++;	
		}
		
		if (options.clear) {
			var clearLine = new Array(width + 1).join(' ');
			for (index; index < height; index++) {
				cursor
					.goto(x, lineIndex)
					.write(clearLine);	
			}
			
			lineIndex++;
		}
		
		cursor.reset();
	}
	
	function listenKeys(cb) {
		process.stdin.setRawMode(true);
		process.stdin.resume();
		
		var buffer = '';
		
		process.stdin.on('data', function (key) {
			var char = key + '';	
			switch (char.charCodeAt(0)) {
				case 3:
					process.exit();
					break;
				case 13:
					if (cb) {
						cb(buffer);
					}
					buffer = '';
					write(buffer, { clear: true });
					break;
				default:
					buffer += char;
					write(buffer, { clear: true });
					break;
			}
		});
	}
}