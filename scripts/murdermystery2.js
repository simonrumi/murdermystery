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
	
	//the minimum number of Relationships (between Suspects) in a game - use this for game balancing
	MINIMUM_RELATIONSHIPS : 7,
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
	var initialized = false;
	var victimHasEnemies = false;
	
	
	/********************
	* private methods
	*********************/
	
	
		
	/********************
	* public methods
	*********************/
	return {
		
		init : function() {
			if (!initialized) {
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
				
				initialized = true;
			} 
		}, //end init
		
		
	} //end return object from gameController
})();

$(document).ready(function() {
	var suspectsList = suspectCollection.getSuspectsArray();
	var rCollections = suspectCollection.getRelationshipCollections();
	var i;
	var j;
	var row;
	var column;
	var tdLocatorPhrase;
	var position;
	var murderer;
	
	gameController.init();
	
	// first make the row along the top with the first cell blank, since that blank cell will be the top of the column where the vertical suspect names are put
	$('#suspects').append( $('<tr></tr>').append( $('<td></td>') ) );
	
// TODO - we're essentially doing the same thing for the top row and the leftmost column, so make a function for that rather than repeating this code!!!		
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
		 
		// if the suspect is the murderer, add the murderer class
		// if ( suspectsList[i] == suspectCollection.getMurderer() ) {
		// 	$('#suspects').find('tr:last td:last').addClass('murderer');
		// }
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
		}
	}	
		
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
	
	
	// unhide all the relationships
	$('#showAllBtn').click( function() {
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
    $('.clickableHeader').click( function() {    	
    	var suspectid;
    	var suspectPositionInRelationship;
    	var positionSought;
    	var relationshipCoordinates = [];
    	var i;
    	var j;
    	var randomRelationship = [];
    	var relationshipToReveal;
    	
    	// have we clicked on the instigator header or the recipient header?
    	if ( $(this).attr('data-instigatorid') ) {
    		suspectid = Number( $(this).attr('data-instigatorid') );
		// TODO make 'instigator' and 'recipient' into constants    		
    		positionSought = 'instigator';
    	} else if ( $(this).attr('data-recipientid') ) {
    		suspectid = Number( $(this).attr('data-recipientid') );
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
				relationshipToReveal.makeVisible();
			} else {
				alert('Suspect is evading the question');
			}
		} else {
			//TODO: display something cooler than an alert dialog
			alert('Sorry - no relationships to reveal');
		}
		
    });	
	
});