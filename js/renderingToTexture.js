const targetTextureWidth = 256;
const targetTextureHeight = 256;
const targetTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, targetTexture);

{
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, LEVEL, internalFormat,
    			  targetTextureWidth, targetTextureHeight, border,
    			  format, type, data);

const fb = gl.createFrameBuffer();
gl.bindFrameBuffer(gl.FRAMEBUFFER, fb);
const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);



}



