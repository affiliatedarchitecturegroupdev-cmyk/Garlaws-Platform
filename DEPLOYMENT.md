# Deployment Guide

This guide covers deploying the Garlaws Property Platform to production environments.

## Prerequisites

- AWS/Vercel account with appropriate permissions
- PostgreSQL database (RDS or Supabase)
- Redis instance (optional, for caching)
- Domain name and SSL certificate
- SMTP service for email notifications

## Environment Setup

### 1. Production Environment Variables

Copy `.env.production` and configure:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/garlaws_prod"

# Authentication
JWT_SECRET="your-64-character-production-secret"
NEXTAUTH_SECRET="your-nextauth-production-secret"
NEXTAUTH_URL="https://your-domain.com"

# External Services
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-production-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"

# Payment Processing
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourdomain.com"

# File Storage
CLOUDINARY_CLOUD_NAME="your-production-cloud"
CLOUDINARY_API_KEY="your-production-api-key"
CLOUDINARY_API_SECRET="your-production-api-secret"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"
API_RATE_LIMIT="100"
CORS_ORIGIN="https://yourdomain.com"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
VERCEL_ANALYTICS_ID="your-analytics-id"

# WebSocket Configuration
WS_PORT="8080"
WS_HOST="0.0.0.0"
```

### 2. Database Setup

```bash
# Generate and run migrations
bun run db:generate
bun run db:migrate

# Verify connection
bun run db:studio
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Vercel will automatically detect Next.js
   vercel --prod
   ```

2. **Environment Variables**
   - Add all production environment variables in Vercel dashboard
   - Configure custom domain

3. **Database Connection**
   - Use connection pooling for Vercel
   - Configure Supabase for serverless compatibility

### Option 2: AWS (ECS/Fargate)

1. **Build Docker Image**
   ```bash
   docker build -f Dockerfile.production -t garlaws/platform:latest .
   ```

2. **Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
   docker tag garlaws/platform:latest <account>.dkr.ecr.us-east-1.amazonaws.com/garlaws/platform:latest
   docker push <account>.dkr.ecr.us-east-1.amazonaws.com/garlaws/platform:latest
   ```

3. **ECS Configuration**
   ```yaml
   # task-definition.json
   {
     "family": "garlaws-platform",
     "containerDefinitions": [{
       "name": "web",
       "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/garlaws/platform:latest",
       "portMappings": [{
         "containerPort": 3000,
         "hostPort": 3000
       }],
       "environment": [
         {"name": "NODE_ENV", "value": "production"},
         {"name": "DATABASE_URL", "value": "..."}
       ]
     }]
   }
   ```

### Option 3: Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: garlaws/platform:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=garlaws_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
```

## SSL Configuration

### Let's Encrypt (Automatic)
```bash
# Using Certbot
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### AWS Certificate Manager
- Request certificate in ACM
- Attach to load balancer or CloudFront distribution

## Monitoring Setup

### 1. Application Monitoring
```typescript
// src/lib/monitoring-service.ts
// Configure Sentry, DataDog, or similar service
```

### 2. Infrastructure Monitoring
- CloudWatch for AWS
- Vercel Analytics for Vercel deployments
- Uptime monitoring (Pingdom, UptimeRobot)

### 3. Database Monitoring
```bash
# pg_stat_statements for query performance
CREATE EXTENSION pg_stat_statements;
```

## Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
bun run analyze:bundle

# Production build with optimizations
NODE_ENV=production bun run build
```

### 2. CDN Configuration
- Use CloudFront or similar CDN
- Configure image optimization
- Set appropriate cache headers

### 3. Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_bookings_date ON bookings(date);
CREATE INDEX CONCURRENTLY idx_messages_conversation ON messages(conversation_id);
```

## Security Checklist

- [ ] Environment variables configured securely
- [ ] Database credentials not in code
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CSP headers set
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Input validation active
- [ ] Dependency vulnerabilities scanned

## Backup Strategy

### Database Backups
```bash
# Automated daily backups
pg_dump garlaws_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql garlaws_prod < backup_20241201.sql
```

### File Backups
- Cloudinary automatic backups
- S3 versioning for uploaded files

## Rollback Strategy

### Blue-Green Deployment
1. Deploy to staging environment
2. Run automated tests
3. Switch production traffic
4. Monitor for 24 hours
5. Roll back if issues detected

### Quick Rollback
```bash
# Using Docker
docker tag garlaws/platform:v1 garlaws/platform:rollback
docker run garlaws/platform:rollback
```

## Health Checks

### Application Health
```bash
# Health check endpoint
GET /api/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Monitoring Dashboard
- Real-time metrics in `/dashboard/chat-analytics`
- Error tracking in Sentry/DataDog
- Performance monitoring via Web Vitals

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   ```
   Solution: Check connection string and firewall rules
   ```

2. **WebSocket Connection Failed**
   ```
   Solution: Verify WS_HOST and WS_PORT configuration
   ```

3. **Build Failures**
   ```
   Solution: Check Node.js version and dependency conflicts
   ```

4. **Memory Issues**
   ```
   Solution: Increase container memory limits
   ```

## Support

For deployment issues:
- Check logs: `docker logs <container-id>`
- Review environment variables
- Verify network connectivity
- Contact DevOps team

---

**Deployment Checklist:**
- [ ] Environment variables set
- [ ] Database migrated
- [ ] SSL certificates configured
- [ ] Monitoring tools active
- [ ] Backup strategy implemented
- [ ] Health checks passing
- [ ] Rollback plan ready