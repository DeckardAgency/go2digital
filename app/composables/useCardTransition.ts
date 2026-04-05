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

      // Keep clone visible until new page renders to prevent flash
      // page:finish fires after Suspense resolves, then we can safely remove
      const nuxtApp = useNuxtApp()
      const removeClone = () => {
        // Small delay for the new page's image to render
        requestAnimationFrame(() => {
          clone.remove()
          overlay.remove()
          isNavigating = false
        })
      }

      // Listen for page:finish (Suspense resolved, new page rendered)
      nuxtApp.hooks.hookOnce('page:finish', removeClone)

      // Fallback: remove after 2s if page:finish never fires
      setTimeout(() => {
        if (clone.parentNode) {
          clone.remove()
          overlay.remove()
          isNavigating = false
        }
      }, 2000)
    }
  })

  // Calculate responsive target dimensions to match detail page hero exactly
  const vw = window.innerWidth
  let targetLeft: string
  let targetWidth: string
  let targetRadius: string

  if (vw <= 768) {
    // Mobile: no margin, no border-radius (matches .lab-detail__hero @include mobile)
    targetLeft = '0px'
    targetWidth = '100vw'
    targetRadius = '0'
  } else if (vw <= 1024) {
    // Tablet: margin 1.5rem each side (matches $spacing-lg)
    targetLeft = '1.5rem'
    targetWidth = 'calc(100vw - 3rem)'
    targetRadius = '0 0 0.75rem 0.75rem'
  } else {
    // Desktop: margin 3rem each side (matches $spacing-2xl)
    targetLeft = '3rem'
    targetWidth = 'calc(100vw - 6rem)'
    targetRadius = '0 0 0.75rem 0.75rem'
  }

  tl.to(overlay, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.inOut'
  })
  .to(clone, {
    top: 0,
    left: targetLeft,
    width: targetWidth,
    height: '50vh', // matches .lab-detail__hero height exactly
    borderRadius: targetRadius,
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
 * Navigate back with reverse animation.
 * Stores slug + image in sessionStorage so the listing page can animate
 * the clone from hero size down to the exact target card position.
 */
export function goBackWithTransition(basePath: string, slug: string, heroImage: string) {
  if (isNavigating) return
  isNavigating = true

  // Store return data for the listing page to consume
  sessionStorage.setItem('returnSlug', slug)
  sessionStorage.setItem('returnImage', heroImage)

  ;(window as any).__skipPageTransition = true
  navigateTo(basePath)
  isNavigating = false
}

/**
 * On the listing page, play the return animation:
 * clone starts at hero size, shrinks to the target card, overlay fades out.
 *
 * @param slug - the slug to find the target card
 * @param imageSrc - the hero image URL
 * @param cardSelector - CSS selector for card elements (e.g. '.blog-card')
 * @param imageSelector - CSS selector for the card image inside the card
 * @param slugAttr - data attribute on the card that holds the slug (e.g. 'data-slug')
 */
export function playReturnToCardAnimation(
  slug: string,
  imageSrc: string,
  cardSelector: string,
  imageSelector: string,
  slugAttr: string = 'data-slug'
) {
  const vw = window.innerWidth

  // Calculate hero dimensions matching detail page
  let heroLeft: string
  let heroWidth: string
  let heroRadius: string

  if (vw <= 768) {
    heroLeft = '0px'
    heroWidth = '100vw'
    heroRadius = '0'
  } else if (vw <= 1024) {
    heroLeft = '1.5rem'
    heroWidth = 'calc(100vw - 3rem)'
    heroRadius = '0 0 0.75rem 0.75rem'
  } else {
    heroLeft = '3rem'
    heroWidth = 'calc(100vw - 6rem)'
    heroRadius = '0 0 0.75rem 0.75rem'
  }

  // Create clone at hero size
  const clone = document.createElement('img')
  clone.src = imageSrc
  clone.style.cssText = `
    position: fixed;
    top: 0;
    left: ${heroLeft};
    width: ${heroWidth};
    height: 50vh;
    object-fit: cover;
    z-index: 10001;
    pointer-events: none;
    border-radius: ${heroRadius};
  `
  document.body.appendChild(clone)

  // White overlay behind the clone (starts opaque)
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: #ffffff;
    z-index: 10000;
    opacity: 1;
    pointer-events: none;
  `
  document.body.appendChild(overlay)

  // Find the target card and scroll it into view
  requestAnimationFrame(() => {
    const targetCard = document.querySelector(`${cardSelector}[${slugAttr}="${slug}"]`) as HTMLElement
    let targetImg: HTMLElement | null = null

    if (targetCard) {
      targetImg = targetCard.querySelector(imageSelector) as HTMLElement

      // Scroll card into view if needed
      const cardRect = targetCard.getBoundingClientRect()
      if (cardRect.top < 0 || cardRect.bottom > window.innerHeight) {
        targetCard.scrollIntoView({ block: 'center' })
      }
    }

    // Wait one more frame for scroll to settle
    requestAnimationFrame(() => {
      let targetRect: DOMRect

      if (targetImg) {
        targetRect = targetImg.getBoundingClientRect()
      } else {
        // Fallback: center of viewport
        targetRect = new DOMRect(vw / 2 - 150, window.innerHeight / 2 - 100, 300, 200)
      }

      const tl = gsap.timeline({
        onComplete: () => {
          clone.remove()
          overlay.remove()
        }
      })

      // Fade out overlay to reveal the listing page
      tl.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      })

      // Shrink clone from hero to card position
      tl.to(clone, {
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: '0.65rem',
        duration: 0.5,
        ease: 'power3.inOut'
      }, 0)

      // Fade out clone at the end
      tl.to(clone, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in'
      }, 0.45)
    })
  })
}
