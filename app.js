const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/todolistDB" , {useNewUrlParser:true, useUnifiedTopology: true});

const workSchema = mongoose.Schema({
    name : {
        type : String
    }
});

const Work = mongoose.model("work",workSchema);

const work1 = new Work({
    name : "Welcome to To do"
});

const work2 = new Work({
    name : "hit + to add an item"
});

const work3 = new Work({
    name : "<-- to delete an item"
});

const ListSchema = mongoose.Schema({
    name : String , 
    items : [workSchema]
});

const List = mongoose.model("List",ListSchema);

var defaultList = [work1, work2, work3];

app.use(bodyParser.urlencoded({extended : true}));

app.set("view engine","ejs");

app.use(express.static(__dirname+"/public"))

app.get("/" ,function(req, res){
    var option = {
        weekday : "long",
        day : "numeric",
        month : "long",
        year : "numeric",
    }
    var dateObj = new Date();
    var date = dateObj.toLocaleDateString("en-US",option);
    Work.find({} ,function(err, arrayOfItems){
        if(arrayOfItems.length === 0){

            Work.insertMany(defaultList, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("The welcome message are inserted into the MongoDB!");
                }
            });
            res.redirect("/");
        }
        else {
            res.render("index", {item : arrayOfItems , date : date});
        }
    });
});

app.post("/", function(req , res){
    const myitem = req.body.itemadded;
    const newItem = new Work({
        name : myitem
    });

    newItem.save();

    res.redirect("/");
});

app.post("/delete" ,function(req , res){
    var condition = {
        _id : req.body.mycheckbox
    }
    Work.deleteOne(condition,function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log(req.body.mycheckbox+" deleted.");
        }
    });
    res.redirect("/");
});


app.get("/:listName", function(req , res){
    const myListName = req.params.listName;
    List.findOne({name : myListName},function(err ,founditem){
        if(err){
            console.log(err);
        }
        else {
            if(!founditem){
                const newList = new List({
                    name : myListName,
                    items : defaultList
                });
                newList.save();
                res.render("index", {date : founditem.name, item : founditem.items});
                res.redirect("/"+myListName);
            }
            else{
                res.redirect("/"+myListName);
            }
        }
    });
});

app.listen(process.env.PORT || 3000 , function(req , res){
    console.log("server started at port 3000");
});

// sudo kill -9 `sudo lsof -t -i:3000