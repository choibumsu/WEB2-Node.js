var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function HTMLtemplate(title, list, body) {
  return `
  <!doctype html>
  <html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">Bumsu's Page</a></h1>
    ${list}
    <a href="/create">create</a>
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

// function ShowTemplate(title, list, description, response) {
//   var template = HTMLtemplate(title, list,
//   `<h2>${title}</h2>
//   <p>${description}</p>`);
//
//   response.end(template);
// }

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryID = url.parse(_url, true).query.id;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
      fs.readdir("data", function(err, filelist) {
        var list = ListCode(filelist);
        if(queryID === undefined) {
          var title = "Bumsu_Home";
          var description = "This is a <u>Bumsu's Home</u>";
          var template = HTMLtemplate(title, list,`
            <h2>${title}</h2>
            <p>${description}</p>`
          );
          response.writeHead(200);
          response.end(template);
        }
        else {
          fs.readFile(`data/${queryID}`, 'utf8', function(err, description){
            var title = queryID;
            var template = HTMLtemplate(title, list,`
              <h2>${title}</h2>
              <p>${description}</p>`
            );
            response.writeHead(200);
            response.end(template);
          });
        }
      });
    }
    else if(pathname === '/create') {
      fs.readdir("data", function(err, filelist) {
        var list = ListCode(filelist);
        var title = "Create";
        var description = "This is a <u>Bumsu's Home</u>";
        var template = HTMLtemplate(title, list,`
          <form action="http://localhost:3000/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p><input type="submit"></p>
          </form>
        `);
        response.writeHead(200);
        response.end(template);
      });
    }
    else if(pathname==='/create_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function(data) {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`./data/${title}`, description, 'utf8', function(err) {
          response.writeHead(302, {Location : `/?id=${title}`});
          response.end();
        });
      });
    }
    else {
      response.writeHead(404);
      response.end('Not Found');
    }
});
app.listen(3000);
