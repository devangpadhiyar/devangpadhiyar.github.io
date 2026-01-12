# Devang Padhiyar Portfolio

Jekyll-based personal portfolio and blog hosted on GitHub Pages.

## Tech Stack
- Jekyll static site generator
- portfolYOU theme (remote)
- GitHub Pages hosting

## Development
```bash
bundle install    # Install dependencies
jekyll serve      # Local server at localhost:4000
jekyll build      # Build to _site/
```

## Structure
```
_config.yml       # Site configuration
_data/            # YAML data (skills.yml, timeline.yml, social-media.yml)
_includes/        # HTML components
_layouts/         # Page templates
_posts/           # Blog posts (YYYY-MM-DD-title.md)
_projects/        # Portfolio items
pages/            # Main pages (about, blog, projects)
assets/           # CSS, icons, images, resume.pdf
```

## Adding Content
- **Blog**: Create `_posts/YYYY-MM-DD-title.md` with front matter
- **Project**: Create `_projects/title.md` with front matter
- **Skills**: Edit `_data/skills.yml`
- **Experience**: Edit `_data/timeline.yml`

## Deployment
Push to main branch - GitHub Pages auto-deploys.
