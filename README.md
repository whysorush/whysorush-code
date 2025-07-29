# Whysorush Flow - AI-Powered Code Editor

An intelligent code editor that provides context-aware AI assistance, similar to Cursor AI. Built with React, TypeScript, and modern web technologies.

## 🚀 Features

### **AI-Powered Code Assistance**
- **Context-Aware Responses**: AI understands your project structure and provides relevant suggestions
- **Natural Language Input**: Type requests like "Refactor the payment module" or "Add error handling to authentication"
- **Smart Prompt Selection**: Automatically selects the best AI prompt based on your input
- **Conversation History**: All interactions are saved for iterative development

### **Project Management**
- **File Upload System**: Upload individual files or entire directories
- **File Browser**: Navigate your project structure with ease
- **Code Editor**: Direct file editing with syntax highlighting
- **Diff Viewer**: Side-by-side comparisons of original vs. modified code

### **Advanced AI Features**
- **Prompt Management**: Centralized system for managing AI prompts
- **Memory System**: AI learns from your interactions and maintains context
- **Tool Orchestration**: Intelligent tool selection and execution
- **Multi-Mode Support**: Switch between Chat, Agent, and Memory modes

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: React Query, React Hook Form
- **AI Integration**: Custom prompt management system
- **Development**: ESLint, Prettier, TypeScript

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/whysorush/cursor.git
cd cursor

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚀 Deployment

### GitHub Pages (Recommended)

This project is configured for automatic deployment to GitHub Pages. The site will be available at: **https://whysorush.github.io/cursor**

#### Automatic Deployment
- Push changes to the `main` branch
- GitHub Actions will automatically build and deploy the site
- Deployment typically takes 2-3 minutes

#### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to GitHub Pages (requires gh-pages package)
npm run deploy
```

### Other Deployment Options

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Build the project
npm run build

# Deploy the dist folder to Netlify
```

## 🎯 Quick Start

### 1. **Upload Your Project**
- Click the **"Upload Project"** button in the top-right corner
- Choose to upload individual files or entire directories
- Supported file types: `.js`, `.ts`, `.tsx`, `.jsx`, `.json`, `.md`, `.txt`, `.css`, `.html`, `.py`, `.java`, `.cpp`, `.c`, `.go`, `.rs`, `.php`, `.rb`, `.swift`, `.kt`

### 2. **Use the Composer**
- Switch to the **"Composer"** tab in the left sidebar
- Add relevant files to the AI context using the **"+"** button
- Type your requests in natural language
- Review and apply suggested changes

### 3. **Explore Other Features**
- **Code Editor**: Direct file editing and navigation
- **Chat Interface**: General AI assistance
- **Memory Panel**: Track AI learning and context
- **Prompt Registry**: Manage AI prompts

## 📚 Documentation

- **[Usage Guide](USAGE_GUIDE.md)**: Comprehensive guide for using Whysorush Flow
- **[Prompt Integration Guide](PROMPT_INTEGRATION_GUIDE.md)**: Advanced prompt management features
- **[DeepSeek Setup](DEEPSEEK_SETUP.md)**: Configuration for DeepSeek AI integration

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

### Project Structure

```
src/
├── components/          # React components
│   ├── Composer/       # AI composer interface
│   ├── FileBrowser/    # File navigation
│   └── ui/            # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Application pages
├── prompts/            # AI prompt files
├── types/              # TypeScript type definitions
└── data/               # Sample data and configurations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Powered by modern React and TypeScript
- Inspired by Cursor AI and similar intelligent code editors

---

**Whysorush Flow** - Making AI-powered coding accessible and intuitive.
