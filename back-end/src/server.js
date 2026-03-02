import express  from 'express';
 const app = express();
 app.use(express.json);
  app.get( '/hello', function(req, res){
    res.send("HELLO!");

 });

 app.post('/hello', function (req, res){
req.send("HELLO FRO POST" + req.body.name) });
 app.listen(8000, function(){
    console.log("server is listening to port 8000");
    
 });