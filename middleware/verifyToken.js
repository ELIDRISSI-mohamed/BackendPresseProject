const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

// IAT indique l'heure à laquelle le JWT a été délivré. Cette allégation peut être utilisée pour déterminer l'âge du JWT

var verifyToken = (req,res,next)=>{
    var bearerHeader = req.headers['authorization'];
    console.log(req.headers)
    if(typeof bearerHeader !== 'undefined'){
        var bearerToken = bearerHeader.split(" ")[0];
        req.token = bearerToken;
        next();
    } else {
        res.setHeader('Contant-Type','text/palin');
        res.json({"ERROR": "TOKEN_NOT_FIND"});
    }
}

var verifyMailToken = (req,res,next)=>{
    var bearerHeader = req.params.token;
    if(typeof bearerHeader !== 'undefined'){
        var bearerToken = bearerHeader.split(" ")[0];
        req.token = bearerToken;
        next();
    } else {
        res.setHeader('Contant-Type','text/palin');
        res.json({"ERROR": "TOKEN_NOT_FIND"});
    }
}

module.exports = {verifyToken, verifyMailToken};

