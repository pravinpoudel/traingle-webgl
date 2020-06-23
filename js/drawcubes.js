'use strict';


var vsGLSL = `#version 300 es
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 projection;
uniform mat4 ;
modelView
out vec3 v_normal;
out vec2 v_texcoord;

void main(){
	gl_Position = projection*modelView*position;
	v_normal = mat3(modelView)*normal;
	v_texcoord = texcoord;
}
`;


const fsGLSL = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_texcoord;

uniform sampler2D diffuse;
uniform sampler2D decal;
uniform vec4 diffuseMult;
uniform vec3 lightDir;

out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, lightDir) * 0.5 + 0.5;
    vec4 color = texture(diffuse, v_texcoord) * diffuseMult;
    vec4 decalColor = texture(decal, v_texcoord);
    decalColor.rgb *= decalColor.a;
    color = color * (1.0 - decalColor.a) + decalColor; 
    outColor = vec4(color.rgb * light, color.a);
}
`;

function main() {

    var canvas = document.querySelector("#canvas");
    var gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }

    const makeTextCanvas = (text, width, height, color) => {
        const context = document.createElement('canvas').getContext('2d')
        context.canvas.width = width
        context.canvas.height = height
        context.font = `bold ${height * 5/6 | 0}px sans-serif`
        context.font = '48px serif'
        context.textAlign = 'center'
        context.baseAlign = 'middle'
        context.fillStyle = color
        context.fillText(text, width / 2, height / 2);
        return context.canvas
    }

    var program = webglUtils.createProgramFromSources(gl, [vsGLSL, fsGLSL]);
    const positionLoc = gl.getAttribLocation(program, 'position');
    const normalLoc = gl.getAttribLocation(program, 'normal');
    const texcoordLoc = gl.getAttribLocation(program, 'texcoord');
    const projectionLoc = gl.getUniformLocation(program, 'projection');
    const modelViewLoc = gl.getUniformLocation(program, 'modelView');
    const diffuseLoc = gl.getUniformLocation(program, 'diffuse');
    const decalLoc = gl.getUniformLocation(program, 'decal');
    const diffuseMultLoc = gl.getUniformLocation(program, 'diffuseMult');
    const lightDirLoc = gl.getUniformLocation(program, 'lightDir');

    const cubeVertexPositions = new Float32Array([
        1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1,
    ]);

    const cubeVertexNormals = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    ]);

    const cubeVertexTexcoord = new Float32Array([
        1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
    ]);

    const cubeVertexIndices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,

    ], );

    const cubeVertexArray = gl.createVertexArray();
    gl.bindVertexArray(cubeVertexArray);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexPositions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexNormals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(
        normalLoc,
        3,
        gl.FLOAT,
        false,
        0,
        0
    );

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexTexcoord, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texcoordLoc);
    gl.vertexAttribPointer(
        texcoordLoc,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    const checkerTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, checkerTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0, //mipmap
        gl.LUMINANCE, //internal format
        4, //width
        4, //height
        0, //border
        gl.LUMINANCE, //format
        gl.UNSIGNED_BYTE,
        new Uint8Array([
            192, 128, 192, 128,
            128, 192, 128, 192,
            192, 128, 192, 128,
            128, 192, 128, 192
        ])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const decalTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, decalTexture);
    let text = makeTextCanvas('F', 32, 32, 'red');
    console.log(text)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        text);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.5, 0.7, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.useProgram(program);
    gl.bindVertexArray(cubeVertexArray);

    let texUnit = 6;
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, checkerTexture);
    gl.uniform1i(diffuseLoc, texUnit);

    texUnit = 3;
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, decalTexture);
    gl.uniform1i(decalLoc, texUnit);

    gl.uniform3fv(lightDirLoc, m4.normalize([1, 5, 8]));

    let fov =  60 * Math.PI / 180;
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;    
    const projection = m4.perspective(fov, aspect, 0.1, 10);
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    let modelView = m4.identity();
    modelView = m4.translate(modelView, 0, 0, -4);
    modelView = m4.xRotate(modelView, 0.5);
    modelView = m4.yRotate(modelView, 0.5);
    gl.uniformMatrix4fv(modelViewLoc, false, modelView);
    gl.uniform4fv(diffuseMultLoc, [0.7, 1, 0.7, 1]);
    gl.drawElements( gl.TRIANGLES, 36, gl.UNSIGNED_SHORT,0,);

    modelView = m4.identity();
    modelView = m4.translate(modelView, -3, 0, -4);
    modelView = m4.xRotate(modelView, 0.5);
    modelView = m4.yRotate(modelView, 0.8);
    gl.uniformMatrix4fv(modelViewLoc, false, modelView);
    gl.uniform4fv(diffuseMultLoc, [1, 0.7, 0.7, 1]);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    modelView = m4.identity();
    modelView = m4.translate(modelView, 3, 0, -4);
    modelView = m4.xRotate(modelView, 0.6);
    modelView = m4.yRotate(modelView, -0.6);
    gl.uniformMatrix4fv(modelViewLoc, false, modelView);
    gl.uniform4fv(diffuseMultLoc, [0.7, 0.7, 0.7, 1]);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

main();