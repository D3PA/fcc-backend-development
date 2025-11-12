require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// in-memory storage for URLs 
let urlDatabase = [];
let urlCounter = 1;

// function to validate URL format and existence
function validateUrl(inputUrl, callback) {
  // check URL format
  try {
    const parsedUrl = new URL(inputUrl);
    
    // check if URL has valid protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return callback(new Error('Invalid protocol'));
    }
    
    // check if domain exists using DNS lookup
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        callback(new Error('Invalid hostname'));
      } else {
        callback(null, parsedUrl.href);
      }
    });
  } catch (error) {
    callback(new Error('Invalid URL format'));
  }
}

// POST endpoint to create short URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }
  
  validateUrl(originalUrl, (error, validUrl) => {
    if (error) {
      return res.json({ error: 'invalid url' });
    }
    
    // check if URL already exists in database
    const existingUrl = urlDatabase.find(entry => entry.original_url === validUrl);
    
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }
    
    // create new short URL
    const newUrl = {
      original_url: validUrl,
      short_url: urlCounter
    };
    
    urlDatabase.push(newUrl);
    
    res.json({
      original_url: newUrl.original_url,
      short_url: urlCounter
    });
    
    urlCounter++;
  });
});

// GET endpoint to redirect using short URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  
  if (isNaN(shortUrl)) {
    return res.json({ error: 'invalid short url' });
  }
  
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (!urlEntry) {
    return res.json({ error: 'short url not found' });
  }
  
  res.redirect(urlEntry.original_url);
});

// additional endpoint to see all shortened URLs
app.get('/api/shorturl', function(req, res) {
  res.json(urlDatabase);
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
