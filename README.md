# Divyanshu Goyal - Portfolio Website

[![Deploy to GitHub Pages](https://github.com/divyanshu25/divyanshu25.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/divyanshu25/divyanshu25.github.io/actions/workflows/deploy.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

A modern, responsive portfolio website showcasing my work as an Applied Scientist specializing in Large Language Models and Vision-Language Models. Built with cutting-edge web technologies for optimal performance and user experience.

🌐 **Live Site:** [divyanshu25.github.io](https://divyanshu25.github.io)

---

## ✨ Features

- **Modern Design**: Clean, professional interface with smooth animations and transitions
- **Fully Responsive**: Optimized for all devices - desktop, tablet, and mobile
- **Performance Optimized**: Static site generation for lightning-fast load times
- **SEO Friendly**: Built-in SEO optimization with Next.js
- **Easy to Customize**: Simple data-driven content management
- **Automated Deployment**: CI/CD pipeline with GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm installed
- Git for version control

### Local Development

```bash
# Clone the repository
git clone https://github.com/divyanshu25/divyanshu25.github.io.git
cd divyanshu25.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site locally.

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm start
```

The static files will be generated in the `out/` directory.

---

## 📝 Content Management

### Profile Information

Edit **`data/profile.ts`** to update:
- Personal information (name, title, institution)
- Professional bio
- Skills and expertise
- Programming languages
- Tools and frameworks
- Social media links

```typescript
export const profile = {
  name: "Your Name",
  title: "Your Title",
  bio: "Your professional bio...",
  // ... more fields
};
```

### Projects

Edit **`data/projects.ts`** to add or modify projects:
- Project title and summary
- Detailed descriptions
- Technologies used
- GitHub repository links
- Live demo links

### Blog Posts

Edit **`data/posts.ts`** to manage blog content:
- Article titles and summaries
- Publication dates
- Tags and categories
- Full content in Markdown format

---

## 🚀 Deployment

### Automatic Deployment (Recommended)

This site uses GitHub Actions for automatic deployment to GitHub Pages.

**Setup Steps:**

1. Fork or clone this repository
2. Go to **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to the `master` branch:

```bash
git add .
git commit -m "Update content"
git push origin master
```

The site will automatically build and deploy to `https://[username].github.io`

### Manual Deployment

```bash
# Build the static site
npm run build

# Deploy the out/ directory to your hosting provider
```

---

## 📂 Project Structure

```
divyanshu25.github.io/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage
│   ├── blog/[id]/           # Dynamic blog post pages
│   └── projects/[id]/       # Dynamic project pages
├── components/               # React components
│   ├── About.tsx            # About section
│   ├── Contact.tsx          # Contact section
│   ├── Footer.tsx           # Footer component
│   ├── Hero.tsx             # Hero section
│   └── Navigation.tsx       # Navigation bar
├── data/                     # Content data files
│   ├── profile.ts           # Personal information
│   ├── projects.ts          # Projects data
│   └── posts.ts             # Blog posts data
├── public/                   # Static assets
│   ├── profile.jpg          # Profile image
│   └── .nojekyll            # GitHub Pages config
├── .github/workflows/        # CI/CD configuration
│   └── deploy.yml           # GitHub Actions workflow
└── package.json             # Dependencies and scripts
```

---

## 🛠️ Tech Stack

### Core Technologies
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React 19](https://react.dev/)** - UI library

### Deployment & CI/CD
- **[GitHub Actions](https://github.com/features/actions)** - Automated workflows
- **[GitHub Pages](https://pages.github.com/)** - Static site hosting

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **npm** - Package management

---

## 🎨 Customization

### Colors & Theme

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --accent: #2563eb;        /* Primary accent color */
  --accent-hover: #1d4ed8;  /* Hover state */
  /* ... more variables */
}
```

### Fonts

The site uses system fonts for optimal performance. To use custom fonts, update `app/layout.tsx`.

### Animations

Animation classes are defined in `app/globals.css`. Customize timing and effects as needed.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/divyanshu25/divyanshu25.github.io/issues).

---

## 📧 Contact

**Divyanshu Goyal**
- Website: [divyanshu25.github.io](https://divyanshu25.github.io)
- LinkedIn: [divyanshu2594](https://www.linkedin.com/in/divyanshu2594/)
- GitHub: [@divyanshu25](https://github.com/divyanshu25)
- Email: divyanshu.g25@gmail.com

---

<div align="center">
  <sub>Built with ❤️ using Next.js and Tailwind CSS</sub>
</div>
