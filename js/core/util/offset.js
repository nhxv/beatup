const fs = require('fs');
const relativePath = '../../../notes/Winter.json';
let listData = fs.readFileSync(relativePath);
let notes = JSON.parse(listData); // array
const offset = 0.5;

changeOffset(offset, fs, relativePath);

function changeOffset(offset, fs, path) {
    for (const beat of notes) {
        beat["t"] += offset;
    }
    const notesData = JSON.stringify(notes).split('},{').join('},\n {');
    fs.writeFile(path, notesData, err => {
        if (err) { console.log(err); }
    });
    console.log('offset: ' + offset);
}