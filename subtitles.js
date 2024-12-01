const fs = require('fs').promises;

async function createOrUpdateMessageSub(placeholderText,imdbid, season = null, episode = null, oldisocode, provider){
    try {
        // Criar legenda placeholder antes de qualquer download
        let newSubtitleFilePath = null;

        if (season && episode) {
        newSubtitleFilePath = `subtitles/${provider}/${oldisocode}/${imdbid}/season${season}/${imdbid}-translated-${episode}-1.srt`;
        } else {
        newSubtitleFilePath = `subtitles/${provider}/${oldisocode}/${imdbid}/${imdbid}-translated-1.srt`;
        }

        // Criar estrutura básica da legenda placeholder
        const placeholderSub = [
        "1",
        "00:00:01,000 --> 00:10:50,000",
        placeholderText,
        ""
        ].join('\n');

        // Garantir que o diretório existe
        const dir = newSubtitleFilePath.substring(0, newSubtitleFilePath.lastIndexOf('/'));
        await fs.mkdir(dir, { recursive: true });

        // Criar arquivo  ou atualizar
        await fs.writeFile(newSubtitleFilePath, placeholderSub);
    } catch (error) {
        console.error("Erro ao criar ou atualizar legenda placeholder:", error);
        throw error;
    }
}

module.exports = { createOrUpdateMessageSub };
