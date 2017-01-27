document.addEventListener("DOMContentLoaded", function(event){

	var cameraAnimation = document.querySelector('#camera-animation');
	var title = document.querySelector('.intro');

	cameraAnimation.addEventListener('animationend', function(){

		title.classList.add('fade-in');

		console.log('animation has ended')

	});


})