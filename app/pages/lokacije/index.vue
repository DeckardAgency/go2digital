<template>
  <div class="locations-page" :class="[currentViewClass, { 'locations-page--dark': isDarkMode, 'locations-page--scrolled': isScrolled }]">
    <!-- Sidebar -->
    <aside class="locations-sidebar" :class="{ 'locations-sidebar--dark': isDarkMode, 'locations-sidebar--scrolled': isScrolled }">
      <!-- Header -->
      <div class="locations-sidebar__header">
        <h1 class="locations-sidebar__title">
          {{ $t('location.title') }}
          <span class="locations-sidebar__count">({{ totalScreens }})</span>
        </h1>

        <div class="locations-sidebar__buttons-wrapper">
          <button class="locations-sidebar__clear-btn" @click="clearAll" :style="{ display: selectedLocations.size > 0 ? 'block' : 'none' }">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m16.111 7.083-.42 10.07a1.667 1.667 0 0 1-1.664 1.597h-7.22a1.666 1.666 0 0 1-1.665-1.598l-.42-10.069M8.75 3.75v-.833c0-.46.373-.834.833-.834h1.667c.46 0 .833.374.833.834v.833M8.75 15.417v-5M12.086 15.417v-5M4.585 3.75H16.25c.92 0 1.667.747 1.667 1.667v1.666h-15V5.417c0-.92.747-1.667 1.667-1.667Z"/></svg>
          </button>
          <label class="locations-sidebar__view-toggle">
            <span>{{ $t('location.collectionView') }}</span>
            <input type="checkbox" v-model="showSelectedOnly" class="locations-sidebar__view-checkbox" @change="toggleSelectedOnlyView">
          </label>

          <!-- Mobile Mode Switch -->
          <div class="locations-sidebar__mode-switch">
            <button
              class="locations-sidebar__mode-btn"
              :class="{ 'locations-sidebar__mode-btn--active': !isDarkMode }"
              @click="setMapStyle('light')"
            >
              {{ $t('location.mapStyle.light') }}
            </button>
            <button
              class="locations-sidebar__mode-btn"
              :class="{ 'locations-sidebar__mode-btn--active': isDarkMode }"
              @click="setMapStyle('dark')"
            >
              {{ $t('location.mapStyle.dark') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Filters (Desktop) -->
      <div class="locations-sidebar__filters">
        <div class="locations-sidebar__filter-group">
          <!-- Cities Dropdown -->
          <div class="custom-select" :class="{ 'custom-select--open': isCityDropdownOpen }">
            <button class="custom-select__trigger" @click="toggleCityDropdown">
              <span class="custom-select__label">
                {{ selectedCities.length > 0 ? `${$t('location.filters.cities')} (${selectedCities.length})` : $t('location.filters.cities') }}
              </span>
              <svg class="custom-select__arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="custom-select__dropdown" v-show="isCityDropdownOpen">
              <label v-for="city in cities" :key="city.id" class="custom-select__option">
                <input type="checkbox" :value="city.id" v-model="selectedCities" @change="applyFilters">
                <span class="custom-select__checkmark"></span>
                <span>{{ city.name }}</span>
              </label>
            </div>
          </div>

          <!-- Environments Dropdown -->
          <div class="custom-select" :class="{ 'custom-select--open': isEnvDropdownOpen }">
            <button class="custom-select__trigger" @click="toggleEnvDropdown">
              <span class="custom-select__label">
                {{ selectedEnvironments.length > 0 ? `${$t('location.filters.environments')} (${selectedEnvironments.length})` : $t('location.filters.environments') }}
              </span>
              <svg class="custom-select__arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="custom-select__dropdown" v-show="isEnvDropdownOpen">
              <label v-for="env in environments" :key="env.id" class="custom-select__option">
                <input type="checkbox" :value="env.id" v-model="selectedEnvironments" @change="applyFilters">
                <span class="custom-select__checkmark"></span>
                <span>{{ env.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Buttons Row -->
      <div class="locations-sidebar__mobile-buttons">
        <button class="locations-sidebar__collection-btn" @click="openSidebar">
          <span class="locations-sidebar__collection-btn-dot"></span>
          <span class="locations-sidebar__collection-btn-text">{{ $t('location.collection') }} (<span>{{ selectedLocations.size }}</span>)</span>
        </button>

        <button class="locations-sidebar__filters-btn" @click="openFiltersModal">
          <span class="locations-sidebar__filters-btn-text">{{ $t('location.filters.title') }} (<span>{{ totalFiltersCount }}</span>)</span>
        </button>
      </div>

      <!-- Search -->
      <div class="locations-sidebar__search">
        <input
          type="text"
          class="locations-sidebar__search-input"
          :placeholder="$t('location.search.placeholder')"
          v-model="searchQuery"
          @keyup.enter="handleSearch"
        >
        <button class="locations-sidebar__search-btn" @click="handleSearch">{{ $t('location.search.button') }}</button>
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
          {{ $t('location.search.label') }}: "{{ searchQuery }}"
          <span class="locations-sidebar__tag-close" @click="removeFilter('search')">&times;</span>
        </span>
        <a href="#" class="locations-sidebar__clear-all" @click.prevent="clearAllFilters">
          {{ $t('location.clearAll') }}
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M0.5 0.5L8.75 8.75" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </a>
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
      <div class="locations-sidebar__cards" v-show="!isLoading" ref="cardsContainer" @scroll="onCardsScroll">
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

          <a :href="`/lokacije/${location.slug}`" class="location-card__link" target="_blank" @click.stop>
            <div class="location-card__image-wrapper">
              <img
                v-if="location.image"
                :src="location.image"
                :alt="location.name"
                class="location-card__image"
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
          </a>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLocations.length === 0 && !isLoading" class="locations-sidebar__empty">
          <p>{{ $t('location.noResults') }}</p>
        </div>
      </div>
    </aside>

    <!-- Map View -->
    <main class="locations-map" :class="{ 'locations-map--dark': isDarkMode }">
      <!-- View Toggle -->
      <div class="locations-map__controls">
        <button
          class="locations-map__toggle"
          :class="{ 'locations-map__toggle--active': !isDarkMode }"
          @click="setMapStyle('light')"
        >
          {{ $t('location.mapStyle.light') }}
        </button>
        <button
          class="locations-map__toggle"
          :class="{ 'locations-map__toggle--active': isDarkMode }"
          @click="setMapStyle('dark')"
        >
          {{ $t('location.mapStyle.dark') }}
        </button>
      </div>

      <!-- Collection Badge -->
      <div class="locations-collection" :class="{ 'locations-collection--dark': isDarkMode }" @click="openSidebar">
        <span class="locations-collection__dot"></span>
        <span class="locations-collection__text">
          {{ $t('location.collection') }} <span class="locations-collection__count">({{ selectedLocations.size }})</span>
        </span>
      </div>

      <!-- Map Container -->
      <div class="locations-map__container" ref="mapContainer"></div>
    </main>

    <!-- Selection Sidebar -->
    <aside class="locations-selection-sidebar" :class="{ 'locations-selection-sidebar--open': isSidebarOpen, 'locations-selection-sidebar--dark': isDarkMode }">
      <div class="locations-selection-sidebar__header">
        <div class="locations-selection-sidebar__title-wrapper">
          <h2 class="locations-selection-sidebar__title">{{ $t('location.collection') }} <span>({{ selectedLocations.size }})</span></h2>
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
            <span>{{ $t('location.shareUrl') }}</span>
          </button>

          <button class="locations-selection-sidebar__export-btn" @click="exportToPdf">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.0833 8.75V3.75C17.0833 2.82953 16.3372 2.08334 15.4167 2.08334H9.64867C9.20667 2.08334 8.78275 2.25893 8.47018 2.57149L4.23816 6.80351C3.92559 7.11608 3.75 7.53999 3.75 7.98203V17.0833C3.75 18.0038 4.49619 18.75 5.41667 18.75H9.58333" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.75 7.91667H9.58333V2.08334" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.7487 15.8333L15.4154 19.1667L12.082 15.8333" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15.4141 18.3333L15.4149 19.1667V12.0833" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ $t('location.downloadPdf') }}</span>
          </button>
        </div>
      </div>

      <!-- Selected Locations List -->
      <div class="locations-selection-sidebar__content">
        <div class="locations-selection-sidebar__list">
          <template v-if="selectedLocations.size === 0">
            <div class="locations-selection-sidebar__empty">
              <div class="locations-selection-sidebar__empty-icon">📍</div>
              <p class="locations-selection-sidebar__empty-text">{{ $t('location.emptyCollection') }}</p>
              <p class="locations-selection-sidebar__empty-hint">{{ $t('location.emptyCollectionHint') }}</p>
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
              <a :href="`/lokacije/${location.slug}`" class="location-card__link" target="_blank">
                <div class="location-card__image-wrapper">
                  <img v-if="location.image" :src="location.image" :alt="location.name" class="location-card__image">
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
              </a>
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
    <div class="locations-view-switcher">
      <button
        class="locations-view-switcher__btn"
        :class="{ 'locations-view-switcher__btn--active': currentMobileView === 'grid' }"
        @click="switchMobileView('grid')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        {{ $t('location.viewSwitcher.grid') }}
      </button>
      <button
        class="locations-view-switcher__btn"
        :class="{ 'locations-view-switcher__btn--active': currentMobileView === 'map' }"
        @click="switchMobileView('map')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 8.5C9.10457 8.5 10 7.60457 10 6.5C10 5.39543 9.10457 4.5 8 4.5C6.89543 4.5 6 5.39543 6 6.5C6 7.60457 6.89543 8.5 8 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 6.5C13 11 8 14.5 8 14.5C8 14.5 3 11 3 6.5C3 4.9087 3.63214 3.38258 4.75736 2.25736C5.88258 1.13214 7.4087 0.5 9 0.5C10.5913 0.5 12.1174 1.13214 13.2426 2.25736C14.3679 3.38258 15 4.9087 15 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ $t('location.viewSwitcher.map') }}
      </button>
    </div>

    <!-- Mobile Filters Modal -->
    <div class="locations-filters-modal" :class="{ 'locations-filters-modal--open': isFiltersModalOpen }">
      <div class="locations-filters-modal__header">
        <h2 class="locations-filters-modal__title">{{ $t('location.filters.title') }} (<span>{{ totalFiltersCount }}</span>)</h2>
        <button class="locations-filters-modal__close" @click="closeFiltersModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10.125 1.875L1.875 10.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1.875 1.875L10.125 10.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="locations-filters-modal__content">
        <!-- Cities Accordion -->
        <div class="locations-filters-modal__section" :class="{ 'locations-filters-modal__section--open': isCitiesAccordionOpen }">
          <button class="locations-filters-modal__section-header" @click="isCitiesAccordionOpen = !isCitiesAccordionOpen">
            <span class="locations-filters-modal__section-title">{{ $t('location.filters.cities') }} (<span>{{ modalSelectedCities.length }}</span>)</span>
            <svg class="locations-filters-modal__section-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="locations-filters-modal__section-content">
            <label v-for="city in cities" :key="city.id" class="locations-filters-modal__option">
              <span class="locations-filters-modal__option-label">{{ city.name }}</span>
              <input type="checkbox" class="locations-filters-modal__option-checkbox" :value="city.id" v-model="modalSelectedCities">
              <span class="locations-filters-modal__option-checkmark"></span>
            </label>
          </div>
        </div>

        <!-- Environments Accordion -->
        <div class="locations-filters-modal__section" :class="{ 'locations-filters-modal__section--open': isEnvsAccordionOpen }">
          <button class="locations-filters-modal__section-header" @click="isEnvsAccordionOpen = !isEnvsAccordionOpen">
            <span class="locations-filters-modal__section-title">{{ $t('location.filters.environments') }} (<span>{{ modalSelectedEnvironments.length }}</span>)</span>
            <svg class="locations-filters-modal__section-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="locations-filters-modal__section-content">
            <label v-for="env in environments" :key="env.id" class="locations-filters-modal__option">
              <span class="locations-filters-modal__option-label">{{ env.name }}</span>
              <input type="checkbox" class="locations-filters-modal__option-checkbox" :value="env.id" v-model="modalSelectedEnvironments">
              <span class="locations-filters-modal__option-checkmark"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="locations-filters-modal__footer">
        <button class="locations-filters-modal__btn locations-filters-modal__btn--clear" @click="clearModalFilters">{{ $t('location.filters.clearAll') }}</button>
        <button class="locations-filters-modal__btn locations-filters-modal__btn--apply" @click="applyModalFilters">{{ $t('location.filters.apply') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'

// Page meta
useHead({
  title: 'Lokacije - Go2Digital'
})

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
}

interface City {
  id: string
  name: string
}

interface Environment {
  id: string
  name: string
}

// Mapbox token
const MAPBOX_TOKEN = 'MAPBOX_TOKEN_REMOVED'

// Storage keys
const STORAGE_KEY = 'selectedLocations'

// Refs
const mapContainer = ref<HTMLElement | null>(null)
const cardsContainer = ref<HTMLElement | null>(null)

// Map state
let map: any = null
const isDarkMode = ref(false)
const activeLocationId = ref<string | null>(null)
const focusedLocationId = ref<string | null>(null)

// UI State
const isSidebarOpen = ref(false)
const isLoading = ref(false)
const isScrolled = ref(false)
const currentMobileView = ref('grid')

// Filter State
const isCityDropdownOpen = ref(false)
const isEnvDropdownOpen = ref(false)
const selectedCities = ref<string[]>([])
const selectedEnvironments = ref<string[]>([])
const searchQuery = ref('')
const showSelectedOnly = ref(false)

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
const cities = ref<City[]>([
  { id: '1', name: 'Zagreb' },
  { id: '2', name: 'Split' },
  { id: '3', name: 'Rijeka' },
  { id: '4', name: 'Osijek' },
  { id: '5', name: 'Zadar' },
  { id: '6', name: 'Dubrovnik' },
  { id: '7', name: 'Pula' },
  { id: '8', name: 'Varaždin' }
])

// Mockup Environments
const environments = ref<Environment[]>([
  { id: '1', name: 'Shopping centar' },
  { id: '2', name: 'Ulica' },
  { id: '3', name: 'Javni prijevoz' },
  { id: '4', name: 'Benzinska postaja' },
  { id: '5', name: 'Poslovni centar' },
  { id: '6', name: 'Sportski objekti' }
])

// Mockup Locations
const locations = ref<Location[]>([
  { id: '1', slug: 'arena-centar-zagreb', externalId: 'LOC001', name: 'Arena Centar Zagreb', city: 'Zagreb', environments: ['Shopping centar'], lat: 45.7769, lng: 15.9821, image: 'https://picsum.photos/seed/loc1/400/300', screens: 12 },
  { id: '2', slug: 'city-center-one-split', externalId: 'LOC002', name: 'City Center One Split', city: 'Split', environments: ['Shopping centar'], lat: 43.5147, lng: 16.4435, image: 'https://picsum.photos/seed/loc2/400/300', screens: 8 },
  { id: '3', slug: 'tower-center-rijeka', externalId: 'LOC003', name: 'Tower Center Rijeka', city: 'Rijeka', environments: ['Shopping centar'], lat: 45.3271, lng: 14.4422, image: 'https://picsum.photos/seed/loc3/400/300', screens: 6 },
  { id: '4', slug: 'avenue-mall-osijek', externalId: 'LOC004', name: 'Avenue Mall Osijek', city: 'Osijek', environments: ['Shopping centar'], lat: 45.5550, lng: 18.6955, image: 'https://picsum.photos/seed/loc4/400/300', screens: 10 },
  { id: '5', slug: 'city-galleria-zadar', externalId: 'LOC005', name: 'City Galleria Zadar', city: 'Zadar', environments: ['Shopping centar'], lat: 44.1194, lng: 15.2314, image: 'https://picsum.photos/seed/loc5/400/300', screens: 5 },
  { id: '6', slug: 'dubrovnik-sun-gardens', externalId: 'LOC006', name: 'Sun Gardens Dubrovnik', city: 'Dubrovnik', environments: ['Poslovni centar'], lat: 42.6507, lng: 18.0944, image: 'https://picsum.photos/seed/loc6/400/300', screens: 4 },
  { id: '7', slug: 'max-city-pula', externalId: 'LOC007', name: 'Max City Pula', city: 'Pula', environments: ['Shopping centar'], lat: 44.8666, lng: 13.8496, image: 'https://picsum.photos/seed/loc7/400/300', screens: 7 },
  { id: '8', slug: 'lumini-varazdin', externalId: 'LOC008', name: 'Lumini Varaždin', city: 'Varaždin', environments: ['Shopping centar'], lat: 46.3057, lng: 16.3366, image: 'https://picsum.photos/seed/loc8/400/300', screens: 3 },
  { id: '9', slug: 'ban-jelacic-square', externalId: 'LOC009', name: 'Trg bana Jelačića', city: 'Zagreb', environments: ['Ulica'], lat: 45.8131, lng: 15.9775, image: 'https://picsum.photos/seed/loc9/400/300', screens: 15 },
  { id: '10', slug: 'riva-split', externalId: 'LOC010', name: 'Riva Split', city: 'Split', environments: ['Ulica'], lat: 43.5081, lng: 16.4402, image: 'https://picsum.photos/seed/loc10/400/300', screens: 9 },
  { id: '11', slug: 'korzo-rijeka', externalId: 'LOC011', name: 'Korzo Rijeka', city: 'Rijeka', environments: ['Ulica'], lat: 45.3269, lng: 14.4428, image: 'https://picsum.photos/seed/loc11/400/300', screens: 6 },
  { id: '12', slug: 'glavni-kolodvor-zagreb', externalId: 'LOC012', name: 'Glavni kolodvor Zagreb', city: 'Zagreb', environments: ['Javni prijevoz'], lat: 45.8049, lng: 15.9788, image: 'https://picsum.photos/seed/loc12/400/300', screens: 20 },
  { id: '13', slug: 'ina-benzinska-ilica', externalId: 'LOC013', name: 'INA Benzinska Ilica', city: 'Zagreb', environments: ['Benzinska postaja'], lat: 45.8100, lng: 15.9500, image: 'https://picsum.photos/seed/loc13/400/300', screens: 2 },
  { id: '14', slug: 'eurotower-zagreb', externalId: 'LOC014', name: 'Eurotower Zagreb', city: 'Zagreb', environments: ['Poslovni centar'], lat: 45.8073, lng: 15.9746, image: 'https://picsum.photos/seed/loc14/400/300', screens: 8 },
  { id: '15', slug: 'arena-zagreb', externalId: 'LOC015', name: 'Arena Zagreb', city: 'Zagreb', environments: ['Sportski objekti'], lat: 45.7743, lng: 15.9896, image: 'https://picsum.photos/seed/loc15/400/300', screens: 25 },
  { id: '16', slug: 'spaladium-arena', externalId: 'LOC016', name: 'Spaladium Arena', city: 'Split', environments: ['Sportski objekti'], lat: 43.5244, lng: 16.4658, image: 'https://picsum.photos/seed/loc16/400/300', screens: 18 }
])

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
  if (isCityDropdownOpen.value) isEnvDropdownOpen.value = false
}

function toggleEnvDropdown() {
  isEnvDropdownOpen.value = !isEnvDropdownOpen.value
  if (isEnvDropdownOpen.value) isCityDropdownOpen.value = false
}

function applyFilters() { updateMapMarkers() }
function handleSearch() { applyFilters() }

function removeFilter(type: string, value?: string) {
  if (type === 'city' && value) selectedCities.value = selectedCities.value.filter(id => id !== value)
  else if (type === 'environment' && value) selectedEnvironments.value = selectedEnvironments.value.filter(id => id !== value)
  else if (type === 'search') searchQuery.value = ''
  applyFilters()
}

function clearAllFilters() {
  selectedCities.value = []
  selectedEnvironments.value = []
  searchQuery.value = ''
  applyFilters()
}

function toggleLocation(location: Location) {
  if (selectedLocations.value.has(location.id)) {
    selectedLocations.value.delete(location.id)
    showToast(`Removed "${location.name}" from collection`)
  } else {
    selectedLocations.value.set(location.id, location)
    showToast(`Added "${location.name}" to collection`)
  }
  saveToStorage()
  updateMapMarkers()
}

function removeFromCollection(id: string) {
  const location = selectedLocations.value.get(id)
  selectedLocations.value.delete(id)
  if (location) showToast(`Removed "${location.name}" from collection`)
  saveToStorage()
  updateMapMarkers()
  if (showSelectedOnly.value && selectedLocations.value.size === 0) showSelectedOnly.value = false
}

function focusOnLocation(location: Location) {
  if (focusedLocationId.value === location.id) {
    focusedLocationId.value = null
    updateMapMarkers()
    resetMapView()
    return
  }
  focusedLocationId.value = location.id
  activeLocationId.value = location.id
  if (window.innerWidth <= 768) switchMobileView('map')
  if (map) map.flyTo({ center: [location.lng, location.lat], zoom: 15, duration: 1500 })
  updateMapMarkers()
}

function openLocationDetail(location: Location) { focusOnLocation(location) }
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
  if (confirm('Are you sure you want to clear all selected locations?')) {
    selectedLocations.value.clear()
    saveToStorage()
    updateMapMarkers()
    showSelectedOnly.value = false
    showToast('All locations cleared from collection')
    resetMapView()
  }
}

function shareCollection() {
  if (selectedLocations.value.size === 0) { showToast('No locations to share', 'warning'); return }
  const locationIds = Array.from(selectedLocations.value.values()).map(loc => loc.externalId || loc.id).join(',')
  const shareUrl = `${window.location.origin}${window.location.pathname}?locations=${locationIds}`
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl).then(() => showToast('Share URL copied to clipboard!', 'success')).catch(() => showToast(`Share URL: ${shareUrl}`, 'info'))
  } else { showToast(`Share URL: ${shareUrl}`, 'info') }
}

function exportToPdf() {
  if (selectedLocations.value.size === 0) { showToast('No locations to export', 'warning'); return }
  showToast('PDF export is not available in demo mode', 'info')
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
  currentMobileView.value = view
  if (view === 'map' && map) nextTick(() => { map.resize() })
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

function onCardsScroll(e: Event) { const target = e.target as HTMLElement; isScrolled.value = target.scrollTop > 10 }

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
    const mapboxgl = await import('mapbox-gl')
    await import('mapbox-gl/dist/mapbox-gl.css')
    mapboxgl.default.accessToken = MAPBOX_TOKEN
    map = new mapboxgl.default.Map({ container: mapContainer.value, style: 'mapbox://styles/mapbox/light-v11', center: [15.977897644042969, 45.80989696061219], zoom: 6 })
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
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.custom-select')) { isCityDropdownOpen.value = false; isEnvDropdownOpen.value = false }
}

watch([filteredLocations], () => { if (map && map.isStyleLoaded()) loadMapData() })

onMounted(async () => { loadFromStorage(); loadFromUrl(); await nextTick(); initializeMap(); document.addEventListener('click', handleClickOutside) })
onUnmounted(() => { if (map) { map.remove(); map = null }; document.removeEventListener('click', handleClickOutside); if (toastTimeout) clearTimeout(toastTimeout) })
</script>

<style lang="scss" scoped>
$color-primary: #03120F;
$color-accent: #0CD459;
$color-background: #ffffff;
$color-border: #E5E5E5;
$color-muted: rgba($color-primary, 0.4);
$dark-background: #1a1a1a;
$dark-surface: #2a2a2a;
$dark-border: #3a3a3a;
$dark-text: #ffffff;
$breakpoint-mobile: 576px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;

@mixin mobile { @media (max-width: $breakpoint-mobile) { @content; } }
@mixin tablet { @media (max-width: $breakpoint-tablet) { @content; } }
@mixin desktop { @media (max-width: $breakpoint-desktop) { @content; } }

.locations-page {
  display: grid; grid-template-columns: 420px 1fr; min-height: 100dvh; background-color: $color-background;
  @include desktop { grid-template-columns: 350px 1fr; }
  @include tablet { grid-template-columns: 1fr; }
  &--grid-view { @include tablet { .locations-sidebar { display: block; } .locations-map { display: none; } } }
  &--map-view { @include tablet { .locations-sidebar { display: none; } .locations-map { display: block; } } }
  &--dark { background-color: $dark-background; }
}

.locations-sidebar {
  display: flex; flex-direction: column; height: 100dvh; border-right: 1px solid $color-border; background-color: $color-background; position: sticky; top: 0;
  @include tablet { height: auto; min-height: 100dvh; border-right: none; }
  &--dark { background-color: $dark-background; border-color: $dark-border;
    .locations-sidebar__header { border-color: $dark-border; }
    .locations-sidebar__title { color: $dark-text; }
    .locations-sidebar__clear-btn { border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__view-toggle { color: $dark-text; }
    .locations-sidebar__mode-btn { border-color: $dark-border; color: $dark-text; &--active { background-color: $dark-text; color: $dark-background; } }
    .locations-sidebar__filters { border-color: $dark-border; }
    .locations-sidebar__mobile-buttons { border-color: $dark-border; }
    .locations-sidebar__collection-btn, .locations-sidebar__filters-btn { border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__search { border-color: $dark-border; }
    .locations-sidebar__search-input { background-color: $dark-surface; border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__active-filters { border-color: $dark-border; }
    .locations-sidebar__tag { border-color: $dark-border; color: $dark-text; }
    .locations-sidebar__clear-all { color: rgba($dark-text, 0.6); &:hover { color: $dark-text; } }
    .locations-sidebar__empty { color: rgba($dark-text, 0.6); }
  }
  &__header { padding: 1.5rem; border-bottom: 1px solid $color-border; }
  &__title { font-size: 1.5rem; font-weight: 400; margin: 0 0 1rem; display: flex; align-items: baseline; gap: 0.5rem; }
  &__count { font-size: 0.875rem; color: $color-muted; }
  &__buttons-wrapper { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
  &__clear-btn { padding: 0.5rem; border: 1px solid $color-border; border-radius: 0.5rem; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; &:hover { border-color: $color-primary; } }
  &__view-toggle { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; cursor: pointer; }
  &__view-checkbox { width: 1rem; height: 1rem; accent-color: $color-accent; }
  &__mode-switch { display: none; @include tablet { display: flex; gap: 0.25rem; } }
  &__mode-btn { padding: 0.375rem 0.75rem; border: 1px solid $color-border; border-radius: 999px; background: transparent; font-size: 0.625rem; cursor: pointer; transition: all 0.2s ease; &--active { background-color: $color-primary; border-color: $color-primary; color: $color-background; } }
  &__filters { padding: 1rem 1.5rem; border-bottom: 1px solid $color-border; @include tablet { display: none; } }
  &__filter-group { display: flex; gap: 0.75rem; }
  &__mobile-buttons { display: none; padding: 1rem 1.5rem; gap: 0.75rem; border-bottom: 1px solid $color-border; @include tablet { display: flex; } }
  &__collection-btn, &__filters-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1rem; border: 1px solid $color-border; border-radius: 999px; background: transparent; font-size: 0.75rem; cursor: pointer; }
  &__collection-btn-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: $color-accent; }
  &__search { display: flex; gap: 0.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid $color-border; }
  &__search-input { flex: 1; padding: 0.75rem 1rem; border: 1px solid $color-border; border-radius: 0.5rem; font-size: 0.875rem; font-family: inherit; &:focus { outline: none; border-color: $color-primary; } }
  &__search-btn { padding: 0.75rem 1.25rem; border: none; border-radius: 0.5rem; background-color: $color-primary; color: $color-background; font-size: 0.75rem; font-family: inherit; cursor: pointer; transition: opacity 0.2s ease; &:hover { opacity: 0.9; } }
  &__active-filters { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 1rem 1.5rem; border-bottom: 1px solid $color-border; }
  &__tag { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border: 1px solid $color-border; border-radius: 999px; font-size: 0.75rem; }
  &__tag-close { cursor: pointer; opacity: 0.6; &:hover { opacity: 1; } }
  &__clear-all { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: $color-muted; text-decoration: none; &:hover { color: $color-primary; } }
  &__shimmer { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 1.5rem; overflow: hidden; }
  &__cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; padding: 1.5rem; overflow-y: auto; flex: 1; min-height: 0; @include mobile { grid-template-columns: 1fr; } }
  &__empty { grid-column: 1 / -1; text-align: center; padding: 2rem; color: $color-muted; }
}

.custom-select {
  position: relative; flex: 1;
  &__trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0.625rem 1rem; border: 1px solid $color-border; border-radius: 0.5rem; background: transparent; font-size: 0.75rem; font-family: inherit; cursor: pointer; transition: border-color 0.2s ease; &:hover { border-color: $color-primary; } .locations-sidebar--dark & { border-color: $dark-border; color: $dark-text; } }
  &__arrow { transition: transform 0.2s ease; .custom-select--open & { transform: rotate(180deg); } }
  &__dropdown { position: absolute; top: calc(100% + 0.5rem); left: 0; right: 0; max-height: 200px; overflow-y: auto; background-color: $color-background; border: 1px solid $color-border; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); z-index: 100; .locations-sidebar--dark & { background-color: $dark-surface; border-color: $dark-border; } }
  &__option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; font-size: 0.875rem; cursor: pointer; transition: background-color 0.2s ease; &:hover { background-color: rgba($color-primary, 0.05); } .locations-sidebar--dark & { color: $dark-text; &:hover { background-color: rgba($dark-text, 0.1); } } input { accent-color: $color-accent; } }
}

.location-card {
  position: relative; border: 1px solid $color-border; border-radius: 0.75rem; overflow: hidden; background-color: $color-background; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover { border-color: $color-primary; }
  &--selected { border-color: $color-accent; .location-card__badge-input { accent-color: $color-accent; } }
  &--active { box-shadow: 0 0 0 2px $color-accent; }
  &--dark { background-color: $dark-surface; border-color: $dark-border; &:hover { border-color: $dark-text; }
    .location-card__badge { background-color: $dark-surface; }
    .location-card__focus { background-color: $dark-surface; }
    .location-card__image-wrapper { background-color: $dark-background; }
    .location-card__city, .location-card__type { color: rgba($dark-text, 0.6); }
    .location-card__name { color: $dark-text; }
  }
  &__badge { position: absolute; top: 0.75rem; left: 0.75rem; z-index: 10; width: 1.5rem; height: 1.5rem; display: flex; align-items: center; justify-content: center; background-color: $color-background; border-radius: 0.25rem; cursor: pointer; }
  &__badge-input { width: 1rem; height: 1rem; accent-color: $color-accent; cursor: pointer; }
  &__focus { position: absolute; top: 0.75rem; right: 0.75rem; z-index: 10; width: 1.75rem; height: 1.75rem; display: flex; align-items: center; justify-content: center; background-color: $color-background; border-radius: 50%; cursor: pointer; transition: transform 0.2s ease; &:hover { transform: scale(1.1); } }
  &__focus-icon { &--default { display: block; } &--active { display: none; } .location-card--selected &, .location-card--active & { &--default { display: none; } &--active { display: block; } } }
  &__link { display: block; text-decoration: none; color: inherit; }
  &__image-wrapper { aspect-ratio: 4 / 3; overflow: hidden; background-color: darken($color-background, 5%); }
  &__image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; .location-card:hover & { transform: scale(1.05); } }
  &__content { padding: 0.75rem; }
  &__meta { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.25rem; }
  &__city, &__type { font-size: 0.625rem; color: $color-muted; text-transform: uppercase; }
  &__dot { font-size: 0.5rem; color: $color-muted; }
  &__name { font-size: 0.875rem; font-weight: 400; line-height: 1.3; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
}

.location-card-shimmer {
  position: relative; border: 1px solid $color-border; border-radius: 0.75rem; overflow: hidden; background-color: $color-background;
  &__badge { position: absolute; top: 0.75rem; left: 0.75rem; width: 1.5rem; height: 1.5rem; border-radius: 0.25rem; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  &__image { aspect-ratio: 4 / 3; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  &__content { padding: 0.75rem; }
  &__line { height: 0.75rem; border-radius: 0.25rem; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 0.5rem; &--short { width: 40%; } &--long { width: 80%; } }
}

@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.locations-map {
  position: relative; height: 100dvh; @include tablet { height: 100dvh; }
  &--dark {
    .locations-map__controls { background-color: $dark-surface; }
    .locations-map__toggle { color: $dark-text; &--active { background-color: $dark-text; color: $dark-background; } }
  }
  &__controls { position: absolute; top: 1rem; left: 1rem; display: flex; gap: 0.25rem; z-index: 10; background-color: $color-background; border-radius: 999px; padding: 0.25rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); @include tablet { display: none; } }
  &__toggle { padding: 0.5rem 1rem; border: none; border-radius: 999px; background: transparent; font-size: 0.75rem; font-family: inherit; cursor: pointer; transition: all 0.2s ease; &--active { background-color: $color-primary; color: $color-background; } }
  &__container { width: 100%; height: 100%; }
}

.locations-collection {
  position: absolute; top: 1rem; right: 1rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background-color: $color-background; border-radius: 999px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); cursor: pointer; z-index: 10; transition: transform 0.2s ease;
  &:hover { transform: scale(1.02); }
  @include tablet { display: none; }
  &--dark { background-color: $dark-surface; .locations-collection__text { color: $dark-text; } }
  &__dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: $color-accent; }
  &__text { font-size: 0.75rem; }
}

.locations-selection-sidebar {
  position: fixed; top: 0; right: 0; width: 400px; max-width: 100%; height: 100dvh; background-color: $color-background; box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1); transform: translateX(100%); transition: transform 0.3s ease; z-index: 1000; display: flex; flex-direction: column;
  &--open { transform: translateX(0); }
  &--dark { background-color: $dark-background;
    .locations-selection-sidebar__header { border-color: $dark-border; }
    .locations-selection-sidebar__title { color: $dark-text; }
    .locations-selection-sidebar__close { color: $dark-text; }
    .locations-selection-sidebar__share-btn, .locations-selection-sidebar__export-btn { border-color: $dark-border; color: $dark-text; }
    .locations-selection-sidebar__empty { color: rgba($dark-text, 0.6); }
    .locations-selection-sidebar__empty-hint { color: rgba($dark-text, 0.4); }
  }
  &__header { padding: 1.5rem; border-bottom: 1px solid $color-border; }
  &__title-wrapper { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  &__title { font-size: 1.25rem; font-weight: 400; margin: 0; }
  &__close { padding: 0.5rem; border: none; background: transparent; cursor: pointer; }
  &__header-actions { display: flex; gap: 0.75rem; }
  &__share-btn, &__export-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1rem; border: 1px solid $color-border; border-radius: 0.5rem; background: transparent; font-size: 0.75rem; font-family: inherit; cursor: pointer; transition: all 0.2s ease; &:hover { border-color: $color-primary; } }
  &__content { flex: 1; overflow-y: auto; padding: 1.5rem; }
  &__list { display: flex; flex-direction: column; gap: 1rem; }
  &__empty { text-align: center; padding: 2rem; }
  &__empty-icon { font-size: 2rem; margin-bottom: 1rem; }
  &__empty-text { color: $color-muted; margin: 0 0 0.5rem; }
  &__empty-hint { font-size: 0.75rem; color: rgba($color-primary, 0.4); margin: 0; }
}

.locations-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; z-index: 999;
  &--visible { opacity: 1; visibility: visible; }
}

.locations-view-switcher {
  position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); display: none; gap: 0.25rem; padding: 0.25rem; background-color: $color-background; border-radius: 999px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); z-index: 100;
  @include tablet { display: flex; }
  &__btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: none; border-radius: 999px; background: transparent; font-size: 0.75rem; font-family: inherit; cursor: pointer; transition: all 0.2s ease; &--active { background-color: $color-primary; color: $color-background; } }
}

.locations-filters-modal {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: $color-background; transform: translateY(100%); transition: transform 0.3s ease; z-index: 1001; display: none; flex-direction: column;
  @include tablet { display: flex; }
  &--open { transform: translateY(0); }
  &__header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid $color-border; }
  &__title { font-size: 1.25rem; font-weight: 400; margin: 0; }
  &__close { padding: 0.5rem; border: none; background: transparent; cursor: pointer; }
  &__content { flex: 1; overflow-y: auto; padding: 0; }
  &__section { border-bottom: 1px solid $color-border; &--open { .locations-filters-modal__section-content { display: block; } .locations-filters-modal__section-icon { transform: rotate(180deg); } } }
  &__section-header { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 1.25rem 1.5rem; border: none; background: transparent; font-size: 1rem; font-family: inherit; text-align: left; cursor: pointer; }
  &__section-icon { transition: transform 0.2s ease; }
  &__section-content { display: none; padding: 0 1.5rem 1.5rem; }
  &__option { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid rgba($color-border, 0.5); cursor: pointer; &:last-child { border-bottom: none; } }
  &__option-label { font-size: 0.875rem; }
  &__option-checkbox { accent-color: $color-accent; }
  &__footer { display: flex; gap: 0.75rem; padding: 1.5rem; border-top: 1px solid $color-border; }
  &__btn { flex: 1; padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-family: inherit; cursor: pointer; transition: all 0.2s ease; &--clear { border: 1px solid $color-border; background: transparent; &:hover { border-color: $color-primary; } } &--apply { border: none; background-color: $color-primary; color: $color-background; &:hover { opacity: 0.9; } } }
}
</style>

<style lang="scss">
.location-toast {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%) translateY(100px); padding: 1rem 1.5rem; background-color: #03120F; color: #ffffff; border-radius: 0.5rem; font-size: 0.875rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); opacity: 0; visibility: hidden; transition: all 0.3s ease; z-index: 10000; white-space: nowrap;
  &--visible { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
  &--success { background-color: #4CAF50; }
  &--error { background-color: #f44336; }
  &--warning { background-color: #ff9800; }
  &--dark { background-color: #ffffff; color: #03120F; }
}
</style>
