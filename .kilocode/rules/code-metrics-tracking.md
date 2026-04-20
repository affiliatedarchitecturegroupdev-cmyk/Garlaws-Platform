# 🔍 Code Metrics & Development Tracking Rules

## Overview

Every development phase, wave, session, or feature implementation **MUST** include comprehensive source code metrics calculation and analysis. This ensures transparent tracking of codebase growth, quality maintenance, and development efficiency.

## 📊 Core Metrics to Track

### Primary Metrics (Always Required)
- **Lines of Code (LOC)**: Total source code lines
- **File Count**: Number of source files by type
- **Code Churn**: Lines added/removed/changed
- **Cyclomatic Complexity**: Code complexity metrics
- **Test Coverage**: If applicable

### Secondary Metrics (Recommended)
- **Function Count**: Number of functions/methods
- **Class Count**: Number of classes/interfaces
- **Import/Export Count**: Module coupling metrics
- **Comment Ratio**: Documentation quality
- **Duplication Percentage**: Code duplication analysis

## 🛠️ Measurement Methodology

### What to Include in Source Code Counts
```bash
# Include these file types:
*.ts, *.tsx, *.js, *.jsx, *.py, *.java, *.cs, *.php, *.rb

# Include these directories:
src/, app/, lib/, components/, utils/, hooks/, types/

# Exclude these (auto-generated/dependencies):
node_modules/, dist/, build/, .git/, coverage/
*.min.js, *.min.css, package-lock.json
```

### What to Exclude from Source Code Counts
```bash
# Database migrations and snapshots
src/db/migrations/meta/*.json

# Generated files
*.generated.ts, *.generated.js
dist/, build/, .next/

# Dependencies and lockfiles
package-lock.json, yarn.lock, pnpm-lock.yaml

# IDE and OS files
.vscode/, .idea/, .DS_Store, Thumbs.db

# Documentation (unless specified)
*.md (optional - depends on project rules)
```

## 📈 Phase Development Process

### Pre-Development Baseline
```bash
# Before starting any development phase
echo "=== PRE-DEVELOPMENT BASELINE ==="
echo "Timestamp: $(date)"
echo "Git Commit: $(git rev-parse HEAD)"

echo "=== Source Code Metrics ==="
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | grep -v dist | grep -v build | grep -v .git | \
  grep -v "migrations/meta" | xargs wc -l | tail -1

echo "=== File Type Breakdown ==="
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | wc -l && echo "TypeScript files"
find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | wc -l && echo "JavaScript files"
find . -name "*.json" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | grep -v "package-lock.json" | wc -l && echo "JSON config files"
```

### During Development Tracking
```bash
# Run periodically during development
echo "=== DEVELOPMENT PROGRESS CHECK ==="
echo "Phase: [PHASE_NAME]"
echo "Time Elapsed: [X hours/minutes]"
echo "Files Modified: $(git status --porcelain | wc -l)"

# Current metrics
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  grep -v node_modules | grep -v dist | grep -v build | grep -v .git | \
  grep -v "migrations/meta" | xargs wc -l | tail -1
```

### Post-Development Analysis
```bash
# After completing development phase
echo "=== POST-DEVELOPMENT ANALYSIS ==="
echo "Phase: [PHASE_NAME]"
echo "Completed: $(date)"
echo "Duration: [X hours]"

echo "=== Code Metrics Change ==="
# Calculate difference from baseline
BASELINE_LOC=[PREVIOUS_COUNT]
CURRENT_LOC=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | xargs wc -l | tail -1)

echo "Lines Added: $((CURRENT_LOC - BASELINE_LOC))"
echo "Percentage Growth: $(( (CURRENT_LOC - BASELINE_LOC) * 100 / BASELINE_LOC ))%"

echo "=== File Type Analysis ==="
echo "New TypeScript Files: $(git diff --name-only HEAD~1 | grep -E '\.(ts|tsx)$' | wc -l)"
echo "Modified Files: $(git diff --name-only HEAD~1 | wc -l)"
echo "Deleted Files: $(git diff --name-only --diff-filter=D HEAD~1 | wc -l)"
```

## 📋 Development Documentation Template

### Phase Header Template
```markdown
# 🚀 Phase [NUMBER]: [PHASE_NAME]

## 📊 Development Metrics

### Pre-Development Baseline
- **Timestamp**: [DATE_TIME]
- **Git Commit**: [COMMIT_HASH]
- **Total LOC**: [NUMBER] lines
- **Source Files**: [NUMBER] files
- **TypeScript Files**: [NUMBER]
- **JavaScript Files**: [NUMBER]

### Post-Development Results
- **Completion Date**: [DATE_TIME]
- **Duration**: [X hours Y minutes]
- **Lines Added**: +[NUMBER] lines ([PERCENTAGE]%)
- **Files Added**: +[NUMBER] files
- **Files Modified**: [NUMBER] files
- **New Dependencies**: [LIST]

### Code Quality Metrics
- **Cyclomatic Complexity**: [SCORE]/10
- **Test Coverage**: [PERCENTAGE]% (if applicable)
- **Lint Errors**: [NUMBER] (should be 0)
- **TypeScript Errors**: [NUMBER] (should be 0)

### Files Added/Modified
#### New Files ([NUMBER])
- `path/to/file.ts` - [BRIEF_DESCRIPTION]

#### Modified Files ([NUMBER])
- `path/to/file.ts` - [CHANGES_MADE]

### Database Changes
- **Tables Added**: [NUMBER]
- **Columns Added**: [NUMBER]
- **Migrations Created**: [NUMBER]
- **Schema Changes**: [LIST]

### API Changes
- **Endpoints Added**: [NUMBER]
- **Endpoints Modified**: [NUMBER]
- **Breaking Changes**: [YES/NO]
- **API Version**: [VERSION]

### Testing
- **Unit Tests Added**: [NUMBER]
- **Integration Tests Added**: [NUMBER]
- **Test Coverage Change**: [PERCENTAGE]%
- **Manual Testing**: [COMPLETED/PENDING]

### Performance Impact
- **Bundle Size Change**: [SIZE] (+/- [PERCENTAGE]%)
- **Load Time Impact**: [IMPACT_DESCRIPTION]
- **Memory Usage**: [IMPACT_DESCRIPTION]
- **Database Query Performance**: [IMPACT_DESCRIPTION]
```

## 🔄 Integration with Development Workflow

### Phase Planning
1. **Define Phase Scope**: Clear objectives and deliverables
2. **Estimate Impact**: Rough LOC and file count estimates
3. **Baseline Metrics**: Run pre-development analysis
4. **Document Dependencies**: Required packages/APIs

### During Development
1. **Regular Checkpoints**: Run metrics every 2-4 hours
2. **Quality Gates**: Ensure no regressions in complexity/coverage
3. **Documentation Updates**: Keep implementation docs current
4. **Testing Integration**: Add tests as features are completed

### Phase Completion
1. **Final Metrics**: Comprehensive post-development analysis
2. **Quality Assurance**: Lint, type-check, and test validation
3. **Documentation**: Complete implementation documentation
4. **Performance Validation**: Ensure no performance regressions
5. **Integration Testing**: Validate with existing codebase

## 📈 Metrics Dashboard Commands

### Quick Status Check
```bash
# One-liner for current status
echo "LOC: $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | xargs wc -l | tail -1) | Files: $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | wc -l) | Git Status: $(git status --porcelain | wc -l) changes"
```

### Detailed Analysis Script
```bash
#!/bin/bash
echo "=== CODE METRICS DASHBOARD ==="
echo "Timestamp: $(date)"
echo "Git Branch: $(git branch --show-current)"
echo "Git Status: $(git status --porcelain | wc -l) modified files"

echo ""
echo "=== SOURCE CODE METRICS ==="
TOTAL_LOC=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | xargs wc -l | tail -1)
echo "Total Lines of Code: $TOTAL_LOC"

echo ""
echo "=== FILE TYPE BREAKDOWN ==="
TS_FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | wc -l)
TS_LOC=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | xargs wc -l | tail -1)
echo "TypeScript/TSX: $TS_FILES files, $TS_LOC lines"

JS_FILES=$(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | wc -l)
JS_LOC=$(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | xargs wc -l | tail -1)
echo "JavaScript/JSX: $JS_FILES files, $JS_LOC lines"

echo ""
echo "=== QUALITY METRICS ==="
echo "Functions: $(grep -r "^function\|^\s*const.*=\s*(" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l)"
echo "Classes: $(grep -r "^class\|^\s*class" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l)"
echo "Interfaces: $(grep -r "^interface\|^\s*interface" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l)"
echo "Exports: $(grep -r "^export\|^\s*export" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v node_modules | wc -l)"

echo ""
echo "=== LARGEST FILES ==="
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v dist | grep -v build | grep -v .git | grep -v "migrations/meta" | xargs wc -l | sort -nr | head -5 | while read lines file; do echo "$file: $lines lines"; done

echo ""
echo "=== DATABASE METRICS ==="
TABLE_COUNT=$(find src/db/ -name "*.ts" | xargs grep -l "sqliteTable" | wc -l)
echo "Database Tables: $TABLE_COUNT"
echo "Migration Files: $(ls src/db/migrations/*.sql 2>/dev/null | wc -l)"
```

## 📋 Implementation Checklist

### For Every Development Phase
- [ ] **Pre-Development**: Run baseline metrics
- [ ] **Planning**: Document expected LOC/file changes
- [ ] **Development**: Regular metrics checkpoints
- [ ] **Testing**: Validate no regressions
- [ ] **Completion**: Full post-development analysis
- [ ] **Documentation**: Update all relevant docs with metrics

### Quality Gates
- [ ] **Code Quality**: Zero lint errors, TypeScript strict mode
- [ ] **Performance**: No bundle size regressions >5%
- [ ] **Testing**: All new code covered by tests
- [ ] **Documentation**: All APIs and features documented
- [ ] **Security**: No new vulnerabilities introduced

### Reporting Requirements
- [ ] **Metrics Summary**: LOC, files, complexity changes
- [ ] **Quality Metrics**: Test coverage, lint status
- [ ] **Performance Impact**: Load times, bundle analysis
- [ ] **Database Changes**: Schema modifications
- [ ] **API Changes**: New/modified endpoints
- [ ] **Breaking Changes**: Migration requirements

## 🎯 Success Criteria

### Phase Completion Requirements
1. **All planned features implemented**
2. **Zero critical bugs or security issues**
3. **All tests passing (unit, integration, e2e)**
4. **Performance within acceptable thresholds**
5. **Documentation complete and accurate**
6. **Code review completed and approved**
7. **Metrics documented and tracked**

### Code Quality Standards
1. **TypeScript Strict Mode**: All files pass strict type checking
2. **ESLint Clean**: Zero lint errors or warnings
3. **Test Coverage**: Minimum 80% for new code
4. **Performance Budget**: Bundle size within limits
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Security**: No high/critical vulnerabilities

---

## 📝 Usage Instructions

1. **Copy this document** to `.kilocode/rules/code-metrics-tracking.md`
2. **Integrate into workflow**: Add to all development planning documents
3. **Run baseline**: Execute pre-development metrics collection
4. **Track progress**: Regular checkpoints during development
5. **Document completion**: Full post-development analysis
6. **Review metrics**: Ensure quality gates are met

This ensures **transparent, measurable, and accountable** development practices across all phases and features.