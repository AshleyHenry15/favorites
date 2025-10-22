// Quarto Favorites Extension
(function() {
  'use strict';
  
  const STORAGE_KEY = 'quarto-favorites';
  
  // Get favorites from localStorage
  function getFavorites() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading favorites:', e);
      return [];
    }
  }
  
  // Save favorites to localStorage
  function saveFavorites(favorites) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      return true;
    } catch (e) {
      console.error('Error saving favorites:', e);
      return false;
    }
  }
  
  // Check if current page is favorited
  function isFavorited(url) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.url === url);
  }
  
  // Add page to favorites
  function addFavorite(url, title) {
    const favorites = getFavorites();
    if (!isFavorited(url)) {
      favorites.push({
        url: url,
        title: title,
        timestamp: new Date().toISOString()
      });
      saveFavorites(favorites);
      return true;
    }
    return false;
  }
  
  // Remove page from favorites
  function removeFavorite(url) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.url !== url);
    saveFavorites(favorites);
  }
  
  // Toggle favorite status
  function toggleFavorite(url, title) {
    if (isFavorited(url)) {
      removeFavorite(url);
      return false;
    } else {
      addFavorite(url, title);
      return true;
    }
  }
  
  // Update all favorite buttons on the page
  function updateFavoriteButtons() {
    const buttons = document.querySelectorAll('.favorite-button');
    const currentUrl = window.location.pathname;
    const favorited = isFavorited(currentUrl);
    
    buttons.forEach(button => {
      if (favorited) {
        button.classList.add('favorited');
        button.setAttribute('aria-pressed', 'true');
        button.querySelector('.favorite-icon').textContent = '★';
        button.querySelector('.favorite-text').textContent = 'Favorited';
      } else {
        button.classList.remove('favorited');
        button.setAttribute('aria-pressed', 'false');
        button.querySelector('.favorite-icon').textContent = '☆';
        button.querySelector('.favorite-text').textContent = 'Add to Favorites';
      }
    });
  }
  
  // Render favorites list
  function renderFavoritesList() {
    const container = document.querySelector('.favorites-list-container');
    if (!container) return;
    
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
      container.innerHTML = '<p class="no-favorites">No favorites yet. Browse the site and click the star icon to add pages to your favorites!</p>';
      return;
    }
    
    // Sort by timestamp (newest first)
    favorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const list = document.createElement('ul');
    list.className = 'favorites-list';
    
    favorites.forEach(fav => {
      const li = document.createElement('li');
      li.className = 'favorite-item';
      
      const link = document.createElement('a');
      link.href = fav.url;
      link.textContent = fav.title;
      link.className = 'favorite-link';
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-favorite';
      removeBtn.innerHTML = '×';
      removeBtn.setAttribute('aria-label', `Remove ${fav.title} from favorites`);
      removeBtn.onclick = function(e) {
        e.preventDefault();
        removeFavorite(fav.url);
        renderFavoritesList();
      };
      
      li.appendChild(link);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
    
    container.innerHTML = '';
    container.appendChild(list);
  }
  
  // Initialize when DOM is ready
  function init() {
    // Set up favorite buttons
    document.querySelectorAll('.favorite-button').forEach(button => {
      button.addEventListener('click', function() {
        const currentUrl = window.location.pathname;
        const currentTitle = document.title;
        const favorited = toggleFavorite(currentUrl, currentTitle);
        updateFavoriteButtons();
        
        // Show feedback
        const feedback = document.createElement('div');
        feedback.className = 'favorite-feedback';
        feedback.textContent = favorited ? 'Added to favorites!' : 'Removed from favorites';
        document.body.appendChild(feedback);
        
        setTimeout(() => {
          feedback.classList.add('show');
        }, 10);
        
        setTimeout(() => {
          feedback.classList.remove('show');
          setTimeout(() => feedback.remove(), 300);
        }, 2000);
      });
    });
    
    // Update button states
    updateFavoriteButtons();
    
    // Render favorites list if on favorites page
    renderFavoritesList();
  }
  
  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Export functions for external use
  window.quartoFavorites = {
    getFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited
  };
})();