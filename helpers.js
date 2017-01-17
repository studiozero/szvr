var pug = require('pug');
var fs = require('fs-extra');
var path = require('path');
var through2 = require('through2');

var shouldIgnore = function (item) {
	var key = path.basename(item);
	return key === '_' || key[0] !== '_';
}

var copyWholesale = function (item) {
	// if it's a folder
	if(item.stats.isDirectory()) {
		// and that folder has an 'index.html' at the root
		if(fs.existsSync(item.path + '/index.html')) {
			return true;
		}
	}
	return false;
}

var isMarkdown = function (item) {
	var mdExt  = [
		".markdown", ".mdown", ".mkdn", ".mkd", ".md"
	];
	return (mdExt.indexOf(path.extname(item.path)) > -1);
}

module.exports = {
	isMarkdown : isMarkdown,
	copyWholesale : copyWholesale,
	shouldIgnore : shouldIgnore
}