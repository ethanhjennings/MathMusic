class Keyboard {
  constructor(
      element,
      startNote,
      endNote, 
      pcKeyboardMapping, 
      keyPressCallback, // Callback when key is pressed
      keyReleaseCallback // Callback when key is released
  ) {
    this.keyboardElement = element;
    this.pcKeyboardMapping = pcKeyboardMapping;
    this.keyPressCallback = keyPressCallback;
    this.keyReleaseCallback = keyReleaseCallback;
    this.keys = [];
    this.idToKey = {};
    this._initKeys(startNote, endNote);
    this._setupEventHandlers();
    this.resetScroll();
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
        keyElement.className = "highlight " + keyElement.className;
      }
      keyElement.appendChild(noteLabel);
      keyElement.id = note.toString();

      this.keyboardElement.appendChild(keyElement);

      let key = {
        note: note,
        element: keyElement,
        keydown: false,
        mousedown: false,
      };
      this.keys.push(key);
      this.idToKey[keyElement.id] = key;
    }
  }

  _setupEventHandlers() {
    document.addEventListener('keydown', this._keydownEvent.bind(this));
    document.addEventListener('keyup', this._keyupEvent.bind(this));
    for (let i = 0; i < this.keys.length; i++) {
      let element = this.keys[i].element;
      element.addEventListener('mousedown', this._mousedownEvent.bind(this));
      element.addEventListener('mouseup', this._mouseupEvent.bind(this));
    }
  }

  _updateKeyCss(key) {
    if (key.mousedown || key.keydown) {
      key.element.classList.add('active')
    } else {
      key.element.classList.remove('active')
    }
  }

  _mousedownEvent(e) {
    let key = this.idToKey[e.currentTarget.id];
    key.mousedown = true;
    this._updateKeyCss(key);
    this.keyPressCallback(key.note);
  }

  _mouseupEvent(e) {
    let key = this.idToKey[e.currentTarget.id];
    key.mousedown = false;
    this._updateKeyCss(key);
    this.keyReleaseCallback(key.note);
  }

  _keydownEvent(e) {
    let note = this.pcKeyboardMapping[e.key.toUpperCase()];
    if (note === undefined) {
      return;
    }
    let key = this.idToKey[note.toString()];
    if (key.keydown === false) {
      key.keydown = true;
      this._updateKeyCss(key);
      this.keyPressCallback(note);
    }
  }

  _keyupEvent(e) {
    let note = this.pcKeyboardMapping[e.key.toUpperCase()];
    if (note === undefined) {
      return;
    }
    let key = this.idToKey[note.toString()];
    if (key.keydown === true) {
      key.keydown = false;
      this._updateKeyCss(key);
      this.keyReleaseCallback(note);
    }
  }
  
  resetScroll() {
    this.keyboardElement.scrollLeft = (this.keyboardElement.scrollWidth - this.keyboardElement.clientWidth)/2;
  }
}
