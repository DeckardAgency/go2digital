# Split Text Animation

A text reveal animation module using GSAP and `clip-path`. Text is revealed from top to bottom with a subtle upward movement.

## Basic Usage

Add `data-split-text` attribute to any text element:

```html
<h1 data-split-text>Your text here</h1>
```

## Options

All options are set via `data-` attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-split-text` | - | - | **Required.** Enables the animation |
| `data-split-type` | `lines` \| `words` \| `chars` | `lines` | How to split the text |
| `data-split-duration` | number | `0.8` | Animation duration in seconds |
| `data-split-delay` | number | `0` | Delay before animation starts |
| `data-split-stagger` | number | `0.1` | Delay between each line/word/char |
| `data-split-ease` | string | `power2.out` | GSAP easing function |
| `data-split-y` | number | `30` | Vertical offset in pixels |
| `data-split-trigger` | `view` \| `load` \| `none` | `view` | When to trigger animation (`none` for manual control) |
| `data-split-threshold` | number | `0.1` | IntersectionObserver threshold |

## Examples

### Split by Lines (default)

```html
<p
  data-split-text
  data-split-type="lines"
  data-split-duration="0.8"
  data-split-stagger="0.1"
>
  This text will be split into lines
  and each line animates separately.
</p>
```

### Split by Words

```html
<h1
  data-split-text
  data-split-type="words"
  data-split-duration="0.6"
  data-split-stagger="0.05"
>
  Each word animates individually
</h1>
```

### Split by Characters

```html
<h1
  data-split-text
  data-split-type="chars"
  data-split-duration="0.5"
  data-split-stagger="0.02"
>
  Character by character
</h1>
```

### Custom Easing

```html
<h1
  data-split-text
  data-split-ease="power4.out"
>
  Smooth easing
</h1>
```

Available GSAP easings: `power1`, `power2`, `power3`, `power4`, `back`, `elastic`, `bounce`, `expo`, `circ`, `sine`

Each with `.in`, `.out`, or `.inOut` variants.

### Animate on Load

```html
<h1
  data-split-text
  data-split-trigger="load"
  data-split-delay="0.5"
>
  Animates immediately on page load
</h1>
```

### Custom Vertical Offset

```html
<h1
  data-split-text
  data-split-y="50"
>
  Larger upward movement
</h1>
```

## Full Example

```html
<section class="hero">
  <h1
    data-split-text
    data-split-type="lines"
    data-split-duration="0.8"
    data-split-stagger="0.12"
    data-split-ease="power3.out"
    data-split-y="30"
  >
    Welcome to Our Website
  </h1>

  <p
    data-split-text
    data-split-type="lines"
    data-split-duration="0.6"
    data-split-delay="0.3"
    data-split-stagger="0.08"
  >
    We create amazing digital experiences
    that leave lasting impressions.
  </p>
</section>
```

## How It Works

1. **Initialization**: The plugin automatically initializes on page load and after route changes
2. **Text Splitting**: Text is split into `<span>` or `<div>` elements based on `data-split-type`
3. **Initial State**: Elements are hidden using `clip-path: inset(0 0 100% 0)` and offset with `transform: translateY()`
4. **Animation**: When triggered, `clip-path` animates to `inset(0 0 0% 0)` revealing text from top to bottom, while `translateY` animates to `0`
5. **Trigger**: By default uses IntersectionObserver to animate when element enters viewport

## Programmatic Control

You can also control animations programmatically:

```typescript
const { initSplitText, playAnimation, reset, destroy, getSplitElements, setVisible } = useSplitText()

// Initialize on a specific container
initSplitText(document.querySelector('.my-container'))

// Replay animation on an element
const element = document.querySelector('[data-split-text]')
reset(element)
playAnimation(element)

// Get split elements for custom animations (e.g., ScrollTrigger)
const splitEls = getSplitElements(element)
gsap.to(splitEls, { opacity: 0, y: -30 })

// Set elements to visible state (skip reveal animation)
setVisible(element)

// Cleanup
destroy()
```

### Manual Trigger Mode

Use `data-split-trigger="none"` for full manual control. This splits the text but doesn't auto-animate:

```html
<h1
  data-split-text
  data-split-trigger="none"
>
  Manually controlled text
</h1>
```

```typescript
// Initialize split
initSplitText(container)

// Manually play when ready
playAnimation(element)

// Or use split elements with ScrollTrigger
const splitEls = getSplitElements(element)
gsap.timeline({
  scrollTrigger: { trigger: element, start: 'top center' }
}).to(splitEls, { opacity: 0, y: -30 })
```

## CSS

The plugin adds these classes:

- `.split-text-ready` - Added to parent element after processing
- `.split-line` - Each line element (when type="lines")
- `.split-word` - Each word element (when type="words")
- `.split-char` - Each character element (when type="chars")

Initial visibility is controlled via CSS:

```css
[data-split-text] {
  visibility: hidden;
}

[data-split-text].split-text-ready {
  visibility: visible;
}
```
