import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  await client.connect();
  console.log("✅ Database connected successfully");

  const result = await client.query("SELECT version()");
  console.log(result.rows[0]);

  await client.end();
} catch (error) {
  console.error("❌ Database connection failed");
  console.error(error);
}