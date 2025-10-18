const axios = require("axios");
const fs = require("fs").promises;

// URLs de base des fournisseurs de sous-titres
const opensubtitlesbaseurl = "https://opensubtitles-v3.strem.io/subtitles/";
const wyziebaseurl = "https://sub.wyzie.ru/";
// L'URL de Gestdown est retirée temporairement.

const isoCodeMapping = require("./langs/iso_code_mapping.json");

// --- FONCTIONS UTILITAIRES ---

/**
 * Convertit un code de langue en code ISO 639-1 (2 lettres).
 * Utile pour les API qui préfèrent les codes à 2 lettres (comme Wyzie).
 * @param {string} code - Code de langue.
 * @returns {string} Code de langue à deux lettres.
 */
function to2LetterCode(code) {
    if (code.length === 2) return code;
    // Mappage simplifié (pour les codes 3 lettres non gérés par isoCodeMapping)
    const mapping = {
        'eng': 'en', 'fra': 'fr', 'spa': 'es', 'deu': 'de',
        'jpn': 'ja', 'kor': 'ko', 'por': 'pt'
    };
    return mapping[code] || code.substring(0, 2);
}

// --- FONCTIONS DE RECHERCHE SPÉCIFIQUES AUX SOURCES ---

/**
 * Recherche des sous-titres via l'API Wyzie.
 * @param {string} imdbId - ID IMDB du contenu.
 * @param {string} langCode - Code de langue ISO 639-1 (2 lettres).
 * @returns {Promise<{url: string, lang: string} | null>} L'objet sous-titre Wyzie ou null.
 */
async function findSubtitleUrlsWyzie(imdbId, langCode) {
    const finalLangCode = to2LetterCode(langCode);
    const url = `${wyziebaseurl}search?id=${imdbId}&format=srt&language=${finalLangCode}`;
    
    try {
        console.log(`Searching Wyzie for ${finalLangCode} subtitles with URL: ${url}`);
        
        const response = await axios.get(url, {
            timeout: 5000 
        });

        const results = Array.isArray(response.data) ? response.data : response.data.data;

        if (results && results.length > 0) {
            console.log(`Wyzie API response for ${finalLangCode}: Found ${results.length} results.`);
            // Wyzie peut retourner des codes 2 lettres ou 3 lettres. On normalise la sortie pour notre usage.
            const subtitle = results[0];
            const finalLang = subtitle.language.length === 2 ? subtitle.language + 'g' : subtitle.language;
            return { 
                url: subtitle.url, 
                lang: finalLang 
            };
        }
    } catch (error) {
        console.error(`Wyzie search failed for IMDB ID ${imdbId} and lang ${finalLangCode}: ${error.message}`);
    }
    
    return null;
}

// La fonction findSubtitleUrlsGestdown est retirée.


// --- FONCTIONS DE TÉLÉCHARGEMENT ---

const downloadSubtitles = async (
  subtitles,
  imdbid,
  season = null,
  episode = null,
  oldisocode
) => {
  let uniqueTempFolder = null;
  // Déterminer le chemin de sauvegarde local
  if (season && episode) {
    await fs.mkdir(`subtitles/${oldisocode}/${imdbid}/season${season}`, {
      recursive: true,
    });
    uniqueTempFolder = `subtitles/${oldisocode}/${imdbid}/season${season}`;
  } else {
    await fs.mkdir(`subtitles/${oldisocode}/${imdbid}`, { recursive: true });
    uniqueTempFolder = `subtitles/${oldisocode}/${imdbid}`;
  }

  let filepaths = [];

  for (let i = 0; i < subtitles.length; i++) {
    const url = subtitles[i].url;
    try {
      console.log(`Attempting to download subtitle from: ${url}`);
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const subtitleData = response.data;

      // VÉRIFICATION: Vérifier si les données de sous-titres ne sont pas vides
      if (!subtitleData || subtitleData.length === 0) {
        console.warn(`Subtitle file from ${url} was empty or corrupted. Skipping.`);
        continue; 
      }

      let filePath = null;
      // Nommage du fichier
      if (episode) {
        filePath = `${uniqueTempFolder}/${imdbid}-subtitle_${episode}-${
          i + 1
        }.srt`;
      } else {
        filePath = `${uniqueTempFolder}/${imdbid}-subtitle-${i + 1}.srt`;
      }
      console.log(`Saving subtitle to: ${filePath}`);
      await fs.writeFile(filePath, subtitleData);
      console.log(`Subtitle downloaded and saved: ${filePath}`);
      filepaths.push(filePath);
    } catch (error) {
      console.error(`Subtitle download error for URL ${url}: ${error.message}`);
    }
  }
  
  // Si le téléchargement a échoué pour tous les sous-titres
  if (filepaths.length === 0 && subtitles.length > 0) {
     throw new Error("Failed to download any valid subtitle files for translation.");
  }
  
  return filepaths;
};

// --- FONCTION PRINCIPALE DE RECHERCHE ---

const getsubtitles = async (
  type,
  imdbid,
  season = null,
  episode = null,
  newisocode // La langue cible de la traduction (ex: 'yi', 'fr')
) => {
  // CONSTRUIRE L'ENDPOINT RELATIF pour OSV3
  let endpoint = '';
  if (type === "series" && season && episode) {
    endpoint = `${type}/${imdbid}:${season}:${episode}.json`;
  } else {
    endpoint = `${type}/${imdbid}.json`;
  }
  
  const url = new URL(endpoint, opensubtitlesbaseurl).toString();

  // Le bloc de test forcé est retiré.

  // Helper pour trouver les sous-titres dans la liste de OSV3
  const findSubtitleInList = (subtitles, langCode) => {
    return subtitles.find((subtitle) => {
      const mappedLang = isoCodeMapping[subtitle.lang] || subtitle.lang;
      return mappedLang === langCode;
    });
  };

  let subtitlesFromOSV3 = [];
  try {
    const response = await axios.get(url);
    subtitlesFromOSV3 = response.data.subtitles || []; 
  } catch(error) {
    console.warn("Error fetching subtitles from OpenSubtitles V3. Falling back to other sources directly.", error.message);
    // Si OSV3 échoue totalement, nous continuons en utilisant les autres sources
  }


  // 1. Priorité: OpenSubtitles (OSV3)
  
  // 1a. Langue Cible
  const targetLangSubtitleOSV3 = findSubtitleInList(subtitlesFromOSV3, newisocode);
  if (targetLangSubtitleOSV3) {
    console.log(`OSV3 found the target language subtitle (${newisocode}).`);
    return [{ url: targetLangSubtitleOSV3.url, lang: targetLangSubtitleOSV3.lang }];
  }

  // 1b. Anglais (Source de traduction privilégiée)
  const englishSubtitleOSV3 = findSubtitleInList(subtitlesFromOSV3, 'en');
  if (englishSubtitleOSV3) {
    console.log('OSV3 found an English subtitle (source).');
    return [{ url: englishSubtitleOSV3.url, lang: englishSubtitleOSV3.lang }];
  }
  
  // 2. SECONDE CHANCE: Wyzie
  
  // 2a. Wyzie - Langue Cible
  let wyzieTargetSubtitle = await findSubtitleUrlsWyzie(imdbid, newisocode);
  if (wyzieTargetSubtitle) {
      console.log(`Wyzie found the target language subtitle (${newisocode}).`);
      return [wyzieTargetSubtitle];
  }
  
  // 2b. Wyzie - Anglais (Source)
  let wyzieEnglishSubtitle = await findSubtitleUrlsWyzie(imdbid, 'en');
  if (wyzieEnglishSubtitle) {
      console.log('Wyzie found an English subtitle (source).');
      return [wyzieEnglishSubtitle];
  }

  // 3. ULTIME RECOURS: Si rien n'a été trouvé, on prend le premier sous-titre de n'importe quelle langue trouvé sur OSV3 (si disponible)
  if (subtitlesFromOSV3.length > 0) {
      const firstAvailableSubtitle = subtitlesFromOSV3[0];
      console.log(`OSV3 returned a subtitle in a different language (${firstAvailableSubtitle.lang}) as last resort.`);
      return [{ url: firstAvailableSubtitle.url, lang: firstAvailableSubtitle.lang }];
  }
  
  console.log('No subtitles found on any source.');
  return null;
};

module.exports = { getsubtitles, downloadSubtitles };
