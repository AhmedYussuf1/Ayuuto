import {Pool} from 'pg';
const p = new Pool({
      user: "your_user", // e.g., 'postgres'
  host: "localhost",
  database: "your_database_name",
  password: "your_password",
  port: 5432,
});


