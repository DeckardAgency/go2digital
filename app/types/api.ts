// API response types for Go2Digital Symfony API
// All translatable entities return flat translated fields + locale

// ─── Media ───────────────────────────────────────────────────

export interface MediaRef {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  size: string
  width: number | null
  height: number | null
  path: string
  thumbnails: Record<string, string> | null
  alt?: string | null
  title?: string | null
}

// ─── Blog ────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  slug: string
  image: MediaRef | null
  date: string
  author: string
  category: BlogCategory | null
  featured: boolean
  status: string
  locale: string
  title: string
  excerpt: string | null
  body: string | null
}

export interface BlogCategory {
  id: string
  slug: string
  sortOrder: number
  locale: string
  name: string
}

// ─── Lab ─────────────────────────────────────────────────────

export interface LabProjectSection {
  label: string
  content: string
  imagePath?: string
}

export interface LabProject {
  id: string
  slug: string
  image: MediaRef | null
  featured: boolean
  status: string
  categories: LabCategory[]
  locale: string
  title: string
  shortTitle: string | null
  subtitle: string | null
  body: string | null
  sections: LabProjectSection[] | null
}

export interface LabCategory {
  id: string
  slug: string
  sortOrder: number
  locale: string
  name: string
}

// ─── Homepage ────────────────────────────────────────────────

export interface HomepageHero {
  id: string
  video: MediaRef | null
  mobileVideo: MediaRef | null
  locale: string
  titleLine1: string | null
  titleLine2: string | null
  kicker: string | null
  heading: string | null
  description: string | null
  scrollDownLabel: string | null
}

export interface HomepagePanel {
  id: string
  statValue: string | null
  sortOrder: number
  image: MediaRef | null
  locale: string
  title: string | null
  tag: string | null
  description: string | null
}

export interface HomepageWhySection {
  id: string
  locale: string
  label: string | null
  headline: string | null
}

export interface HomepageWhyCard {
  id: string
  icon: string | null
  dotPattern: number[] | null
  sortOrder: number
  locale: string
  title: string | null
  description: string | null
}

export interface HomepageCustomImage {
  id: string
  desktopImage: MediaRef | null
  mobileImage: MediaRef | null
  locale: string
  alt: string | null
}

export interface HomepageCustomSolution {
  id: string
  image: MediaRef | null
  locale: string
  indicator: string | null
  title: string | null
  block1: string | null
  block2: string | null
}

export interface HomepageFeaturedLabItem {
  id: string
  slug: string | null
  image: MediaRef | null
  categories: string[] | null
  sortOrder: number
  locale: string
  title: string | null
  subtitle: string | null
}

export interface HomepageHumanFocused {
  id: string
  locale: string
  indicator: string | null
  title: string | null
  blockLeft: string | null
  blockRight: string | null
}

export interface HomepageTextAnimation {
  id: string
  locale: string
  word1: string | null
  word2: string | null
  word3: string | null
}

export interface HomepageBillboard {
  id: string
  image: MediaRef | null
  buttonUrl: string | null
  locale: string
  title: string | null
  subtitle: string | null
  description: string | null
  buttonText: string | null
  imageAlt: string | null
}

export interface HomepageTrackingFeature {
  id: string
  icon: string | null
  sortOrder: number
  locale: string
  title: string | null
  description: string | null
}

export interface HomepagePossibility {
  id: string
  sortOrder: number
  locale: string
  title: string | null
  description: string | null
}

export interface HomepageAnalyticsTab {
  id: string
  sortOrder: number
  curveType: 'rising' | 'gradual' | 'bell'
  yLabels: string[] | null
  locale: string
  label: string | null
}

export interface HomepageRentalsImage {
  id: string
  image: MediaRef | null
  locale: string
  text: string | null
}

export interface HomepageProduct {
  id: string
  productType: 'display' | 'cube'
  image: MediaRef | null
  specs: Array<{ label: string; value: string }> | null
  features: HomepageProductFeature[]
  locale: string
  title: string | null
  badge: string | null
  description: string | null
  specsTitle: string | null
  downloadLabel: string | null
  indicatorText: string | null
}

export interface HomepageProductFeature {
  id: string
  icon: string | null
  sortOrder: number
  locale: string
  title: string | null
  description: string | null
}

// ─── ESG ─────────────────────────────────────────────────────

export interface EsgPageContent {
  id: string
  video: MediaRef | null
  mobileBg: MediaRef | null
  locale: string
  heroLabel: string | null
  introSmall: string | null
  introLarge: string | null
  downloadReportLabel: string | null
}

export interface EsgPillar {
  id: string
  icon: string | null
  sortOrder: number
  locale: string
  title: string | null
  description: string | null
}

export interface EsgCard {
  id: string
  icon: string | null
  sortOrder: number
  locale: string
  text: string | null
}

export interface EsgVisionBadge {
  id: string
  sortOrder: number
  locale: string
  title: string | null
  description: string | null
}

// ─── Site-wide ───────────────────────────────────────────────

export interface NavigationItem {
  id: string
  url: string
  sortOrder: number
  isActive: boolean
  group: string
  locale: string
  label: string
}

export interface ContactInfo {
  id: string
  key: string
  value: string
  href: string | null
  sortOrder: number
  isExternal: boolean
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string | null
  sortOrder: number
  isActive: boolean
}

export interface Setting {
  id: string
  key: string
  value: Record<string, any>
  group: string | null
}

// ─── Page Content ────────────────────────────────────────────

export interface BlogPageContent {
  id: string
  locale: string
  pageTitle: string | null
  title: string | null
  filterAllLabel: string | null
  readMoreLabel: string | null
  noResultsTitle: string | null
  noResultsText: string | null
  viewAllLabel: string | null
  allLoadedText: string | null
}

export interface LabPageContent {
  id: string
  locale: string
  pageTitle: string | null
  breadcrumb: string | null
  intro: string | null
  title: string | null
  filterAllLabel: string | null
  noResultsText: string | null
  viewAllLabel: string | null
  viewProjectLabel: string | null
}

export interface ContactPageContent {
  id: string
  locale: string
  pageTitle: string | null
  batteryLine1: string | null
  batteryLine2: string | null
}

export interface TeamPageContent {
  id: string
  locale: string
  pageTitle: string | null
  intro: string | null
}
