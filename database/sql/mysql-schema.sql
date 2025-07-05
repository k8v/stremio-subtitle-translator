-- Criação das tabelas para MySQL
-- Execute este arquivo após criar o banco de dados

CREATE TABLE IF NOT EXISTS series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    series_imdbid VARCHAR(255) NOT NULL,
    series_type INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_series_imdbid (series_imdbid)
);

CREATE TABLE IF NOT EXISTS subtitle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    series_imdbid VARCHAR(255) NOT NULL,
    subtitle_type INT NOT NULL,
    subtitle_seasonno INT NULL,
    subtitle_episodeno INT NULL,
    subtitle_langcode VARCHAR(10) NOT NULL,
    subtitle_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_subtitle_imdbid (series_imdbid),
    INDEX idx_subtitle_season_episode (subtitle_seasonno, subtitle_episodeno),
    INDEX idx_subtitle_langcode (subtitle_langcode)
);

CREATE TABLE IF NOT EXISTS translation_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    series_imdbid VARCHAR(255) NOT NULL,
    series_seasonno INT NULL,
    series_episodeno INT NULL,
    subcount INT NOT NULL,
    langcode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_translation_queue_imdbid (series_imdbid),
    INDEX idx_translation_queue_season_episode (series_seasonno, series_episodeno),
    INDEX idx_translation_queue_langcode (langcode)
);

-- Comandos úteis para administração

-- Limpar fila de tradução
-- DELETE FROM translation_queue;

-- Ver estatísticas das tabelas
-- SELECT 
--     'series' as tabela, COUNT(*) as registros 
-- FROM series 
-- UNION ALL 
-- SELECT 
--     'subtitle' as tabela, COUNT(*) as registros 
-- FROM subtitle 
-- UNION ALL 
-- SELECT 
--     'translation_queue' as tabela, COUNT(*) as registros 
-- FROM translation_queue; 