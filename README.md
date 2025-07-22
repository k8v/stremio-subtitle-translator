# Stremio Auto Subtitle Translate Addon

This Stremio addon automatically translates subtitles from OpenSubtitles to your desired language using various translation providers.

## Features

- Fetches subtitles from OpenSubtitlesV3
- Configurable target language
- Queue system for processing translation requests
- Caching of translated subtitles for improved performance
- Automatic provider fallback
- Rate limit protection
- Provider rotation for optimal performance

## How it Works

This addon follows the following workflow:

1. Receives subtitle request from Stremio
2. Checks if translated subtitles exist in the database
3. If not found, fetches subtitles from OpenSubtitles
4. Adds subtitles to a queue for translation
5. Returns a placeholder message during translation processing
6. Saves translated subtitles upon completion

## Configuration

This addon can be configured via Stremio with the following options:

- Provider: Choose from Google Translate, or ChatGPT (OpenAI Compatible Providers)
- BASE URL: Required for ChatGPT
  - ChatGPT: https://api.openai.com/v1/responses
  - Gemini: https://generativelanguage.googleapis.com/v1beta/openai/
  - OpenRouter: https://openrouter.ai/api/v1/chat/completions
- API Key: Required for ChatGPT
- Target Language: Select your desired translation language

## Technical Details

- Built with Node.js
- Uses `stremio-addon-sdk` for Stremio integration
- Implements a queue system using `better-queue`
- Stores subtitles on the local file system

### Translation Providers

- Google Translate
  - Web scraping method
- ChatGPT (Compatible API)
  - Google Gemini
  - OpenRouter

### Queue System

This addon uses a queue system to efficiently process translation requests:

- Implements `better-queue` to manage translation tasks
- Concurrent processing of subtitles
- Automatic retries on failure
- Progress tracking and status updates

### Storage

- Subtitles are stored on the local file system
- Organized by provider, language, and media ID
- Translations are cached for improved performance

### Translation Process

1. Subtitle files are parsed and split into chunks
2. Each chunk is translated using the selected provider
3. Translated chunks are reassembled while maintaining timing
4. The final subtitle file is saved in SRT format

## Installation

1. Web Installation (Recommended)

   - Open Stremio
   - Go to the following URL: In progress
   - Click "Install Addon"
   - Select your desired translation settings
   - Click "Install"
   - The addon will be automatically configured in Stremio

2. Manual Installation

   - Open Stremio
   - Navigate to Addons
   - Click the "Community Addons" tab
   - Paste this URL: In progress
   - Click "Install"

3. Self-Hosting

   ```bash
   # Clone the repository
   git clone https://github.com/HimAndRobot/stremio-translate-subtitle-by-geanpn.git
   cd stremio-auto-translate

   # Install dependencies
   npm install

   # Create necessary directories
   mkdir -p debug subtitles

   # Create a .env file from .env.example
   cp .env.example .env

   # Start the addon
   npm start
   ```

   Then, add `http://localhost:3000/manifest.json` to Stremio.

The addon will be available at `http://localhost:3000`.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `ADDRESS`: Server address (default: 0.0.0.0)
- `BASE_URL`: Base URL for subtitle files

## Contributing

Bug reports and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Support

Bug reports: geanpn@gmail.com
Donations: geanpn@gmail.com

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Credits

This project is based on [Auto-Subtitle-Translate-by-Sonsuz-Anime](https://github.com/sonsuzanime/Auto-Subtitle-Translate-by-Sonsuz-Anime) by @sonsuzanime. The original project was enhanced with:

### Improvements:

- Code optimization
- Queue system for handling multiple translation requests
- Improved error handling
- Better caching system
- Provider fallback system
- Rate limit protection
- Automatic provider rotation
- Chunk optimization for large subtitles

Thanks to @sonsuzanime for providing the original implementation that made this project possible.
