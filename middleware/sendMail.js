const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


var sendMail = (req, token_mail)=>{
    console.log(req.body)
    console.log(token_mail)
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
        html: ' Hello '.concat(req.body.username).concat(`,  <br /></br > One of your team mates have submitted an application for intern(s) for next summer. Please approve or reject the proposal on the internship portal. <br /> Here is the link of the internship portal :
                    <a href="http://localhost:3333/user/verification/${token_mail}">${token_mail}</a><br /><br /> `),
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
            return
        }
      })
}

module.exports = sendMail;