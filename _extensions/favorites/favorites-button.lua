-- favorites-button.lua
-- This filter adds a favorites button to each page

return {
  {
    Pandoc = function(doc)
      -- Only add favorites button to HTML documents
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

        -- Get page title from metadata
        local title = "Untitled Page"
        if quarto.doc.meta.title then
          if pandoc.utils.type(quarto.doc.meta.title) == "Inlines" then
            title = pandoc.utils.stringify(quarto.doc.meta.title)
          elseif type(quarto.doc.meta.title) == "string" then
            title = quarto.doc.meta.title
          end
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

      return doc
    end
  }
}