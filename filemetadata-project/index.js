var express = require('express');
var cors = require('cors');
var multer = require('multer');
require('dotenv').config()

var app = express();

// configure multer for file uploads
var upload = multer({
  dest: 'rodri/', // folder where files will be temporarily stored
  limits: {
    fileSize: 10 * 1024 * 1024 // limit file size to 10MB
  }
});

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST endpoint for file upload
app.post('/api/fileanalyse', upload.single('upfile'), function (req, res) {
  // check if file was uploaded
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }

  // return file metadata
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

app.get('/api/files', function (req, res) {
  res.json({ message: 'File upload service is working' });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
