// script.js

'use strict';

//var angular = require('angular');

/*var dependencies = [
    require('/rankings-ctrl.js')
];

var app = angular.module('table-tennis', dependencies);*/

var app = angular.module('table-tennis', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('index', {
            url: '/',
            templateUrl: 'app/views/rankings/rankings.html',
            data: {
                displayName: "Rankings"
            }
        })
        .state('rankings', {
            url: '/rankings',
            templateUrl: 'app/views/rankings/rankings.html',
            data: {
                displayName: "Rankings"
            }
        })
        .state('match-history', {
            url: '/match-history',
            templateUrl: 'app/views/match-history/match-history.html',
            data: {
                displayName: "Match History"
            }
        })
        .state('player', {
            url: '/player',
            templateUrl: 'app/views/player/player.html',
            data: {
                displayName: "Player"
            }
        });
}]);

app.controller('rankingsCtrl', [
    '$scope', '$http',
    function($scope, $http) {

    function init() {
        $http.get('/slack-apis/table-tennis/rankings/')
        .success(function(data, status, headers, config) {
            var rankings = data.rankings;
            var players = [];
            var displayName;

            for (var i = 0; i < rankings.length; i++) {
                if (rankings[i].nickname) {
                    displayName = rankings[i].nickname + ' (' + rankings[i].username + ')';
                } else {
                    displayName = rankings[i].username;
                }

                players.push({
                    index: i + 1,
                    display_name: displayName,
                    ranking: rankings[i].ranking
                });
            }

            $scope.players = players;
        })
        .error(function(data, status, headers, config) {
            console.log("(" + status + ") " + data);
        });
    }

    init();
}]);

app.controller('matchHistoryCtrl', [
    '$scope', '$http',
    function($scope, $http) {

    function init() {
        $http.get('/slack-apis/table-tennis/match-history/')
        .success(function(data, status, headers, config) {
            var matchHistory = data.matchHistory;
            var matches = [];
            var score;

            for (var i = 0; i < matchHistory.length; i++) {
                if (matchHistory[i].nickname) {
                    score = matchHistory[i].nickname + ' (' + matchHistory[i].username + ')';
                } else {
                    score = matchHistory[i].username;
                }

                matches.push({
                    index: i + 1,
                    display_name: score,
                    ranking: rankings[i].ranking
                });
            }

            $scope.matches = matches;
        })
        .error(function(data, status, headers, config) {
            console.log("(" + status + ") " + data);
        });
    }

    init();
}]);