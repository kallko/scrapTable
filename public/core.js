var mail = angular.module('mailServer', []);

function viewArchiveController($scope, $http) {
    $scope.newEmail = false;
    $scope.auth = true;
    $scope.user = '';
    $scope.pass = '';

    var socket = io('http://localhost:3000/');
    socket.on('connect',function(){
    });


    socket.onopen = function() {
        console.log("Соединение установлено.");
    };

    socket.on('sendMail', function (event) {
        console.log("SendMailEvent", event);
    });

    socket.on('login', function (event) {

        $scope.mails = event || [];

        if (typeof (event) == 'object') {
            $scope.auth = false;
        } else {
            $scope.user = '';
            $scope.pass = '';
            alert("Pass incorrect");
        }
        $scope.$apply();
    });

    $scope.isPopupVisible = false;


    $scope.login = function (user, pass){
        socket.emit('login', user, pass);
    };


    $scope.closeEmail = function(){
        $scope.isPopupVisible = false;
        $scope.currentEmail = {};
        $scope.currentEmail.to = '';
        $scope.currentEmail.subj = '';
        $scope.currentEmail.body = '';
        $scope.newEmail = false;
    };

    $scope.deleteEmail = function (mail){
        socket.emit('deleteMail', mail.date);
        $scope.mails = $scope.mails.filter(function(item){
            return item != mail;
        })
    };

    $scope.showEmail = function(email) {
        $scope.currentEmail = {};
        $scope.currentEmail.subj = email.mail.subj;
        $scope.currentEmail.to = email.mail.to;
        $scope.currentEmail.body = email.mail.text;
        $scope.isPopupVisible = true;
        $scope.newEmail = false;
    };


    $scope.createNewEmail = function(){
        $scope.currentEmail = {};
        $scope.isPopupVisible = true;
        $scope.currentEmail.to = '';
        $scope.currentEmail.subj = '';
        $scope.currentEmail.body = '';
        $scope.newEmail = true;

    };

    $scope.sendEmail = function(){
        $scope.newEmail = false;
        if (!checkEmailSpelling($scope.currentEmail.to)){
            alert("Check address spelling, pls");
            return;
        }

        if ($scope.currentEmail.subj.length == 0 ||
            $scope.currentEmail.body.length == 0) {
            if  (!confirm('You dont fill subject or text. Send anyway? ')) return;

        }

        $scope.isPopupVisible = false;
        var mail = {
            "to": $scope.currentEmail.to,
            "subj": $scope.currentEmail.subj,
            "text": $scope.currentEmail.body
        };

        var date = Date.now();
        var email = {
            "mail" : mail,
            "date" : date
        };

        $scope.mails.push(email);
        socket.emit('sendMail', $scope.user, $scope.pass, mail);
    };

    function  checkEmailSpelling(address) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(address);
    }

}