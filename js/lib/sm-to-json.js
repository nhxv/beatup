const fs = require('fs');
const readline = require('readline');

const fileName = "CanonGroove";
let notes = [];
let beat = 0;
let currentBeatInMeasure = 0;
const minBeatInMeasure = 16;
const noteCode = {"00001000": 1, "01000000": 3, "00000100": 4, "M000000M": 5,"00100000": 6, "00000010": 7, "00010000": 9};

async function processLineByLine() {
    const fileStream = fs.createReadStream(fileName + '.sm');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    for await (const line of rl) {
        if ( (line.length === 8 && line.includes("0")) || (line.includes(",") && !line.includes(".")) ) {
            if (line.includes(",")) {
                // end one measure
                currentBeatInMeasure < minBeatInMeasure ? beat += minBeatInMeasure : beat += currentBeatInMeasure;
                currentBeatInMeasure = 0;
            } else {
                // add note if there is one
                if (line !== "00000000") {
                    if (line.includes("M") && line !== "M000000M") {
                        // double press fix
                        notes.push({"n": noteCode[line.replace(/M/g,"0")], "t": beat + currentBeatInMeasure})
                    } else {
                        notes.push({"n": noteCode[line], "t": beat + currentBeatInMeasure});
                    }
                }
                currentBeatInMeasure++;
            }
        }
    }
    const notesData = JSON.stringify(notes).split("},{").join("},\n {");
    fs.writeFile('json/' + fileName + '.json', notesData, err => {
        if (err) console.log(err);
    });
}
  
processLineByLine();
