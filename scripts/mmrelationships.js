'use strict';

/*
* @name - the name of the relationship type, which is also used as a class name in the css  
* @directional - if true, the instigator of the relationship does something to the recipient (such as instigator leaves inheritance to the recipient),
* if false then the relationship is mutual, e.g. a marriage 
* @phrase - for displaying a description of the relationship between the instigator and recipient in the form "instigator[phrase]recipient", e.g. phrase could be " is married to "
* @relationshipCalculator - which knows how to assignRandomRelationships and findEnemies for this RelationshipType
*/
function RelationshipType(name, directional, phrase, relationshipCalculator) {
	var _name = name;
	var _directional = directional;
	var _phrase = phrase;
	var _relationshipCalculator = relationshipCalculator;
	
	return {
		aaClassName : "RelationshipType",
		name : _name,
		directional : _directional,
		phrase : _phrase,
		
		assignRandomRelationships : function (suspectCollection) {
			return _relationshipCalculator.assignRandomRelationships(suspectCollection,this);
		},
		
		findEnemies : function (victim, suspectCollection) {
			return _relationshipCalculator.findEnemies(victim, suspectCollection);
		},
		
		revealRelationshipUnderQuestioning : function () {
			return _relationshipCalculator.revealRelationshipUnderQuestioning();
		},
	}
}


/*
* Relationship
* @instigator - one of the Suspects in the Relationship, if applicable, this is the Suspect doing/giving something to the recipient
* @recipient - the other Suspect in the Relationship, if applicable this is the Suspect that is the object of the instigor's action
* @rType - the RelationshipType of this Relationship. TODO: this is new, so now both the Relationship and the RelationshipCollection refer to RelationshipType. 
* Need to refactor to just have RelationshipType referenced in Relationship
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
		aaClassName : "Relationship",
		instigator : _instigator,
		recipient : _recipient,
		relationshipType : _rType,
		
		
		/*
		* suspectInRelationship 
		* @param suspect - a Suspect
		* @return the string 'instagtor' if the suspect is the instigator in the Relationship
		*  or the string 'recipient' if the suspect is the recipient in the Relationship
		*  or false if the suspect isn't in the Relationship
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
		
		/*
		* otherInRelationship
		* @param suspect - the given Suspect
		* @return if the given Suspect is in the Relationship, then this returns the other Suspect in the Relationship
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


/*
* RelationshipView - for displaying a Relationship
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
		visObject.visNetwork = new vis.Network(visObject.visContainer, visObject.visData, visObject.visOptions);
		
		visObject.visNetwork.on( 'click', function(properties) {
			alert('clicked node ' + properties.nodes);
		});
	}
	
	
	/********************
	* public
	*********************/
	return {
		aaClassName : "RelationshipView",
		
		
		/*
		* jQueryLocatorPhrase
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
		
		/*
		* isVisible
		* @return true if the Relationship is currently visible, false if not
		*/
		isVisible : function () {
			return _visible;
		},
		
				
		/*
		* makeVisible - makes the display of the Relationship on the webpage visible
		* relies on 
		* - a css class called invisible
		* - a css class called visible
		* - _jQueryLocatorPhrase specifying a place to find this Relationship on the webpage
		* @param instigator - Suspect who is the instigator in the Relationship
		* @param recipient - Suspect who is the recipient in the Relationship
		* @param rType - the RelationshipType for this Relationship
		* @param visObject - an object with all the stuff related to the vis node display
		* @param callback - a function to run on .colorbox after the other makeVisible stuff is done
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
			
			// vis stuff starts here
			// add new nodes, if needed, for the recipient and instigator
			if ( !visObject.visNodes._getItem(instigator.id) ) {
				visObject.visNodes.add( {id: instigator.id, label: instigator.name} );
			}
			
			if ( !visObject.visNodes._getItem(recipient.id) ) {
				visObject.visNodes.add( {id: recipient.id, label: recipient.name} );
			}
			
			// add an edge between the recipient and instigator
			visObject.visEdges.add( {from: instigator.id, to: recipient.id} );
			
			// old system of having relationships as nodes (looked too messy):
			// add a new node to descibe the relationship itself
			// visObject.visNodes.add( {id: visObject.nextVisId, label: instigator.name + rType.phrase + recipient.name} );
			
			// add new edges
			// visObject.visEdges.add( {from: instigator.id, to: visObject.nextVisId} );
			// visObject.visEdges.add( {from: visObject.nextVisId, to: recipient.id} );
			
			// increment the next available id for the next time we add a node
			// ++visObject.nextVisId; 
			
			visObject.visData = {
				nodes: visObject.visNodes,
				edges: visObject.visEdges,
			};
			
			if (!visObject.visNetwork) {
				initVisNetwork(visObject);
			} else {
				visObject.visNetwork.redraw();
			}
		},
		
		
		/*
		* makeInvisible - makes the display of this Relationship on the webpage visible
		* relies on 
		* - a css class called invisible
		* - a css class called visible
		* - tdLocatorPhrase specifying a place to find this Relationship on the webpage
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

/*
* RelationshipController
* @param relationship - a Relationship (the model)
* @param relationshipview - a RelationshipView (the view)
*/
function RelationshipController(relationship,relationshipView) {
	var _relationship = relationship;
	var _relationshipView = relationshipView;
	
	return {
		aaClassName : "RelationshipController",
		instigator : _relationship.instigator,
		recipient : _relationship.recipient,
		relationshipType : _relationship.relationshipType,
		
		
		/*
		* otherInRelationship
		* @param suspect - the given Suspect
		* @return if the given Suspect is in the Relationship, then this returns the other Suspect in the Relationship
		* otherwise returns false, indicating the given Suspect wasn't in the Relationship
		*/
		otherInRelationship : function (suspect) {
			return _relationship.otherInRelationship(suspect);
		},
		
		/*
		* jQueryLocatorPhrase - set or return a jQuery phrase that finds where the Relationship is displayed on the page
		* @param phrase - (optional) a jQuery string used to locate where the Relationship is displayed in the webpage 
		* @return - if phrase is given, the jQueryLocatorPhrase is set, if not given, it is returned
		*/
		jQueryLocatorPhrase : function (phrase) {
			_relationshipView.jQueryLocatorPhrase(phrase);
		},
		
		/*
		* updateVisibilityDisplay - checks the current value of _visible and makes the display of the Relationship visible or invisible accordingly
		*/
		updateVisibilityDisplay : function () {
			if (_relationshipView.isVisible()) {
				_relationshipView.makeVisible(_relationship.instigator, _relationship.recipient, _relationship.relationshipType);
			} else {
				_relationshipView.makeInvisible();
			}
		},
		
		/* isVisible
		* @return true if the Relationship is currently visible, false if not
		*/
		isVisible : function () {
			return _relationshipView.isVisible();
		},
		
		/*
		* makeVisible - makes the display of the Relationship on the webpage visible
		* relies on 
		* - a css class called invisible
		* - a css class called visible
		* - _jQueryLocatorPhrase specifying a place to find this Relationship on the webpage
		* @param visObject - an object containing all the stuff to do with the vis node display
		* @param callback - a function to run on .colorbox after the other makeVisible stuff is done
		*/
		makeVisible : function (visObject, callback) {
			_relationshipView.makeVisible(_relationship.instigator, _relationship.recipient, _relationship.relationshipType, visObject, callback);
		},
		
		/*
		* suspectInRelationship 
		* @param suspect - a Suspect
		* @return the string 'instagtor' if the suspect is the instigator in the Relationship
		*  or the string 'recipient' if the suspect is the recipient in the Relationship
		*  or false if the suspect isn't in the Relationship
		*/
		suspectInRelationship : function (suspect) {
			return _relationship.suspectInRelationship(suspect);
		}
	}
}

/*
* RelationshipColletion
* a group of Relationships all of the same RelationshipType (used by SuspectCollection)
*/
function RelationshipCollection(relationshipType) {
	var _relationshipType = relationshipType;
	var _relationshipControllers = [];
	
	return {
		aaClassName : "RelationshipCollection",
		length : _relationshipControllers.length,
		
		
		/*
		* getRelationshipType
		* @return - the array of Relationships held in this collection
		*/
		getRelationshipType : function () {
			return _relationshipType;
		},
		
		/*
		* add a single RelationshipController to the collection, ensuring there are no duplicates
		* @param rController - a RelationshipController
		*/
		addRelationshipController : function (rController) {
			if (_relationshipControllers.indexOf(rController) == -1) {
				_relationshipControllers.push(rController);
			}
		},
		
		/*
		* add an array of RelationshipsControllers to the collection, ensuring there are no duplicates, based on the given array of Relationships
		* @param relationshipArray - an array of Relationships objects
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
		
		/*
		* getRelationshipControllers
		* @return - the array of RelationshipControllers held in this collection
		*/
		getRelationshipControllers : function () {
			return _relationshipControllers;
		},
		
		/*
		* clearRelationshipControllers
		* clears out all the RelationshipControllers held in this RelationshipCollection
		*/
		clearRelationshipControllers : function () {
			_relationshipControllers = [];
		}
	}
}


/*
* RelationshipCalculatorInterface
* this is just here to show what RelationshipCalculator objects should implement, not for actual use 
*/
function RelationshipCalculatorInterface() {
	
	return {
		//go thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		assignRandomRelationships : function(suspectCollection,relationshipType) {
			return [];
		},
		
		// creates a list of Suspects who are enemies, from the suspectsArray, that arise from this Relationship
		findEnemies : function (victim, suspectCollection) {
			return []; 
		},
		
		/*
		* revealRelationshipUnderQuestioning - when a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in
		* @return true or false, depending on whether the Suspect will reveal the Relationship
		*/
		revealRelationshipUnderQuestioning : function () {
			return true; // or return false if the Relationship is not going to be revelaed
		}
	}
}


/*
* MarriageRelationshipCalculator implements RelationshipCalculatorInterface
*/ 
function MarriageRelationshipCalculator() {
	
	return {
		aaClassName : "MarriageRelationshipCalculator implements RelationshipCalculatorInterface",
	
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
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
		
		
		/*
		* findEnemies
		* @param victim - the Suspect who was murdered 
		* @param suspectsCollection - the SuspectCollection of the game  
		* @return - a list of enemies, from the suspectsArray, that arise from this Relationship type
		*/
		findEnemies : function (victim, suspectCollection) {
			return []; // no enemies arise directly from a Marriage
		},
		
		
		/*
		* revealRelationshipUnderQuestioning - when a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in
		* @return true or false, depending on whether the Suspect will reveal the Relationship
		*/
		revealRelationshipUnderQuestioning : function () {
			return true; // marriages aren't a secret so Suspects always say when they are married
		}
	}
	
} // end MarriageRelationshipCalculator


/*
* AffairRelationshipCalculator implements RelationshipCalculatorInterface
*/ 
function AffairRelationshipCalculator() {
	
	return {
		aaClassName : "AffairRelationshipCalculator implements RelationshipCalculatorInterface",
		
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
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
		
		
		/*
		* findEnemies
		* @param victim - the Suspect who was murdered 
		* @param suspectsCollection - the SuspectCollection of the game  
		* @return - a list of enemies, from the suspectsArray, that arise from this Relationship type
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
		
		/*
		* revealRelationshipUnderQuestioning - when a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in
		* @return true or false, depending on whether the Suspect will reveal the Relationship
		*/
		revealRelationshipUnderQuestioning : function () {
			return generateRandomBool(0.5); // 50% chance that the Suspect will confess to an affair
		}
	}
} // end AffairRelationshipCalculator


/*
* BlackmailRelationshipCalculator implements RelationshipCalculatorInterface
*/ 
function BlackmailRelationshipCalculator() {
	return {
		aaClassName : "BlackmailRelationshipCalculator implements RelationshipCalculatorInterface",
		
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
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
		
		
		/*
		* findEnemies
		* @param victim - the Suspect who was murdered 
		* @param suspectsCollection - the SuspectCollection of the game  
		* @return - a list of enemies, from the suspectsArray, that arise from this Relationship type
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
		
		/*
		* revealRelationshipUnderQuestioning - when a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in
		* @return true or false, depending on whether the Suspect will reveal the Relationship
		*/
		revealRelationshipUnderQuestioning : function () {
			return generateRandomBool(0.75); // 25% chance that the suspect will reveal a blackmail relationship 
		}
	}
} // BlackmailRelationshipCalculator

		
/*
* InheritanceRelationshipCalculator implements RelationshipCalculatorInterface
*/ 
function InheritanceRelationshipCalculator() {

	return {
		aaClassName : "InheritanceRelationshipCalculator implements RelationshipCalculatorInterface",
		
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
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
		
		/*
		* findEnemies
		* @param victim - the Suspect who was murdered 
		* @param suspectsCollection - the SuspectCollection of the game  
		* @return - a list of enemies, from the suspectsArray, that arise from this Relationship type
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
		
		/*
		* revealRelationshipUnderQuestioning - when a Suspect is "questioned" the Suspect may or may not reveal a Relationship they are in
		* @return true or false, depending on whether the Suspect will reveal the Relationship
		*/
		revealRelationshipUnderQuestioning : function () {
			return generateRandomBool(0.25); // 75% chance that Suspect will reveal an inheritance relationship
		}
	}
} // end InheritanceRelationshipCalculator
