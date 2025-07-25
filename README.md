# ScholarSync - Resume & Google Scholar Integration App

A full-stack Next.js application that integrates resume parsing and Google Scholar profile analysis to provide personalized project suggestions based on skills, education, and research interests.

🔗 **Live Demo**: [https://scholarsync-resume-integration-dev.vercel.app/](https://scholarsync-resume-integration-dev.vercel.app/)

## 🚀 Features

- **Resume Upload & Parsing**: Upload PDF/DOCX resumes with automatic parsing
- **Google Scholar Integration**: Fetch and analyze Google Scholar profiles
- **Intelligent Project Suggestions**: AI-powered recommendations based on your profile
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **State Management**: Redux Toolkit for efficient state management
- **Security**: Input validation, rate limiting, and file upload security
- **Testing**: Comprehensive test coverage with Jest, React Testing Library, and Cypress
- **Code Quality**: ESLint + Prettier with TypeScript support

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **State Management**: Redux Toolkit
- **UI Components**: Tailwind CSS
- **File Upload**: react-dropzone
- **Icons**: Lucide React

### Backend

- **API Routes**: Next.js API Routes
- **Resume Parsing**: pdf-parse (PDF) / mammoth.js (DOCX)
- **Web Scraping**: cheerio for Google Scholar integration
- **Rate Limiting**: Enterprise-grade rate limiting with security validation

### Security & Testing

- **Input Validation**: Comprehensive validation for all inputs
- **File Security**: Type and size validation for uploads (PDF/DOCX, 5MB limit)
- **Rate Limiting**: API protection against abuse (10 requests/minute)
- **Testing**: Jest + React Testing Library + Cypress
- **Linting**: ESLint + Prettier with TypeScript support

## 🌐 Quick Start

### Try the Live Application

Visit the deployed application: **[https://scholarsync-resume-integration-dev.vercel.app/](https://scholarsync-resume-integration-dev.vercel.app/)**

### Local Development

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Devarora13/scholarsync-resume-integration-Dev-Arora.git
   cd scholarsync-resume-integration-Dev-Arora
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests with Cypress
npm run test:e2e

# Open Cypress UI
npm run cypress:open

# Run all test suites
npm run test:all

# CI pipeline (lint + typecheck + coverage)
npm run test:ci
```

### Testing Framework Features

- **📊 Coverage Reporting**: Comprehensive code coverage with HTML reports
- **🔄 Continuous Testing**: Watch mode for development with automatic re-runs
- **🚀 CI/CD Ready**: Automated testing pipeline for production deployments
- **🎯 Test Types**: Unit, Integration, Component, and End-to-End testing
- **🛡️ Security Testing**: Input validation and rate limiting verification
- **📱 Responsive Testing**: Cross-device compatibility testing with Cypress

## 🔒 Security Features

- **File Upload Security**: Validates file types (PDF/DOCX only) and size limits (5MB max)
- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: API endpoints protected against abuse (10 requests per minute)
- **CORS Protection**: Proper CORS configuration
- **XSS Protection**: HTML output sanitization

## 🏗️ Architecture & Design Patterns

### Design Patterns Used

- **Observer Pattern**: Redux state management for tracking data changes
- **Strategy Pattern**: Different parsing strategies for various file formats
- **Factory Pattern**: Component factories for different UI elements

### State Management

- **Redux Toolkit**: Centralized state management
- **Async Thunks**: Handling asynchronous operations
- **Normalized State**: Efficient data structure for complex state

### Promise Resolution Strategies

- **Promise.all()**: Parallel processing of multiple async operations
- **Promise.race()**: First successful response handling
- **Chained Promises**: Sequential task resolution

## 📁 Project Structure

```
scholarsync-resume-integration/
├── app/
│   ├── api/
│   │   ├── parse-resume/
│   │   │   └── route.ts
│   │   ├── fetch-scholar-profile/
│   │   │   └── route.ts
│   │   └── generate-suggestions/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   └── [shadcn components]
│   ├── header.tsx
│   ├── resume-uploader.tsx
│   ├── scholar-profile-input.tsx
│   ├── resume-display.tsx
│   ├── scholar-display.tsx
│   └── project-suggestions.tsx
├── lib/
│   ├── slices/
│   │   ├── resume-slice.ts
│   │   ├── scholar-slice.ts
│   │   └── suggestions-slice.ts
│   ├── store.ts
│   ├── rate-limit.ts
│   └── utils.ts
├── __tests__/
│   ├── components/
│   └── api/
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
├── package.json
├── tailwind.config.js
├── next.config.js
├── jest.config.js
├── cypress.config.js
├── .env.example
└── README.md
```

## 🚀 Deployment

The application is currently deployed on Vercel and accessible at: **[https://scholarsync-resume-integration-dev.vercel.app/](https://scholarsync-resume-integration-dev.vercel.app/)**

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with one click

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t scholarsync .

# Run container
docker run -p 3000:3000 scholarsync
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting (optional - defaults provided)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Google Scholar Configuration (if needed for enhanced features)
# GOOGLE_SCHOLAR_API_KEY=your_api_key_here
```

### Tailwind Configuration

The project uses a custom Tailwind configuration optimized for the design system with custom colors, spacing, and components.

## 📊 Performance Optimizations

- **Server-Side Rendering**: Next.js SSR for improved performance
- **Code Splitting**: Automatic code splitting for optimal loading
- **Image Optimization**: Next.js Image component for optimized images
- **Lazy Loading**: Components loaded on demand
- **Caching**: Efficient caching strategies for API responses
- **Bundle Analysis**: Use `npm run analyze` to analyze bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Run the test suite (`npm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 API Documentation

### Resume Parsing API

```http
POST /api/parse-resume
Content-Type: multipart/form-data

Body: FormData with 'resume' file (PDF/DOCX, max 5MB)
Response: Parsed resume data in JSON format
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "personalInfo": { "name": "...", "email": "...", "phone": "..." },
    "education": [...],
    "experience": [...],
    "skills": [...]
  }
}
```

### Google Scholar API

```http
POST /api/fetch-scholar-profile
Content-Type: application/json

Body: { "profileUrl": "https://scholar.google.com/citations?user=..." }
Response: Scholar profile data in JSON format
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "name": "...",
    "affiliation": "...",
    "publications": [...],
    "citationCount": 123,
    "hIndex": 45
  }
}
```

### Project Suggestions API

```http
POST /api/generate-suggestions
Content-Type: application/json

Body: { "resumeData": {...}, "scholarData": {...} }
Response: Array of project suggestions
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "title": "...",
        "description": "...",
        "skills": [...],
        "difficulty": "intermediate",
        "estimatedTime": "2-3 months"
      }
    ]
  }
}
```

## 🐛 Known Issues & Limitations

- Rate limiting uses in-memory storage (recommended to use Redis for production scaling)
- File uploads limited to 5MB (configurable via environment variables)
- Google Scholar scraping may be affected by site changes
- Currently supports English language resumes primarily

## 🔮 Future Enhancements

- [ ] User authentication and profiles
- [ ] Project collaboration features
- [ ] Advanced recommendation algorithms using ML
- [ ] Mobile app development
- [ ] Integration with additional academic databases (ORCID, ResearchGate)
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] PDF generation for project suggestions
- [ ] Email notifications for new suggestions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Dev Arora
- **GitHub**: [@Devarora13](https://github.com/Devarora13)
- **Repository**: [scholarsync-resume-integration-Dev-Arora](https://github.com/Devarora13/scholarsync-resume-integration-Dev-Arora)

## 🆘 Support

For questions, bug reports, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/Devarora13/scholarsync-resume-integration-Dev-Arora/issues)
- **Email**: devarora1309@gmail.com

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Special thanks to contributors and testers
- Inspired by the need to bridge academic research and practical project development

---

**⭐ Star this repository if you find it helpful!**

**🔗 Live Demo**: [https://scholarsync-resume-integration-dev.vercel.app/](https://scholarsync-resume-integration-dev.vercel.app/)

**📂 Repository**: [https://github.com/Devarora13/scholarsync-resume-integration-Dev-Arora](https://github.com/Devarora13/scholarsync-resume-integration-Dev-Arora)
