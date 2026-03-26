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

  // Clone the image
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

  // Store transition data
  sessionStorage.setItem('cardTransitionImage', options.image)
  sessionStorage.setItem('cardTransitionTitle', options.title)
  if (options.meta) sessionStorage.setItem('cardTransitionMeta', options.meta)

  const tl = gsap.timeline({
    onComplete: () => {
      ;(window as any).__skipPageTransition = true
      navigateTo(`${options.basePath}/${options.slug}`)

      setTimeout(() => {
        clone.remove()
        overlay.remove()
        isNavigating = false
      }, 100)
    }
  })

  tl.to(overlay, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.inOut'
  })
  .to(clone, {
    top: 0,
    left: '3rem',
    width: 'calc(100vw - 6rem)',
    height: '35vh',
    borderRadius: '0 0 0.75rem 0.75rem',
    duration: 0.5,
    ease: 'power3.inOut'
  }, 0)
}

/**
 * Get stored transition data on detail page
 */
export function getCardTransitionData() {
  const image = sessionStorage.getItem('cardTransitionImage') || ''
  const title = sessionStorage.getItem('cardTransitionTitle') || ''
  const meta = sessionStorage.getItem('cardTransitionMeta') || ''

  // Clean up
  sessionStorage.removeItem('cardTransitionImage')
  sessionStorage.removeItem('cardTransitionTitle')
  sessionStorage.removeItem('cardTransitionMeta')

  return { image, title, meta }
}

/**
 * Navigate back with reverse animation
 */
export function goBackWithTransition(basePath: string, slug: string, heroImage: string) {
  sessionStorage.setItem('returnSlug', slug)
  sessionStorage.setItem('returnImage', heroImage)
  sessionStorage.setItem('returnBasePath', basePath)

  ;(window as any).__skipPageTransition = true
  navigateTo(basePath)
}
