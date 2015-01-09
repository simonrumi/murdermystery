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
		name : _name,
		directional : _directional,
		phrase : _phrase,
		
		assignRandomRelationships : function (suspectCollection) {
			return _relationshipCalculator.assignRandomRelationships(suspectCollection);
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
*/
function Relationship(instigator, recipient) {	
	
	var _instigator = instigator;
	var _recipient = recipient;
	
	 //whether or not this relationship is visible in the webpage
	var _visible = false;
	
	// a string for use by jQuery: where to find this relationship in the web page's table
	var _tdLocatorPhrase;
	
	return {
		instigator : _instigator,
		recipient : _recipient,
		
		/*
		* isVisible
		* @return true if the Relationship is currently visible, false if not
		*/
		isVisible : function () {
			return _visible;
		},
		
		/*
		* tdLocatorPhrase
		* @param - (optional) a jQuery string used to locate the the cell this Relationship is displayed in, in the webpage 
		* if given, the tdLocatorPhrase is set, if not given, it is returned
		*/
		tdLocatorPhrase : function (phrase) {
			if (phrase) {
				_tdLocatorPhrase = phrase;
			} else {
				return _tdLocatorPhrase;
			}
		},
		
		
		/*
		* makeVisible - makes the display of this Relationship on the webpage visible
		* relies on 
		* - a css class called invisible
		* - a css class called visible
		* - tdLocatorPhrase specifying a place to find this Relationship on the webpage
		*/
		makeVisible : function () {
			if (_tdLocatorPhrase) {
				$(_tdLocatorPhrase).removeClass('invisible');
				$(_tdLocatorPhrase).addClass('visible');
				$(_tdLocatorPhrase).show(1000);
				_visible = true;
			} else {
				throw 'could not make Relationship between ' + _instigator + ' and ' + _recipient + ' visible because there was no tdLocatorPhrase';
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
			if (_tdLocatorPhrase) {
				$(_tdLocatorPhrase).removeClass('visible');
				$(_tdLocatorPhrase).addClass('invisible');
				$(_tdLocatorPhrase).hide(250);
				_visible = false;
			} else {
				throw 'could not make Relationship invisible between  ' + _instigator + ' and ' + _recipient + ' because there was no tdLocatorPhrase';
			}
		},
		
		/*
		* setVisibility - checks the current value of _visible and makes the display of the Relationship visible or invisible accordingly
		*/
		setVisibility : function () {
			if (_visible) {
				this.makeVisible();
			} else {
				this.makeInvisible();
			}
		},
		
		/*
		* suspectInRelationship 
		* @param suspect - a Suspect
		* @return the string 'instagtor' if the suspect is the instigator in the Relationship
		*  or the string 'recipient' if the suspect is the recipient in the Relationship
		*  or false if the recipient isn't in the Relationship
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
* RelationshipColletion
* a group of Relationships all of the same RelationshipType (used by SuspectCollection)
*/
function RelationshipCollection(relationshipType) {
	var _relationshipType = relationshipType;
	var _relationships = [];
	
	return {
		//relationshipType : _relationshipType,
		//relationships : _relationships,
		length : _relationships.length,
		
		/*
		* add a single Relationship to the collection, ensuring there are no duplicates
		* @param relationship - a Relationship object
		*/
		addRelationship : function (relationship) {
			if (_relationships.indexOf(relationship) == -1) {
				_relationships.push(relationship);
			}
		},
		
		/*
		* add an array of Relationships to the collection, ensuring there are no duplicates
		* @param relationshipArray - an array of Relationship objects
		*/
		addRelationships : function (relationshipArray) {
			var i;
			for (i in relationshipArray) {
				this.addRelationship( relationshipArray[i] );	
			}
		},
		
		/*
		* getRelationships
		* @return - the array of Relationships held in this collection
		*/
		getRelationships : function () {
			return _relationships;
		},
		
		/*
		* clearRelationships
		* clears out all the relationships held in this RelationshipCollection
		*/
		clearRelationships : function () {
			_relationships = [];
		},
		
		/*
		* getRelationshipType
		* @return - the array of Relationships held in this collection
		*/
		getRelationshipType : function () {
			return _relationshipType;
		},
	}
}


/*
* RelationshipCalculatorInterface
* this is just here to show what Relationship objects should implement, not for actual use 
*/
function RelationshipCalculatorInterface() {
	
	return {
		//go thru the suspectsArray and randomly assign relationships, returning an array of those Relationships
		assignRandomRelationships : function(suspectCollection) {
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
	
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
		*/
		assignRandomRelationships : function(suspectCollection) {
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
					
					marriages.push( Relationship(currentSuspect,spouse) );
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
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
		*/
		assignRandomRelationships : function(suspectCollection) {
			log('assigning random affairs');
			
			var suspectsArray = suspectCollection.getSuspectsArray();
			var marriageRelationships = suspectCollection.getRelationshipCollections().marriages.getRelationships();
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
					affairs.push( Relationship(currentSuspect, otherSuspects[randomLoverIndex]) );
					
					log('assignRandomAffairs: ' + currentSuspect.name + ' is having an affair with ' + (otherSuspects[randomLoverIndex]).name);
					
					//remove this lover from the otherSuspects, in case the Spouse also has an affair (see below), the spouse shouldn't have the same lover
					otherSuspects = removeFromArray(otherSuspects[randomLoverIndex], otherSuspects);
				}
				
				if( generateRandomBool() ) {
					//we're assigning an affair to the currentSpouse, so randomly choose a lover from the otherSuspects list
					randomLoverIndex = getRandomIndex(otherSuspects);
					affairs.push( Relationship(currentSpouse, otherSuspects[randomLoverIndex]) );
					
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
			var affairRelationships = suspectCollection.getRelationshipCollections().affairs.getRelationships();
			var marriageRelationships = suspectCollection.getRelationshipCollections().marriages.getRelationships();
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
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
		*/
		assignRandomRelationships : function(suspectCollection) {
			log('assigning random blackmails');
			
			var suspectsArray = suspectCollection.getSuspectsArray();
			var affairRelationships = suspectCollection.getRelationshipCollections().affairs.getRelationships();
			var marriageRelationships = suspectCollection.getRelationshipCollections().marriages.getRelationships();
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
						blackmailers.push( Relationship(potentialBlackmailers[randomBlackmailerIndex], currentSuspect) );
						
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
			var blackmailRelationships = suspectCollection.getRelationshipCollections().blackmails.getRelationships();
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
		/*
		* assignRandomRelationships 
		* goes thru the suspects and randomly assigns Relationships 
		* @param suspectCollection - the SuspectCollection for this game
		* @return - an array of Relationships
		*/
		assignRandomRelationships : function(suspectCollection) {
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
					
					inheritances.push( Relationship(suspectsArray[i], otherSuspects[inheritorIndex]) );
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
			var inheritanceRelationships = suspectCollection.getRelationshipCollections().inheritances.getRelationships();
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
