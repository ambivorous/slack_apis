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
        .state('player-history', {
            url: '/match-history/:username',
            templateUrl: 'app/views/match-history/match-history.html',
            data: {
                displayName: "Match History"
            }
        })
        .state('player', {
            url: '/player/:username',
            
            views: {
                '': { templateUrl: 'app/views/player/player.html' },
                'match-history@player': {
                    templateUrl: 'app/views/match-history/match-history.html',
                    controller: 'matchHistoryCtrl'
                },
            },
            data: {
                displayName: "Player"
            }
        });
}]);

app.controller('rankingsCtrl', [
    '$scope', '$http',
    function($scope, $http) {

    $scope.heading = "Rankings";

    function init() {
        $http.get('/slack-apis/table-tennis/rankings/')
        .success(function(data, status, headers, config) {
            var rankings = data.rankings;
            var players = [];
            var displayName;

            if (status == 204) {
                return;
            }

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
        $scope.heading = "Match History: " + $stateParams.username;
    } else {
        endpoint = '/slack-apis/table-tennis/match-history/';
        $scope.heading = "Match History";
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

            if (status == 204) {
                return;
            }

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
                    loser_points: loserPoints,
                    winner_username: matchHistory[i].winner,
                    loser_username: matchHistory[i].loser
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

app.controller('playerCtrl', [
    '$scope', '$http', '$stateParams',
    function($scope, $http, $stateParams) {

    $scope.username = $stateParams.username;
    $scope.heading = "Player: " + $scope.username;

    function init() {
        $http.get('/slack-apis/table-tennis/player/' + $scope.username)
        .success(function(data, status, headers, config) {
            if (status == 204) {
                return;
            }

            $scope.nickname = (data.nickname) ? data.nickname : 'None';
            $scope.ranking = data.ranking;
            $scope.games_played = data.games_played;
            $scope.accuracy = data.accuracy;
            $scope.marks_farmed = data.marks_farmed;
        })
        .error(function(data, status, headers, config) {
            console.log("(" + status + ") " + data);
        });
    }

    init();
}]);