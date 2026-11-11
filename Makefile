#########################################################################################
# Makefile for Resume Generation
#
# This Makefile compiles the LaTeX resume source into a PDF that is checked into
# the repository and served to users via the website's download button.
#
# Prerequisites:
#   - pdflatex (install via: brew install --cask mactex-no-gui on macOS)
#   OR
#   - Docker (for containerized LaTeX compilation)
#
# Usage:
#   make environment   - Set up Node 22, npm packages, and tectonic
#   make pdf           - Generate resume PDF with tectonic
#   make resume       - Generate resume PDF from LaTeX source (requires pdflatex)
#   make resume-docker - Generate resume PDF using Docker (no local LaTeX needed)
#   make clean         - Remove auxiliary LaTeX files
#   make help          - Show available targets
#########################################################################################

.PHONY: environment pdf resume resume-docker clean help check-latex dev

# Node 22 (installed by make environment) and tectonic come first on PATH
NODE_DIR := $(HOME)/.local/node22
export PATH := $(NODE_DIR)/node_modules/.bin:$(HOME)/.local/bin:$(PATH)

# Default target
help:
	@echo "Available targets:"
	@echo "  make environment   - Set up Node 22, npm packages, and tectonic"
	@echo "  make dev           - Start local development server at http://localhost:3000"
	@echo "  make pdf           - Build resume/resume.pdf with tectonic (prints page count)"
	@echo "  make resume        - Generate resume PDF using local pdflatex"
	@echo "  make resume-docker - Generate resume PDF using Docker (no LaTeX install needed)"
	@echo "  make clean         - Remove auxiliary LaTeX files"
	@echo "  make help          - Show this help message"
	@echo ""
	@echo "If pdflatex is not installed:"
	@echo "  macOS:   brew install --cask mactex-no-gui"
	@echo "  Ubuntu:  sudo apt-get install texlive-latex-extra texlive-fonts-recommended"
	@echo "  Or use:  make resume-docker (requires Docker)"

# Set up everything the site and the resume build need (safe to rerun)
environment:
	@if node -e 'process.exit(+process.versions.node.split(".")[0] < 18 ? 1 : 0)' 2>/dev/null; then \
		echo "✓ Node $$(node -v)"; \
	else \
		echo "Installing Node 22 into $(NODE_DIR)..."; \
		mkdir -p $(NODE_DIR) && cd $(NODE_DIR) && npm init -y >/dev/null && npm install node@22 >/dev/null && \
		echo "✓ Node $$($(NODE_DIR)/node_modules/.bin/node -v)"; \
	fi
	@npm install && echo "✓ npm packages"
	@if command -v tectonic >/dev/null 2>&1; then \
		echo "✓ $$(tectonic --version | head -1)"; \
	else \
		echo "Installing tectonic into $(HOME)/.local/bin..."; \
		mkdir -p $(HOME)/.local/bin && cd $(HOME)/.local/bin && \
		curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh; \
	fi

# Start local development server
dev:
	@echo "Starting development server at http://localhost:3000..."
	@npm run dev

# Build the resume PDF with tectonic (fetches LaTeX packages on demand, no TeX install needed)
pdf:
	@command -v tectonic >/dev/null 2>&1 || { echo "tectonic not found: https://tectonic-typesetting.github.io"; exit 1; }
	@cd resume && tectonic --keep-logs resume.tex 2>&1 | grep -iE "error|overfull" || true
	@grep -aoE "[0-9]+ pages?" resume/resume.log | tail -1 | sed 's/^/✓ resume\/resume.pdf: /'

# Check if pdflatex is installed
check-latex:
	@export PATH="/Library/TeX/texbin:$$PATH" && command -v pdflatex >/dev/null 2>&1 || { \
		echo "❌ Error: pdflatex is not installed."; \
		echo ""; \
		echo "Install options:"; \
		echo "  macOS:   brew install --cask mactex-no-gui"; \
		echo "  Ubuntu:  sudo apt-get install texlive-latex-extra texlive-fonts-recommended"; \
		echo "  Windows: Install MiKTeX from https://miktex.org/download"; \
		echo ""; \
		echo "Or use Docker (no LaTeX install needed):"; \
		echo "  make resume-docker"; \
		echo ""; \
		echo "Or use Overleaf (online, no install):"; \
		echo "  1. Go to https://www.overleaf.com/"; \
		echo "  2. Upload resume/resume.tex and resume/resume.cls"; \
		echo "  3. Compile and download the PDF"; \
		echo "  4. Save it as resume/resume.pdf"; \
		echo ""; \
		echo "Note: If you just installed MacTeX, you may need to restart your terminal."; \
		exit 1; \
	}

# Generate resume PDF using local pdflatex
# Note: pdflatex is run twice to ensure proper formatting and cross-references
resume: check-latex
	@echo "Generating resume PDF..."
	@export PATH="/Library/TeX/texbin:$$PATH" && cd resume && pdflatex -interaction=nonstopmode resume.tex > /dev/null || true
	@export PATH="/Library/TeX/texbin:$$PATH" && cd resume && pdflatex -interaction=nonstopmode resume.tex > /dev/null || true
	@if [ -f resume/resume.pdf ]; then \
		echo "✓ Resume PDF generated at resume/resume.pdf"; \
		echo ""; \
		echo "Remember to commit the updated PDF to the repository:"; \
		echo "  git add resume/resume.pdf && git commit -m 'Update resume'"; \
	else \
		echo "❌ Error: PDF generation failed"; \
		exit 1; \
	fi
	@$(MAKE) clean

# Generate resume PDF using Docker (no local LaTeX installation needed)
resume-docker:
	@echo "Generating resume PDF using Docker..."
	@docker run --rm -v "$(PWD)/resume:/data" texlive/texlive:latest \
		sh -c "cd /data && pdflatex -interaction=nonstopmode resume.tex && pdflatex -interaction=nonstopmode resume.tex"
	@echo "✓ Resume PDF generated at resume/resume.pdf"
	@echo ""
	@echo "Remember to commit the updated PDF to the repository:"
	@echo "  git add resume/resume.pdf && git commit -m 'Update resume'"
	@$(MAKE) clean

# Clean up auxiliary files
clean:
	@echo "Cleaning up auxiliary files..."
	@rm -f resume/resume.aux resume/resume.log resume/resume.out
	@echo "✓ Cleanup complete"
