const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

mongoose.connect("mongodb://localhost:27017/todolistDB" , {useNewUrlParser:true, useUnifiedTopology: true});

const workSchema = mongoose.Schema({    // list item schema 
    name : {
        type : String
    }
});

const Work = mongoose.model("work",workSchema); // list item work

const work1 = new Work({                // welcome messages 
    name : "Welcome to To do"
});

const work2 = new Work({            // welcome messages
    name : "hit + to add an item"
});

const work3 = new Work({            // welcome messages
    name : "<-- to delete an item"
});

const ListSchema = mongoose.Schema({ // List Schema 
    name : String , 
    items : [workSchema]
});

const List = mongoose.model("List",ListSchema);

var defaultList = [work1, work2, work3];

app.use(bodyParser.urlencoded({extended : true}));

app.set("view engine","ejs");

app.use(express.static(__dirname+"/public"))

app.get("/" ,function(req, res){
    var date = getDateAndDay();
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

app.get("/:listname",function(req, res){
    const listName = _.capitalize(req.params.listname);
    const condition = {
        name : listName
    }
    List.findOne(condition,function(err , foundList){
        if(!err){
            if(!foundList){
                const newList = new List({
                    name : listName,
                    items : defaultList
                });
                newList.save();
                res.redirect("/"+listName);
            }
            else{
                res.render("index",{item : foundList.items , date : foundList.name});
            }
        }
    });

});

app.post("/", function(req , res){
    const myitem = req.body.itemadded;
    const listName = req.body.submit_button;

    console.log(listName);

    const newItem = new Work({
        name : myitem
    });
    
    const date = getDateAndDay();
    
    if(date === listName){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name : listName},function(err, foundList){
            if(err){
                console.log(err);
            }
            else{
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/"+listName);
            }
        });
    }
});

app.post("/delete" ,function(req , res){

    const listName = _.capitalize(req.body.myhiddenInput);
    const itemtoDelete = req.body.mycheckbox;
    const day = getDateAndDay();

    if(day === listName){
        Work.deleteOne({_id : req.body.mycheckbox},function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log(req.body.mycheckbox+" deleted.");
            }
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : itemtoDelete}}},function(err, foundList){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/"+listName);
            }
        });
    }
});




app.listen(process.env.PORT || 5000 , function(req , res){
    console.log("server started at port 5000");
});

// sudo kill -9 `sudo lsof -t -i:3000

function getDateAndDay(){
    const options = {
        weekday : "long",
        day : "numeric",
        month : "long",
        year : "numeric",
    }
    const dateObj = new Date();
    return dateObj.toLocaleDateString("en-US", options);
}