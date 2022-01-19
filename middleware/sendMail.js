const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


var sendMail = (req, token_mail)=>{
  host = "localhost"
  //host = "159.89.231.146"
   transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'genie.info.este@gmail.com',
          pass: 'Mohamed2000'
        }
      });
      var mailOptions = {
        from: 'genie.info.este@gmail.com',
        to: req.body.mail,
        subject: 'Sending Email using Microlocalistion',
        html: ' Hello '.concat(req.body.username).concat(`,  <br /></br > Please click this link to confirm your identification.
                    <a href="http://${host}:3333/${req.source}/verification/${token_mail}">${token_mail}</a><br /><br /> `),
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
            return;
        }
      })
}

module.exports = sendMail;