document.addEventListener("DOMContentLoaded", function(event){
	console.log('DOM ready');

	var cameraAnimation = document.querySelector('#camera-animation');
	var title = document.querySelector('.home-header-logo');

	cameraAnimation.addEventListener('animationend', function(){

		title.classList.add('fade-in');

		console.log('animation has ended')

	});


})