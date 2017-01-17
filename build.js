// get the stuff
const pug = require('pug');
const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');
const through2 = require('through2');
const commonmark = require('commonmark');

const help = require('./helpers');

var bigData =  {
	templates : {}
}

// Start here

console.log('# Generating new site');

// get rid of the old www folder
fs.removeSync('./www');

console.log('* Removed `/www` folder');
var toCopy = [];
var toRender = [];

var renderBlog = pug.compileFile('./templates/blog_page.pug');

klaw('./src', {filter : help.shouldIgnore})
	.on('data', function (item) {

		// if folder has index.html at the root, don't load anything, just store the reference for copying
		if(help.copyWholesale(item)) {
			// mark as 'to copy as is'
			console.log('* Copy without building - ', item.path);
			toCopy.push(item.path);
			// it'd be great to be able to step out here of drilling down... hints?
			return true; // skip to next item
		}

		// so, from here, assume most things are markdown files, template, folders, images etc.

		console.log(':::: ', item.path);
		if(help.isMarkdown(item) ) {
			var file = fs.readFileSync(item.path, 'utf-8');
			var data = {
				file : file,
				path : item.path
			}
			toRender.push(data);
		}


	})
	.on('end', function () {
		console.log('---------------');
		console.log(JSON.stringify(toCopy));

		// copy the standalone folders as they are
		toCopy.forEach(function (dir) {
			try {
				//console.log('    * ', path.basename(dir))
				fs.copySync(dir, `./www/${path.basename(dir)}`);
			} catch (err) {
				console.error('FAILED', err);
			}
		})

		console.log('toRender', toRender);
		// do the rendering of the markdowns
		toRender.forEach(function (data) {
			var reader = new commonmark.Parser();
			var writer = new commonmark.HtmlRenderer();
			var parsed = reader.parse(data.file);
			data.rendered = writer.render(parsed);
			data.title = "Hello world";

			fs.outputFileSync('./www/blog/index.html', renderBlog(data));
		})

		// parse the md files
			// get the frontmatter
			// if image is defined in frontmatter,
				// find it and make all the versions for thumbnails,
				// OG & Twitter cards etc.

			// get the raw md
			// if it has a template define, run it through
			// else, use blog post template

		// generate valid RSS for blog
	});

