# Quarto Favorites Extension

A Quarto extension that allows users to "favorite" pages in a Quarto website. Favorites are saved to the browser's localStorage and persist across sessions.

## Installation

You can install this extension in your Quarto project by using the following command:

```bash
quarto add AshleyHenry15/favorites
```

This will install the extension under the `_extensions` directory.

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

## Customization

You can customize the appearance of the favorites button and list by adding custom CSS rules to your Quarto project.

## Browser Compatibility

This extension uses the browser's localStorage API to store favorites, which is supported by all modern browsers. Favorites are saved per browser per device, so if a user switches browsers or devices, their favorites will not be transferred.

## How It Works

The extension uses browser localStorage to store the user's favorites as a JSON array. This allows the favorites to persist even after the browser is closed.

The extension consists of:

1. A Lua filter that injects the favorites button and JavaScript/CSS into each page
2. A JavaScript file that manages the favorites functionality
3. A CSS file that styles the favorites button and list

Since Quarto generates static websites, the favorites functionality runs entirely in the user's browser, with no server-side processing required.

## License

MIT License