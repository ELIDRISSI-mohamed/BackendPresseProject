const config =  require('../config');
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');


var sendMail = (mail, text)=>{
   transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'genie.info.este@gmail.com',
          pass: 'Mohamed2000'
        }
      });
      var mailOptions = {
        from: 'genie.info.este@gmail.com',
        to: mail,
        subject: 'Web presse',
        html: text
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