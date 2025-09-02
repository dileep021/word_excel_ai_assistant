# iPixxel AI Assistant - Microsoft Office Add-in

An AI-powered assistant add-in for Microsoft Word and Excel that integrates GPT capabilities directly into your Office applications. Similar to "GPT for Excel Word" but with enhanced features including document context selection, external document attachments, and quick actions.

## Features

### Core Functionality
- **AI Chat Interface**: Interactive conversation with GPT-4 directly in Word/Excel
- **Context Management**: Toggle between full document or selected text as context
- **External Documents**: Attach PDFs, DOCX, or TXT files as additional context
- **Quick Actions**: One-click access to common AI tasks
- **Direct Insertion**: Insert AI responses directly into your document

### Quick Actions
- **Rewrite**: Rephrase text in different styles (professional, casual, creative)
- **Fix Grammar**: Correct grammar and spelling mistakes
- **Translate**: Translate text while preserving formatting
- **Summarize**: Create concise summaries of long content
- **Generate Draft**: Create new content based on prompts
- **Explain**: Get explanations of complex text

## Prerequisites

- Node.js 18+ and npm
- Microsoft Office 2016+ (Word and/or Excel)
- OpenAI API key
- SSL certificate for local development (auto-generated)

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd microsoft_word_addon
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Generate SSL certificates** (for local development)
```bash
npx office-addin-dev-certs install
```

## Development

### Start the development servers

Run both the frontend and backend servers:
```bash
npm run dev
```

This will start:
- Frontend (webpack-dev-server) on https://dbx.paperentry.ai:55030
- Backend (Express server) on http://localhost:55031

### Load the add-in in Office

#### Method 1: Using Office Add-in Debugging (Recommended)
```bash
npm run start:office
```

This will automatically open Word/Excel with the add-in loaded.

#### Method 2: Manual Sideloading

**For Word:**
1. Open Word
2. Go to Insert → Add-ins → My Add-ins
3. Click "Upload My Add-in"
4. Browse and select `manifest.xml`
5. Click "Upload"

**For Excel:**
1. Open Excel
2. Go to Insert → Add-ins → My Add-ins
3. Click "Upload My Add-in"
4. Browse and select `manifest.xml`
5. Click "Upload"

### Validate the manifest
```bash
npm run validate
```

## Production Build

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
microsoft_word_addon/
├── src/
│   ├── taskpane/           # React frontend
│   │   ├── components/     # UI components
│   │   ├── styles/         # CSS styles
│   │   └── App.tsx         # Main app component
│   ├── services/           # Service layers
│   │   ├── OfficeService.ts    # Office.js interactions
│   │   └── OpenAIService.ts    # API client
│   └── types/              # TypeScript definitions
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── middleware/         # Express middleware
├── manifest.xml            # Office Add-in manifest
├── webpack.config.js       # Webpack configuration
└── package.json            # Dependencies and scripts
```

## Usage

### Starting a Conversation
1. Click the "Open AI Assistant" button in the ribbon
2. The task pane will open on the right side
3. Type your question or select a quick action
4. Press Enter or click Send

### Using Context Modes
- **Full Document**: AI uses your entire document as context
- **Selection**: AI only uses selected text as context
- Toggle between modes using the context selector

### Attaching External Documents
1. Click the Documents section
2. Drag and drop or click to upload files
3. Supported formats: PDF, DOCX, TXT (max 10MB)
4. Click "Read this file" to load it as context

### Quick Actions
1. Select text in your document (or use full document mode)
2. Click any quick action button
3. Review the AI response
4. Click "Insert" to add it to your document

### Inserting AI Responses
- Click the "Insert" button on any AI response
- The text will be inserted at your cursor position
- Original formatting is preserved

## API Endpoints

The backend provides the following endpoints:

- `POST /api/chat` - Main chat endpoint
- `POST /api/quick-action` - Execute quick actions
- `POST /api/documents/upload` - Upload external documents
- `GET /api/documents/:id` - Retrieve document content
- `POST /api/grammar` - Detailed grammar check
- `POST /api/translate` - Translation service
- `POST /api/summarize` - Text summarization
- `POST /api/generate-draft` - Content generation
- `POST /api/explain` - Text explanation

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `OPENAI_MODEL` - GPT model to use (default: gpt-4-turbo-preview)
- `PORT` - Backend server port (default: 55031)
- `RATE_LIMIT_REQUESTS` - Max requests per window (default: 100)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 10MB)

### Customization

#### Modify Quick Actions
Edit `src/taskpane/components/QuickActions.tsx` to add or modify quick actions.

#### Change UI Theme
Edit `src/taskpane/styles/taskpane.css` to customize colors and styling.

#### Add New AI Features
1. Add endpoint in `server/routes/ai.js`
2. Implement logic in `server/services/openai.js`
3. Add UI component in `src/taskpane/components/`

## Troubleshooting

### Common Issues

**Add-in not loading:**
- Ensure SSL certificates are installed
- Check that both servers are running
- Verify manifest.xml paths match your localhost URLs

**CORS errors:**
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Ensure the backend server is running

**OpenAI API errors:**
- Verify your API key is correct
- Check API rate limits
- Ensure you have credits in your OpenAI account

**File upload issues:**
- Check file size (max 10MB by default)
- Verify file type is supported (PDF, DOCX, TXT)
- Ensure uploads directory has write permissions

### Debug Mode

To debug the add-in:
```bash
npm run debug:word  # For Word
npm run debug:excel # For Excel
```

This will open the browser DevTools for debugging.

## Security Considerations

- **API Keys**: Never commit API keys to version control
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Configured to prevent abuse
- **File Uploads**: Validated and size-limited
- **CORS**: Restricted to specific origins
- **Authentication**: Implement proper auth in production

## Testing

### Linting
```bash
npm run lint
```

### Manual Testing Checklist
- [ ] Chat functionality works
- [ ] Context switching (full/selection)
- [ ] All quick actions execute
- [ ] File upload and parsing
- [ ] Insert text into document
- [ ] Error handling displays properly
- [ ] Rate limiting works
- [ ] Works in both Word and Excel

## Deployment

### Prerequisites for Production
1. SSL certificate for your domain
2. Hosting for frontend (static files)
3. Hosting for backend (Node.js server)
4. Production OpenAI API key

### Deployment Steps
1. Update manifest.xml with production URLs
2. Build the frontend: `npm run build`
3. Deploy frontend to CDN/static hosting
4. Deploy backend to server (Azure, AWS, etc.)
5. Submit to Microsoft AppSource (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your License]

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

- Built with Office.js
- Powered by OpenAI GPT-4
- UI inspired by modern AI assistants

---

**Note**: This is a development version. For production use, ensure proper security measures, authentication, and compliance with Microsoft Office Add-in guidelines.