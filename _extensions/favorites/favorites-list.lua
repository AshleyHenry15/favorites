-- favorites-list.lua
-- This filter creates the favorites list functionality

-- Function to handle metadata and check for favorites list page
function Meta(meta)
  -- Only process if we're in HTML format
  if quarto.doc.is_format("html") then
    -- Define the favorites list HTML
    local html = [[
      <div class="favorites-list-container">
        <h2>My Favorites</h2>
        <div id="favorites-list">
          <!-- Favorites will be dynamically inserted here by JavaScript -->
          <p class="no-favorites-message">No favorites yet. Browse the site and click the heart icon to add pages to your favorites.</p>
        </div>
      </div>
    ]]

    -- Check if this is the favorites list page
    if meta.favorites_list then
      -- Insert the favorites list HTML into the document
      quarto.doc.include_text("before-body", html)
    end
  end
end

return {
  ["meta"] = Meta
}