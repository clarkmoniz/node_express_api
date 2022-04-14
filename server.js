var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var routes = require('./routes')

app.use(bodyParser.json({extended:true}));
routes(app);



app.listen(3000, () => {
 console.log("Server running on port 3000");
});