const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('../middleware/verifyToken');
const Article = require("../models/ArticleModel")

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";

var today = new Date()
var dd = today.getDate(); 
var mm = today.getMonth()+1; 
var yyyy = today.getFullYear()

date=yyyy+"-"+mm+"-"+dd

router.get('/showTaches', verifyToken, (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'redacteur'){
        dbo.collection("announce").find({"redacteur.mail" : data.result.mail}).toArray((err, result)=>{
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

router.post('/addArticle/:title', verifyToken, (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'redacteur'){
        if(req.body.theme && req.body.text){
          dbo.collection("announce").findOne({"title" : req.params.title}, (err, result)=>{
            if(err) 
                res.send({"ERREUR": err})
            else{
              if(!result) res.send({"ERREUR" : "ARTICLE_N'EXISTE_PAS"})
              else {
                if(result.redacteur.mail == data.result.mail){
                  dbo.collection("article").findOne({"title" : req.params.title}, (err, rsl)=>{
                      if(err) throw err
                      else{
                        if(rsl){
                          res.send({"ERREUR" : "ARICLE DE CETTE TITRE EXISTE DEJA"})
                        } else{
                          article = new Article(req.params.title, date, req.body.theme, req.body.text)
                          dbo.collection('article').insertOne(article, (err, result)=> {
                            if (err) throw err
                            else{
                              dbo.collection("collaborateur").findOne({"mail": data.redacteur.mail}, (err, resR)=>{
                                if(err) res.send({"ERREUR": err})
                                else{
                                  if(resR){
                                    resR.nbrTache -= 1
                                    dbo.collection("collaborateur").updateOne({"mail": data.redacteur.mail},{$set : resR},(err, result)=> {
                                        if (err) res.send(err);
                                        else{
                                          res.send({"MESSAGE" : "BIEN_AJOUTER"})
                                        }
                                    })
                                  } 
                                }
                              })
                            }
                          })
                        }
                      }
                  })
                } else{
                    res.send({"ERREUR": "NO_ACCESS"})
                }
              }
            }
          })
        } else{
          res.send({"ERREUR" : "BODY_ERREUR"})
        }
      } else{
          res.send({"ERREUR" : "NO_ACCESS"})
      }
    }
  })
})

module.exports = router;