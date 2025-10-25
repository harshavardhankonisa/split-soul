# Installation Guide

Install and load the Split Soul Chrome extension.

## Prerequisites

- Chrome 138+
- Node.js 18+
- npm

## Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/harshavardhankonisa/split-soul.git
   ```
2. Navigate to the project directory:
   ```bash
   cd split-soul
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

- Outputs to dist/

## Load in Chrome

1. Open chrome://extensions
2. Enable Developer mode
3. Click Load unpacked and select the dist/ folder
4. Pin Split Soul and click the toolbar icon to open the popup

## Dev workflow

- Watch-build:

```bash
npm run dev
```

- After rebuilds, click Reload in chrome://extensions to apply changes

## Troubleshooting

- If the popup doesnt open, ensure dist/ is loaded and the build finished
- If Summarizer fails, ensure Chrome is up to date and offscreen document isnt blocked
- Clear/Reload the extension after significant changes
