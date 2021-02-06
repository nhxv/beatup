const fs = require('fs');
let notes = require('./Cleopatra.json');
let notesArr = json2array(notes);
for (let i = 1; i < notesArr.length; i++) {
    notesArr[i].t++;
}

fs.writeFile("Cleopatra.json", JSON.stringify(notesArr), err => {
    // Checking for errors
    if (err) throw err;

});

function json2array(json) {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key){
        result.push(json[key]);
    });
    return result;
}
