import { createClient, type Client, type InValue } from '@libsql/client';
import bcrypt from 'bcryptjs';

// Wrapper que unifica la API sincrona de better-sqlite3 con la async de Turso.
// Las API routes usan este wrapper a traves de getDb().

export interface DbRow {
  [key: string]: unknown;
}

export interface DbWrapper {
  execute(sql: string, args?: InValue[]): Promise<DbRow[]>;
  executeOne(sql: string, args?: InValue[]): Promise<DbRow | null>;
  run(sql: string, args?: InValue[]): Promise<void>;
  batch(statements: { sql: string; args?: InValue[] }[]): Promise<void>;
}

let client: Client | null = null;
let initialized = false;

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url) {
      // Produccion: Turso cloud
      client = createClient({ url, authToken });
    } else {
      // Desarrollo local: SQLite file via libsql
      client = createClient({ url: 'file:gym-tracker.db' });
    }
  }
  return client;
}

async function initializeDb(c: Client) {
  if (initialized) return;
  initialized = true;

  await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sesiones (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      dia_del_anio INTEGER NOT NULL,
      semana_iso INTEGER NOT NULL,
      anio_iso INTEGER NOT NULL,
      ejercicios TEXT NOT NULL DEFAULT '[]',
      completada INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_sesiones_user_fecha ON sesiones(user_id, fecha);

    CREATE TABLE IF NOT EXISTS plantillas (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      dias TEXT NOT NULL DEFAULT '{}',
      es_predefinida INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS registros_peso (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      peso REAL NOT NULL,
      unidad TEXT NOT NULL DEFAULT 'kg',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_peso_user_fecha ON registros_peso(user_id, fecha);

    CREATE TABLE IF NOT EXISTS rutinas_compartidas (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      ejercicios TEXT NOT NULL DEFAULT '[]',
      nombre_rutina TEXT NOT NULL,
      creada_en TEXT NOT NULL,
      expira_en TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed admin user if no users exist
  const result = await c.execute('SELECT COUNT(*) as count FROM users');
  const count = result.rows[0]?.count as number;
  if (count === 0) {
    const hash = bcrypt.hashSync('#Polo2029', 12);
    await c.execute({
      sql: 'INSERT INTO users (id, nombre, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      args: ['admin-default-id', 'AdminHR', 'apex6052@gmail.com', hash, 'admin'],
    });
  }
}

export async function getDb(): Promise<DbWrapper> {
  const c = getClient();
  await initializeDb(c);

  async function execute(sql: string, args?: InValue[]): Promise<DbRow[]> {
    const result = await c.execute({ sql, args: args || [] });
    return result.rows.map((row) => {
      const obj: DbRow = {};
      for (const col of result.columns) {
        obj[col] = row[col as keyof typeof row];
      }
      return obj;
    });
  }

  return {
    execute,

    async executeOne(sql: string, args?: InValue[]): Promise<DbRow | null> {
      const rows = await execute(sql, args);
      return rows[0] || null;
    },

    async run(sql: string, args?: InValue[]): Promise<void> {
      await c.execute({ sql, args: args || [] });
    },

    async batch(statements: { sql: string; args?: InValue[] }[]): Promise<void> {
      await c.batch(
        statements.map((s) => ({ sql: s.sql, args: s.args || [] })),
        'write'
      );
    },
  };
}
