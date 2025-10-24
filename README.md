# Split Soul

AI-powered digital companions that work in the background to enhance your browsing experience. Create customizable "souls" that monitor your activity, generate insights, and suggest helpful actions using Chrome's built-in AI APIs.

## Features

- **Digital Companions**: Create AI-powered "souls" with unique personalities and roles
- **Background Activity Monitoring**: Tracks your browsing patterns and active time
- **Intelligent Insights**: Generates summaries and analysis of your web activity
- **Action Suggestions**: AI agents propose helpful actions based on your behavior
- **Chrome AI Integration**: Leverages Chrome's built-in Summarizer, Writer, ReWriter, Trasnlator, Proofreader and Prompt APIs
- **Local Data Storage**: Uses IndexedDB for privacy-focused local data management.
- **Vector Search**: Semantic similarity search using transformer models

## Environment

- Node.js v22.17.0
- npm v9.8.1

## Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **Build Tool**: Vite
- **AI/ML**: Chrome Built-in AI APIs, Xenova Transformers
- **Database**: Dexie (IndexedDB wrapper)
- **Extension**: Chrome Extension Manifest V3

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/harshavardhankonisa/split-soul.git
   cd split-soul
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Build the extension**

   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder

## Development

```bash
# Start development build with watch mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
split-soul/
├── public/                          # Static assets & manifest
│   ├── manifest.json                # Chrome Extension Manifest V3
│   ├── assets/                      # Static assets
│   ├── wasm/                        # WebAssembly files for transformers
│   └── icons/                       # Extension icons
│
├── src/
│   ├── popup/                       # Extension popup UI
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── Popup.tsx
│   │
│   ├── background/                  # Service worker scripts
│   │   ├── background.ts
│   │   ├── services/                # Background services
│   │   └── listeners/               # Event listeners
│   │
│   ├── content/                     # Content scripts
│   │   ├── content.ts
│   │   └── services/                # Content script services
│   │
│   ├── offscreen/                   # Offscreen document for AI APIs
│   │   ├── index.html
│   │   └── index.ts
│   │
│   ├── components/                  # React components
│   │   ├── common/                  # Common UI components
│   │   └── core/                    # Core UI components
│   │
│   ├── services/                    # Shared services
│   │   ├── API/                     # Chrome AI API wrappers
│   │   ├── dexie/                   # Database layer
│   │   ├── transformers/            # ML utilities
│   │   └── agents/                  # AI agent implementations
│   │
│   ├── interface/                   # TypeScript interfaces
│   │   ├── database.ts              # Database schema
│   │   └── ui.ts                    # UI-related types
│   │
│   ├── theme/                       # MUI theme
│   ├── utils/                       # Utility functions
│   └── config/                      # Configuration files
│
├── docs/                            # Documentation
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
└── package.json
```

## Core Concepts

### Souls

Digital AI companions with distinct personalities and roles:

- **Main Body**: The human user directing conversations
- **Main Soul**: Primary coordinator that summarizes activity every 5 minutes
- **Custom Souls**: User-created agents with specific purposes

### Activity Tracking

Monitors browsing behavior and generates insights:

- Tracks active time on websites
- Detects user interactions
- Stores activity data locally

### Action System

AI-generated suggestions for user actions:

- Souls propose actions based on activity
- Voting system for action prioritization
- Tool-based action execution

## Documentation

Detailed documentation is available in the `docs/` folder:

- [Project Overview](docs/overview.md) - Architecture and design principles
- [Installation Guide](docs/installation.md) - Step-by-step setup instructions
- [Usage Instructions](docs/usage.md) - How to use the extension
- [Contributing Guide](docs/contributing.md) - Development guidelines
- [FAQ](docs/faq.md) - Common questions and troubleshooting

## Requirements

- Chrome browser with AI APIs enabled
- Chrome version 138+ (for built-in AI features)
- Enable API's in `chrome://flags/`

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details on:

- Code style and formatting
- Development workflow
- Pull request process
- Issue reporting

## License

This project is licensed under the MIT License.

## Support

For questions, issues, or feature requests:

- Open an issue on GitHub
- Check the [FAQ](docs/faq.md) for common questions
- Review the documentation in the `docs/` folder
