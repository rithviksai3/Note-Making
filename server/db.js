const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/Onlinechat'

const connectToMongo = async()=>{
    try{
    mongoose.set("strictQuery",false);
    mongoose.connect(mongoURI);
    console.log("connected");
    }catch(error){
        console.log(error);}
};

module.exports = connectToMongo;