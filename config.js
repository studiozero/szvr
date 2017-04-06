var fs = require('fs-extra');
var moment = require('moment');
var info = require('./package.json');

var srcDir = './src';
var wwwDir = './www';
var templateDir = './templates';
var templateExt = '.pug';
var canonicalRoot = 'http://studiozero.co';
var datePattern = 'MMM do, YYYY'; // follows momentjs date formatting - https://momentjs.com/docs/#/parsing/string-format/
var version = info.version || 0;
var artworkSrc = './artwork';

// folders (from ./src) that should appear in the menu, and the 'display' name for them
var topLevelFolders = [
	//{dir : 'hiring', title: 'We\'re hiring!'},
	{dir : 'blog',   title : 'Blog'}
]
// image presets
var imagePresets = {
	img : {
		width : 1200,
		height : 500,
		prefix : '',
		suffix : '@scaled'
	},
	fb : {
		width : 1200,
		height : 1200,
		prefix : canonicalRoot,
		suffix : '@1200x1200'
	},
	tw : {
		width : 560,
		height : 300,
		prefix : canonicalRoot,
		suffix : '@560x300'
	},
	amp : {
		width : 1392,
		height : 780,
		prefix : canonicalRoot,
		suffix : '@1392x780'
	}
}


var defaultData = {
	"_paths" : {},
	"_template" : "index.pug",
	"_metadata" : {
		date: moment().format(datePattern),
		site : 'Studio Zero',
		image: '#ede9e9',
		title: 'We are Studio Zero', // keep it short
		sell: 'We are Studio Zero | Immersive Web | VR | AR | MR | AI', // keep it < 80 chars
		summary: 'A creative studio building VR products and experiences for the web.', // keep it < 120 chars
		description: 'A creative studio building VR products and experiences for the web.', // keep it focused
		systemVersion : version
	}
};

module.exports = {
	srcDir : fs.realpathSync(srcDir),
	wwwDir : wwwDir,
	templateDir : fs.realpathSync(templateDir),
	templateExt : templateExt,
	defaultData : defaultData,
	canonicalRoot : canonicalRoot,
	datePattern : datePattern,
	version : version,
	artworkSrc : artworkSrc,
	topLevelFolders : topLevelFolders,
	imagePresets : imagePresets
}