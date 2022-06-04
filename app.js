const express = require("express");
const app = express();
require("dotenv").config();

//below belong to DataBase conn and models
const sequelize = require("./config/dbconn")
const User = require("./model/user");
//
const Routers = require("./routes/index");
const port = process.env.PORT || 8080;


app.use(express.json()); //to get the data from user and tell the server that data is in json formate
app.use(Routers)
app.use(express.static('public')); //to make public folder static consist of css,pictures,js etc

sequelize.sync()  //.sync() method create tables in database

app.listen(port, () =>{
    console.log("Server runnning on port "+port)
})