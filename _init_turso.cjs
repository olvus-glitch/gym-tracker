const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const c = createClient({
  url: 'libsql://forja-olvus-glitch.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY2Mzg5NzEsImlkIjoiMDE5ZGE3ZTUtNDkwMS03NTNkLWE1ZmQtMmJhNmNmODc2NTA5IiwicmlkIjoiY2YxMzRiY2MtZjlmOC00YWU1LWI3ZTMtNWI2ZjBlNzYxZjQwIn0.FwAN0T_0h_v1DeAhYGrqlIdKmdWJgwUQ1blL3Er_B4NXqcD8sVKjS45WVBi5kpOF0nGkPcW09tJ67Mw-ZDvKAA',
});

async function init() {
  try {
    // Create tables
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
    console.log('Tables created OK');

    // Check if admin exists
    const result = await c.execute('SELECT COUNT(*) as count FROM users');
    const count = result.rows[0].count;
    console.log('Users count:', count);

    if (count === 0) {
      const hash = bcrypt.hashSync('#Polo2029', 12);
      await c.execute({
        sql: 'INSERT INTO users (id, nombre, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
        args: ['admin-default-id', 'AdminHR', 'apex6052@gmail.com', hash, 'admin'],
      });
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }

    // Verify login works
    const user = await c.execute({
      sql: 'SELECT id, email, password_hash FROM users WHERE email = ?',
      args: ['apex6052@gmail.com'],
    });
    console.log('User found:', user.rows[0]?.email);
    
    const valid = bcrypt.compareSync('#Polo2029', user.rows[0].password_hash);
    console.log('Password valid:', valid);

    console.log('\nDONE - Turso DB initialized successfully!');
  } catch (e) {
    console.error('ERROR:', e);
  }
}

init();
