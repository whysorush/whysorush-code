# DeepSeek API Setup Guide

## Overview
This application integrates with the DeepSeek API for AI-powered code assistance. The integration handles CORS (Cross-Origin Resource Sharing) issues that occur when making direct API calls from a browser.

## Development Setup

### 1. Vite Proxy Configuration
The application uses Vite's built-in proxy to handle CORS issues in development:

```typescript
// vite.config.ts
proxy: {
  '/api/deepseek': {
    target: 'https://api.deepseek.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/deepseek/, '/v1'),
    secure: true,
    headers: {
      'Origin': 'https://api.deepseek.com'
    }
  }
}
```

### 2. API Endpoint Configuration
- **Development**: Uses `/api/deepseek/chat/completions` (proxied through Vite)
- **Production**: Uses `https://api.deepseek.com/v1/chat/completions` (direct API call)

## Configuration Steps

### 1. Get DeepSeek API Key
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key

### 2. Configure in Application
1. Open the application
2. Click "Configure DeepSeek" button
3. Enter your API key
4. The endpoint will be automatically set based on environment
5. Test the connection

## Troubleshooting

### CORS Errors
If you encounter CORS errors:

1. **Development**: Ensure the Vite dev server is running with the proxy configuration
2. **Production**: Use a backend proxy or configure CORS on your server

### Common Issues

#### "403 Forbidden" Error
- Check if your API key is valid
- Ensure you have sufficient credits/quota
- Verify the endpoint URL is correct

#### "CORS Error" Message
- In development: Restart the Vite dev server
- In production: Set up a backend proxy server

### Alternative Solutions

#### 1. Backend Proxy Server
Create a simple Express.js server:

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/deepseek', async (req, res) => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.headers.authorization}`
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on port 3001');
});
```

#### 2. Browser Extension (Development Only)
Use browser extensions like "CORS Unblock" or "Allow CORS" for development testing.

## API Usage

### Basic Request
```javascript
const response = await fetch('/api/deepseek/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'deepseek-coder',
    messages: [
      { role: 'user', content: 'Hello, help me with coding!' }
    ],
    max_tokens: 1000,
    temperature: 0.1
  })
});
```

### Integration with Composer
The Composer component automatically uses the DeepSeek API when configured:

1. Configure DeepSeek API in the settings
2. Send messages in the Composer
3. The system will use DeepSeek for AI responses
4. Falls back to mock responses if API is unavailable

## Security Notes

- Never expose API keys in client-side code in production
- Use environment variables for API keys
- Implement proper authentication and authorization
- Consider rate limiting for API calls

## Environment Variables

For production, set these environment variables:

```bash
VITE_DEEPSEEK_API_KEY=your_api_key_here
VITE_DEEPSEEK_ENDPOINT=https://api.deepseek.com/v1/chat/completions
```

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key and endpoint configuration
3. Test the connection using the "Test Connection" button
4. Check DeepSeek's API documentation for any changes 