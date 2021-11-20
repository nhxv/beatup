/*
*
* Convert sm to json

* DOCS: 
* http://jalz-cassieast.blogspot.com/2012/02/make-your-song-on-beat-up-mania.html

* MEASURE: 
* 1 measure has 16 step; if 1 measure has X number of line -> 1 line counted as 16/X

* OFFSET:
* default audition song offset = 0.7. change offset to make song start earlier/later

* TIME:
* tickTime = 1000 * 60 / (bpm * 4) -> a 60bpm song will have tickTime = 1/4
* t = t (from json) * tickTime
* keyTime = currentTime - t
* ratio = 4
* if keyTime <= 5 * (tickTime * ratio) / 100 -> perfect
* if keyTime > 40 * (tickTime * ratio) / 100 -> miss

* EXAMPLE: 
The Black Cat; bpm = 131; offset = 0
tickTime = 1000 * 60 / (131 * 4) = 114.5
t in sm = 16*7 + 0
t in json = 112
t = 112 * 114.5 = 12824 (milli second) -> start to play first note after ~13 second

IDC; bpm = 132; offset = 0
tickTime = 1000 * 60 / (132 * 4) = 113.64
t in sm = 16*8 + 0.5*7 = 131.5
t in json = 131.5
t = 131.5 * 113.64 = 14943.66 (milli second) -> start to play first note after ~15 second

Nobody; bpm = 131; offset = -0.192
tickTime = 114.5~
t in sm = 16 + 0
t in json = 15.5
t = 15.5 * 114.5 = 1774.75 (milli second) -> start to play first note after ~2 second
t in sm * 114.5 = 1832 (milli second) (57.25 ms later than correct time)

BIS; bpm = 113; offset = -0.405
tickTime = 132.74~
t in sm = 16/96 = 1/6
t in json = 7
t = 7 * 132.74 = 929.18 (milli second) -> start to play first note after ~1 second
t in sm * 132.74 = 22.123~ (milli second) (907.06 ms earlier than correct time)

*/

const fs = require('fs');
const readline = require('readline');
const fileName = 'BecauseILoveYou';
const src = 'sm/' + fileName + '.sm';

let notes = [];
let measures = [];
let beat = 0;
let beatLimitInMeasure = 16;
const noteCode = {
    '00001000': 1, 
    '01000000': 3, 
    '00000100': 4, 
    'M000000M': 5,
    '00100000': 6, 
    '00000010': 7, 
    '00010000': 9
};
  
processMeasures();

async function processMeasures() {
    const fileStream = fs.createReadStream(src);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentBeatLineInMeasure = 0;
    for await (const line of rl) {
        if ( (line.length === 8 && line.includes('0')) || (line.includes(',') && !line.includes('.')) ) {
            if (line.includes(',')) {
                const measureOrder = measures.length + 1;
                let measure = {};
                measure[measureOrder] = currentBeatLineInMeasure;
                measures.push(measure);
                currentBeatLineInMeasure = 0;
            } else {
                currentBeatLineInMeasure++;
            }
        }
    }
    processNotes();
}

async function processNotes() {
    const fileStream = fs.createReadStream(src);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentMeasure = 1;
    let beatInMeasure = 0;
    for await (const line of rl) {
        if ( (line.length === 8 && line.includes('0')) || (line.includes(',') && !line.includes('.')) ) {
            if (line.includes(',')) { // end of measure
                // switch to new measure
                if (currentMeasure < measures.length) {
                    currentMeasure++;
                }
                beatInMeasure = 0;
                beat += beatLimitInMeasure;
            } else {
                const measure = measures[currentMeasure - 1];
                const measureLine = measure[currentMeasure];
                // add note if there is one
                if (line !== '00000000') {
                    const tempo = Math.ceil(beat + beatInMeasure);

                    if (!noteCode[line]) {
                        console.log('ignore line ' + line);
                    } else {
                        notes.push({'n': noteCode[line], 't': tempo});
                    }
                }
                beatInMeasure += beatLimitInMeasure/measureLine;
            }
        }
    }

    const notesData = JSON.stringify(notes).split('},{').join('},\n {');
    fs.writeFile('json/' + fileName + '.json', notesData, err => {
        if (err) console.log(err);
    });
}


