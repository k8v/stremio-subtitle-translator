const {
  addonBuilder,
  serveHTTP,
  publishToCentral,
} = require("stremio-addon-sdk");
const opensubtitles = require("./opensubtitles");
const connection = require("./connection");
const languages = require("./languages");
const { createOrUpdateMessageSub } = require("./subtitles");
const translationQueue = require("./queues/translationQueue");
const baseLanguages = require("./langs/base.lang.json");
const isoCodeMapping = require("./langs/iso_code_mapping.json");
const fs = require("fs").promises; // Ajout de fs pour la manipulation de fichiers

require("dotenv").config();

function generateSubtitleUrl(
  targetLanguage,
  imdbid,
  season,
  episode,
  provider,
  baseUrl = process.env.BASE_URL
) {
  return `${baseUrl}/subtitles/${provider}/${targetLanguage}/${imdbid}/season${season}/${imdbid}-translated-${episode}-1.srt`;
}

// --- NOUVELLE FONCTION UTILITAIRE POUR VÉRIFIER LE FICHIER ---
/**
 * Vérifie si le fichier SRT existe localement et s'il contient le message d'attente.
 * @param {string} localFilePath - Le chemin absolu ou relatif du fichier SRT sur le disque.
 * @returns {Promise<boolean>} True si le fichier est un fichier de message temporaire et doit être supprimé.
 */
async function isTemporaryMessageFile(localFilePath) {
    const TEMP_MESSAGE = "Translating subtitles. Please wait 1 minute and try again.";
    
    // Le chemin d'accès statique commence à '/subtitles', on doit le compléter si nécessaire
    // Si votre serveur sert les fichiers depuis le répertoire 'subtitles' à la racine de votre projet:
    // const absolutePath = path.join(__dirname, localFilePath); // Si path est importé
    const absolutePath = `./${localFilePath}`; // Chemin relatif simple

    try {
        const content = await fs.readFile(absolutePath, 'utf8');
        // Vérification simple si le message est présent dans le contenu
        if (content.includes(TEMP_MESSAGE)) {
            console.log(`[File Check] Message temporaire trouvé dans ${localFilePath}.`);
            return true;
        }
        return false;
    } catch (error) {
        // Si le fichier n'existe pas, ou si lecture impossible, ce n'est pas un fichier temporaire (il est inexistant)
        return false;
    }
}

// --- FONCTION UTILITAIRE POUR OBTENIR LE CHEMIN LOCAL ---
function getLocalFilePath(
  targetLanguage,
  imdbid,
  season,
  episode,
  provider
) {
    // Cela doit correspondre au chemin que le serveur statique utilise
    // Par exemple, si serveHTTP a `static: "/subtitles"`, le chemin sur le disque est `subtitles/...`
    const filename = `${imdbid}-translated-${episode}-1.srt`;
    return `subtitles/${provider}/${targetLanguage}/${imdbid}/season${season}/${filename}`;
}
// ---------------------------------------------------------


const builder = new addonBuilder({
  id: "org.autotranslate.geanpn",
  version: "1.0.6", // Incrémentation de la version
  name: "Translate by k8v",
  logo: "./subtitles/Logo.png",
  resources: ["subtitles"], // Ajout pour garantir le Manifeste
  types: ["series", "movie"], // Ajout pour garantir le Manifeste
  configurable: true,
  behaviorHints: {
    configurable: true,
    configurationRequired: true,
  },
  config: [
    {
      key: "provider",
      title: "Provider",
      type: "select",
      required: true,
      options: ["Google Translate", "ChatGPT API"],
    },
    {
      key: "apikey",
      title: "ChatGPT API Key",
      type: "text",
      required: false,
      dependencies: [
        {
          key: "provider",
          value: ["ChatGPT API"],
        },
      ],
    },
    {
      key: "tmdb_apikey",
      // MISE À JOUR: Lien hypertexte intégré directement dans le titre
      title: 'TMDb API Key (Required for Gestdown Series) <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color: #63b3ed; text-decoration: underline;">API</a>',
      type: "text",
      required: true,
      // Suppression de addon_config_link
    },
    {
      key: "base_url",
      title: "ChatGPT API Base URL",
      type: "text",
      required: false,
      default: "https://api.openai.com/v1/responses",
      dependencies: [
        {
          key: "provider",
          value: ["ChatGPT API"],
        },
      ],
    },
    {
      key: "model_name",
      title: "ChatGPT API Model Name",
      type: "text",
      required: false,
      default: "gpt-4o-mini",
      dependencies: [
        {
          key: "provider",
          value: ["ChatGPT API"],
        },
      ],
    },
    {
      key: "translateto",
      title: "Translate to",
      type: "select",
      required: true,
      default: "English",
      options: baseLanguages,
    },
  ],
  description:
    "This addon takes subtitles from OpenSubtitlesV3, Wyzie, or Gestdown then translates into desired language using Google Translate, or ChatGPT (OpenAI Compatible Providers). Requires a TMDb API Key for reliable series subtitle retrieval via Gestdown.",
  catalogs: [],
  resources: ["subtitles"],
});

builder.defineSubtitlesHandler(async function (args) {
  console.log("Subtitle request received:", args);
  // Récupération de la clé TMDb de la configuration via destructuring
  const { id, config: { tmdb_apikey, ...config }, stream } = args;

  const targetLanguage = languages.getKeyFromValue(
    config.translateto,
    config.provider
  );

  if (!targetLanguage) {
    console.log("Unsupported language:", config.translateto);
    return Promise.resolve({ subtitles: [] });
  }

  // Extract imdbid from id
  let imdbid = null;
  if (id.startsWith("dcool-")) {
    imdbid = "tt5994346";
  } else if (id !== null && id.startsWith("tt")) {
    const parts = id.split(":");
    if (parts.length >= 1) {
      imdbid = parts[0];
    } else {
      console.log("Invalid ID format.");
    }
  }

  if (imdbid === null) {
    console.log("Invalid ID format.");
    return Promise.resolve({ subtitles: [] });
  }

  const { type, season = null, episode = null } = parseId(id);
  
  // --- NOUVELLE LOGIQUE DE VÉRIFICATION DU FICHIER TEMPORAIRE ---
  const localFilePath = getLocalFilePath(
    targetLanguage,
    imdbid,
    season,
    episode,
    config.provider
  );
  
  let shouldRerunTranslation = false;

  if (await isTemporaryMessageFile(localFilePath)) {
      console.log("[Rerun] Fichier temporaire détecté. Suppression et relance de la traduction.");
      shouldRerunTranslation = true;
      
      // Tenter de supprimer le fichier temporaire
      try {
          await fs.unlink(localFilePath);
          console.log(`[Rerun] Fichier temporaire supprimé: ${localFilePath}`);
      } catch (e) {
          console.warn(`[Rerun] Impossible de supprimer le fichier temporaire: ${localFilePath}`, e.message);
      }
      
      // On peut aussi supprimer l'entrée dans la base de données
      // Assurez-vous d'avoir une fonction `connection.deleteSubtitle` si vous voulez faire cela
      // try { await connection.deleteSubtitle(imdbid, season, episode, targetLanguage); } catch (e) { /* ignore */ }
  }
  // -------------------------------------------------------------


  try {
    // 1. Check if already exists in database (skip if we decided to rerun the translation)
    let existingSubtitle = [];
    if (!shouldRerunTranslation) {
        existingSubtitle = await connection.getsubtitles(
            imdbid,
            season,
            episode,
            targetLanguage
        );
    }
    
    // Si le sous-titre existe dans la DB et n'est PAS un fichier temporaire (ou si on n'a pas relancé la trad)
    if (existingSubtitle.length > 0) {
      console.log(
        "Subtitle found in database:",
        generateSubtitleUrl(
          targetLanguage,
          imdbid,
          season,
          episode,
          config.provider
        )
      );
      return Promise.resolve({
        subtitles: [
          {
            id: `${imdbid}-subtitle`,
            url: generateSubtitleUrl(
              targetLanguage,
              imdbid,
              season,
              episode,
              config.provider
            ),
            lang: `${targetLanguage}-translated`,
          },
        ],
      });
    }

    // 2. If not found, search OpenSubtitles
    // PASSAGE DE LA CLÉ TMDB ici
    const subs = await opensubtitles.getsubtitles(
      type,
      imdbid,
      season,
      episode,
      targetLanguage,
      tmdb_apikey
    );

    if (!subs || subs.length === 0) {
      // Si aucun sous-titre source n'est trouvé, on crée le message d'erreur
      await createOrUpdateMessageSub(
        "No subtitles found on OpenSubtitles or other sources",
        imdbid,
        season,
        episode,
        targetLanguage,
        config.provider
      );
      // et on retourne l'URL du fichier d'erreur/d'attente pour que l'utilisateur le voie
      return Promise.resolve({
        subtitles: [
          {
            id: `${imdbid}-subtitle`,
            url: generateSubtitleUrl(
              targetLanguage,
              imdbid,
              season,
              episode,
              config.provider
            ),
            lang: `${targetLanguage}-translated`,
          },
        ],
      });
    }

    const foundSubtitle = subs[0];

    const mappedFoundSubtitleLang = isoCodeMapping[foundSubtitle.lang] || foundSubtitle.lang;

    if (mappedFoundSubtitleLang === targetLanguage) {
      console.log(
        "Desired language subtitle found on source, returning it directly."
      );
      await connection.addsubtitle(
        imdbid,
        type,
        season,
        episode,
        foundSubtitle.url.replace(`${process.env.BASE_URL}/`, ""),
        targetLanguage
      );
      return Promise.resolve({
        subtitles: [
          {
            id: `${imdbid}-subtitle`,
            url: foundSubtitle.url,
            lang: foundSubtitle.lang,
          },
        ],
      });
    }

    console.log(
      "Subtitles found on source, but not in target language. Translating..."
    );

    // Si on arrive ici, on crée le message d'attente AVANT de lancer la file d'attente
    await createOrUpdateMessageSub(
      "Translating subtitles. Please wait 1 minute and try again.",
      imdbid,
      season,
      episode,
      targetLanguage,
      config.provider
    );

    // 3. Process and translate subtitles
    translationQueue.push({
      subs: [foundSubtitle], // Pass the found subtitle to the queue
      imdbid: imdbid,
      season: season,
      episode: episode,
      oldisocode: targetLanguage,
      provider: config.provider,
      apikey: config.apikey ?? null,
      base_url: config.base_url ?? "https://api.openai.com/v1/responses",
      model_name: config.model_name ?? "gpt-4o-mini",
    });

    console.log(
      "Subtitles processed",
      generateSubtitleUrl(
        targetLanguage,
        imdbid,
        season,
        episode,
        config.provider
      )
    );

    await connection.addsubtitle(
      imdbid,
      type,
      season,
      episode,
      generateSubtitleUrl(
        targetLanguage,
        imdbid,
        season,
        episode,
        config.provider
      ).replace(`${process.env.BASE_URL}/`, ""),
      targetLanguage
    );

    return Promise.resolve({
      subtitles: [
        {
          id: `${imdbid}-subtitle`,
          url: generateSubtitleUrl(
            targetLanguage,
            imdbid,
            season,
            episode,
            config.provider
          ),
          lang: `${targetLanguage}-translated`,
        },
      ],
    });
  } catch (error) {
    console.error("Error processing subtitles:", error);
    return Promise.resolve({ subtitles: [] });
  }
});

function parseId(id) {
  if (id.startsWith("tt")) {
    const match = id.match(/tt(\d+):(\d+):(\d+)/);
    if (match) {
      const [, , season, episode] = match;
      return {
        type: "series",
        season: Number(season),
        episode: Number(episode),
      };
    } else {
      return { type: "movie", season: 1, episode: 1 };
    }
  } else if (id.startsWith("dcool-")) {
    // New format: dcool-tomorrow-with-you::tomorrow-with-you-episode-1
    const match = id.match(/dcool-(.+)::(.+)-episode-(\d+)/);
    if (match) {
      const [, , title, episode] = match;
      return {
        type: "series",
        title: title,
        episode: Number(episode),
        season: 1, // Assuming season 1 for this format
      };
    }
  }
  return { type: "unknown", season: 0, episode: 0 };
}

// Comment out this line for local execution, uncomment for production deployment
// Cannot publish to central locally as there is no public IP, so it won't show up in the Stremio store

if (process.env.PUBLISH_IN_STREMIO_STORE == "TRUE") {
  publishToCentral(`http://${process.env.ADDRESS}/manifest.json`);
}

const port = process.env.PORT || 3000;
const address = process.env.ADDRESS || "0.0.0.0";

serveHTTP(builder.getInterface(), {
  cacheMaxAge: 10,
  port: port,
  address: address,
  static: "/subtitles",
})
  .then(() => {
    console.log(`Server started: http://${address}:${port}`);
    console.log(
      "Manifest available:",
      `http://${address}:${port}/manifest.json`
    );
  })
  .catch((error) => {
    console.error("Server startup error:", error);
  });
