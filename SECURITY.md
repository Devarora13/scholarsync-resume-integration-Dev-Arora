# ScholarSync Security Implementation

## 🔒 **Security Features Implemented**

### **1. Enhanced Rate Limiting**

- **Tiered Rate Limits** by endpoint type:
  - File uploads: 5 requests/minute
  - Resume parsing: 10 requests/minute
  - Scholar scraping: 3 requests/minute (external API protection)
  - Suggestions: 20 requests/minute
  - General: 50 requests/minute
- **Per-client tracking** using IP addresses
- **Automatic cleanup** of expired entries
- **Rate limit headers** in responses

### **2. Input Validation & Sanitization**

- **Content-Type validation** for API requests
- **Request size limits** (10MB max)
- **File validation**:
  - Type checking (PDF, DOCX, TXT only)
  - Size limits (5MB max)
  - Filename validation (alphanumeric + safe chars only)
- **URL validation** for Scholar profiles
- **Data sanitization** to prevent XSS attacks
- **Object depth/size limits** to prevent DoS

### **3. Brute Force Protection**

- **Failed attempt tracking** per client
- **Automatic blocking** after 5 failed attempts
- **Time-based lockouts** (15 minutes)
- **Security event logging**

### **4. CORS Protection**

- **Origin validation** against allowlist
- **Preflight request handling**
- **Credential restrictions**

### **5. Security Headers**

- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Content Security Policy**: Restricts resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### **6. Error Handling**

- **Generic error messages** to prevent information leakage
- **Security event logging** for monitoring
- **Graceful degradation** for service failures

## 🛡️ **Security Middleware**

### **Global Middleware** (`middleware.ts`)

```typescript
- Security headers on all requests
- CORS handling for API routes
- CSP policy enforcement
- Preflight request handling
```

### **API Security** (`lib/security.ts`)

```typescript
- Request validation
- Input sanitization
- Brute force protection
- Enhanced rate limiting
```

## 📊 **Rate Limiting Strategy**

| Endpoint    | Limit  | Window | Reasoning                  |
| ----------- | ------ | ------ | -------------------------- |
| Upload      | 5/min  | 60s    | File processing intensive  |
| Parse       | 10/min | 60s    | CPU intensive parsing      |
| Scholar     | 3/min  | 60s    | External API protection    |
| Suggestions | 20/min | 60s    | Core feature, higher limit |
| Default     | 50/min | 60s    | General API usage          |

## 🔍 **Validation Rules**

### **File Uploads**

- **Size**: Maximum 5MB
- **Types**: PDF, DOCX, TXT only
- **Names**: Alphanumeric + hyphens, underscores, dots
- **Length**: Filename max 255 characters

### **Scholar URLs**

- **Format**: Must match Google Scholar pattern
- **Length**: Maximum 500 characters
- **Protocol**: HTTPS only

### **Request Data**

- **JSON**: Valid JSON format required
- **Size**: Maximum 10MB total request
- **Fields**: Limited to 50 fields per object
- **Arrays**: Maximum 100 items
- **Strings**: Maximum 10,000 characters

## 🚨 **Security Monitoring**

### **Logged Events**

- Failed authentication attempts
- Invalid file uploads
- CORS violations
- Rate limit violations
- Malformed requests
- Brute force attempts

### **Response Headers**

- `X-RateLimit-Remaining`: Requests left in window
- `X-RateLimit-Reset`: Window reset time
- Security headers on all responses

## 🔧 **Configuration**

### **Environment Variables**

```env
APP_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
RATE_LIMIT_*=custom-limits
```

### **Production Recommendations**

1. **Use Redis** for rate limiting storage
2. **Implement JWT** for user authentication
3. **Add request logging** with structured logs
4. **Use CDN** with DDoS protection
5. **Regular security audits**
6. **Update dependencies** regularly

## 📋 **Security Checklist**

- ✅ Rate limiting implemented
- ✅ Input validation & sanitization
- ✅ File upload security
- ✅ CORS protection
- ✅ Security headers
- ✅ Brute force protection
- ✅ Error handling
- ✅ Request size limits
- ✅ Content type validation
- ✅ URL validation

## 🔄 **Testing Security**

### **Rate Limiting Test**

```bash
# Test rate limits
for i in {1..10}; do curl -X POST http://localhost:3000/api/parse-resume; done
```

### **File Upload Test**

```bash
# Test file size limit
curl -X POST -F "resume=@large-file.pdf" http://localhost:3000/api/parse-resume
```

### **CORS Test**

```bash
# Test CORS policy
curl -H "Origin: http://malicious-site.com" http://localhost:3000/api/generate-suggestions
```

This security implementation provides enterprise-grade protection suitable for academic and production environments.
