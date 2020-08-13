const utils = require('./utils');

function apply(params, next)
{
	const chap = params.chap;
	const $ = chap.dom;
	const rem = [];
	
	utils.pruneParagraphs(chap, rem, {
		'Chapter 1: Pilot': [1, 1],
		'Chapter 2: Haggling': [2, 1],
		'Chapter 3: Incursion': [5, 1],
		'Chapter 4: Home': [6, 0],
		'Chapter 5: Intelligence': [7, 0],
		'Chapter 6: Hermes': [8, 0],
		'Chapter 7: Lifeline': [9, 0],
		'Chapter 8: Beachhead': [10, 0],
		'Chapter 9: Promises': [11, 0],
		'Chapter 10: Memories': [12, 0],
		'Chapter 11: Metaphor': [13, 0],
		'Chapter 12: Invasion': [6, 0],
		'Chapter 13: Blitzkrieg': [6, 0],
		'Chapter 14: Patterns': [6, 0],
		'Chapter 15: Sentinel': [6, 0],
		'Chapter 16: Whispers': [6, 0],
		'Chapter 17: Revelations': [6, 0],
		'Chapter 18: Flight (Part 1)': [6, 0],
		'Chapter 18: Flight (Part 2)': [1, 1],
		'Chapter 19: Maneuvers (Part 1)': [6, 0],
		'Chapter 19: Maneuvers (Part 2)': [1, 0],
		'Chapter 20: Fracture': [6, 0],
		'Chapter 21: Homecoming': [7, 0],
		'Chapter 22: Exodus (Part 1)': [7, 0],
		'Chapter 22: Exodus (Part 2)': [1, 0],
		'Chapter 23: Schism (Part 1)': [7, 0],
		'Chapter 23: Schism (Part 2)': [1, 0],
		'Chapter 24: Siege (Part 2)': [0, 1],
		'Chapter 25: Cataclysm (Part 1/3)': [17, 1],
		'Chapter 25: Cataclysm (Part 2/3)': [3, 1],
		'Chapter 25: Cataclysm (Part 3/3)': [3, 1]
	});
	
	utils.removeMatching($, rem, 'p', /^Corridors Wiki Page/gi); 
	utils.removeMatching($, rem, 'p', /^Continued in Part/gi); 
	utils.removeMatching($, rem, 'p', /^(\[)*Continued in the comments/gi); 
	
	if(chap.title == "Chapter 3: Incursion")
		utils.removeMatching($, rem, 'p', /^The battle.*Continued in/gi); 
	
	params.purge(rem);
	next();
}

module.exports =
{
	apply: apply
};
