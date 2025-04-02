# Deploying Passport OCR App to Vercel

This guide will help you deploy the Passport OCR application to Vercel.

## Deployment Steps

1. Ensure your project is pushed to GitHub
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the project as follows:
   - **Project Name**: `passport-ocr-app`
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)

## Environment Variables

Add the following environment variables in the Vercel project settings:

| Name | Value | Description |
|------|-------|-------------|
| `MINDEE_API_KEY` | `your-mindee-api-key` | Your Mindee API key for OCR processing |
| `NEXT_PUBLIC_API_URL` | `https://passport-ocr-app.vercel.app` | The public URL of your deployed app |

**Note**: For production deployments, you'll want to use the actual domain provided by Vercel after deployment (`https://passport-ocr-app.vercel.app`).

## Build Settings

These should be automatically detected by Vercel, but here's the configuration for reference:

- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Development Command**: `next dev`

## Post-Deployment

After deployment:

1. Check the logs to ensure the build was successful
2. Test the OCR functionality to verify the API integration works correctly
3. Update your domain settings if you want to use a custom domain

## Troubleshooting

If you encounter issues with OCR processing:

1. Verify the `MINDEE_API_KEY` is correctly set
2. Check the function logs in Vercel to debug any API connection issues
3. Ensure your PDF handling is working correctly by testing with different document formats
