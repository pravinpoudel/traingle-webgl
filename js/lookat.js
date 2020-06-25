"use strict";

const vertexShader = `#version 300 es

	in vec4 a_position;
	in vec3 a_normal;


	out vec3 v_normal;
	out vec3 v_surfaceToLight;

	uniform mat4 u_matrix;
	uniform mat4 viewProjectionMatrix;
	uniform mat4 u_worldInverseTranspose;
	uniform vec3 u_lightWorldPosition;

	void main(){

		gl_Position = viewProjectionMatrix*a_position;

		v_normal = mat3(u_worldInverseTranspose)*a_normal;

		vec3 surfaceWorldPosition = (u_matrix*a_position).xyz;

		v_surfaceToLight = surfaceWorldPosition - u_lightWorldPosition; 
	}
`;


const fragShader = `#version 300 es

	precision highp float;

	in vec3 v_normal;
	in vec3 v_surfaceToLight;
	out vec4 frag_color;

	uniform vec3 lightDirectionReverse;
	uniform vec4 u_color;

	void main(){
		
		vec3 normal = normalize(v_normal);
		vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
		
		float light = dot(normal, surfaceToLightDirection);

		frag_color = u_color;
		
		frag_color.xyz *= light;

		}
`;

var cameraAngleDegree = 0;
var cameraAngle = 0;
const radius = 100;
var increment = 1;
var numFs = 5;

function main() {

    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    requestAnimationFrame(function() {
        init(gl);
    });
}

function init(gl) {


    const program = webglUtils.createProgramFromSources(gl, [vertexShader, fragShader]);

    const apositionLoc = gl.getAttribLocation(program, 'a_position');
    const anormalLoc = gl.getAttribLocation(program, 'a_normal');
    // const acolorLoc = gl.getAttribLocation(program, 'a_color');
    const umatrixLoc = gl.getUniformLocation(program, 'viewProjectionMatrix');
    const worldMatrixLoc = gl.getUniformLocation(program, 'u_matrix');
    const worldInverseTransposeLocation = gl.getUniformLocation(program, 'worldInverseTranspose');
    const ucolorLoc = gl.getUniformLocation(program, 'u_color');
    const u_lightWorldPositionLocation = gl.getUniformLocation(program, 'u_lightWorldPosition');

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setGeometry(gl);
    gl.enableVertexAttribArray(apositionLoc);

    let size = 3;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(apositionLoc, size, type, normalize, stride, offset);


    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    setNormals(gl);
    gl.enableVertexAttribArray(anormalLoc);
    size = 3;
    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(anormalLoc, size, type, normalize, stride, offset);

    // let colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // setColor(gl);
    // gl.enableVertexAttribArray(acolorLoc);

    // size = 3;
    // type = gl.UNSIGNED_BYTE;
    // normalize = true;
    // stride = 0;
    // offset = 0;
    // gl.vertexAttribPointer(acolorLoc, size, type, normalize, stride, offset);

    let fov = degreeToRadian(60);
    cameraAngle = degreeToRadian(cameraAngleDegree);

    function degreeToRadian(deg) {
        return deg * Math.PI / 180;
    }

    function radToDegree(rad) {
        return rad * (180) / Math.PI;
    }

    drawScene();

    // webglLessonsUI.setupSlider("#cameraAngle", { value: radToDegree(cameraAngle), slide: updateCameraAngle, min: -360, max: 360 });

    // function updateCameraAngle(event, ui) {
    //     cameraAngle = degreeToRadian(ui.value);
    //     drawScene();
    // }


    function drawScene() {

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);

        gl.enable(gl.DEPTH_TEST);

        gl.useProgram(program);

        gl.uniform4fv(ucolorLoc, [0.2, 1, 0.2, 1]);

        gl.uniform3fv(u_lightWorldPositionLocation, [20, 30, 50]);

        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

        let projection = m4.perspective(fov, aspect, 1, 1000);

        const fPosition = [radius, 0, 0];

        cameraAngleDegree += increment;

        cameraAngle = degreeToRadian(cameraAngleDegree);

        let worldMatrix = m4.yRotation(cameraAngle);

        let worldInverse = m4.inverse(worldMatrix);
        let worldInverseTranspose = m4.transpose(worldInverse);
        gl.uniformMatrix3fv(worldInverseTransposeLocation, false ,worldInverseTranspose);

        gl.uniformMatrix4fv(worldMatrixLoc, false, worldMatrix);

        let camera = m4.yRotation(0);

        camera = m4.translate(camera, 0, 100, 300);

        let cameraPosition = [camera[12], camera[13], camera[14]];

        // let up = [0, 1, 0];

        // camera = m4.lookAt(cameraPosition, fPosition, up);

        let viewMatrix = m4.inverse(camera);

        let viewProjection = m4.multiply(projection, viewMatrix);

        viewProjection = m4.multiply(viewProjection, worldMatrix);


        for (var ii = 0; ii < numFs; ++ii) {
            var angle = ii * Math.PI * 2 / numFs;

            var x = Math.cos(angle) * radius -50;
            var z = Math.sin(angle) * radius -15;
            var matrix = m4.translate(viewProjection, x, 0, z);

            // Set the matrix.
            gl.uniformMatrix4fv(umatrixLoc, false, matrix);

            // Draw the geometry.
            var primitiveType = gl.TRIANGLES;
            var offset = 0;
            var count = 16 * 6;
            gl.drawArrays(primitiveType, offset, count);
        }

        requestAnimationFrame(function() {
            init(gl)
        });

    }
}


function setNormals(gl) {
    var normals = new Float32Array([
        // left column front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // top rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // middle rung front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // left column back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // middle rung back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // top rung right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // under top rung
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // between top rung and middle
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top of middle rung
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // right of middle rung
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom of middle rung.
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // right of bottom
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        // left side
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
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

    var matrix = m4.xRotation(Math.PI);
    matrix = m4.translate(matrix, -50, -75, -15);

    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = m4.transformVector(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
        positions[ii + 0] = vector[0];
        positions[ii + 1] = vector[1];
        positions[ii + 2] = vector[2];
    }

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function setColor(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            // left column front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // top rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // middle rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // left column back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // middle rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,

            // top rung right
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,

            // under top rung
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,

            // between top rung and middle
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,

            // top of middle rung
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,

            // right of middle rung
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,

            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,

            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,

            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,

            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
        ]),
        gl.STATIC_DRAW);
}

main();