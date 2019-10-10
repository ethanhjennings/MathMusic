class Note {
  constructor(letter, isSharp = false, octave = null) {
    this.letter = letter;
    this.isSharp = isSharp;
    this.octave = octave;
  }

  static mod(n, m) {
    return ((n % m) + m) % m;
  }

  static parse(noteStr) {
    let noteRegex = /^([A-G])(#|b)?([0-9\-]+)?$/;
    let match = noteStr.match(noteRegex);

    let letter = match[1];
    let isSharp = match[2] === "#";
    let octave = match[3] !== undefined ? parseInt(match[3]) : null;

    // Normalize the note by converting it to a semitone and back
    // This is also the easiest way to apply a flat
    let semitone = (new Note(letter, isSharp, octave)).toSemitone();
    if (match[2] === "b") {
      semitone--;
    }
    let note = Note.fromSemitone(semitone);

    // We lost if the octave is null in normalization,
    // so bring it back
    if (octave === null) {
      note.octave = null;
    }

    return note;
  }

  /* 
   * Convert to the semitone offset from A0 
   */
  toSemitone() {
    let index = Note.OCTAVE.findIndex(
        (note) => note.letter === this.letter
    );
    if (this.isSharp) {
      index++;
      index = Note.mod(index, 12);
    }
    let octave = this.octave;
    if (index >= 3) {
      octave--;
    }
    return (12 * octave) + index + 1;
  }

  /* 
   * Convert semitone offset from A0 to a note
   */
  static fromSemitone(semitone) {
    semitone--; // Not zero indexed
    let index = Note.mod(semitone, 12);
    let matchedNote = Note.OCTAVE[index];
    let octave = Math.floor((semitone - 3) / 12) + 1;
    return new Note(
      matchedNote.letter,
      matchedNote.isSharp,
      octave,
    );
  }

  toFreq() {
    // Using standard A440 standard
    return 440 * Math.pow(2, (this.toSemitone() - 49) / 12);
  }

  toString() {
    return this.letter + 
           (this.isSharp ? '#' : '') +
           (this.octave !== null ? this.octave.toString() : ''); 
  }

  toPrettyHTML() {
    return this.letter + 
           (this.isSharp ? '\u266f' : '') +
           (this.octave !== null ?
            '<sub>' + this.octave.toString() + '</sub>'
            : '');
  }

  static range(start, end) {
    let index = start.toSemitone();
    let endIndex = end.toSemitone();
    let range = [];
    for (; index <= endIndex; index++) {
      range.push(Note.fromSemitone(index));
    }
    return range;
  }
}

Note.OCTAVE = [
  new Note('A', false),
  new Note('A', true),
  new Note('B', false),
  new Note('C', false),
  new Note('C', true),
  new Note('D', false),
  new Note('D', 'true'),
  new Note('E', false),
  new Note('F', false),
  new Note('F', true),
  new Note('G', false),
  new Note('G', true),
];
