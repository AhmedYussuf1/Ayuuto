  import pg from "pg";
const { Pool, Client } = pg;
  const p = new Pool({
    host: "localhost",
  port: 5432,
  user: "postgres",
     password: "iskdiSldfjwe",
       database: "ayuuto_db",

});


p.on("error", (err) => {
  console.error("PG Pool error:", err);
});
 
export default p;
