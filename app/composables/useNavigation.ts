export const useNavigation = () => {
  const isMenuOpen = useState('nav-menu-open', () => false)

  const openMenu = () => {
    isMenuOpen.value = true
  }

  const closeMenu = () => {
    isMenuOpen.value = false
  }

  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
  }

  return {
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu
  }
}
