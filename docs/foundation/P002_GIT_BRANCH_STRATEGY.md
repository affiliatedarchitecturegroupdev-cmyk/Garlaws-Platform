# Phase P002 — Git Branch Strategy & Protection Rules

## Status: Pending

## Phase Overview
**Title:** Git Branch Strategy & Protection Rules  
**Stack:** GitHub  
**Deliverable:** Branch protection on main/develop, required reviews

## Implementation Details

### 2.1 Branch Strategy
```
main           — Production-ready code (protected)
develop       — Integration branch (protected)
feature/*     — Feature development branches
bugfix/*      — Bug fix branches
hotfix/*      — Emergency production fixes
release/*     — Release preparation branches
```

### 2.2 Branch Protection Rules (GitHub Settings)

**main branch:**
- Require pull request reviews (1 approval required)
- Require status checks to pass
- Require branches to be up to date
- Include administrators in protection
- Allow force pushes (disabled)

**develop branch:**
- Same as main
- Require 2 approvals for merge

### 2.3 Conventional Commits
```bash
feat(dispatch): add goroutine pool per region
fix(payments): correct Ozow payout amount
docs(blockchain): update deployment steps
test(ai): add unit tests
chore(deps): upgrade LangChain
refactor(fleet): extract IoT event parsing
perf(tracking): reduce WebSocket latency
security(auth): enforce MFA for admin
```

## Success Criteria
- [ ] Branch protection rules configured on GitHub
- [ ] All team members know the workflow
- [ ] PR template created
- [ ] Conventional commits enforced

## Next Phase
[P003 — Terraform Remote State Backend](./P003_TERRAFORM_REMOTE_STATE.md)