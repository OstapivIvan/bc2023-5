const express = require("express");
const fs = require("fs");
const multer = require("multer");
const app = express();
const port = 8000;

app.use(multer().none());
app.use(express.json());
app.use(express.static("static"));

const notesFilePath = "notes.json";

if (!fs.existsSync(notesFilePath)) {
    fs.writeFileSync(notesFilePath, "[]", "utf8");
}

const readNotesFromFile = () => {
    const data = fs.readFileSync(notesFilePath, "utf8");
    return JSON.parse(data);
};

const writeNotesToFile = (notes) => {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2), "utf8");
};

app.get("/UploadForm", (req, res) => {
    res.sendFile(__dirname + "/static/UploadForm.html");
});

app.get("/notes", (req, res) => {
    try {
        const notes = readNotesFromFile();
        res.json({notes});
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

app.post("/upload", (req, res) => {
    const addedNoteName = req.body.note_name;
    const addedNoteText = req.body.note;

    try {
        const notes = readNotesFromFile();

        const existNote = notes.find(
            (note) => note.note_name === addedNoteName
        );

        if (existNote) {
            throw new Error("Note with this name already exists");
        }

        notes.push({note_name: addedNoteName, note: addedNoteText});
        writeNotesToFile(notes);
        res.status(201).send("Note successfully created");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    try {
        const notes = readNotesFromFile();
        const findNote = notes.find((note) => note.note_name === note_name);

        if (!findNote) {
            throw new Error("Note with this name does not exist");
        }

        res.send(findNote.note);
    } catch (error) {
        res.status(404).send(error.message);
    }
});


app.put('/notes/:note_name', express.text(), (req, res) => {
    const note_name = req.params.note_name;
    const updatedNoteText = req.body;

    const notes = readNotesFromFile();
    const noteToUpdate = notes.find((data) => data.note_name === note_name);

    if (noteToUpdate) {
        noteToUpdate.note = updatedNoteText; 
        writeNotesToFile(notes);
        res.status(200).send('Text was updated');
    } else {
        res.status(404).send(`Note with this name doesn't exist`);
    }
});


app.delete("/notes/:note_name", (req, res) => {
    const note_name = req.params.note_name;

    try {
        const notes = readNotesFromFile();
        const foundNoteIndex = notes.findIndex(
            (note) => note.note_name === note_name
        );

        if (foundNoteIndex === -1) {
            throw new Error("Note with this name does not exist");
        }

        notes.splice(foundNoteIndex, 1);
        writeNotesToFile(notes);
        res.status(200).send("Note deleted");
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
