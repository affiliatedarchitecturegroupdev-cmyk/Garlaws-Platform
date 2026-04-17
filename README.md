# Garlaws Property Lifecycle Maintenance Platform

A comprehensive property maintenance orchestration platform built with Next.js 16, featuring real-time communication, AI assistance, and advanced management tools.

## 🚀 Features

### Core Platform
- **Property Management**: Complete lifecycle management for residential and commercial properties
- **Service Provider Network**: Connect property owners with verified maintenance professionals
- **Booking System**: Advanced scheduling with real-time availability and conflict resolution
- **Payment Processing**: Secure payment handling with multiple gateway support

### Advanced Features (Phase 18)
- **Real-time Chat**: WebSocket-powered messaging with conversation management
- **AI Assistant**: Intelligent chatbot for booking assistance and support
- **Video Calls**: WebRTC-based virtual consultations between clients and providers
- **Push Notifications**: Browser and mobile notifications for important updates
- **Live Analytics**: Real-time dashboard with performance metrics and insights

### Security & Performance
- **Rate Limiting**: API protection against abuse
- **Content Security Policy**: XSS protection and secure headers
- **Error Boundaries**: Graceful error handling with user-friendly fallbacks
- **Performance Monitoring**: Web Vitals tracking and optimization
- **Lazy Loading**: Code splitting and optimized bundle sizes

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL with Supabase
- **Real-time**: WebSocket, Server-Sent Events
- **Video**: WebRTC
- **Authentication**: JWT with secure session management
- **Deployment**: Docker, AWS/Vercel ready

## 📋 Prerequisites

- Node.js 20+
- Bun package manager
- PostgreSQL database
- Redis (for caching, optional)

## 🚀 Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd garlaws-platform
   bun install
   ```

2. **Environment setup**
   ```bash
   cp .env.production .env.local
   # Edit .env.local with your configuration
   ```

3. **Database setup**
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

4. **Development server**
   ```bash
   bun run dev
   ```

5. **Production build**
   ```bash
   bun run build
   bun run start
   ```

## 🧪 Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Generate coverage report
bun run test:coverage
```

## 📦 Deployment

### Docker Deployment
```bash
# Build production image
bun run docker:build

# Run container
bun run docker:run
```

### Manual Deployment
```bash
# Build for production
bun run build:production

# Start production server
bun run start:production
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe payment processing | Yes |
| `CLOUDINARY_CLOUD_NAME` | File storage service | No |

See `.env.production` for complete configuration options.

## 📚 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Bookings
```
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/[id]
PUT    /api/bookings/[id]
DELETE /api/bookings/[id]
```

### Real-time Chat
```
GET    /api/chat/conversations
POST   /api/chat/conversations
GET    /api/chat/conversations/[id]
POST   /api/chat/conversations/[id]
WebSocket: ws://localhost:8080
```

## 🔒 Security

- Rate limiting on all API endpoints
- Content Security Policy headers
- XSS protection
- Secure cookie configuration
- Input validation and sanitization

## 📊 Monitoring

- Web Vitals tracking
- Error reporting and logging
- Performance metrics collection
- Real-time system health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please contact:
- Email: support@garlaws.co.za
- Documentation: [Internal Wiki]
- Issues: GitHub Issues

## 🚀 Roadmap

- Phase 19: Production deployment & optimization ✅
- Phase 20: Mobile app development
- Phase 21: Advanced AI features
- Phase 22: Multi-tenant architecture