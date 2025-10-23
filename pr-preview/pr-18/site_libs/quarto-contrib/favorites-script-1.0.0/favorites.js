// favorites.js
// JavaScript for managing favorites functionality

// Normalize URLs for consistent comparison
function normalizeUrl(url) {
  if (!url) return '';

  try {
    // Create a URL object to parse the URL
    const urlObj = new URL(url);

    // Get hostname and pathname (remove trailing slash if present)
    let path = urlObj.pathname;
    if (path.endsWith('/') && path !== '/') {
      path = path.slice(0, -1);
    }

    // Return normalized URL (hostname + path, without protocol, query params, or hash)
    return urlObj.hostname + path;
  } catch (e) {
    // If URL parsing fails, return original string
    console.warn('Failed to normalize URL:', url);
    return url;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the favorites system
  initFavorites();

  // Position the favorites button within the title block
  positionFavoritesButton();
});

// Position the favorites button near the title
function positionFavoritesButton() {
  const buttonContainer = document.querySelector('.favorites-button-container');
  const titleBlock = document.querySelector('.quarto-title-block') || document.querySelector('.title-block');

  if (buttonContainer && titleBlock) {
    // Remove from current position
    buttonContainer.parentNode.removeChild(buttonContainer);

    // Append to title block
    titleBlock.appendChild(buttonContainer);

    // Add class to title block for positioning context
    titleBlock.classList.add('favorites-title-container');
  }
}

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

  // Setup export/import functionality
  setupExportImport();
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
  // Normalize URLs for comparison (remove trailing slashes, protocol differences, etc.)
  const normalizedCurrentUrl = normalizeUrl(pageInfo.url);
  const isFavorited = favorites.some(fav => normalizeUrl(fav.url) === normalizedCurrentUrl);

  // Update button appearance based on favorite status
  updateFavoriteButton(button, isFavorited);

  // Add click event to toggle favorite status
  button.addEventListener('click', function() {
    // Get current status before toggling
    const favorites = getFavorites();
    const normalizedCurrentUrl = normalizeUrl(pageInfo.url);
    const currentStatus = favorites.some(fav => normalizeUrl(fav.url) === normalizedCurrentUrl);

    // Toggle the favorite status
    toggleFavorite(pageInfo);

    // Update button appearance with the opposite of current status
    updateFavoriteButton(button, !currentStatus);
  });
}

// Update the favorite button appearance
function updateFavoriteButton(button, isFavorited) {
  if (isFavorited) {
    button.classList.add('favorited');
    button.title = 'Remove from Favorites';
  } else {
    button.classList.remove('favorited');
    button.title = 'Add to Favorites';
  }
}

// Toggle a page in favorites
function toggleFavorite(pageInfo) {
  const favorites = getFavorites();
  const normalizedUrl = normalizeUrl(pageInfo.url);
  const index = favorites.findIndex(fav => normalizeUrl(fav.url) === normalizedUrl);

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
  const normalizedUrl = normalizeUrl(url);
  const index = favorites.findIndex(fav => normalizeUrl(fav.url) === normalizedUrl);

  if (index !== -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
  }
}

// Set up export and import functionality
function setupExportImport() {
  // Set up export button
  const exportButton = document.getElementById('export-favorites');
  if (exportButton) {
    exportButton.addEventListener('click', exportFavorites);
  }

  // Set up import button
  const importInput = document.getElementById('import-favorites');
  if (importInput) {
    importInput.addEventListener('change', importFavorites);
  }
}

// Export favorites to a JSON file
function exportFavorites() {
  const favorites = getFavorites();

  // If no favorites, show a message and return
  if (favorites.length === 0) {
    alert('You have no favorites to export.');
    return;
  }

  // Create export data with metadata
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    favorites: favorites
  };

  // Convert to JSON
  const jsonData = JSON.stringify(exportData, null, 2);

  // Create download link
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create a temporary link element and trigger download
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'favorites-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Clean up
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

// Import favorites from a JSON file
function importFavorites(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      // Parse the imported JSON
      const importedData = JSON.parse(e.target.result);

      // Validate the imported data
      if (!importedData.favorites || !Array.isArray(importedData.favorites)) {
        throw new Error('Invalid favorites data format');
      }

      // Handle importing based on user's choice
      handleImport(importedData.favorites);

    } catch (error) {
      alert('Error importing favorites: ' + error.message);
    }

    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  reader.readAsText(file);
}

// Handle import with user choice for merge or replace
function handleImport(importedFavorites) {
  if (importedFavorites.length === 0) {
    alert('No favorites found in the imported file.');
    return;
  }

  const currentFavorites = getFavorites();

  // If current favorites exist, ask user if they want to merge or replace
  if (currentFavorites.length > 0) {
    if (confirm('Do you want to merge with your existing favorites? Click OK to merge, or Cancel to replace all existing favorites.')) {
      // Merge favorites (avoiding duplicates)
      const mergedFavorites = [...currentFavorites];

      importedFavorites.forEach(importedFav => {
        // Check if this URL already exists in current favorites
        const normalizedImportedUrl = normalizeUrl(importedFav.url);
        const exists = mergedFavorites.some(existingFav => normalizeUrl(existingFav.url) === normalizedImportedUrl);
        if (!exists) {
          mergedFavorites.push(importedFav);
        }
      });

      saveFavorites(mergedFavorites);
      alert(`Successfully merged ${importedFavorites.length} favorites (${mergedFavorites.length - currentFavorites.length} new added).`);
    } else {
      // Replace all favorites
      saveFavorites(importedFavorites);
      alert(`Replaced all favorites with ${importedFavorites.length} imported favorites.`);
    }
  } else {
    // No current favorites, just save the imported ones
    saveFavorites(importedFavorites);
    alert(`Successfully imported ${importedFavorites.length} favorites.`);
  }

  // Refresh the favorites list display
  populateFavoritesList();

  // Update button on current page if it exists
  updateCurrentPageButton();
}

// Update the button on the current page if it exists
function updateCurrentPageButton() {
  const button = document.getElementById('favorites-button');
  if (!button) return;

  const pageInfo = JSON.parse(button.getAttribute('data-page-info') || '{}');
  pageInfo.url = window.location.href;

  // Check if this page is now in favorites
  const favorites = getFavorites();
  const normalizedCurrentUrl = normalizeUrl(pageInfo.url);
  const isFavorited = favorites.some(fav => normalizeUrl(fav.url) === normalizedCurrentUrl);

  // Update button appearance
  updateFavoriteButton(button, isFavorited);
}