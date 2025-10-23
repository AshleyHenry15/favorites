-- favorites.lua
-- This filter adds favorites functionality to Quarto websites

-- Simple function to create JSON string manually (no dependency on pandoc.utils.to_json)
function json_encode(val)
  if type(val) == "string" then
    return '"' .. val:gsub('"', '\\"'):gsub("\n", "\\n") .. '"'
  elseif type(val) == "table" then
    local json = "{"
    local first = true
    for k, v in pairs(val) do
      if not first then json = json .. "," end
      first = false
      json = json .. '"' .. k .. '":' .. json_encode(v)
    end
    return json .. "}"
  else
    return tostring(val)
  end
end

-- Main filter function
function Pandoc(doc)
  -- Only process HTML documents
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
    if doc.meta.title then
      title = pandoc.utils.stringify(doc.meta.title)
    end

    -- Create page info as JSON
    local page_info = json_encode({title = title})

    -- Create button HTML
    local button_html = string.format([[
      <div class="favorites-button-container">
        <button id="favorites-button" class="favorites-button" data-page-info='%s'>
          <span class="favorites-icon">♡</span>
          <span class="favorites-text">Add to Favorites</span>
        </button>
      </div>
    ]], page_info)

    -- Add the button HTML to appear below the title
    quarto.doc.include_text("after-title", button_html)

    -- If this is a favorites list page, add the favorites list HTML
    if doc.meta.favorites_list then
      local list_html = [[
        <div class="favorites-list-container">
          <h2>My Favorites</h2>
          <div id="favorites-list">
            <!-- Favorites will be dynamically inserted here by JavaScript -->
            <p class="no-favorites-message">No favorites yet. Browse the site and click the heart icon to add pages to your favorites.</p>
          </div>
        </div>
      ]]

      quarto.doc.include_text("before-body", list_html)
    end
  end

  return doc
end

-- Return filter
return {
  {
    Pandoc = Pandoc
  }
}