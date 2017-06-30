---
title: "Bridging the Gap"
draft: false
description: "Unity WebGL to WebVR"
author: "Merrick Fox"
---

Unity 3D is a powerful games engine allowing developers to build an experience and deploy to almost every platform you can think of. From smart TV’s to PS4 consoles. But what are the options regarding WebVR? Well you can export a project to WebGL and embed it in a webpage, or you can export specifically for VR headsets like the Vive, GearVR, Daydream etc, but there currently is no build option for WebVR (yet). Is it possible to leverage one of these build targets for WebVR? It turns out there is.
 
<h2>Setting the scene</h2>

Unitys WebGL export was going to be the launch pad for this experiment because it’s actually fairly close to what we want already. If we create a simple scene in Unity with a room and a camera and export it to WebGL what do we end up with? We get a webpage with a canvas element displaying our room, we can’t interact with anything or move. So how do you get from this to a VR scene that works with headsets and their controllers?

WebVR API (https://developer.mozilla.org/en-US/docs/Web/API/WebVR_API) to the rescue. We can use the WebVR API to retrieve data from the currently connected headset and get it’s orientation and position etc, then we can also use the GamePad API (https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API) to retrieve data from your headset controllers. So we now have all the position data needed to move the camera in unity and any ingame representations of hands/controllers, we just need to get it into unity so the game can update your game objects. Unity provides a simplistic way of ferrying this data using a function called `SendMessage` this allows you to call a function in one of your Unity scripts and pass in some parameters, so for example on your VR camera object you could have a function called `SetYPosition` which takes a float as a parameter and sets the internal camera Y position variable to an updated one, you then call that in a JS file that you bundle with your build (see WebGL templates in Unity) by calling `SendMessage('WebVRCamera', 'SetYPosition', myHeadsetPose.position.y);` and so on and so forth for any data you wish to ferry into Unity.
 
With some tweaking and sending the correct data we have ourselves a Unity3D WebVR export.

<div class="iframe-wrapper">
	<iframe width="560" height="315" src="https://www.youtube.com/embed/7FnLOZ6QQpg" frameborder="0" allowfullscreen></iframe>
</div>
