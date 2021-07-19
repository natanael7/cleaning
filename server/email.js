require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'normal',
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});
const mailOptions = {
  from: process.env.MAIL_USERNAME,
  to: process.env.MAIL_USERNAME,
};
module.exports = function sendMail({subject, text}) {
  mailOptions.subject = subject;
  mailOptions.text = text;
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log('Error ' + err);
    } else {
      console.log('Email sent successfully');
    }
  });
};
