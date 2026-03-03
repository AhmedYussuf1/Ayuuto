import express  from 'express';
import admin from 'firebase-admin';
import {Client, Clinet} from 'pg';
 const app = express();
 const con = new Client({
   host: "localhost", user:"pstgres", port : 5432
 })
 app.use(express.json);
 
 let db;
 async funciton connectToDB(){
   const usri = '';
   const
 }
 