# Quarto Favorites Extension

A Quarto extension that allows users to "favorite" pages in a Quarto website. Favorites are saved to the browser's localStorage and persist across sessions.

## Overview

The Quarto Favorites extension enhances your Quarto website by adding the ability for users to:

- Save their favorite pages for quick access later
- Organize favorites using section dividers
- Export and import their favorites for backup or transfer to other devices
- Access their top 5 favorites from any page via a collapsible sidebar panel

This extension is ideal for complex documentation sites, educational resources, or any Quarto website where users might want to bookmark specific pages for reference.

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

### Excluding Pages from Favorites

If you want to exclude specific pages (like landing pages or index pages) from having the favorites button, add the following to the YAML front matter of those pages:

```yaml
---
title: "My Page"
no_favorites_button: true
---
```

This will prevent the favorites button from appearing on that specific page, making it impossible to add to favorites.

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

### Sidebar Favorites

The extension automatically adds a collapsible "My Favorites" section to the sidebar (if available), showing up to 5 of your favorited pages for quick access from any page. Click "View All Favorites" to see your complete favorites list.

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

### CSS Customization

You can customize the appearance of the favorites button and list by adding custom CSS rules to your Quarto project. For example, you could add the following CSS to your project's `styles.css` file to modify the favorites button appearance:

```css
/* Change the favorites button size */
.favorites-button {
  width: 36px;
  height: 36px;
}

/* Change the heart icon color when favorited */
.favorites-button.favorited .favorites-icon {
  fill: #9c27b0;  /* Use purple instead of default red */
  stroke: #9c27b0;
}

/* Style section dividers */
.section-divider {
  background-color: #f0f8ff;  /* Light blue background */
  border-left: 3px solid #0d6efd;  /* Blue accent border */
}
```

### Advanced Configuration

Beyond the basic YAML options, you can further customize the extension's behavior by modifying the extension files directly in the `_extensions/favorites/` directory of your project.

For example, to change the number of favorites shown in the sidebar from the default 5 to a different number:

1. Edit `_extensions/favorites/favorites.js`
2. Find the line with `const SIDEBAR_FAVORITES_LIMIT = 5;`
3. Change the value to your preferred number

## Browser Compatibility

This extension uses the browser's localStorage API to store favorites, which is supported by all modern browsers. Favorites are saved per browser per device, but you can use the Export/Import functionality to transfer favorites between devices.

## How It Works

The extension uses browser localStorage to store the user's favorites as a JSON array. This allows the favorites to persist even after the browser is closed.

The extension consists of:

1. A Lua filter that injects the favorites button and JavaScript/CSS into each page
2. A JavaScript file that manages the favorites functionality
3. A CSS file that styles the favorites button and list

Since Quarto generates static websites, the favorites functionality runs entirely in the user's browser, with no server-side processing required.

### Technical Details

The extension adds the following components to your Quarto website:

- **Favorites Button**: A heart icon button positioned in the top right corner of each page.
- **Sidebar Panel**: A collapsible panel in the sidebar showing the top 5 favorites.
- **Favorites Page**: A dedicated page showing all favorites with organization options.

The extension respects Quarto's theme system and uses CSS variables when available for consistent styling across different themes.

## Theme Compatibility

This extension has been tested with various Quarto themes including:

- Default theme
- Cosmo
- Bootstrap
- Sandstone
- And other Bootstrap-based themes

The extension should work with any theme that:
- Uses standard Bootstrap CSS variables
- Has a sidebar element that can be identified

The favorites button automatically positions itself within the title block of the page, and the sidebar panel integrates with existing sidebar containers.

## Usage Tips

- **For Site Authors**:
  - Add the favorites page to your site navigation for easy access
  - Consider excluding index/home pages from favorites to reduce clutter
  - Use custom CSS to match your site's color scheme

- **For Site Users**:
  - Use section dividers to organize favorites by topic or importance
  - Export favorites occasionally as a backup
  - The sidebar shows only 5 favorites - use the full favorites page for complete access
  - Reorder favorites by dragging them to keep the most important ones in the sidebar

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

## Frequently Asked Questions

### Can users share their favorites with other users?
Yes, users can export their favorites to a JSON file and share that file with others. Other users can then import the shared favorites file into their own browser.

### Can I change how many favorites appear in the sidebar?
Yes, you can modify the `SIDEBAR_FAVORITES_LIMIT` constant in the `favorites.js` file to change the number of favorites shown in the sidebar.

### Does this extension work with Quarto books and other formats?
The extension is designed primarily for Quarto websites. It should work with Quarto books as well, but may require additional customization for other formats.

### What happens when a user adds too many favorites?
There's no limit to how many favorites a user can add. However, only the first 5 (by default) will appear in the sidebar. All favorites are always accessible from the favorites page.

### Can I disable the favorites sidebar while keeping the button?
Not directly through configuration, but you could customize the extension files to remove the sidebar injection code while keeping the favorites button functionality.

### Where are favorites stored?
Favorites are stored in the user's browser using localStorage. They persist across browser sessions but are specific to each browser and device.

## License

MIT License
