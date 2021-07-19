'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const publicdir = path.join(__dirname, '../public');
app.use(
  bodyParser.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(function (req, res, next) {
  if (req.path.indexOf('.') === -1) {
    var file = publicdir + req.path + '.html';
    fs.exists(file, function (exists) {
      if (exists) req.url += '.html';
      next();
    });
  } else next();
});
app.use(express.static(publicdir));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'html');

// Define routes.
app.use('/', require('./routes'));

// Start the server on the correct port.
const server = app.listen(config.port, () => {
  console.log(`🚀  Server listening on port ${server.address().port}`);
});
