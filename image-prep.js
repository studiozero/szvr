const fs = require('fs-extra');
const gm = require('gm');
const path = require('path');

const config = require('./config');

// NB If you're trying to re-do the image, remove the .json from the _originals folder for the image

// TODO - create callback so that generated images are copied over OR generate them into the right place!

var generateImage = function (imageData, type = 'main') {
	// find the image
	// resize it as per the config settings
	// put it in /assets/generate/...

	var i = config.imagePresets[type];
	if(!i) {
		console.error('Image resize does not recognise an image preset for : ', type);
		return false;
	}
	var original = gm('./src/_artwork/' + imageData.path.base);
	switch (type) {
		case 'amp':
		case 'tw' :
		case 'fb' :
			original.resize(i.width, i.height, '^')
				.gravity('Center')
				.crop(i.width, i.height)
			break;
		default :
			original.resize(i.width,i.height, '^')
			break;
	}

	original.noProfile()
		.write(`./src/assets/generated/${imageData.path.name + i.suffix + imageData.path.ext}`, console.error);



	return `/assets/generated/${imageData.path.name + i.suffix + imageData.path.ext}`;
}


var prepImages = function (imageStr) {

	// check if it's likely an image
	var imageData = {
		original : imageStr,
		// see https://nodejs.org/docs/latest/api/path.html#path_path_parse_path
		path : path.parse(imageStr),
		bgStyle : false,
		url : false
	};

	if(imageStr.indexOf('#') === 0) {
		// it's a color
		imageData.url = false;
		imageData.bgStyle = `background-color : ${imageStr};`;
		return imageData;
	}

	// check to see if JSON already exists
	var someImageFile;
	try {
		someImageFile = fs.readJsonSync(`./src/_artwork/${imageData.path.name}.json`);
		console.log('Existing image data: ', someImageFile);
		imageData = Object.assign({}, imageData, someImageFile);

	} catch (err) {
		// there's an error here
	}

	// assume it's a nice big image
	if(!imageData.url) {imageData.url = generateImage(imageData); console.log('imageData.url', imageData.url);}
	if(!imageData.fbUrl) {imageData.fbUrl = config.canonicalRoot + generateImage(imageData, 'fb'); console.log('imageData.fbUrl', imageData.fbUrl);}
	if(!imageData.twUrl) {imageData.twUrl = config.canonicalRoot + generateImage(imageData, 'tw'); console.log('imageData.twUrl', imageData.twUrl);}
	if(!imageData.ampUrl) {imageData.ampUrl = config.canonicalRoot + generateImage(imageData, 'amp'); console.log('imageData.ampUrl', imageData.ampUrl);}
	imageData.bgStyle = `background-image : url(${imageData.url}); background-size: cover;`;
	fs.writeJson(`./src/_artwork/${imageData.path.name}.json`, imageData, console.error);

	//console.log('******* IMG', imageData)

	return imageData;
};

module.exports = function (imageStr) {
	return Object.assign({}, prepImages(imageStr));
};