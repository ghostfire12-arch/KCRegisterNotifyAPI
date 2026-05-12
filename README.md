# KCRegisterNotifyAPI

**Secure KingsChat Notification API** - Send messages to KingsChat users with automatic token management and retry logic.

## Features

✅ **4 Powerful Endpoints** - Send notifications, manage tokens, batch messaging  
✅ **Automatic Token Refresh** - Seamless token lifecycle management  
✅ **Batch Messaging** - Send to single users or multiple recipients  
✅ **Retry Logic** - Auto-retry with token refresh on failure  
✅ **Safe JSON Responses** - No "undefined is not valid JSON" errors  
✅ **Production Ready** - Error handling, logging, security checks  

## Installation

```bash
git clone https://github.com/ghostfire12-arch/KCRegisterNotifyAPI.git
cd KCRegisterNotifyAPI
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
API_KEY=your_api_key_here
KC_CLIENT_ID=your_kingschat_client_id
PORT=3000
```

## Running

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:3000`

---

## API Endpoints

### 1. POST `/notify`
Send a message to a single KingsChat user.

**Request:**
```json
{
  "apiKey": "your_api_key",
  "kcid": "user123",
  "message": "Hello from API!",
  "accessToken": "user_access_token",
  "refreshToken": "user_refresh_token"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to send message",
  "details": "Token expired"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key",
    "kcid": "user123",
    "message": "Hello!",
    "accessToken": "eyJhbGci...",
    "refreshToken": "CTxu79mR..."
  }'
```

---

### 2. POST `/notify-batch`
Send messages to one or multiple KingsChat users.

**Request (Single User):**
```json
{
  "apiKey": "your_api_key",
  "kcid": "user123",
  "message": "Hello!",
  "accessToken": "user_access_token",
  "refreshToken": "user_refresh_token"
}
```

**Request (Multiple Users):**
```json
{
  "apiKey": "your_api_key",
  "kcid": ["user1", "user2", "user3"],
  "message": "Broadcast message!",
  "accessToken": "user_access_token",
  "refreshToken": "user_refresh_token"
}
```

**Response (All Success):**
```json
{
  "success": true,
  "results": [
    { "kcid": "user1", "success": true },
    { "kcid": "user2", "success": true },
    { "kcid": "user3", "success": true }
  ],
  "message": "All messages sent successfully"
}
```

**Response (Partial Failure):**
```json
{
  "success": false,
  "results": [
    { "kcid": "user1", "success": true },
    { "kcid": "user2", "success": false, "error": "Invalid user", "details": "..." },
    { "kcid": "user3", "success": true }
  ],
  "message": "Some messages failed to send"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/notify-batch \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key",
    "kcid": ["user1", "user2", "user3"],
    "message": "Broadcast!",
    "accessToken": "eyJhbGci...",
    "refreshToken": "CTxu79mR..."
  }'
```

---

### 3. POST `/get-access-token`
Obtain a new access token using a refresh token.

**Request:**
```json
{
  "apiKey": "your_api_key",
  "refreshToken": "user_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600000
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/get-access-token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key",
    "refreshToken": "CTxu79mR..."
  }'
```

---

### 4. POST `/refresh-static-token`
Refresh the static ministry token (server-to-server, no user token needed).

**Request:**
```json
{
  "apiKey": "your_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_access_token",
  "refreshToken": "static_refresh_token",
  "expiresIn": 3600000
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/refresh-static-token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_api_key"
  }'
```

---

## Error Handling

All errors return a standardized JSON format:

```json
{
  "success": false,
  "error": "Error type",
  "details": "Additional context"
}
```

### Common Error Responses

| Error | Status | Meaning |
|-------|--------|---------|
| Invalid API key | 401 | API key doesn't match or missing |
| Missing fields | 400 | Required parameters not provided |
| Failed to send message | 500 | KingsChat API failure |
| Failed to refresh token | 500 | Token refresh endpoint down |
| Endpoint not found | 404 | Invalid route |

---

## Security Best Practices

1. **Never commit `.env`** - It's in `.gitignore`
2. **Use HTTPS in production** - Always use secure connections
3. **Validate API keys** - Every endpoint checks the API key
4. **Rotate tokens regularly** - Implement token rotation in your client
5. **Rate limiting** - Consider adding rate limiting for production
6. **Log sensitive data carefully** - Never log full tokens in production

---

## Deployment

### Render (Free Tier)

1. Push to GitHub
2. Go to https://render.com/dashboard
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Set environment variables in Render dashboard
6. Deploy!

### Heroku

```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set API_KEY=your_key KC_CLIENT_ID=your_client_id
```

### Docker

```bash
docker build -t kcregisternotifyapi .
docker run -p 3000:3000 --env-file .env kcregisternotifyapi
```

---

## Troubleshooting

### "undefined is not valid JSON"
✅ **Fixed** - All responses now sanitize undefined values to null

### Token Expired
The API automatically refreshes tokens using the provided refresh token. If it fails:
- Check that `refreshToken` is valid
- Verify the KingsChat auth server is accessible
- Ensure `accessToken` hasn't been revoked

### Connection Refused
- Check that the API is running: `npm start`
- Verify PORT environment variable is set correctly
- Check firewall/proxy settings

### 401 Unauthorized
- Verify `apiKey` in request matches `.env` API_KEY
- Check that API_KEY environment variable is set

---

## Testing

Use the provided cURL examples above, or use Postman/Insomnia to test endpoints.

Test data:
```json
{
  "apiKey": "0d36c9fc757a8d0d8bf4be36a1194f70a0b1363ec01d64b2237c1faa73c8790c",
  "kcid": "user123",
  "message": "Test message",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "CTxu79mR83LcdJG7ErQAB7gnOwLIKJsaXKaVfP4fvXY="
}
```

---

## Support

For issues, questions, or contributions:
- 📧 Email: danes0463@gmail.com
- 🐛 GitHub Issues: [Open an issue](https://github.com/ghostfire12-arch/KCRegisterNotifyAPI/issues)

---

## License

MIT License - See LICENSE file for details

---

**Made with ❤️ for KingsChat community**
