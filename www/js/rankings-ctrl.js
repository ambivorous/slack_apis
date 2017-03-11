// rankings controller

'use strict';

var angular = require('angular');

module.exports = angular.module('table-tennis.rankingsCtrl', []).controller('rankingsCtrl', [
    '$scope',
    function($scope) {
        $scope.records = [
            {
                display_name: "Potatoe (pot)",
                ranking: 1600
            },
            {
                display_name: "Tomatoe (tom)",
                ranking: 1400
            }
        ];
    }
]);