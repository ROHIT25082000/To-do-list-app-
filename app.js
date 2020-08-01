const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/todolistDB" , {useNewUrlParser:true, useUnifiedTopology: true});


app.use(bodyParser.urlencoded({extended : true}));

app.set("view engine","ejs");

app.use(express.static(__dirname+"/public"))

var item = [];

app.get("/" ,function(req, res){
    var option = {
        weekday : "long",
        day : "numeric",
        month : "long",
        year : "numeric",
    }
    var dateObj = new Date();
    var date = dateObj.toLocaleDateString("en-US",option);
    res.render("index", {item : item, date : date});
});

app.post("/", function(req , res){
    var myitem = req.body.itemadded;
    item.push(myitem);

    res.redirect("/");
});

app.listen(process.env.PORT || 3000 , function(req , res){
    console.log("server started at port 3000");
});

// sudo kill -9 `sudo lsof -t -i:3000