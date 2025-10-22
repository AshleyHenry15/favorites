-- Shortcode to insert the favorites list container
return {
  ['favorites-list'] = function(args, kwargs)
    -- Return HTML container that will be populated by JavaScript
    return pandoc.RawBlock('html', 
      '<div class="favorites-list-container">' ..
      '<p class="no-favorites">Loading favorites...</p>' ..
      '</div>')
  end
}