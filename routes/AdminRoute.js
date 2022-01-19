const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/verifyToken');
var ObjectId = require('mongodb').ObjectId;
var mongodb = require('mongodb');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Admin = require('../models/AdminModel')
const Announce = require('../models/AnnonceModel')

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";



router.post('/createCompte',(req,res)=>{
    if(req.body.username && req.body.mail && req.body.password){
      responsable = new Admin(req.body.username, req.body.mail, bcrypt.hashSync(req.body.password, saltRounds))

      dbo.collection("admin").findOne({"username": responsable.username}, (err, rst)=>{
        if(err) res.send({"ERREUR": err})
        else if(rst){
          res.send({"ERREUR": "USERNAME_DEJA_EXIST"})
        } else{
          dbo.collection("admin").findOne({"mail": responsable.mail}, (err, result)=> {
            if(err) res.json({"ERREUR" : err})
            else if(result){
              res.json({"ERREUR" : "MAIL_DEJA_EXISTE"})
            } else{
              //inserer les donnees dans la BD
              dbo.collection('admin').insertOne(responsable, (err, result)=> {
                if (err){
                  res.json({"ERREUR" : err});
                }
                else{
                  res.send({'MESSAGE': 'BIEN_AJOUTER'});
                }
              })
            }
          })
        }
      })
      
    } else{
        res.status(300).json({"ERREUR" : "BODY_ERREUR"});
    }
})

router.post('/login',(req,res)=>{
    if('mail' in req.body && 'password' in req.body){
        var user = {
            'mail' : req.body.mail,
            'password' : req.body.password
        }
  
        dbo.collection("admin").findOne({'mail':user.mail}, (err,result)=>{
            if(err)
                throw err
            else{
                if(result) {
                    var passwordValid = bcrypt.compareSync(user.password, result.password)
                    if(passwordValid) {
                        if (result.status == 'VERIFIED') {
                            //token
                            var token = jwt.sign({result},jwt_code_secret);
  
                            if(result.role == 'superAdmin'){
                                res.status(200).json({"token" : token, "MESSAGE" : "superAdmin"});
                            } 
                            else if(result.role == 'admin') {
                              res.status(200).json({"token" : token, "role" : "admin"});
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

router.get("/getAllCorrecteur", verifyToken, (req, res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
        if(err) 
            res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "correcteur"}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"CORRECTEURS" : result})
                    }
                })
            }else{
                res.send({"ERREUR": "NO_ACCESS"})
            }
        }
    })
})

router.get("/getAllRedacteur", verifyToken, (req, res)=>{
    jwt.verify(req.token, jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "redacteur"}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"REDACTEURS" : result})
                    }
                })
            } else{
                res.send({"ERREUR": "NO_ACCESS"})
            }
        }
    })
})

router.get("/getAllTraducteur", verifyToken, (req, res)=>{
    jwt.verify(req.token,jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "traducteur"}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"TRADUCTEURS" : result})
                    }
                })
            } else{
                res.send({"ERREUR" : "NO_ACCESS"})
            }
        }
    })
})

router.get("/getCorrecteurByTheme", verifyToken, (req, res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
        if(err) 
            res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "correcteur", "theme": req.body.theme}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"CORRECTEURS" : result})
                    }
                })
            }else{
                res.send({"ERREUR": "NO_ACCESS"})
            }
        }
    })
})

router.get("/getRedacteurByTheme", verifyToken, (req, res)=>{
    jwt.verify(req.token, jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "redacteur", "theme": req.body.theme}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"REDACTEURS" : result})
                    }
                })
            } else{
                res.send({"ERREUR": "NO_ACCESS"})
            }
        }
    })
})

router.get("/getTraducteurByTheme", verifyToken, (req, res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "traducteur", "theme": req.body.theme}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"TRADUCTEURS" : result})
                    }
                })
            } else{
                res.send({"ERREUR" : "NO_ACCESS"})
            }
        }
    })
})


router.get("/getCollaborateurs", verifyToken, (req, res)=>{
    jwt.verify(req.token,jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){
                dbo.collection("collaborateur").find({"role": "collaborateur"}).toArray((err, result)=>{
                    if(err) res.send({"ERREUR": err})
                    else{
                        res.send({"COLLABORATEURS" : result})
                    }
                })
            } else{
                res.send({"ERREUR" : "NO_ACCESS"})
            }
        }
    })
})

router.put("/updataRole/:id", verifyToken, (req,res)=>{
    jwt.verify(req.token,jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin'){
                if(req.body.role && req.body.theme ){
                    dbo.collection("collaborateur").findOne({_id: new mongodb.ObjectId(req.params.id)}, (err, result)=>{
                        if(err) res.send({"ERREUR": err})
                        else{
                            if(result){
                                result.role = req.body.role
                                result.theme = req.body.theme
                                dbo.collection("collaborateur").updateOne({_id: new mongodb.ObjectId(req.params.id)},{$set : result},(err, rst)=> {
                                    if (err) res.send(err);
                                    else{
                                        res.status(200).send("UPDATE_SUCCES");
                                    }
                                })
                            } else{
                                res.send({"ERREUR": "USER_NOT_FOUND"})
                            }
                        }
                    })
                } else {
                    res.send({"ERREUR": "BODY_ERREUR"})
                }
            } else{
                res.status(400).json({"Erreur" : "NO_ACCESS"});
            }
        }
    })
})

router.delete("/deleteCollaborateur/:id", verifyToken, (req, res)=>{
    jwt.verify(req.token,jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            console.log(req.params.id)
            if(data.result.role == 'superAdmin'){            
                dbo.collection("collaborateur").deleteOne({_id: new mongodb.ObjectId(req.params.id)}, (err, result)=> {
                    if (err) 
                        throw err;
                    else{
                        console.log(result)
                        if(result.deletedCount != 0)  res.status(200).send({MESSAGE: "DELETE_SUCCES"});
                        else res.send({"ERREUR": "USER_NOT_FOUND"})
                    }
                })
            } else{
                res.status(400).json({"ERREUR" : "NO_ACCESS"});
            } 
        }
    })
})

router.delete("/deleteUser/:id", verifyToken, (req, res)=>{
    jwt.verify(req.token,jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
            if(data.result.role == 'superAdmin'){            
                dbo.collection("userApp").deleteOne({_id: new mongodb.ObjectId(req.params.id)}, (err, result)=> {
                    if (err) 
                        throw err;
                    else{
                        if(result.deletedCount != 0)  res.status(200).send({MESSAGE: "DELETE_SUCCES"});
                        else res.send({"ERREUR": "USER_NOT_FOUND"})
                    }
                })
            } else{
                res.status(400).json({"ERREUR" : "NO_ACCESS"});
            } 
        }
    })
})

router.post("addAnnouncement", verifyToken,(req, res) =>{
    jwt.verify(req.token,jwt_code_secret,(err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{
                
            if(data.result.role == 'superAdmin' || data.result.role == 'responsable'){   
                if(req.body.title && req.body.correcteur && req.body.redacteur && req.body.traducteur && req.body.dataMax){
                    announce = new Announce(req.body.title ,req.body.correcteur ,req.body.redacteur ,req.body.traducteur ,req.body.dataMax)
                    dbo.collection('announce').insertOne(user, (err, result)=> {
                        if (err){
                            res.json({"ERREUR" : err});
                        }
                        else{
                            dbo.collection('announce').insertOne(responsable, (err, result)=> {
                                if (err){
                                  res.json({"ERREUR" : err});
                                }
                                else{
                                  res.send({'MESSAGE': 'BIEN_AJOUTER'});
                                }
                            })
                        }
                    })
                } else{
                    res.send({"ERREUR": "BODY_ERROR"})
                }
            }
        }
    })
})

module.exports = router;
