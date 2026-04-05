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
  uniform float uHover;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Distance from mouse
    vec2 mouse = uMouse;
    float dist = distance(uv, mouse);

    // Ripple displacement on hover
    float strength = uHover * 0.04;
    float radius = 0.35;
    float ripple = smoothstep(radius, 0.0, dist);

    // Chromatic-style displacement
    float angle = atan(uv.y - mouse.y, uv.x - mouse.x);
    vec2 offset = vec2(cos(angle), sin(angle)) * ripple * strength;

    // Slight wave
    offset += vec2(
      sin(uv.y * 12.0 + uTime * 2.0) * ripple * strength * 0.3,
      cos(uv.x * 12.0 + uTime * 2.0) * ripple * strength * 0.3
    );

    vec4 color = texture2D(uTexture, uv + offset);

    // Subtle brightness boost on hover area
    color.rgb += ripple * uHover * 0.06;

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

  const { width, height } = container.getBoundingClientRect()
  renderer.setSize(width, height)

  // Load texture
  const texture = new Texture(gl)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    texture.image = img
  }
  img.src = imageSrc

  const geometry = new Plane(gl, { width: 2, height: 2 })
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTexture: { value: texture },
      uMouse: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uResolution: { value: [width, height] },
    },
  })

  const mesh = new Mesh(gl, { geometry, program })

  // State
  let targetHover = 0
  let currentHover = 0
  let mouseX = 0.5
  let mouseY = 0.5
  let currentMouseX = 0.5
  let currentMouseY = 0.5
  let raf = 0
  let destroyed = false

  function onMouseMove(e: MouseEvent) {
    const rect = container.getBoundingClientRect()
    mouseX = (e.clientX - rect.left) / rect.width
    mouseY = 1.0 - (e.clientY - rect.top) / rect.height
  }

  function onMouseEnter() {
    targetHover = 1
  }

  function onMouseLeave() {
    targetHover = 0
  }

  function onResize() {
    if (destroyed) return
    const { width, height } = container.getBoundingClientRect()
    renderer.setSize(width, height)
    program.uniforms.uResolution.value = [width, height]
  }

  container.addEventListener('mousemove', onMouseMove)
  container.addEventListener('mouseenter', onMouseEnter)
  container.addEventListener('mouseleave', onMouseLeave)
  window.addEventListener('resize', onResize)

  function animate(time: number) {
    if (destroyed) return
    raf = requestAnimationFrame(animate)

    // Smooth interpolation
    currentHover += (targetHover - currentHover) * 0.06
    currentMouseX += (mouseX - currentMouseX) * 0.08
    currentMouseY += (mouseY - currentMouseY) * 0.08

    program.uniforms.uHover.value = currentHover
    program.uniforms.uMouse.value = [currentMouseX, currentMouseY]
    program.uniforms.uTime.value = time * 0.001

    renderer.render({ scene: mesh })
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
      if (gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
