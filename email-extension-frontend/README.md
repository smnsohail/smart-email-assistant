# Smart Email Assistant - Frontend & Browser Extension

A modern Angular-based frontend and browser extension for the Smart Email Assistant, designed to generate AI-powered email responses with customizable tones.

## Features

- 🎯 **Smart Email Response Generation**: AI-powered email responses using your backend API
- 🎨 **Multiple Tone Options**: Professional, casual, friendly, or custom tones
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔌 **Browser Extension**: Seamlessly integrates with Gmail and Outlook
- ⚡ **Real-time Processing**: Loading animations and error handling
- 📋 **Copy to Clipboard**: Easy response copying functionality
- 🎭 **Modern UI**: Clean, professional interface with smooth animations

## Project Structure

```
email-extension-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── email-assistant/
│   │   │       ├── email-assistant.component.ts
│   │   │       ├── email-assistant.component.html
│   │   │       └── email-assistant.component.css
│   │   ├── services/
│   │   │   └── email.service.ts
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── main.ts
│   ├── index.html
│   └── styles.css
├── manifest.json (Browser Extension)
├── content-script.js (Browser Extension)
├── content-styles.css (Browser Extension)
├── package.json
├── angular.json
└── tsconfig.json
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (v17 or higher)
- Your Spring Boot backend running on `http://localhost:8080`

## Setup Instructions

### 1. Install Dependencies

```bash
cd email-extension-frontend
npm install
```

### 2. Configure Backend URL

Update the API URL in `src/app/services/email.service.ts`:

```typescript
private readonly API_URL = 'http://localhost:8080/api/email/generate';
```

Make sure this matches your Spring Boot backend URL.

### 3. Development Server

Run the Angular development server:

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`.

### 4. Build for Production

Build the Angular app for production:

```bash
npm run build
# or
ng build --configuration production
```

The built files will be in the `dist/smart-email-frontend/` directory.

### 5. Browser Extension Setup

#### Build Extension

```bash
npm run build:extension
```

This creates an optimized build in `dist/extension/` for the browser extension.

#### Install Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `email-extension-frontend` directory
5. The extension will appear in your browser toolbar

#### Install Extension in Firefox

1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the `email-extension-frontend` directory

## Usage

### Standalone Web App

1. Open `http://localhost:4200` in your browser
2. Enter email content in the text area
3. Select desired tone (Professional, Casual, Friendly, or Custom)
4. Click "Generate Response"
5. Copy the generated response

### Browser Extension

1. Navigate to Gmail or Outlook in your browser
2. Look for the "Smart Email Assistant" button in the email interface
3. Click the button to open the popup
4. The extension will auto-fill email content if available
5. Generate and use the response directly in your email

## Component Features

### Email Assistant Component

- **Auto-expanding textarea**: Input field grows as content increases
- **Tone selectors**: Four built-in options plus custom tone input
- **Validation**: Form validation with helpful error messages
- **Loading states**: Spinner animation during API calls
- **Error handling**: User-friendly error messages
- **Response display**: Formatted response with copy functionality

### Email Service

- **HTTP client integration**: Handles API communication
- **Error handling**: Comprehensive error mapping
- **TypeScript interfaces**: Type-safe request/response handling

## Browser Extension Features

### Content Script Integration

- **Gmail support**: Integrates with Gmail interface
- **Outlook support**: Works with Outlook web app
- **Auto-detection**: Finds compose areas and email content
- **Dynamic injection**: Adapts to different email client layouts

### Popup Interface

- **Seamless integration**: Opens Angular app in popup
- **Context awareness**: Pre-fills email content when available
- **Response insertion**: Directly inserts generated responses

## Customization

### Styling

The application uses CSS custom properties for easy theming. Key files:

- `src/styles.css`: Global styles
- `src/app/components/email-assistant/email-assistant.component.css`: Component styles
- `content-styles.css`: Browser extension styles

### API Configuration

Update backend configuration in:
- `src/app/services/email.service.ts`: Service configuration
- `manifest.json`: Extension permissions

### Tone Options

Modify tone options in `src/app/components/email-assistant/email-assistant.component.ts`:

```typescript
toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'custom', label: 'Custom' }
];
```

## Backend Integration

This frontend is designed to work with the Spring Boot backend at:
`https://github.com/smnsohail/smart-email-assistant`

### API Endpoint

```
POST /api/email/generate
Content-Type: application/json

{
  "emailContent": "string",
  "tone": "string"
}
```

### Response Format

The backend should return a plain text response containing the generated email.

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your backend allows requests from the frontend origin
2. **Extension not loading**: Check that all files are in the correct locations
3. **API connection failed**: Verify backend is running and URL is correct
4. **Button not appearing**: Email client interfaces may change; adjust selectors in content script

### Development Tips

1. Use browser developer tools to debug extension issues
2. Check console logs for API errors
3. Test with different email clients and interfaces
4. Verify manifest permissions for extension functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Smart Email Assistant system. Please refer to the main repository for licensing information.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify backend API is accessible
4. Test with different browsers and email clients