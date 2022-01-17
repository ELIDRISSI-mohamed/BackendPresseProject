const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path')

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";
const jwt_mail_secret = "SECRET_KEY_MAIL";
const jwt_forgotPwd_secret = "SECRET_KEY_FORGOTPWD"
const Collaborateur = require("../models/CollaborateurModel")
const {verifyToken, verifyMailToken} = require('../middleware/verifyToken');
const sendMail = require("../middleware/sendMail")
const appDir = path.dirname(require.main.filename)

router.post('/createCompte',(req,res)=>{
    if(req.body.username && req.body.mail && req.body.password && req.body.competence){
      user = new Collaborateur(req.body.username, req.body.mail, bcrypt.hashSync(req.body.password, saltRounds), req.body.competence)

      
      dbo.collection("collaborateur").findOne({"username": user.username}, (err, rst)=>{
        if(err) res.send({"ERREUR": err})
        else if(rst){
          res.send({"ERREUR": "USERNAME_DEJA_EXIST"})
        } else{
          dbo.collection("collaborateur").findOne({"mail": user.mail}, async(err, result)=> {
            if(err) res.json({"ERREUR" : err})
            else if(result){
              res.json({"ERREUR" : "MAIL_DEJA_EXISTE"})
            } else{
              // Send verification mail
              const token_mail = jwt.sign(user.mail, jwt_mail_secret);
              await sendMail(req, token_mail)
              // const url = `http://localhost:3333/collaborateur/verification/${token_mail}`
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
              //               <a href="http://localhost:3333/collaborateur/verification/${token_mail}">${token_mail}</a><br /><br /> `),
              // };
              // transporter.sendMail(mailOptions, function(error, info){
              //   if (error) {
              //     console.log(error);
              //   } else {
              //   }
              // })
              //inserer les donnees dans la BD
              dbo.collection('collaborateur').insertOne(user, (err, result)=> {
                if (err){
                  res.json({"ERREUR" : err});
                }
                else{
                  res.send({'MESSAGE': 'VERIFIER_TON_MAIL'});
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


router.post('/login',(req,res)=>{
  if('mail' in req.body && 'password' in req.body){
      var user = {
          'mail' : req.body.mail,
          'password' : req.body.password
      }

      dbo.collection("collaborateur").findOne({'mail':user.mail}, (err,result)=>{
          if(err)
              throw err
          else{
              if(result) {
                  var passwordValid = bcrypt.compareSync(user.password, result.password)
                  if(passwordValid) {
                      if (result.status == 'VERIFIED') {
                          //token
                          var token = jwt.sign({result}, jwt_code_secret);

                          if(result.role == 'collaborateur'){
                              res.status(200).json({"ERREUR" : "PAS_AUTORISATION"});
                          } 
                          else if(result.role == 'correcteur') {
                            res.status(200).json({"token" : token, "role" : "correcteur"});
                          } 
                          else if(result.role == 'redacteur') {
                            res.status(200).json({"token" : token, "role" : "redacteur"});
                          } 
                          else if(result.role == 'traducteur') {
                            res.status(200).json({"token" : token, "role" : "traducteur"});
                          }
                      } else {
                          res.status(403).json({"ERREUR" : "COMPTE_NOT_VERIFIED"});
                      }
                  } else {
                      res.status(403).json({"ERREUR" : "PASSWORD_NOT_VALID"});
                  }


              } else {
                  res.status(403).json({"ERREUR" : "USER_NOT_EXIST"});
              }
          }
      })
  } else{
      res.setHeader('Content-Type','text/palin');
      res.status(500).json({"ERREUR" : "ERROR_BODY"});
   }

})


router.get('/verification/:token', verifyMailToken, (req,res)=>{
  jwt.verify(req.params.token, jwt_mail_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      dbo.collection('collaborateur').findOne({"mail": data}, (err, result)=> {
        if (err)
            res.send(err);
        else{
            if(result) {
              console.log(result)
              result.status = 'VERIFIED';
              dbo.collection("collaborateur").updateOne({"mail" : data},{$set : result},(err, result)=> {
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


module.exports = router;
