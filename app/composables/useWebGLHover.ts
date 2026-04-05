import { Renderer, Program, Mesh, Plane, Texture } from 'ogl'

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uVelo;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Circular mask around mouse
  float circle(vec2 uv, vec2 center, float radius, float border) {
    vec2 d = (uv - center) * uResolution;
    float dist = length(d);
    return smoothstep(radius + border, radius - border, dist);
  }

  // Hash: pseudo-random float from 2D position
  float hash12(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    // RGB Split — chromatic aberration around cursor
    float c = circle(uv, uMouse, 0.0, 0.2);
    vec2 uvR = uv;
    vec2 uvG = uv;
    vec2 uvB = uv;
    uvR += c * (uVelo * 1.5);
    uvG += c * (uVelo * 1.6);
    uvB += c * (uVelo * 1.7);

    float r = texture2D(uTexture, clamp(uvR, 0.0, 1.0)).r;
    float g = texture2D(uTexture, clamp(uvG, 0.0, 1.0)).g;
    float b = texture2D(uTexture, clamp(uvB, 0.0, 1.0)).b;

    vec4 color = vec4(r, g, b, 1.0);

    gl_FragColor = color;
  }
`

export interface WebGLHoverInstance {
  destroy: () => void
}

export function useWebGLHover(
  container: HTMLElement,
  imageSrc: string
): WebGLHoverInstance {
  const renderer = new Renderer({
    alpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2),
  })

  const gl = renderer.gl
  gl.canvas.style.position = 'absolute'
  gl.canvas.style.inset = '0'
  gl.canvas.style.width = '100%'
  gl.canvas.style.height = '100%'
  container.appendChild(gl.canvas)

  const rect = container.getBoundingClientRect()
  renderer.setSize(rect.width, rect.height)

  // Load texture
  const texture = new Texture(gl)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => { texture.image = img }
  img.src = imageSrc

  const geometry = new Plane(gl, { width: 2, height: 2 })
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTexture: { value: texture },
      uMouse: { value: [0.5, 0.5] },
      uVelo: { value: 0 },
      uTime: { value: 0 },
      uResolution: { value: [1.0, rect.height / rect.width] },
    },
  })

  const mesh = new Mesh(gl, { geometry, program })

  // Mouse tracking with velocity
  let mouseX = -1, mouseY = -1
  let prevMouseX = -1, prevMouseY = -1
  let followX = 0.5, followY = 0.5
  let targetVelo = 0, currentVelo = 0
  let raf = 0
  let destroyed = false

  function onMouseMove(e: MouseEvent) {
    const r = container.getBoundingClientRect()
    mouseX = (e.clientX - r.left) / r.width
    mouseY = 1.0 - (e.clientY - r.top) / r.height
  }

  function onMouseEnter(e: MouseEvent) {
    const r = container.getBoundingClientRect()
    mouseX = (e.clientX - r.left) / r.width
    mouseY = 1.0 - (e.clientY - r.top) / r.height
    prevMouseX = mouseX
    prevMouseY = mouseY
    followX = mouseX
    followY = mouseY
  }

  function onMouseLeave() {
    targetVelo = 0
  }

  function onResize() {
    if (destroyed) return
    const r = container.getBoundingClientRect()
    renderer.setSize(r.width, r.height)
    program.uniforms.uResolution.value = [1.0, r.height / r.width]
  }

  container.addEventListener('mousemove', onMouseMove)
  container.addEventListener('mouseenter', onMouseEnter)
  container.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('resize', onResize)

  function animate(time: number) {
    if (destroyed) return
    raf = requestAnimationFrame(animate)

    // Calculate mouse velocity
    if (prevMouseX >= 0) {
      const dx = mouseX - prevMouseX
      const dy = mouseY - prevMouseY
      targetVelo = Math.min(Math.sqrt(dx * dx + dy * dy), 0.05)
    }
    prevMouseX = mouseX
    prevMouseY = mouseY

    // Smooth follow
    followX += (mouseX - followX) * 0.1
    followY += (mouseY - followY) * 0.1
    currentVelo += (targetVelo - currentVelo) * 0.08

    program.uniforms.uMouse.value = [followX, followY]
    program.uniforms.uVelo.value = currentVelo
    program.uniforms.uTime.value = time * 0.001

    renderer.render({ scene: mesh })

    // Decay velocity when not moving
    targetVelo *= 0.92
  }

  raf = requestAnimationFrame(animate)

  return {
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseenter', onMouseEnter)
      container.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
