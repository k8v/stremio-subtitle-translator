# Auto Subtitle Translate Add-on for Stremio

A Stremio add-on that automatically translates subtitles from OpenSubtitles into your desired language using various translation providers.


## Features

- Fetches subtitles from OpenSubtitlesV3
- Supports multiple translation providers:
  - Google Translate (free)
  - DeepL
  - ChatGPT
- Configurable target language
- Queue system for handling translation requests
- Caches translated subtitles for better performance

## How it Works

The add-on follows this workflow:

1. Receives subtitle request from Stremio
2. Checks if translated subtitle already exists in database
3. If not found, fetches subtitle from OpenSubtitles
4. Queues the subtitle for translation
5. Returns a placeholder message while translation is processing
6. Saves translated subtitle once complete

## Configuration

The add-on can be configured through Stremio with these options:

- Provider: Choose between Google Translate (free), DeepL, or ChatGPT
- API Key: Required for DeepL integration
- Target Language: Select your desired translation language

## Technical Details

- Built with Node.js
- Uses `stremio-addon-sdk` for Stremio integration
- Implements queue system using `better-queue`
- Stores subtitles in local filesystem
- Environment variables for configuration

## Installation

1. Web Installation (Recommended)
   - Open Stremio
   - Go to: in construction
   - Click "Install Add-on"
   - Select your preferred translation settings
   - Click "Install"
   - The add-on will be automatically configured in your Stremio

2. Manual Installation
   - Open Stremio
   - Go to Add-ons
   - Click the "Community Add-ons" tab
   - Paste this URL: in construction
   - Click "Install"

3. Self-Hosting
   ```bash
   # Clone the repository
   git clone https://github.com/HimAndRobot/stremio-translate-subtitle-by-geanpn.git
   cd stremio-auto-translate

   # Install dependencies
   npm install

   # Create .env file with required settings
   PORT=3000
   ADDRESS=0.0.0.0
   BASE_URL=http://localhost:3000

   # Start the add-on
   npm start
   ```
   Then add `http://localhost:3000/manifest.json` to Stremio


The add-on will be available at `http://localhost:3000`

## Environment Variables

- `PORT`: Server port (default: 3000)
- `ADDRESS`: Server address (default: 0.0.0.0)
- `BASE_URL`: Base URL for subtitle files

## Technical Details

### Queue System
The add-on uses a queue system to handle translation requests efficiently:
- Implements `better-queue` for managing translation tasks
- Concurrent processing of subtitles
- Automatic retries on failure
- Progress tracking and status updates

### Storage
- Subtitles are stored in the local filesystem
- Organized by provider, language, and media ID
- Cached translations for improved performance

### Translation Process
1. Subtitle files are parsed and split into chunks
2. Each chunk is translated using the selected provider
3. Translated chunks are reassembled maintaining timing
4. Final subtitle file is saved in SRT format

## Contributing

Bug reports and pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Support

For bug reports: geanpn@gmail.com
For donations:

## License

[MIT](https://choosealicense.com/licenses/mit/)
