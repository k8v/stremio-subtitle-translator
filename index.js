const {
  addonBuilder,
  serveHTTP,
  publishToCentral,
} = require("stremio-addon-sdk");
const opensubtitles = require("./opensubtitles");
const connection = require("./connection");
const languages = require("./languages");
const { createOrUpdateMessageSub } = require("./subtitles");
const translationQueue = require('./queues/translationQueue');
const baseLanguages = require('./langs/base.lang.json');
require('dotenv').config();

function generateSubtitleUrl(targetLanguage, imdbid, season, episode, provider, baseUrl = process.env.BASE_URL) {
    return `${baseUrl}/subtitles/${provider}/${targetLanguage}/${imdbid}/season${season}/${imdbid}-translated-${episode}-1.srt`;
}

const builder = new addonBuilder({
  id: "org.autotranslate.geanpn",
  version: "1.0.2",
  name: "Auto Subtitle Translate by geanpn",
  logo: "./subtitles/logo.png",
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
        options: ["google(free)", "deepl", "chatgpt"],
    },
    {
        key: "apikey",
        title: "API Key",
        type: "text",
        required: false,
        dependencies: [
            {
              key: "provider",
              value: ["deepl"]
            }
        ]
    },
    {
      key: "translateto",
      title: "Translate to",
      type: "select",
      required: true,
      options: baseLanguages
    }
  ],
  description:
    "This addon takes subtitles from OpenSubtitlesV3 then translates into desired language using Google Translate, Deepl or ChatGPT. For donations: https://www.buymeacoffee.com/sonsuzosman Bug report: geanpn@gmail.com",
  types: ["series", "movie"],
  catalogs: [],
  resources: ["subtitles"],
});

builder.defineSubtitlesHandler(async function (args) {
  console.log("Requisição de legendas recebida:", args);
  const { id, config } = args;

  const targetLanguage = languages.getKeyFromValue(config.translateto, config.provider);

  if (!targetLanguage) {
    console.log("Idioma não suportado:", config.translateto);
    return Promise.resolve({ subtitles: [] });
  }

  //Extract imdbid from id
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

  try {
    // 1. Primeiro verifica se já existe no banco
    const existingSubtitle = await connection.getsubtitles(imdbid, season, episode, targetLanguage);

    if (existingSubtitle.length > 0) {
        console.log('Legenda encontrada no banco de dados:', generateSubtitleUrl(targetLanguage, imdbid, season, episode, config.provider));
        return Promise.resolve({
            subtitles: [{
            id: `${imdbid}-subtitle`,
            url: generateSubtitleUrl(targetLanguage, imdbid, season, episode, config.provider),
            lang: `${targetLanguage}-translated`,
            }]
        });
    }

    // 2. Se não existe, busca no OpenSubtitles
    const subs = await opensubtitles.getsubtitles(type, imdbid, season, episode, targetLanguage);
    if (!subs || subs.length === 0) {
        await createOrUpdateMessageSub("Nenhuma legenda encontrada no OpenSubtitles",imdbid, season, episode, targetLanguage, config.provider);
        return Promise.resolve({
            subtitles: [{
            id: `${imdbid}-subtitle`,
            url: generateSubtitleUrl(targetLanguage, imdbid, season, episode, config.provider),
            lang: `${targetLanguage}-translated`,
            }]
        });
    }

    console.log('Legendas encontradas no OpenSubtitles')

    await createOrUpdateMessageSub("Sua legenda está sendo traduzida, aguarde 30 segundos e tente novamente.",imdbid, season, episode, targetLanguage, config.provider);

    // 3. Processa e traduz as legendas
    translationQueue.push({
        subs: subs,
        imdbid: imdbid,
        season: season,
        episode: episode,
        oldisocode: targetLanguage,
        provider: config.provider,
        apikey: config.apikey ?? null
    });

    console.log('Legendas processadas', generateSubtitleUrl(targetLanguage, imdbid, season, episode, config.provider));

    await connection.addsubtitle(
        imdbid,
        type,
        season,
        episode,
        generateSubtitleUrl(targetLanguage, imdbid, season, episode, config.provider).replace(`${process.env.BASE_URL}/`, ''),
        targetLanguage
    );



    return Promise.resolve({
        subtitles: [{
        id: `${imdbid}-subtitle`,
        url: generateSubtitleUrl(targetLanguage, imdbid, season, episode, config.provider),
        lang: `${targetLanguage}-translated`,
        }]
    });

  } catch (error) {
    console.error("Erro ao processar legendas:", error);
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
    // Novo formato: dcool-tomorrow-with-you::tomorrow-with-you-episode-1
    const match = id.match(/dcool-(.+)::(.+)-episode-(\d+)/);
    if (match) {
      const [, , title, episode] = match;
      return {
        type: "series",
        title: title,
        episode: Number(episode),
        season: 1 // Assumindo temporada 1 para este formato
      };
    }
  }
  return { type: "unknown", season: 0, episode: 0 };
}

//publishToCentral("https://stremioaddon.sonsuzanime.com/manifest.json");

const port = process.env.PORT || 3000;
const address = process.env.ADDRESS || "0.0.0.0";

serveHTTP(builder.getInterface(), {
  cacheMaxAge: 10,
  port: port,
  address: address,
  static: "/subtitles",
}).then(() => {
  console.log(`Servidor rodando em http://${address}:${port}`);
  console.log('Manifest disponível em:', `http://${address}:${port}/manifest.json`);
}).catch(error => {
  console.error('Erro ao iniciar servidor:', error);
});
