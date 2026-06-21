import fs from 'fs';
import path from 'path';
import pg from 'pg';

const password = 'Naseer@5727';

async function run() {
  // Use Supabase connection pooler (works on any network)
  const client = new pg.Client({
    host: 'db.dwevqvzpifjwgpjhrqad.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected via pooler!');

    const dir = path.resolve(__dirname, '../supabase');
    const files = ['001_schema.sql', '002_seed.sql', '003_rpc_deduct_stock.sql', '004_stock_movements.sql'];

    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
      console.log(`Running ${file}...`);
      await client.query(sql);
      console.log(`  ✅ ${file} done`);
    }

    console.log('\nAll migrations completed successfully!');
  } catch (err: any) {
    console.error('Failed:', err.message);
    console.log('\nPlease run SQL manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/dwevqvzpifjwgpjhrqad/sql/new');
    console.log('2. Copy SQL from backend/supabase/001_schema.sql into editor and Run');
    console.log('3. Then 002_seed.sql');
    console.log('4. Then 003_rpc_deduct_stock.sql');
  } finally {
    await client.end().catch(() => {});
  }
}

run();
