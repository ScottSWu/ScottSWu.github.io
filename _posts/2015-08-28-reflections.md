---
title: Reflections
date: 2015-08-28 05:20:41
tags:
- graphics
- opengl
---
*Following up on the [Reflections demo](/projects/Reflections/").*

Reflection and refraction using environment maps are a simple way to make cool looking materials. However, environment mapping is limited to far away, static scenes. I was looking to render reflections in a dynamic scene.

I recall that certain games compute reflections or indirect lighting by sampling the environment at regular position intervals. Reflected rays would use / interpolate nearby samples to compute the reflected color. Although this is fast, efficient and would support an arbitrary number of reflective surfaces, I was also interested in something more accurate.

I started with a plane mirror, but I would like to explore with concave, convex or transparent panes in the future. A plane mirror is straightforward because the virtual image can besimulated by flipping the camera position and orientation around the plane.

{% include figure
    image_path="/assets/posts/reflection1.png"
    caption="A reflected camera will produce the correct environment map for a plane mirror."
%}

In OpenGL, we can compute this reflected camera position and orientation, render the scene, and then use that render as the environment map with the actual camera. However, the reflected camera is behind the mirror, which means the mirror would obscure the entire scene. To solve this, we need to clip everything before the mirror.

Simply setting the near plane would not work because objects close to the mirror would then also be clipped.

{% include figure
    image_path="/assets/posts/reflection2.png"
    caption="The near plane is not parallel to the mirror, which means the objects in red will not be in the reflected image."
%}

A second approach was to scale the coordinates in the vertex shader such that the z-coordinate falls under the near plane. Depending on the orientation of the plane in camera space, we can compute a scaling factor based on x and y, and multiply the entire vertex by that scaling factor. However, this caused major artifacts as the camera approached the mirror plane. The scaling factor up close approached infinity, causing issues for vertices near the mirror plane.

{% include figure
    image_path="/assets/posts/reflection3.png"
    caption="Object positions are scaled depending on x(y) coordinate such that the plane when scaled is equivalent to the near plane."
%}

The third approach was to pass the clipping plane to the fragment shader and use the discard statement on fragments behind the mirror. We can pass world-space coordinates through the shaders and compute which side of the plane it is on. To note, one down side of this approach is that almost all objects must implement these checks on the fragment shader.

{% highlight glsl %}
...
varying vec3 worldPos;

void main() {
    ...
    worldPos = modelViewMatrix * position;
    ...
}
{% endhighlight %}
{% highlight glsl %}
...
uniform vec3 planeOrigin;
uniform vec3 planeNormal;

varying vec3 worldPos;

void main() {
    float side = dot(worldPos - planeOrigin, planeNormal);
    if (side < 0) { // Other side of the plane
        discard;
    }
    ...
}
{% endhighlight %}

Finally, to perform reflections on multiple mirrors that face each other, we require multiple renders (kn^2 renders for n mirrors and k levels of depth). For each mirror, we compute k reflections of the camera, alternating between each camera (thus n^2 renders). The renders to texture must be done backwards, starting with the deepest reflection.

{% highlight javascript %}
// Given mirror1 and mirror2

// After this snippet, these two rendertargets will
// contain the appropriate environment maps
var mirror1Env, mirror2Env;

var tempMirror2Env;
function renderMirror1(cam, depth) {
    var reflectedCamera;
    if (depth % 2 == 0) {
        reflectedCamera = reflect(cam, mirror1);
        mirror1Env = render(reflectedCamera);
    }
    else {
        reflectedCamera = reflect(cam, mirror2);
        tempMirror2Env = render(reflectedCamera);
    }
    if (depth >= 0) {
        renderMIrror(reflectedCamera, depth-1);
    }
}

var tempMirror1Env;
function renderMirror2(cam, depth) {
    // Similar to above, except replacing
    // mirror1Env with mirror2Env
    // tempMirror2Env with tempMirror1Env
}

renderMirror1(camera, 8);
renderMirror2(camera, 8);

render(camera);
{% endhighlight %}
