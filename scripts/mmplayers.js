'use strict';

/*
* A Player is a human playing the game
* @name - the player's name
*/
function Player(name) {
	var _name = name;
	
	return {
		aaClassName : "Player",
		name : _name,
	}
}