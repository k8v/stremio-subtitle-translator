# SQLite - Informações

## Criação Automática

O SQLite não precisa de scripts de criação manual. As tabelas são criadas automaticamente quando o aplicativo é executado pela primeira vez.

## Localização do Banco

Por padrão, o arquivo do banco SQLite será criado em:
- `./data/database.db`

Você pode alterar o local configurando a variável `SQLITE_PATH` no arquivo `.env`.

## Estrutura das Tabelas

As tabelas criadas automaticamente são:

### series
```sql
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_imdbid TEXT NOT NULL,
    series_type INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### subtitle
```sql
CREATE TABLE IF NOT EXISTS subtitle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_imdbid TEXT NOT NULL,
    subtitle_type INTEGER NOT NULL,
    subtitle_seasonno INTEGER,
    subtitle_episodeno INTEGER,
    subtitle_langcode TEXT NOT NULL,
    subtitle_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### translation_queue
```sql
CREATE TABLE IF NOT EXISTS translation_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_imdbid TEXT NOT NULL,
    series_seasonno INTEGER,
    series_episodeno INTEGER,
    subcount INTEGER NOT NULL,
    langcode TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Comandos Úteis

Para visualizar o banco SQLite, você pode usar:

```bash
# Instalar sqlite3 (se não estiver instalado)
npm install -g sqlite3

# Abrir o banco
sqlite3 ./data/database.db

# Comandos no SQLite
.tables                    # Listar tabelas
.schema                    # Ver estrutura das tabelas
.quit                      # Sair

# Consultas úteis
SELECT COUNT(*) FROM series;
SELECT COUNT(*) FROM subtitle;
SELECT COUNT(*) FROM translation_queue;
```

## Vantagens do SQLite

- **Portabilidade**: Arquivo único que pode ser facilmente copiado/movido
- **Desenvolvimento**: Não requer instalação de servidor
- **Backup**: Simplesmente copie o arquivo .db
- **Performance**: Muito rápido para aplicações pequenas a médias 