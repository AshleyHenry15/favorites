// favorites.js
// JavaScript for managing favorites functionality

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the favorites system
  initFavorites();
});

// Initialize the favorites system
function initFavorites() {
  // Check if localStorage is available
  if (!storageAvailable('localStorage')) {
    console.error('localStorage is not available. Favorites functionality will not work.');
    return;
  }

  // Setup the favorites button if it exists on the page
  setupFavoritesButton();

  // Populate the favorites list if on the favorites page
  populateFavoritesList();
}

// Check if storage is available
function storageAvailable(type) {
  try {
    var storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

// Setup the favorites button
function setupFavoritesButton() {
  const button = document.getElementById('favorites-button');
  if (!button) return;

  // Get current page information
  const pageInfo = JSON.parse(button.getAttribute('data-page-info') || '{}');
  pageInfo.url = window.location.href;

  // Check if this page is already favorited
  const favorites = getFavorites();
  const isFavorited = favorites.some(fav => fav.url === pageInfo.url);

  // Update button appearance based on favorite status
  updateFavoriteButton(button, isFavorited);

  // Add click event to toggle favorite status
  button.addEventListener('click', function() {
    toggleFavorite(pageInfo);
    const newStatus = !isFavorited;
    updateFavoriteButton(button, newStatus);
  });
}

// Update the favorite button appearance
function updateFavoriteButton(button, isFavorited) {
  const iconSpan = button.querySelector('.favorites-icon');
  const textSpan = button.querySelector('.favorites-text');

  if (isFavorited) {
    button.classList.add('favorited');
    iconSpan.textContent = '❤'; // Filled heart
    textSpan.textContent = 'Remove from Favorites';
  } else {
    button.classList.remove('favorited');
    iconSpan.textContent = '♡'; // Empty heart
    textSpan.textContent = 'Add to Favorites';
  }
}

// Toggle a page in favorites
function toggleFavorite(pageInfo) {
  const favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.url === pageInfo.url);

  if (index === -1) {
    // Add to favorites
    favorites.push({
      title: pageInfo.title,
      url: pageInfo.url,
      dateAdded: new Date().toISOString()
    });
  } else {
    // Remove from favorites
    favorites.splice(index, 1);
  }

  // Save updated favorites
  saveFavorites(favorites);
}

// Get all favorites from localStorage
function getFavorites() {
  try {
    const favoritesJson = localStorage.getItem('quarto-favorites') || '[]';
    return JSON.parse(favoritesJson);
  } catch (e) {
    console.error('Error retrieving favorites:', e);
    return [];
  }
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  try {
    localStorage.setItem('quarto-favorites', JSON.stringify(favorites));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
}

// Populate the favorites list on the favorites page
function populateFavoritesList() {
  const favoritesList = document.getElementById('favorites-list');
  if (!favoritesList) return;

  const favorites = getFavorites();
  const noFavoritesMessage = favoritesList.querySelector('.no-favorites-message');

  // Clear existing list except for the no-favorites message
  Array.from(favoritesList.children).forEach(child => {
    if (!child.classList.contains('no-favorites-message')) {
      favoritesList.removeChild(child);
    }
  });

  // Show/hide no favorites message
  if (favorites.length === 0) {
    if (noFavoritesMessage) noFavoritesMessage.style.display = 'block';
    return;
  } else {
    if (noFavoritesMessage) noFavoritesMessage.style.display = 'none';
  }

  // Create a list of favorites
  const ul = document.createElement('ul');
  ul.className = 'favorites-items';

  favorites.forEach(favorite => {
    const li = document.createElement('li');

    const link = document.createElement('a');
    link.href = favorite.url;
    link.textContent = favorite.title;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-favorite';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Remove from favorites';
    removeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      removeFavorite(favorite.url);
      li.remove();

      // If no favorites left, show the message
      if (getFavorites().length === 0) {
        if (noFavoritesMessage) noFavoritesMessage.style.display = 'block';
      }
    });

    li.appendChild(link);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });

  favoritesList.appendChild(ul);
}

// Remove a favorite by URL
function removeFavorite(url) {
  const favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.url === url);

  if (index !== -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
  }
}