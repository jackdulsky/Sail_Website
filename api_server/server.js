//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
var sql = require("mssql");
var app = express();

// Body Parser Middleware
//app.use(bodyParser.json(), express.static("public"));

//CORS Middleware
app.use(function(req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
  );
  next();
});

//Setting up server
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

//Initiallising connection string
var dbConfig = {
  user: "oakcms",
  password: "Needdata!",
  server: "oakdb03",
  database: "XOSAPI" // "contractsDB"
  //   options: {
  //     encrypt: true
  //   }
};

//Function to connect to database and execute query
var executeQuery = function(res, query) {
  sql.connect(dbConfig, function(err) {
    if (err) {
      console.log("Error while connecting database :- " + err);
      res.send(err);
    } else {
      // create Request object
      var request = new sql.Request();
      // query to the database
      request.query(query, function(err, res2) {
        if (err) {
          console.log("Error while querying database :- " + err);
          res.send(err);
        } else {
          res.send(res2);
        }
      });
    }
  });
};

//GET API
app.get("/api/:filters", function(req, res) {
  var query = "select top " + req.params.filters + " playerID from dbo.player";
  executeQuery(res, query);
});

//Bulk Import of Filter Options
// app.get("/api/filters/options", function(req, res) {
//   var query = ""; //get all the filter options
//   executeQuery(res, query);
// });

//Get Saved Settings
// app.get("/api/saved/settings/:user"),
//   function(req, res) {
//     var query = ""; // get settings based on user
//     executeQuery(res, query);
//   };

//getSubFolders
app.get("/about", function(req, res) {
  res.send("about");
});
app.get("/api/xos/subfolders/:folder", function(req, res) {
  // var query = "select top " + req.params.folder + " playerID from dbo.player";
  // executeQuery(res, query);

  var query = "exec spGetThunderFolderChildren '" + req.params.folder + "'";
  //res.send(query);
  executeQuery(res, query);
});

// //POST API
//  app.post("/api/user", function(req , res){
//                 var query = "INSERT INTO [user] (Name,Email,Password) VALUES (req.body.Name,req.body.Email,req.body.Password”);
//                 executeQuery (res, query);
// });

// //PUT API
//  app.put("/api/user/:id", function(req , res){
//                 var query = "UPDATE [user] SET Name= " + req.body.Name  +  " , Email=  " + req.body.Email + "  WHERE Id= " + req.params.id;
//                 executeQuery (res, query);
// });

// // DELETE API
//  app.delete("/api/user /:id", function(req , res){
//                 var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
//                 executeQuery (res, query);
// });
