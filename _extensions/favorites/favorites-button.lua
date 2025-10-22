-- Shortcode to insert a favorite button
return {
  ['favorites-button'] = function(args, kwargs)
    -- Get optional text parameter
    local text = pandoc.utils.stringify(kwargs['text'] or 'Add to Favorites')
    
    -- Return HTML for the button
    return pandoc.RawBlock('html', 
      '<button class="favorite-button" aria-pressed="false">' ..
      '<span class="favorite-icon">☆</span>' ..
      '<span class="favorite-text">' .. text .. '</span>' ..
      '</button>')
  end
}