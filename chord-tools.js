//////////////////////////////////////////
//
// SYNTH CONFIG
//
//////////////////////////////////////////

var Tone = window.Tone;

var synth = new Tone.PolySynth(
	6, 
	Tone.SimpleSynth, {
		"oscillator" : {
			"partials" : [0, 2, 3, 4],
		}
	}
);

synth.toMaster();

//////////////////////////////////////////
//
// GLOBAL MUSIC DEFINITIONS
//
//////////////////////////////////////////

var pitches = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

// Half step intervals relative to root
var chords = {
	'maj': [0, 4, 7],
	'min': [0, 3, 7],
	'dim': [0, 3, 6],
	'aug': [0, 4, 8],
	'sus2': [0, 2, 7],
	'sus4': [0, 5, 7],
	'7sus2': [0, 2, 7, 10],
	'7sus4': [0, 5, 7, 10],
	'6': [0, 4, 7, 9],
	'7': [0, 4, 7, 10],
	'9': [0, 4, 7, 14],
	'maj7': [0, 4, 7, 11],
	'maj9': [0, 4, 7, 11, 14],
	'maj11': [0, 4, 7, 11, 14, 17],
	'min6': [0, 3, 7, 9],
	'min7': [0, 3, 7, 10],
	'min9': [0, 3, 7, 10, 14],
	'min11': [0, 3, 7, 10, 14, 17]
}

//////////////////////////////////////////
//
// CHORD TOOLS
//
//////////////////////////////////////////

// Play a note (required) for a duration (optional, in ms, defaults to 1s)
function playNote(note, duration = 500){
	synth.triggerAttack(note);

	setTimeout(function(){
		synth.triggerRelease(note);
	}, duration);
}



// Convenience function for playing an array of notes as a chord
// expects array of notes as strings like ['C3','Eb3','G3']
function playMany(notes, duration = 500){
	for(var i = 0; i < notes.length; i++){
		playNote(notes[i], duration);
	}
}


// Convenience function that plays a chord for a note
function playChordForNote(note, chord = "maj"){
	playMany( findChordForNote(note, chord) );
}



// For a root note, find the corresponding note
// after a given interval distance
function findNoteForInterval(note, distance){

	// split the note (like "Cb3") into it's pitch and octave ("Cb", "3")
	var pitch = note.substring(0, note.length - 1);
	var octave = Number(note.substring(note.length - 1));

	// If there are more than 12 half steps to travel, it's effetively just
	// looping around the octave, and so the octave should be stepped up.
	wrapCount = Math.floor(distance/12);

	// Removing the 12 octave wraps gives the amount to increment the pitch
	var modulo = (distance % 12);
	
	// Track where the pitch is in the array, so we can compensate for it.
	// For example, if the root note is only 2 away from the end of the pitch
	// array and needs to move a distance of 4, it needs to wrap and continue
	rootIndex = pitches.indexOf(pitch);

	// A target index in the pitch array, distance relative to the position
	// of the root note
	finalDistance = rootIndex + modulo;

	// If that index is greater than 12, it needs to wrap again
	// Currently this only handles the wrap once, so 24+ distance is an issue
	if((rootIndex + modulo) >= 12){
		finalDistance = (rootIndex + modulo) - 12;
		wrapCount ++;
	}

	// return a combination of the pitch and adjusted octave
	return pitches[finalDistance] + (octave + wrapCount);
}



// Given a root note, find all notes in that chord
// by counting their interval distances
function findChordForNote(note, chord = "maj"){

	// Yell if the chord given isn't in the master chord list
	if (!(chord in chords)){
		console.log('ERROR: ' + chord + ' is not a valid Chord. Get good.');
		return false;
	}

	// Create an empty array to store chord notes
	var noteArray = [];

	// Loop through the interval list in this chord
	for(var i = 0; i < chords[chord].length; i++){
		// find the target note, relative to the root, for each interval
		var targetNote = findNoteForInterval(note, chords[chord][i]);
		// add it to the note array
		noteArray.push(targetNote);
	}

	console.log('chord for ' + note + ' ' + chord + ' is ' + JSON.stringify(noteArray));
	return noteArray;
}