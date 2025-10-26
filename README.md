# Quarto Favorites Extension

[![Netlify Status](https://api.netlify.com/api/v1/badges/d08872a6-76af-4f8a-a438-59073875d9e9/deploy-status)](https://app.netlify.com/projects/quarto-favorites/deploys)

A Quarto extension that allows users to "favorite" pages in a Quarto website. Favorites are saved to the browser's localStorage and persist across sessions. The main branch is automatically deployed to GitHub Pages.

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

```markdown
---
title: "My Favorites"
extensions:
  favorites:
    favorites-list: true
---

This page displays all your favorited pages from this website.
```

The `favorites_list: true` parameter tells the extension to display the favorites list on this page.

### Sidebar Favorites

The extension automatically adds a collapsible "My Favorites" section to the sidebar (if available), showing up to 5 of your favorited pages for quick access from any page. Click "View All Favorites" to see your complete favorites list.

## Link to the favorites page

In the `_quarto.yml` add:

```yaml
website:
  navbar:
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

## Organizing with Sections

Users can organize their favorites into logical groups using section dividers:

1. **Adding Sections**: Click the "Add Section" button on the favorites page
2. **Positioning**: Drag section dividers to create visual groupings of favorites
3. **Editing**: Click the edit (✎) button to rename a section
4. **Removing**: Click the × button to remove a section

Section dividers are visual elements that help organize the favorites list without changing how favorites function. They can be positioned anywhere in the list, and users can drag favorites between sections to create meaningful groups.

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.
