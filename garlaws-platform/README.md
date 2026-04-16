# Garlaws Platform

Property Lifecycle Maintenance Orchestration Ecosystem for the South African market.

## Technology Stack

- **Frontend:** Angular 19, NgRx, Tailwind CSS, Nx Monorepo
- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL (Supabase)
- **Infrastructure:** AWS, Coolify, Docker, Kubernetes

## Project Structure

```
garlaws-platform/
├── apps/
│   ├── garlaws-corporate-gateway/  # Main web application
│   ├── garlaws-e-commerce/         # E-commerce showroom
│   ├── garlaws-client-dashboard/   # Admin dashboard
│   └── garlaws-api/                # NestJS API
├── libs/
│   ├── ui-kit/                     # Reusable UI components
│   ├── design-tokens/             # Design system tokens
│   ├── state/                     # NgRx state management
│   ├── api-client/                # API client libraries
│   └── shared-utils/              # Shared utilities
├── tools/                         # Automation scripts
└── tailwind.config.js             # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or bun

### Installation

```bash
npm install
```

### Development

```bash
# Run all applications
npm start

# Run specific application
npm run start:garlaws-corporate-gateway
npm run start:garlaws-api

# Build
npm run build

# Test
npm run test

# Lint
npm run lint
```

## Design System

### Colors

| Name | Hex |
|------|-----|
| Garlaws Black | #0b0c10 |
| Garlaws Olive | #2d3b2d |
| Garlaws Gold | #c5a059 |
| Garlaws Navy | #1f2833 |
| Garlaws Slate | #45a29e |

### Compliance

- B-BBEE Level 2
- POPIA Compliant
- SARS VAT 15%

## License

Proprietary - Garlaws (Pty) Ltd