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
        .state('match-history.player', {
            url: '/:username',
            templateUrl: 'app/views/match-history/match-history.html',
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
                    username: rankings[i].username,
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
    '$scope', '$http', '$stateParams',
    function($scope, $http, $stateParams) {
    var endpoint;

    if ($stateParams.username) {
        endpoint = '/slack-apis/table-tennis/match-history/' + $stateParams.username;
    } else {
        endpoint = '/slack-apis/table-tennis/match-history/';
    }

    function init() {
        $http.get(endpoint)
        .success(function(data, status, headers, config) {
            var matchHistory = data.matchHistory;
            var matches = [];
            var winnerDisplay;
            var loserDisplay;
            var winnerPoints;
            var loserPoints;
            var score;

            for (var i = 0; i < matchHistory.length; i++) {
                if (matchHistory[i].winner_nickname) {
                    winnerDisplay = matchHistory[i].winner_nickname + ' (' + matchHistory[i].winner + ')';
                } else {
                    winnerDisplay = matchHistory[i].winner;
                }

                if (matchHistory[i].loser_nickname) {
                    loserDisplay = matchHistory[i].loser_nickname + ' (' + matchHistory[i].loser + ')';
                } else {
                    loserDisplay = matchHistory[i].loser;
                }

                if (matchHistory[i].ranking_change >= 0) {
                    winnerPoints = "(+" + Math.abs(matchHistory[i].ranking_change) + ")";
                    loserPoints = "(-" + Math.abs(matchHistory[i].ranking_change) + ")";
                } else {
                    winnerPoints = "(-" + Math.abs(matchHistory[i].ranking_change) + ")";
                    loserPoints = "(+" + Math.abs(matchHistory[i].ranking_change) + ")";
                }

                score = matchHistory[i].winner_wins + ' - ' + matchHistory[i].loser_wins;

                matches.push({
                    date: matchHistory[i].date,
                    winner: winnerDisplay,
                    score: score,
                    loser: loserDisplay,
                    winner_points: winnerPoints,
                    loser_points: loserPoints
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