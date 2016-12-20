var mail = angular.module('scrapServer', []);

function scrapperController($scope, $http) {
    $scope.address = '';


    var socket = io('http://localhost:3000/');
    socket.on('connect',function(){
    });


    socket.onopen = function() {
        console.log("Соединение установлено.");
    };


    $scope.scrap = function (address){
        if  ($scope.address.length == 0) {
            alert("The field url is empty!" +'\n' +'\n' + 'Input correct link, please.');
            return;
        }
        if(!isUrlValid(address)) {
            alert("Check url spelling and try again");
            return;
        }

        socket.emit('scrap', address);
    };


    function isUrlValid(address) {
        var res = address.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return res
    }



}