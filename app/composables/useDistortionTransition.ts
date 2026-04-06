/**
 * Gooey distortion transition + hover effect using SVG filters + CSS.
 * No WebGL, no CORS issues. Works with any image source.
 *
 * Transition: organic blob reveal expanding from center.
 * Hover: next image revealed through a gooey circle following the mouse
 * (inspired by codrops "Cities & Skylines" gooey effect).
 */

import { gsap } from 'gsap'

interface DistortionInstance {
  container: HTMLElement
  svgFilter: SVGElement
  overlayImg: HTMLImageElement
  hoverImg: HTMLImageElement
  displacementMap: Element
  blur: Element
  hoverDisplacement: Element
  hoverBlur: Element
  isHovering: boolean
  isTransitioning: boolean
  destroy: () => void
}

let filterIdCounter = 0

export function createDistortionTransition(container: HTMLElement): DistortionInstance | null {
  try {
    container.style.position = 'relative'
    container.style.overflow = 'hidden'

    const id = ++filterIdCounter
    const transitionFilterId = `gooey-transition-${id}`
    const hoverFilterId = `gooey-hover-${id}`

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    svg.innerHTML = `
      <defs>
        <filter id="${transitionFilterId}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="0"/>
        </filter>
        <filter id="${hoverFilterId}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="0"/>
        </filter>
      </defs>
    `
    container.appendChild(svg)

    // Overlay for click transitions
    const overlayImg = document.createElement('img')
    overlayImg.style.cssText = `
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; z-index: 3; pointer-events: none;
      clip-path: circle(0% at 50% 50%);
      filter: url(#${transitionFilterId});
    `
    container.appendChild(overlayImg)

    // Hover reveal image (follows mouse)
    const hoverImg = document.createElement('img')
    hoverImg.style.cssText = `
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; z-index: 2; pointer-events: none;
      clip-path: circle(0% at 50% 50%);
      filter: url(#${hoverFilterId});
      opacity: 0;
    `
    container.appendChild(hoverImg)

    const transitionFilter = svg.querySelector(`#${transitionFilterId}`)!
    const hoverFilter = svg.querySelector(`#${hoverFilterId}`)!

    return {
      container,
      svgFilter: svg,
      overlayImg,
      hoverImg,
      displacementMap: transitionFilter.querySelector('feDisplacementMap')!,
      blur: transitionFilter.querySelector('feGaussianBlur')!,
      hoverDisplacement: hoverFilter.querySelector('feDisplacementMap')!,
      hoverBlur: hoverFilter.querySelector('feGaussianBlur')!,
      isHovering: false,
      isTransitioning: false,
      destroy: () => { svg.remove(); overlayImg.remove(); hoverImg.remove() }
    }
  } catch { return null }
}

// ── HOVER EFFECT (mouse-following gooey blob) ──

export function startHover(instance: DistortionInstance, nextSrc: string) {
  if (instance.isTransitioning) return
  instance.isHovering = true
  instance.hoverImg.src = nextSrc
  instance.hoverImg.style.opacity = '1'

  gsap.to(instance, {
    duration: 0.5,
    ease: 'power2.out',
    onUpdate: function () {
      // Animate displacement in
      const p = this.progress()
      instance.hoverDisplacement.setAttribute('scale', String(p * 40))
      instance.hoverBlur.setAttribute('stdDeviation', String(p * 2))
    }
  })
}

export function moveHover(instance: DistortionInstance, x: number, y: number) {
  if (!instance.isHovering || instance.isTransitioning) return

  const rect = instance.container.getBoundingClientRect()
  const px = ((x - rect.left) / rect.width) * 100
  const py = ((y - rect.top) / rect.height) * 100

  // Smooth circle follow with GSAP
  gsap.to(instance.hoverImg, {
    clipPath: `circle(12% at ${px}% ${py}%)`,
    duration: 0.4,
    ease: 'power2.out',
    overwrite: 'auto'
  })
}

export function endHover(instance: DistortionInstance) {
  if (!instance.isHovering) return
  instance.isHovering = false

  // Shrink the hover circle back to 0
  gsap.to(instance.hoverImg, {
    clipPath: `circle(0% at 50% 50%)`,
    duration: 0.4,
    ease: 'power2.inOut',
    onComplete: () => {
      instance.hoverImg.style.opacity = '0'
      instance.hoverDisplacement.setAttribute('scale', '0')
      instance.hoverBlur.setAttribute('stdDeviation', '0')
    }
  })
}

// ── CLICK TRANSITION (full reveal) ──

export async function playDistortionTransition(
  instance: DistortionInstance,
  _fromSrc: string,
  toSrc: string,
  duration: number = 900
): Promise<void> {
  // Kill any hover animation
  instance.isTransitioning = true
  instance.isHovering = false
  instance.hoverImg.style.opacity = '0'
  instance.hoverImg.style.clipPath = 'circle(0% at 50% 50%)'

  instance.overlayImg.src = toSrc

  await new Promise<void>((resolve) => {
    if (instance.overlayImg.complete) return resolve()
    instance.overlayImg.onload = () => resolve()
    instance.overlayImg.onerror = () => resolve()
  })

  return new Promise<void>((resolve) => {
    const proxy = { progress: 0 }

    gsap.to(proxy, {
      progress: 1,
      duration: duration / 1000,
      ease: 'power2.inOut',
      onUpdate: () => {
        const p = proxy.progress

        // Diagonal wipe: polygon sweeps from top-left to bottom-right
        // with extra overshoot so the entire image is revealed
        const sweep = p * 200 // 0 → 200 (oversized to cover corners)
        const offset = 30 // how far the diagonal edge extends

        instance.overlayImg.style.clipPath = `polygon(
          0% 0%,
          ${sweep}% 0%,
          ${sweep - offset}% 100%,
          0% 100%
        )`

        // Displacement peaks mid-transition for gooey organic edge
        const disp = Math.sin(p * Math.PI) * 60
        instance.displacementMap.setAttribute('scale', String(disp))

        // Blur peaks mid-transition for softness
        const bl = Math.sin(p * Math.PI) * 4
        instance.blur.setAttribute('stdDeviation', String(bl))
      },
      onComplete: () => {
        instance.displacementMap.setAttribute('scale', '0')
        instance.blur.setAttribute('stdDeviation', '0')
        instance.overlayImg.style.clipPath = 'circle(0% at 50% 50%)'
        instance.isTransitioning = false
        resolve()
      }
    })
  })
}
