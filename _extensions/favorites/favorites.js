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

// Check if a URL belongs to the current website
function isUrlFromCurrentSite(url) {
  if (!url) return false;

  try {
    const currentHost = window.location.hostname;
    const urlObj = new URL(url);
    return urlObj.hostname === currentHost;
  } catch (e) {
    console.warn('Failed to check URL:', url);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Favorites extension: DOM Content loaded');

  // Initialize the favorites system
  initFavorites();

  // Position the favorites button within the title block
  positionFavoritesButton();

  // Attempt to populate the sidebar directly as well
  // This may fail if the sidebar isn't ready yet, but that's okay
  // The sidebar will be populated by the injected script as well
  setTimeout(populateFavoritesSidebar, 300);
});

// Add event listeners for page navigation in Quarto
document.addEventListener('DOMContentLoaded', function() {
  // For Quarto's navigation system (if it exists)
  if (window.quartoNavigationListener) {
    console.log('Favorites extension: Quarto navigation listener found, adding to it');
    const originalListener = window.quartoNavigationListener;

    window.quartoNavigationListener = function(e) {
      // Call the original listener first
      originalListener(e);

      // Then repopulate our sidebar
      console.log('Favorites extension: Quarto navigation event - repopulating sidebar');
      setTimeout(populateFavoritesSidebar, 300);
    };
  }

  // For standard navigation events
  window.addEventListener('popstate', function() {
    console.log('Favorites extension: Popstate event - repopulating sidebar');
    setTimeout(populateFavoritesSidebar, 300);
  });

  // For page shows (which happen when navigating back/forward)
  window.addEventListener('pageshow', function() {
    console.log('Favorites extension: Pageshow event - repopulating sidebar');
    setTimeout(populateFavoritesSidebar, 300);
  });
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

  // Populate the favorites sidebar if it exists
  populateFavoritesSidebar();

  // Setup the favorites sidebar toggle functionality
  setupFavoritesSidebarToggle();

  // Setup export/import functionality
  setupExportImport();

  // Setup section divider functionality
  setupSectionDividers();
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

  let action = '';

  if (index === -1) {
    // Add to favorites
    action = 'added';
    favorites.push({
      title: pageInfo.title,
      url: pageInfo.url,
      dateAdded: new Date().toISOString()
    });
  } else {
    // Remove from favorites
    action = 'removed';
    favorites.splice(index, 1);
  }

  // Save updated favorites
  saveFavorites(favorites);

  console.log(`Favorites extension: ${action} "${pageInfo.title}" ${action === 'added' ? 'to' : 'from'} favorites`);

  // Ensure the sidebar is updated if it exists
  populateFavoritesSidebar();

  // Also trigger a custom event that other scripts might listen for
  const event = new CustomEvent('favoriteChanged', {
    detail: {
      action: action,
      pageInfo: pageInfo,
      favorites: favorites
    }
  });
  document.dispatchEvent(event);
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
  // Enable drag and drop
  ul.setAttribute('data-draggable-list', true);

  favorites.forEach((favorite, index) => {
    // Check if this is a section divider
    if (favorite.type === 'divider') {
      // Create a section divider element
      const divider = document.createElement('div');
      divider.className = 'section-divider';
      divider.setAttribute('draggable', true);
      divider.setAttribute('data-index', index);

      // Add drag handle
      const dragHandle = document.createElement('div');
      dragHandle.className = 'section-divider-handle';
      dragHandle.innerHTML = '⋮⋮';
      dragHandle.title = 'Drag to reorder';

      // Add section title
      const titleEl = document.createElement('div');
      titleEl.className = 'section-divider-title';
      titleEl.textContent = favorite.title;

      // Add edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'section-divider-edit';
      editBtn.innerHTML = '✎';
      editBtn.title = 'Edit section name';
      editBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        editSectionDivider(index);
      });

      // Add remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-favorite';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Remove section';
      removeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Remove section from favorites
        const favorites = getFavorites();
        favorites.splice(index, 1);
        saveFavorites(favorites);

        // Refresh the display
        populateFavoritesList();
      });

      // Add event listeners for drag and drop
      divider.addEventListener('dragstart', handleDragStart);
      divider.addEventListener('dragover', handleDragOver);
      divider.addEventListener('dragenter', handleDragEnter);
      divider.addEventListener('dragleave', handleDragLeave);
      divider.addEventListener('drop', handleDrop);
      divider.addEventListener('dragend', handleDragEnd);

      // Assemble the divider
      divider.appendChild(dragHandle);
      divider.appendChild(titleEl);
      divider.appendChild(editBtn);
      divider.appendChild(removeBtn);

      // Add to list
      ul.appendChild(divider);
    } else {
      // Regular favorite item
      const li = document.createElement('li');

      // Set drag attributes
      li.setAttribute('draggable', true);
      li.setAttribute('data-index', index);
      li.classList.add('draggable-item');

      // Add drag handle
      const dragHandle = document.createElement('div');
      dragHandle.className = 'drag-handle';
      dragHandle.innerHTML = '⋮⋮';
      dragHandle.title = 'Drag to reorder';

      const link = document.createElement('a');
      link.href = favorite.url;
      link.textContent = favorite.title;

      // Wrap link in a container for better layout control
      const linkContainer = document.createElement('div');
      linkContainer.className = 'favorite-link-container';

      // Check if the URL belongs to the current site
      const isInternal = isUrlFromCurrentSite(favorite.url);
      if (!isInternal) {
        li.classList.add('external-favorite');

        // Add warning icon
        const warningIcon = document.createElement('span');
        warningIcon.className = 'external-warning';
        warningIcon.title = 'This link is from another website and may not work in this context';
        warningIcon.innerHTML = '⚠️';

        // Insert warning icon before link text
        link.prepend(warningIcon);
        link.classList.add('external-link');
      }

      linkContainer.appendChild(link);

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

      // Add event listeners for drag and drop
      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragover', handleDragOver);
      li.addEventListener('dragenter', handleDragEnter);
      li.addEventListener('dragleave', handleDragLeave);
      li.addEventListener('drop', handleDrop);
      li.addEventListener('dragend', handleDragEnd);

      li.appendChild(dragHandle);
      li.appendChild(linkContainer);
      li.appendChild(removeBtn);
      ul.appendChild(li);
    }
  });

  favoritesList.appendChild(ul);

  // Add a message about drag-and-drop
  if (favorites.length > 1) {
    const reorderMsg = document.createElement('p');
    reorderMsg.className = 'reorder-message';
    reorderMsg.textContent = 'Tip: Drag and drop items to reorder your favorites.';
    favoritesList.appendChild(reorderMsg);
  }
}

// Remove a favorite by URL
function removeFavorite(url) {
  const favorites = getFavorites();
  const normalizedUrl = normalizeUrl(url);
  const index = favorites.findIndex(fav => normalizeUrl(fav.url) === normalizedUrl);

  if (index !== -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);

    // Update sidebar if it exists
    populateFavoritesSidebar();
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

  // Check for favorites that don't match the current site
  const externalLinks = [];
  const internalLinks = [];
  const sectionDividers = [];

  importedFavorites.forEach(fav => {
    // Identify section dividers
    if (fav.type === 'divider') {
      sectionDividers.push(fav);
    }
    // For regular favorites, check if they're internal or external
    else if (isUrlFromCurrentSite(fav.url)) {
      internalLinks.push(fav);
    } else {
      externalLinks.push(fav);
    }
  });

  const totalItems = importedFavorites.length;
  const itemsWithoutDividers = totalItems - sectionDividers.length;

  // If all links are external (and no internal links), warn the user
  if (internalLinks.length === 0 && externalLinks.length > 0) {
    let message = `Warning: None of the ${externalLinks.length} imported favorites match pages on this site.`;
    if (sectionDividers.length > 0) {
      message += ` (${sectionDividers.length} section dividers were also found.)`;
    }
    message += ` These favorites may be from a different website.`;
    alert(message);

    // Ask if they still want to import them
    if (!confirm('Do you still want to import these external favorites? They will be marked with a warning icon in your favorites list.')) {
      return; // User cancelled import
    }
  }
  // If there's a mix of internal and external links
  else if (externalLinks.length > 0) {
    let message = `Note: ${externalLinks.length} out of ${itemsWithoutDividers} imported favorites appear to be from other websites`;
    message += ` and may not work on this site. External links will be marked with a warning icon in your favorites list.`;
    if (sectionDividers.length > 0) {
      message += ` (${sectionDividers.length} section dividers were also imported.)`;
    }
    alert(message);
  }
  // If there are only internal links and section dividers
  else if (sectionDividers.length > 0) {
    // No need for a warning, just proceed
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

      // Show appropriate success message
      let message = `Successfully merged ${importedFavorites.length} items`;
      message += ` (${mergedFavorites.length - currentFavorites.length} new added`;

      if (externalLinks.length > 0) {
        message += `, ${externalLinks.length} from external sites`;
      }

      if (sectionDividers.length > 0) {
        message += `, ${sectionDividers.length} section dividers`;
      }

      message += ").";
      alert(message);
    } else {
      // Replace all favorites
      saveFavorites(importedFavorites);

      // Show appropriate success message
      let message = `Replaced all favorites with ${importedFavorites.length} imported items`;

      if (externalLinks.length > 0 || sectionDividers.length > 0) {
        message += " (";

        if (externalLinks.length > 0) {
          message += `${externalLinks.length} from external sites`;
          if (sectionDividers.length > 0) {
            message += ", ";
          }
        }

        if (sectionDividers.length > 0) {
          message += `${sectionDividers.length} section dividers`;
        }

        message += ")";
      }

      message += ".";
      alert(message);
    }
  } else {
    // No current favorites, just save the imported ones
    saveFavorites(importedFavorites);

    // Show appropriate success message
    let message = `Successfully imported ${importedFavorites.length} items`;

    if (externalLinks.length > 0 || sectionDividers.length > 0) {
      message += " (";

      if (externalLinks.length > 0) {
        message += `${externalLinks.length} from external sites`;
        if (sectionDividers.length > 0) {
          message += ", ";
        }
      }

      if (sectionDividers.length > 0) {
        message += `${sectionDividers.length} section dividers`;
      }

      message += ")";
    }

    message += ".";
    alert(message);
  }

  // Update all favorites displays
  populateFavoritesList();
  populateFavoritesSidebar();
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

// Drag and drop functionality
let draggedItem = null;
let dragSourceIndex = -1;

// Handle drag start event
function handleDragStart(e) {
  // Set the item being dragged
  draggedItem = this;
  dragSourceIndex = parseInt(this.getAttribute('data-index'), 10);

  // Set drag effect and add dragging class
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragSourceIndex);
  this.classList.add('dragging');

  // Set a timeout to add a class that will apply transition effects only after dragging starts
  setTimeout(() => {
    document.querySelectorAll('.draggable-item').forEach(item => {
      if (item !== draggedItem) {
        item.classList.add('drag-animation');
      }
    });
  }, 0);

  return true;
}

// Handle drag over event
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

// Handle drag enter event
function handleDragEnter(e) {
  this.classList.add('drag-over');
}

// Handle drag leave event
function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

// Handle drop event
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedItem && draggedItem !== this) {
    // Get the destination index
    const targetIndex = parseInt(this.getAttribute('data-index'), 10);

    // Reorder the favorites array
    const favorites = getFavorites();
    const itemToMove = favorites[dragSourceIndex];

    // Remove the item from its original position
    favorites.splice(dragSourceIndex, 1);

    // Insert at new position
    favorites.splice(targetIndex, 0, itemToMove);

    // Save the reordered favorites
    saveFavorites(favorites);

    // Refresh all favorites displays
    populateFavoritesList();
    populateFavoritesSidebar();
  }

  return false;
}

// Handle drag end event
function handleDragEnd(e) {
  // Remove visual classes
  document.querySelectorAll('.draggable-item').forEach(item => {
    item.classList.remove('dragging', 'drag-over', 'drag-animation');
  });

  // Reset the dragged item reference
  draggedItem = null;
  dragSourceIndex = -1;
}

// Populate the favorites sidebar
function populateFavoritesSidebar() {
  console.log('Favorites extension: Populating sidebar');
  const sidebarFavorites = document.getElementById('sidebar-favorites');
  if (!sidebarFavorites) {
    console.warn('Favorites extension: sidebar-favorites element not found');
    // If the element doesn't exist but we're supposed to populate the sidebar,
    // try again after a short delay
    setTimeout(populateFavoritesSidebar, 500);
    return;
  }

  const favorites = getFavorites();
  console.log(`Favorites extension: Found ${favorites.length} favorites in localStorage`);

  const noFavoritesMessage = sidebarFavorites.querySelector('.sidebar-no-favorites');

  // Clear existing favorites except for the no-favorites message
  Array.from(sidebarFavorites.children).forEach(child => {
    if (!child.classList.contains('sidebar-no-favorites')) {
      sidebarFavorites.removeChild(child);
    }
  });

  // Show/hide no favorites message
  if (favorites.length === 0) {
    if (noFavoritesMessage) noFavoritesMessage.style.display = 'block';
    return;
  } else {
    if (noFavoritesMessage) noFavoritesMessage.style.display = 'none';
  }

  // Create a list of favorites (limited to top 5)
  const ul = document.createElement('ul');
  ul.className = 'sidebar-favorites-items';

  // Filter out sections and get regular favorites for sidebar
  const regularFavorites = favorites.filter(fav => fav.type !== 'divider');

  // Get top 5 regular favorites (or all if less than 5)
  // This is the limit of favorites shown in the sidebar
  const SIDEBAR_FAVORITES_LIMIT = 5;
  const topFavorites = regularFavorites.slice(0, SIDEBAR_FAVORITES_LIMIT);
  console.log(`Favorites extension: Displaying top ${topFavorites.length} favorites in sidebar`);

  topFavorites.forEach((favorite, index) => {
    console.log(`Favorites extension: Adding favorite ${index + 1}: ${favorite.title}`);
    const li = document.createElement('li');
    li.className = 'sidebar-favorite-item';

    const link = document.createElement('a');
    link.href = favorite.url;
    link.textContent = favorite.title;
    link.className = 'sidebar-favorite-link';

    // Check if the URL belongs to the current site
    const isInternal = isUrlFromCurrentSite(favorite.url);
    if (!isInternal) {
      li.classList.add('sidebar-external-favorite');

      // Add warning icon
      const warningIcon = document.createElement('span');
      warningIcon.className = 'sidebar-external-warning';
      warningIcon.title = 'This link is from another website';
      warningIcon.innerHTML = '⚠️';

      // Insert warning icon before link text
      link.prepend(warningIcon);
    }

    li.appendChild(link);
    ul.appendChild(li);
  });

  sidebarFavorites.appendChild(ul);
  console.log('Favorites extension: Sidebar successfully populated');
}

// Export the populateFavoritesSidebar function to global scope
// This ensures it's available for direct calling from injected scripts
window.populateFavoritesSidebar = populateFavoritesSidebar;

// Set up the favorites sidebar toggle functionality
function setupFavoritesSidebarToggle() {
  console.log('Setting up favorites sidebar toggle');
  const headerElement = document.getElementById('sidebar-favorites-header');
  const contentElement = document.getElementById('sidebar-favorites-content');
  const toggleIcon = headerElement ? headerElement.querySelector('.sidebar-toggle-icon') : null;

  if (!headerElement || !contentElement) {
    console.log('Header or content element not found yet');
    // Try again later if the elements aren't found
    setTimeout(setupFavoritesSidebarToggle, 500);
    return;
  }

  // Check if there's a saved preference, default to collapsed if not set
  const savedPreference = localStorage.getItem('quarto-favorites-collapsed');
  // If no preference has been saved yet, default to collapsed
  const isCollapsed = savedPreference === null ? true : savedPreference === 'true';
  console.log('Initial collapsed state:', isCollapsed);

  // If this is the first time loading, save the default preference
  if (savedPreference === null) {
    localStorage.setItem('quarto-favorites-collapsed', 'true');
  }

  // Set initial state
  if (isCollapsed) {
    contentElement.classList.add('collapsed');
    headerElement.classList.add('collapsed');
    headerElement.setAttribute('aria-expanded', 'false');
    contentElement.style.maxHeight = '0px';
  } else {
    contentElement.classList.remove('collapsed');
    headerElement.classList.remove('collapsed');
    headerElement.setAttribute('aria-expanded', 'true');
    contentElement.style.maxHeight = '500px'; // Should be enough for most cases
  }

  // Add click event listener to the entire header
  headerElement.addEventListener('click', function() {
    const isCurrentlyCollapsed = contentElement.classList.contains('collapsed');
    console.log('Header clicked, current state:', isCurrentlyCollapsed);

    // Toggle collapse state
    if (isCurrentlyCollapsed) {
      contentElement.classList.remove('collapsed');
      headerElement.classList.remove('collapsed');
      headerElement.setAttribute('aria-expanded', 'true');
      contentElement.style.maxHeight = '500px'; // Should be enough for most cases
      localStorage.setItem('quarto-favorites-collapsed', 'false');
    } else {
      contentElement.classList.add('collapsed');
      headerElement.classList.add('collapsed');
      headerElement.setAttribute('aria-expanded', 'false');
      contentElement.style.maxHeight = '0px';
      localStorage.setItem('quarto-favorites-collapsed', 'true');
    }
  });

  // Add keyboard support for accessibility
  headerElement.addEventListener('keydown', function(e) {
    // Toggle on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      headerElement.click();
    }
  });
}

// Setup section dividers functionality
function setupSectionDividers() {
  const addSectionButton = document.getElementById('add-section-divider');
  if (addSectionButton) {
    addSectionButton.addEventListener('click', addNewSectionDivider);
  }
}

// Add a new section divider
function addNewSectionDivider() {
  // Prompt for section name
  const sectionName = prompt('Enter a name for this section:', '');
  if (sectionName === null || sectionName.trim() === '') return; // User cancelled or entered empty string

  // Create a new section divider object
  const sectionDivider = {
    type: 'divider',
    title: sectionName.trim(),
    dateAdded: new Date().toISOString()
  };

  // Add to favorites list
  const favorites = getFavorites();
  favorites.push(sectionDivider);

  // Save updated favorites
  saveFavorites(favorites);

  // Refresh the favorites display
  populateFavoritesList();
}

// Edit a section divider title
function editSectionDivider(index) {
  const favorites = getFavorites();
  const divider = favorites[index];

  // Prompt for new section name
  const newName = prompt('Edit section name:', divider.title);
  if (newName === null || newName.trim() === '') return; // User cancelled or entered empty string

  // Update the divider title
  divider.title = newName.trim();
  saveFavorites(favorites);

  // Refresh the favorites display
  populateFavoritesList();
}

// Update all favorites displays when favorites change
function updateFavoritesDisplays() {
  // Update main favorites list if it exists
  populateFavoritesList();

  // Update sidebar if it exists
  populateFavoritesSidebar();

  // Update button on current page if it exists
  updateCurrentPageButton();
}