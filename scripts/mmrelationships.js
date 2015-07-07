'use strict';

/**
* There are just a few instances of this; each one describes a kind of relationship, such as a marriage, an affair, blackmail etc.
* @class RelationshipType
* @constructor
* @param {String} name - the name of the relationship type, which is also used as a class name in the css
* @param {Boolean} directional - if true, the instigator of the relationship does something to the recipient (such as instigator leaves inheritance to the recipient),
* if false then the relationship is mutual, e.g. a marriage
* @param {String} phrase - for displaying a description of the relationship between the instigator and recipient in the form "instigator[phrase]recipient", e.g. phrase could be " is married to "
* @param {Function} relationshipCalculator - A function which knows how to assignRandomRelationships and findEnemies for this particular RelationshipType
*/
function RelationshipType(name, directional, phrase, relationshipCalculator) {
	var _name = name;
	var _directional = directional;
	var _phrase = phrase;
	var _relationshipCalculator = relationshipCalculator;

	return {
		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "RelationshipType"
		*/
		aaClassName : "RelationshipType",

		/**
		* The name of the relationship type, which is also used as a class name in the css
		* @property name
		* @type {String}
		*/
		name : _name,

		/**
		* If true, the instigator of the relationship does something to the recipient (such as instigator leaves inheritance to the recipient),
		* if false then the relationship is mutual, e.g. a marriage
		* @property directional
		* @type {Boolean}
		*/
		directional : _directional,

		/**
		* for displaying a description of the relationship between the instigator and recipient in the form "instigator[phrase]recipient",
		* e.g. phrase could be " is married to "
		* @property phrase
		* @type {String}
		*/
		phrase : _phrase,

		/**
		* This randomly assigns Relationships of this RelationshipType to the Suspects in the given suspectCollection.
		* In fact this method simply calls the assignRandomRelationships method of the relationshipCalculator, which implements the specific method for this
		* RelationshipType. This means that the caller of this method doesn't need to know what specific RelationshipType it is dealing with (bridge pattern).
		* @method assignRandomRelationships
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of newly created Relationships
		*/
		assignRandomRelationships : function (suspectCollection) {
			return _relationshipCalculator.assignRandomRelationships(suspectCollection,this);
		},

		/**
		* Figures out  the enemies of the "Suspect" who has been murdred (the victim)
		* In fact this method simply calls the findEnemies method of the relationshipCalculator, which implements the specific method for this
		* RelationshipType. This means that the caller of this method doesn't need to know what specific RelationshipType it is dealing with (bridge pattern).
		* @method findEnemies
		* @param {Suspect} victim The "Suspect" who has been murdered, for whom to identify enemies
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of Suspects who are enemies of the victim
		*/
		findEnemies : function (victim, suspectCollection) {
			return _relationshipCalculator.findEnemies(victim, suspectCollection);
		},

		/**
		* The user clicks on the name of a Suspect in order to "question" that Suspect. The Suspect might reveal a Relationship (s)he is involved in,
		* and this is method is for determining whehter to do so or not.
		* In fact this method simply calls the revealRelationshipUnderQuestioning method of the relationshipCalculator, which implements the specific method for this
		* RelationshipType. This means that the caller of this method doesn't need to know what specific RelationshipType it is dealing with (bridge pattern).
		* @method revealRelationshipUnderQuestioning
		* @return {Boolean} true if a Relationship should be revealed, false if not
		*/
		revealRelationshipUnderQuestioning : function () {
			return _relationshipCalculator.revealRelationshipUnderQuestioning();
		},
	}
}


/**
* A Relationship is the model in the MVC structure that also involves RelationshipView and RelationshipController
* @class Relationship
* @constructor
* @param {Suspect} instigator - one of the Suspects in the Relationship, who is doing/giving something to the recipient in directional Relationships
* @param {Suspect} recipient - the other Suspect in the Relationship, who is the object of the instigor's action in directional Relationships
* @param {RelationshipType} rType - the RelationshipType of this Relationship.
*/
function Relationship(instigator, recipient, rType) {
	// private variables star here
	var _instigator = instigator;
	var _recipient = recipient;
	var _rType = rType;

	 //whether or not this relationship is visible in the webpage
	var _visible = false;


	//public variables & methods start here
	return {
		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "Relationship"
		*/
		aaClassName : "Relationship",

		/**
		* The Suspect that is the instigator of the Relationship (in some Relationships instigators do something to the recipient)
		* @property instigator
		* @type {Suspect}
		*/
		instigator : _instigator,

		/**
		* The Suspect that is the recipient in the Relationship (in some Relationships recipents have something done to them by the instigator)
		* @property recipient
		* @type {Suspect}
		*/
		recipient : _recipient,

		/**
		* The RelationshipType (e.g. marraige, blackmail, etc) that the instigator and recipient are involved in.
		* @property relationshipType
		* @type {RelationshipType}
		*/
		relationshipType : _rType,


		/**
		* @method suspectInRelationship
		* @param {Suspect} suspect
		* @return {String/Boolean} The string 'instagtor' if the suspect is the instigator in the Relationship,
		*  or the string 'recipient' if the suspect is the recipient in the Relationship,
		*  or false if the suspect isn't in the Relationship.
		*/
		suspectInRelationship : function(suspect) {
			if (suspect == _instigator) {
				return 'instigator';
			} else if (suspect == _recipient) {
				return 'recipient';
			} else {
				return false;
			}
		},

		/**
		* @method otherInRelationship
		* @param {Suspect} suspect
		* @return {Suspect/Boolean} if the suspect is in the Relationship, then this returns the other Suspect in the Relationship
		* otherwise returns false, indicating the given Suspect wasn't in the Relationship
		*/
		otherInRelationship : function (suspect) {
			if (suspect == _instigator) {
				return _recipient;
			} else if (suspect == _recipient) {
				return _instigator;
			} else {
				return false;
			}
		}
	}
}


/**
* The View in the MVC setup for Relationships
* @class RelationshipView
* @constructor
*/
function RelationshipView() {

	/****************************
	* private variables
	*****************************/
	//whether or not the Relationship is visible in the webpage
	var _visible = false;

	// a jQuery string used to find where the Relationship is displayed on the page
	var _jQueryLocatorPhrase;


	/****************************
	* private methods
	*****************************/
	var initVisNetwork;

	initVisNetwork = function(visObject) {
		if (MMVARS.showVisDiagram) {
			visObject.visNetwork = new vis.Network(visObject.visContainer, visObject.visData, visObject.visOptions);
			visObject.visNetwork.on( 'click', function(properties) {
				alert('clicked node ' + properties.nodes);
			});
		}
	}

	/********************
	* public
	*********************/
	return {
		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "RelationshipView"
		*/
		aaClassName : "RelationshipView",


		/**
		* Gets or sets a jQuery string used to locate where the Relationship is displayed in the webpage
		* @method jQueryLocatorPhrase
		* @param phrase - (optional) a jQuery string used to locate where the Relationship is displayed in the webpage
		* @return - if phrase is given, the jQueryLocatorPhrase is set, if not given, it is returned
		*/
		jQueryLocatorPhrase : function (phrase) {
			if (phrase) {
				_jQueryLocatorPhrase = phrase;
			} else {
				return _jQueryLocatorPhrase;
			}
		},

		/**
		* @method isVisible
		* @return True if the Relationship is currently visible, false if not
		*/
		isVisible : function () {
			return _visible;
		},


		/**
		* Makes the display of the Relationship on the webpage visible. To do so it
		* relies on
		* - a css class called invisible
		* - a css class called visible
		* - jQueryLocatorPhrase specifying a place to find this Relationship on the webpage
		*
		* @method makeVisible
		* @param {Suspect} instigator The Suspect who is the instigator in the Relationship
		* @param {Suspect} recipient The Suspect who is the recipient in the Relationship
		* @param rType The RelationshipType for this Relationship
		* @param visObject An object with all the stuff related to vis. (Vis is the javascript library that displays the animated network diagram)
		* @param callback A function to run on .colorbox after the other makeVisible stuff is done. (Colorbox is the javascript library that displays the pop-up dialog boxes)
		*/
		makeVisible : function (instigator, recipient, rType, visObject, callback) {
			if (_jQueryLocatorPhrase) {
				$(_jQueryLocatorPhrase).removeClass('invisible');
				$(_jQueryLocatorPhrase).addClass('visible');
				$(_jQueryLocatorPhrase).show(1000);
				_visible = true;

				//configure the popUpDialog
				$('#popUpDialogImage1').html('<img class="suspectimg" src="' + instigator.img + '" width="300px">');
				$('#popUpDialogImage2').html('<img class="suspectimg" src="' + recipient.img + '" width="300px">');
				$('#popUpDialogText').html('<p>' + instigator.name + rType.phrase + recipient.name + '</p>');
				$('#relationshipdisplay > table').removeClass();
				$('#relationshipdisplay > table').addClass(rType.name);

				// now display the popUpDialog using colorbox
				$.colorbox({
					html: $('#relationshipdisplay').html(),
					width: '650px',
					height: '400px',
					speed: 200,
					closeButton: false
				}).postJQueryCallback( callback );

			} else {
				throw 'RelationshipView.makeVisible(): missing jQueryLocatorPhrase';
			}

			if (MMVars.showVisDiagram) {
				// add new nodes, if needed, for the recipient and instigator, colored the same as the background color of the header row
				if ( !visObject.visNodes._getItem(instigator.id) ) {
					visObject.visNodes.add({
						id: instigator.id,
						label: instigator.name,
						color: $(recipient.headerLocatorPhrase()).css('background-color')
					});
				}

				if ( !visObject.visNodes._getItem(recipient.id) ) {
					visObject.visNodes.add({
						id: recipient.id,
						label: recipient.name,
						color: $(recipient.headerLocatorPhrase()).css('background-color')
					});
				}

				// add an edge between the recipient and instigator colored the same as the css class for type of relationship this is
				visObject.visEdges.add({
					from: instigator.id,
					to: recipient.id,
					color: $('#relationshipdisplay > table').css("background-color"),
					width: 5
				});

				visObject.visData = {
					nodes: visObject.visNodes,
					edges: visObject.visEdges,
				};

				if (!visObject.visNetwork) {
					initVisNetwork(visObject);
				} else {
					visObject.visNetwork.redraw();
				}
			}
		},


		/**
		* makes the display of this Relationship on the webpage visible.
		* relies on
		* - a css class called invisible
		* - a css class called visible
		* - jQueryLocatorPhrase specifying a place to find this Relationship on the webpage
		* TODO - this isn't currently used, but if it is needed, then it needs to update the vis stuff as well as the grid of relationships
		*
		* @method makeInvisible
		*/
		makeInvisible : function () {
			if (_jQueryLocatorPhrase) {
				$(_jQueryLocatorPhrase).removeClass('visible');
				$(_jQueryLocatorPhrase).addClass('invisible');
				$(_jQueryLocatorPhrase).hide(250);
				_visible = false;
			} else {
				throw 'RelationshipView.makeInvisible(): missing jQueryLocatorPhrase';
			}
		}
	}
}

/**
* The Controller in the MVC setup for Relationships
* Note this Controller is the central hub, ie it tells the view what to do and the model what to do.
*
* @class RelationshipController
* @constructor
* @param {Relationship} relationship The model
* @param {RelationshipView} relationshipview The view
*/
function RelationshipController(relationship,relationshipView) {
	var _relationship = relationship;
	var _relationshipView = relationshipView;

	return {

		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "RelationshipController"
		*/
		aaClassName : "RelationshipController",

		/**
		* The Suspect that is the instigator of the Relationship (in some Relationships instigators do something to the recipient)
		* @property instigator
		* @type {Suspect}
		*/
		instigator : _relationship.instigator,

		/**
		* The Suspect that is the recipient of the Relationship (in some Relationships instigators do something to the recipient)
		* @property recipient
		* @type {Suspect}
		*/
		recipient : _relationship.recipient,

		/**
		* The RelationshipType of the Relationship
		* @property relationshipType
		* @type {RelationshipType}
		*/
		relationshipType : _relationship.relationshipType,


		/**
		* Note that this method calls the Relationship's otherInRelationship method
		* @method otherInRelationship
		* @param {Suspect} suspect
		* @return {Suspect/Boolean} if the suspect is in the Relationship, then this returns the other Suspect in the Relationship
		* otherwise returns false, indicating the given Suspect wasn't in the Relationship
		*/
		otherInRelationship : function (suspect) {
			return _relationship.otherInRelationship(suspect);
		},



		/**
		* Gets or sets a jQuery string used to locate where the Relationship is displayed in the webpage.
		* Note that this method calls the RelationshipView's jQueryLocatorPhrase method.
		* @method jQueryLocatorPhrase
		* @param {String} phrase - (optional) a jQuery string used to locate where the Relationship is displayed in the webpage
		* @return {String} if phrase is given, the jQueryLocatorPhrase is set, if not given, it is returned
		*/
		jQueryLocatorPhrase : function (phrase) {
			_relationshipView.jQueryLocatorPhrase(phrase);
		},

		/**
		* Checks the current visibility and calls the RelationshipView to either makeVisible or makeInvisible accordingly
		* @method updateVisibilityDisplay
		*/
		updateVisibilityDisplay : function () {
			if (_relationshipView.isVisible()) {
				_relationshipView.makeVisible(_relationship.instigator, _relationship.recipient, _relationship.relationshipType);
			} else {
				_relationshipView.makeInvisible();
			}
		},


		/**
		* Note that this simply calls the RelationshipView's isVisible method
		* @method isVisible
		* @return True if the Relationship is currently visible, false if not
		*/
		isVisible : function () {
			return _relationshipView.isVisible();
		},

		/**
		* makeVisible - makes the display of the Relationship on the webpage visible
		* relies on
		* - a css class called invisible
		* - a css class called visible
		* - _jQueryLocatorPhrase specifying a place to find this Relationship on the webpage
		* @param {Object} visObject An object containing all the stuff to do with the vis node display
		* @param {Function} callback A function to run on .colorbox after the other makeVisible stuff is done (colorbox is the javascript library that displays the pop up dialog)
		*/
		makeVisible : function (visObject, callback) {
			_relationshipView.makeVisible(_relationship.instigator, _relationship.recipient, _relationship.relationshipType, visObject, callback);
		},

		/**
		* Figures out if the given Suspect is either the instigator, recipient, or neither, in the Relationship
		* @method suspectInRelationship
		* @param {Suspect} suspect
		* @return {String/Boolean} 'instagtor' if the suspect is the instigator in the Relationship
		*  or 'recipient' if the suspect is the recipient in the Relationship
		*  or false if the suspect isn't in the Relationship
		*/
		suspectInRelationship : function (suspect) {
			return _relationship.suspectInRelationship(suspect);
		}
	}
}

/**
* A group of Relationships, all of the same RelationshipType. This is used by SuspectCollection.
* @class RelationshipColletion
* @constructor
* @param {RelationshipType} relationshipType The RelationshipType for the Relationships in this collection
*/
function RelationshipCollection(relationshipType) {
	var _relationshipType = relationshipType;
	var _relationshipControllers = [];

	return {

		/**
		* This just gives the name of the class so that it can be more easily seen in the debugger.
		* @property aaClassName
		* @type {String}
		* @default "RelationshipController"
		*/
		aaClassName : "RelationshipCollection",

		/**
		* The number of RelationshipControllers (a proxy for the Relationships) in this collection
		* @property length
		* @type {Number}
		*/
		length : _relationshipControllers.length,


		/**
		* @method getRelationshipType
		* @return {RelationshipType} The RelationshipType of the Relationships in this collection
		*/
		getRelationshipType : function () {
			return _relationshipType;
		},

		/**
		* Adds a single RelationshipController to the collection, ensuring there are no duplicates
		* @method addRelationshipController
		* @param {RelationshipController} rController A RelationshipController to be added to the collection
		*/
		addRelationshipController : function (rController) {
			if (_relationshipControllers.indexOf(rController) == -1) {
				_relationshipControllers.push(rController);
			}
		},

		/**
		* Adds an array of RelationshipsControllers to the collection, ensuring there are no duplicates, based on the given array of Relationships
		* @method addRelationshipControllers
		* @param {Array} relationshipArray An array of Relationship objects to be added to the collection
		*/
		addRelationshipControllers : function (relationshipArray) {
			var i;
			var currentView;
			var currentController;

			for (i in relationshipArray) {
				currentView = RelationshipView();
				currentController = RelationshipController(relationshipArray[i], currentView)
				this.addRelationshipController(currentController);
			}
		},

		/**
		* @method getRelationshipControllers
		* @return {Array} An Array of RelationshipControllers held in this collection
		*/
		getRelationshipControllers : function () {
			return _relationshipControllers;
		},

		/*
		* Clears out all the RelationshipControllers held in this RelationshipCollection
		* @method clearRelationshipControllers
		*/
		clearRelationshipControllers : function () {
			_relationshipControllers = [];
		}
	}
}


/**
* This is just here to show what RelationshipCalculator objects should implement, not for actual use, since Javascript doesn't do interfaces
* @class RelationshipCalculatorInterface
*/
function RelationshipCalculatorInterface() {

	return {
		/**
		* Goes thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		* @method assignRandomRelationships
		* @param {suspectCollection} suspectCollection The collection of suspects in this game, for which random Relationships will be created
		* @param {RelationshipType} relationshipType The type of relationship to randomly create
		* @return - {Array} An array of Relationships of the given RelationshipType
		*/
		assignRandomRelationships : function(suspectCollection,relationshipType) {
			return [];
		},


		/**
		* Figures out  the enemies of the "Suspect" who has been murdred (the victim)
		*
		* @method findEnemies
		* @param {Suspect} victim The "Suspect" who has been murdered, for whom to identify enemies
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of Suspects who are enemies of the victim
		*/
		findEnemies : function (victim, suspectCollection) {
			return [];
		},

		/**
		* When a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in.
		* @method revealRelationshipUnderQuestioning
		* @return {Boolean} true if the Suspect will reveal the Relationship, false otherwise
		*/
		revealRelationshipUnderQuestioning : function () {
			return true; // or return false if the Relationship is not going to be revelaed
		}
	}
}


/**
* Implements RelationshipCalculatorInterface
* @class MarriageRelationshipCalculator
* @constructor
*/
function MarriageRelationshipCalculator() {

	return {
		aaClassName : "MarriageRelationshipCalculator implements RelationshipCalculatorInterface",

		/**
		* Goes thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		* @method assignRandomRelationships
		* @param {suspectCollection} suspectCollection The collection of suspects in this game, for which random Relationships will be created
		* @param {RelationshipType} relationshipType The type of relationship to randomly create
		* @return - {Array} An array of Relationships of the given RelationshipType
		*/
		assignRandomRelationships : function(suspectCollection,relationshipType) {
			log('assigning random marriages');

			var suspectsArray = suspectCollection.getSuspectsArray();
			var remainingSuspects;
			var currentSuspect;
			var spouse;
			var spouseIndex;
			var marriages = [];

			remainingSuspects = shallowClone(suspectsArray);

			// iterate through all the suspects and randomly assign them marraiges or not, to random other suspects
			while (remainingSuspects.length >= 2) {
				// each time we look at a suspect we pop them out of our remainingSuspects list so that they won't be considered for marriage more than once
				currentSuspect = remainingSuspects.pop();

				if( generateRandomBool() ) {
					// if we have randomly decided to have the currentSuspect married, randomly pick another suspect to be married to
					spouseIndex = getRandomIndex(remainingSuspects);
					spouse = remainingSuspects[spouseIndex];

					//remove the spouse from the remaining suspects as the currentSuspect and his/her spouse both can't be married to anyone else
					remainingSuspects.splice(spouseIndex,1);

					marriages.push( Relationship(currentSuspect,spouse,relationshipType) );
					log('assignRandomMarriages: ' + currentSuspect.name + ' is now married to ' + spouse.name);

				} //end if generateRandomBool()
			} //end while loop

			return marriages;
		}, // end assignRandomRelationships


		/**
		* Figures out  the enemies of the "Suspect" who has been murdred (the victim)
		*
		* @method findEnemies
		* @param {Suspect} victim The "Suspect" who has been murdered, for whom to identify enemies
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of Suspects who are enemies of the victim
		*/
		findEnemies : function (victim, suspectCollection) {
			return []; // no enemies arise directly from a Marriage
		},


		/**
		* When a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in.
		* @method revealRelationshipUnderQuestioning
		* @return {Boolean} true if the Suspect will reveal the Relationship, false otherwise
		*/
		revealRelationshipUnderQuestioning : function () {
			return true; // marriages aren't a secret so Suspects always say when they are married
		}
	}

} // end MarriageRelationshipCalculator


/**
* Implements RelationshipCalculatorInterface
* @class AffairRelationshipCalculator
* @constructor
*/
function AffairRelationshipCalculator() {

	return {
		aaClassName : "AffairRelationshipCalculator implements RelationshipCalculatorInterface",

		/**
		* Goes thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		* @method assignRandomRelationships
		* @param {suspectCollection} suspectCollection The collection of suspects in this game, for which random Relationships will be created
		* @param {RelationshipType} relationshipType The type of relationship to randomly create
		* @return - {Array} An array of Relationships of the given RelationshipType
		*/
		assignRandomRelationships : function(suspectCollection,relationshipType) {
			log('assigning random affairs');

			var suspectsArray = suspectCollection.getSuspectsArray();
			var marriageRelationships = suspectCollection.getRelationshipCollections().marriages.getRelationshipControllers();
			var i;
			var currentSuspect;
			var currentSpouse;
			var otherSuspects;
			var randomLoverIndex;
			var affairs = [];

			for (i in marriageRelationships) {
				currentSuspect = marriageRelationships[i].instigator;
				currentSpouse = marriageRelationships[i].recipient;

				// in order to randomly choose someone to be the lover, we need a list of all the suspects except for the married couple
				otherSuspects = shallowClone(suspectsArray);
				otherSuspects = removeFromArray(currentSuspect, otherSuspects);
				otherSuspects = removeFromArray(currentSpouse, otherSuspects);

				if( generateRandomBool() ) {
					//we're assigning an affair to the currentSuspect, so randomly choose a lover from the otherSuspects list
					randomLoverIndex = getRandomIndex(otherSuspects);
					affairs.push( Relationship(currentSuspect, otherSuspects[randomLoverIndex],relationshipType) );

					log('assignRandomAffairs: ' + currentSuspect.name + ' is having an affair with ' + (otherSuspects[randomLoverIndex]).name);

					//remove this lover from the otherSuspects, in case the Spouse also has an affair (see below), the spouse shouldn't have the same lover
					otherSuspects = removeFromArray(otherSuspects[randomLoverIndex], otherSuspects);
				}

				if( generateRandomBool() ) {
					//we're assigning an affair to the currentSpouse, so randomly choose a lover from the otherSuspects list
					randomLoverIndex = getRandomIndex(otherSuspects);
					affairs.push( Relationship(currentSpouse, otherSuspects[randomLoverIndex],relationshipType) );

					log('assignRandomAffairs: ' + currentSpouse.name + ' is having an affair with ' + (otherSuspects[randomLoverIndex]).name);
				}

			}
			return affairs;
		}, // end assignRandomRelationships


		/**
		* Figures out  the enemies of the "Suspect" who has been murdred (the victim)
		*
		* @method findEnemies
		* @param {Suspect} victim The "Suspect" who has been murdered, for whom to identify enemies
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of Suspects who are enemies of the victim
		*/
		findEnemies : function (victim, suspectCollection) {
			var affairRelationships = suspectCollection.getRelationshipCollections().affairs.getRelationshipControllers();
			var marriageRelationships = suspectCollection.getRelationshipCollections().marriages.getRelationshipControllers();
			var i;
			var j;
			var enemies = [];

			// in each affair there are 2 lovers, each with 0 or 1 spouse. The spouses are the enemies (if a lover's spouse found out then (s)he might kill the vitcim out of jealousy)
			for (i in affairRelationships) {
				if ( (victim == affairRelationships[i].instigator) || (victim == affairRelationships[i].recipient) ) {
					// the victim is one of the lovers in this affair, so now find whether the victim has a spouse
					for (j in marriageRelationships) {
						if (victim == marriageRelationships[j].instigator) {
							// the victim ( who is having an affair), is the instigator in this marriage Relationship, so the victim's spouse (the recipient) is an enemy
							enemies.push( marriageRelationships[j].recipient );
							log('adding enemy: ' + marriageRelationships[j].recipient.name + ' was the spouse of ' + victim.name + ' who was having an affair');
						}

						if (victim == marriageRelationships[j].recipient) {
							// the victim ( who is having an affair), is the recipient in this marriage Relationship, so the victim's spouse (the instigator) is an enemy
							enemies.push( marriageRelationships[j].instigator );
							log('adding enemy: ' + marriageRelationships[j].instigator.name + ' was the spouse of ' + victim.name + ' who was having an affair');
						}
					}
				}
			}
			return enemies;
		},

		/**
		* When a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in.
		* @method revealRelationshipUnderQuestioning
		* @return {Boolean} true if the Suspect will reveal the Relationship, false otherwise
		*/
		revealRelationshipUnderQuestioning : function () {
			return generateRandomBool(0.5); // 50% chance that the Suspect will confess to an affair
		}
	}
} // end AffairRelationshipCalculator


/**
* Implements RelationshipCalculatorInterface
* @class BlackmailRelationshipCalculator
* @constructor
*/
function BlackmailRelationshipCalculator() {
	return {
		aaClassName : "BlackmailRelationshipCalculator implements RelationshipCalculatorInterface",

		/**
		* Goes thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		* @method assignRandomRelationships
		* @param {suspectCollection} suspectCollection The collection of suspects in this game, for which random Relationships will be created
		* @param {RelationshipType} relationshipType The type of relationship to randomly create
		* @return - {Array} An array of Relationships of the given RelationshipType
		*/
		assignRandomRelationships : function(suspectCollection,relationshipType) {
			log('assigning random blackmails');

			var suspectsArray = suspectCollection.getSuspectsArray();
			var affairRelationships = suspectCollection.getRelationshipCollections().affairs.getRelationshipControllers();
			var marriageRelationships = suspectCollection.getRelationshipCollections().marriages.getRelationshipControllers();
			var i;
			var j;
			var lookingForCuckhold = true;
			var cuckhold;
			var currentSuspect;
			var lover;
			var potentialBlackmailers = shallowClone(suspectsArray);
			var randomBlackmailerIndex;
			var blackmailers = [];


			// iterate through affairs
			for (i in affairRelationships) {

				if ( generateRandomBool() ) {

					// we're assigning a blackmailer to this affair, so find one of the lovers who has a spouse (since blackmail won't work well on a lover without a spouse)
					j=0;
					while(lookingForCuckhold && j < marriageRelationships.length) {
						cuckhold = marriageRelationships[j].otherInRelationship( affairRelationships[i].instigator );

						if (cuckhold) {
							// we have a cuckhold - specifically the spouse being cheated on by the instigator in the affair
							// so we should consider this affair-instigator the currentSuspect and the recipient the lover
							currentSuspect = affairRelationships[i].instigator;
							lover = affairRelationships[i].recipient;

							lookingForCuckhold = false;

						} else {
							cuckhold = marriageRelationships[j].otherInRelationship( affairRelationships[i].recipient );
							if (cuckhold) {
								// we have a cuckhold - specifically the spouse being cheated on by the recipient in the affair
								// so we should consider this affair-recipient the currentSuspect, and the instigator the lover
								currentSuspect = affairRelationships[i].recipient;
								lover = affairRelationships[i].instigator;

								lookingForCuckhold = false;
							}
						}

						if (!lookingForCuckhold) {
							// we have found the cuckhold, so now remove all involved from the list of potentialBlackmailers
							potentialBlackmailers = removeFromArray(currentSuspect, potentialBlackmailers);
							potentialBlackmailers = removeFromArray(lover, potentialBlackmailers);
							potentialBlackmailers = removeFromArray(cuckhold, potentialBlackmailers);
						}

						j++;
					}

					//also remove the lover's spouse from the list of potentialBlackmailers
					lookingForCuckhold = true;
					j=0;
					while(lookingForCuckhold && j < marriageRelationships.length) {
						cuckhold = marriageRelationships[j].otherInRelationship( lover );

						if (cuckhold) {
							potentialBlackmailers = removeFromArray(cuckhold, potentialBlackmailers);
							lookingForCuckhold = false;
						}

						j++
					}

					// if there is anyone left to be a blackmailer, then randomly pick one:
					if (potentialBlackmailers.length > 0) {
						randomBlackmailerIndex = getRandomIndex(potentialBlackmailers);
						blackmailers.push( Relationship(potentialBlackmailers[randomBlackmailerIndex], currentSuspect, relationshipType) );

						log('assigning random blackmailer: ' + potentialBlackmailers[randomBlackmailerIndex].name + ' is blackmailing ' + currentSuspect.name);
					}
				}
			}

			return blackmailers;

		}, //end assignRandomBlackmails


		/**
		* Figures out  the enemies of the "Suspect" who has been murdred (the victim)
		*
		* @method findEnemies
		* @param {Suspect} victim The "Suspect" who has been murdered, for whom to identify enemies
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of Suspects who are enemies of the victim
		*/
		findEnemies : function (victim, suspectCollection) {
			var blackmailRelationships = suspectCollection.getRelationshipCollections().blackmails.getRelationshipControllers();
			var i;
			var enemies = [];

			// if the victim was blackmailing someone then the blackmailee is an enemy
			for (i in blackmailRelationships) {
				if (victim == blackmailRelationships[i].instigator) {
					enemies.push( blackmailRelationships[i].recipient );
					log('adding enemy ' + blackmailRelationships[i].recipient.name + ' who was being blackmailed by victim ' + blackmailRelationships[i].instigator.name);
				}
			}
			return enemies;
		},

		/**
		* When a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in.
		* @method revealRelationshipUnderQuestioning
		* @return {Boolean} true if the Suspect will reveal the Relationship, false otherwise
		*/
		revealRelationshipUnderQuestioning : function () {
			return generateRandomBool(0.75); // 25% chance that the suspect will reveal a blackmail relationship
		}
	}
} // BlackmailRelationshipCalculator


/**
* Implements RelationshipCalculatorInterface
* @class InheritanceRelationshipCalculator
* @constructor
*/
function InheritanceRelationshipCalculator() {

	return {
		aaClassName : "InheritanceRelationshipCalculator implements RelationshipCalculatorInterface",

		/**
		* Goes thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		* @method assignRandomRelationships
		* @param {suspectCollection} suspectCollection The collection of suspects in this game, for which random Relationships will be created
		* @param {RelationshipType} relationshipType The type of relationship to randomly create
		* @return - {Array} An array of Relationships of the given RelationshipType
		*/
		assignRandomRelationships : function(suspectCollection,relationshipType) {
			log('assigning random inheritances');

			var suspectsArray = suspectCollection.getSuspectsArray();
			var i;
			var otherSuspects;
			var inheritorIndex;
			var inheritances = []

			for (i in suspectsArray) {
				if ( generateRandomBool(0.7) ) {
					// we've randomly decided to have this suspect give an inheritance to another Suspect
					// so we can choose any Suspect to give the money to, except for this current Suspect him/herself
					otherSuspects = shallowClone(suspectsArray);
					otherSuspects = removeFromArray(suspectsArray[i], otherSuspects);
					inheritorIndex = getRandomIndex(otherSuspects);

					inheritances.push( Relationship(suspectsArray[i], otherSuspects[inheritorIndex], relationshipType) );
					log('assigning random inheritance: ' + suspectsArray[i].name + ' is leaving money to ' + otherSuspects[inheritorIndex].name);
				}
			}

			return inheritances;

		},

		/**
		* Figures out  the enemies of the "Suspect" who has been murdred (the victim)
		*
		* @method findEnemies
		* @param {Suspect} victim The "Suspect" who has been murdered, for whom to identify enemies
		* @param {SuspectCollection} suspectCollection The singleton holding the collection of Suspects
		* @return {Array} An array of Suspects who are enemies of the victim
		*/
		findEnemies : function (victim, suspectCollection) {
			var inheritanceRelationships = suspectCollection.getRelationshipCollections().inheritances.getRelationshipControllers();
			var i;
			var enemies = [];

			// if giving an inheritance to a recipient, then the recipient is an enemy (might knock off the victim for the inheritance)
			for (i in inheritanceRelationships) {
				if (victim == inheritanceRelationships[i].instigator) {
					enemies.push( inheritanceRelationships[i].recipient );
					log('adding enemy ' + inheritanceRelationships[i].recipient.name + ' who was getting an inheritance from victim ' + inheritanceRelationships[i].instigator.name);
				}
			}
			return enemies;
		},

		/**
		* When a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in.
		* @method revealRelationshipUnderQuestioning
		* @return {Boolean} true if the Suspect will reveal the Relationship, false otherwise
		*/
		revealRelationshipUnderQuestioning : function () {
			return generateRandomBool(0.25); // 75% chance that Suspect will reveal an inheritance relationship
		}
	}
} // end InheritanceRelationshipCalculator
