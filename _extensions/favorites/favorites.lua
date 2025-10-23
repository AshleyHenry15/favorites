-- favorites.lua
-- This filter adds favorites functionality to Quarto websites

-- Add required JavaScript and CSS resources
function add_resources()
  -- Add CSS
  quarto.doc.add_html_dependency({
    name = "favorites-styles",
    version = "1.0.0",
    stylesheets = {"favorites.css"}
  })

  -- Add JavaScript
  quarto.doc.add_html_dependency({
    name = "favorites-script",
    version = "1.0.0",
    scripts = {"favorites.js"}
  })
end

-- Create the favorites button HTML for the current page
function create_button_html(meta)
  -- Extract title from metadata
  local title = "Untitled Page"
  if meta.title then
    title = pandoc.utils.stringify(meta.title)
  end

  -- Create page info as JSON
  local page_info = pandoc.utils.to_json({title = title})

  -- Return the button HTML
  return string.format([[
    <div class="favorites-button-container">
      <button id="favorites-button" class="favorites-button" data-page-info='%s'>
        <span class="favorites-icon">♡</span>
        <span class="favorites-text">Add to Favorites</span>
      </button>
    </div>
  ]], page_info)
end

-- Create the favorites list HTML
function create_list_html()
  return [[
    <div class="favorites-list-container">
      <h2>My Favorites</h2>
      <div id="favorites-list">
        <!-- Favorites will be dynamically inserted here by JavaScript -->
        <p class="no-favorites-message">No favorites yet. Browse the site and click the heart icon to add pages to your favorites.</p>
      </div>
    </div>
  ]]
end

-- Main filter function
function Pandoc(doc)
  -- Only process HTML documents
  if quarto.doc.is_format("html") then
    -- Add JavaScript and CSS dependencies
    add_resources()

    -- Add the favorites button to the page
    local button_html = create_button_html(doc.meta)
    quarto.doc.include_text("after-body", button_html)

    -- If this is a favorites list page, add the favorites list
    if doc.meta.favorites_list then
      local list_html = create_list_html()
      quarto.doc.include_text("before-body", list_html)
    end
  end

  return doc
end

return {
  {
    Pandoc = Pandoc
  }
}