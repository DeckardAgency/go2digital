<template>
  <div class="locations-page" :class="[currentViewClass, { 'locations-page--dark': isDarkMode, 'locations-page--scrolled': isScrolled }]">
    <!-- Sidebar -->
    <aside class="locations-sidebar" :class="{ 'locations-sidebar--dark': isDarkMode, 'locations-sidebar--scrolled': isScrolled }">
      <!-- Header -->
      <div class="locations-sidebar__header" ref="headerRef">
        <div class="locations-sidebar__title-row">
          <h1 class="locations-sidebar__title" data-split-text data-split-type="chars" data-split-trigger="none" data-split-stagger="0.02" data-split-duration="0.6">
            {{ $t('location.title') }}
          </h1>
          <span class="locations-sidebar__count" ref="countRef">({{ totalScreens }})</span>
        </div>

        <div class="locations-sidebar__buttons-wrapper" ref="buttonsRef">
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

      <!-- Collapsible toolbar (hides on scroll) -->
      <div class="locations-sidebar__toolbar" :class="{ 'locations-sidebar__toolbar--collapsed': isScrolled }">

      <!-- Filters (Desktop) -->
      <div class="locations-sidebar__filters" ref="filtersRef">
        <div class="locations-sidebar__filter-group">
          <!-- Cities Dropdown -->
          <div class="custom-select" :class="{ 'custom-select--open': isCityDropdownOpen }">
            <button class="custom-select__trigger" @click="toggleCityDropdown">
              <span class="custom-select__label">
                {{ selectedCities.length === 1 ? getCityName(selectedCities[0]) : selectedCities.length > 1 ? `${$t('location.filters.cities')} (${selectedCities.length})` : $t('location.filters.cities') }}
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
                {{ selectedEnvironments.length === 1 ? getEnvironmentName(selectedEnvironments[0]) : selectedEnvironments.length > 1 ? `${$t('location.filters.environments')} (${selectedEnvironments.length})` : $t('location.filters.environments') }}
              </span>
              <svg class="custom-select__icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="4" cy="4" r="1.5" fill="currentColor"/><circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                <circle cx="4" cy="10" r="1.5" fill="currentColor"/><circle cx="10" cy="10" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Shared dropdown panel below triggers -->
        <Transition name="dropdown">
          <div class="custom-select__dropdown" v-if="isCityDropdownOpen" data-lenis-prevent>
            <button class="custom-select__option custom-select__option--all" @click="toggleAllCities">
              <span>All {{ $t('location.filters.cities') }}</span>
            </button>
            <label v-for="city in cities" :key="city.id" class="custom-select__option" :class="{ 'custom-select__option--selected': selectedCities.includes(city.id) }">
              <span>{{ city.name }}</span>
              <input type="checkbox" :value="city.id" v-model="selectedCities" @change="applyFilters">
            </label>
          </div>
        </Transition>

        <Transition name="dropdown">
          <div class="custom-select__dropdown" v-if="isEnvDropdownOpen" data-lenis-prevent>
            <button class="custom-select__option custom-select__option--all" @click="toggleAllEnvironments">
              <span>All {{ $t('location.filters.environments') }}</span>
            </button>
            <label v-for="env in environments" :key="env.id" class="custom-select__option" :class="{ 'custom-select__option--selected': selectedEnvironments.includes(env.id) }">
              <span>{{ env.name }}</span>
              <input type="checkbox" :value="env.id" v-model="selectedEnvironments" @change="applyFilters">
            </label>
          </div>
        </Transition>
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
      <div class="locations-sidebar__search" ref="searchRef">
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

      </div><!-- end toolbar -->

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
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredLocations.length === 0 && !isLoading" key="empty" class="locations-sidebar__empty">
          <p>{{ $t('location.noResults') }}</p>
        </div>
      </TransitionGroup>
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
      <div class="locations-selection-sidebar__content" data-lenis-prevent>
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
              <div class="location-card__link" @click.stop="animateToDetail(location, $event)">
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

      <div class="locations-filters-modal__content" data-lenis-prevent>
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
import { gsap } from 'gsap'
import 'mapbox-gl/dist/mapbox-gl.css'

// Page meta - hide footer on this page
definePageMeta({
  showFooter: false
})

useHead({
  title: 'Lokacije - Go2Digital'
})

// Split text composable
const { initSplitText, playAnimation } = useSplitText()

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
        screens: totem.screens || 1
      })
    }
  }

  return {
    locations: allLocations,
    cities: Array.from(cityMap.values()),
    environments: Array.from(envMap.values())
  }
}

// Fetch on both server and client to avoid hydration mismatch
const { data: locData } = useFetch<any[]>('https://cdn.go2digital.hr/loc.json', {
  key: 'locations-data',
  lazy: true
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
  if (isCityDropdownOpen.value) isEnvDropdownOpen.value = false
}

function toggleEnvDropdown() {
  isEnvDropdownOpen.value = !isEnvDropdownOpen.value
  if (isEnvDropdownOpen.value) isCityDropdownOpen.value = false
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

let isNavigating = false

function animateToDetail(location: Location, event: MouseEvent) {
  if (isNavigating) return
  isNavigating = true

  // Find the card and its image
  const card = (event.target as HTMLElement).closest('.location-card') as HTMLElement
  if (!card) { navigateTo(`/lokacije/${location.slug}`); return }

  const img = card.querySelector('.location-card__image') as HTMLImageElement
  if (!img) { navigateTo(`/lokacije/${location.slug}`); return }

  const imgRect = img.getBoundingClientRect()

  // Create a clone of the image for the transition
  const clone = img.cloneNode(true) as HTMLImageElement
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

  // Fade out the rest of the page
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

  // Animate
  const tl = gsap.timeline({
    onComplete: () => {
      // Store image src for the detail page to pick up
      sessionStorage.setItem('locationTransitionImage', location.image)
      sessionStorage.setItem('locationTransitionName', location.name)
      sessionStorage.setItem('locationTransitionCity', location.city)
      sessionStorage.setItem('locationTransitionEnv', location.environments?.[0] || '')

      // Skip the default page transition — our card animation handles it
      ;(window as any).__skipPageTransition = true
      navigateTo(`/lokacije/${location.slug}`)

      // Cleanup after navigation
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

function onCardsScroll(e: Event) {
  const target = e.target as HTMLElement
  const scrolled = target.scrollTop > 10
  if (scrolled && !isScrolled.value) {
    // Close dropdowns when toolbar collapses
    isCityDropdownOpen.value = false
    isEnvDropdownOpen.value = false
  }
  isScrolled.value = scrolled
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
  if (!target.closest('.custom-select') && !target.closest('.custom-select__dropdown')) { isCityDropdownOpen.value = false; isEnvDropdownOpen.value = false }
}

watch([filteredLocations], () => { if (map && map.isStyleLoaded()) loadMapData() })

onMounted(async () => {
  loadFromStorage()
  loadFromUrl()
  await nextTick()
  initializeMap()
  document.addEventListener('click', handleClickOutside)

  // Check if returning from a detail page
  const returnSlug = sessionStorage.getItem('locationReturnSlug')
  const returnImage = sessionStorage.getItem('locationReturnImage')
  sessionStorage.removeItem('locationReturnSlug')
  sessionStorage.removeItem('locationReturnImage')

  if (returnSlug && returnImage) {
    await nextTick()
    playReturnAnimation(returnSlug, returnImage)
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
onUnmounted(() => { if (map) { map.remove(); map = null }; document.removeEventListener('click', handleClickOutside); if (toastTimeout) clearTimeout(toastTimeout) })
</script>

<style lang="scss" scoped>
// Variables and mixins are now globally available via nuxt.config.ts

.locations-page {
  display: grid;
  grid-template-columns: 520px 1fr;
  min-height: 100dvh;
  background-color: $color-background;
  contain: layout style;

  @include desktop { grid-template-columns: 420px 1fr; }
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
  contain: layout style;

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
    overflow: hidden;
    max-height: 500px;
    opacity: 1;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    border-bottom: 1px solid $color-border;

    &--collapsed {
      max-height: 0;
      opacity: 0;
      pointer-events: none;
      border-bottom-color: transparent;
    }
  }

  // Elements
  &__header { padding: $spacing-lg; border-bottom: 1px solid $color-border; display: flex; align-items: center; justify-content: space-between; gap: $spacing-md; }
  &__title-row { display: flex; align-items: baseline; gap: $spacing-sm; }
  &__title { font-size: $font-size-xl; font-weight: 400; margin: 0; }
  &__count { font-size: $font-size-base; color: $color-muted; }
  &__buttons-wrapper { display: flex; align-items: center; gap: $spacing-lg; flex-wrap: wrap; }
  &__clear-btn {
    padding: $spacing-sm;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    background: transparent;
    cursor: pointer;
    @include flex-center;
    transition: border-color $transition-base;
    &:hover { border-color: $color-primary; }
  }
  &__view-toggle { display: flex; align-items: center; gap: $spacing-sm; font-size: $font-size-sm; cursor: pointer; }
  &__view-checkbox { width: 1rem; height: 1rem; accent-color: $color-accent; }
  &__mode-switch { display: none; @include tablet { display: flex; gap: $spacing-xs; } }
  &__mode-btn {
    padding: 0.375rem 0.75rem;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: transparent;
    font-size: $font-size-xs;
    cursor: pointer;
    transition: all $transition-base;
    &--active { background-color: $color-primary; border-color: $color-primary; color: $color-background; }
  }
  &__filters { padding: $spacing-lg; border-bottom: 1px solid $color-border; position: relative; z-index: $z-dropdown; @include tablet { display: none; } }
  &__filter-group { display: flex; gap: $spacing-lg; }
  &__mobile-buttons { display: none; padding: $spacing-md $spacing-lg; gap: $spacing-lg; border-bottom: 1px solid $color-border; @include tablet { display: flex; } }
  &__collection-btn,
  &__filters-btn {
    flex: 1;
    @include flex-center;
    gap: $spacing-sm;
    padding: 0.75rem $spacing-md;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: transparent;
    font-size: $font-size-sm;
    cursor: pointer;
  }
  &__collection-btn-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: $color-accent; }
  &__search { display: flex; gap: $spacing-sm; padding: $spacing-lg; border-bottom: 1px solid $color-border; }
  &__search-input {
    flex: 1;
    padding: 0.75rem $spacing-md;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    font-size: $font-size-base;
    font-family: inherit;
    transition: border-color $transition-base;
    &:focus { outline: none; border-color: $color-primary; }
  }
  &__search-btn {
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: $radius-md;
    background-color: $color-primary;
    color: $color-background;
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: opacity $transition-base;
    &:hover { opacity: 0.9; }
  }
  &__active-filters { display: flex; flex-wrap: wrap; align-items: center; gap: $spacing-sm; padding: $spacing-lg; border-bottom: none; }
  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    background-color: rgba($color-primary, 0.1);
    border: none;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: 500;
  }
  &__tag-close { cursor: pointer; opacity: 0.5; font-size: 0.875rem; transition: opacity $transition-fast; &:hover { opacity: 1; } }
  &__clear-all {
    display: inline-flex;
    align-items: center;
    gap: $spacing-xs;
    margin-left: auto;
    font-size: $font-size-sm;
    color: $color-muted;
    text-decoration: none;
    transition: color $transition-base;
    &:hover { color: $color-primary; }
  }
  &__shimmer { display: grid; grid-template-columns: repeat(2, 1fr); gap: $spacing-md; padding: $spacing-lg; overflow: hidden; }
  &__cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
    gap: $spacing-md;
    padding: $spacing-lg;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
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
    padding: 0.625rem $spacing-md;
    border: 1px solid $color-border;
    border-radius: $radius-full;
    background: transparent;
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: border-color $transition-base;
    &:hover { border-color: $color-primary; }
    .custom-select--open & { border-color: $color-primary; }
    .locations-sidebar--dark & { border-color: $dark-border; color: $dark-text; }
  }

  &__icon {
    flex-shrink: 0;
  }

  &__dropdown {
    position: absolute;
    left: $spacing-lg;
    right: $spacing-lg;
    top: 100%;
    max-height: 320px;
    overflow-y: auto;
    background-color: $color-background;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: $shadow-md;
    margin-top: $spacing-sm;
    padding: $spacing-sm 0;
    z-index: $z-dropdown;
    .locations-sidebar--dark & { background-color: $dark-surface; border-color: $dark-border; }
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
    input { accent-color: $color-accent; width: 1.125rem; height: 1.125rem; flex-shrink: 0; }

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
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background-color: $color-background;
  transition: border-color $transition-base, box-shadow $transition-base;
  contain: layout style;

  &:hover { border-color: $color-primary; }
  &--selected { border-color: $color-accent; }
  &--active { box-shadow: 0 0 0 2px $color-accent; }

  &--dark {
    background-color: $dark-surface;
    border-color: $dark-border;
    &:hover { border-color: $dark-text; }
    .location-card__badge { background-color: $dark-surface; }
    .location-card__focus { background-color: $dark-surface; }
    .location-card__image-wrapper { background-color: $dark-background; }
    .location-card__content { background-color: $dark-surface; }
    .location-card__city,
    .location-card__type { color: $dark-muted; }
    .location-card__name { color: $dark-text; }
  }

  &__badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 10;
    width: 1.5rem;
    height: 1.5rem;
    @include flex-center;
    background-color: $color-background;
    border-radius: $radius-sm;
    cursor: pointer;
  }

  &__badge-input { width: 1rem; height: 1rem; accent-color: $color-accent; cursor: pointer; }

  &__focus {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 10;
    width: 1.75rem;
    height: 1.75rem;
    @include flex-center;
    background-color: $color-background;
    border-radius: 50%;
    cursor: pointer;
    transition: transform $transition-base;
    &:hover { transform: scale(1.1); }
  }

  &__focus-icon {
    &--default { display: block; }
    &--active { display: none; }
    .location-card--selected &,
    .location-card--active & {
      &--default { display: none; }
      &--active { display: block; }
    }
  }

  &__link { display: block; text-decoration: none; color: inherit; cursor: pointer; }

  &__image-wrapper {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 0.65rem 0.65rem 0 0;
    background-color: $color-surface;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-slow;
    will-change: transform;
    .location-card:hover & { transform: scale(1.05); }
  }

  &__content { padding: 0.75rem; background-color: $color-background; }
  &__meta { display: flex; align-items: center; gap: 0.375rem; margin-bottom: $spacing-xs; }
  &__city,
  &__type { font-size: $font-size-xs; color: $color-muted; text-transform: uppercase; }
  &__dot { font-size: 0.5rem; color: $color-muted; }
  &__name {
    font-size: $font-size-base;
    font-weight: 400;
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
    top: $spacing-md;
    left: $spacing-md;
    display: flex;
    gap: $spacing-xs;
    z-index: 10;
    background-color: $color-background;
    border-radius: $radius-full;
    padding: $spacing-xs;
    box-shadow: $shadow-sm;
    @include tablet { display: none; }
  }

  &__toggle {
    padding: $spacing-sm $spacing-md;
    border: none;
    border-radius: $radius-full;
    background: transparent;
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-base;
    &--active { background-color: $color-primary; color: $color-background; }
  }

  &__container { width: 100%; height: 100%; }
}

// Collection badge
.locations-collection {
  position: absolute;
  top: $spacing-md;
  right: $spacing-md;
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 0.75rem 1.25rem;
  background-color: $color-background;
  border-radius: $radius-full;
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
  bottom: $spacing-lg;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  gap: $spacing-xs;
  padding: $spacing-xs;
  background-color: $color-background;
  border-radius: $radius-full;
  box-shadow: $shadow-lg;
  z-index: $z-dropdown;

  @include tablet { display: flex; }

  &__btn {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: $radius-full;
    background: transparent;
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

  &__header { @include flex-between; padding: $spacing-lg; border-bottom: 1px solid $color-border; }
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
  &__option-checkbox { accent-color: $color-accent; }
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
