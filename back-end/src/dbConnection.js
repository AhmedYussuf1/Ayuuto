  import pg from "pg";
const { Pool, Client } = pg;
  const pool = new Pool({
    host: "localhost",
  port: 5432,
  user: "postgres",
     password: "iskdiSldfjwe",
       database: "ayuuto_db",

});


pool.on("error", (err) => {
  console.error("PG Pool error:", err);
});
 
export default pool;
