import { gsap } from 'gsap'

interface TransitionOptions {
  slug: string
  basePath: string
  image: string
  title: string
  meta?: string
  /** Extra key-value pairs to store in sessionStorage */
  extraData?: Record<string, string>
  /** Focal point for the clone's object-position */
  focalPoint?: { x: number; y: number }
}

let isNavigating = false

/** Wait for N animation frames */
function waitFrames(n: number): Promise<void> {
  return new Promise(resolve => {
    let count = 0
    function tick() {
      if (++count >= n) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
}

/** Get responsive hero target rect (matches detail page hero layout) */
function getHeroTargetRect(): { left: number; width: number; top: number; height: number; radius: string } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw <= 768) {
    return { left: 0, width: vw, top: 0, height: vh * 0.35, radius: '0' }
  } else if (vw <= 1024) {
    const margin = 24 // 1.5rem
    return { left: margin, width: vw - margin * 2, top: 0, height: vh * 0.5, radius: '0 0 0.75rem 0.75rem' }
  }
  const margin = 48 // 3rem
  return { left: margin, width: vw - margin * 2, top: 0, height: vh * 0.5, radius: '0 0 0.75rem 0.75rem' }
}

/**
 * Animate a card image to expand and navigate to detail page.
 * Uses GPU-accelerated transform instead of layout properties.
 */
export function animateCardToDetail(event: MouseEvent, options: TransitionOptions, cardSelector: string, imageSelector: string) {
  if (isNavigating) return
  isNavigating = true

  const card = (event.target as HTMLElement).closest(cardSelector) as HTMLElement
  if (!card) {
    ;(window as any).__skipPageTransition = true
    navigateTo(`${options.basePath}/${options.slug}`)
    isNavigating = false
    return
  }

  const img = card.querySelector(imageSelector) as HTMLElement
  if (!img) {
    ;(window as any).__skipPageTransition = true
    navigateTo(`${options.basePath}/${options.slug}`)
    isNavigating = false
    return
  }

  const startRect = img.getBoundingClientRect()
  const target = getHeroTargetRect()

  // Clone the image at its current position
  const clone = img.cloneNode(true) as HTMLElement
  clone.style.cssText = `
    position: fixed;
    top: ${startRect.top}px;
    left: ${startRect.left}px;
    width: ${startRect.width}px;
    height: ${startRect.height}px;
    object-fit: cover;
    z-index: 10001;
    pointer-events: none;
    border-radius: 0.65rem;
    will-change: transform, border-radius;
    transform-origin: top left;
  `
  if (options.focalPoint) {
    clone.style.objectPosition = `${options.focalPoint.x}% ${options.focalPoint.y}%`
  }
  document.body.appendChild(clone)

  // White overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #ffffff;
    z-index: 10000; opacity: 0; pointer-events: none;
  `
  document.body.appendChild(overlay)

  // Store transition data
  sessionStorage.setItem('cardTransitionImage', options.image)
  sessionStorage.setItem('cardTransitionTitle', options.title)
  if (options.meta) sessionStorage.setItem('cardTransitionMeta', options.meta)
  if (options.extraData) {
    for (const [key, value] of Object.entries(options.extraData)) {
      sessionStorage.setItem(key, value)
    }
  }

  // Calculate GPU transform delta
  const dx = target.left - startRect.left
  const dy = target.top - startRect.top
  const sx = target.width / startRect.width
  const sy = target.height / startRect.height

  const tl = gsap.timeline({
    onComplete: () => {
      ;(window as any).__skipPageTransition = true
      navigateTo(`${options.basePath}/${options.slug}`)

      const nuxtApp = useNuxtApp()
      nuxtApp.hooks.hookOnce('page:finish', () => {
        requestAnimationFrame(() => {
          clone.remove()
          overlay.remove()
          isNavigating = false
        })
      })
      setTimeout(() => {
        if (clone.parentNode) { clone.remove(); overlay.remove(); isNavigating = false }
      }, 2000)
    }
  })

  // GPU-accelerated expand: translate + scale instead of top/left/width/height
  tl.to(clone, {
    x: dx,
    y: dy,
    scaleX: sx,
    scaleY: sy,
    borderRadius: target.radius,
    duration: 0.5,
    ease: 'power3.inOut',
    force3D: true,
  }, 0)
  .set(overlay, { opacity: 1 }, 0.45)
}

/**
 * Get stored transition data on detail page
 */
export function getCardTransitionData() {
  const image = sessionStorage.getItem('cardTransitionImage') || ''
  const title = sessionStorage.getItem('cardTransitionTitle') || ''
  const meta = sessionStorage.getItem('cardTransitionMeta') || ''

  sessionStorage.removeItem('cardTransitionImage')
  sessionStorage.removeItem('cardTransitionTitle')
  sessionStorage.removeItem('cardTransitionMeta')

  return { image, title, meta }
}

/**
 * Navigate back with reverse animation.
 * Creates a clone at current hero position, navigates, then playReturnToCardAnimation shrinks it.
 */
export function goBackWithTransition(basePath: string, slug: string, heroImage: string, heroElement?: HTMLElement | null, focalPoint?: { x: number; y: number }) {
  if (isNavigating) return
  isNavigating = true

  sessionStorage.setItem('returnSlug', slug)
  sessionStorage.setItem('returnImage', heroImage)
  if (focalPoint) {
    sessionStorage.setItem('returnFocalX', String(focalPoint.x))
    sessionStorage.setItem('returnFocalY', String(focalPoint.y))
  }

  let cloneTop: string, cloneLeft: string, cloneWidth: string, cloneHeight: string, cloneRadius: string

  if (heroElement) {
    const rect = heroElement.getBoundingClientRect()
    const style = getComputedStyle(heroElement)
    cloneTop = `${rect.top}px`
    cloneLeft = `${rect.left}px`
    cloneWidth = `${rect.width}px`
    cloneHeight = `${rect.height}px`
    cloneRadius = style.borderRadius
  } else {
    const t = getHeroTargetRect()
    cloneTop = `${t.top}px`
    cloneLeft = `${t.left}px`
    cloneWidth = `${t.width}px`
    cloneHeight = `${t.height}px`
    cloneRadius = t.radius
  }

  // White overlay behind clone
  let overlay = document.getElementById('return-transition-overlay')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'return-transition-overlay'
    document.body.appendChild(overlay)
  }
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #ffffff;
    z-index: 10000; opacity: 1; pointer-events: none;
  `

  // Hero image clone
  let clone = document.getElementById('return-transition-clone') as HTMLImageElement
  if (!clone) {
    clone = document.createElement('img')
    clone.id = 'return-transition-clone'
    document.body.appendChild(clone)
  }
  clone.src = heroImage
  const fp = focalPoint ? `object-position: ${focalPoint.x}% ${focalPoint.y}%;` : ''
  clone.style.cssText = `
    position: fixed; top: ${cloneTop}; left: ${cloneLeft};
    width: ${cloneWidth}; height: ${cloneHeight};
    object-fit: cover; z-index: 10001; pointer-events: none;
    border-radius: ${cloneRadius}; will-change: transform, border-radius;
    transform-origin: top left; ${fp}
  `

  ;(window as any).__skipPageTransition = true
  navigateTo(basePath)
  // Don't reset isNavigating — playReturnToCardAnimation will handle it
}

/**
 * On the listing page, play the return animation:
 * clone starts at hero size, GPU-shrinks to the target card, overlay fades out.
 */
export async function playReturnToCardAnimation(
  slug: string,
  imageSrc: string,
  cardSelector: string,
  imageSelector: string,
  slugAttr: string = 'data-slug'
) {
  let clone = document.getElementById('return-transition-clone') as HTMLElement
  let overlay = document.getElementById('return-transition-overlay') as HTMLElement

  const returnFocalX = sessionStorage.getItem('returnFocalX') || '50'
  const returnFocalY = sessionStorage.getItem('returnFocalY') || '50'
  sessionStorage.removeItem('returnFocalX')
  sessionStorage.removeItem('returnFocalY')

  // Fallback: create clone/overlay if not found
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'return-transition-overlay'
    overlay.style.cssText = `
      position: fixed; inset: 0; background: #ffffff;
      z-index: 10000; opacity: 1; pointer-events: none;
    `
    document.body.appendChild(overlay)
  }

  if (!clone) {
    const t = getHeroTargetRect()
    clone = document.createElement('img')
    clone.id = 'return-transition-clone'
    ;(clone as HTMLImageElement).src = imageSrc
    clone.style.cssText = `
      position: fixed; top: ${t.top}px; left: ${t.left}px;
      width: ${t.width}px; height: ${t.height}px;
      object-fit: cover; z-index: 10001; pointer-events: none;
      border-radius: ${t.radius}; will-change: transform, border-radius;
      transform-origin: top left;
      object-position: ${returnFocalX}% ${returnFocalY}%;
    `
    document.body.appendChild(clone)
  }

  // Wait for page layout to settle (replaces 5-deep rAF pyramid)
  await nextTick()
  await waitFrames(2)

  const targetCard = document.querySelector(`${cardSelector}[${slugAttr}="${slug}"]`) as HTMLElement
  let targetImg: HTMLElement | null = null

  if (targetCard) {
    targetImg = targetCard.querySelector(imageSelector) as HTMLElement

    // Scroll card into view (overlay covers the jump)
    const scrollParent = targetCard.closest('[data-lenis-prevent]') as HTMLElement
    if (scrollParent) {
      const cardTop = targetCard.offsetTop
      const containerHeight = scrollParent.clientHeight
      const cardHeight = targetCard.offsetHeight
      scrollParent.scrollTop = cardTop - (containerHeight / 2) + (cardHeight / 2)
    } else {
      const { $lenis } = useNuxtApp()
      if ($lenis) {
        $lenis.scrollTo(targetCard, { offset: -(window.innerHeight / 2) + (targetCard.offsetHeight / 2), immediate: true, force: true })
      }
    }
  }

  // Wait for scroll to settle
  await waitFrames(2)

  const cloneRect = clone.getBoundingClientRect()
  let targetRect: DOMRect

  if (targetImg) {
    targetRect = targetImg.getBoundingClientRect()
  } else {
    const vw = window.innerWidth
    targetRect = new DOMRect(vw / 2 - 150, window.innerHeight / 2 - 100, 300, 200)
  }

  // Calculate GPU transform delta from current clone position to card
  const dx = targetRect.left - cloneRect.left
  const dy = targetRect.top - cloneRect.top
  const sx = targetRect.width / cloneRect.width
  const sy = targetRect.height / cloneRect.height

  const tl = gsap.timeline({
    onComplete: () => {
      clone.remove()
      overlay.remove()
      isNavigating = false
    }
  })

  // Fade overlay to reveal listing
  tl.to(overlay, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.inOut'
  }, 0)

  // GPU-accelerated shrink to card position
  tl.to(clone, {
    x: dx,
    y: dy,
    scaleX: sx,
    scaleY: sy,
    borderRadius: '0.65rem',
    duration: 0.5,
    ease: 'power3.inOut',
    force3D: true,
  }, 0)

  // Fade out clone at the end
  tl.to(clone, {
    opacity: 0,
    duration: 0.15,
    ease: 'power2.in'
  }, 0.45)
}
