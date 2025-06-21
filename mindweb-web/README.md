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

### Quick Start (Recommended)
```bash
npm start
```

This will start a local development server at http://localhost:8080

### Alternative Methods
```bash
# Using Node.js http-server
npx http-server -p 8080

# Using Node.js serve
npx serve -s . -l 8080

# Using PHP (if available)
php -S localhost:8080
```

### Development Mode
```bash
npm run dev
```

This will start the server and automatically open your browser.

## Project Structure

```
mindweb-web/
├── index.html          # Main HTML file
├── script.js          # Application logic
├── package.json       # Node.js dependencies
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

## Troubleshooting

If you encounter issues with Python-based servers, use the Node.js alternatives:

```bash
# Install http-server globally (optional)
npm install -g http-server

# Then run
http-server -p 8080
```