'use strict';

var vertexShaderSource = `#version 300 es

precision highp float;

in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_matrix;
out vec2 v_texcoord;

void main(){

	gl_Position = u_matrix * a_position;

	v_texcoord = a_texcoord;
}
`;


var fragmentShaderSource = `#version 300 es

precision highp float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main(){

	outColor = texture(u_texture, v_texcoord);

}
`;

function main() {

    console.log("i am here");
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }
    var program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

    var positionAttribLocation = gl.getAttribLocation(program, 'a_position');
    var texcoordAttribLocation = gl.getAttribLocation(program, 'a_texcoord');

    var matrixLocation = gl.getUniformLocation(program, 'u_matrix');

    var positionBuffer = gl.createBuffer();
    var vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl);

    var size = 3;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttribLocation, size, type, normalize, stride, offset);


    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    setTexcoords(gl);
    gl.enableVertexAttribArray(texcoordAttribLocation);


    var size = 2;
    var type = gl.FLOAT;
    var normalize = true;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(texcoordAttribLocation, size, type, normalize, stride, offset);

    // For me : for texture we need to assign active texture before we bind to
    // bind point which is not done in case of buffer.

    var texture = gl.createTexture();

    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0 + 0);

    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
    // asynchronously image load

    var image = new Image();
    requestCORSIfNotSameOrigin(image, "https://webgl2fundamentals.org/webgl/resources/f-texture.png")


    // //-------------------------------------------------------------------------------------------------
    // // there are three values that can be set in crossOrigin - undefined - don't ask permisssion-,
    // // anonymous - ask for permission but don't send extra info- , use-credential- send cookies and other info
    // // that the server might look at to decide wether or not give the permission. All other value is 
    // //set into anonymous. 
    // // -------------------------------------------------------------------------------------------------

    image.src = "https://webgl2fundamentals.org/webgl/resources/f-texture.png";

    image.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);
    var modelXRotationRadians = degToRad(0);
    var modelYRotationRadians = degToRad(0);

    var then = 0;

    requestAnimationFrame(drawScene);


    function drawScene(now) {

        now *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = now - then;
        // Remember the current time for the next frame.
        then = now;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Animate the rotation
        modelXRotationRadians += 1.2 * deltaTime;
        modelYRotationRadians += 0.7 * deltaTime;

        //when you first create a webGL context WebGL set the viewport to match the size of the canvas.
        //when you change the canvas size, you need to tell the new viewport setting.It is one call per frame.
        //It's best time to call is before rendering.
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;


        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        var cameraPosition = [0, 0, 200];
        var up = [0, 1, 0];
        var target = [0, 0, 0];

        // Compute the camera's matrix using look at.
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        var matrix = m4.xRotate(viewProjectionMatrix, modelXRotationRadians);
        matrix = m4.yRotate(matrix, modelYRotationRadians);

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // ---------------------------------
        var primitiveType = gl.TRAINGLES;
        var offset = 0;
        var count = 16 * 6;
        gl.drawArrays(primitiveType, offset, count);

        requestAnimationFrame(drawScene);

    }
}

function setGeometry(gl) {

    var positions = new Float32Array([
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,

        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,

        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,

        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,

        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,

        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,

        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,

        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,

        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,

        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,

        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,

        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,

        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,

        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,

        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,

        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0,
    ]);


    // --------------------------------------------------------

    var matrix = m4.translate(m4.xRotation(Math.PI), -50, -75, -15);
    //var matrix = m4.xRotate(m4.translation(-50, -75, -15), Math.PI);

    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = m4.transformPoint(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
        positions[ii + 0] = vector[0];
        positions[ii + 1] = vector[1];
        positions[ii + 2] = vector[2];
    }

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // --------------------------------------------------------------------

}


function setTexcoords(gl) {
    var textcoord = new Float32Array([
        // left column front
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // top rung front
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // middle rung front
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // left column back
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // top rung back
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // middle rung back
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // top
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // top rung right
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // under top rung
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // between top rung and middle
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // top of middle rung
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // right of middle rung
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // bottom of middle rung.
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // right of bottom
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // bottom
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // left side
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, textcoord, gl.STATIC_DRAW);

}

main();


function requestCORSIfNotSameOrigin(img, url) {
  if ((new URL(url, window.location.href)).origin !== window.location.origin) {
    img.crossOrigin = "";
  }
}
