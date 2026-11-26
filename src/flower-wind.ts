// Render the existing photograph with a periodic, coral-only petal displacement.
// Used by the local media exporter; the website plays the resulting silent clip.
export const FLOWER_LOOP_SECONDS = 12;

export function createFlowerWindRenderer(canvas: HTMLCanvasElement, photo: HTMLImageElement) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('WebGL is unavailable for the local flower renderer.');
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() { uv = (position + 1.0) * 0.5; gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragment = `
    precision highp float;
    uniform sampler2D photo;
    uniform vec2 pixels;
    uniform float phase;
    varying vec2 uv;
    float coral(vec3 color) {
      return smoothstep(0.025, 0.18, color.r - max(color.g, color.b)) * smoothstep(0.16, 0.4, color.r);
    }
    void main() {
      vec3 original = texture2D(photo, uv).rgb;
      vec2 relative = uv - vec2(0.67, 0.50);
      float flexible = smoothstep(0.025, 0.24, length(relative * vec2(1.0, 0.8)));
      float breeze = sin(phase);
      float flutter = sin(phase * 2.0);
      float ripple = sin(phase * 3.0);
      vec2 wind;
      // Visible but gentle: about 2% of the frame width at the petal tips.
      wind.x = (24.0 * breeze + 6.0 * flutter * cos(relative.y * 11.0)) * flexible;
      wind.y = (11.0 * breeze * sin(relative.x * 8.0) + 4.0 * ripple * cos(relative.y * 9.0)) * flexible;
      vec2 offset = wind / pixels;
      vec3 moved = texture2D(photo, clamp(uv + offset, 0.0, 1.0)).rgb;
      float petal = max(coral(original), coral(moved));
      gl_FragColor = vec4(mix(original, moved, petal), 1.0);
    }
  `;
  function compile(type: number, source: string) {
    const shader = gl!.createShader(type)!;
    gl!.shaderSource(shader, source); gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) || 'Flower shader failed.');
    return shader;
  }
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Flower program failed.');
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, photo);
  gl.uniform1i(gl.getUniformLocation(program, 'photo'), 0);
  gl.uniform2f(gl.getUniformLocation(program, 'pixels'), photo.naturalWidth, photo.naturalHeight);
  const phase = gl.getUniformLocation(program, 'phase');
  function draw(seconds: number) {
    gl!.viewport(0, 0, canvas.width, canvas.height);
    const cycle = (seconds % FLOWER_LOOP_SECONDS) / FLOWER_LOOP_SECONDS;
    gl!.uniform1f(phase, cycle * Math.PI * 2);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6); gl!.finish();
  }
  function readPixels() {
    const bytes = new Uint8Array(canvas.width * canvas.height * 4);
    gl!.readPixels(0, 0, canvas.width, canvas.height, gl!.RGBA, gl!.UNSIGNED_BYTE, bytes);
    return bytes;
  }
  return { draw, readPixels, destroy() { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); } };
}
