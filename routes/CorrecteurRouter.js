const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('../middleware/verifyToken');
const Article = require("../models/ArticleModel")

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";


router.get('/showTaches', verifyToken, (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'correcteur'){
        dbo.collection("announce").find({"correcteur.mail" : data.result.mail}).toArray((err, result)=>{
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

router.get('/findArticle/:title', verifyToken, (req,res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
      if(err) 
              res.sendStatus(403);
      else{
        if(data.result.role == 'correcteur'){
          dbo.collection("announce").findOne({"title" : req.params.title}, (err, result)=>{
            if(err) res.send({"ERREUR": err})
            else{
                if(result.correcteur.mail == data.result.mail){
                    dbo.collection("article").findOne({"title" : req.params.title}, (err, rst)=>{
                        if(err) throw err
                        else{
                            res.send({"DATA" : rst})
                        }
                    })
                } else{
                    res.send({"ERREUR": "PAS_ACCESS"})
                }
            }
          })
        } else{
            res.send({"ERREUR" : "NO_ACCESS"})
        }
      }
    })
})

router.post('/corrigerArticle/:title', verifyToken, (req,res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'correcteur'){
                if(req.body.textCorrige && req.body.traductionCorrige){
                    dbo.collection("announce").findOne({"title" : req.params.title}, (err, result)=>{
                        if(err) 
                            res.send({"ERREUR": err})
                        else{
                            if(result.correcteur.mail == data.result.mail){
                                dbo.collection("article").findOne({"title" : req.params.title}, (err, rsl)=>{
                                    if(err) throw err
                                    else{
                                        if(rsl){
                                            rsl.textCorrige = req.body.textCorrige
                                            rsl.traductionCorrige = req.body.traductionCorrige
                                            dbo.collection("article").updateOne({title: req.params.title},{$set : rsl},(err, rst)=> {
                                                if (err) res.send(err);
                                                else{
                                                    dbo.collection("collaborateur").findOne({"mail": data.correcteur.mail}, (err, resC)=>{
                                                        if(err) res.send({"ERREUR": err})
                                                        else{
                                                            if(resC){
                                                                resC.nbrTache -= 1
                                                                dbo.collection("collaborateur").updateOne({"mail": data.correcteur.mail},{$set : resC},(err, result)=> {
                                                                    if (err) res.send(err);
                                                                    else{
                                                                        res.send({MESSAGE : "BIEN_CORRIGE"});
                                                                    }
                                                                })
                                                            } 
                                                        }
                                                    })
                                                }
                                            })
                                        } else{
                                            res.send({"ERREUR" : "PAS_ENCOURE_REDIGE"})
                                        }
                                    }
                                })
                            } else{
                                res.send({"ERREUR": "NO_ACCESS"})
                            }
                        }
                    })
                } else{
                    res.send({"ERREUR" : "BODY_ERROR"})
                }
            } else{
              res.send({"ERREUR" : "NO_ACCESS"})
          }
        }
      })
})

module.exports = router;