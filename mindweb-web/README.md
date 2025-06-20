# MindWeb - Web Application

This is the standalone web version of MindWeb built with vanilla HTML, CSS, and JavaScript.

## Features

- 🌐 Pure web application (no frameworks)
- 🧠 Interactive knowledge web visualization
- 📊 Progress tracking and achievements
- 💾 Local storage persistence
- 🎨 Modern CSS with gradients and animations
- 📱 Responsive design for all devices

## Getting Started

### Option 1: Simple File Server
Open `index.html` directly in your browser, or serve it with any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8080
```

### Option 2: Live Server (Recommended for Development)
If using VS Code, install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

## Project Structure

```
mindweb-web/
├── index.html          # Main HTML file
├── script.js          # Application logic
├── styles.css         # Styling (embedded in HTML)
└── README.md          # This file
```

## Features

### Knowledge Management
- Create and organize knowledge nodes
- Categorize by subject (Science, Technology, Philosophy, etc.)
- Add tags and sources
- Visual knowledge web representation

### Progress Tracking
- Experience points and leveling system
- Category-based statistics
- Achievement system
- Progress visualization

### Data Management
- Local storage persistence
- Export data as JSON
- Import/restore functionality
- Clear all data option

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Customization

The app uses CSS custom properties for easy theming. Key variables include:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --background-dark: #0f172a;
  --surface-dark: #1e293b;
}
```

## Performance

- Lightweight vanilla JavaScript
- No external dependencies
- Optimized animations with CSS transforms
- Efficient DOM manipulation
- Local storage for fast data access

## Deployment

Deploy to any static hosting service:

- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to a repository and enable Pages
- **Firebase Hosting**: Use Firebase CLI
- **Any web server**: Upload files to public directory