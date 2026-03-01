# Divyanshu Goyal - Personal Website

A modern, responsive personal portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
```

The static files will be generated in the `out/` directory.

## 📝 Updating Content

### Profile Information

Edit `data/profile.ts` to update your bio, skills, education, and social links.

### Projects

Edit `data/projects.ts` to add or modify projects. Each project includes title, summary, description, tags, and optional GitHub link.

### Blog Posts

Edit `data/posts.ts` to add or modify blog posts.

## 🚀 Deployment to GitHub Pages

This site automatically deploys when you push to the `master` branch.

### Initial Setup

1. Go to repository **Settings > Pages**
2. Under **Source**, select **GitHub Actions**
3. Push your changes:

```bash
git add .
git commit -m "Update site"
git push origin master
```

Your site will be live at: **https://divyanshu25.github.io**

## 📂 Project Structure

```
├── app/                    # Next.js pages
├── components/             # React components
├── data/                   # Content (profile, projects, posts)
└── public/                 # Static assets
```

## 🔧 Technologies

- Next.js 16
- TypeScript
- Tailwind CSS 4
- GitHub Actions
- GitHub Pages

---

Built with Next.js & Tailwind CSS
