'use strict';

var playerModule = angular.module("PlayerModule", []);

playerModule.controller('playerController', function($scope) {
	$scope.players = [];
	
	$scope.addPlayer = function() {
		
		$scope.players.push({
			name: $scope.playerName
		});
		
		// clear input field after the player is added
		$scope.playerName = '';
	}
});