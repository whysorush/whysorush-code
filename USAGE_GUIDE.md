# Whysorush Flow - Usage Guide

## 🚀 Getting Started

Whysorush Flow is an AI-powered code editor that provides context-aware assistance, similar to Cursor AI. This guide will help you get started with uploading your projects and using the Composer feature.

## 📁 Uploading Your Project

### **Step 1: Access the Upload Feature**
1. Open Whysorush Flow in your browser
2. Click the **"Upload Project"** button in the top-right corner of the header
3. This will open the Project Uploader modal

### **Step 2: Choose Upload Method**
You have two options for uploading your project:

#### **Option A: Upload Individual Files**
- Click **"Select Files"** to choose specific files
- Hold Ctrl/Cmd to select multiple files
- Supported file types: `.js`, `.ts`, `.tsx`, `.jsx`, `.json`, `.md`, `.txt`, `.css`, `.html`, `.py`, `.java`, `.cpp`, `.c`, `.go`, `.rs`, `.php`, `.rb`, `.swift`, `.kt`

#### **Option B: Upload Entire Directory (Recommended)**
- Click **"Select Directory"** to upload your entire project folder
- This preserves the folder structure and relationships
- All files in the directory will be uploaded automatically

### **Step 3: Review and Import**
1. The uploader will process your files and show a preview
2. Review the file list to ensure everything is included
3. Click **"Import Project"** to add your project to the code space

## 🎯 Using the Composer Feature

### **Accessing Composer**
1. After uploading your project, click on the **"Composer"** tab in the left sidebar
2. The Composer interface will open with your project files loaded

### **Key Features**

#### **1. Chat Interface**
- **Natural Language Input**: Type requests like "Refactor the payment module" or "Add error handling to authentication"
- **Context-Aware Responses**: The AI understands your project structure and provides relevant suggestions
- **Conversation History**: All interactions are saved for iterative development

#### **2. File Context Selection**
- **Add Context**: Click the **"+"** button to select files/folders for AI context
- **Context Badges**: Visual indicators show which files are included in the conversation
- **Search Files**: Use the search bar to quickly find specific files
- **Remove Context**: Click the **"X"** on context badges to remove files

#### **3. Code Changes**
- **Diff Viewer**: See side-by-side comparisons of original vs. modified code
- **Apply/Reject**: Choose which changes to apply to your codebase
- **File Navigation**: Switch between multiple file changes
- **Line-by-line Analysis**: Detailed view of code modifications

#### **4. Conversation History**
- **Saved Sessions**: Access previous conversations
- **Search History**: Find specific conversations or topics
- **Export/Import**: Save and share conversation data

## 💡 Example Workflows

### **Workflow 1: Code Refactoring**
1. **Upload Project**: Upload your existing codebase
2. **Select Context**: Add relevant files to the conversation context
3. **Make Request**: Ask "Refactor the payment module to use Stripe v4 API"
4. **Review Changes**: Examine the proposed changes in the diff viewer
5. **Apply Changes**: Accept the changes that look good
6. **Iterate**: Ask follow-up questions like "Also add logging for failed transactions"

### **Workflow 2: Feature Development**
1. **Upload Project**: Upload your project
2. **Describe Feature**: Ask "Create a new React component for data visualization"
3. **Review Generated Code**: Check the generated component in the diff viewer
4. **Customize**: Ask for modifications like "Make it responsive" or "Add dark mode support"
5. **Apply Changes**: Import the new component into your project

### **Workflow 3: Bug Fixes**
1. **Upload Project**: Upload the problematic codebase
2. **Describe Issue**: Ask "Fix the authentication error in the login form"
3. **Review Fixes**: Examine the proposed error handling improvements
4. **Test Changes**: Apply changes and test the functionality
5. **Refine**: Ask for additional improvements if needed

## 🔧 Integration with Other Panels

### **Code Editor Panel**
- Upload your project and switch to the **"Code"** tab
- Use the file browser to navigate your project structure
- Edit files directly in the code editor
- Changes made in the editor are reflected in the Composer context

### **Chat Panel**
- Use the general chat interface for broader AI assistance
- Ask questions about programming concepts
- Get help with debugging and problem-solving

### **Memory Panel**
- Track AI learning and context retention
- Review patterns and suggestions from previous sessions

## 🎨 Best Practices

### **Effective Project Uploads**
- **Include All Relevant Files**: Upload the entire project directory for best context
- **Exclude Large Files**: Skip binary files, images, and large dependencies
- **Include Configuration**: Upload `package.json`, `tsconfig.json`, etc. for better AI understanding
- **Include Documentation**: Upload README files and comments for context

### **Optimizing Composer Usage**
- **Be Specific**: "Add error handling to the login function" vs "Fix bugs"
- **Include Context**: Mention specific files or features in your requests
- **Iterative Refinement**: Build on previous responses for better results
- **Review Changes**: Always examine diffs before applying changes

### **File Context Selection**
- **Relevant Files**: Include only files related to your request
- **Dependencies**: Include imported files and related components
- **Configuration**: Include config files for project-specific context
- **Documentation**: Include README and docs for project understanding

## 🚨 Troubleshooting

### **Upload Issues**
- **Large Projects**: For very large projects, consider uploading in chunks
- **File Permissions**: Ensure you have permission to access the files
- **Browser Support**: Use modern browsers that support directory uploads
- **File Types**: Some file types may not be processed (binary files, images)

### **Composer Issues**
- **No Response**: Check if files are selected in context
- **Poor Suggestions**: Try adding more relevant files to context
- **Changes Not Applying**: Verify file permissions and try again
- **Performance**: Limit context to relevant files for faster responses

### **General Issues**
- **Browser Refresh**: Your uploaded project will persist until you refresh
- **Multiple Projects**: You can upload different projects by using the uploader again
- **Data Loss**: Always backup your work before making major changes

## 🔄 Advanced Features

### **Keyboard Shortcuts**
- **Enter**: Send message (when not in multi-line mode)
- **Shift + Enter**: New line in message input
- **Escape**: Close modals and cancel operations
- **Ctrl/Cmd + K**: Quick file search (in context builder)

### **File Management**
- **Drag and Drop**: Some browsers support drag-and-drop file uploads
- **Batch Operations**: Select multiple files for context at once
- **File Filtering**: Use search to find specific files quickly
- **Path Navigation**: Navigate through folder structures easily

### **AI Customization**
- **Context Size**: Adjust the number of files included for optimal performance
- **Response Length**: AI responses can be customized for brevity or detail
- **Code Style**: The AI adapts to your project's coding conventions
- **Language Support**: Supports multiple programming languages

## 📚 Example Prompts

### **Code Generation**
- "Create a React hook for managing form state"
- "Generate a TypeScript interface for the user model"
- "Write a utility function for date formatting"

### **Code Improvement**
- "Add TypeScript types to this JavaScript function"
- "Optimize this database query for better performance"
- "Refactor this component to use React hooks"

### **Bug Fixes**
- "Fix the memory leak in this component"
- "Add proper error handling to this API call"
- "Resolve the race condition in this async function"

### **Feature Requests**
- "Add pagination to this data table"
- "Implement dark mode support"
- "Add unit tests for this component"

## 🎯 Next Steps

1. **Upload Your Project**: Start by uploading your existing codebase
2. **Explore Composer**: Try the AI assistant with different types of requests
3. **Experiment**: Test various workflows and see what works best for your needs
4. **Integrate**: Use the Composer alongside your existing development workflow
5. **Share**: Export and share successful conversations with your team

## 🆘 Support

If you encounter issues or have questions:
- Check the troubleshooting section above
- Review the console for error messages
- Try refreshing the page and re-uploading your project
- Ensure you're using a supported browser

---

**Happy Coding with Whysorush Flow! 🚀** 