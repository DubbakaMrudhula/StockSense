import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'root';
const dbName = process.env.DB_NAME || 'odoo_inventory';

async function runMigrations() {
  const isReset = process.argv.includes('--reset');
  console.log(`\n======================================================`);
  console.log(`  Odoo Inventory Migration Runner (Member 1 - Architect)`);
  console.log(`  Database: ${dbName} | Host: ${dbHost}:${dbPort}`);
  console.log(`======================================================\n`);

  // Step 1: Connect to MySQL server (without specifying DB first to create it if needed)
  const rootConn = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true
  });

  if (isReset) {
    console.log(`[Migrate] --reset flag detected: Dropping and recreating database ${dbName}...`);
    await rootConn.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
  }

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // Step 2: Connect to the database
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true
  });

  try {
    // Step 3: Ensure migrations tracker table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Fetch applied migrations
    const [appliedRows] = await connection.query('SELECT version FROM schema_migrations');
    const appliedVersions = new Set(appliedRows.map(r => r.version));

    // Step 4: Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedVersions.has(file)) {
        console.log(`  [SKIP] ${file} (already applied)`);
        continue;
      }

      console.log(`  [EXEC] Running migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      // Execute SQL script
      await connection.query(sqlContent);

      // Record in schema_migrations
      await connection.query(
        'INSERT INTO schema_migrations (version, description) VALUES (?, ?)',
        [file, `Applied migration ${file}`]
      );
      console.log(`  [DONE] ${file} applied successfully.`);
    }

    console.log('\n[Migrate] All migrations completed successfully!\n');
  } catch (error) {
    console.error('\n[Migrate ERROR]:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
