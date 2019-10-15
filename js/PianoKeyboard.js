class PianoKeyboard {
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
    this.previousMouseKey = null;
    this.mousedown = false;
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

      let key = new Key(
          note,
          keyElement,
          {'mouse': false, 'keyboard': false, 'external': false},
          this.keyPressCallback,
          this.keyReleaseCallback
      );
      this.keys.push(key);
      this.idToKey[keyElement.id] = key;
    }
  }

  _setupEventHandlers() {
    document.addEventListener('keydown', this._keydownEvent.bind(this));
    document.addEventListener('keyup', this._keyupEvent.bind(this));
    document.addEventListener('mousedown', this._mousedownEvent.bind(this));
    document.addEventListener('mouseup', this._mouseupEvent.bind(this));
    document.addEventListener('mousemove', this._mousemoveEvent.bind(this));
    /*for (let i = 0; i < this.keys.length; i++) {
      let element = this.keys[i].element;
      element.addEventListener('mousedown', this._mousedownEvent.bind(this));
      element.addEventListener('mouseup', this._mouseupEvent.bind(this));
    }*/
  }

  _keyFromPoint(x, y) {
    let elements = document.elementsFromPoint(x, y);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].classList.contains('key')) {
        return this.idToKey[elements[i].id]; 
      }
    }
    return null; // Not clicking a key
  }

  _processMouseEvent(e) {
    let key = this._keyFromPoint(e.clientX, e.clientY);
    if (key !== null) {
      key.setInputState('mouse', this.mousedown);
    }
    if (this.previousMouseKey !== key && this.previousMouseKey !== null) {
      this.previousMouseKey.setInputState('mouse', false);
    }
    this.previousMouseKey = key;
  }

  _mousedownEvent(e) {
    this.mousedown = true;
    this._processMouseEvent(e);
  }

  _mouseupEvent(e) {
    this.mousedown = false;
    this._processMouseEvent(e);
  }

  _mousemoveEvent(e) {
    this._processMouseEvent(e);
  }

  _processKeyboardEvent(e, state) {
    let note = this.pcKeyboardMapping[e.key.toUpperCase()];
    if (note === undefined) {
      return;
    }
    let key = this.idToKey[note.toString()];
    key.setInputState('keyboard', state);
  }

  _keydownEvent(e) {
    this._processKeyboardEvent(e, true);
  }

  _keyupEvent(e) {
    this._processKeyboardEvent(e, false);
  }
  
  resetScroll() {
    this.keyboardElement.scrollLeft = (
        this.keyboardElement.scrollWidth - this.keyboardElement.clientWidth
    )/2;
  }
}

class Key {
  constructor(
      note,
      element,
      inputStartingStates,
      keyPressCallback,
      keyReleaseCallback
  ) {
    this.note = note;
    this.element = element;
    this.pressed = false;
    this.inputStates = inputStartingStates;
    this.keyPressCallback = keyPressCallback;
    this.keyReleaseCallback = keyReleaseCallback;
  }

  setInputState(inputType, state) {
    this.inputStates[inputType] = state;
    let currentPressed = Object.values(this.inputStates).some((e) => e);
    if (currentPressed !== this.pressed) {
      this.pressed = currentPressed;
      this._updateCSS();
      if (this.pressed) {
        this.keyPressCallback(this.note);
      } else {
        this.keyReleaseCallback(this.note);
      }
    }
  }

  _updateCSS() {
    if (this.pressed) {
      this.element.classList.add('active');
    } else {
      this.element.classList.remove('active');
    }
  }
}
