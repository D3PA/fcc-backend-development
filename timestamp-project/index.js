// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Timestamp Microservice endpoint
app.get("/api/:date?", function (req, res) {
  let dateString = req.params.date;
  
  // caso 1: parametro vacio (retorna fecha actual)
  if (!dateString) {
    const currentDate = new Date();
    return res.json({
      unix: currentDate.getTime(),
      utc: currentDate.toUTCString()
    });
  }
  
  // caso 2: verificar si es un numero (timestamp Unix)
  if (!isNaN(dateString) && !isNaN(parseFloat(dateString))) {
    dateString = parseInt(dateString);
  }
  
  const date = new Date(dateString);
  
  // caso 3: fecha invalida
  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }
  
  // caso 4: fecha valida
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
