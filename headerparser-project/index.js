// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Header Parser API endpoint - IMPROVED VERSION
app.get('/api/whoami', function (req, res) {
  // get IP address - improved method
  let ipaddress = req.headers['x-forwarded-for'] || 
                  req.connection.remoteAddress || 
                  req.socket.remoteAddress ||
                  (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  // clean IP address - handle IPv6 and multiple IPs
  if (ipaddress) {
    // if multiple IPs in x-forwarded-for, take the first one
    if (ipaddress.includes(',')) {
      ipaddress = ipaddress.split(',')[0].trim();
    }
    // remove IPv6 prefix
    if (ipaddress.includes('::ffff:')) {
      ipaddress = ipaddress.replace('::ffff:', '');
    }
    // handle IPv6 localhost
    if (ipaddress === '::1') {
      ipaddress = '127.0.0.1';
    }
  }
  
  // get preferred language
  const language = req.headers['accept-language'];
  
  // get software info from user agent 
  const userAgent = req.headers['user-agent'];
  let software = 'Unknown';
  
  if (userAgent) {
    // try to extract OS information more accurately
    const osMatch = userAgent.match(/\((.*?)\)/);
    if (osMatch && osMatch[1]) {
      software = osMatch[1];
      
      // additional processing for Windows versions
      if (software.includes('Windows NT 10.0') && userAgent.includes('Windows 11')) {
        software = software.replace('Windows NT 10.0', 'Windows 11');
      }
    }
  }
  
  res.json({
    ipaddress: ipaddress || 'Unknown',
    language: language ? language.split(',')[0] : 'Unknown',
    software: software
  });
});

// debug endpoint to see all headers
app.get('/api/debug', function (req, res) {
  res.json({
    headers: req.headers,
    ip: req.ip,
    connection: {
      remoteAddress: req.connection.remoteAddress,
      socketRemoteAddress: req.socket.remoteAddress
    }
  });
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
