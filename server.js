var express  = require('express');
var http = require('http');
var app = module.exports.app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var scraper = require('table-scraper');
var tabletojson = require('tabletojson');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');

server.listen(3000);



io.sockets.on('connection', function (socket) {
    socket.on('scrap', function (address) {
        console.log("Recieve address", address);

        //scraper
        //    .get(""+address)
        //    .then(function(tableData) {
        //        console.log("Table Data", tableData)
        //    });
        //

            var url = "" + address;


            request(url, function (error, response, html) {


                console.log("Send Request url", url);

                if (!error) {
                    var $ = cheerio.load(html);
                    var tables = $('.mainbox').filter(function () {
                        return $(this);
                    });


                    console.log(tables[0].children[1].children[1].children[1].children[3].children[0].data);
                    console.log(tables[0].children[1].children[1].children[1].children[5].children[0].data);
                    console.log(tables[0].children[1].children[1].children[1].children[7].children[0].data);
                    console.log("+++++++++++++++++++++++++");
                    //console.log(tables[0].children[2]);
                    //console.log("+++++++++++++++++++++++++");
                    //console.log(tables[0].children[1].children[1].children[1].children[0]);
                    //function censor(censor) {
                    //    var i = 0;
                    //
                    //    return function(key, value) {
                    //        if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
                    //            return '[Circular]';
                    //
                    //        if(i >= 50) // seems to be a harded maximum of 30 serialized objects?
                    //            return '[Unknown]';
                    //
                    //        ++i; // so we know we aren't using the original object anymore
                    //
                    //        return value;
                    //    }
                    //}

                    //var toWriteData = JSON.stringify(JSON.parse(tables));
                    //fs.writeFile("./result/result.txt", toWriteData, function(err) {
                    //    if(err) {
                    //        return console.log(err);
                    //    }
                    //
                    //    console.log("The file was saved!");
                    //});

                    //console.log(toWriteData);
                }
            })



    });



});





app.use(express.static(__dirname + '/public'));



app.get('*', function(req, res) {
    res.sendfile('./index.html');
});



console.log("App listening on port 3000");


