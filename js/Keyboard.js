class Keyboard {
  constructor(element, startNote, endNote) {
    this.keyboardElement = element;
    this._initKeys(startNote, endNote);
  }

  _initKeys(startNote, endNote) {
    let notes = Note.range(Note.parse(startNote), Note.parse(endNote));
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i];

      let noteLabel = document.createElement("p");
      noteLabel.className = "note-label";
      noteLabel.innerHTML = note.toPrettyHTML();

      let keyElement = document.createElement("li");
      keyElement.className = note.isSharp ? "black key" : "white key";
      if (note.letter == "C" && !note.isSharp) {
        // highlight the C's
        keyElement.className = "middle-c " + keyElement.className;
      }
      keyElement.appendChild(noteLabel);

      this.keyboardElement.appendChild(keyElement);
    }
  }
}
