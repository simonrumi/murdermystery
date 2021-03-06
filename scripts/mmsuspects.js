'use strict';

/**
* A Suspect is a character in the game, which includes all the suspects as well as the murder and the victim
* @class Suspect 
* @constructor
* @param {Number} id A unique identifier of the Suspect. This is also the position of the Suspect in the suspectsArray
* @param {String} name The Suspect's name
* @param {String} img The url of an image of the Suspect
*/
function Suspect(id,name,img) {
	var _id = id;
	var _name = name;
	var _img = img;
	var _headerLocatorPhrase;
	var _columnTdLocatorPhrase;
	
	return {
		
		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "Suspect"
		*/
		aaClassName : "Suspect",
		
		/**
		* A unique identifier of the Suspect. This is also the position of the Suspect in the suspectsArray 
		* @property id
		* @type {Number}
		*/
		id : _id,
		
		/**
		* The Suspect's name 
		* @property name
		* @type {String}
		*/
		name : _name,
		
		/**
		* The url of an image of the Suspect
		* @property img 
		* @type {String}
		*/
		img : _img,
		
		
		/**
		* Gets or sets the jQuery string used to locate the the cell this Suspect is displayed in, within the header row along the top of the table  
		* @method headerLocatorPhrase
		* @param {String} phrase the jQuery string (optional) 
		* @return {String} if phrase isn't given, the headerLocatorPhrase is returned
		*/
		headerLocatorPhrase : function (phrase) {
			if (phrase) {
				_headerLocatorPhrase = phrase;
			} else {
				return _headerLocatorPhrase;
			}
		},
		
		/*
		* TODO this might be unused now...probably get rid of this
		* columnTdLocatorPhrase
		* @param - (optional) a jQuery string used to locate the the cell this Suspect is displayed in
		* if given, the columnTdLocatorPhrase is set, if not given, it is returned
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

/**
* A SuspectCollection contains an array of Suspects for the game.
* It knows which Suspect is the victim and which is the murderer
* @class SuspectCollection 
* @constructor
*/
function SuspectCollection() {
	
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
	* TODO put these in a JSON config file
	*/
	initializeRelationshipCollections = function () {		
		relationshipCollections.marriages = RelationshipCollection( RelationshipType('married', false, ' is married to ', MarriageRelationshipCalculator() ) );
		relationshipCollections.affairs = RelationshipCollection( RelationshipType('affair', false, ' is having an affair with ', AffairRelationshipCalculator() ) );
		relationshipCollections.blackmails = RelationshipCollection( RelationshipType('blackmail', false, ' is blackmailing ', BlackmailRelationshipCalculator() ) );
		relationshipCollections.inheritances = RelationshipCollection( RelationshipType('inheritance', false, ' is leaving money to ', InheritanceRelationshipCalculator() ) );
	}
	
	/*
	* resetRelationshipCollections
	* clear out the arrays of Relationships within the RelationshipCollections
	*/	
	resetRelationshipCollections = function () {
		var i;
		for (i in relationshipCollections) {
			relationshipCollections[i].clearRelationshipControllers();
		}
	}
	
	
	/********************
	* public methods
	*********************/
	return {
		
		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "SuspectCollection"
		*/
		aaClassName : "SuspectCollection",
		
		/**
		* @method getVictim
		* @return {Suspect} the Suspect who is the murder victim
		*/
		getVictim : function () {
			return victim;
		},
		
		/**
		* @method setVictim
		* @param {Suspect} victim Sets this Suspect as the murder victim 
		*/
		setVictim : function(victim) {
			victim = victim;
		},
		
		/**
		* @method getMurderer
		* @return {Suspect} the Suspect who is the murderer
		*/
		getMurderer : function() {
			return murderer;
		},
		
		/**
		* @method setMurderer
		* @param {Suspect} murderer Sets this Suspect as the murderer
		*/
		setMurderer : function(murderer) {
			murderer = murderer;
		},
		
		/**
		* @method getSuspectsArray
		* @return {Array} The Array of all the Suspects in the game
		*/
		getSuspectsArray : function() {
			return suspectsArray;
		},
		
		/**
		* relationshipCollections is a hash where each entry is a RelationshipCollection of a particular RelationshipType, like this:
		* relationshipCollections = {
		*	marriages : {}, 
		*	affairs : {},
		*	blackmails : {},
		*	inheritances : {}
		* }
		*
		* @method getRelationshipCollections
		* @return {Object} A hash where each entry is a RelationshipCollection of a particular RelationshipType
		*/
		getRelationshipCollections : function() {
			return relationshipCollections;
		},
		
		
		/**
		* Initializes the RelationshipCollections and list of Suspects
		* @method init
		* @param {Array} nameList An Array of Suspect names. Optional - if not given then a default namelist (of famous people) will be used
		*/
		init : function (nameList) {
			initializeRelationshipCollections();
			this.initializeSuspects(nameList);
		},
		
		
		/**
		* Initializes the list of Suspects
		* @method initializeSuspects
		* @param {Array} nameList An Array of Suspect names. Optional - if not given then a default namelist (of famous people) will be used
		*/
		initializeSuspects : function (nameList) {	
			var i;
			var imgList = MMVars.SuspectImages; //temp way for getting images
			if (!nameList) {
				nameList = MMVars.SuspectNames;
			}
			for (i in nameList) {
				suspectsArray.push( Suspect(i, nameList[i], MMVars.SuspectImages[i]) );
			}
		},
		
		/**
		* Randomly creates Relationships for all the RelationshipTypes in the relationshipCollections
		* @method assignRandomRelationships
		*/
		assignRandomRelationships : function () {
			var i;
			var relationshipCount = 0;
			var enoughRelationships = false;
			var newRelationships = [];
			
			while (!enoughRelationships) {
				for (i in relationshipCollections) {
					newRelationships = relationshipCollections[i].getRelationshipType().assignRandomRelationships(this);
					relationshipCollections[i].addRelationshipControllers( newRelationships );
					relationshipCount += relationshipCollections[i].getRelationshipControllers().length;
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
		
		
		/**
		* Randomly assigns one of the Suspects in the suspectsArray to be the murder victim
		* @method assignRandomVictim
		*/
		assignRandomVictim : function () {
			//randomly choose a victim
			victim = suspectsArray[ getRandomIndex(suspectsArray) ];
			log('adding victim: ' + victim.name);
		},
		
		/**
		* Randomly assigns one of the Suspects in the suspectsArray to be the murderer
		* @method assignMurderer
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
		
		
		/**
		* Finds Relationsships that the given Suspect is involved in
		* @method findRelationshipsForSuspect
		* @param {Suspect} suspect The Suspect to find Relationships for
		* @return {Array} An array of Relationships from the relationshipCollections, that involve the given Suspect
		*/
		findRelationshipsForSuspect : function (suspect) {
			var i;
			var j;
			var suspectRelationships = [];
			for (i in relationshipCollections) {
				for (j in relationshipCollections[i].getRelationshipControllers()) {
					if ( (suspect == relationshipCollections[i].getRelationshipControllers()[j].instigator) || (suspect == relationshipCollections[i].getRelationshipControllers()[j].recipient) ) {
						addToArray(relationshipCollections[i].getRelationshipControllers()[j], suspectRelationships);
					}
				}
			}
			return suspectRelationships;	
		},
		
		
	} // end return of public methods
	
};