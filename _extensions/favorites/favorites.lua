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

-- Read the sidebar template
function read_file(path)
  local file = io.open(path, "r")
  if file then
    local content = file:read("*all")
    file:close()
    return content
  end
  return nil
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

    -- Get path to favorites page
    local favorites_page_path = "favorites.html"
    if quarto.project and quarto.project.offset then
      favorites_page_path = quarto.project.offset .. "favorites.html"
    end

    -- Create page info as JSON
    local page_info = json_encode({title = title})

    -- Create button HTML
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

    -- Add sidebar favorites (if not on the favorites page itself)
    if not doc.meta.favorites_list then
      -- Read in the sidebar HTML template
      local sidebar_template_path = quarto.utils.resolve_path("favorites-sidebar.html")
      local sidebar_html = read_file(sidebar_template_path) or ""

      -- Replace the favorites page link placeholder with actual path
      sidebar_html = sidebar_html:gsub("{%$favorites_page_link%$}", favorites_page_path)

      -- Method 1: Try to use Quarto's native margin blocks
      quarto.doc.include_text("margin-sidebar", sidebar_html)

      -- Method 2: Also inject via JavaScript as a fallback
      quarto.doc.include_text("after-body", [[
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            // Only inject if the margin-sidebar method didn't work
            // (Check if our sidebar section is already in the DOM)
            if (!document.querySelector(".sidebar-section")) {
              // Find the sidebar - try different possible selectors
              let rightSidebar = document.querySelector("#quarto-margin-sidebar");

              // If not found, try alternative selectors
              if (!rightSidebar) {
                rightSidebar = document.querySelector(".sidebar-right");
              }
              if (!rightSidebar) {
                rightSidebar = document.querySelector(".sidebar.sidebar-navigation");
              }
              if (!rightSidebar) {
                rightSidebar = document.querySelector(".col-lg-2.sidebar");
              }
              if (!rightSidebar) {
                rightSidebar = document.querySelector("[role='complementary']");
              }

              if (rightSidebar) {
                console.log("Found sidebar, inserting favorites");
                // Insert the favorites section into the sidebar
                rightSidebar.insertAdjacentHTML("beforeend", `]] .. sidebar_html .. [[`);
              } else {
                console.warn("Could not find sidebar to insert favorites");
              }
            }
          });
        </script>
      ]])
    end

    -- If this is a favorites list page, add the favorites list HTML with export/import functionality
    if doc.meta.favorites_list then
      local list_html = [[
        <div class="favorites-list-container">
          <div class="favorites-header">
            <h2>My Favorites</h2>
            <div class="favorites-actions">
              <button id="export-favorites" class="favorites-action-button" title="Export your favorites as a file">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Export</span>
              </button>
              <label id="import-favorites-label" class="favorites-action-button" title="Import favorites from a file">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Import</span>
                <input type="file" id="import-favorites" accept=".json" style="display: none;">
              </label>
            </div>
          </div>
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