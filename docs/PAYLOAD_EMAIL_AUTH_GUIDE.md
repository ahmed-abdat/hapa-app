# Payload CMS Email & Authentication Guide (2025)

## Overview

This guide covers email adapter configuration and authentication security for Payload CMS 3.x based on the latest 2025 documentation and best practices.

## Current Project Status

**Authentication Status**: ✅ Secure by default
- HTTP-only cookies (XSS protection)
- User access controls via `src/access/authenticated.ts`
- Cron job authentication via `CRON_SECRET`
- Password reset UI available

**Email Status**: ⚠️ Development mode
- Currently logs to console (not production-ready)
- Password reset emails won't reach users
- Account verification disabled

## Email Adapter Configuration

### Available Adapters (2025)

1. **Resend Adapter** (Recommended for Vercel)
   - Lightweight and optimized for Vercel deployments
   - Latest version: 3.47.0 (published 4 days ago)
   - Requires API key from Resend dashboard

2. **Nodemailer Adapter**
   - More flexible SMTP configuration
   - Supports custom transports (SendGrid, etc.)
   - Heavier than Resend

3. **Development Mode** (Current)
   - Uses ethereal.email service
   - Logs credentials to console
   - Not suitable for production

### Recommended Setup (Resend)

#### 1. Install the Resend adapter:
```bash
pnpm add @payloadcms/email-resend
```

#### 2. Update `src/payload.config.ts`:
```typescript
import { resendAdapter } from '@payloadcms/email-resend'

export default buildConfig({
  // ... existing config
  email: resendAdapter({
    defaultFromAddress: 'no-reply@hapa.mr',
    defaultFromName: 'HAPA - Haute Autorité de la Presse et de l\'Audiovisuel',
    apiKey: process.env.RESEND_API_KEY,
  }),
  // ... rest of config
})
```

#### 3. Add environment variable:
```env
# Add to your .env file
RESEND_API_KEY=your_resend_api_key_here
```

#### 4. Update Vercel environment:
```bash
vercel env add RESEND_API_KEY
```

### Alternative: Nodemailer SMTP Setup

For custom SMTP (if not using Resend):

```typescript
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export default buildConfig({
  email: nodemailerAdapter({
    defaultFromAddress: 'no-reply@hapa.mr',
    defaultFromName: 'HAPA',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
})
```

## Authentication Security Features

### Current Security Measures

1. **HTTP-only Cookies** (Default)
   - Secure against XSS attacks
   - Cannot be accessed by JavaScript
   - Automatic session management
   - Preferred over JWT for web applications

2. **Access Control**
   - `authenticated` access function in `src/access/authenticated.ts`
   - Restricts all admin operations to logged-in users
   - Collection-level access control

3. **CORS Protection**
   - Configured in `src/payload.config.ts:88`
   - Restricts API access to allowed origins
   - Prevents cross-origin attacks

4. **CSRF Protection**
   - Built-in Cross-Site Request Forgery prevention
   - Verifies request authenticity
   - Prevents malicious actions

### Authentication Options

#### 1. HTTP-only Cookies (Current - Recommended)
```typescript
// Already configured in your Users collection
auth: true, // Uses HTTP-only cookies by default
```

#### 2. JWT Tokens (Optional)
```typescript
// Add to Users collection if needed
auth: {
  tokenExpiration: 7200, // 2 hours
  verify: false, // Disable email verification
  maxLoginAttempts: 5,
  lockTime: 600 * 1000, // 10 minutes
}
```

#### 3. API Keys (For External Services)
```typescript
// Add to Users collection for API access
auth: {
  useAPIKey: true,
}
```

## Email Authentication Features

### Password Reset Flow
1. User clicks "Forgot Password" in admin panel
2. Enters email address
3. System generates secure reset token
4. Email sent with reset link
5. User clicks link to reset password

### Email Verification (Optional)
Enable email verification for new accounts:

```typescript
// Add to Users collection
auth: {
  verify: {
    generateEmailHTML: ({ token, user }) => {
      return `Please verify your email: ${process.env.NEXT_PUBLIC_SERVER_URL}/verify?token=${token}`
    },
    generateEmailSubject: () => 'Verify your HAPA account',
  },
}
```

## Security Best Practices

### 1. Environment Variables
- Store all sensitive data in environment variables
- Never commit secrets to repository
- Use different keys for development/production

### 2. Production Checklist
- [ ] Email adapter configured (Resend recommended)
- [ ] RESEND_API_KEY set in production
- [ ] PAYLOAD_SECRET is secure random string
- [ ] CORS configured for production domain
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Strong password policy enforced

### 3. User Management
- Limit admin accounts to necessary personnel
- Use strong passwords (enforced by Payload)
- Regular security audits of user accounts
- Monitor login attempts and failures

### 4. Rate Limiting (Optional Enhancement)
Consider adding rate limiting for auth endpoints:

```typescript
// Custom middleware for auth endpoints
export default buildConfig({
  // ... existing config
  rateLimit: {
    trustProxy: true,
    window: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
})
```

## Testing Email Configuration

### Development Testing
1. Start development server: `pnpm dev`
2. Access admin panel: `http://localhost:3000/admin`
3. Click "Forgot Password"
4. Enter test email address
5. Check console for email details (development mode)

### Production Testing
1. Deploy with email adapter configured
2. Test password reset flow
3. Verify emails are delivered
4. Check email formatting and links

## Troubleshooting

### Common Issues

1. **Email not sending**: Check API key and adapter configuration
2. **CORS errors**: Verify allowed origins in config
3. **Authentication failures**: Check PAYLOAD_SECRET and cookie settings
4. **Rate limiting**: Ensure proper proxy configuration

### Debug Steps
1. Check environment variables are set
2. Verify email adapter installation
3. Test with different email addresses
4. Check server logs for errors
5. Validate SMTP/API credentials

## Migration from Development to Production

1. **Install email adapter**: `pnpm add @payloadcms/email-resend`
2. **Update payload.config.ts**: Add email configuration
3. **Set environment variable**: Add RESEND_API_KEY
4. **Deploy**: Push changes to production
5. **Test**: Verify email functionality works
6. **Monitor**: Check email delivery and error rates

## Additional Resources

- [Payload CMS Email Documentation](https://payloadcms.com/docs/email/overview)
- [Payload CMS Authentication Guide](https://payloadcms.com/docs/authentication/overview)
- [Resend API Documentation](https://resend.com/docs)
- [Payload CMS Security Best Practices](https://payloadcms.com/security)

## Project-Specific Notes

- Government website requiring high security standards
- Bilingual support (French/Arabic) for email templates
- Vercel hosting optimized for performance
- Neon PostgreSQL for user data storage
- Production domain: www.hapa.mr

---

*Last updated: January 2025*
*Payload CMS version: 3.44.0*