'use strict';

/*
* global stuff to switch on/off debug logging
*/
var debugLog = true;

function log(message) {
	if (debugLog) {
		console.log(message);
	}
}

/*
* global switch for running test functions or not
*/
var testing = false;

/*
*global variables for the murder mystery logic stored here
*/
var MMVars = {
	// some default Suspects. (Big) TODO - allow user to enter their own Suspects using Facebook
	SuspectNames : ['Barak Obama','Jet Li','David Bowie','Gwen Stefani','Marie Curie','Jane Austen','Taylor Swift','Liam Neeson'],
	SuspectImages : ['img/BarackObama.jpg','img/JetLi.jpg','img/DavidBowie.jpg','img/GwenStefani.jpg','img/MarieCurie.jpg','img/JaneAusten.jpg','img/TaylorSwift.jpg','img/LiamNeeson.jpg'],
	
	//the minimum number of Relationships (between Suspects) in a game - use this for game balancing
	MINIMUM_RELATIONSHIPS : 7,
}


/*
* postJQueryCallback
* used for executing callbacks after jQuery updates.
*/	
jQuery.fn.postJQueryCallback = function (callback, param1) {
	if (callback) {
		callback(param1);
	}
	return this;
}


/*
*	generateRandomBool- a global helper function
*/
var generateRandomBool = function(weight) {
	if (!weight) {
		weight = 0.5;
	}
	
	if ( Math.random() >= weight ) {
		return true;
	} else {
		return false;
	}
}


var gameController = (function() {
	/********************
	* private variables
	*********************/
	var suspectCollection;
	var victimHasEnemies;
	var suspectsList;
	var rCollections;
	
	
	// vis stuff
	var _visNodes;
	var _visEdges;
	var _visContainer;
	var _visData;
	var _visOptions;
	var _visNetwork;
	var _nextVisId;
	var _visObject;
	
	
	
	/********************
	* private methods
	*********************/
	var additionalColorboxFormatting;
	var displaySuspectHeader;
	var displaySuspectRows;
	var initVis;
	
	additionalColorboxFormatting = function (className) {
		// close the colorbox when the user clicks on it anywhere
		$('#cboxContent').click( function() { $.colorbox.close(); } );
		
		//clear out any old class names
		$('#cboxContent').removeClass();
		
		//after the colorbox is updated, set the style of the #cboxContent div
		if (className) {
			$('#cboxContent').addClass(className);
		}
		$('#cboxContent').addClass('popUpDialog');
	}
		
	/*
	* displaySuspectHeader - display a row with cells for one for each Suspect name, where each cell is clickable to "question" that Suspect
	*/
	displaySuspectHeader = function () {
		var i;
		var j;
		var row;
		var column;
		var jQueryLocatorPhrase;
		
		// first make the row along the top with the first cell blank, since that blank cell will be the top of the column where the vertical suspect names are put
		$('#suspects').append( $('<tr></tr>').append( $('<td></td>') ) );
		
		// next iterate through the suspects and enter them in the next cells in the top row		
		for (i in suspectsList) {
			$('#suspects').find('tr:last').append( $('<td></td>').text(suspectsList[i].name) );
			
			column = i;
			column++;
			jQueryLocatorPhrase = '#suspects > tbody > tr:eq(0) > td:eq(' + column + ')';
			$(jQueryLocatorPhrase).addClass('suspect');
			
			// add the clickableHeader class
			$(jQueryLocatorPhrase).addClass('clickableHeader');
			
			// add an attribute indicating the id of this Suspect in the suspectsList
			$(jQueryLocatorPhrase).attr('data-recipientid',i);
			
			// if the suspect is the victim, add the victim class
			if ( suspectsList[i] == suspectCollection.getVictim() ) {;
				$(jQueryLocatorPhrase).addClass('victim');
			}
			
			suspectsList[i].headerLocatorPhrase(jQueryLocatorPhrase);
		}
	}
	
	/*
	* displaySuspectRows - display a series of blank rows, one for each suspect, each row to be the length of the number of suspects, 
	* plus one for the column containing the suspects' names
	*/
	displaySuspectRows = function () {
		var i;
		var j;
		
		// 
		for (i in suspectsList) {
			//first make the row with the first column containing the current suspect's name
			$('#suspects').append( $('<tr></tr>').append( $('<td></td>').text(suspectsList[i].name) ) );
			$('#suspects').find('tr:last td:last').addClass('suspect');
			$('#suspects').find('tr:last td:last').addClass('headerColumn');
			
			// add the clickableHeader class
			// $('#suspects').find('tr:last td:last').addClass('clickableHeader');
			
			// add an attribute indicating the id of this Suspect in the suspectsList
			$('#suspects').find('tr:last td:last').attr('data-instigatorid',i);
			
			//then make additional columns, one for each suspect in the suspectsList
			for (j in suspectsList) {
				$('#suspects').find('tr:last').append( $('<td></td>') );
				
				// if we're within  the triangle of displayable relationships, indicate that
				if (j>i) {
					$('#suspects').find('tr:last td:last').addClass('unknownRelationship');
				}
				// add an attribute indicating the id of this Suspect in the suspectsList
				$('#suspects').find('tr:last td:last').attr('data-recipientid',i);
				$('#suspects').find('tr:last td:last').attr('data-instigatorid',j);
			}
		}	
	}
	
	initVis  = function () {
		_visNodes = new vis.DataSet();
		_visEdges = new vis.DataSet();
		_visContainer = {};
		_visData = {};
		_visOptions = {
			width: '800px',
			height: '600px',
			physics: {}
		};
		_nextVisId = 100;
		
		return {
			'visNodes' : _visNodes, 
			'visEdges' : _visEdges, 
			'visContainer' : _visContainer, 
			'visData' : _visData, 
			'visOptions' : _visOptions, 
			'visNetwork' : _visNetwork, 
			'nextVisId' : _nextVisId
		}
	}
	
	/********************
	* public properties & methods
	*********************/
	return {
		
		visObject : _visObject,
		
		/*
		* init - initialize the game: creates the Suspects list and their randomized Relationships, then assigns a Victim and a Murderer
		*/
		init : function() {
			victimHasEnemies = false;
			suspectCollection = SuspectCollection();
			suspectsList = suspectCollection.getSuspectsArray();
			rCollections = suspectCollection.getRelationshipCollections();
			suspectCollection.init();
			_visObject = initVis();
			
			
			
			if (testing) {
				// TODO create these
				assignTestMarriages();
				assignTestAffairs();
				assignTestBlackmails();
				assignTestInheritances();
				assignTestVictim();
				assignMurderer();
				
			} else {
				
				suspectCollection.assignRandomRelationships();
				
				while (!victimHasEnemies) {
					suspectCollection.assignRandomVictim();
					victimHasEnemies = suspectCollection.assignMurderer();
				}
				
			}
			return suspectCollection;	
				
		}, //end init
		
		/*
		* clearTable - erase the display of all suspects
		*/
		clearTable : function() {
			$('#suspects').empty();
			_visObject = initVis();
			
			_visObject.visData = {
				nodes: _visObject.visNodes,
				edges: _visObject.visEdges,
			};
			
			_visObject.visContainer = document.getElementById('mynetwork');
			
			_visObject.visNetwork = new vis.Network(_visObject.visContainer, _visObject.visData, _visObject.visOptions);
		},
		
		/*
		* createGameBoard - display the new, blank game board
		*/
		createGameBoard : function() {	
			displaySuspectHeader();		
			displaySuspectRows();
			
			//intialize the vis (network display) container
			_visObject.visContainer = document.getElementById('mynetwork');
		}, // end createGameBoard
		
		/*
		* populateGameBoard - put the Relationships between the Suspects into the game board, albeit hidden initially
		*/
		populateGameBoard : function() {
			var i;
			var j;
			var row;
			var column;
			var temp;
			var jQueryLocatorPhrase;
			var position;
			
			// go through all the Relationships and put them in the appropriate cells in the table
			for (i in rCollections) {
				for (j in rCollections[i].getRelationshipControllers()) {
					row = suspectsList.indexOf( rCollections[i].getRelationshipControllers()[j].instigator );
					row++; // increment the row number to account for the first row with the suspect names
					
					column = suspectsList.indexOf( rCollections[i].getRelationshipControllers()[j].recipient );
					column++; // increment the column number to account for the first column with the suspect names
					
					// to place the relationsip in the upper right triangle of the grid (and not in the lower left triangle), the column number must be higher than the row
					// if this is not currently the case then the row and column should be swapped
					if (row > column) {
						temp = column;
						column = row;
						row = temp;
					}
					
					jQueryLocatorPhrase = '#suspects > tbody > tr:eq(' + row + ') > td:eq(' + column + ')';
					
					// in the appropriate cell we are going to make a nested table if it doesn't already exist, so that if there is more than one relationship between the 2 parties, 
					// we can add each relationship in the nested table, one row per relationship
					if ( $(jQueryLocatorPhrase + ' > table').length == 0 ) {
						// put a new table with one row and one column inside the aforementioned appropriate cell
						$(jQueryLocatorPhrase).append( $('<table><tbody><tr><td></td></tr></tbody></table>') );
						// update the jQueryLocatorPhrase to now point to the cell inside the nested table
						jQueryLocatorPhrase += ' > table > tbody > tr:eq(0) > td:eq(0)';
					} else {
						// we already have a nested table in the appropriate cell, so update the jQueryLocatorPhrase to point to it
						jQueryLocatorPhrase += ' > table > tbody';
						// ...and add a new row with a single column inside the nested table
						$(jQueryLocatorPhrase).append( $('<tr><td></td></tr>') );
						
						// finally update the jQueryLocatorPhrase to point to the new cell in the nested table
						position = $(jQueryLocatorPhrase).children('tr').length - 1;
						jQueryLocatorPhrase += ' > tr:eq(' + position + ')';
						position = $(jQueryLocatorPhrase).children('td').length - 1;
						jQueryLocatorPhrase += ' > td:eq(' + position + ')';
					}
					
					//the Relationship can remember the jQueryLocatorPhrase for later access
					rCollections[i].getRelationshipControllers()[j].jQueryLocatorPhrase(jQueryLocatorPhrase);
					
					// depending on the Relationship's visibility, display it or not
					rCollections[i].getRelationshipControllers()[j].updateVisibilityDisplay();
					
					// put the description of the relationship in the newly created, appropriate cell
					$(jQueryLocatorPhrase).text( rCollections[i].getRelationshipControllers()[j].instigator.name + ' ' + rCollections[i].getRelationshipType().phrase + ' ' + rCollections[i].getRelationshipControllers()[j].recipient.name );
					$(jQueryLocatorPhrase).addClass( rCollections[i].getRelationshipType().name );
					
				} // end for loop thru relationships
			} // end for loop thru rCollections
		}, // end populateGameBoard
		
		
		/*
		* when one of the Suspect names is clicked, it is representing questioning that suspect. A Relationship that the Suspect is involved in might be shown
		*/
		questionSuspect : function(evt) {   
			var clickedElement = $(evt.target);	
	    	var suspectid;
	    	var suspectPositionInRelationship;
	    	var positionSought;
	    	var relationshipCoordinates = [];
	    	var i;
	    	var j;
	    	var randomRelationship = [];
	    	var relationshipToReveal;
	    	
	    	// TODO make 'instigator' and 'recipient' into constants 
	    	// have we clicked on the instigator header or the recipient header?
	    	if ( $(clickedElement).attr('data-instigatorid') ) {
	    		suspectid = Number( $(clickedElement).attr('data-instigatorid') );	
	    		positionSought = 'instigator';
	    	} else if ( $(clickedElement).attr('data-recipientid') ) {
	    		suspectid = Number( $(clickedElement).attr('data-recipientid') );
	    		positionSought = 'recipient';
	    	} else {
	    		throw 'Could not find attribute: neither the data-instigatorid nor the data-recipientid exists';
	    	}
	    	
	    	//find all the Relationships with the Suspect in the particular position within the relationship (recipient or instigator, given by positionSought)
	    	for(i in rCollections) {
				for (j in rCollections[i].getRelationshipControllers()) {
					suspectPositionInRelationship = rCollections[i].getRelationshipControllers()[j].suspectInRelationship(suspectsList[suspectid]);
					// collect an array that tells us where to find all the currently invisible relationships for this suspect
					if ( (suspectPositionInRelationship == positionSought)  && (!rCollections[i].getRelationshipControllers()[j].isVisible()) ) {
						relationshipCoordinates.push( [i,j] );
					}
				}
			}
			if (relationshipCoordinates.length > 0) {
				// randomly pick a relationship to reveal
				randomRelationship = getRandomIndex(relationshipCoordinates);
				i = relationshipCoordinates[randomRelationship][0];
				j = relationshipCoordinates[randomRelationship][1];
				relationshipToReveal = rCollections[i].getRelationshipControllers()[j];
				if ( rCollections[i].getRelationshipType().revealRelationshipUnderQuestioning() ) {
					relationshipToReveal.makeVisible(_visObject, additionalColorboxFormatting);
				} else {
					$.colorbox({
						html: '<p>Suspect ' + suspectsList[suspectid].name + ' is evading the question</p>', 
						closeButton: false
					}).postJQueryCallback( additionalColorboxFormatting, 'evading' );
				}
			} else {
				$.colorbox({
					html: '<p> Suspect ' + suspectsList[suspectid].name + ' has no relationships to reveal</p>',
					closeButton: false 
				}).postJQueryCallback( additionalColorboxFormatting, 'noneToReveal' );
			}
		}, // end questionSuspect
		
		
		/*
		* questionRelationship - when one of the cells for the Relationships is clicked a Relationship that involves the 2 Suspects given by the grid location might be shown.
		* Might not use this after all
		*/
		questionRelationship : function(evt) {   
			var clickedElement = $(evt.target);	
	    	var instigatorId = $(clickedElement).attr('data-instigatorid');
	    	var recipientId = $(clickedElement).attr('data-recipientid');
	    	var i;
	    	var j;
	    	var randomRelationship = [];
	    	var instigatorsPossibleRelationships = [];
	    	var recipientsPossibleRelationships = [];
	    	var allPossibleRelationships = [];
	  
	  		// user clikced on a cell representing a relationship with a particular Suspect as instigator and a particular Suspect as recipient
	  		// so look for all the relationships with that pairing
	  		instigatorsPossibleRelationships = suspectCollection.findRelationshipsForSuspect( suspectsList[instigatorId] );
	  		for (i in instigatorsPossibleRelationships) {
	  			if ( (instigatorsPossibleRelationships[i].instigator == suspectsList[instigatorId]) && (instigatorsPossibleRelationships[i].recipient == suspectsList[recipientId]) ) {
	  				allPossibleRelationships.push( instigatorsPossibleRelationships[i] );
	  			}
	  		}
	  		
	  		recipientsPossibleRelationships = suspectCollection.findRelationshipsForSuspect( suspectsList[recipientId] );
	  		for (i in recipientsPossibleRelationships) {
	  			if ( (recipientsPossibleRelationships[i].recipient == suspectsList[recipientId]) && (recipientsPossibleRelationships[i].instigator == suspectsList[instigatorId]) ) {
	  				allPossibleRelationships.push( recipientsPossibleRelationships[i] );
	  			}
	  		}
	  		
	    	if (allPossibleRelationships.length > 0) {
	    		randomRelationship = getRandomIndex(allPossibleRelationships);
	    		if ( allPossibleRelationships[randomRelationship].relationshipType.revealRelationshipUnderQuestioning() ) {
	    			allPossibleRelationships[randomRelationship].makeVisible(_visObject, additionalColorboxFormatting);
	    		} else {
					$.colorbox({
						html: '<p class="evading">Suspect ' + suspectsList[instigatorId].name + ' is evading the question</p>', 
						closeButton: false 
					}).postJQueryCallback( additionalColorboxFormatting );
				}
			} else {
				$.colorbox({
					html: '<p> Suspect ' + suspectsList[instigatorId].name + ' has no relationships to reveal</p>',
					closeButton: false
				}).postJQueryCallback( additionalColorboxFormatting );
			}
		}, // end questionRelationship

		
	} //end return object from gameController
})();

$(document).ready(function() {
	var suspectCollection;
	var rCollections;
	var i;
	var j;
	var murderer;
	
	//initialize the game and gameboard
	suspectCollection = gameController.init();
	gameController.createGameBoard();
	gameController.populateGameBoard();
	
	
	/*
	* clickable buttons start here
	*/
	
	// reset the game
	$('#resetGameBtn').click( function() {
		suspectCollection = gameController.init();
		gameController.clearTable();
		gameController.createGameBoard();
		
		// re-register this click listener, since the suspect buttons have been re-created
		$('.clickableHeader').click( gameController.questionSuspect );	
		
		gameController.populateGameBoard();
    });
    
	
	// unhide all the relationships
	$('#showAllBtn').click( function() {
		rCollections = suspectCollection.getRelationshipCollections();
		for (i in rCollections) {
			for (j in rCollections[i].getRelationshipControllers()) {
				rCollections[i].getRelationshipControllers()[j].makeVisible(gameController.visObject);
			}
		}
    });
    
    
    // highlight the murderer
	$('#showMurdererBtn').click( function() {
		murderer = suspectCollection.getMurderer();
		$( murderer.headerLocatorPhrase() ).addClass('murderer');
    });
    
    
    // when one of the Suspect names is clicked, it is representing questioning that suspect. A Relationship that the Suspect is involved in might be shown
    $('.clickableHeader').click( gameController.questionSuspect );	
    
    // was going to have the grid with the Relationships clickable, but decided against it, for now
    //$('.unknownRelationship').click( gameController.questionRelationship );
	
});
