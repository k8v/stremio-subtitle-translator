const Queue = require('better-queue');
const processfiles = require("../processfiles");

const translationQueue = new Queue(async function (job, cb) {
    try {
        const { subs, imdbid, season, episode, oldisocode, provider, apikey } = job;

        console.log('Processando legenda:', subs);

        // Mantém exatamente como estava antes
        const result = await processfiles.startTranslation(
            subs,
            imdbid,
            season,
            episode,
            oldisocode,
            provider,
            apikey
        );

        cb(null, result);
    } catch (error) {
        console.error('Erro na fila:', error);
        cb(error);
    }
}, {
    concurrent: 1,  // Reduzindo para 1 processo por vez inicialmente
    maxRetries: 2,
    retryDelay: 3000
});

module.exports = translationQueue;
