const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require('../models/urlModel');
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    19566,
  "redis-19566.c299.asia-northeast1-1.gce.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("KapxrGevTznIqHFO7XKWScke4s9HqsNZ", function (err) {
  if (err) throw err;
});
redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//Connection setup for redis
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = (val) =>{
    if(typeof val === "undefined" || typeof val === null )return false;
    if(typeof val === "string" && val.trim().length === 0)return false;
    return true;
}
const isValidRequestBody = (requestBody) =>{
    return Object.keys(requestBody).length > 0
}
const createUrl = async function (req, res){
    try{
    const baseUrl = 'http:localhost:3000'
     let longUrl = req.body.longUrl
     let longUrlExist = await GET_ASYNC(`${longUrl}`)
     if(longUrlExist){
         let copy = JSON.parse(longUrlExist)
         console.log("from cache")
         return res.status(201).send({status:true,data:copy})
     }
     if(!isValidRequestBody(req.body)){
         return res.status(400).send({status:false,message:'Invalid request body'})
     }
     if(!isValid(longUrl)){
        return res.status(400).send({status:false, message: 'Please provide longUrl'})
     }
     if(!validUrl.isUri(longUrl)){
        return res.status(400).send({status:false, message: 'Invalid longUrl'})
    }
    if(!validUrl.isUri(baseUrl)){
        return res.status(400).send({status:false, message: 'Invalid baseUrl'})
    }
    
    const urlCode = shortid.generate().toLowerCase()
    const shortUrl = baseUrl + '/' + urlCode
    const obj = { 
        "urlCode":urlCode,
        "longUrl":longUrl,
        "shortUrl":shortUrl
}
let longUrlexist= await urlModel.findOne({longUrl}).select({__v:0,_id:0})
if(longUrlexist){
    await SET_ASYNC(`${longUrl}`,JSON.stringify(longUrlexist))
     console.log("from db")
    return res.status(201).send({status:true,data:longUrlexist})
}else{
 let createUrl = await urlModel.create(obj)
return res.status(201).send({status:true, data:createUrl})
} 
    
    }catch(err){
        return res.status(500).send({status:false,err:err.message})
}
}
const getUrl = async function(req, res) {
    try{
        let urlCode = req.params.urlCode
        let urlcode = req.body.urlCode
        if(urlcode){
            return res.status(400).send({status:false,msg:"invalid request"})
        }
        let originalUrl = await GET_ASYNC(`${urlCode}`)
    if(originalUrl){
        let copy = JSON.parse(originalUrl)
        console.log("from cache")
        return res.status(302).redirect(copy.longUrl)
    }
    let urlInMongoDB = await urlModel.findOne({urlCode:urlCode})
    if(!urlInMongoDB){
        return res.status(404).send({status:false,msg:"No url found "})
    }
    await SET_ASYNC(`${urlCode}`,JSON.stringify(urlInMongoDB))
    console.log("from db")
    return res.status(302).redirect(urlInMongoDB.longUrl)
    
 }catch(err){
    return res.status(500).send({status:false,err:err.message})
}
}
module.exports={createUrl,getUrl}




