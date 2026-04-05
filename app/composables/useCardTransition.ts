import { gsap } from 'gsap'

interface TransitionOptions {
  slug: string
  basePath: string
  image: string
  title: string
  meta?: string
}

let isNavigating = false

/**
 * Animate a card image to expand and navigate to detail page
 * Uses WebGL gooey shader effect during the transition
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

  const imgRect = img.getBoundingClientRect()

  // Store transition data early
  sessionStorage.setItem('cardTransitionImage', options.image)
  sessionStorage.setItem('cardTransitionTitle', options.title)
  if (options.meta) sessionStorage.setItem('cardTransitionMeta', options.meta)

  // White overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: #ffffff;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
  `
  document.body.appendChild(overlay)

  // Try WebGL gooey transition
  const useWebGL = !window.matchMedia('(hover: none)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (useWebGL) {
    import('~/composables/useGooeyTransition').then(({ createGooeyTransition }) => {
      createGooeyTransition(options.image).then((gooey) => {
        // Position canvas at card location
        const canvas = gooey.canvas
        canvas.style.cssText = `
          position: fixed;
          top: ${imgRect.top}px;
          left: ${imgRect.left}px;
          width: ${imgRect.width}px;
          height: ${imgRect.height}px;
          z-index: 10001;
          pointer-events: none;
          border-radius: 0.65rem;
          object-fit: cover;
        `
        document.body.appendChild(canvas)
        ;(gooey as any).resize(imgRect.width * window.devicePixelRatio, imgRect.height * window.devicePixelRatio)

        // Calculate target
        const vw = window.innerWidth
        let targetLeft: string, targetWidth: string, targetRadius: string
        if (vw <= 768) {
          targetLeft = '0px'; targetWidth = '100vw'; targetRadius = '0'
        } else if (vw <= 1024) {
          targetLeft = '1.5rem'; targetWidth = 'calc(100vw - 3rem)'; targetRadius = '0 0 0.75rem 0.75rem'
        } else {
          targetLeft = '3rem'; targetWidth = 'calc(100vw - 6rem)'; targetRadius = '0 0 0.75rem 0.75rem'
        }

        const tl = gsap.timeline({
          onComplete: () => {
            ;(window as any).__skipPageTransition = true
            navigateTo(`${options.basePath}/${options.slug}`)

            const nuxtApp = useNuxtApp()
            const cleanup = () => {
              requestAnimationFrame(() => {
                gooey.destroy()
                overlay.remove()
                isNavigating = false
              })
            }
            nuxtApp.hooks.hookOnce('page:finish', cleanup)
            setTimeout(() => { if (canvas.parentNode) { gooey.destroy(); overlay.remove(); isNavigating = false } }, 2000)
          }
        })

        // Shader effect starts immediately
        gooey.animateIn()

        // Overlay fades in
        tl.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.inOut' })

        // Canvas scales to hero size
        tl.to(canvas, {
          top: 0,
          left: targetLeft,
          width: targetWidth,
          height: '50vh',
          borderRadius: targetRadius,
          duration: 0.6,
          ease: 'expo.inOut',
          onUpdate: () => {
            const r = canvas.getBoundingClientRect()
            ;(gooey as any).resize(r.width * window.devicePixelRatio, r.height * window.devicePixelRatio)
          }
        }, 0)
      })
    }).catch(() => {
      // Fallback to plain animation
      fallbackAnimation(img, imgRect, overlay, options)
    })
  } else {
    fallbackAnimation(img, imgRect, overlay, options)
  }
}

function fallbackAnimation(img: HTMLElement, imgRect: DOMRect, overlay: HTMLElement, options: TransitionOptions) {
  const clone = img.cloneNode(true) as HTMLElement
  clone.style.cssText = `
    position: fixed;
    top: ${imgRect.top}px;
    left: ${imgRect.left}px;
    width: ${imgRect.width}px;
    height: ${imgRect.height}px;
    object-fit: cover;
    z-index: 10001;
    pointer-events: none;
    border-radius: 0.65rem;
  `
  document.body.appendChild(clone)

  const vw = window.innerWidth
  let targetLeft: string, targetWidth: string, targetRadius: string
  if (vw <= 768) {
    targetLeft = '0px'; targetWidth = '100vw'; targetRadius = '0'
  } else if (vw <= 1024) {
    targetLeft = '1.5rem'; targetWidth = 'calc(100vw - 3rem)'; targetRadius = '0 0 0.75rem 0.75rem'
  } else {
    targetLeft = '3rem'; targetWidth = 'calc(100vw - 6rem)'; targetRadius = '0 0 0.75rem 0.75rem'
  }

  const tl = gsap.timeline({
    onComplete: () => {
      ;(window as any).__skipPageTransition = true
      navigateTo(`${options.basePath}/${options.slug}`)

      const nuxtApp = useNuxtApp()
      const removeClone = () => {
        requestAnimationFrame(() => { clone.remove(); overlay.remove(); isNavigating = false })
      }
      nuxtApp.hooks.hookOnce('page:finish', removeClone)
      setTimeout(() => { if (clone.parentNode) { clone.remove(); overlay.remove(); isNavigating = false } }, 2000)
    }
  })

  tl.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.inOut' })
  tl.to(clone, {
    top: 0, left: targetLeft, width: targetWidth, height: '50vh',
    borderRadius: targetRadius, duration: 0.5, ease: 'power3.inOut'
  }, 0)
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
 * Navigate back with reverse animation
 */
export function goBackWithTransition(basePath: string, slug: string, heroImage: string) {
  if (isNavigating) return
  isNavigating = true
  sessionStorage.setItem('returnSlug', slug)
  sessionStorage.setItem('returnImage', heroImage)
  ;(window as any).__skipPageTransition = true
  navigateTo(basePath)
  isNavigating = false
}

/**
 * On the listing page, play the return animation
 */
export function playReturnToCardAnimation(
  slug: string,
  imageSrc: string,
  cardSelector: string,
  imageSelector: string,
  slugAttr: string = 'data-slug'
) {
  const vw = window.innerWidth
  let heroLeft: string, heroWidth: string, heroRadius: string
  if (vw <= 768) {
    heroLeft = '0px'; heroWidth = '100vw'; heroRadius = '0'
  } else if (vw <= 1024) {
    heroLeft = '1.5rem'; heroWidth = 'calc(100vw - 3rem)'; heroRadius = '0 0 0.75rem 0.75rem'
  } else {
    heroLeft = '3rem'; heroWidth = 'calc(100vw - 6rem)'; heroRadius = '0 0 0.75rem 0.75rem'
  }

  const clone = document.createElement('img')
  clone.src = imageSrc
  clone.style.cssText = `
    position: fixed; top: 0; left: ${heroLeft}; width: ${heroWidth}; height: 50vh;
    object-fit: cover; z-index: 10001; pointer-events: none; border-radius: ${heroRadius};
  `
  document.body.appendChild(clone)

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; background: #ffffff; z-index: 10000; opacity: 1; pointer-events: none;
  `
  document.body.appendChild(overlay)

  requestAnimationFrame(() => {
    const targetCard = document.querySelector(`${cardSelector}[${slugAttr}="${slug}"]`) as HTMLElement
    let targetImg: HTMLElement | null = null
    if (targetCard) {
      targetImg = targetCard.querySelector(imageSelector) as HTMLElement
      const cardRect = targetCard.getBoundingClientRect()
      if (cardRect.top < 0 || cardRect.bottom > window.innerHeight) {
        targetCard.scrollIntoView({ block: 'center' })
      }
    }

    requestAnimationFrame(() => {
      let targetRect: DOMRect
      if (targetImg) {
        targetRect = targetImg.getBoundingClientRect()
      } else {
        targetRect = new DOMRect(vw / 2 - 150, window.innerHeight / 2 - 100, 300, 200)
      }

      const tl = gsap.timeline({ onComplete: () => { clone.remove(); overlay.remove() } })
      tl.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.inOut' })
      tl.to(clone, {
        top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height,
        borderRadius: '0.65rem', duration: 0.5, ease: 'power3.inOut'
      }, 0)
      tl.to(clone, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.45)
    })
  })
}
