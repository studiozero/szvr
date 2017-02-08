// get the stuff
const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');
const through2 = require('through2');

const config = require('./config');
const help = require('./helpers');

// Start here

var build = function () {

	console.log('# Generating new site');

// get rid of the old www folder
	fs.removeSync('./www');

	console.log('* Removed `/www` folder');
	var toCopy = [];
	var toRender = [];


	klaw(config.srcDir, {filter : help.shouldIgnore})
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
			if(help.isMarkdown(item) ) {
				console.log('* Get Markdown data', item.path);
				toRender.push(help.getMarkdown(item));
			}

			if(help.isSass(item)) {
				//console.log('* Get SASS data', item.path);
				toRender.push(help.getSass(item));
			}

			if(help.isJSON(item)) {
				//console.log('* Get JSON data', item.path);
				toRender.push(help.getJSON(item));
			}


		})
		.on('end', function () {
			console.log('---------------');

			// copy the standalone folders as they are
			toCopy.forEach(function (dir) {
				try {
					//console.log('* Copied', path.basename(dir));
					fs.copySync(dir, `./www/${path.basename(dir)}`);
				} catch (err) {
					console.error('FAILED', err);
				}
			});



			// do the rendering of the markdowns
			toRender.forEach(function (data) {
				var output;
				data._site_data = help.getSiteData();

				switch (data._format) {
					case 'markdown' :
						output = help.renderMarkdown(data);
						break;
					case 'sass' :
						output = help.renderSass(data);
						break;
					case 'json' :
						output = help.renderJSON(data)
						break;
				}

				console.log('* Rendered', data._paths.renderPath);
				fs.outputFileSync(data._paths.renderPath, output);
			})


			// if image is defined in frontmatter,
			// find it and make all the versions for thumbnails,
			// OG & Twitter cards etc.

			// generate valid RSS for blog

			// copy the aws-upload conf file to the root

			fs.copy('./aws-upload.conf.js', './www/aws-upload.conf.js', function (err) {
				if(err) {
					console.error('### Failed at the last hurdle');
				} else {
					console.log('### Success');
					console.log('Now do `npm run deploy` to push online');
				}
			});
		});

};

help.initTemplates(build);