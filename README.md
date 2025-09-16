# Portfolio Website for Pranav Sawant

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. This website showcases professional work, skills, and experience with a beautiful dark/light mode interface.

## 🚀 Features

- **Modern Design** - Clean, professional layout with smooth animations
- **Dark/Light Mode** - Toggle between themes with persistent preference
- **Responsive** - Fully responsive design that works on all devices
- **Smooth Scrolling** - Seamless navigation between sections
- **Video Background** - Dynamic hero section with fallback image
- **Loading Screen** - Animated loading screen for better UX
- **Interactive Components** - Modern UI components with hover effects

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS** - Tailwind utilities with custom styles
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
Portfolio Website for Pranav Sawant/
├── src/
│   ├── components/         # React components
│   │   ├── figma/         # Figma-specific components
│   │   ├── AboutSection.tsx
│   │   ├── BlogSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── Navigation.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ResumeSection.tsx
│   │   └── SkillsSection.tsx
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # All styles (Tailwind + custom)
├── index.html            # HTML template
├── package.json          # Minimal dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── DEPLOYMENT.md         # GitHub Pages deployment guide
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download the project**
   ```bash
   # If you have git
   git clone <repository-url>
   cd "Portfolio Website for Pranav Sawant"
   
   # Or navigate to the project folder
   cd "C:\Users\prana\Downloads\Portfolio Website for Pranav Sawant"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - The website will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, manually navigate to `http://localhost:3000`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🎨 Customization

### Personal Information
Update the following files with your information:
- `src/components/HeroSection.tsx` - Hero section content
- `src/components/AboutSection.tsx` - About section
- `src/components/ProjectsSection.tsx` - Your projects
- `src/components/SkillsSection.tsx` - Your skills
- `src/components/ResumeSection.tsx` - Resume/experience
- `src/components/ContactSection.tsx` - Contact information

### Styling
- `src/styles/globals.css` - Global styles and CSS variables
- `src/index.css` - Additional styles and animations
- `tailwind.config.js` - Tailwind configuration

### Colors and Theme
The website uses CSS custom properties for theming. You can modify colors in `src/styles/globals.css`:

```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  /* ... more variables */
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
  /* ... dark theme variables */
}
```


















## 📱 Sections

1. **Hero** - Introduction with video background
2. **About** - Personal information and background
3. **Projects** - Portfolio showcase
4. **Skills** - Technical skills and expertise
5. **Resume** - Professional experience
6. **Blog** - Blog posts and articles
7. **Contact** - Contact form and information

## 🌐 Deployment

### Quick Deploy to GitHub Pages
See the detailed [DEPLOYMENT.md](DEPLOYMENT.md) guide for step-by-step instructions.

**Quick Steps:**
1. Create a GitHub repository
2. Push your code to GitHub
3. Enable GitHub Actions in repository settings
4. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

### Build for Production
```bash
npm run build
```

The built files will be in the `build` directory.

### Other Deployment Options
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: Upload `build` folder to Netlify
- **Any static hosting**: Upload `build` folder contents

## 🔧 Configuration

### Vite Configuration
The project uses Vite with React SWC plugin for fast development and building.

### TypeScript Configuration
TypeScript is configured with strict mode and path mapping for clean imports.

### Tailwind Configuration
Tailwind CSS is configured with custom color variables and responsive design utilities.

## 📄 License

This project is private and for personal use.

## 🤝 Contributing

This is a personal portfolio project. If you'd like to use it as a template:

1. Fork or download the project
2. Update all personal information
3. Customize the design and content
4. Deploy to your preferred platform

## 📞 Support

If you encounter any issues:

1. Check that Node.js version is 16 or higher
2. Delete `node_modules` and `package-lock.json`, then run `npm install`
3. Ensure all dependencies are properly installed
4. Check the browser console for any errors

---

**Built with ❤️ by Pranav Sawant**