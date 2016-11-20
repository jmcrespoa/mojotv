var express = require("express"),
    app = express(),
    fs = require('fs'),
    http = require('http').Server(app)
    io = require('socket.io')(http);

app.use(express.static('views'));
app.use(express.static('css'));
app.use(express.static('img'));

app.get('/', function(request, response) {
    response.redirect('index.html');
});

app.get('/video-on-demand', function(request, response){
    console.log('Requesting video to improve our mojo');
    var path = 'videos/video.mp4';
    var stat = fs.statSync(path);
    var total = stat.size;
    if (request.headers['range']) {
        var range = request.headers.range;
        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;
        var chunksize = (end-start)+1;
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

        var file = fs.createReadStream(path, {start: start, end: end});
        response.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
    file.pipe(response);
    } else {
        console.log('ALL: ' + total);
        response.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        fs.createReadStream(path).pipe(response);
    }
});

app.get('/video-tag-on-demand', function(request, response) {
    response.redirect('video-tag-on-demand.html');
});

io.on('connection', function(socket){
    console.log('connected');
        socket.on('stream', function(image) {
            console.log('Resending to sreen');
            socket.broadcast.emit('stream', image);
        });
    });



http.listen(3000);