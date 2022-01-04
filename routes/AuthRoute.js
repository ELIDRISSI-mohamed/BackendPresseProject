const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";
const jwt_mail_secret = "SECRET_KEY_MAIL";
const jwt_forgotPwd_secret = "SECRET_KEY_FORGOTPWD"
const User = require("../models/UserModel");
const {verifyToken, verifyMailToken} = require('../middleware/verifyToken');


router.post('/createCompte',(req,res)=>{
    if(req.body.username && req.body.mail && req.body.password){
      user = new User(req.body.username, req.body.mail, bcrypt.hashSync(req.body.password, saltRounds))

      
      dbo.collection("userApp").findOne({"username": user.username}, (err, res)=>{
        if(err) res.send({"ERREUR": err})
        else if(res){
          res.send({"ERREUR": "USERNAME_DEJA_EXIST"})
        } else{
          dbo.collection("userApp").findOne({"mail": user.mail}, (err, result)=> {
            if(err) res.json({"ERREUR" : err})
            else if(result){
              res.json({"ERREUR" : "MAIL_DEJA_EXISTE"})
            } else{
              dbo.collection('userApp').insertOne(user, (err, result)=> {
                if (err){
                  res.json({"ERREUR" : err});
                }
                else{
                }
              })
            }
          })
        }
      })
      
      // Send verification mail
      const token_mail = jwt.sign(user.mail, jwt_mail_secret);
      const url = `http://localhost:3333/authentification/verification/${token_mail}`
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'genie.info.este@gmail.com',
          pass: 'Mohamed2000'
        }
      });
      var mailOptions = {
        from: 'genie.info.este@gmail.com',
        to: user.mail,
        subject: 'Sending Email using Microlocalistion',
        html: ' Hello '.concat(user.username).concat(`,  <br /></br > One of your team mates have submitted an application for intern(s) for next summer. Please approve or reject the proposal on the internship portal. <br /> Here is the link of the internship portal :
                    <a href="http://localhost:3333/authentification/verification/${token_mail}">${token_mail}</a><br /><br /> `),
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          res.send({'MESSAGE': 'OK'});
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
      dbo.collection('userApp').findOne({"mail": data}, (err, result)=> {
        if (err)
            res.send(err);
        else{
            if(result) {
              console.log(result)
              result.status = 'VERIFIED';
              dbo.collection("userApp").updateOne({"mail" : data},{$set : result},(err, result)=> {
                  if (err)
                    res.send(err);
                  else{
                    res.sendFile("C:/Users/Mohamed/Desktop/pfe/node traini/public/index.html")
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

      dbo.collection("userApp").findOne({'mail':user.mail}, (err,result)=>{
          if(err)
              throw err
          else{
              if(result) {
                  var passwordValid = bcrypt.compareSync(user.password, result.password)
                  if(passwordValid) {
                      if (result.status == 'VERIFIED') {
                          //token
                          var token = jwt.sign({result},jwt_code_secret);

                          if(result.role == 'user'){
                              res.status(200).json({"token" : token, "role" : "user"});
                          } 
                          else if(result.role == 'superAdmin') {
                            res.status(200).json({"token" : token, "role" : "superAdmin"});
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
                          res.status(403).json({"ERREUR" : "USER_NOT_VERIFIED"});
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

router.post('/forgotPassword', (req,res)=>{
  if('mail' in req.body){
      const mail = req.body.mail;
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'genie.info.este@gmail.com',
          pass: 'Mohamed2000'
        }
      });
      console.log(mail)
      dbo.collection("userApp").findOne({mail}, (err, resultUser)=>{
        if(err)
            throw err
        else if(resultUser) {
          if(resultUser.status == "NOT_VERIFIED"){
            res.send({"ERREUR": "USER_NOT_VERIFIED"})
          }
          else{
            const token_pwd = jwt.sign(resultUser.mail, jwt_forgotPwd_secret);
            const url = `http://localhost:3333/auth/reset/${token_pwd}`
            const mailOptions = {
              from: 'genie.info.este@gmail.com',
              to: mail,
              subject: 'Sending Email using Microlocalistion',
              html: ' Hello'.concat(`,  <br /><br /> One of your team mates have submitted an application for intern(s) for next summer. Please approve or reject the proposal on the internship portal. <br /> Here is the link of the internship portal :
                          <a href="http://localhost:3333/auth/reset/${token_pwd}">${token_pwd}</a><br /><br /> `),
            };
            resultUser.resetLink = token_pwd
            dbo.collection("userApp").updateOne({mail: mail}, {$set: resultUser}, (err, result)=>{
              if(err)
                res.status(400).send({"ERREUR": "Link error"})
              else{
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    res.send({'MESSAGE': 'OK'});
                  }
                })
              }
            })
          }
        } else {
            res.status(403).json({"ERREUR" : "USER_NOT_EXIST"});
        }
      })
  } else{
      res.setHeader('Content-Type','text/palin');
      res.status(500).json({"ERREUR" : "ERROR_BODY"});
   }
})

router.post("/resetPassword", (req, res)=>{
  const {resetLink, newPassword} = req.body
  if(resetLink && newPassword){
    jwt.sign(resetLink, jwt_forgotPwd_secret, (err, data)=>{
      if(err)
        res.sendStatus("token expired")
      else{
        dbo.collection("userApp").findOne({resetLink}, (err, user)=>{
          if(err)
            res.send(err)
          else{
            user.password = bcrypt.hashSync(newPassword)
            dbo.collection("userApp").updateOne({mail: user.mail}, {$set: user}, (err, result)=>{
              if(err)
                res.send(err)
              else{
                res.send({"MESSAGE": "RESET_SUCCESS"})
              }
            })
          }
        })
      }
    })
  }
})

module.exports = router;
