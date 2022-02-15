const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer  = require('multer');

const { verifyToken } = require('../middleware/verifyToken');
const Article = require("../models/ArticleModel")
const sendMail = require("../middleware/sendMail")

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";

var today = new Date()
var dd = today.getDate(); 
var mm = today.getMonth()+1; 
var yyyy = today.getFullYear()

date=yyyy+"-"+mm+"-"+dd

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
      if(!path.extname(file.originalname).localeCompare('.jpg')) callback(null, './public/images/');
      else callback(null, './public/images/');
  },
  filename: function (req, file, callback) {
      if(!path.extname(file.originalname).localeCompare('.jpg')) callback(null, req.params.title+".jpg");
      else callback(null, req.params.title+''+path.extname(file.originalname));
  }
});
var upload = multer({ storage : storage });

router.get('/showTaches', verifyToken, (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'redacteur'){
        dbo.collection("announce").find({"redacteur.mail" : data.result.mail, "rediger": false}).toArray((err, result)=>{
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

router.post('/addArticle/:title', verifyToken, upload.array('file'), (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'redacteur'){
        if(req.body.theme && req.body.text /*&& req.files*/){
          dbo.collection("announce").findOne({"title" : req.params.title}, (err, result)=>{
            if(err) 
                res.send({"ERREUR": err})
            else{
              if(!result) res.send({"ERREUR" : "ARTICLE_N'EXISTE_PAS"})
              else {
                if(result.redacteur.mail == data.result.mail){
                  if(result.rediger == false){
                    dbo.collection("article").findOne({"title" : req.params.title}, (err, rsl)=>{
                        if(err) throw err
                        else{
                          if(rsl){
                            res.send({"ERREUR" : "ARICLE DE CET TITRE EXISTE DEJA"})
                          } else{
                            article = new Article(req.params.title, date, req.body.theme, req.body.text)
                            dbo.collection('article').insertOne(article, (err, resAr)=> {
                              if (err) throw err
                              else{
                                dbo.collection("collaborateur").findOne({"mail": result.redacteur.mail}, (err, resR)=>{
                                  if(err) res.send({"ERREUR": err})
                                  else{
                                    if(resR){
                                      resR.nbrTache -= 1
                                      dbo.collection("collaborateur").updateOne({"mail": result.redacteur.mail},{$set : resR}, async(err, resColl)=> {
                                          if (err) res.send(err);
                                          else{
                                            result.rediger = true;
                                            dbo.collection("announce").updateOne({"title" : req.params.title},{$set : result}, async(err, resUpdate)=> {
                                              if (err) res.send(err);
                                              else{

                                              }
                                            })
                                            //send notification a responsable
                                            text =' Bonjour '.concat(result.responsable.username).concat(`,  <br /></br > La tache de sous titre ${result.title} a été realisé`)
                                            await sendMail(result.responsable.mail, text);
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
                    res.send({"ERREUR" : "DEJA_RIDIGER"})
                  }
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