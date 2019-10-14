class Key {
  constructor(note, element, inputStartingStates, changedCallback) {
    this.note = note;
    this.element = element;
    this.pressed = false;
    this.inputStates = inputStartingStates;
    this.changedCallback = changedCallback;
  }
  
  setInputState(inputType, state) {
    this.inputStates[inputType] = state;
    let currentPressed = this.inputStates.values.some((e) => e);
    if (currentPressed !== this.pressed) {
      this.pressed = currentPressed;
      this._updateCSS();
    }
  }

  _updateCSS() {
    if
  }
}

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
    this.mouseHoveringKey = null;
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

      let key = {
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

  _updateKeyCss(key, pressing) {
    if (key.mousedown || key.keydown) {
      key.element.classList.add('active');
    } else {
      key.element.classList.remove('active');
    }
  }

  _processMouseEvent(e, changedState) {
    let key = this._keyFromPoint(e.clientX, e.clientY);
    if (key !== this.mouseHoveringKey || changedState) {
      if (this.mouseHoveringKey !== null) {
        this.mouseHoveringKey.mousedown = false;
        this._updateKeyCss(this.mouseHoveringKey);
        this.keyReleaseCallback(this.mouseHoveringKey.note);
      }

      if (key !== null) {
        key.mousedown = this.mousedown;
        this._updateKeyCss(key);
        if (this.mousedown) {
          this.keyPressCallback(key.note);
        } else {
          this.keyReleaseCallback(key.note);
        }
      }
      this.mouseHoveringKey = key;
    }
  }

  _mousedownEvent(e) {
    this.mousedown = true;
    this._processMouseEvent(e, true);
  }

  _mouseupEvent(e) {
    this.mousedown = false;
    this._processMouseEvent(e, true);
  }

  _mousemoveEvent(e) {
    this._processMouseEvent(e, false);
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
