# BIMI Setup for HAPA Email Branding

## What is BIMI?

BIMI (Brand Indicators for Message Identification) displays your official logo next to emails in Gmail, Yahoo, and other major email clients.

## Requirements for HAPA

1. ✅ **Domain verified with Resend** (already done)
2. ✅ **DMARC policy** (should be configured)
3. ✅ **SVG logo** (need to create from current webp logo)
4. ✅ **BIMI DNS record** (need to add)

## Step-by-Step Setup

### 1. Create SVG Logo

Convert `/public/hapa-logo.webp` to SVG format:

- Use tool like https://convertio.co/webp-svg/
- Or create official SVG version
- Upload to: `https://www.hapa.mr/bimi/hapa-logo.svg`

### 2. Add BIMI DNS Record

Add this TXT record to `hapa.mr` domain:

```dns
Name: default._bimi.hapa.mr
Type: TXT
Value: v=BIMI1; l=https://www.hapa.mr/bimi/hapa-logo.svg;
```

### 3. Verify DMARC Policy

Ensure this DNS record exists:

```dns
Name: _dmarc.hapa.mr
Type: TXT
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@hapa.mr; pct=100;
```

### 4. Test BIMI

- Send test email from support@hapa.mr
- Check Gmail/Yahoo to see if logo appears
- Use BIMI inspector: https://bimigroup.org/bimi-generator/

## Expected Result

✅ HAPA logo appears next to emails from @hapa.mr addresses in major email clients
✅ Increased email trust and brand recognition
✅ Professional government authority appearance

## Timeline

- Setup: 1 hour
- DNS propagation: 24-48 hours
- Email client adoption: 1-7 days

