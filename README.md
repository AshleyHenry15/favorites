# Quarto Favorites Extension

A Quarto extension that allows users to "favorite" pages in a Quarto website. Favorites are saved to the browser's localStorage and persist across sessions.

[![Publish Quarto Site](https://github.com/AshleyHenry15/favorites/actions/workflows/publish-quarto.yml/badge.svg)](https://github.com/AshleyHenry15/favorites/actions/workflows/publish-quarto.yml)

## Live Demo

Try out the extension with our [live demo](https://ashleyhenry15.github.io/favorites/)!

## Installation

You can install this extension in your Quarto project by using the following command:

```bash
quarto add AshleyHenry15/favorites
```

This will install the extension under the `_extensions` directory.

## Enable Favorites

In the `_quarto.yml`, add:

```yaml
filters:
  - favorites
```

## Usage

### Adding Favorites Button to Pages

Once the extension is installed, a favorites button (heart icon) will automatically appear on the top right corner of every page in your Quarto website.

Users can click on this button to add or remove the current page from their favorites. When a page is added to favorites, the heart icon turns red.

### Creating a Favorites Page

To create a dedicated page that displays all favorited pages, create a new Quarto document (e.g., `favorites.qmd`) with the following YAML front matter:

```yaml
---
title: "My Favorites"
favorites_list: true
---

This page displays all your favorited pages from this website.
```

The `favorites_list: true` parameter tells the extension to display the favorites list on this page.

## Link to the favorites page

In the `_quarto.yml` add:

```yaml
    right:
      - text: "Favs"
        href: favorites.qmd
        icon: heart-fill
        aria-label: "My Favorites"
```

## Exporting and Importing Favorites

The favorites page includes Export and Import buttons that allow users to:

1. **Export Favorites**: Download all favorited pages as a JSON file
2. **Import Favorites**: Load favorites from a previously exported JSON file

These features allow users to:
- Back up their favorites for safekeeping
- Transfer favorites between different browsers or devices
- Share their favorites with other users
- Organize favorites in a custom order

When importing, users have the option to either:
- Merge the imported favorites with their existing ones (avoiding duplicates)
- Replace all existing favorites with the imported ones

The extension validates imported favorites to check if they belong to the current website:
- External links (from different websites) are highlighted with warning icons
- Users receive notifications about the number of external links in their imports
- Users can choose whether to include external links in their favorites list

The exported JSON file includes metadata like export date and version information, along with the complete list of favorited pages (titles, URLs, and when they were added).

## Customization

You can customize the appearance of the favorites button and list by adding custom CSS rules to your Quarto project.

## Browser Compatibility

This extension uses the browser's localStorage API to store favorites, which is supported by all modern browsers. Favorites are saved per browser per device, but you can use the Export/Import functionality to transfer favorites between devices.

## How It Works

The extension uses browser localStorage to store the user's favorites as a JSON array. This allows the favorites to persist even after the browser is closed.

The extension consists of:

1. A Lua filter that injects the favorites button and JavaScript/CSS into each page
2. A JavaScript file that manages the favorites functionality
3. A CSS file that styles the favorites button and list

Since Quarto generates static websites, the favorites functionality runs entirely in the user's browser, with no server-side processing required.

## Reordering Favorites

Users can easily customize the order of their favorites using drag-and-drop:

- Drag the handle (⋮⋮) next to any favorite to move it to a new position
- The order is automatically saved and persists across browsing sessions
- This allows users to organize their favorites in order of importance or by any other preferred arrangement

## License

MIT License
