import { Renderer, Program, Mesh, Plane, Texture } from 'ogl'
import { gsap } from 'gsap'

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
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex noise (simplified 3D)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.05;
    float progress = uProgress;

    // Noise-based distortion
    float offX = uv.x + sin(uv.y + time * 2.0);
    float offY = uv.y - time * 0.2 - cos(time * 2.0) * 0.1;
    float nc = snoise(vec3(offX, offY, time * 0.5) * 8.0) * progress;

    // UV distortion based on progress
    vec2 distortedUv = uv;
    distortedUv -= 0.5;
    distortedUv *= 1.0 - progress * 0.15;
    distortedUv += 0.5;

    // Add noise displacement
    distortedUv += nc * 0.03 * progress;
    distortedUv = clamp(distortedUv, 0.0, 1.0);

    // RGB split during transition
    float split = progress * 0.02;
    float r = texture2D(uTexture, distortedUv + vec2(split, 0.0)).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - vec2(split, 0.0)).b;

    // Edge glow
    float glow = progress * 0.1 * (1.0 - smoothstep(0.0, 0.3, length(uv - 0.5)));

    gl_FragColor = vec4(r + glow, g + glow, b + glow, 1.0);
  }
`

export interface GooeyTransitionInstance {
  canvas: HTMLCanvasElement
  animateIn: () => gsap.core.Timeline
  animateOut: () => gsap.core.Timeline
  destroy: () => void
}

export function createGooeyTransition(imageSrc: string): Promise<GooeyTransitionInstance> {
  return new Promise((resolve) => {
    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio, 2),
    })

    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.pointerEvents = 'none'

    const texture = new Texture(gl)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      texture.image = img
      resolve(instance)
    }
    // Fallback if image doesn't load
    setTimeout(() => resolve(instance), 1000)
    img.src = imageSrc

    const geometry = new Plane(gl, { width: 2, height: 2 })
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTexture: { value: texture },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: [1, 1] },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    let raf = 0
    let destroyed = false

    function animate(time: number) {
      if (destroyed) return
      raf = requestAnimationFrame(animate)
      program.uniforms.uTime.value = time * 0.001
      renderer.render({ scene: mesh })
    }

    function resize(w: number, h: number) {
      renderer.setSize(w, h)
      program.uniforms.uResolution.value = [w, h]
    }

    const instance: GooeyTransitionInstance = {
      canvas,
      animateIn() {
        raf = requestAnimationFrame(animate)
        return gsap.timeline().to(program.uniforms.uProgress, {
          value: 1,
          duration: 0.6,
          ease: 'power2.inOut',
        })
      },
      animateOut() {
        return gsap.timeline().to(program.uniforms.uProgress, {
          value: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        })
      },
      destroy() {
        destroyed = true
        cancelAnimationFrame(raf)
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      },
    }

    // Expose resize
    ;(instance as any).resize = resize
  })
}
