const DatabaseFactory = require('./database/DatabaseFactory');

let dbAdapter = null;

// Inicializar conexão com o banco de dados
async function initializeDatabase() {
    if (!dbAdapter) {
        try {
            dbAdapter = await DatabaseFactory.createAndConnect();
            console.log('Database initialized successfully!');
        } catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }
    return dbAdapter;
}

// Obter instância do adapter
async function getAdapter() {
    if (!dbAdapter) {
        await initializeDatabase();
    }
    return dbAdapter;
}

// Métodos de conveniência que mantêm a compatibilidade com a API anterior
async function addToTranslationQueue(imdbid, season = null, episode = null, count, langcode) {
    const adapter = await getAdapter();
    return adapter.addToTranslationQueue(imdbid, season, episode, count, langcode);
}

async function deletetranslationQueue(imdbid, season = null, episode = null, langcode) {
    const adapter = await getAdapter();
    return adapter.deletetranslationQueue(imdbid, season, episode, langcode);
}

async function checkForTranslation(imdbid, season = null, episode = null, langcode) {
    const adapter = await getAdapter();
    return adapter.checkForTranslation(imdbid, season, episode, langcode);
}

async function checkseries(imdbid) {
    const adapter = await getAdapter();
    return adapter.checkseries(imdbid);
}

async function addseries(imdbid, type) {
    const adapter = await getAdapter();
    return adapter.addseries(imdbid, type);
}

async function getSubCount(imdbid, season, episode, langcode) {
    const adapter = await getAdapter();
    return adapter.getSubCount(imdbid, season, episode, langcode);
}

async function addsubtitle(imdbid, type, season = null, episode = null, path, langcode) {
    const adapter = await getAdapter();
    return adapter.addsubtitle(imdbid, type, season, episode, path, langcode);
}

async function getsubtitles(imdbid, season = null, episode = null, langcode) {
    const adapter = await getAdapter();
    return adapter.getsubtitles(imdbid, season, episode, langcode);
}

async function checksubtitle(imdbid, season = null, episode = null, subtitlepath, langcode) {
    const adapter = await getAdapter();
    return adapter.checksubtitle(imdbid, season, episode, subtitlepath, langcode);
}

// Função para fechar conexão
async function closeConnection() {
    if (dbAdapter) {
        await dbAdapter.disconnect();
        dbAdapter = null;
    }
}

// Inicializar automaticamente ao carregar o módulo
initializeDatabase().catch(console.error);

module.exports = {
    addToTranslationQueue,
    deletetranslationQueue,
    getSubCount,
    checkseries,
    addseries,
    addsubtitle,
    getsubtitles,
    checkForTranslation,
    checksubtitle,
    closeConnection,
    getAdapter
};
