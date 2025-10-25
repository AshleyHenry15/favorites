-- utils.lua
-- Shared utility functions for the favorites extension

local utils = {}

--- Simple function to create JSON string manually (no dependency on pandoc.utils.to_json)
--- @param val any The value to encode
--- @return string The JSON-encoded string
function utils.json_encode(val)
  if type(val) == "string" then
    return '"' .. val:gsub('"', '\\"'):gsub("\n", "\\n") .. '"'
  elseif type(val) == "table" then
    local json = "{"
    local first = true
    for k, v in pairs(val) do
      if not first then json = json .. "," end
      first = false
      json = json .. '"' .. k .. '":' .. utils.json_encode(v)
    end
    return json .. "}"
  else
    return tostring(val)
  end
end

--- Read a file from the filesystem
--- @param path string The file path
--- @return string|nil The file contents or nil if not found
function utils.read_file(path)
  local file = io.open(path, "r")
  if file then
    local content = file:read("*all")
    file:close()
    return content
  end
  return nil
end

--- Get a metadata value from the extension's namespace
--- Supports both extensions.favorites.key and direct key access for backwards compatibility
--- @param meta table The document metadata
--- @param key string The configuration key to retrieve
--- @return any|nil The value if found, nil otherwise
function utils.get_metadata_value(meta, key)
  -- Check if meta exists
  if not meta then
    return nil
  end

  -- First check for extensions.favorites.key pattern (preferred)
  if meta.extensions and meta.extensions.favorites then
    local ext_meta = meta.extensions.favorites
    if ext_meta[key] then
      return ext_meta[key]
    end
  end

  -- Fallback to direct key access for backwards compatibility
  if meta[key] then
    return meta[key]
  end

  return nil
end

--- Check if this is a favorites list page
--- @param meta table The document metadata
--- @return boolean True if this is a favorites list page
function utils.is_favorites_list(meta)
  -- Support both extensions.favorites.favorites-list and direct favorites_list for backwards compatibility
  if meta.extensions and meta.extensions.favorites and meta.extensions.favorites["favorites-list"] then
    return true
  elseif meta.favorites_list then
    return true
  end
  return false
end

--- Extract the page title from metadata
--- @param meta table The document metadata
--- @return string The page title or "Untitled Page" as fallback
function utils.get_page_title(meta)
  if meta.title then
    return pandoc.utils.stringify(meta.title)
  end
  return "Untitled Page"
end

--- Get the path to the favorites page, accounting for project offset
--- @return string The path to favorites.html
function utils.get_favorites_page_path()
  local favorites_page_path = "favorites.html"
  if quarto and quarto.project and quarto.project.offset then
    local offset = quarto.project.offset

    -- Remove any leading dot to avoid URL issues
    if offset:sub(1, 1) == "." then
      offset = offset:sub(2)
    end

    -- Ensure there's a forward slash between the offset and filename
    if offset ~= "" and offset:sub(-1) ~= "/" then
      offset = offset .. "/"
    end

    favorites_page_path = offset .. "favorites.html"
  end
  return favorites_page_path
end

return utils
