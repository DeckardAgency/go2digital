<template>
  <div class="locations-page" :class="[currentViewClass, { 'locations-page--dark': isDarkMode, 'locations-page--scrolled': isScrolled }]">
    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model:visible="showClearConfirm"
      :message="locConfirmClear"
      :confirm-text="locClearAll"
      :cancel-text="locFiltersApply"
      @confirm="doClearAll"
    />

    <!-- Sidebar -->
    <aside class="locations-sidebar" :class="{ 'locations-sidebar--dark': isDarkMode, 'locations-sidebar--scrolled': isScrolled }">
      <!-- Header -->
      <div class="locations-sidebar__header" ref="headerRef">
        <div class="locations-sidebar__title-row">
          <h1 class="locations-sidebar__title" data-split-text data-split-type="chars" data-split-trigger="none" data-split-stagger="0.02" data-split-duration="0.6">
            {{ locTitle }}
          </h1>
          <span class="locations-sidebar__count" ref="countRef">({{ totalScreens }})</span>
        </div>

        <div class="locations-sidebar__buttons-wrapper" ref="buttonsRef">
          <button class="locations-sidebar__clear-btn" @click="clearAll" :style="{ display: selectedLocations.size > 0 ? 'block' : 'none' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m16.111 7.083-.42 10.07a1.667 1.667 0 0 1-1.664 1.597h-7.22a1.666 1.666 0 0 1-1.665-1.598l-.42-10.069M8.75 3.75v-.833c0-.46.373-.834.833-.834h1.667c.46 0 .833.374.833.834v.833M8.75 15.417v-5M12.086 15.417v-5M4.585 3.75H16.25c.92 0 1.667.747 1.667 1.667v1.666h-15V5.417c0-.92.747-1.667 1.667-1.667Z"/></svg>
          </button>
          <label class="locations-sidebar__view-toggle">
            <span>{{ locCollectionView }}</span>
            <input type="checkbox" v-model="showSelectedOnly" class="locations-sidebar__view-checkbox" @change="toggleSelectedOnlyView">
          </label>

          <!-- Mobile Mode Switch -->
          <div class="locations-sidebar__mode-switch">
            <button
              class="locations-sidebar__mode-btn"
              :class="{ 'locations-sidebar__mode-btn--active': !isDarkMode }"
              @click="setMapStyle('light')"
            >
              {{ locMapLight }}
            </button>
            <button
              class="locations-sidebar__mode-btn"
              :class="{ 'locations-sidebar__mode-btn--active': isDarkMode }"
              @click="setMapStyle('dark')"
            >
              {{ locMapDark }}
            </button>
          </div>
        </div>
      </div>

      <!-- Collapsible toolbar (hides on scroll) -->
      <div class="locations-sidebar__toolbar" :class="{ 'locations-sidebar__toolbar--collapsed': isScrolled }">

      <!-- Filters (Desktop) -->
      <div class="locations-sidebar__filters" ref="filtersRef">
        <div class="locations-sidebar__filter-group">
          <!-- Cities Dropdown -->
          <div class="custom-select" :class="{ 'custom-select--open': isCityDropdownOpen }">
            <button class="custom-select__trigger" @click="toggleCityDropdown">
              <span class="custom-select__label">
                {{ selectedCities.length === 1 ? getCityName(selectedCities[0]) : selectedCities.length > 1 ? `${locFiltersCities} (${selectedCities.length})` : locFiltersCities }}
              </span>
              <svg class="custom-select__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="4" cy="4" r="1.5" fill="currentColor"/><circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                <circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <!-- Environments Dropdown -->
          <div class="custom-select" :class="{ 'custom-select--open': isEnvDropdownOpen }">
            <button class="custom-select__trigger" @click="toggleEnvDropdown">
              <span class="custom-select__label">
                {{ selectedEnvironments.length === 1 ? getEnvironmentName(selectedEnvironments[0]) : selectedEnvironments.length > 1 ? `${locFiltersEnvironments} (${selectedEnvironments.length})` : locFiltersEnvironments }}
              </span>
              <svg class="custom-select__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="4" cy="4" r="1.5" fill="currentColor"/><circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                <circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <!-- Shared dropdown panels (span full filter-group width, anchored to the group) -->
          <Transition name="dropdown" @after-enter="focusCitySearch">
            <div class="custom-select__dropdown" v-if="isCityDropdownOpen" data-lenis-prevent>
              <div class="custom-select__search">
                <input
                  ref="citySearchRef"
                  type="text"
                  class="custom-select__search-input"
                  :placeholder="locSearchFilterPlaceholder"
                  v-model="cityFilterQuery"
                  @click.stop
                >
              </div>
              <div class="custom-select__options">
                <button class="custom-select__option custom-select__option--all" @click="toggleAllCities">
                  <span>{{ locFiltersAll }} {{ locFiltersCities }}</span>
                </button>
                <label v-for="city in filteredCities" :key="city.id" class="custom-select__option" :class="{ 'custom-select__option--selected': selectedCities.includes(city.id) }">
                  <span>{{ city.name }}</span>
                  <input type="checkbox" :value="city.id" v-model="selectedCities" @change="applyFilters">
                </label>
                <div v-if="filteredCities.length === 0" class="custom-select__no-results">{{ locNoResults }}</div>
              </div>
            </div>
          </Transition>

          <Transition name="dropdown" @after-enter="focusEnvSearch">
            <div class="custom-select__dropdown" v-if="isEnvDropdownOpen" data-lenis-prevent>
              <div class="custom-select__search">
                <input
                  ref="envSearchRef"
                  type="text"
                  class="custom-select__search-input"
                  :placeholder="locSearchFilterPlaceholder"
                  v-model="envFilterQuery"
                  @click.stop
                >
              </div>
              <div class="custom-select__options">
                <button class="custom-select__option custom-select__option--all" @click="toggleAllEnvironments">
                  <span>{{ locFiltersAll }} {{ locFiltersEnvironments }}</span>
                </button>
                <label v-for="env in filteredEnvironments" :key="env.id" class="custom-select__option" :class="{ 'custom-select__option--selected': selectedEnvironments.includes(env.id) }">
                  <span>{{ env.name }}</span>
                  <input type="checkbox" :value="env.id" v-model="selectedEnvironments" @change="applyFilters">
                </label>
                <div v-if="filteredEnvironments.length === 0" class="custom-select__no-results">No results</div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Mobile Buttons Row -->
      <div class="locations-sidebar__mobile-buttons">
        <button class="locations-sidebar__collection-btn" @click="openSidebar">
          <span class="locations-sidebar__collection-btn-dot"></span>
          <span class="locations-sidebar__collection-btn-text">{{ locCollection }} (<span>{{ selectedLocations.size }}</span>)</span>
        </button>

        <button class="locations-sidebar__filters-btn" @click="openFiltersModal">
          <span class="locations-sidebar__filters-btn-text">{{ locFiltersTitle }} (<span>{{ totalFiltersCount }}</span>)</span>
        </button>
      </div>

      <!-- Search -->
      <div class="locations-sidebar__search" ref="searchRef">
        <input
          type="text"
          class="locations-sidebar__search-input"
          :placeholder="locSearchPlaceholder"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        >
        <button class="locations-sidebar__search-btn" @click="handleSearch">{{ locSearchButton }}</button>
      </div>

      <!-- Active Filters -->
      <div class="locations-sidebar__active-filters" v-if="hasActiveFilters">
        <span
          v-for="city in selectedCities"
          :key="`city-${city}`"
          class="locations-sidebar__tag"
        >
          {{ getCityName(city) }}
          <span class="locations-sidebar__tag-close" @click="removeFilter('city', city)">&times;</span>
        </span>
        <span
          v-for="env in selectedEnvironments"
          :key="`env-${env}`"
          class="locations-sidebar__tag"
        >
          {{ getEnvironmentName(env) }}
          <span class="locations-sidebar__tag-close" @click="removeFilter('environment', env)">&times;</span>
        </span>
        <span v-if="searchQuery" class="locations-sidebar__tag">
          {{ locSearchLabel }}: "{{ searchQuery }}"
          <span class="locations-sidebar__tag-close" @click="removeFilter('search')">&times;</span>
        </span>
        <a href="#" class="locations-sidebar__clear-all" @click.prevent="clearAllFilters">
          {{ locClearAll }}
          <span>
            &times;
          </span>
        </a>
      </div>

      </div><!-- end toolbar -->

      <!-- Scroll Progress Bar -->
      <div class="locations-sidebar__progress">
        <div class="locations-sidebar__progress-bar" :style="{ transform: `scaleX(${scrollProgress})` }"></div>
      </div>

      <!-- Shimmer Loader -->
      <div class="locations-sidebar__shimmer" v-show="isLoading">
        <div v-for="i in 6" :key="i" class="location-card-shimmer">
          <div class="location-card-shimmer__badge"></div>
          <div class="location-card-shimmer__image"></div>
          <div class="location-card-shimmer__content">
            <div class="location-card-shimmer__line location-card-shimmer__line--short"></div>
            <div class="location-card-shimmer__line location-card-shimmer__line--long"></div>
          </div>
        </div>
      </div>

      <!-- Location Cards Grid -->
      <TransitionGroup
        tag="div"
        name="card"
        class="locations-sidebar__cards"
        v-show="!isLoading"
        ref="cardsContainer"
        @scroll="onCardsScroll"
        data-lenis-prevent
      >
        <div
          v-for="location in filteredLocations"
          :key="location.id"
          class="location-card"
          :class="{
            'location-card--selected': selectedLocations.has(location.id),
            'location-card--active': activeLocationId === location.id,
            'location-card--dark': isDarkMode
          }"
          :data-location-id="location.id"
          :data-slug="location.slug"
          :data-lat="location.lat"
          :data-lng="location.lng"
          :data-screens="location.screens"
          @click="openLocationDetail(location)"
        >
          <div class="location-card__badge" @click.stop="toggleLocation(location)">
            <input
              type="checkbox"
              class="location-card__badge-input"
              :checked="selectedLocations.has(location.id)"
              @click.stop
              @change="toggleLocation(location)"
            >
          </div>

          <div class="location-card__focus" @click.stop="focusOnLocation(location)">
            <svg class="location-card__focus-icon location-card__focus-icon--default" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9.375 9.375V13.875" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.375 9.375C11.5841 9.375 13.375 7.58414 13.375 5.375C13.375 3.16586 11.5841 1.375 9.375 1.375C7.16586 1.375 5.375 3.16586 5.375 5.375C5.375 7.58414 7.16586 9.375 9.375 9.375Z" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.125 11.625C15.3667 12.1114 16.875 13.0205 16.875 14.0618C16.875 15.6155 13.5171 16.875 9.375 16.875C5.23286 16.875 1.875 15.6155 1.875 14.0618C1.875 13.0205 3.38324 12.1114 5.625 11.625" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg class="location-card__focus-icon location-card__focus-icon--active" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9.375 9.375V13.875" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.375 9.375C11.5841 9.375 13.375 7.58414 13.375 5.375C13.375 3.16586 11.5841 1.375 9.375 1.375C7.16586 1.375 5.375 3.16586 5.375 5.375C5.375 7.58414 7.16586 9.375 9.375 9.375Z" fill="#0CD459" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.125 11.625C15.3667 12.1114 16.875 13.0205 16.875 14.0618C16.875 15.6155 13.5171 16.875 9.375 16.875C5.23286 16.875 1.875 15.6155 1.875 14.0618C1.875 13.0205 3.38324 12.1114 5.625 11.625" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <div class="location-card__link" @click.stop="animateToDetail(location, $event)">
            <div class="location-card__image-wrapper">
              <img
                v-if="location.image"
                :src="location.image"
                :alt="location.name"
                class="location-card__image location-card__image--desktop"
                :style="{ objectPosition: `${location.focalX}% ${location.focalY}%` }"
                loading="lazy"
              >
              <img
                v-if="location.image"
                :src="location.image"
                :alt="location.name"
                class="location-card__image location-card__image--mobile"
                :style="{ objectPosition: `${location.focalMobileX}% ${location.focalMobileY}%` }"
                loading="lazy"
              >
            </div>
            <div class="location-card__content">
              <div class="location-card__meta">
                <span class="location-card__city">{{ location.city }}</span>
                <template v-if="location.environments.length > 0">
                  <span class="location-card__dot">&bull;</span>
                  <span class="location-card__type">{{ location.environments[0] }}</span>
                </template>
              </div>
              <h3 class="location-card__name">{{ location.name }}</h3>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLocations.length === 0 && !isLoading" key="empty" class="locations-sidebar__empty">
          <p>{{ locNoResults }}</p>
        </div>
      </TransitionGroup>
    </aside>

    <!-- Resize Handle -->
    <div
      class="locations-resize"
      @mousedown="startResize"
      @touchstart.prevent="startResizeTouch"
    >
      <div class="locations-resize__grip">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>

    <!-- Map View -->
    <main class="locations-map" :class="{ 'locations-map--dark': isDarkMode }">
      <!-- View Toggle -->
      <div class="locations-map__controls">
        <button
          class="locations-map__toggle"
          :class="{ 'locations-map__toggle--active': !isDarkMode }"
          @click="setMapStyle('light')"
        >
          {{ locMapLight }}
        </button>
        <button
          class="locations-map__toggle"
          :class="{ 'locations-map__toggle--active': isDarkMode }"
          @click="setMapStyle('dark')"
        >
          {{ locMapDark }}
        </button>
      </div>

      <!-- Nearby Facilities -->
      <div v-if="false" class="locations-map__facilities" :class="{ 'locations-map__facilities--dark': isDarkMode, 'locations-map__facilities--open': isFacilitiesOpen }">
        <button class="locations-map__facilities-toggle" @click="isFacilitiesOpen = !isFacilitiesOpen">
          <span class="locations-map__facilities-label">
            {{ activeFacilities.length > 0 ? `Nearby Places (${activeFacilities.length})` : 'Nearby Places' }}
          </span>
          <svg class="locations-map__facilities-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="4" cy="4" r="1.5" fill="currentColor"/><circle cx="10" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/>
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="isFacilitiesOpen" class="locations-map__facilities-dropdown">
            <label
              v-for="facility in facilityCategories"
              :key="facility.id"
              class="locations-map__facilities-option"
              :class="{ 'locations-map__facilities-option--active': activeFacilities.includes(facility.id) }"
            >
              <span class="locations-map__facilities-icon">{{ facility.icon }}</span>
              <span class="locations-map__facilities-label">{{ facility.label }}</span>
              <input type="checkbox" :value="facility.id" v-model="activeFacilities" @change="toggleFacilityLayer(facility.id)">
            </label>
          </div>
        </Transition>
      </div>

      <!-- Collection Badge -->
      <div class="locations-collection" :class="{ 'locations-collection--dark': isDarkMode }" @click="openSidebar">
        <span class="locations-collection__dot"></span>
        <span class="locations-collection__text">
          {{ locCollection }} <span class="locations-collection__count">({{ selectedLocations.size }})</span>
        </span>
      </div>

      <!-- Map Container -->
      <div class="locations-map__container" ref="mapContainer"></div>

      <!-- Info card is rendered via Mapbox Popup in focusOnLocation -->
    </main>

    <!-- Selection Sidebar -->
    <aside class="locations-selection-sidebar" :class="{ 'locations-selection-sidebar--open': isSidebarOpen, 'locations-selection-sidebar--dark': isDarkMode }">
      <div class="locations-selection-sidebar__header">
        <div class="locations-selection-sidebar__title-wrapper">
          <h2 class="locations-selection-sidebar__title">{{ locCollection }} <span>({{ selectedLocations.size }})</span></h2>
          <button class="locations-selection-sidebar__close" @click="closeSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M10.125 1.875L1.875 10.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1.875 1.875L10.125 10.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="locations-selection-sidebar__header-actions">
          <button class="locations-selection-sidebar__share-btn" @click="shareCollection">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M11.582 9.25C13.2487 10.9167 13.2487 13.5 11.582 15.1667L9.2487 17.5C7.58203 19.1667 4.9987 19.1667 3.33203 17.5C1.66536 15.8333 1.66536 13.25 3.33203 11.5833L5.41536 9.58333" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.25 11.5833C7.58333 9.91667 7.58333 7.33334 9.25 5.66667L11.5833 3.33334C13.25 1.66667 15.8333 1.66667 17.5 3.33334C19.1667 5 19.1667 7.58334 17.5 9.25L15.4167 11.25" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ locShareUrl }}</span>
          </button>

          <button class="locations-selection-sidebar__export-btn" @click="exportToPdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.0833 8.75V3.75C17.0833 2.82953 16.3372 2.08334 15.4167 2.08334H9.64867C9.20667 2.08334 8.78275 2.25893 8.47018 2.57149L4.23816 6.80351C3.92559 7.11608 3.75 7.53999 3.75 7.98203V17.0833C3.75 18.0038 4.49619 18.75 5.41667 18.75H9.58333" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.75 7.91667H9.58333V2.08334" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.7487 15.8333L15.4154 19.1667L12.082 15.8333" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15.4141 18.3333L15.4149 19.1667V12.0833" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ locDownloadPdf }}</span>
          </button>
        </div>
      </div>

      <!-- Selected Locations List -->
      <div class="locations-selection-sidebar__content" data-lenis-prevent>
        <div class="locations-selection-sidebar__list">
          <template v-if="selectedLocations.size === 0">
            <div class="locations-selection-sidebar__empty">
              <div class="locations-selection-sidebar__empty-icon">📍</div>
              <p class="locations-selection-sidebar__empty-text">{{ locEmptyCollection }}</p>
              <p class="locations-selection-sidebar__empty-hint">{{ locEmptyCollectionHint }}</p>
            </div>
          </template>
          <template v-else>
            <div
              v-for="[id, location] in selectedLocations"
              :key="id"
              class="location-card location-card--selected"
              :class="{ 'location-card--dark': isDarkMode }"
            >
              <div class="location-card__badge" @click="removeFromCollection(id)">
                <input type="checkbox" class="location-card__badge-input" checked @click.stop @change="removeFromCollection(id)">
              </div>
              <div class="location-card__focus" @click="focusOnLocation(location)">
                <svg class="location-card__focus-icon location-card__focus-icon--default" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9.375 9.375V13.875" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.375 9.375C11.5841 9.375 13.375 7.58414 13.375 5.375C13.375 3.16586 11.5841 1.375 9.375 1.375C7.16586 1.375 5.375 3.16586 5.375 5.375C5.375 7.58414 7.16586 9.375 9.375 9.375Z" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.125 11.625C15.3667 12.1114 16.875 13.0205 16.875 14.0618C16.875 15.6155 13.5171 16.875 9.375 16.875C5.23286 16.875 1.875 15.6155 1.875 14.0618C1.875 13.0205 3.38324 12.1114 5.625 11.625" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg class="location-card__focus-icon location-card__focus-icon--active" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9.375 9.375V13.875" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.375 9.375C11.5841 9.375 13.375 7.58414 13.375 5.375C13.375 3.16586 11.5841 1.375 9.375 1.375C7.16586 1.375 5.375 3.16586 5.375 5.375C5.375 7.58414 7.16586 9.375 9.375 9.375Z" fill="#0CD459" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.125 11.625C15.3667 12.1114 16.875 13.0205 16.875 14.0618C16.875 15.6155 13.5171 16.875 9.375 16.875C5.23286 16.875 1.875 15.6155 1.875 14.0618C1.875 13.0205 3.38324 12.1114 5.625 11.625" stroke="#0CD459" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="location-card__link" @click.stop="animateToDetail(location, $event)">
                <div class="location-card__image-wrapper">
                  <img v-if="location.image" :src="location.image" :alt="location.name" class="location-card__image location-card__image--desktop" :style="{ objectPosition: `${location.focalX}% ${location.focalY}%` }">
                  <img v-if="location.image" :src="location.image" :alt="location.name" class="location-card__image location-card__image--mobile" :style="{ objectPosition: `${location.focalMobileX}% ${location.focalMobileY}%` }">
                </div>
                <div class="location-card__content">
                  <div class="location-card__meta">
                    <span class="location-card__city">{{ location.city }}</span>
                    <template v-if="location.environments && location.environments.length > 0">
                      <span class="location-card__dot">&bull;</span>
                      <span class="location-card__type">{{ Array.isArray(location.environments) ? location.environments[0] : location.environments }}</span>
                    </template>
                  </div>
                  <h3 class="location-card__name">{{ location.name }}</h3>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div class="locations-overlay" :class="{ 'locations-overlay--visible': isSidebarOpen }" @click="closeSidebar"></div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <div class="location-toast" :class="[toastClass, { 'location-toast--visible': isToastVisible, 'location-toast--dark': isDarkMode }]">
        {{ toastMessage }}
      </div>
    </Teleport>

    <!-- Mobile View Switcher -->
    <!-- ClientOnly: two SVGs of different shape inside a Teleport were
         hitting Vue SSR/hydration mismatches (the server occasionally swapped
         the map icon with the grid icon, leaving the button with the wrong
         or missing SVG in production where Vue does not reconcile). -->
    <ClientOnly>
      <Teleport to="body">
        <div v-show="!isFiltersModalOpen" class="locations-view-switcher">
          <!-- type="button" + @click.stop.prevent: without an explicit type
               iOS Safari has occasionally treated these as submit-style
               buttons (causing a page reload when the click bubbled). The
               .prevent also blocks any iOS gesture that could accompany the
               tap when the button sits near the bottom toolbar zone. -->
          <button
            type="button"
            class="locations-view-switcher__btn"
            :class="{ 'locations-view-switcher__btn--active': currentMobileView === 'grid' }"
            @click.stop.prevent="switchMobileView('grid')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            {{ locViewGrid }}
          </button>
          <button
            type="button"
            class="locations-view-switcher__btn"
            :class="{ 'locations-view-switcher__btn--active': currentMobileView === 'map' }"
            @click.stop.prevent="switchMobileView('map')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 90 90" fill="currentColor" aria-hidden="true"><path d="M45 0C25.463 0 9.625 15.838 9.625 35.375c0 8.722 3.171 16.693 8.404 22.861L45 90l26.97-31.765c5.233-6.167 8.404-14.139 8.404-22.861C80.375 15.838 64.537 0 45 0m0 48.705c-8.035 0-14.548-6.513-14.548-14.548S36.965 19.609 45 19.609s14.548 6.513 14.548 14.548S53.035 48.705 45 48.705"/></svg>
            {{ locViewMap }}
          </button>
        </div>
      </Teleport>
    </ClientOnly>

    <!-- Mobile Filters Modal -->
    <div class="locations-filters-modal" :class="{ 'locations-filters-modal--open': isFiltersModalOpen }">
      <div class="locations-filters-modal__header">
        <h2 class="locations-filters-modal__title">{{ locFiltersTitle }} (<span>{{ totalFiltersCount }}</span>)</h2>
        <button class="locations-filters-modal__close" @click="closeFiltersModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10.125 1.875L1.875 10.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1.875 1.875L10.125 10.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="locations-filters-modal__content" data-lenis-prevent>
        <!-- Cities Accordion -->
        <div class="locations-filters-modal__section" :class="{ 'locations-filters-modal__section--open': isCitiesAccordionOpen }">
          <button class="locations-filters-modal__section-header" @click="isCitiesAccordionOpen = !isCitiesAccordionOpen">
            <span class="locations-filters-modal__section-title">{{ locFiltersCities }} (<span>{{ modalSelectedCities.length }}</span>)</span>
            <svg class="locations-filters-modal__section-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="locations-filters-modal__section-content">
            <label v-for="city in cities" :key="city.id" class="locations-filters-modal__option">
              <span class="locations-filters-modal__option-label">{{ city.name }}</span>
              <input type="checkbox" class="locations-filters-modal__option-checkbox" :value="city.id" v-model="modalSelectedCities" @change="applyModalFilters">
            </label>
          </div>
        </div>

        <!-- Environments Accordion -->
        <div class="locations-filters-modal__section" :class="{ 'locations-filters-modal__section--open': isEnvsAccordionOpen }">
          <button class="locations-filters-modal__section-header" @click="isEnvsAccordionOpen = !isEnvsAccordionOpen">
            <span class="locations-filters-modal__section-title">{{ locFiltersEnvironments }} (<span>{{ modalSelectedEnvironments.length }}</span>)</span>
            <svg class="locations-filters-modal__section-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="locations-filters-modal__section-content">
            <label v-for="env in environments" :key="env.id" class="locations-filters-modal__option">
              <span class="locations-filters-modal__option-label">{{ env.name }}</span>
              <input type="checkbox" class="locations-filters-modal__option-checkbox" :value="env.id" v-model="modalSelectedEnvironments" @change="applyModalFilters">
            </label>
          </div>
        </div>
      </div>

      <div class="locations-filters-modal__footer">
        <button class="locations-filters-modal__btn locations-filters-modal__btn--clear" @click="clearModalFilters">{{ locFiltersClearAll }}</button>
        <button class="locations-filters-modal__btn locations-filters-modal__btn--apply" @click="applyModalFilters">{{ locFiltersApply }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { animateCardToDetail, playReturnToCardAnimation } from '~/composables/useCardTransition'
import 'mapbox-gl/dist/mapbox-gl.css'

// Page meta - hide footer on this page
definePageMeta({
  showFooter: false
})

useHead({
  title: 'Lokacije - Go2Digital'
})

// Split text composable
const { initSplitText, playAnimation, setVisible } = useSplitText()

// CMS-editable translations via settings API
const { t, locale } = useI18n()
const { data: locSettingsData } = useApi<any[]>('/api/settings?group=location', { lazy: true, server: false })

function getLocSetting(key: string): string {
  const settings = Array.isArray(locSettingsData.value) ? locSettingsData.value : (locSettingsData.value as any)?.['hydra:member'] ?? []
  const s = settings.find((s: any) => s.key === key)
  if (!s?.value) return ''
  if (s.value[locale.value]) return s.value[locale.value]
  if (s.value.value !== undefined) return s.value.value
  return ''
}

// All location page texts — CMS overrides with i18n fallback
const locTitle = computed(() => getLocSetting('location.title') || t('location.title'))
const locCollectionView = computed(() => getLocSetting('location.collectionView') || t('location.collectionView'))
const locSearchPlaceholder = computed(() => getLocSetting('location.search.placeholder') || t('location.search.placeholder'))
const locSearchButton = computed(() => getLocSetting('location.search.button') || t('location.search.button'))
const locSearchFilterPlaceholder = computed(() => getLocSetting('location.search.filterPlaceholder') || t('location.search.filterPlaceholder'))
const locFiltersCities = computed(() => getLocSetting('location.filters.cities') || t('location.filters.cities'))
const locFiltersEnvironments = computed(() => getLocSetting('location.filters.environments') || t('location.filters.environments'))
const locFiltersTitle = computed(() => getLocSetting('location.filters.title') || t('location.filters.title'))
const locClearAll = computed(() => getLocSetting('location.clearAll') || t('location.clearAll'))
const locSearchLabel = computed(() => getLocSetting('location.search.label') || t('location.search.label'))
const locNoResults = computed(() => getLocSetting('location.noResults') || t('location.noResults'))
const locCollection = computed(() => getLocSetting('location.collection') || t('location.collection'))
const locShareUrl = computed(() => getLocSetting('location.shareUrl') || t('location.shareUrl'))
const locDownloadPdf = computed(() => getLocSetting('location.downloadPdf') || t('location.downloadPdf'))
const locEmptyCollection = computed(() => getLocSetting('location.emptyCollection') || t('location.emptyCollection'))
const locEmptyCollectionHint = computed(() => getLocSetting('location.emptyCollectionHint') || t('location.emptyCollectionHint'))
const locViewGrid = computed(() => getLocSetting('location.viewSwitcher.grid') || t('location.viewSwitcher.grid'))
const locViewMap = computed(() => getLocSetting('location.viewSwitcher.map') || t('location.viewSwitcher.map'))
const locMapLight = computed(() => getLocSetting('location.mapStyle.light') || t('location.mapStyle.light'))
const locMapDark = computed(() => getLocSetting('location.mapStyle.dark') || t('location.mapStyle.dark'))
const locFiltersAll = computed(() => getLocSetting('location.filters.all') || t('location.filters.all') || 'Sve')
const locFiltersClearAll = computed(() => getLocSetting('location.filters.clearAll') || t('location.filters.clearAll'))
const locFiltersApply = computed(() => getLocSetting('location.filters.apply') || t('location.filters.apply'))
const showClearConfirm = ref(false)
const locToastAdded = computed(() => getLocSetting('location.toast.added') || t('location.toast.added'))
const locToastRemoved = computed(() => getLocSetting('location.toast.removed') || t('location.toast.removed'))
const locConfirmClear = computed(() => getLocSetting('location.confirmClear') || t('location.confirmClear'))

// Types
interface Location {
  id: string
  slug: string
  externalId: string
  name: string
  city: string
  environments: string[]
  lat: number
  lng: number
  image: string
  screens: number
  focalX: number
  focalY: number
  focalMobileX: number
  focalMobileY: number
}

interface City {
  id: string
  name: string
}

interface Environment {
  id: string
  name: string
}

// Mapbox token (fetched from CMS settings)
let MAPBOX_TOKEN = ''

// Storage keys
const STORAGE_KEY = 'selectedLocations'

// Refs
const mapContainer = ref<HTMLElement | null>(null)
const cardsContainer = ref<any>(null)

// Animation refs
const headerRef = ref<HTMLElement | null>(null)
const countRef = ref<HTMLElement | null>(null)
const buttonsRef = ref<HTMLElement | null>(null)
const filtersRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLElement | null>(null)

// Map state
let map: any = null
const isDarkMode = ref(false)
const activeLocationId = ref<string | null>(null)
const focusedLocationId = ref<string | null>(null)

// UI State
const isSidebarOpen = ref(false)
const isLoading = computed(() => !locData.value)
const isScrolled = ref(false)
const currentMobileView = ref('grid')

// Filter State
const isCityDropdownOpen = ref(false)
const isEnvDropdownOpen = ref(false)
const selectedCities = ref<string[]>([])
const selectedEnvironments = ref<string[]>([])
const searchQuery = ref('')
const showSelectedOnly = ref(false)

// Dropdown search filters
const cityFilterQuery = ref('')
const envFilterQuery = ref('')
const citySearchRef = ref<HTMLInputElement | null>(null)
const envSearchRef = ref<HTMLInputElement | null>(null)

function focusCitySearch() { citySearchRef.value?.focus() }
function focusEnvSearch() { envSearchRef.value?.focus() }

const filteredCities = computed(() => {
  if (!cityFilterQuery.value) return cities.value
  const q = cityFilterQuery.value.toLowerCase()
  return cities.value.filter(c => c.name.toLowerCase().includes(q))
})

const filteredEnvironments = computed(() => {
  if (!envFilterQuery.value) return environments.value
  const q = envFilterQuery.value.toLowerCase()
  return environments.value.filter(e => e.name.toLowerCase().includes(q))
})

// Mobile Filters Modal
const isFiltersModalOpen = ref(false)
const isCitiesAccordionOpen = ref(true)
const isEnvsAccordionOpen = ref(true)
const modalSelectedCities = ref<string[]>([])
const modalSelectedEnvironments = ref<string[]>([])

// Toast State
const isToastVisible = ref(false)
const toastMessage = ref('')
const toastType = ref('info')
let toastTimeout: number | null = null

// Selected locations (Map for fast lookup)
const selectedLocations = ref<Map<string, Location>>(new Map())

// Mockup Cities
const CDN_BASE = 'https://cdn.go2digital.hr'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/č/g, 'c').replace(/ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function resolveImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${CDN_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

function parseLocData(data: any[]) {
  const allLocations: Location[] = []
  const cityMap = new Map<string, City>()
  const envMap = new Map<string, Environment>()

  for (const cityData of data) {
    const cityId = String(cityData.city_id)
    const cityName = cityData.name

    if (!cityMap.has(cityId)) {
      cityMap.set(cityId, { id: cityId, name: cityName })
    }

    for (const totem of cityData.totems) {
      const envName = totem.postbuy_category || 'other'
      if (!envMap.has(envName)) {
        envMap.set(envName, { id: envName, name: envName })
      }

      const firstImage = totem.images?.[0]
      const imageUrl = resolveImageUrl(firstImage?.main || firstImage?.large || firstImage?.thumbnail || '')

      allLocations.push({
        id: String(totem.totem_id),
        slug: toSlug(totem.name),
        externalId: String(totem.totem_id),
        name: totem.name,
        city: cityName,
        environments: [envName],
        lat: totem.location?.[0] || 0,
        lng: totem.location?.[1] || 0,
        image: imageUrl,
        screens: totem.screens || 1,
        focalX: totem.image_focal_x ?? 50,
        focalY: totem.image_focal_y ?? 50,
        focalMobileX: totem.image_focal_mobile_x ?? 50,
        focalMobileY: totem.image_focal_mobile_y ?? 50,
      })
    }
  }

  return {
    locations: allLocations,
    cities: Array.from(cityMap.values()),
    environments: Array.from(envMap.values())
  }
}

// Fetch from API (replaces CDN), fallback to CDN if API unavailable
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const { data: locData } = await useFetch<any[]>(`${apiBase}/api/locations`, {
  key: 'locations-data',
  getCachedData: () => undefined, // Always fetch fresh data — order may change via CMS
})

const parsedData = computed(() => {
  if (!locData.value) return { locations: [], cities: [], environments: [] }
  return parseLocData(locData.value)
})

const locations = computed(() => parsedData.value.locations)
const cities = computed(() => parsedData.value.cities)
const environments = computed(() => parsedData.value.environments)

// Computed
const filteredLocations = computed(() => {
  let result = locations.value

  if (showSelectedOnly.value) {
    const selectedIds = Array.from(selectedLocations.value.keys())
    result = result.filter(loc => selectedIds.includes(loc.id))
  }

  if (selectedCities.value.length > 0) {
    const cityNames = selectedCities.value.map(id => getCityName(id))
    result = result.filter(loc => cityNames.includes(loc.city))
  }

  if (selectedEnvironments.value.length > 0) {
    const envNames = selectedEnvironments.value.map(id => getEnvironmentName(id))
    result = result.filter(loc => loc.environments.some(env => envNames.includes(env)))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(loc => loc.name.toLowerCase().includes(query) || loc.city.toLowerCase().includes(query))
  }

  return result
})

const totalScreens = computed(() => filteredLocations.value.reduce((sum, loc) => sum + loc.screens, 0))
const hasActiveFilters = computed(() => selectedCities.value.length > 0 || selectedEnvironments.value.length > 0 || searchQuery.value.trim() !== '')
const totalFiltersCount = computed(() => selectedCities.value.length + selectedEnvironments.value.length)
const currentViewClass = computed(() => `locations-page--${currentMobileView.value}-view`)
const toastClass = computed(() => {
  const classes: Record<string, string> = { success: 'location-toast--success', error: 'location-toast--error', warning: 'location-toast--warning' }
  return classes[toastType.value] || ''
})

// Methods
function getCityName(id: string): string { return cities.value.find(c => c.id === id)?.name || id }
function getEnvironmentName(id: string): string { return environments.value.find(e => e.id === id)?.name || id }

function toggleCityDropdown() {
  isCityDropdownOpen.value = !isCityDropdownOpen.value
  if (isCityDropdownOpen.value) { isEnvDropdownOpen.value = false; envFilterQuery.value = '' }
  else { cityFilterQuery.value = '' }
}

function toggleEnvDropdown() {
  isEnvDropdownOpen.value = !isEnvDropdownOpen.value
  if (isEnvDropdownOpen.value) { isCityDropdownOpen.value = false; cityFilterQuery.value = '' }
  else { envFilterQuery.value = '' }
}

function toggleAllCities() {
  if (selectedCities.value.length === cities.value.length) {
    selectedCities.value = []
  } else {
    selectedCities.value = cities.value.map(c => c.id)
  }
  applyFilters()
}

function toggleAllEnvironments() {
  if (selectedEnvironments.value.length === environments.value.length) {
    selectedEnvironments.value = []
  } else {
    selectedEnvironments.value = environments.value.map(e => e.id)
  }
  applyFilters()
}

function applyFilters() { updateMapMarkers() }
function handleSearch() { applyFilters() }

function removeFilter(type: string, value?: string) {
  if (type === 'city' && value) selectedCities.value = selectedCities.value.filter(id => id !== value)
  else if (type === 'environment' && value) selectedEnvironments.value = selectedEnvironments.value.filter(id => id !== value)
  else if (type === 'search') searchQuery.value = ''
  applyFiltersAndResetMap()
}

function clearAllFilters() {
  selectedCities.value = []
  selectedEnvironments.value = []
  searchQuery.value = ''
  applyFiltersAndResetMap()
}

function applyFiltersAndResetMap() {
  applyFilters()
  // Reset map to fit all currently visible markers
  nextTick(() => {
    const features = filteredLocations.value
      .filter(loc => loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0)
      .map(loc => ({ geometry: { coordinates: [loc.lng, loc.lat] } }))
    fitMapToMarkers(features)
  })
}

function toggleLocation(location: Location) {
  if (selectedLocations.value.has(location.id)) {
    selectedLocations.value.delete(location.id)
    showToast(locToastRemoved.value.replace('{name}', location.name))
  } else {
    selectedLocations.value.set(location.id, location)
    showToast(locToastAdded.value.replace('{name}', location.name))
  }
  saveToStorage()
  updateMapMarkers()
}

function removeFromCollection(id: string) {
  const location = selectedLocations.value.get(id)
  selectedLocations.value.delete(id)
  if (location) showToast(locToastRemoved.value.replace('{name}', location.name))
  saveToStorage()
  updateMapMarkers()
  if (showSelectedOnly.value && selectedLocations.value.size === 0) showSelectedOnly.value = false
}

// ── Nearby Facilities ──
const isFacilitiesOpen = ref(false)
const activeFacilities = ref<string[]>([])

const facilityCategories = [
  { id: 'shopping', label: 'Shopping', icon: '🛍️', overpassQuery: 'node["shop"~"supermarket|mall|department_store|convenience"](around:RADIUS,LAT,LNG);node["amenity"="marketplace"](around:RADIUS,LAT,LNG);' },
  { id: 'food', label: 'Food & Drink', icon: '🍽️', overpassQuery: 'node["amenity"~"restaurant|cafe|bar|fast_food|pub"](around:RADIUS,LAT,LNG);' },
  { id: 'education', label: 'Education', icon: '🎓', overpassQuery: 'node["amenity"~"school|university|college|kindergarten|library"](around:RADIUS,LAT,LNG);way["amenity"~"school|university"](around:RADIUS,LAT,LNG);' },
]

const facilityMarkers = ref<Map<string, any[]>>(new Map())

async function toggleFacilityLayer(facilityId: string) {
  if (!map) return

  const category = facilityCategories.find(c => c.id === facilityId)
  if (!category) return

  if (!activeFacilities.value.includes(facilityId)) {
    // Deactivated — remove markers
    const markers = facilityMarkers.value.get(facilityId) || []
    markers.forEach(m => m.remove())
    facilityMarkers.value.delete(facilityId)
    return
  }

  // Already loaded
  if (facilityMarkers.value.has(facilityId)) return

  // Only search when zoomed in enough (zoom >= 12)
  const zoom = map.getZoom()
  if (zoom < 12) {
    map.flyTo({ zoom: 13, duration: 800 })
    await new Promise(r => setTimeout(r, 1000))
  }

  const center = map.getCenter()
  // Scale radius based on zoom: closer = smaller radius
  const radius = Math.min(3000, Math.max(500, 50000 / Math.pow(2, map.getZoom() - 10)))

  const query = category.overpassQuery
    .replace(/RADIUS/g, String(Math.round(radius)))
    .replace(/LAT/g, String(center.lat.toFixed(6)))
    .replace(/LNG/g, String(center.lng.toFixed(6)))

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:30];(${query});out center 30;`

  try {
    // Try main server, fallback to secondary
    let resp = await fetch(overpassUrl).catch(() => null)
    if (!resp?.ok) {
      const backupUrl = overpassUrl.replace('overpass-api.de', 'overpass.kumi.systems')
      resp = await fetch(backupUrl)
    }
    if (!resp?.ok) throw new Error('Overpass API unavailable')
    const data = await resp.json()

    const markers: any[] = []
    const mapboxgl = await import('mapbox-gl')
    const colorMap: Record<string, string> = { shopping: '#E91E63', food: '#FF9800', education: '#2196F3' }
    const color = colorMap[facilityId] || '#666'

    for (const el of (data.elements || [])) {
      const lat = el.lat || el.center?.lat
      const lng = el.lon || el.center?.lon
      if (!lat || !lng) continue

      const name = el.tags?.name || el.tags?.['name:hr'] || ''
      if (!name) continue

      const markerEl = document.createElement('div')
      markerEl.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%;
        background: ${color}; border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: transform 0.15s ease;
      `
      markerEl.addEventListener('mouseenter', () => { markerEl.style.transform = 'scale(1.3)' })
      markerEl.addEventListener('mouseleave', () => { markerEl.style.transform = 'scale(1)' })
      markerEl.title = name

      const marker = new mapboxgl.default.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.default.Popup({ offset: 10, closeButton: false, maxWidth: '220px' })
            .setHTML(`<div style="font-size:12px;padding:4px 0;font-family:inherit"><strong>${name}</strong><br><span style="color:#999;font-size:11px">${category.label}</span></div>`)
        )
        .addTo(map)

      markers.push(marker)
    }

    facilityMarkers.value.set(facilityId, markers)
  } catch (e) {
    console.error('[Facilities] Overpass query failed:', e)
  }
}

const focusedLocation = computed(() => {
  if (!focusedLocationId.value) return null
  return locations.value.find(l => l.id === focusedLocationId.value) || null
})

let activePopup: any = null

function focusOnLocation(location: Location) {
  // Close existing popup
  if (activePopup) { activePopup.remove(); activePopup = null }

  if (focusedLocationId.value === location.id) {
    closeFocusedLocation()
    return
  }

  focusedLocationId.value = location.id
  activeLocationId.value = location.id
  if (window.innerWidth <= 768) switchMobileView('map')
  if (map) map.flyTo({ center: [location.lng, location.lat], zoom: 15, duration: 1500 })
  updateMapMarkers()

  // Show Mapbox popup at marker position
  if (map) {
    const imgHtml = location.image
      ? `<div class="location-infocard__image"><img src="${location.image}" alt="${location.name}"></div>`
      : ''

    const html = `
      <div class="location-infocard">
        ${imgHtml}
        <div class="location-infocard__body">
          <h3 class="location-infocard__name">${location.name}</h3>
          <div class="location-infocard__footer">
            <a class="location-infocard__link" data-slug="${location.slug}">
              View Location
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 10L10 4M10 4H5.5M10 4V8.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <button class="location-infocard__close" data-close>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `

    import('mapbox-gl').then((mapboxgl) => {
      activePopup = new mapboxgl.default.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '320px',
        offset: [0, -15],
        className: 'location-popup',
      })
        .setLngLat([location.lng, location.lat])
        .setHTML(html)
        .addTo(map)

      // Bind events after popup is added to DOM
      setTimeout(() => {
        const popupEl = activePopup?.getElement()
        if (!popupEl) return

        popupEl.querySelector('[data-close]')?.addEventListener('click', () => closeFocusedLocation())
        popupEl.querySelector('[data-slug]')?.addEventListener('click', (e: Event) => {
          e.preventDefault()
          const slug = (e.currentTarget as HTMLElement).dataset.slug
          if (slug) {
            closeFocusedLocation()
            animateToDetail(location, e as MouseEvent)
          }
        })
      }, 50)
    })
  }
}

function closeFocusedLocation() {
  if (activePopup) { activePopup.remove(); activePopup = null }
  focusedLocationId.value = null
  activeLocationId.value = null
  updateMapMarkers()
  resetMapView()
}

function openLocationDetail(location: Location) { focusOnLocation(location) }

function playReturnAnimation(slug: string, imageSrc: string) {
  // Immediately make all elements visible — skip entrance animations
  initSplitText()

  const allAnimTargets = [countRef.value, buttonsRef.value, filtersRef.value, searchRef.value]
  allAnimTargets.forEach(el => { if (el) gsap.set(el, { opacity: 1, y: 0 }) })

  // Make all split text elements visible immediately
  document.querySelectorAll('[data-split-text]').forEach(el => {
    el.classList.add('split-text-ready')
    const splits = el.querySelectorAll('[style]')
    splits.forEach(s => {
      gsap.set(s, { clipPath: 'none', y: 0, opacity: 1 })
    })
  })

  // Make all cards visible immediately
  const cardsEl = cardsContainer.value?.$el || cardsContainer.value
  if (cardsEl) {
    const cards = cardsEl.querySelectorAll('.location-card')
    gsap.set(cards, { opacity: 1, y: 0 })
  }

  // Create a clone matching the detail page hero (with padding and rounded corners)
  const clone = document.createElement('img')
  clone.src = imageSrc
  clone.style.cssText = `
    position: fixed;
    top: 0;
    left: 3rem;
    width: calc(100vw - 6rem);
    height: 35vh;
    object-fit: cover;
    z-index: 10001;
    pointer-events: none;
    border-radius: 0 0 0.75rem 0.75rem;
  `
  document.body.appendChild(clone)

  // White overlay behind the clone
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

  // Wait for cards to render, then find the target card
  requestAnimationFrame(() => {
    const targetCard = document.querySelector(`.location-card[data-slug="${slug}"]`) as HTMLElement
    let targetImg: HTMLElement | null = null

    if (targetCard) {
      targetImg = targetCard.querySelector('.location-card__image') as HTMLElement

      // Scroll the card into view if needed
      if (cardsEl && targetCard) {
        const cardRect = targetCard.getBoundingClientRect()
        const containerRect = cardsEl.getBoundingClientRect()
        if (cardRect.top < containerRect.top || cardRect.bottom > containerRect.bottom) {
          targetCard.scrollIntoView({ block: 'center' })
        }
      }
    }

    // Get target position
    requestAnimationFrame(() => {
      let targetRect: DOMRect

      if (targetImg) {
        targetRect = targetImg.getBoundingClientRect()
      } else {
        // Fallback: center of sidebar
        targetRect = new DOMRect(150, window.innerHeight / 2 - 80, 220, 165)
      }

      const tl = gsap.timeline({
        onComplete: () => {
          clone.remove()
          overlay.remove()
        }
      })

      // Fade out overlay
      tl.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      })

      // Shrink image to the card position
      tl.to(clone, {
        top: targetRect.top,
        left: targetRect.left,
        width: targetRect.width,
        height: targetRect.height,
        borderRadius: '0.65rem',
        duration: 0.5,
        ease: 'power3.inOut'
      }, 0)

      // Fade out the clone at the end
      tl.to(clone, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in'
      }, 0.45)
    })
  })
}

function animateToDetail(location: Location, event: MouseEvent) {
  animateCardToDetail(event, {
    slug: location.slug,
    basePath: '/lokacije',
    image: location.image,
    title: location.name,
    meta: location.city,
    focalPoint: { x: location.focalX, y: location.focalY },
    extraData: {
      locationTransitionImage: location.image,
      locationTransitionName: location.name,
      locationTransitionCity: location.city,
      locationTransitionEnv: location.environments?.[0] || '',
      locationTransitionFocalX: String(location.focalX),
      locationTransitionFocalY: String(location.focalY),
    },
  }, '.location-card', '.location-card__image')
}
function openSidebar() { isSidebarOpen.value = true }
function closeSidebar() { isSidebarOpen.value = false }

function toggleSelectedOnlyView() {
  if (showSelectedOnly.value && selectedLocations.value.size === 0) {
    showToast('No locations selected', 'warning')
    showSelectedOnly.value = false
    return
  }
  applyFilters()
}

function clearAll() {
  if (selectedLocations.value.size === 0) { resetMapView(); return }
  showClearConfirm.value = true
}

function doClearAll() {
  selectedLocations.value.clear()
  saveToStorage()
  updateMapMarkers()
  showSelectedOnly.value = false
  showToast(locClearAll.value)
  resetMapView()
}

function shareCollection() {
  if (selectedLocations.value.size === 0) { showToast('No locations to share', 'warning'); return }
  const locationIds = Array.from(selectedLocations.value.values()).map(loc => loc.externalId || loc.id).join(',')
  const shareUrl = `${window.location.origin}${window.location.pathname}?locations=${locationIds}`
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl).then(() => showToast('Share URL copied to clipboard!', 'success')).catch(() => showToast(`Share URL: ${shareUrl}`, 'info'))
  } else { showToast(`Share URL: ${shareUrl}`, 'info') }
}

async function exportToPdf() {
  if (selectedLocations.value.size === 0) { showToast('No locations to export', 'warning'); return }

  showToast('Generating PDF...', 'info')

  try {
    const ids = Array.from(selectedLocations.value.keys())
    const config = useRuntimeConfig()

    const response = await fetch(`${config.public.apiBase}/api/locations/export-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/pdf' },
      body: JSON.stringify({ locationIds: ids })
    })

    if (!response.ok) throw new Error(`Export failed: ${response.status}`)

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `go2digital-locations-${new Date().toISOString().slice(0, 10)}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast('PDF downloaded!', 'success')
  } catch (error) {
    console.error('PDF export failed:', error)
    showToast('Failed to generate PDF', 'error')
  }
}

function showToast(message: string, type: string = 'info') {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = message
  toastType.value = type
  isToastVisible.value = true
  toastTimeout = window.setTimeout(() => { isToastVisible.value = false }, 3000)
}

function setMapStyle(style: string) {
  isDarkMode.value = style === 'dark'
  if (map) {
    const styleUrl = isDarkMode.value ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'
    map.setStyle(styleUrl)
    map.once('style.load', () => { loadMapData() })
  }
}

function switchMobileView(view: string) {
  if (currentMobileView.value === view) return
  // Briefly lock the document scroll across the view swap. Map view is
  // 100dvh (non-scrollable) while grid view is many viewports tall — iOS
  // would otherwise see the page become scrollable mid-gesture and treat
  // the tap as the start of a pull-to-refresh.
  const html = document.documentElement
  const prevOverflow = html.style.overflow
  html.style.overflow = 'hidden'
  currentMobileView.value = view
  if (view === 'map' && map) nextTick(() => { map.resize() })
  setTimeout(() => { html.style.overflow = prevOverflow }, 250)
}

function openFiltersModal() {
  modalSelectedCities.value = [...selectedCities.value]
  modalSelectedEnvironments.value = [...selectedEnvironments.value]
  isFiltersModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeFiltersModal() { isFiltersModalOpen.value = false; document.body.style.overflow = '' }
function clearModalFilters() { modalSelectedCities.value = []; modalSelectedEnvironments.value = [] }

function applyModalFilters() {
  selectedCities.value = [...modalSelectedCities.value]
  selectedEnvironments.value = [...modalSelectedEnvironments.value]
  closeFiltersModal()
  applyFilters()
}

const scrollProgress = ref(0)

function onCardsScroll(e: Event) {
  const target = e.target as HTMLElement
  const scrolled = target.scrollTop > 10
  if (scrolled && !isScrolled.value) {
    isCityDropdownOpen.value = false
    isEnvDropdownOpen.value = false
  }
  isScrolled.value = scrolled

  // Calculate scroll progress (0-1)
  const maxScroll = target.scrollHeight - target.clientHeight
  scrollProgress.value = maxScroll > 0 ? target.scrollTop / maxScroll : 0
}

function saveToStorage() {
  try { const data = Array.from(selectedLocations.value.values()); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }
  catch (error) { console.error('Error saving to storage:', error) }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) { const data = JSON.parse(stored); if (Array.isArray(data)) data.forEach((loc: Location) => { selectedLocations.value.set(loc.id, loc) }) }
  } catch (error) { console.error('Error loading from storage:', error); localStorage.removeItem(STORAGE_KEY) }
}

function loadFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const sharedLocations = urlParams.get('locations')
  if (sharedLocations) {
    const externalIds = sharedLocations.split(',').map(id => id.trim()).filter(id => id)
    if (externalIds.length > 0) {
      selectedLocations.value.clear()
      externalIds.forEach(extId => { const loc = locations.value.find(l => l.externalId === extId || l.id === extId); if (loc) selectedLocations.value.set(loc.id, loc) })
      if (selectedLocations.value.size > 0) {
        saveToStorage()
        showToast(`Loaded ${selectedLocations.value.size} shared location(s)`, 'success')
        showSelectedOnly.value = true
        openSidebar()
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }
}

async function initializeMap() {
  if (!mapContainer.value) return
  try {
    const { useMapboxToken } = await import('~/composables/useMapboxToken')
    MAPBOX_TOKEN = await useMapboxToken()
    const mapboxgl = await import('mapbox-gl')
    await import('mapbox-gl/dist/mapbox-gl.css')
    mapboxgl.default.accessToken = MAPBOX_TOKEN
    map = new mapboxgl.default.Map({ container: mapContainer.value, style: 'mapbox://styles/mapbox/light-v11', center: [15.977897644042969, 45.80989696061219], zoom: 8 })
    map.addControl(new mapboxgl.default.NavigationControl())
    map.on('load', () => { loadMapData() })
  } catch (error) { console.error('Failed to load Mapbox:', error); showToast('Failed to load map', 'error') }
}

function loadMapData() {
  if (!map) return
  const features = filteredLocations.value.filter(loc => loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0).map(loc => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] }, properties: { id: loc.id, name: loc.name, city: loc.city, selected: selectedLocations.value.has(loc.id) } }))
  if (map.getLayer('clusters')) map.removeLayer('clusters')
  if (map.getLayer('cluster-count')) map.removeLayer('cluster-count')
  if (map.getLayer('unclustered-point')) map.removeLayer('unclustered-point')
  if (map.getSource('locations')) map.removeSource('locations')
  map.addSource('locations', { type: 'geojson', data: { type: 'FeatureCollection', features }, cluster: true, clusterMaxZoom: 14, clusterRadius: 50 })
  map.addLayer({ id: 'clusters', type: 'circle', source: 'locations', filter: ['has', 'point_count'], paint: { 'circle-color': '#03120F', 'circle-radius': 20 } })
  map.addLayer({ id: 'cluster-count', type: 'symbol', source: 'locations', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 14 }, paint: { 'text-color': '#ffffff' } })
  map.addLayer({ id: 'unclustered-point', type: 'circle', source: 'locations', filter: ['!', ['has', 'point_count']], paint: { 'circle-color': ['case', ['get', 'selected'], '#4CAF50', '#03120F'], 'circle-radius': 10 } })
  map.on('click', 'clusters', (e: any) => { const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] }); const clusterId = features[0].properties.cluster_id; map.getSource('locations').getClusterExpansionZoom(clusterId, (err: any, zoom: number) => { if (err) return; map.easeTo({ center: features[0].geometry.coordinates, zoom }) }) })
  map.on('click', 'unclustered-point', (e: any) => { const { id } = e.features[0].properties; const location = locations.value.find(l => l.id === id); if (location) focusOnLocation(location) })
  map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
  map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })

  // Fit map to show all markers
  fitMapToMarkers(features)
}

function fitMapToMarkers(features: any[]) {
  if (!map || features.length === 0) return

  const LngLatBounds = (map as any).constructor.LngLatBounds || (window as any).mapboxgl?.LngLatBounds
  if (!LngLatBounds) {
    // Fallback: calculate bounds manually
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
    for (const f of features) {
      const [lng, lat] = f.geometry.coordinates
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 15, duration: 500 })
    return
  }

  const bounds = new LngLatBounds()
  for (const f of features) {
    bounds.extend(f.geometry.coordinates)
  }
  map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 })
}

function updateMapMarkers() {
  if (!map || !map.getSource('locations')) return
  const features = filteredLocations.value.filter(loc => loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0).map(loc => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] }, properties: { id: loc.id, name: loc.name, city: loc.city, selected: selectedLocations.value.has(loc.id) } }))
  map.getSource('locations').setData({ type: 'FeatureCollection', features })
  if (focusedLocationId.value) {
    map.setPaintProperty('unclustered-point', 'circle-color', ['case', ['==', ['get', 'id'], focusedLocationId.value], '#4CAF50', ['get', 'selected'], '#4CAF50', '#03120F'])
  } else {
    map.setPaintProperty('unclustered-point', 'circle-color', ['case', ['get', 'selected'], '#4CAF50', '#03120F'])
  }
}

function resetMapView() {
  focusedLocationId.value = null
  activeLocationId.value = null
  updateMapMarkers()
  // Zoom map to fit all visible markers
  const features = filteredLocations.value
    .filter(loc => loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0)
    .map(loc => ({ geometry: { coordinates: [loc.lng, loc.lat] } }))
  fitMapToMarkers(features)
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.custom-select') && !target.closest('.custom-select__dropdown')) { isCityDropdownOpen.value = false; isEnvDropdownOpen.value = false }
}

watch([filteredLocations], () => {
  if (!map || !map.isStyleLoaded()) return
  // Update GeoJSON data only — do NOT call loadMapData() here. loadMapData
  // re-adds the source/layers AND re-binds map.on('click', …) handlers, so
  // every keystroke would stack another click handler on the markers. The
  // popup close button stops working because each pin click then opens
  // multiple popups but activePopup only tracks one.
  updateMapMarkers()
  const features = filteredLocations.value
    .filter(loc => loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0)
    .map(loc => ({ geometry: { coordinates: [loc.lng, loc.lat] } }))
  fitMapToMarkers(features)
})

// ── Sidebar Resize ──
const sidebarWidth = ref(0)
const isResizing = ref(false)
const MIN_SIDEBAR = 400
const MAX_SIDEBAR = 900

function startResize(e: MouseEvent) {
  if (window.innerWidth < 768) return // no resize on mobile
  isResizing.value = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  const onMove = (ev: MouseEvent) => {
    const newWidth = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, ev.clientX))
    sidebarWidth.value = newWidth
    const page = document.querySelector('.locations-page') as HTMLElement
    if (page) page.style.gridTemplateColumns = `${newWidth}px auto 1fr`
  }

  const onUp = () => {
    isResizing.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    if (map) map.resize()
    // Remember sidebar width
    if (sidebarWidth.value) localStorage.setItem('lokacije-sidebar-width', String(sidebarWidth.value))
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function startResizeTouch(e: TouchEvent) {
  if (window.innerWidth < 768) return
  isResizing.value = true

  const onMove = (ev: TouchEvent) => {
    const touch = ev.touches[0]
    const newWidth = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, touch.clientX))
    sidebarWidth.value = newWidth
    const page = document.querySelector('.locations-page') as HTMLElement
    if (page) page.style.gridTemplateColumns = `${newWidth}px auto 1fr`
  }

  const onEnd = () => {
    isResizing.value = false
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onEnd)
    if (map) map.resize()
    if (sidebarWidth.value) localStorage.setItem('lokacije-sidebar-width', String(sidebarWidth.value))
  }

  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('touchend', onEnd)
}

onMounted(async () => {
  loadFromStorage()
  loadFromUrl()

  // Restore saved sidebar width
  const savedWidth = localStorage.getItem('lokacije-sidebar-width')
  if (savedWidth && window.innerWidth >= 768) {
    const w = Math.min(MAX_SIDEBAR, Math.max(MIN_SIDEBAR, parseInt(savedWidth)))
    sidebarWidth.value = w
    const page = document.querySelector('.locations-page') as HTMLElement
    if (page) page.style.gridTemplateColumns = `${w}px auto 1fr`
  }

  await nextTick()
  initializeMap()
  document.addEventListener('click', handleClickOutside)

  // Check if returning from a detail page
  const returnSlug = sessionStorage.getItem('returnSlug')
  const returnImage = sessionStorage.getItem('returnImage')
  sessionStorage.removeItem('returnSlug')
  sessionStorage.removeItem('returnImage')

  if (returnSlug && returnImage) {
    // Make all elements visible immediately — skip entrance animations
    initSplitText()
    const allAnimTargets = [countRef.value, buttonsRef.value, filtersRef.value, searchRef.value]
    allAnimTargets.forEach(el => { if (el) gsap.set(el, { opacity: 1, y: 0 }) })
    document.querySelectorAll<HTMLElement>('[data-split-text]').forEach(el => {
      el.classList.add('split-text-ready')
      // Mark the parent as animated so any later re-split (e.g. CMS settings
      // arriving after navigation) lands in the visible state.
      setVisible(el)
      el.querySelectorAll('[style]').forEach(s => {
        gsap.set(s, { clipPath: 'none', y: 0, opacity: 1 })
      })
    })
    const cardsEl = cardsContainer.value?.$el || cardsContainer.value
    if (cardsEl) {
      const cards = cardsEl.querySelectorAll('.location-card')
      if (cards.length > 0) gsap.set(cards, { opacity: 1, y: 0 })
    }

    playReturnToCardAnimation(
      returnSlug,
      returnImage,
      '.location-card',
      '.location-card__image'
    )
  } else {
    // Initialize split text and run entrance animations
    initSplitText()
    runEntranceAnimations()
  }
})

// Entrance animations
const runEntranceAnimations = () => {
  const tl = gsap.timeline({ delay: 0.2 })

  // Animate title (split text)
  const titleEl = document.querySelector('.locations-sidebar__title')
  if (titleEl) {
    tl.add(() => playAnimation(titleEl as HTMLElement), 0)
  }

  // Animate count
  if (countRef.value) {
    gsap.set(countRef.value, { opacity: 0, y: 10 })
    tl.to(countRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.3)
  }

  // Animate buttons wrapper
  if (buttonsRef.value) {
    gsap.set(buttonsRef.value, { opacity: 0, y: 15 })
    tl.to(buttonsRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.4)
  }

  // Animate filters
  if (filtersRef.value) {
    gsap.set(filtersRef.value, { opacity: 0, y: 15 })
    tl.to(filtersRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.5)
  }

  // Animate search
  if (searchRef.value) {
    gsap.set(searchRef.value, { opacity: 0, y: 15 })
    tl.to(searchRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.6)
  }

  // Animate cards with stagger
  const cardsEl = cardsContainer.value?.$el || cardsContainer.value
  if (cardsEl) {
    const cards = cardsEl.querySelectorAll('.location-card')
    if (cards.length > 0) {
      gsap.set(cards, { opacity: 0, y: 30 })
      tl.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
      }, 0.7)
    }
  }
}
onUnmounted(() => { if (map) { map.remove(); map = null }; document.removeEventListener('click', handleClickOutside); if (toastTimeout) clearTimeout(toastTimeout) })
</script>

<style lang="scss" scoped>
// Variables and mixins are now globally available via nuxt.config.ts

.locations-page {
  display: grid;
  grid-template-columns: 680px auto 1fr;
  min-height: 100dvh;
  background-color: $color-background;
  contain: layout style;
  // Block iOS pull-to-refresh on this page. Switching from map view
  // (100dvh, non-scrollable) to grid view (huge scrollable content) made
  // iOS interpret the in-flight gesture as a refresh request.
  overscroll-behavior-y: contain;

  @include desktop { grid-template-columns: 520px auto 1fr; }
  @include tablet { grid-template-columns: 1fr; }

  &--grid-view { @include tablet { .locations-sidebar { display: flex; } .locations-map { display: none; } } }
  &--map-view { @include tablet { .locations-sidebar { display: none; } .locations-map { display: block; } } }
  &--dark { background-color: $dark-background; }
}

.locations-sidebar {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  border-right: 1px solid $color-border;
  background-color: $color-background;
  position: sticky;
  top: 0;
  container-type: inline-size;
  container-name: sidebar;

  @include tablet { height: auto; min-height: 100dvh; border-right: none; }

  // Dark mode
  &--dark {
    background-color: $dark-background;
    border-color: $dark-border;

    .locations-sidebar__header { border-color: $dark-border; }
    .locations-sidebar__title { color: $dark-text; }
    .locations-sidebar__count { color: $dark-muted; }
    .locations-sidebar__clear-btn { border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__view-toggle { color: $dark-text; }
    .locations-sidebar__mode-btn { border-color: $dark-border; color: $dark-text; &--active { background-color: $dark-text; color: $dark-background; } }
    .locations-sidebar__filters { border-color: $dark-border; }
    .locations-sidebar__mobile-buttons { border-color: $dark-border; }
    .locations-sidebar__collection-btn,
    .locations-sidebar__filters-btn { border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__search { border-color: $dark-border; }
    .locations-sidebar__search-input { background-color: $dark-surface; border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__active-filters { border-color: $dark-border; }
    .locations-sidebar__tag { border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__clear-all { color: $dark-muted; &:hover { color: $dark-text; } }
    .locations-sidebar__empty { color: $dark-muted; }
  }

  // Collapsible toolbar
  &__toolbar {
    overflow: visible;
    position: relative;
    z-index: $z-dropdown + 1;
    max-height: 500px;
    opacity: 1;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    border-top: 1px solid $color-border;

    &--collapsed {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }
  }

  // Scroll progress bar
  &__progress {
    height: 1px;
    background-color: $color-border;
    flex-shrink: 0;
  }

  &__progress-bar {
    height: 100%;
    background-color: $color-accent;
    transform-origin: left center;
    transform: scaleX(0);
    transition: transform 0.1s linear;
  }

  // ── Header ──
  &__header {
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;

    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      padding-top: 7rem;
    }
  }

  &__title-row { display: flex; align-items: baseline; gap: 0.375rem; }

  &__title {
    font-size: 2.75rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.03em;
    margin: 0;
  }

  &__count {
    font-size: $font-size-old-base;   /* old: 1rem */
    color: $color-muted;
    align-self: flex-start;
    margin-top: 0.25rem;
  }

  &__buttons-wrapper {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex-shrink: 0;
  }

  &__clear-btn {
    padding: 0.5rem;
    border: none;
    border-radius: $radius-sm;
    background: transparent;
    cursor: pointer;
    @include flex-center;
    color: $color-primary;
    transition: background $transition-base;

    &:hover {
      background:$color-border;
    }
  }

  &__view-toggle {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-size: $font-size-sm;
    cursor: pointer;
    padding: 0.5rem 0.875rem;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
  }

  &__view-checkbox { width: 1rem; height: 1rem; accent-color: $color-accent; }

  &__mode-switch { display: none; @include tablet { display: flex; gap: $spacing-xs; } }
  &__mode-btn {
    padding: 0.375rem 0.75rem;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: transparent;
    font-size: $font-size-old-xs;     /* old: 0.75rem */
    font-weight: 400;
    text-transform: capitalize;
    cursor: pointer;
    transition: all $transition-base;
    &--active { background-color: $color-primary; border-color: $color-primary; color: $color-background; }
  }

  // ── Filters ──
  &__filters {
    padding: 2rem;
    position: relative;
    z-index: $z-dropdown + 1;
    @include tablet { display: none; }
  }

  &__filter-group { display: flex; gap: 0.75rem; position: relative; z-index: $z-dropdown + 2; }

  &__mobile-buttons {
    display: none;
    padding: $spacing-md 1.75rem;
    gap: $spacing-md;
    @include tablet { display: flex; }
  }

  &__collection-btn,
  &__filters-btn {
    flex: 1;
    @include flex-center;
    gap: $spacing-sm;
    padding: 0.75rem $spacing-md;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: transparent;
    font-size: $font-size-old-base;   /* old: 1rem */
    font-weight: 400;
    cursor: pointer;
  }

  &__collection-btn-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: $color-accent; }

  // ── Search ──
  &__search {
    display: flex;
    gap: 0;
    padding: 0 2rem 2rem;
  }

  &__search-input {
    flex: 1;
    padding: 1rem;
    border: 1px solid $color-border;
    border-radius: $radius-md 0 0 $radius-md;
    border-right: none;
    font-size: $font-size-old-base;   /* old: 1rem */
    font-weight: 400;
    line-height: 1.3;
    font-family: inherit;
    background: transparent;
    transition: border-color $transition-base;
    &:focus { outline: none; border-color: $color-primary; }
    &::placeholder { color: $color-muted; }
  }

  &__search-btn {
    padding: 0.875rem 1.5rem;
    border: 1px solid $color-border;
    border-left: none;
    border-radius: 0 $radius-md $radius-md 0;
    background-color: $color-surface;
    color: $color-primary;
    font-size: $font-size-old-xs;     /* old: $font-base = 0.75rem */
    font-family: inherit;
    font-weight: 400;
    cursor: pointer;
    transition: background-color $transition-base, border-color $transition-base;
    &:hover { background-color: #e8e8e8; }
  }

  &__search:focus-within &__search-btn {
    border-top-color: $color-primary;
    border-right-color: $color-primary;
    border-bottom-color: $color-primary;
  }

  // ── Active Filters ──
  &__active-filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-sm;
    padding: 0 1.75rem 1.25rem;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: transparent;
    font-size: 0.8125rem;             /* old site: 0.8125rem raw */
    font-weight: 400;
  }

  &__tag-close {
    cursor: pointer;
    opacity: 0.4;
    font-size: 1rem;
    line-height: 1;
    transition: opacity $transition-fast;
    &:hover { opacity: 1; }
  }

  &__clear-all {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    margin-left: auto;
    font-size: 0.8125rem;             /* old site: 0.8125rem raw */
    color: $color-primary;
    text-decoration: none;
    font-weight: 400;
    transition: opacity $transition-base;
    &:hover { opacity: 0.7; }
  }

  // ── Cards Grid (responsive to sidebar width via container queries) ──
  &__shimmer {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem 1rem;
    padding: 1.75rem;
    overflow: hidden;

    @container sidebar (max-width: 480px) { grid-template-columns: 1fr; }
    @container sidebar (min-width: 750px) { grid-template-columns: repeat(3, 1fr); }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
    gap: 1.5rem 1rem;
    padding: 1.75rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;

    // Desktop only: the sidebar has fixed 100dvh height so this container
    // does the scrolling. Isolate it so the wheel/touch doesn't chain out.
    // On mobile the sidebar grows with content and the body does the
    // scrolling — applying these rules there makes iOS claim the touch for
    // a non-scrollable region and the page becomes unscrollable after the
    // first gesture.
    @media (min-width: 768px) {
      touch-action: pan-y;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    @container sidebar (max-width: 480px) { grid-template-columns: 1fr; }
    @container sidebar (min-width: 750px) { grid-template-columns: repeat(3, 1fr); }
    @include mobile { grid-template-columns: 1fr; }
  }

  &__empty { grid-column: 1 / -1; text-align: center; padding: $spacing-xl; color: $color-muted; }
}

.custom-select {
  position: relative;
  flex: 1;

  &__trigger {
    width: 100%;
    @include flex-between;
    padding: 1rem;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background: transparent;
    font-size: $font-size-base;
    font-family: inherit;
    cursor: pointer;
    transition: border-color $transition-base;
    &:hover { border-color: #b8b8b8; }
    .custom-select--open & { border-color: $color-primary; }
    .locations-sidebar--dark & { border-color: $dark-border; color: $dark-text; }
  }

  &__icon {
    flex-shrink: 0;
    opacity: 0.4;
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 360px;
    display: flex;
    flex-direction: column;
    background-color: $color-background;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
    margin-top: $spacing-sm;
    z-index: $z-dropdown;
    .locations-sidebar--dark & { background-color: $dark-surface; border-color: $dark-border; }
  }

  &__search {
    padding: $spacing-sm;
    border-bottom: 1px solid $color-border;
    flex-shrink: 0;
  }

  &__search-input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    font-family: inherit;
    background: transparent;
    transition: border-color $transition-base;
    &:focus { outline: none; border-color: $color-primary; }
    &::placeholder { color: $color-muted; }
    .locations-sidebar--dark & { border-color: $dark-border; color: $dark-text; background: $dark-background; }
  }

  &__options {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  &__no-results {
    padding: $spacing-lg;
    text-align: center;
    font-size: $font-size-sm;
    color: $color-muted;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem $spacing-lg;
    font-size: $font-size-base;
    cursor: pointer;
    transition: background-color $transition-base;
    border: none;
    background: none;
    width: 100%;
    font-family: inherit;
    text-align: left;
    &:hover { background-color: rgba($color-primary, 0.05); }
    .locations-sidebar--dark & { color: $dark-text; &:hover { background-color: rgba($dark-text, 0.1); } }
    input[type="checkbox"] {
      -webkit-appearance: none;
      appearance: none;
      width: 1.375rem;
      height: 1.375rem;
      border: 1.5px solid $color-border;
      border-radius: $radius-sm;
      background: $color-background;
      flex-shrink: 0;
      cursor: pointer;
      position: relative;
      transition: border-color 0.15s ease;

      &:checked {
        border-color: #c8c8c8;
      }

      &:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 50%;
        background-color: $color-accent;
      }

      .locations-sidebar--dark & {
        border-color: $dark-border;
        background: $dark-surface;
        &:checked { border-color: $dark-border; }
      }
    }

    &--selected {
      background-color: rgba($color-primary, 0.05);
    }

    &--all {
      background-color: rgba($color-primary, 0.04);
      font-weight: 500;
      .locations-sidebar--dark & { background-color: rgba($dark-text, 0.08); }
    }
  }
}

.location-card {
  position: relative;
  background-color: $color-background;
  transition: opacity $transition-base;
  contain: layout style;

  &:hover { opacity: 0.9; }
  &--active .location-card__badge { }

  &--dark {
    background-color: $dark-surface;
    .location-card__badge { background-color: $dark-surface; }
    .location-card__focus { background-color: $dark-surface; }
    .location-card__image-wrapper { background-color: $dark-background; }
    .location-card__city,
    .location-card__type { color: $dark-muted; }
    .location-card__name { color: $dark-text; }
  }

  &__badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 10;
    width: 2rem;
    height: 2rem;
    @include flex-center;
    background-color: #fff;
    border-radius: $radius-md;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: box-shadow $transition-base;
    &:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15); }
  }

  &__badge-input {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border: 0.0625rem solid $color-accent;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    position: relative;

    &:checked {
      background-color: $color-accent;
    }
  }

  &__focus {
    position: absolute;
    top: 0.75rem;
    left: 3.125rem;
    z-index: 10;
    width: 2rem;
    height: 2rem;
    @include flex-center;
    background-color: #fff;
    border-radius: $radius-md;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform $transition-base, box-shadow $transition-base;
    &:hover { transform: scale(1.05); box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15); }
  }

  &__focus-icon {
    &--default { display: block; }
    &--active { display: none; }
    .location-card--active & {
      &--default { display: none; }
      &--active { display: block; }
    }
  }

  &__link { display: block; text-decoration: none; color: inherit; cursor: pointer; }

  &__image-wrapper {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: $radius-lg;
    background-color: $color-surface;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-slow;
    .location-card:hover & { transform: scale(1.03); }

    &--mobile { display: none; }

    @include tablet {
      &--desktop { display: none; }
      &--mobile { display: block; }
    }
  }

  &__content { padding: 0.625rem 0; }

  &__meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin-bottom: 0.25rem;
  }

  &__city,
  &__type { font-size: 0.8125rem; color: $color-muted; }   /* old .location-card__meta: 0.8125rem */
    &__dot { font-size: 0.375rem; color: $color-muted; }

  &__name {
    font-size: 0.9375rem;             /* old .location-card__name: 0.9375rem */
    font-weight: 500;                 /* old: 500 */
    line-height: 1.3;
    margin: 0;
    color: $color-primary;
    @include text-clamp(2);
  }
}

// Shimmer loading state
.location-card-shimmer {
  position: relative;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;
  background-color: $color-background;

  &__badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: $radius-sm;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  &__image {
    aspect-ratio: 4 / 3;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  &__content { padding: 0.75rem; }

  &__line {
    height: 0.75rem;
    border-radius: $radius-sm;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin-bottom: $spacing-sm;
    &--short { width: 40%; }
    &--long { width: 80%; }
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// Resize handle
.locations-resize {
  width: 12px;
  cursor: col-resize;
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  @include tablet { display: none; }

  &:hover,
  &:active {
    background-color: rgba($color-accent, 0.06);

    .locations-resize__grip span {
      background-color: $color-accent;
    }
  }

  &__grip {
    display: grid;
    grid-template-columns: repeat(2, 4px);
    gap: 3px;
    padding: 4px 0;
  }

  &__grip span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: $color-border;
    transition: background-color 0.2s ease;
  }
}

// Map container
.locations-map {
  position: relative;
  height: 100dvh;
  contain: layout;

  @include tablet { height: 100dvh; }

  &--dark {
    .locations-map__controls { background-color: $dark-surface; }
    .locations-map__toggle { color: $dark-text; &--active { background-color: $dark-text; color: $dark-background; } }
  }

  &__controls {
    position: absolute;
    top: $spacing-xl;
    left: $spacing-xl;
    display: flex;
    gap: $spacing-xs;
    z-index: 10;
    background-color: $color-background;
    border-radius: $radius-sm;
    padding: $spacing-xs;
    box-shadow: $shadow-sm;
    @include tablet { display: none; }
  }

  &__toggle {
    padding: $spacing-sm $spacing-md;
    border: none;
    border-radius: $radius-sm;
    background: transparent;
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-base;
    &--active { background-color: $color-primary; color: $color-background; }
  }

  &__container { width: 100%; height: 100%; }

  // Nearby Facilities
  &__facilities {
    position: absolute;
    top: 2rem;
    right: 11.5rem;
    z-index: 5;
    width: 200px;

    &--dark {
      .locations-map__facilities-toggle { background: $dark-surface; color: $dark-text; border-color: $dark-border; }
      .locations-map__facilities-dropdown { background: $dark-surface; border-color: $dark-border; }
      .locations-map__facilities-option { color: $dark-text; &:hover { background: rgba($dark-text, 0.05); } &--active { background: rgba($dark-text, 0.08); } }
    }
  }

  &__facilities-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1rem;
    background: #fff;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: border-color $transition-base;
    &:hover { border-color: #b8b8b8; }
    .locations-map__facilities--open & { border-color: $color-primary; }
  }

  &__facilities-label {
    white-space: nowrap;
  }

  &__facilities-chevron {
    flex-shrink: 0;
    opacity: 0.4;
  }

  &__facilities-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    min-width: 200px;
    background: #fff;
    border: 1px solid $color-border;
    border-radius: $radius-lg;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 0.375rem;
    display: flex;
    flex-direction: column;
  }

  &__facilities-option {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    border-radius: $radius-md;
    cursor: pointer;
    font-size: $font-size-sm;
    transition: background $transition-base;

    &:hover { background: rgba($color-primary, 0.04); }
    &--active { background: rgba($color-accent, 0.08); }

    input { display: none; }
  }

  &__facilities-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  &__facilities-label {
    flex: 1;
  }
}


// Collection badge
.locations-collection {
  position: absolute;
  top: $spacing-xl;
  right: $spacing-2xl;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 0.75rem 1.25rem;
  background-color: $color-background;
  border-radius: $radius-sm;
  box-shadow: $shadow-sm;
  cursor: pointer;
  z-index: 10;
  transition: transform $transition-base;

  &:hover { transform: scale(1.02); }
  @include tablet { display: none; }
  &--dark { background-color: $dark-surface; .locations-collection__text { color: $dark-text; } }
  &__dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: $color-accent; }
  &__text { font-size: $font-size-sm; }
}

// Selection sidebar
.locations-selection-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100%;
  height: 100dvh;
  background-color: $color-background;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform $transition-slow;
  z-index: $z-modal;
  display: flex;
  flex-direction: column;
  contain: layout style;

  &--open { transform: translateX(0); }
  &--dark {
    background-color: $dark-background;
    .locations-selection-sidebar__header { border-color: $dark-border; }
    .locations-selection-sidebar__title { color: $dark-text; }
    .locations-selection-sidebar__close { color: $dark-text; }
    .locations-selection-sidebar__share-btn,
    .locations-selection-sidebar__export-btn { border-color: $dark-border; color: $dark-text; }
    .locations-selection-sidebar__empty { color: $dark-muted; }
    .locations-selection-sidebar__empty-hint { color: rgba($dark-text, 0.4); }
  }

  &__header { padding: $spacing-lg; border-bottom: 1px solid $color-border; }
  &__title-wrapper { @include flex-between; margin-bottom: $spacing-md; }
  &__title { font-size: $font-size-lg; font-weight: 400; margin: 0; }
  &__close { padding: $spacing-sm; border: none; background: transparent; cursor: pointer; }
  &__header-actions { display: flex; gap: $spacing-lg; }
  &__share-btn,
  &__export-btn {
    flex: 1;
    @include flex-center;
    gap: $spacing-sm;
    padding: 0.75rem $spacing-md;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background: transparent;
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-base;
    &:hover { border-color: $color-primary; }
  }
  &__content { flex: 1; overflow-y: auto; padding: $spacing-lg; contain: strict; }
  &__list { display: flex; flex-direction: column; gap: $spacing-md; }
  &__empty { text-align: center; padding: $spacing-xl; }
  &__empty-icon { font-size: 2rem; margin-bottom: $spacing-md; }
  &__empty-text { color: $color-muted; margin: 0 0 $spacing-sm; }
  &__empty-hint { font-size: $font-size-sm; color: rgba($color-primary, 0.4); margin: 0; }
}

// Overlay
.locations-overlay {
  @include fixed-fill;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity $transition-slow, visibility $transition-slow;
  z-index: $z-modal-backdrop;
  &--visible { opacity: 1; visibility: visible; }
}

// Mobile view switcher
.locations-view-switcher {
  position: fixed;
  // Lift above iOS Safari's bottom toolbar / home-indicator zone so taps
  // reliably land on the buttons instead of the system chrome.
  bottom: calc(2rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: none;
  gap: $spacing-xs;
  padding: $spacing-xs;
  background-color: $color-background;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  box-shadow: $shadow-lg;
  z-index: $z-fixed;
  // Suppress iOS double-tap zoom and tap highlight on these critical buttons.
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  @include tablet { display: flex; }

  &__btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: $radius-full;
    background: transparent;
    color: $color-primary;
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-base;
    &--active { background-color: $color-primary; color: $color-background; }
  }
}

// Mobile filters modal
.locations-filters-modal {
  @include fixed-fill;
  background-color: $color-background;
  transform: translateY(100%);
  transition: transform $transition-slow;
  z-index: $z-modal + 1;
  display: none;
  flex-direction: column;

  @include tablet { display: flex; }
  &--open { transform: translateY(0); }

  &__header {
    @include flex-between;
    padding: $spacing-lg;
    border-bottom: 1px solid $color-border;
    @include mobile { padding-top: 7rem; }
  }
  &__title { font-size: $font-size-lg; font-weight: 400; margin: 0; }
  &__close { padding: $spacing-sm; border: none; background: transparent; cursor: pointer; }
  &__content { flex: 1; overflow-y: auto; padding: 0; }
  &__section {
    border-bottom: 1px solid $color-border;
    &--open {
      .locations-filters-modal__section-content { display: block; }
      .locations-filters-modal__section-icon { transform: rotate(180deg); }
    }
  }
  &__section-header {
    @include flex-between;
    width: 100%;
    padding: 1.25rem $spacing-lg;
    border: none;
    background: transparent;
    font-size: $font-size-md;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
  }
  &__section-icon { transition: transform $transition-base; }
  &__section-content { display: none; padding: 0 $spacing-lg $spacing-lg; }
  &__option {
    @include flex-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba($color-border, 0.5);
    cursor: pointer;
    &:last-child { border-bottom: none; }
  }
  &__option-label { font-size: $font-size-base; }
  &__option-checkbox {
    accent-color: $color-accent;
    width: 1.25rem;
    height: 1.25rem;
    margin: 0;
    flex-shrink: 0;
    cursor: pointer;
  }
  &__footer { display: flex; gap: $spacing-lg; padding: $spacing-lg; border-top: 1px solid $color-border; }
  &__btn {
    flex: 1;
    padding: $spacing-md;
    border-radius: $radius-md;
    font-size: $font-size-base;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-base;
    &--clear { border: 1px solid $color-border; background: transparent; &:hover { border-color: $color-primary; } }
    &--apply { border: none; background-color: $color-primary; color: $color-background; &:hover { opacity: 0.9; } }
  }
}

// Card list transition
.card-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.card-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.card-move {
  transition: transform 0.3s ease;
}

// Dropdown transition
.dropdown-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

<style lang="scss">
// Toast notification (unscoped for Teleport)
.location-toast {
  position: fixed;
  bottom: $spacing-xl;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: $spacing-md $spacing-lg;
  background-color: $color-primary;
  color: $color-background;
  border-radius: $radius-md;
  font-size: $font-size-base;
  box-shadow: $shadow-lg;
  opacity: 0;
  visibility: hidden;
  transition: all $transition-slow;
  z-index: $z-toast;
  white-space: nowrap;

  &--visible { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
  &--success { background-color: #4CAF50; }
  &--error { background-color: #f44336; }
  &--warning { background-color: #ff9800; }
  &--dark { background-color: $color-background; color: $color-primary; }
}
</style>

<!-- Unscoped styles for Mapbox popup (rendered outside Vue scope) -->
<style lang="scss">
.location-popup {
  .mapboxgl-popup-content {
    padding: 0;
    border-radius: 1rem;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
    overflow: hidden;
  }

  .mapboxgl-popup-tip {
    display: none;
  }
}

.location-infocard {
  width: 300px;

  &__image {
    width: 100%;
    aspect-ratio: 16/10;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    padding: 1.25rem;
  }

  &__name {
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.2;
    margin: 0 0 1.25rem;
    color: #03120F;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: #03120F;
    text-decoration: none;
    cursor: pointer;
    border-bottom: 1px solid #03120F;
    padding-bottom: 0.125rem;
    transition: opacity 0.2s;
    &:hover { opacity: 0.7; }
  }

  &__close {
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #E5E5E5;
    border-radius: 0.5rem;
    background: none;
    cursor: pointer;
    color: #03120F;
    transition: border-color 0.2s;
    &:hover { border-color: #03120F; }
  }
}
</style>
