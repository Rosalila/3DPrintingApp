// server.js
// load the things we need
var express = require('express');
var app = express();
var request = require('request');
const fs = require('fs');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
  var options = {
    url: 'https://api.github.com/orgs/Rosalila3DPrinting/repos',
    headers: {
      'User-Agent': 'request'
    }
  };

  request(options, function callback(error, response, body)
    {
      var json_data = JSON.parse(body)
      var repos = []
      for(var i=0;i<json_data.length;i++)
      {
        repos.push(json_data[i])
      }
      res.render('index', {repos: repos})
    }
  );
});


// index page 
app.get('/thing/*', function(req, res) {
  res.render('thing', {repo: req.url.slice(7)})
});

app.get('/print/*', function(req, res) {

  var api_key = req.query.api_key

  var options = {
    url: 'https://raw.githubusercontent.com/Rosalila3DPrinting/'+req.url.slice(7)+'/master/toolpath.gcode',
    headers: {
    'User-Agent': 'request'
    }
  };

  console.log("Print init")
  var file = fs.createWriteStream("toolpath.gcode");
  request(options, function callback(error, response, body)
  {
    console.log("Toolpath getted")
    fs.writeFile("toolpath.gcode", response.body, function(err) {
      if(err) {
        return console.log(err);
      }

      request.post
      ({
        url: 'http://local.rosalilastudio.com:5000/api/files/local',
        headers:
        {
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryDeC2E3iWbTv1PwMC',
          'X-Api-Key': api_key
        },
        formData:
        {
          file: fs.createReadStream(__dirname+"/toolpath.gcode")
        }
      },
      function callback(error, response, body)
      {

        if(error) {
          return console.log(error);
        }
console.log(body)
        console.log("Toolpath posted")

        request.post
        ({
          url: 'http://local.rosalilastudio.com:5000/api/files/local/toolpath.gcode',
          headers:
          {
            'Content-Type': 'application/json',
            'X-Api-Key': api_key
          },
          body:'{"command": "select", "print": true}'
        },
        function callback(error, response, body)
        {
          if(error) {
            return console.log(error);
          }
console.log(body)
          console.log("Toolpath selected")
          res.render('upload')
        })

      })
    });
  })
});

app.listen(8000);
console.log('8080 is the magic port');
