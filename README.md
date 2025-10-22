# Quarto Favorites Extension

A Quarto extension that allows users to favorite pages in your website and displays a persistent favorites list.

## Installation

1. Copy the entire `_extensions/favorites` folder to your Quarto project's `_extensions` directory or install using:
  ```
  quarto add ashleyhenry15/favorites
  ```

2. Add the extension to your `_quarto.yml`:

```yaml
project:
  type: website

website:
  title: "My Website"
  
format:
  html:
    theme: cosmo

filters:
  - favorites
```

## Usage

### Adding a Favorite Button

To add a favorite button to any page, use the `favorites-button` shortcode:

```markdown
{{< favorites-button >}}
```

You can customize the button text:

```markdown
{{< favorites-button text="Save this page" >}}
```

**Tip**: Add this to your page template or in the sidebar for consistent placement across all pages.

### Creating a Favorites Page

Create a dedicated favorites page (e.g., `favorites.qmd`):

```markdown
---
title: "My Favorites"
---

Here are your favorited pages:

{{< favorites-list >}}
```

The favorites list will automatically display all pages the user has favorited.

## Example Setup

### 1. Add to Navigation (in `_quarto.yml`)

```yaml
website:
  title: "My Website"
  navbar:
    left:
      - href: index.qmd
        text: Home
      - href: about.qmd
        text: About
      - href: favorites.qmd
        text: "⭐ Favorites"
```

### 2. Add Button to Pages

In your regular content pages:

```markdown
---
title: "My Article"
---

{{< favorites-button >}}

## Content

Your article content here...
```

### 3. Create Favorites Page (`favorites.qmd`)

```markdown
---
title: "My Favorite Pages"
---

Keep track of interesting pages you've visited:

{{< favorites-list >}}
```

## Features

- **Persistent Storage**: Favorites are stored in the browser's localStorage and persist across sessions
- **Visual Feedback**: Button changes appearance when a page is favorited
- **Toast Notifications**: Users get immediate feedback when adding/removing favorites
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to light/dark themes
- **Easy Removal**: Remove favorites directly from the favorites list

## Browser Compatibility

This extension uses localStorage, which is supported in all modern browsers. Users need to have JavaScript enabled for the extension to work.

## Customization

You can customize the appearance by modifying `favorites.css` in the extension directory. The main classes are:

- `.favorite-button` - The favorite button
- `.favorite-item` - Individual items in the favorites list
- `.favorite-feedback` - The toast notification

## Tips

1. **Placement**: Consider adding the favorite button in a consistent location across your site (header, sidebar, or at the top of content)
2. **Promotion**: Mention the favorites feature in your site's introduction or help section
3. **Clear Labels**: Use descriptive page titles as they appear in the favorites list

## Troubleshooting

**Favorites not persisting**: Ensure JavaScript is enabled and localStorage is available in the browser.

**Button not appearing**: Make sure the shortcode is properly placed and the extension is loaded in `_quarto.yml`.

**Styling issues**: Check that `favorites.css` is being loaded. You may need to adjust CSS for your specific theme.

## License

MIT License - Feel free to modify and use in your projects!
