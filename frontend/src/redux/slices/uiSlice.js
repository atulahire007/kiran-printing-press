import { createSlice } from '@reduxjs/toolkit';
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('kpp_theme') === 'dark',
    mobileMenuOpen: false, searchOpen: false, cartOpen: false,
    language: localStorage.getItem('kpp_lang') || 'en',
  },
  reducers: {
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode; localStorage.setItem('kpp_theme', state.darkMode ? 'dark' : 'light'); },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    closeCart: (state) => { state.cartOpen = false; },
    setLanguage: (state, action) => { state.language = action.payload; localStorage.setItem('kpp_lang', action.payload); },
  },
});
export const { toggleDarkMode, toggleMobileMenu, closeMobileMenu, toggleSearch, toggleCart, closeCart, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;
