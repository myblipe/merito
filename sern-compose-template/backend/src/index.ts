import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sql from "mssql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const config = {
  server: "testserverforstudent.database.windows.net",
  database: "test",
  user: "pgsql",
  password: "TWOJE_HASLO",
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

let pool: sql.ConnectionPool;

async function initDb() {
  pool = await sql.connect(config);
  console.log("Połączono z Azure SQL");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("/api/users", async (req, res) => {
  const result = await pool.request().query("SELECT * FROM users");
  res.json(result.recordset);
});

app.post("/api/users", async (req, res) => {
  const { name } = req.body;
  await pool.request()
    .input("name", sql.NVarChar, name)
    .query("INSERT INTO users (name) VALUES (@name)");
  res.json({ success: true });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
