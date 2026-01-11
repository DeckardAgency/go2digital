import { gsap } from 'gsap'

interface SplitTextOptions {
  type: 'lines' | 'words' | 'chars'
  duration: number
  delay: number
  stagger: number
  ease: string
  trigger: 'load' | 'view' | 'none'
  threshold: number
  y: number
  indent: string | null
}

const defaultOptions: SplitTextOptions = {
  type: 'lines',
  duration: 0.8,
  delay: 0,
  stagger: 0.1,
  ease: 'power2.out',
  trigger: 'view',
  threshold: 0.1,
  y: 30,
  indent: null
}

// Parse options from data attributes
function parseOptions(element: HTMLElement): SplitTextOptions {
  const options = { ...defaultOptions }

  const type = element.dataset.splitType
  if (type === 'lines' || type === 'words' || type === 'chars') {
    options.type = type
  }

  if (element.dataset.splitDuration) {
    options.duration = parseFloat(element.dataset.splitDuration)
  }

  if (element.dataset.splitDelay) {
    options.delay = parseFloat(element.dataset.splitDelay)
  }

  if (element.dataset.splitStagger) {
    options.stagger = parseFloat(element.dataset.splitStagger)
  }

  if (element.dataset.splitEase) {
    options.ease = element.dataset.splitEase
  }

  const trigger = element.dataset.splitTrigger
  if (trigger === 'load' || trigger === 'view' || trigger === 'none') {
    options.trigger = trigger
  }

  if (element.dataset.splitThreshold) {
    options.threshold = parseFloat(element.dataset.splitThreshold)
  }

  if (element.dataset.splitY) {
    options.y = parseFloat(element.dataset.splitY)
  }

  if (element.dataset.splitIndent) {
    options.indent = element.dataset.splitIndent
  }

  return options
}

// Split text into lines, words, or chars
function splitText(element: HTMLElement, type: 'lines' | 'words' | 'chars', indent: string | null = null): HTMLElement[] {
  const text = element.textContent?.trim() || ''
  const computedStyle = window.getComputedStyle(element)

  // Store original text for accessibility
  element.setAttribute('aria-label', text)

  // Clear element
  element.innerHTML = ''

  // Add class to parent
  element.classList.add('split-text-ready')

  const elements: HTMLElement[] = []

  if (type === 'chars') {
    const chars = text.split('')
    chars.forEach(char => {
      const span = document.createElement('span')
      span.className = 'split-char'
      // Add padding-right to prevent clip-path from cutting off characters
      span.style.cssText = 'display:inline-block;padding-right:0.05em;margin-right:-0.05em;'
      span.textContent = char === ' ' ? '\u00A0' : char
      element.appendChild(span)
      elements.push(span)
    })
  } else if (type === 'words') {
    const words = text.split(/\s+/)
    words.forEach((word, i) => {
      const span = document.createElement('span')
      span.className = 'split-word'
      span.style.cssText = 'display:inline-block;'
      span.textContent = word
      element.appendChild(span)
      elements.push(span)

      // Add space after word (except last)
      if (i < words.length - 1) {
        element.appendChild(document.createTextNode(' '))
      }
    })
  } else {
    // LINES - detect natural line breaks
    // For inline elements, don't split into lines - keep as single unit
    const inlineTags = ['SPAN', 'A', 'STRONG', 'EM', 'B', 'I', 'LABEL', 'SMALL', 'MARK', 'CODE']
    const isInlineParent = inlineTags.includes(element.tagName) || computedStyle.display.includes('inline')

    if (isInlineParent) {
      // Inline elements: wrap all text in a single span
      const span = document.createElement('span')
      span.className = 'split-line'
      span.style.cssText = 'display:inline;'
      span.textContent = text
      element.appendChild(span)
      elements.push(span)
    } else {
      // Block elements: detect natural line breaks
      const words = text.split(/\s+/)

      // Parse indent value if provided
      let indentPx = 0
      if (indent) {
        const tempIndent = document.createElement('div')
        tempIndent.style.cssText = `position:absolute;visibility:hidden;width:${indent};`
        document.body.appendChild(tempIndent)
        indentPx = tempIndent.offsetWidth
        document.body.removeChild(tempIndent)
      }

      // Create temporary container to measure lines
      const temp = document.createElement('div')
      temp.style.cssText = `
        position:absolute;
        visibility:hidden;
        width:${element.offsetWidth}px;
        font:${computedStyle.font};
        letter-spacing:${computedStyle.letterSpacing};
        word-spacing:${computedStyle.wordSpacing};
        white-space:normal;
        line-height:${computedStyle.lineHeight};
      `

      // If we have an indent, add a placeholder span for the first line indent
      if (indentPx > 0) {
        const indentSpan = document.createElement('span')
        indentSpan.style.cssText = `display:inline-block;width:${indentPx}px;`
        indentSpan.textContent = '\u00A0' // Non-breaking space
        temp.appendChild(indentSpan)
      }

      // Add words as spans to measure
      words.forEach((word, i) => {
        const span = document.createElement('span')
        span.textContent = word + (i < words.length - 1 ? ' ' : '')
        temp.appendChild(span)
      })

      document.body.appendChild(temp)

      // Group words into lines based on their Y position
      // Skip the indent placeholder span if present
      const allSpans = temp.querySelectorAll('span')
      const wordSpans = indent ? Array.from(allSpans).slice(1) : Array.from(allSpans)
      const lines: string[][] = []
      let currentLine: string[] = []
      let lastTop = -1

      wordSpans.forEach((span, i) => {
        const rect = span.getBoundingClientRect()
        if (lastTop !== -1 && rect.top > lastTop + 2) {
          lines.push(currentLine)
          currentLine = []
        }
        currentLine.push(words[i])
        lastTop = rect.top
      })
      if (currentLine.length) lines.push(currentLine)

      document.body.removeChild(temp)

      // Create line elements
      lines.forEach((lineWords, index) => {
        const div = document.createElement('div')
        div.className = 'split-line'
        // Apply indent to first line only
        const indentStyle = (index === 0 && indent) ? `padding-left:${indent};` : ''
        div.style.cssText = `display:block;${indentStyle}`
        div.textContent = lineWords.join(' ')
        element.appendChild(div)
        elements.push(div)
      })
    }
  }

  return elements
}

// Main composable
export const useSplitText = () => {
  const processedElements = new WeakSet<HTMLElement>()
  const animatedElements = new WeakSet<HTMLElement>()
  let observer: IntersectionObserver | null = null

  const initSplitText = (container?: HTMLElement | Document) => {
    const root = container || document
    const elements = root.querySelectorAll<HTMLElement>('[data-split-text]')

    // Setup IntersectionObserver
    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              if (!animatedElements.has(el)) {
                animatedElements.add(el)
                playAnimation(el)
                observer?.unobserve(el)
              }
            }
          })
        },
        { threshold: 0.1 }
      )
    }

    elements.forEach(element => {
      // Check if already processed (by this instance or another)
      if (processedElements.has(element) || element.classList.contains('split-text-ready')) return
      processedElements.add(element)

      const options = parseOptions(element)
      const splitElements = splitText(element, options.type, options.indent)

      // Set initial state - hidden with clip-path + slight offset
      gsap.set(splitElements, {
        clipPath: 'inset(0 0 100% 0)',
        y: options.y
      })

      // Store references
      ;(element as any)._splitElements = splitElements
      ;(element as any)._splitOptions = options

      // Trigger animation
      if (options.trigger === 'load') {
        setTimeout(() => {
          animatedElements.add(element)
          playAnimation(element)
        }, 100)
      } else if (options.trigger === 'view') {
        observer?.observe(element)
      }
      // 'none' trigger: just split, no auto-animation (manual control)
    })
  }

  const playAnimation = (element: HTMLElement) => {
    const splitElements = (element as any)._splitElements as HTMLElement[]
    const options = (element as any)._splitOptions as SplitTextOptions

    if (!splitElements?.length) return

    // Animate clip-path from hidden to visible + move up
    gsap.to(splitElements, {
      clipPath: 'inset(0 0 0% 0)',
      y: 0,
      duration: options.duration,
      delay: options.delay,
      stagger: options.stagger,
      ease: options.ease
    })
  }

  const reset = (element: HTMLElement) => {
    const splitElements = (element as any)._splitElements as HTMLElement[]
    const options = (element as any)._splitOptions as SplitTextOptions
    if (splitElements && options) {
      gsap.set(splitElements, { clipPath: 'inset(0 0 100% 0)', y: options.y })
    }
    animatedElements.delete(element)
  }

  const destroy = () => {
    observer?.disconnect()
    observer = null
  }

  // Get split elements from a parent element
  const getSplitElements = (element: HTMLElement): HTMLElement[] | null => {
    return (element as any)._splitElements || null
  }

  // Get split options from a parent element
  const getSplitOptions = (element: HTMLElement): SplitTextOptions | null => {
    return (element as any)._splitOptions || null
  }

  // Set elements to visible state (for elements that start visible and fade out)
  const setVisible = (element: HTMLElement) => {
    const splitElements = (element as any)._splitElements as HTMLElement[]
    if (splitElements?.length) {
      gsap.set(splitElements, {
        clipPath: 'inset(0 0 0% 0)',
        y: 0
      })
    }
  }

  return {
    initSplitText,
    playAnimation,
    reset,
    destroy,
    getSplitElements,
    getSplitOptions,
    setVisible
  }
}
