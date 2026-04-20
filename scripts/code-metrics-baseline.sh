#!/bin/bash

# Code Metrics Baseline Script
# Run this before starting any development phase

echo "========================================="
echo "🔍 CODE METRICS BASELINE ANALYSIS"
echo "========================================="
echo "Timestamp: $(date)"
echo "Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'Not a git repository')"
echo ""

echo "========================================="
echo "📊 SOURCE CODE METRICS"
echo "========================================="

# Calculate total source lines of code (excluding generated files)
TOTAL_LOC=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  grep -v "migrations/meta" | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')

echo "Total Source Lines of Code: $TOTAL_LOC"

echo ""
echo "========================================="
echo "📁 FILE TYPE BREAKDOWN"
echo "========================================="

# TypeScript files
TS_FILES=$(find . -name "*.ts" -o -name "*.tsx" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  grep -v "migrations/meta" | \
  wc -l)
TS_LOC=$(find . -name "*.ts" -o -name "*.tsx" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  grep -v "migrations/meta" | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "TypeScript/TSX Files: $TS_FILES ($TS_LOC lines)"

# JavaScript files
JS_FILES=$(find . -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  wc -l)
JS_LOC=$(find . -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "JavaScript/JSX Files: $JS_FILES ($JS_LOC lines)"

# JSON config files (excluding generated)
JSON_FILES=$(find . -name "*.json" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  grep -v "migrations/meta" | \
  grep -v "package-lock.json" | \
  wc -l)
JSON_LOC=$(find . -name "*.json" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  grep -v "migrations/meta" | \
  grep -v "package-lock.json" | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "JSON Config Files: $JSON_FILES ($JSON_LOC lines)"

# Documentation files
MD_FILES=$(find . -name "*.md" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  wc -l)
MD_LOC=$(find . -name "*.md" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "Documentation Files: $MD_FILES ($MD_LOC lines)"

# HTML and CSS
HTML_FILES=$(find . -name "*.html" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  wc -l)
CSS_FILES=$(find . -name "*.css" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  wc -l)
HTML_LOC=$(find . -name "*.html" -o -name "*.css" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo "HTML/CSS Files: $((HTML_FILES + CSS_FILES)) ($HTML_LOC lines)"

echo ""
echo "========================================="
echo "🏗️ CODE STRUCTURE ANALYSIS"
echo "========================================="

# Count functions, classes, interfaces
FUNCTIONS=$(grep -r "^function\|^\s*const.*=\s*(" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | wc -l)
CLASSES=$(grep -r "^class\|^\s*class" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | wc -l)
INTERFACES=$(grep -r "^interface\|^\s*interface" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | wc -l)
EXPORTS=$(grep -r "^export\|^\s*export" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | wc -l)

echo "Functions/Methods: $FUNCTIONS"
echo "Classes: $CLASSES"
echo "Interfaces: $INTERFACES"
echo "Exports: $EXPORTS"

echo ""
echo "========================================="
echo "📊 TOP 10 LARGEST FILES"
echo "========================================="
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | \
  grep -v dist | \
  grep -v build | \
  grep -v .git | \
  grep -v "migrations/meta" | \
  xargs wc -l 2>/dev/null | \
  sort -nr | \
  head -10 | \
  while read lines file; do
    printf "%6d lines | %s\n" "$lines" "$file"
  done

echo ""
echo "========================================="
echo "🗄️ DATABASE METRICS"
echo "========================================="
TABLE_COUNT=$(find src/db/ -name "*.ts" 2>/dev/null | xargs grep -l "sqliteTable" 2>/dev/null | wc -l)
MIGRATION_COUNT=$(find src/db/migrations/ -name "*.sql" 2>/dev/null | wc -l)
echo "Database Tables: $TABLE_COUNT"
echo "Migration Files: $MIGRATION_COUNT"

echo ""
echo "========================================="
echo "📋 DEVELOPMENT STATUS"
echo "========================================="
MODIFIED_FILES=$(git status --porcelain 2>/dev/null | wc -l)
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null | wc -l)
echo "Modified Files: $MODIFIED_FILES"
echo "Staged Files: $STAGED_FILES"
echo "Uncommitted Changes: $((MODIFIED_FILES + STAGED_FILES))"

echo ""
echo "========================================="
echo "🎯 BASELINE CAPTURED"
echo "========================================="
echo "Use this data as your pre-development baseline."
echo "Run this script again after development to compare."
echo ""
echo "💡 Pro Tip: Save this output to your phase documentation!"