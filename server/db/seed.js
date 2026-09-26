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

async function seedData() {
  console.log(`\n======================================================`);
  console.log(`  Odoo Inventory Seed Data Loader (Member 1 - Architect)`);
  console.log(`  Database: ${dbName}`);
  console.log(`======================================================\n`);

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    multipleStatements: true
  });

  try {
    const seedFile = path.join(__dirname, 'migrations', '003_seed_data.sql');
    if (!fs.existsSync(seedFile)) {
      throw new Error(`Seed file not found at ${seedFile}`);
    }

    console.log(`  [SEED] Executing ${seedFile}...`);
    const sql = fs.readFileSync(seedFile, 'utf8');
    await connection.query(sql);

    // Verify stats
    const [[{ prodCount }]] = await connection.query('SELECT COUNT(*) AS prodCount FROM products');
    const [[{ catCount }]] = await connection.query('SELECT COUNT(*) AS catCount FROM categories');
    const [[{ locCount }]] = await connection.query('SELECT COUNT(*) AS locCount FROM locations');
    const [[{ quantCount }]] = await connection.query('SELECT COUNT(*) AS quantCount FROM stock_quants');
    const [statusCounts] = await connection.query(`
      SELECT stock_status, COUNT(*) as count 
      FROM view_product_stock_summary 
      GROUP BY stock_status
    `);

    console.log(`  [SUCCESS] Enterprise Seed Data loaded:`);
    console.log(`    - Categories: ${catCount}`);
    console.log(`    - Locations:  ${locCount}`);
    console.log(`    - Products:   ${prodCount}`);
    console.log(`    - Stock Quants: ${quantCount}`);
    console.log(`    - Breakdown by Stock Status:`);
    statusCounts.forEach(s => {
      console.log(`       * ${s.stock_status.toUpperCase()}: ${s.count} products`);
    });

    console.log('\n[Seed] Complete. Ready for team testing!\n');
  } catch (err) {
    console.error('[Seed ERROR]:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
