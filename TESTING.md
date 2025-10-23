# Testing the Favorites Extension

This document provides instructions for testing the Quarto Favorites extension.

## Setup

1. Make sure you have Quarto installed:
   ```bash
   quarto --version
   ```

2. Clone this repository:
   ```bash
   git clone https://github.com/AshleyHenry15/favorites.git
   cd favorites
   ```

3. Preview the demo site:
   ```bash
   quarto preview
   ```

## Test Cases

### 1. Favorites Button Appearance

- **Test**: Verify that a heart icon (♡) appears in the top right corner of every page
- **Expected**: Heart icon is visible and positioned correctly on all pages

### 2. Adding a Favorite

- **Test**: Click the heart icon on any page
- **Expected**:
  - Heart icon should turn red (❤)
  - Text should change to "Remove from Favorites"

### 3. Removing a Favorite

- **Test**: Click the red heart icon on a favorited page
- **Expected**:
  - Heart icon should return to outline form (♡)
  - Text should change to "Add to Favorites"

### 4. Favorites List Page

- **Test**: Navigate to the "My Favorites" page (via navbar)
- **Expected**:
  - Page should display a list of all favorited pages
  - If no pages are favorited, it should show a "No favorites yet" message

### 5. Removing from Favorites List

- **Test**: Add some pages to favorites, then visit the Favorites page and click the "×" button next to an item
- **Expected**:
  - Item should be removed from the list
  - If visiting the page that was removed, its heart icon should be in outline form (♡)

### 6. Persistence

- **Test**: Add some pages to favorites, then close the browser completely and reopen the site
- **Expected**:
  - Favorited pages should still show red hearts (❤)
  - Favorites list should still contain all previously favorited pages

### 7. Mobile Responsiveness

- **Test**: View the site on a mobile device or using browser developer tools mobile view
- **Expected**:
  - Favorites button should be positioned properly and be usable
  - Favorites list should be readable and functional

## Debugging

If you encounter issues:

1. Check browser console for JavaScript errors
2. Verify localStorage is working by running in console:
   ```javascript
   console.log(localStorage.getItem('quarto-favorites'))
   ```
3. Check that CSS and JavaScript are properly loaded in the browser

## Report Issues

If you find bugs or have suggestions, please open an issue on GitHub.