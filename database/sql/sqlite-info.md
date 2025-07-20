# SQLite - Information

## Auto Creation

SQLite does not require manual execution of creation scripts. Tables are automatically created when the application is first run.

## Database Location

By default, the SQLite database file is created at:

- `./data/database.db`

You can change the location by setting the `SQLITE_PATH` variable in the `.env` file.

## Table Structure

The automatically created tables are as follows:

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

## Useful Commands

To view the SQLite database, you can use the following commands:

```bash
# Install sqlite3 (if not already installed)
npm install -g sqlite3

# Open the database
sqlite3 ./data/database.db

# SQLite commands
.tables                    # List tables
.schema                    # Show table structure
.quit                      # Exit

# Useful queries
SELECT COUNT(*) FROM series;
SELECT COUNT(*) FROM subtitle;
SELECT COUNT(*) FROM translation_queue;
```

## Advantages of SQLite

- **Portability**: Single file easily copied/moved
- **Development**: No server installation required
- **Backup**: Just copy the .db file
- **Performance**: Very fast for small to medium applications
