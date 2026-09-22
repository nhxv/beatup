import fs from "node:fs";

interface Note {
    n: number;
    t: number;
}

const relativePath = "../../../public/notes/CanCanSkill.json";
const listData = fs.readFileSync(relativePath);
const notes: Note[] = JSON.parse(listData.toString()); // array
const offset = -1600;

changeOffset(offset, relativePath);

function changeOffset(offset: number, path: string): void {
    for (const beat of notes) {
        beat.t += offset;
    }
    const notesData = JSON.stringify(notes).split("},{").join("},\n {");
    fs.writeFile(path, notesData, (err) => {
        if (err) { console.log(err); }
    });
    console.log("offset: " + offset);
}
