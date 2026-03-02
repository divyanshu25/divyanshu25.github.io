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
#   make resume        - Generate resume PDF from LaTeX source (requires pdflatex)
#   make resume-docker - Generate resume PDF using Docker (no local LaTeX needed)
#   make clean         - Remove auxiliary LaTeX files
#   make help          - Show available targets
#########################################################################################

.PHONY: resume resume-docker clean help check-latex

# Default target
help:
	@echo "Available targets:"
	@echo "  make resume        - Generate resume PDF using local pdflatex"
	@echo "  make resume-docker - Generate resume PDF using Docker (no LaTeX install needed)"
	@echo "  make clean         - Remove auxiliary LaTeX files"
	@echo "  make help          - Show this help message"
	@echo ""
	@echo "If pdflatex is not installed:"
	@echo "  macOS:   brew install --cask mactex-no-gui"
	@echo "  Ubuntu:  sudo apt-get install texlive-latex-extra texlive-fonts-recommended"
	@echo "  Or use:  make resume-docker (requires Docker)"

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
		echo "  2. Upload public/resume.tex and public/resume.cls"; \
		echo "  3. Compile and download the PDF"; \
		echo "  4. Save it as public/resume.pdf"; \
		echo ""; \
		echo "Note: If you just installed MacTeX, you may need to restart your terminal."; \
		exit 1; \
	}

# Generate resume PDF using local pdflatex
# Note: pdflatex is run twice to ensure proper formatting and cross-references
resume: check-latex
	@echo "Generating resume PDF..."
	@export PATH="/Library/TeX/texbin:$$PATH" && cd public && pdflatex -interaction=nonstopmode resume.tex > /dev/null || true
	@export PATH="/Library/TeX/texbin:$$PATH" && cd public && pdflatex -interaction=nonstopmode resume.tex > /dev/null || true
	@if [ -f public/resume.pdf ]; then \
		echo "✓ Resume PDF generated at public/resume.pdf"; \
		echo ""; \
		echo "Remember to commit the updated PDF to the repository:"; \
		echo "  git add public/resume.pdf && git commit -m 'Update resume'"; \
	else \
		echo "❌ Error: PDF generation failed"; \
		exit 1; \
	fi
	@$(MAKE) clean

# Generate resume PDF using Docker (no local LaTeX installation needed)
resume-docker:
	@echo "Generating resume PDF using Docker..."
	@docker run --rm -v "$(PWD)/public:/data" texlive/texlive:latest \
		sh -c "cd /data && pdflatex -interaction=nonstopmode resume.tex && pdflatex -interaction=nonstopmode resume.tex"
	@echo "✓ Resume PDF generated at public/resume.pdf"
	@echo ""
	@echo "Remember to commit the updated PDF to the repository:"
	@echo "  git add public/resume.pdf && git commit -m 'Update resume'"
	@$(MAKE) clean

# Clean up auxiliary files
clean:
	@echo "Cleaning up auxiliary files..."
	@rm -f public/resume.aux public/resume.log public/resume.out
	@echo "✓ Cleanup complete"
