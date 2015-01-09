'use strict';

/*
* A Suspect is a character in the game
* @name - the suspect's name
*/
function Suspect(name) {
	var _name = name;
	var _rowTdLocatorPhrase;
	var _columnTdLocatorPhrase;
	
	return {
		name : _name,
		
		/*
		* rowTdLocatorPhrase
		* @param - (optional) a jQuery string used to locate the the cell this Suspect is displayed in, within the header row along the top of the table 
		* if given, the rowTdLocatorPhrase is set, if not given, it is returned
		*/
		rowTdLocatorPhrase : function (phrase) {
			if (phrase) {
				_rowTdLocatorPhrase = phrase;
			} else {
				return _rowTdLocatorPhrase;
			}
		},
		
		/*
		* columnTdLocatorPhrase
		* @param - (optional) a jQuery string used to locate the the cell this Suspect is displayed in, within the header row along the top of the table 
		* if given, the rowTdLocatorPhrase is set, if not given, it is returned
		*/
		columnTdLocatorPhrase : function (phrase) {
			if (phrase) {
				_columnTdLocatorPhrase = phrase;
			} else {
				return _columnTdLocatorPhrase;
			}
		},
	}
}

/*
* A SuspectCollection contains an array of Suspects for the game
* It knows which Suspect is the victim and which is the murderer
*/
var suspectCollection = (function() {
	
	/****************************
	* private vairables
	*****************************/
	var suspectsArray = [];
	var relationshipCollections = {
		marriages : {}, 
		affairs : {},
		blackmails : {},
		inheritances : {}
	}
	var victim;
	var murderer;
	
	/****************************
	* private methods
	*****************************/
	var initializeRelationshipCollections;
	var resetRelationshipCollections;
	
	/*
	* initializeRelationshipCollections
	* there are a fixed set of RelationshipCollections that are defined here
	*/
	initializeRelationshipCollections = function () {		
		relationshipCollections.marriages = RelationshipCollection( RelationshipType('married', false, ' is married to ', MarriageRelationshipCalculator() ) );
		relationshipCollections.affairs = RelationshipCollection( RelationshipType('affair', false, ' is having an affair with ', AffairRelationshipCalculator() ) );
		relationshipCollections.blackmails = RelationshipCollection( RelationshipType('blackmail', false, ' is blackmailing ', BlackmailRelationshipCalculator() ) );
		relationshipCollections.inheritances = RelationshipCollection( RelationshipType('inheritance', false, ' is leaving money to ', InheritanceRelationshipCalculator() ) );
	}
	
// QQQQQ for some reason the Closure tab in Chrome doesn't show resetRelationshipCollections....can it be run??? what's up???	
	/*
	* resetRelationshipCollections
	* clear out the arrays of Relationships within the RelationshipCollections
	*/	
	resetRelationshipCollections = function () {
		var i;
		for (i in relationshipCollections) {
			relationshipCollections[i].clearRelationships();
		}
	}
	
	
	/********************
	* public methods
	*********************/
	return {
	
		getVictim : function () {
			return victim;
		},
		
		setVictim : function(victim) {
			victim = victim;
		},
		
		getMurderer : function() {
			return murderer;
		},
		
		setMurderer : function(murderer) {
			murderer = murderer;
		},
		
		getSuspectsArray : function() {
			return suspectsArray;
		},
		
		getRelationshipCollections : function() {
			return relationshipCollections;
		},
		
		
		init : function (nameList) {
			initializeRelationshipCollections();
			this.initializeSuspects(nameList);
		},
		
		
		initializeSuspects : function (nameList) {	
			var i;
			if (!nameList) {
				nameList = MMVars.SuspectNames;
			}
			for (i in nameList) {
				suspectsArray.push( Suspect(nameList[i]) );
			}
		},
		
		assignRandomRelationships : function () {
			var i;
			var relationshipCount = 0;
			var enoughRelationships = false;
			var newRelationships = [];
			
			while (!enoughRelationships) {
				for (i in relationshipCollections) {
					newRelationships = relationshipCollections[i].getRelationshipType().assignRandomRelationships(this);
					relationshipCollections[i].addRelationships( newRelationships );
					relationshipCount += relationshipCollections[i].getRelationships().length;
				}
				
				if (relationshipCount < MMVars.MINIMUM_RELATIONSHIPS) {
					// random creation of Relationships hasn't created  enough of them this time, so reset everything and go through the While loop again
					resetRelationshipCollections();
					relationshipCount = 0;
				} else {
					enoughRelationships = true;
				}
			}	
		},
		
		
		assignRandomVictim : function () {
			//randomly choose a victim
			victim = suspectsArray[ getRandomIndex(suspectsArray) ];
			log('adding victim: ' + victim.name);
		},
		
		/*
		* assignMurderer
		*/
		assignMurderer : function () {
			var enemyList =[];
			var i;
			
			for (i in relationshipCollections) {
				enemyList = enemyList.concat( relationshipCollections[i].getRelationshipType().findEnemies(victim,this) );
			}
						
			// if enemy list is not empty, then randomly select murderer from enemies
			if (enemyList.length > 0) {
				murderer = enemyList[ getRandomIndex(enemyList) ];
				log('adding murderer: ' + murderer.name);
				
				return true;
			
			} else {
				return false;
			}
		},
		
		
		/*
		* findRelationshipsForSuspect
		* @param suspect - the Suspect to find Relationships for
		* @return - an array with pointers to the Relationships that involve the given Suspect, within the relationshipCollections
		*/
		findRelationshipsForSuspect : function (suspect) {
			var i;
			var j;
			var suspectRelationships = [];
			for (i in relationshipCollections) {
				for (j in relationshipCollections[i].getRelationships()) {
					if ( (suspect == relationshipCollections[i].getRelationships()[j].instigator) || (suspect == relationshipCollections[i].getRelationships()[j].recipient) ) {
						addToArray(relationshipCollections[i].getRelationships()[j], suspectRelationships);
					}
				}
			}	
		},
		
		
	} // end return of public methods
	
})();