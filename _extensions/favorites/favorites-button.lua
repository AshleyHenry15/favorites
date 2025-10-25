-- favorites-button.lua
-- This filter adds a favorites button to each page

--- Load utils module
local utils = require(quarto.utils.resolve_path('_modules/utils.lua'):gsub('%.lua$', ''))

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
    local title = utils.get_page_title(meta)

    -- Create page info as JSON
    local page_info = utils.json_encode({title = title})

    -- Create the favorites button HTML
    local button_html = string.format([[
      <div class="favorites-button-container">
        <button id="favorites-button" class="favorites-button" data-page-info='%s' title="Add to Favorites">
          <svg class="favorites-icon" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
    ]], page_info)

    -- Add the button HTML in a valid location
    quarto.doc.include_text("before-body", button_html)
  end
end

return {
  ["meta"] = Meta
}
