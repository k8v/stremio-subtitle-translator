const DatabaseFactory = require('./database/DatabaseFactory');

// Requêtes de création de table
const createSubtitleTableQuery = `
  CREATE TABLE IF NOT EXISTS subtitle (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    series_imdbid VARCHAR(100) NOT NULL,
    subtitle_type INT NOT NULL,
    subtitle_seasonno INT NOT NULL,
    subtitle_episodeno INT NOT NULL,
    subtitle_langcode VARCHAR(10) NOT NULL,
    subtitle_path VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_subtitle (series_imdbid, subtitle_type, subtitle_seasonno, subtitle_episodeno, subtitle_langcode)
  );
`;

const createTranslationQueueTableQuery = `
  CREATE TABLE IF NOT EXISTS translation_queue (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    series_imdbid VARCHAR(100) NOT NULL,
    series_seasonno INT NOT NULL,
    series_episodeno INT NOT NULL,
    subcount INT NOT NULL,
    langcode VARCHAR(10) NOT NULL,
    UNIQUE KEY unique_translation (series_imdbid, series_seasonno, series_episodeno, langcode)
  );
`;

// NOUVELLE REQUÊTE : Création de la table 'series' manquante
const createSeriesTableQuery = `
  CREATE TABLE IF NOT EXISTS series (
    series_imdbid VARCHAR(100) NOT NULL PRIMARY KEY,
    series_type INT NOT NULL,
    UNIQUE KEY unique_series (series_imdbid)
  );
`;

let dbAdapter = null;

// Initialize database connection and create tables
async function initializeDatabase() {
    if (!dbAdapter) {
        try {
            // 1. Créer la connexion à la base de données.
            // On suppose que cette méthode retourne l'objet adaptateur complet.
            dbAdapter = await DatabaseFactory.createAndConnect();
            
            // SOLUTION V8: Nous supposons que l'adaptateur lui-même (dbAdapter) 
            // est l'objet qui expose la méthode query() pour les commandes DDL.
            const dbConnection = dbAdapter; // Utiliser directement l'adaptateur pour l'exécution des requêtes.

            console.log('Connected to MySQL!');

            // 2. EXÉCUTER LES REQUÊTES DDL pour créer les tables si elles n'existent pas
            
            // NOUVEAU: Création de la table 'series'
            await dbConnection.query(createSeriesTableQuery);
            console.log('Table "series" checked/created successfully.');
            
            await dbConnection.query(createSubtitleTableQuery);
            console.log('Table "subtitle" checked/created successfully.');

            await dbConnection.query(createTranslationQueueTableQuery);
            console.log('Table "translation_queue" checked/created successfully.');

            console.log('Database initialized successfully!');
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }
    return dbAdapter;
}

// Get adapter instance
async function getAdapter() {
    if (!dbAdapter) {
        await initializeDatabase();
    }
    return dbAdapter;
}

// Utility methods for backward API compatibility
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

// Function to close the connection
async function closeConnection() {
    if (dbAdapter) {
        await dbAdapter.disconnect();
        dbAdapter = null;
    }
}

// Automatically initialize on module load
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
