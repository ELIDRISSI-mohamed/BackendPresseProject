const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path')

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";
const jwt_mail_secret = "SECRET_KEY_MAIL";
const jwt_forgotPwd_secret = "SECRET_KEY_FORGOTPWD";

const Client = require("../models/ClientModel");
const Theme = require("../models/ThemeModel");
const {verifyToken, verifyMailToken} = require('../middleware/verifyToken');
const sendMail = require("../middleware/sendMail")
const config =  require('../config');

const appDir = path.dirname(require.main.filename);

router.post('/createCompte', (req,res)=>{
    if(req.body.username && req.body.mail && req.body.password){
      user = new Client(req.body.username, req.body.mail, bcrypt.hashSync(req.body.password, saltRounds))

      
      dbo.collection("client").findOne({"username": user.username}, (err, rst)=>{
        if(err) res.send({"ERREUR": err})
        else if(rst){
          res.send({"ERREUR": "USERNAME_DEJA_EXIST"})
        } else{
          dbo.collection("client").findOne({"mail": user.mail}, async (err, result)=> {
            if(err) res.json({"ERREUR" : err})
            else if(result){
              res.json({"ERREUR" : "MAIL_DEJA_EXISTE"})
            } else{
              // Send verification mail
              const token_mail = jwt.sign(user.mail, jwt_mail_secret);
             // const url = `http://localhsot:3333/user/verification/${token_mail}`
              text =' Hello '.concat(user.username).concat(`,  <br /></br > Please click this link to confirm your identification.
                    <a href="http://159.89.231.146:3333/user/verification/${token_mail}">${token_mail}</a><br /><br /> `)
              await sendMail(user.mail, text);
              // transporter = nodemailer.createTransport({
              //   service: 'gmail',
              //   auth: {
              //     user: 'genie.info.este@gmail.com',
              //     pass: 'Mohamed2000'
              //   }
              // });
              // var mailOptions = {
              //   from: 'genie.info.este@gmail.com',
              //   to: user.mail,
              //   subject: 'Sending Email using Microlocalistion',
              //   html: ' Hello '.concat(user.username).concat(`,  <br /></br > One of your team mates have submitted an application for intern(s) for next summer. Please approve or reject the proposal on the internship portal. <br /> Here is the link of the internship portal :
              //               <a href="http://${process.env.PORT_SERVER}/user/verification/${token_mail}">${token_mail}</a><br /><br /> `),
              // };
              // transporter.sendMail(mailOptions, function(error, info){
              //   if (error) {
              //     console.log(error);
              //   } else {
              //   }
              // })
              dbo.collection('client').insertOne(user, (err, result)=> {
                if (err){
                  res.json({"ERREUR" : err});
                }
                else{
                  res.send({'MESSAGE': 'VERIFIER_TON_EMAIL'});
                }
              })
            }
          })
        }
      })
      
    } else{
        res.status(300).json({"ERREUR" : "FIELDS_ERROR"});
    }
})

router.get('/verification/:token', verifyMailToken, (req,res)=>{
    jwt.verify(req.params.token, jwt_mail_secret, (err,data)=>{
      if(err) 
              res.sendStatus(403);
      else{
        dbo.collection('client').findOne({"mail": data}, (err, result)=> {
          if (err)
              res.send(err);
          else{
              if(result) {
                result.status = 'VERIFIED';
                dbo.collection("client").updateOne({"mail" : data},{$set : result},(err, result)=> {
                    if (err)
                      res.send(err);
                    else{
                      res.sendFile(appDir+'\\public\\index.html')
                    }
                })
              } else {
                res.json({"ERREUR" : "NO_USER_FOUND"});
              }
          }
        })
      }
    })
})

router.post('/login',(req,res)=>{
  if('mail' in req.body && 'password' in req.body){
      var user = {
          'mail' : req.body.mail,
          'password' : req.body.password
      }

      dbo.collection("client").findOne({'mail':user.mail}, (err,result)=>{
          if(err)
              throw err
          else{
              if(result) {
                  var passwordValid = bcrypt.compareSync(user.password, result.password)
                  if(passwordValid) {
                      if (result.status == 'VERIFIED') {
                          //token
                          var token = jwt.sign({result},jwt_code_secret);
                          res.status(200).json({"token" : token, "role" : "user"});
                      } else {
                          res.status(403).json({"ERREUR" : "COMPTE_NOT_VERIFIED"});
                      }
                  } else {
                      res.status(403).json({"ERREUR" : "PASSWORD_NOT_VALID"});
                  }


              } else {
                  res.status(403).json({"ERREUR" : "MAIL_NOT_EXIST"});
              }
          }
      })
  } else{
      res.setHeader('Content-Type','text/palin');
      res.status(500).json({"ERREUR" : "ERROR_BODY"});
   }

})

router.get('/getAllArticles', (req, res)=>{
    dbo.collection("article").find().sort({"dateAjou":-1}).toArray((err, result)=>{
      if(err) res.send({"ERREUR": err})
      else{
          res.send({"ARTICLES" : result})
      }
    })
})

router.get('/getAllArticlesByTheme/:theme', verifyToken, (req, res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'user'){
        dbo.collection("article").find({"theme": req.params.theme}).sort({"dateAjou":-1}).toArray((err, result)=>{
          if(err) res.send({"ERREUR": err})
          else{
              res.send({"ARTICLES" : result})
          }
        })
      }
    }
  })
})

module.exports = router;
