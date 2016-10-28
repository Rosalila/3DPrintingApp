// server.js
// load the things we need
var express = require('express');
var app = express();
var request = require('request');
const fs = require('fs');

// set the view engine to ejs
app.set('view engine', 'ejs');


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
        console.log(json_data[i].name)
        repos.push(json_data[i].name)
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
          'X-Api-Key': 'BE8BD5FCBE484914AACA88110808162F'
        },
        formData:
        {
          file: fs.createReadStream(__dirname+"/toolpath.gcode"),
          select: "true",
          print: "true",
          userdata: "testa"
        }
      },
      function callback(error, response, body)
      {
        console.log("Toolpath posted")

        request.post
        ({
          url: 'http://local.rosalilastudio.com:5000/api/files/local/toolpath.gcode',
          headers:
          {
            'Content-Type': 'application/json',
            'X-Api-Key': 'BE8BD5FCBE484914AACA88110808162F'
          },
          body:'{"command": "select", "print": true}'
        },
        function callback(error, response, body)
        {
          console.log("Toolpath selected")
          res.render('upload')
        })

      })
    });
  })
});

app.listen(8000);
console.log('8080 is the magic port');
