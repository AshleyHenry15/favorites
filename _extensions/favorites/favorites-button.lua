-- favorites-button.lua
-- This filter adds a favorites button to each page

-- Function to handle metadata and format title
function Meta(meta)
  -- Only process if we're in HTML format
  if quarto.doc.is_format("html") then
    -- Add CSS and JavaScript dependencies
    quarto.doc.add_html_dependency({
      name = "favorites-styles",
      version = "1.0.0",
      stylesheets = {"favorites.css"}
    })

    quarto.doc.add_html_dependency({
      name = "favorites-script",
      version = "1.0.0",
      scripts = {"favorites.js"}
    })

    -- Extract title from metadata
    local title = "Untitled Page"
    if meta.title then
      title = pandoc.utils.stringify(meta.title)
    end

    -- Create page info as JSON
    local page_info = pandoc.utils.to_json({title = title})

    -- Create the favorites button HTML
    local button_html = string.format([[
      <div class="favorites-button-container">
        <button id="favorites-button" class="favorites-button" data-page-info='%s'>
          <span class="favorites-icon">♡</span>
          <span class="favorites-text">Add to Favorites</span>
        </button>
      </div>
    ]], page_info)

    -- Add the button HTML after the body
    quarto.doc.include_text("after-body", button_html)
  end
end

return {
  ["meta"] = Meta
}