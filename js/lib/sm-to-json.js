/* 
* 1 measure has 16 beat
* 1 second has 7 beat (e.g 112 beat = 16 second)
* if 1 measure has X line -> 1 beatline = 16/X beat (rounded up)
*/

const fs = require('fs');
const readline = require('readline');
const fileName = "Sea";
const src = 'sm/' + fileName + '.sm';

let notes = [];
let measures = [];
let beat = 0;
let beatLimitInMeasure = 16;
const noteCode = {"00001000": 1, "01000000": 3, "00000100": 4, "M000000M": 5,"00100000": 6, "00000010": 7, "00010000": 9};
  
processMeasures();

async function processMeasures() {
    const fileStream = fs.createReadStream(src);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentBeatLineInMeasure = 0;
    for await (const line of rl) {
        if ( (line.length === 8 && line.includes("0")) || (line.includes(",") && !line.includes(".")) ) {
            if (line.includes(",")) {
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
        if ( (line.length === 8 && line.includes("0")) || (line.includes(",") && !line.includes(".")) ) {
            if (line.includes(",")) { // end of measure
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
                if (line !== "00000000") {
                    if (line.includes("M") && line !== "M000000M") {
                        // double press fix
                        notes.push({"n": noteCode[line.replace(/M/g,"0")], "t": Math.ceil(beat + beatInMeasure)});
                    } else {
                        notes.push({"n": noteCode[line], "t": Math.ceil(beat + beatInMeasure)});
                    }
                }
                beatInMeasure += beatLimitInMeasure/measureLine;
            }
        }
    }

    const notesData = JSON.stringify(notes).split("},{").join("},\n {");
    fs.writeFile('json/' + fileName + '.json', notesData, err => {
        if (err) console.log(err);
    });
}


