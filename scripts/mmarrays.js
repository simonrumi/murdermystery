'use strict';

/*
* Note that adding a function to the Array prototype seemed to cause that function to be considered an element of the Array
* this is the sort of thing done that caused that error
* Array.prototype.shallowClone = function() {
*	return something;
* }
* ...so for the moment, instead of extending Array, we're just adding some global functions
*/

/*
* get the index of a random element in an array
*/
function getRandomIndex(ar) {
	return Math.floor( Math.random() * ar.length);
}

/*
*this does a shallow clone of an array, ie it doesn't clone the elements of the array
*/
function shallowClone(ar) {
	var i;
	var clonedArray = [];
	for(i=0; i<ar.length; i++) {
		clonedArray.push(ar[i]);
	}
	return clonedArray;
}


/*
* addToArray
* @param value - a single element to be added, provided it is not already in the array
* @param ar - the array to add the value to
*/
function addToArray (value, ar) {
	if (ar.indexOf(value) == -1) {
		ar.push(value);
	}
}


/*
* removeFromArray
* @param value - a single element to be removed
* @param ar - the array to remove the value from
* @return - an array with all instances of the given value removed from the given array  
*/ 
function removeFromArray(value, ar) {
	var i;
	var resultArray = [];
	for(i=0; i<ar.length; i++) {
		if (ar[i] != value) {
			resultArray.push(ar[i]);		
		}	
	}
	return resultArray;
}

