# Garlaws Platform - Development Guidelines

> **Project:** Garlaws Ecosystem Platform  
> **Entity:** Garlaws (Pty) Ltd, Subsidiary of Affiliated Architecture Group (AAG)  
> **Author:** Mr. T.F. Ndaba, Founder & Managing Director  
> **Version:** 1.0  
> **Scope:** Documents 01-06 (Core Foundation)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Overview](#2-architectural-overview)
3. [Development Standards](#3-development-standards)
4. [Compliance Framework](#4-compliance-framework)
5. [Visual Identity](#5-visual-identity)
6. [Angular Frontend Architecture](#6-angular-frontend-architecture)
7. [Project Roadmap](#7-project-roadmap)
8. [Quick Reference](#8-quick-reference)

---

## 1. Executive Summary

### 1.1 Platform Overview

The **Garlaws Ecosystem Platform** is a world-class, digitally-integrated property engineering and environmental consultancy ecosystem. As a subsidiary of the Affiliated Architecture Group (AAG), Garlaws bridges the gap between physical landscaping/infrastructure services and advanced PropTech solutions.

### 1.2 Core Mission

- Lower customer acquisition costs (CAC)
- Maximize customer lifetime value (CLV)
- Proprietary "Design-Build-Maintain" (DBM) model
- Enhanced by high-performance AI, IoT, and augmented reality

### 1.3 Strategic Objectives

| Objective | Description |
|-----------|-------------|
| **Digital Integration** | Connect Pinetown Central Warehouse, field crews, and luxury estate clients through unified digital interface |
| **Operational Efficiency** | Leverage 80%+ electric equipment and real-time telematics |
| **Viral Growth** | Implement "1-for-1" digital gift system for referrals at near-zero CAC |
| **Compliance Leadership** | 100% alignment with South African regulatory bodies |

### 1.4 Target Market

- **Geographic:** KwaZulu-Natal, specifically luxury estates (Ballito Hills, Tinley Manor), commercial and industrial parks
- **Revenue Model:**
  - SLA Recurring Revenue (18-42 month contracts)
  - E-Commerce Sales (pottery, indigenous plants, equipment)
  - On-Demand Services (Uber-style garden clean-ups, paving repairs)

---

## 2. Architectural Overview

### 2.1 Architectural Philosophy

The Garlaws Ecosystem Platform is built on a modern, high-scale, **polyglot architecture** designed for:
- Maximum scalability
- Fault tolerance
- High performance
- Microservices-based approach within a monorepo structure
- Human-in-the-loop AI coding workflow

### 2.2 Core Architecture Patterns

| Pattern | Implementation |
|---------|----------------|
| **Monorepo** | Nx for managing multiple applications and libraries |
| **Microservices** | Decoupled services via gRPC and REST APIs |
| **Event-Driven** | RabbitMQ or Kafka for asynchronous communication |
| **CQRS** | Separating read and write operations |
| **BFF (Backend-for-Frontend)** | Specific backend layers for web, mobile, admin |
| **Circuit Breaker** | Resilience patterns for service failures |
| **BEAM Fault Tolerance** | Elixir/Erlang VM for real-time messaging |

### 2.3 Polyglot Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Angular, Capacitor, Tailwind CSS |
| **Backend Core** | NestJs (TypeScript), Supabase (PostgreSQL) |
| **High Performance** | Rust, C++, Mojo (AI kernels), Go |
| **Data & AI** | Python (PyTorch, Scikit-learn), Julia (MLJ), Mojo |
| **Real-Time & Messaging** | Elixir (Phoenix), gRPC, WebSockets |
| **Mobile & Emerging** | Kotlin (Android), Swift (iOS), Zig, Gleam |
| **Infrastructure** | Terraform, Docker, Kubernetes, AWS, Coolify |

### 2.4 System Components & Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Edge/CDN Layer                          │
│                  Cloudflare, Netlify                       │
├─────────────────────────────────────────────────────────────┤
│                     Frontend Layer                         │
│             Angular, NgRx, Nx, Tailwind CSS               │
├─────────────────────────────────────────────────────────────┤
│                   BFF / Gateway Layer                      │
│                   NestJs, GraphQL                          │
├─────────────────────────────────────────────────────────────┤
│                   Microservices Layer                       │
│              Go, Rust, Java, Elixir                        │
├─────────────────────────────────────────────────────────────┤
│                   Data Persistence Layer                   │
│         PostgreSQL, TimescaleDB, Redis                     │
├─────────────────────────────────────────────────────────────┤
│                      AI / ML Layer                          │
│               Python, Julia, Mojo                          │
├─────────────────────────────────────────────────────────────┤
│                    Messaging Layer                         │
│                  RabbitMQ, gRPC                             │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                     │
│                 AWS, Coolify, Terraform                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Scalability Targets

- **Codebase:** 250,000 to 500,000 lines of code (LoC)
- **Horizontal Scaling:** Kubernetes (EKS)
- **Database:** Supabase and PostgreSQL with sharding
- **Observability:** Prometheus, Grafana, OpenTelemetry

---

## 3. Development Standards

### 3.1 File Size Limits

| Metric | Limit |
|--------|-------|
| **Source File Length (Average)** | 300-500 LoC |
| **Source File Length (Hard Cap)** | 850 LoC |
| **Function/Method Length (Ideal)** | 15-30 lines |
| **Cyclomatic Complexity** | Keep low |

> **Critical Rule:** Files exceeding 850 lines must be refactored into smaller, modular components.

### 3.2 Language-Specific Standards

#### TypeScript (Angular/NestJs)
- ESLint + Prettier
- Strict typing
- Modular design

#### Python (AI/ML)
- PEP 8
- Black formatter
- Type Hints
- Docstrings

#### Rust/C++
- Memory safety
- Zero-cost abstractions
- Idiomatic coding practices

#### Go (Microservices)
- Standard Go formatting (gofmt)
- Concurrency patterns
- Error handling

#### Elixir (Real-time)
- Credo for linting
- Functional programming principles
- Supervision trees

### 3.3 Documentation Requirements

| Type | Requirement |
|------|--------------|
| **Inline Comments** | Complex logic or architectural decisions only |
| **Docstrings** | All public classes, functions, and methods |
| **README.md** | Each service or library |
| **ARCH.md** | Each service explaining purpose and design |
| **API Docs** | OpenAPI/Swagger for REST, Protobuf for gRPC |

### 3.4 Human-in-the-Loop AI Workflow

1. **AI Code Generation:** Scaffolding, boilerplate, repetitive tasks
2. **Human Review:** All AI code must be reviewed, tested, approved
3. **PR Protocols:** Automated tests (Jest, Playwright) + CI/CD checks
4. **Testing Requirements:** Minimum 80% code coverage

### 3.5 Tooling & Automation

- **Monorepo Management:** Nx
- **CI/CD:** GitHub Actions → Coolify/AWS
- **Linting/Formatting:** Enforced at pre-commit
- **Remote Caching:** Nx Cloud

---

## 4. Compliance Framework

### 4.1 Financial & Tax Compliance (SARS)

| Requirement | Implementation |
|-------------|----------------|
| **VAT (15%)** | Automated calculation, invoicing, reporting |
| **Corporate Tax** | Full transparency in revenue reporting |
| **SARS E-Filing** | Future-ready API integration |

### 4.2 Data Privacy & Consumer Protection

| Regulation | Requirements |
|-------------|---------------|
| **POPIA** | User consent management, AES-256 encryption, AWS SA regions |
| **CPA** | Fair terms, clear pricing, refund/dispute resolution |
| **OSTI/CGSO** | Industry-specific ombudsman alignment |

### 4.3 Industry-Specific Standards

| Body | Compliance |
|------|------------|
| **NHBRC** | Residential construction/landscaping quality standards |
| **CIDB** | Appropriate grading for infrastructure projects |
| **SABS/SANS** | Materials, equipment, construction practices |
| **SACAA** | Drone operation for site inspections/mapping |

### 4.4 B-BBEE & Social Impact

- **Current Status:** Level 2
- **Goal:** Level 1 within 24 months
- **Features:** B-BBEE Compliance Vault, procurement module, skills development, ESG tracking

### 4.5 Compliance Monitoring

- **Audit Trails:** Immutable logs for all transactions, data access, activities
- **Compliance Dashboards:** Real-time visualization
- **Automated Alerts:** Notifications for breaches, deadlines

---

## 5. Visual Identity

### 5.1 Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Garlaws Black** | `#0b0c10` | Primary background, text |
| **Garlaws Olive** | `#2d3b2d` | Nature, sustainability |
| **Garlaws Gold** | `#c5a059` | Accent, branding, premium features |
| **Garlaws Navy** | `#1f2833` | Secondary accent, depth |
| **Garlaws Slate** | `#45a29e` | UI elements, buttons, borders |
| **Light Grey** | `#f4f4f4` | Content sections, dashboard cards |

### 5.2 Typography

| Element | Specification |
|---------|---------------|
| **Primary Font** | Segoe UI, Roboto, or Helvetica |
| **Headings** | Bold, uppercase, Garlaws Black/Olive |
| **Body Text** | Regular weight, 16px base, 1.6 line height |
| **Grid System** | Responsive 12-column grid |
| **Spacing** | Generous white space |

### 5.3 UI Components

| Component | Description |
|-----------|-------------|
| **Cards** | Dashboard modules, e-commerce products, service listings |
| **Buttons** | High-contrast (Gold/Olive), subtle hover effects |
| **Forms** | Clean, accessible, clear validation states |
| **Navigation** | Persistent sidebar (dashboards), minimalist top-bar (public) |
| **Icons** | Custom line-art icons |

### 5.4 Design System Implementation

- **Storybook:** UI component development and documentation
- **Tailwind CSS:** Consistent styling, rapid development
- **Angular Components:** Reusable, accessible components
- **Design Tokens:** Centralized variables for colors, typography, spacing

---

## 6. Angular Frontend Architecture

### 6.1 Core Principles

- **Modular Design:** Feature modules, lazy-loaded, shared modules
- **Component-Based:** Reusable, isolated, container/presentational pattern
- **Reactive Programming:** RxJS for async data streams
- **Type Safety:** TypeScript throughout

### 6.2 NgRx State Management

| Element | Purpose |
|---------|---------|
| **NgRx Store** | Single, immutable state tree |
| **NgRx Effects** | Side-effect management (API calls) |
| **NgRx Reducers** | Pure state transition functions |
| **NgRx Selectors** | Optimized state queries |

### 6.3 Nx Monorepo Structure

| Project Type | Examples |
|-------------|----------|
| **Applications** | garlaws-corporate-gateway, garlaws-e-commerce, garlaws-client-dashboard |
| **Feature Libraries** | products-feature, auth-feature, user-profile-feature |
| **UI Libraries** | ui-buttons, ui-forms, ui-layout |
| **Data Access Libraries** | api-services, data-models |
| **State Libraries** | auth-state, product-state |

### 6.4 Performance Optimization

- **Ahead-of-Time (AOT) Compilation**
- **Tree Shaking**
- **OnPush Change Detection**
- **Web Workers** for intensive tasks
- **Image Optimization** (Lazy loading, WebP)

---

## 7. Project Roadmap

### Phase 1 (Months 1-3): Core Infrastructure
- Corporate Gateway
- B-BBEE Vault
- Client Dashboard

### Phase 2 (Months 4-6): Service Expansion
- Garlaws-On-Demand Beta
- Node 1 Telematics rollout

### Phase 3 (Months 7-12): Tech Disruption
- AR Virtual Designer
- IoT Monitoring
- National E-commerce

### Phase 4 (Year 2-3): Market Scaling
- AI-driven predictive maintenance
- Blockchain property deeds

### Phase 5 (Year 4-5): Ecosystem Dominance
- National expansion
- Zig/Mojo AI kernels integration

---

## 8. Quick Reference

### File Structure Limit
```javascript
// Hard cap: 850 lines per file
// Average: 300-500 lines
// Function: 15-30 lines
```

### Color Variables (Tailwind)
```css
--garlaws-black: #0b0c10;
--garlaws-olive: #2d3b2d;
--garlaws-gold: #c5a059;
--garlaws-navy: #1f2833;
--garlaws-slate: #45a29e;
--light-grey: #f4f4f4;
```

### Technology Stack Summary
```
Frontend:      Angular + NgRx + Nx + Tailwind
Backend:       NestJs + Supabase (PostgreSQL)
High Perf:     Rust, C++, Go, Mojo
AI/ML:         Python, Julia, Mojo
Real-Time:     Elixir (Phoenix), gRPC
Infrastructure: AWS, Coolify, Terraform, Kubernetes
```

### Key Compliance Requirements
- POPIA (Data Privacy)
- SARS (Tax/VAT 15%)
- B-BBEE (Level 2 → Level 1)
- NHBRC, CIDB, SABS/SANS
- SACAA (Drone Operations)

---

> **Next Steps:** Continue processing Documents 07-47 for complete development guidelines.