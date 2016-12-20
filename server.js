var express  = require('express');
var http = require('http');
var app = module.exports.app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var url = 'mongodb://localhost:27017/test';
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');


server.listen(3000);

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.close();
});

io.sockets.on('connection', function (socket) {
    socket.on('login', function (user, pass) {
        checkLogin(user, pass, function(data, result){
            if(!result) data = result;
            socket.emit('login', data);
        });

    });

    socket.on('sendMail', function (user, pass, mail) {

        var transporter = nodemailer.createTransport('smtps://'+user+'%40'+'gmail.com:'+pass+'@smtp.gmail.com');

        var mailOptions = {
            from: '<'+ user + '@gmail.com>',
            to: mail.to,
            subject: mail.subj,
            text: mail.text,
            html: '<b>'+ mail.text + '</b>'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }

            console.log('Message sent: ' + info.response);

            insertNewMail(user, mail, function(){
                var data = {resp: true};
                socket.emit('sendMail', data);
            });

        });

    });

    socket.on('deleteMail', function (id) {
        deleteMail(id);
    });

    socket.on('disconnect', function () {
        console.log("Disconnect");
    });


});





app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());


app.get('*', function(req, res) {
    res.sendfile('./index.html'); // load the single view file (angular will handle the page changes on the front-end)
});



console.log("App listening on port 3000");


var insertUser = function(db, user, pass, callback) {
    db.collection('users').insertOne( {
        "name" : user,
        "password" : pass
    }, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a user into the users collection.");
        callback();
    });
};



var findMails = function(user, data, callback) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection('mails').find();
        cursor.each(function (err, doc) {
            assert.equal(err, null);
            if (doc != null) {
                if (doc.user == user) data.push(doc)
            } else {
                callback(data);
            }
        });
    })
};



var findUsers = function(db, user, pass, result, callback) {
    var cursor = db.collection('users').find( );
    cursor.each(function(err, doc) {
        assert.equal(err, null);
        if (doc != null) {
            if (doc.name == user && !result){
                result = false;
                if (doc.password == pass){
                    result = true;
                }
            }
        } else {
            console.log("Find user", result);
            callback(result);
        }
    });
};




function checkLogin(user, pass, callback) {
    console.log("start login checking");
    var result = undefined;
    var data = undefined;
    if (!user || !pass) return false;
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        findUsers(db, user, pass, result, function(result) {
            if  (result == undefined) {
                console.log("Create new User");
                createNewUser(user, pass);
                data = [];
            }
            if (!result) {
                callback(data, result);
                return;
            }

            findMails(user, [], function(data){
                callback(data, result);
            });
            db.close();
        });
    });

}



function createNewUser(user, pass) {
    MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    insertUser(db, user, pass, function() {
        db.close();
    });

});
}

function insertNewMail(user, mail, callback){
    console.log("Start insert new Mail");
    MongoClient.connect(url, function(err, db) {
        var date = Date.now();

        var insertMail = function(db, user, mail, callback) {
        db.collection('mails').insertOne( {
            "user" : user,
            "mail" : mail,
            "date" : date
        }, function(err, result) {
            assert.equal(err, null);
            console.log("Inserted a mail into the users mails collection.");
            callback();
        });
    };
        insertMail(db, user, mail, callback);
        db.close();


})
}

function deleteMail (id) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        removeMail(db, id, function() {
            db.close();
        });
    });

    var removeMail = function(db, id, callback) {
        db.collection('mails').deleteOne(
            { "date": id},
            function(err, results) {
                //console.log("Deleting results",results);
                callback();
            }
        );
    };
}

