const pug = require('pug');
const klaw = require('klaw');
const fs = require('fs-extra');
const path = require('path');
const through2 = require('through2');
const commonmark = require('commonmark');
const fm = require('front-matter');
const sass = require('node-sass');
const moment = require('moment');

const config = require('./config');
const imagePrep = require('./image-prep.js');

var templates = {};
var site_data = {
	blog : []
};

var initTemplates = function (callback) {

	klaw(config.templateDir, {filter : shouldIgnore})
		.on('data', function (item) {
			// check it's a template
			if(path.extname(item.path) === '.pug') {
				// get the template
				var template = pug.compileFile(item.path);
				var key = path.basename(item.path);
				console.log('templ',key, item.path);
				templates[key] = template;
			}
		})
		.on('end', function () {
			//console.log(templates);
			if(callback) {
				callback();
			}
		});
};


const renderBlog = pug.compileFile('./templates/blog_page.pug');


var buildPaths = function (item, ext) {

	var wwwRootPath = item.path.split(config.srcDir)[1];
	var newPathObj = path.parse(wwwRootPath);
	newPathObj.ext = ext;
	delete newPathObj.base;

	var renderPath = path.format(newPathObj);

	return {
		url : renderPath,
		renderPath : config.wwwDir + renderPath,
		filePath : item.path
	};
}

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
};

var prepareData = function (paths, meta) {
	// for the moment, we ONLY care about setting _template and _metadata

	var defaultData = Object.assign({}, config.defaultData);
	// make the _metadata url the full canonical site url
	var newMeta = Object.assign({}, defaultData._metadata, meta);

	var prepped = Object.assign({}, defaultData, {
		"_metadata" : newMeta,
		"_paths" : paths
	});

	prepped._metadata.canonicalURL = config.canonicalRoot + paths.url;
	prepped._metadata.absoluteURL = paths.url;
	// get the defaults

	prepped._metadata.imageData = imagePrep(prepped._metadata.image);

	if(paths.url.indexOf('/blog/') >= 0){
		// add as a blog item
		site_data.blog.push(prepped);
	};

	// return the 'default' + page data, ready for merge
	return prepped;
}

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

var getMarkdown = function (item) {

	var file = fs.readFileSync(item.path, 'utf-8');
	var frontMatter = fm(file);
	var paths = buildPaths(item, '.html');

	return Object.assign({}, prepareData(paths, frontMatter.attributes), {
		_format : 'markdown',
		body : frontMatter.body
	});
};


var renderMarkdown = function (data) {
	// crackers commonmark implementation of handling markdown (I like it)
	var parsed = reader.parse(data.body);
	data.rendered = writer.render(parsed);

	return renderBlog(data); //output HTML
};

var isMarkdown = function (item) {
	var mdExt  = [
		".markdown", ".mdown", ".mkdn", ".mkd", ".md"
	];
	return (mdExt.indexOf(path.extname(item.path)) > -1);
};

var getSass = function (item) {
	var paths = buildPaths(item, '.css');
	return Object.assign({}, {_format : 'sass', _paths : paths});
};

var renderSass = function (data) {
	return sass.renderSync({
		file : data._paths.filePath
	}).css;
}

var isSass = function (item) {
	var sassExt = [
		".scss", ".sass"
	];
	return (sassExt.indexOf(path.extname(item.path)) > -1);
};

var renderJSON = function (data) {
	console.log('----- RENDER JSON', JSON.stringify(data));
	return templates[data._template](data);
}

var getJSON = function (item) {
	var paths = buildPaths(item, '.html'); // compiling to .html
	var json = fs.readJsonSync(item.path);


	return Object.assign({}, json, prepareData(paths, json._metadata), {_format : 'json'});

}

var isJSON = function (item) {
	return (path.extname(item.path) === '.json');
};

var getSiteData = function () {

	// get blog list in time order
	site_data.blog.sort(function (a,b){
		if(!a._metadata.date || !b._metadata.date) {
			return 0;
		}
		// older
		if(moment(a._metadata.date) > moment(b._metadata.date)) return -1;
		// younger
		if(moment(a._metadata.date) < moment(b._metadata.date)) return 1;
		// the same
		return 0;
	});

	return site_data;
};

module.exports = {
	isJSON : isJSON,
	getJSON : getJSON,
	renderJSON : renderJSON,
	isSass : isSass,
	getSass : getSass,
	renderSass : renderSass,
	isMarkdown : isMarkdown,
	getMarkdown : getMarkdown,
	renderMarkdown : renderMarkdown,
	copyWholesale : copyWholesale,
	shouldIgnore : shouldIgnore,
	initTemplates : initTemplates,
	getSiteData : getSiteData
}