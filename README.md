# 🇫🇷 Stremio Subtitle Translator

Bienvenue sur le dépôt de l'addon Stremio Subtitle Translator, qui utilise un puissant modèle de langage (LLM) pour fournir des sous-titres traduits dans n'importe quelle langue.

Cet addon est conçu pour :

1. **Prioriser** les sous-titres natifs.

2. **Traduire** à la volée en utilisant une source fiable (Anglais).

3. **Mettre en cache** les traductions pour une réutilisation immédiate.

## 🚀 Logique de Recherche et de Traduction (Stratégie en 8 Étapes)

Pour offrir la meilleure expérience possible, notre add-on utilise une **stratégie de recherche en 8 étapes** hautement optimisée. Cette logique garantit que nous privilégions toujours la langue cible native si disponible, et si la traduction est nécessaire, nous choisissons la source (généralement l'anglais) de la plus haute qualité.

Notre objectif principal est de trouver le sous-titre de la plus haute qualité disponible, en hiérarchisant les fournisseurs et les langues.

### Phase 1 : Retour Immédiat (Langue Cible)

Nous tentons d'abord de trouver directement le sous-titre dans la langue demandée par l'utilisateur (ex: Français, Allemand, etc.). Si l'une de ces étapes est réussie, le sous-titre est retourné **immédiatement** sans traduction.

| Étape | Fournisseur | Contenu | Langue recherchée | Résultat | 
| ----- | ----- | ----- | ----- | ----- | 
| **1** | **Gestdown** | Séries seulement | Langue Cible (ex: `fr`) | **Succès :** Sous-titre natif retourné. | 
| **2** | **OpenSubtitles V3 (OSV3)** | Films & Séries | Langue Cible | **Succès :** Sous-titre natif retourné. | 
| **3** | **Wyzie** | Films & Séries | Langue Cible | **Succès :** Sous-titre natif retourné. | 

### Phase 2 : Traduction Prioritaire (Langue Source Anglaise)

Si la langue cible n'est pas disponible, nous recherchons un sous-titre en **Anglais (`ENG`)**, car il est la source de traduction la plus fiable. Si l'une de ces étapes est réussie, le sous-titre est téléchargé et **traduit** avant d'être renvoyé à Stremio.

| Étape | Fournisseur | Contenu | Langue recherchée | Résultat | 
| ----- | ----- | ----- | ----- | ----- | 
| **4** | **Gestdown** | Séries seulement | Anglais (`eng`) | **Succès :** Sous-titre Anglais trouvé et traduit. | 
| **5** | **OpenSubtitles V3 (OSV3)** | Films & Séries | Anglais (`eng`) | **Succès :** Sous-titre Anglais trouvé et traduit. | 
| **6** | **Wyzie** | Films & Séries | Anglais (`eng`) | **Succès :** Sous-titre Anglais trouvé et traduit. | 

### Phase 3 : Traduction de Dernier Recours (Première Langue)

Si même la source anglaise est introuvable, nous prenons le **tout premier sous-titre de n'importe quelle langue** disponible. Bien que la qualité de la traduction puisse varier, cela garantit que l'utilisateur reçoit quelque chose plutôt que rien.

| Étape | Fournisseur | Contenu | Langue recherchée | Résultat | 
| ----- | ----- | ----- | ----- | ----- | 
| **7** | **OpenSubtitles V3 (OSV3)** | Films & Séries | Première langue disponible | **Succès :** Sous-titre trouvé (langue inconnue) et traduit. | 
| **8** | **Wyzie** | Films & Séries | Première langue disponible | **Succès :** Sous-titre trouvé (langue inconnue) et traduit. | 

Si toutes les 8 étapes échouent, aucun sous-titre n'est retourné.

*Note : Cette documentation est en cours de développement. Référez-vous aux logs et au code pour la configuration des clés API (OpenAI/Gemini, OpenSubtitles V3, etc.)*

# 
# 🇬🇧 Stremio Subtitle Translator

Welcome to the Stremio Subtitle Translator addon repository. This addon utilizes a powerful Large Language Model (LLM) to provide translated subtitles in any language.

This addon is designed to:

1. **Prioritize** native language subtitles.

2. **Translate** on the fly using a reliable source (English).

3. **Cache** translations for immediate reuse.

## 🚀 Search and Translation Logic (8-Step Strategy)

To offer the best possible experience, our addon uses a highly optimized **8-step search strategy**. This logic ensures that we always prioritize the native target language if available, and if translation is necessary, we select the highest quality source (typically English).

Our main goal is to find the highest quality available subtitle, prioritizing providers and languages.

### Phase 1: Immediate Return (Target Language)

We first attempt to find the subtitle directly in the language requested by the user (e.g., French, German, etc.). If any of these steps succeed, the subtitle is returned **immediately** without translation.

| Step | Provider | Content | Language Searched | Result | 
| ----- | ----- | ----- | ----- | ----- | 
| **1** | **Gestdown** | Series only | Target Language (e.g., `fr`) | **Success:** Native subtitle returned. | 
| **2** | **OpenSubtitles V3 (OSV3)** | Movies & Series | Target Language | **Success:** Native subtitle returned. | 
| **3** | **Wyzie** | Movies & Series | Target Language | **Success:** Native subtitle returned. | 

### Phase 2: Priority Translation (English Source Language)

If the target language is unavailable, we search for a subtitle in **English (`ENG`)**, as it is the most reliable translation source. If any of these steps succeed, the subtitle is downloaded and **translated** before being sent back to Stremio.

| Step | Provider | Content | Language Searched | Result | 
| ----- | ----- | ----- | ----- | ----- | 
| **4** | **Gestdown** | Series only | English (`eng`) | **Success:** English subtitle found and translated. | 
| **5** | **OpenSubtitles V3 (OSV3)** | Movies & Series | English (`eng`) | **Success:** English subtitle found and translated. | 
| **6** | **Wyzie** | Movies & Series | English (`eng`) | **Success:** English subtitle found and translated. | 

### Phase 3: Last Resort Translation (First Language)

If even the English source cannot be found, we take the **very first subtitle in any language** that is available. Although the translation quality may vary, this ensures the user receives something rather than nothing.

| Step | Provider | Content | Language Searched | Result | 
| ----- | ----- | ----- | ----- | ----- | 
| **7** | **OpenSubtitles V3 (OSV3)** | Movies & Series | First available language | **Success:** Subtitle found (unknown language) and translated. | 
| **8** | **Wyzie** | Movies & Series | First available language | **Success:** Subtitle found (unknown language) and translated. | 

If all 8 steps fail, no subtitle is returned.

*Note: This documentation is under development. Refer to the logs and code for API key configuration (OpenAI/Gemini, OpenSubtitles V3, etc.)*

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
