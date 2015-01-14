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
	SuspectNames : ['Barak Obama','Jet Li','David Bowie','Gwen Stefani','Marie Curie','Jane Austen','Taylor Swift','Liam Neeson'],
	
	SuspectImages : ['img/BarackObama.jpg','img/JetLi.jpg','img/DavidBowie.jpg','img/GwenStefani.jpg','img/MarieCurie.jpg','img/JaneAusten.jpg','img/TaylorSwift.jpg','img/LiamNeeson.jpg'],
	
	//the minimum number of Relationships (between Suspects) in a game - use this for game balancing
	MINIMUM_RELATIONSHIPS : 7,
}


/*
* postJQueryCallback
* used for executing callbacks after jQuery updates. For use something like this:
*
* 	$.colorbox({html: '<p>added paragraph</p>'}).postJQueryCallback(function () {
*		//after the colorbox is updated, set the bg color of the cboxContent div
		$('#cboxContent').css("background-color","#ffffff");
*	});
* 
*/	
jQuery.fn.postJQueryCallback = function (callback) {
	if (callback) {
		callback();
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
	var i;
	var j;
	var row;
	var column;
	var tdLocatorPhrase;
	var position;
	var murderer;
	
	/********************
	* private methods
	*********************/
	var additionalColorboxFormatting;
	
	additionalColorboxFormatting = function () {
		// close the colorbox when the user clicks on it anywhere
		$('#cboxContent').click( function() { $.colorbox.close(); } );
		
		//after the colorbox is updated, set the style of the #cboxContent div that contains the majority of the 
		$('#cboxContent').addClass('popUpDialog');
	}
		
	/********************
	* public methods
	*********************/
	return {
		
		init : function() {
			victimHasEnemies = false;
			suspectCollection = SuspectCollection();
			suspectsList = suspectCollection.getSuspectsArray();
			rCollections = suspectCollection.getRelationshipCollections();
			suspectCollection.init();
			
			if (testing) {
				
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
		
		clearTable : function() {
			$('#suspects').empty();
		},
		
		
		createGameBoard : function() {
			// first make the row along the top with the first cell blank, since that blank cell will be the top of the column where the vertical suspect names are put
			$('#suspects').append( $('<tr></tr>').append( $('<td></td>') ) );
			
			// next iterate through the suspects and enter them in the next cells in the top row		
			for (i in suspectsList) {
				$('#suspects').find('tr:last').append( $('<td></td>').text(suspectsList[i].name) );
				
				column = i;
				column++;
				tdLocatorPhrase = '#suspects > tbody > tr:eq(0) > td:eq(' + column + ')';
				$(tdLocatorPhrase).addClass('suspect');
				
				// add the clickableHeader class
				$(tdLocatorPhrase).addClass('clickableHeader');
				
				// add an attribute indicating the id of this Suspect in the suspectsList
				$(tdLocatorPhrase).attr('data-recipientid',i);
				
				// if the suspect is the victim, add the victim class
				if ( suspectsList[i] == suspectCollection.getVictim() ) {;
					$(tdLocatorPhrase).addClass('victim');
				}
				
				suspectsList[i].rowTdLocatorPhrase(tdLocatorPhrase);
			}
			
			// now fill out a series of blank rows, one for each suspect, each row to be the length of the number of suspects, plus one for the column containing the suspects' names
			for (i in suspectsList) {
				//first make the row with the first column containing the current suspect's name
				$('#suspects').append( $('<tr></tr>').append( $('<td></td>').text(suspectsList[i].name) ) );
				$('#suspects').find('tr:last td:last').addClass('suspect');
				$('#suspects').find('tr:last td:last').addClass('headerColumn');
				
				// add the clickableHeader class
				$('#suspects').find('tr:last td:last').addClass('clickableHeader');
				
				// add an attribute indicating the id of this Suspect in the suspectsLis
				$('#suspects').find('tr:last td:last').attr('data-instigatorid',i);
				
				//then make additional columns, one for each suspect in the suspectsList
				for (j in suspectsList) {
					$('#suspects').find('tr:last').append( $('<td></td>') );
					$('#suspects').find('tr:last td:last').addClass('unknownRelationship');
					// add an attribute indicating the id of this Suspect in the suspectsList
					$('#suspects').find('tr:last td:last').attr('data-recipientid',i);
					$('#suspects').find('tr:last td:last').attr('data-instigatorid',j);
				}
			}	
		}, // end createHeaderRowAndColumn
		
		
		populateGameBoard : function() {
			// go through all the Relationships and put them in the appropriate cells in the table
			// specifically we are placing the relationship in the row of the instigator and the column of the recipient
			for (i in rCollections) {
				for (j in rCollections[i].getRelationships()) {
					row = suspectsList.indexOf( rCollections[i].getRelationships()[j].instigator );
					row++; // increment the row number to account for the first row with the suspect names
					
					column = suspectsList.indexOf( rCollections[i].getRelationships()[j].recipient );
					column++; // increment the column number to account for the first column with the suspect names
					
					try {
						tdLocatorPhrase = '#suspects > tbody > tr:eq(' + row + ') > td:eq(' + column + ')';
						
						// in the appropriate cell we are going to make a nested table if it doesn't already exist, so that if there is more than one relationship between the 2 parties, 
						// we can add each relationship in the nested table, one row per relationship
						if ( $(tdLocatorPhrase + ' > table').length == 0 ) {
							// put a new table with one row and one column inside the aforementioned appropriate cell
							$(tdLocatorPhrase).append( $('<table><tbody><tr><td></td></tr></tbody></table>') );
							// update the tdLocatorPhrase to now point to the cell inside the nested table
							tdLocatorPhrase += ' > table > tbody > tr:eq(0) > td:eq(0)';
						} else {
							// we already have a nested table in the appropriate cell, so update the tdLocatorPhrase to point to it
							tdLocatorPhrase += ' > table > tbody';
							// ...and add a new row with a single column inside the nested table
							$(tdLocatorPhrase).append( $('<tr><td></td></tr>') );
							
							// finally update the tdLocatorPhrase to point to the new cell in the nested table
							position = $(tdLocatorPhrase).children('tr').length - 1;
							tdLocatorPhrase += ' > tr:eq(' + position + ')';
							position = $(tdLocatorPhrase).children('td').length - 1;
							tdLocatorPhrase += ' > td:eq(' + position + ')';
						}
						
						//the Relationship can remember the tdLocatorPhrase for later access
						rCollections[i].getRelationships()[j].tdLocatorPhrase(tdLocatorPhrase);
						
						// depending on the Relationship's visibility, display it or not
						rCollections[i].getRelationships()[j].setVisibility();
						
						// put the description of the relationship in the newly created, appropriate cell
						$(tdLocatorPhrase).text( rCollections[i].getRelationships()[j].instigator.name + ' ' + rCollections[i].getRelationshipType().phrase + ' ' + rCollections[i].getRelationships()[j].recipient.name );
						$(tdLocatorPhrase).addClass( rCollections[i].getRelationshipType().name );
					} catch(err) {
						alert('could not properly complete table because: ' + err)
					}
				} // end for loop thru relationships
			} // end for loop thru rCollections
		}, // end populateGameBoard
		
		
		// when one of the Suspect names is clicked, it is representing questioning that suspect. A Relationship that the Suspect is involved in might be shown
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
	    	
	    	// have we clicked on the instigator header or the recipient header?
	    	if ( $(clickedElement).attr('data-instigatorid') ) {
	    		suspectid = Number( $(clickedElement).attr('data-instigatorid') );
			// TODO make 'instigator' and 'recipient' into constants    		
	    		positionSought = 'instigator';
	    	} else if ( $(clickedElement).attr('data-recipientid') ) {
	    		suspectid = Number( $(clickedElement).attr('data-recipientid') );
	    		positionSought = 'recipient';
	    	} else {
	    		throw 'Could not find attribute: neither the data-instigatorid nor the data-recipientid exists';
	    	}
	    	
	    	//find all the Relationships with the Suspect in the particular position within the relationship (recipient or instigator, given by positionSought)
	    	for(i in rCollections) {
				for (j in rCollections[i].getRelationships()) {
					suspectPositionInRelationship = rCollections[i].getRelationships()[j].suspectInRelationship(suspectsList[suspectid]);
					// collect an array that tells us where to find all the currently invisible relationships for this suspect
					if ( (suspectPositionInRelationship == positionSought)  && (!rCollections[i].getRelationships()[j].isVisible()) ) {
						relationshipCoordinates.push( [i,j] );
					}
				}
			}
			if (relationshipCoordinates.length > 0) {
				// randomly pick a relationship to reveal
				randomRelationship = getRandomIndex(relationshipCoordinates);
				i = relationshipCoordinates[randomRelationship][0];
				j = relationshipCoordinates[randomRelationship][1];
				relationshipToReveal = rCollections[i].getRelationships()[j];
				if ( rCollections[i].getRelationshipType().revealRelationshipUnderQuestioning() ) {
					relationshipToReveal.makeVisible(additionalColorboxFormatting);
				} else {
					$.colorbox({
						html: '<p>Suspect ' + suspectsList[suspectid].name + ' is evading the question</p>', 
						closeButton: false
					}).postJQueryCallback( additionalColorboxFormatting );
				}
			} else {
				$.colorbox({
					html: '<p> Suspect ' + suspectsList[suspectid].name + ' has no relationships to reveal</p>',
					closeButton: false 
				}).postJQueryCallback( additionalColorboxFormatting );
			}
			
			// might want to put this in some other place
			//$('#cboxContent').css("background-color","#ffffff");
		}, // end questionSuspect
		
		
		// when one of the cells for the Relationships is clicked a Relationship that involves the 2 Suspects given by the grid location might be shown
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
	    			allPossibleRelationships[randomRelationship].makeVisible(additionalColorboxFormatting);
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
		gameController.populateGameBoard();
    });
    
	
	// unhide all the relationships
	$('#showAllBtn').click( function() {
		rCollections = suspectCollection.getRelationshipCollections();
		for (i in rCollections) {
			for (j in rCollections[i].getRelationships()) {
				rCollections[i].getRelationships()[j].makeVisible();
			}
		}
    });
    
    
    // highlight the murderer
	$('#showMurdererBtn').click( function() {
		murderer = suspectCollection.getMurderer();
		$( murderer.rowTdLocatorPhrase() ).addClass('murderer');
    });
    
    
    // when one of the Suspect names is clicked, it is representing questioning that suspect. A Relationship that the Suspect is involved in might be shown
    $('.clickableHeader').click( gameController.questionSuspect );	
    
    // was going to have the grid with the Relationships clickable, but decided against it, for now
    //$('.unknownRelationship').click( gameController.questionRelationship );
	
});