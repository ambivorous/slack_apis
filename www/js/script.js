// script.js

'use strict';

//var angular = require('angular');

/*var dependencies = [
    require('/rankings-ctrl.js')
];

var app = angular.module('table-tennis', dependencies);*/

var app = angular.module("table-tennis", []);

app.controller("rankingsCtrl", function($scope, $http) {

    function init() {
        $http.get("/slack-apis/table-tennis/rankings/")
        .success(function(data, status, headers, config) {
            var rankings = data.rankings;
            var records = [];
            var displayName;

            for (var i = 0; i < rankings.length; i++) {
                if (rankings[i].nickname) {
                    displayName = rankings[i].nickname + ' (' + rankings[i].username + ')';
                } else {
                    displayName = rankings[i].username;
                }

                records.push({
                    display_name: displayName,
                    ranking: rankings[i].ranking
                });
            }

            $scope.records = records;
        })
        .error(function(data, status, headers, config) {
            console.log("(" + status + ") " + data);
        });
    }

    init();
});