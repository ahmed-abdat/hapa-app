# Cloudflare R2 Storage Setup

This project now uses Cloudflare R2 for media storage instead of Vercel Blob. R2 provides S3-compatible API with zero egress fees.

## Required Environment Variables

Add the following to your `.env.local` file (recommended for Next.js projects):

```env
# Cloudflare R2 Storage Configuration
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key  
R2_BUCKET_NAME=your_r2_bucket_name
R2_ACCOUNT_ID=your_r2_account_id
R2_PUBLIC_URL=https://pub-[hash].r2.dev  # Or your bucket's public URL
R2_CUSTOM_DOMAIN=https://media.hapa.mr   # Optional: Custom domain
```

## Setting up Cloudflare R2

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2 Object Storage
   - Create a new bucket (e.g., `hapa-media`)
   - Note your Account ID from the dashboard

2. **Create API Token**:
   - Go to "Manage R2 API Tokens"
   - Create token with R2:Object Storage:Edit permissions
   - Note the Access Key ID and Secret Access Key

3. **Configure Public Access** (Optional):
   - Enable public access for the bucket if you want direct file access
   - Or set up a custom domain for better performance

## Migration from Vercel Blob

The configuration has been updated to:
- ✅ Use `@payloadcms/storage-s3` with R2 endpoint  
- ✅ Remove `@payloadcms/storage-vercel-blob` dependency
- ✅ Configure proper URL generation for R2
- ✅ Support custom domains

## Features

- **Zero Egress Fees**: No charges for data transfer out
- **S3 Compatibility**: Works with existing S3 tools and libraries  
- **Global Performance**: Cloudflare's edge network
- **Cost Effective**: Predictable pricing model
- **Custom Domains**: Use your own domain for media URLs

## Testing

After setting up environment variables:

```bash
pnpm generate:types  # Test configuration
pnpm dev            # Start development server
```

Upload a file through the admin panel at `/admin` to test the integration.

## File Organization

Files are automatically organized into simple folders by type:
- **Images**: `images/filename.jpg` (.jpg, .png, .webp, .gif, .avif, .svg)
- **Documents**: `docs/filename.pdf` (.pdf, .doc, .docx, .txt, .rtf)
- **Videos**: `videos/filename.mp4` (.mp4, .mov, .avi, .webm, .mkv)
- **Audio**: `audio/filename.mp3` (.mp3, .wav, .ogg, .aac, .m4a)
- **Other**: `media/filename.ext` (all other file types)

This simple structure makes it easy to find and manage your media files without complex nested folders.

**Files are served directly from R2** - no local API routing, ensuring fast access and zero server overhead.

## Troubleshooting

**Common Issues:**
- Ensure all R2 environment variables are set
- Verify bucket permissions allow read/write operations
- Check that the bucket name and account ID are correct
- For custom domains, ensure DNS is properly configured

**Debug Mode:**
Add `NODE_ENV=development` to see detailed R2 connection logs.