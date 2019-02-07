var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var Template = require('./lib/Template.js');
var path = require('path');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryID = url.parse(_url, true).query.id;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
      fs.readdir("data", function(err, filelist) {
        var list = Template.List(filelist);
        if(queryID === undefined) {
          var title = "Bumsu_Home";
          var description = "This is a <u>Bumsu's Home</u>";
          var html = Template.HTML(title, list,`
            <h2>${title}</h2>
            <p>${description}</p>`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        }
        else {
          var filteredId = path.parse(queryID). base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryID;
            var html = Template.HTML(title, list,`
              <h2>${title}</h2>
              <p>${description}</p>`,
              `
              <a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>
              `
            );
            response.writeHead(200);
            response.end(html);
          });
        }
      });
    }
    else if(pathname === '/create') {
      fs.readdir("data", function(err, filelist) {
        var list = Template.List(filelist);
        var title = "Create";
        var description = "This is a <u>Bumsu's Home</u>";
        var html = Template.HTML(title, list,`
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p><textarea name="description" placeholder="description"></textarea></p>
            <p><input type="submit"></p>
          </form>`, ``);
        response.writeHead(200);
        response.end(html);
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
    else if(pathname === '/update') {
      fs.readdir("data", function(err, filelist) {
        var list = Template.List(filelist);
        var filteredId = path.parse(queryID). base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryID;
          var html = Template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <p><input type="hidden" name="id" value="${title}"></p>
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p><textarea name="description" placeholder="description">${description}</textarea></p>
              <p><input type="submit"></p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
    else if(pathname==='/update_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function(data) {
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`./data/${id}`, `./data/${title}`, function(err) {
          fs.writeFile(`./data/${title}`, description, 'utf8', function(err) {
            response.writeHead(302, {Location : `/?id=${title}`});
            response.end();
          });
        });
      });
    }
    else if(pathname==='/delete_process') {
      var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function(data) {
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id). base;
        fs.unlink(`./data/${filteredId}`, function(err) {
          response.writeHead(302, {Location : `/`});
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
