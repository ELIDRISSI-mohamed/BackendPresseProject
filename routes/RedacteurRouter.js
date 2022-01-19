const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('../middleware/verifyToken');

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";


router.get('/showTaches', verifyToken, (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'redacteur'){
        dbo.collection("announce").find({"redacteur": data.result}).toArray((err, result)=>{
          if(err) res.send({"ERREUR": err})
          else{
              res.send({"ANNOUNCES" : result})
          }
        })
      } else{
          res.send({"ERREUR" : "NO_ACCESS"})
      }
    }
  })
})

router.post('/addArticle', verifyToken, (req,res)=>{
    jwt.verify(req.params.token, jwt_code_secret, (err,data)=>{
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

module.exports = router;