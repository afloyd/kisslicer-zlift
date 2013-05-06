//; BEGIN_LAYER_OBJECT z=(\d+\.\d+)

var fs = require('fs'),
	path = require('path'),
	async = require('async'),
	stream = require('stream'),
	carrier = require('carrier'),
	Z_CHANGE = /^G1.+Z(\d+\.\d+)/,
	X_CHANGE = /^G1 X(\d+\.\d+)/,
	Y_CHANGE = /^G1.+Y(\d+\.\d+)/,
	E_CHANGE = /^G1.+E(\d+\.\d+)/,
	filePath = process.argv[2],
	args = process.argv.slice(3),
	appendText = '',
	replaceFile = false,
	zLiftAmount = 0.5,
	zLiftMinDist = 6,
	writeBuffer = [],
	liftsInLayer = 0,
	totalLifts = 0
	pos = {
		x:0,
		y:0,
		z:0,
		e:0
	};

while(args.length) {
	var arg = args.shift();
	switch(arg) {
		case '-a':
		case '-append':
			appendText = args.shift();
		case '-h':
		case '-height':
			zLiftAmount = args.shift();
		case '-m':
		case '-min':
			zLiftMinDist = args.shift();
	}
}

if (!fs.existsSync(filePath)) {
	console.error('File doesn\'t exist!');
	return process.exit(0);
} else {
	console.log('processing file... (' + filePath + ')');
}

// Set both readable and writable in constructor.
var NopStream = function () {
	this.readable = true;
	this.writable = true;
};

// Inherit from base stream class.
require('util').inherits(NopStream, require('stream'));

// Extract args to `write` and emit as `data` event.
NopStream.prototype.write = function () {
	args = Array.prototype.slice.call(arguments, 0);
	this.emit.apply(this, ['data'].concat(args))
};

// Extract args to `end` and emit as `end` event.
NopStream.prototype.end = function () {
	args = Array.prototype.slice.call(arguments, 0);
	this.emit.apply(this, ['end'].concat(args))
};


var extensionIdx = filePath.lastIndexOf('.'),
	writeTo = [filePath.slice(0, extensionIdx), (appendText || '-zLifts'), filePath.slice(extensionIdx)].join(''),
	rs = fs.createReadStream(filePath),
	ws = new NopStream({
		highWaterMark: 1073741824
	}),
	fStream = fs.createWriteStream(writeTo);
ws.pipe(fStream);

function setZHeight(line) {
	var zMatch = line.match(Z_CHANGE);

	if (zMatch) {
		pos.z = zMatch[1];
	}
}

function setXY(line) {
	var xMatch = line.match(X_CHANGE),
		yMatch = line.match(Y_CHANGE);
	if (xMatch) {
		pos.x = xMatch[1];
	}
	if (yMatch) {
		pos.y = yMatch[1];
	}
}

function setExtrusion(line) {
	var eMatch = line.match(E_CHANGE);

	if (eMatch) {
		pos.e = eMatch[1];
	}
}

function getDistance(first, second) {
	return Math.sqrt(Math.pow(first.x - second.x, 2) + Math.pow(first.y - second.y, 2));
}

var stringBuffer = '';
carrier.carry(rs, function (line) {
		var lastPos = {
			x: pos.x,
			y: pos.y,
			z: pos.z,
			e: pos.e
		};

		setZHeight(line);
		setExtrusion(line);
		setXY(line);

		var isNonExtrusionMove = getDistance(lastPos, pos) > zLiftMinDist && lastPos.e === pos.e;
		if (isNonExtrusionMove || lastPos.z !== pos.z) {
			if (lastPos.z !== pos.z) {
				console.log('\tStarting layer z=' + pos.z + '. Last layer lifts added: ' + liftsInLayer);
				totalLifts += liftsInLayer;
				liftsInLayer = 0;
			}

			liftsInLayer++;
			if (stringBuffer.length < 26214400) {
				stringBuffer +=
						'; adding z-lift \r\n' +
						'G1 Z' + (parseFloat(lastPos.z) + zLiftAmount) + '\r\n' +
						line.replace(/Z\d+.\d/, '') + '\r\n' +
						'G1 Z' + pos.z + '\r\n' +
						'; z-lift back down \r\n';
			} else {
				ws.write(stringBuffer, function (lastPos) {
					console.log('written up to z:' + lastPos);
				}.bind(null, lastPos.z));
				stringBuffer = '';
			}
		} else {
			if (stringBuffer.length < 26214400) {
				stringBuffer += line + '\r\n';
			} else {
				ws.write(stringBuffer, function (lastZ) {
					console.log('written up to z:' + lastZ);
				}.bind(null, lastPos.z));
				stringBuffer = '';
			}
		}
}, 'utf8')
.on('end', function () {
	if (stringBuffer.length) {
		ws.write(stringBuffer, function () {
			console.log('Everything should be written!');
		});
	}
	ws.end();
	console.log('total lifts added: ' + totalLifts);
	console.log('Writing to:\n\t' + path.resolve(writeTo) + '\n\t...');
});

fStream.on('finish', function () {
	console.log('Finished!');
	process.exit(1);
});