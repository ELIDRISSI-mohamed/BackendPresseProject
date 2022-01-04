const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');



router.post('/addArticle', verifyMailToken, (req,res)=>{
    jwt.verify(req.params.token, jwt_mail_secret, (err,data)=>{
      if(err) 
              res.sendStatus(403);
      else{
        if(data.result.role == 'redacteur'){
            if(req.body.artcile)
            dbo.collection('article').insertOne(user, (err, result)=> {
                if (err){
                  res.json({"ERREUR" : err});
                }
                else{
                }
            })
        } else{
            res.send({"ERREUR" : "NO_ACCESS"})
        }
      }
    })
})