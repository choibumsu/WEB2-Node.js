var http = require('http');
var fs = require('fs');
var url = require('url');

function HTMLtemplate(title, list, body) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${body}
    </body>
    </html>
    `;
}

function ListCode(filelist) {
  var list = '<ol>';
  var i=0;
  while(i<filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i+1;
  }
  list = list + '</ol>';

  return list;
}

function ShowTemplate(title, list, description, response) {
  var template = HTMLtemplate(title, list,
  `<h2>${title}</h2>
  <p>${description}</p>`);

  response.end(template);
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryID = url.parse(_url, true).query.id;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
      fs.readdir("data", function(err, filelist) {
        var list = ListCode(filelist);
        if(queryID === undefined) {
          var title = "<a href='/'>Bumsu_Home</a>";
          var description = "This is a <u>Bumsu's Home</u>";
          ShowTemplate(title, list, description, response);
        }
        else {
          fs.readFile(`data/${queryID}`, 'utf8', function(err, description){
            var title = queryID;
            ShowTemplate(title, list, description, response);
          });
        }
      });
    }
    else {
      response.writeHead(404);
      response.end('Not Found');
    }
});
app.listen(3000);
