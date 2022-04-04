const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require('../models/urlModel');

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
     let longUrl = req.body.longUrl
    const baseUrl = 'http:localhost:3000'
     if(!isValidRequestBody(req.body)){
         return res.status(400).send({status:false,message:'Invalid request body'})
     }
     if(!isValid(longUrl)){
        return res.status(400).send({status:false, message: 'Please provide longUrl'})
     }
     if(!validUrl.isUri(longUrl)){
        return res.status(400).send({status:false, message: 'Invalid longUrl'})
    }
    if(!isValid(baseUrl)){
        return res.status(400).send({status:false, message: 'Please provide baseUrl'})
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
   let createUrl = await urlModel.create(obj)
   return res.status(201).send({status:true, data:createUrl})
   
    
    }catch(err){
        return res.status(500).send({status:false,err:err.message})
}
}
const getUrl = async function(req, res) {
    try{
        let urlCode = req.params
    let originalUrl = await urlModel.findOne(urlCode).select({longUrl:1})
    if(!originalUrl){
        return res.status(400).send({status:false,message:"url not found"})
    }else{
        return res.status(201).send({status:true, data: originalUrl})
    }
}catch(err){
    return res.status(500).send({status:false,err:err.message})
}
}
module.exports={createUrl,getUrl}