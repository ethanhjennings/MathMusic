function note_to_freq(note) {
  let notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']                       ;
  let note_regex = /([A-F])(#|b)?([0-9]+)/;
  let match = note.match(note_regex);
  let letter = match[1];
  let sharp_flat = match[2];
  let octave = parseInt(match[3]);
  let note_index = notes.indexOf(letter);
  if (sharp_flat == '#') {
    note_index += 1;
  } else if (sharp_flat == 'b') {
    note_index -= 1;
  }
  note_index = note_index % 12; // Wrap around
  if (note_index >= 3) {
    octave -= 1;
  }
  let note_pos = (12*octave)+note_index + 1;
  return 440 * Math.pow(2, (note_pos-49)/12);
}
let zelda_song = [
  {start:0.0, dur: 1.0, note: 'A4'},
  {start:1.0, dur: 1.5, note: 'E4'},
  {start:2.5, dur: 0.5, note: 'A4'},
  {start:3.0, dur: 0.25, note: 'A4'},
  {start:3.25, dur: 0.25, note: 'B4'},
  {start:3.5, dur: 0.25, note: 'C#5'},
  {start:3.75, dur: 0.25, note: 'D5'},
  {start:4.0, dur: 1.75, note: 'E5'},
]
for (let i = 0; i < zelda_song.length; i++) {
  zelda_song[i].freq = note_to_freq(zelda_song[i].note);
}
$( document ).ready(function() {
  example_code = [
    {
      name: "Sine",
      code: [
        "function sample(t,sample_rate,freq) {",
        "return 0.3*sin((2.0*PI*t*freq)/sample_rate);",
        "}"
      ],
    },
    {
      name: "Sawtooth",
      code: [
        "function sample(t,sample_rate,freq) {",
        "return t*freq/sample_rate-floor(t*freq/sample_rate)-0.5;",
        "}"
      ],
    },
    {
      name: "Gated Sawtooth",
      code: [
        "function sample(t,sample_rate,freq) {",
        "return (sin(100.0*t/sample_rate)+1.0)*(t*freq/sample_rate-floor(t*freq/sample_rate)-0.5);",
        "}"
      ],
    },
    {
      name: "Snare Drum",
      code: [
        "function sample(t,sample_rate,freq) {",
        "return noise(t)*exp(-20.0*t/sample_rate);",
        "}"
      ],
    },
    {
      name: "Wtf",
      code: [
        "function sample(t,sample_rate,freq) {",
        "return pow(sin((2.0*PI*t*freq)/sample_rate),1.2)-0.5;",
        "}"
      ],
    },
  ];
  $.each(example_code, function(i, example) {
    $("#examples").append($("<option />").val(i).text(example.name));
  });
  $("#examples").change(function() {
    var code = example_code[$("#examples").val()].code.join("\n");
    $("#code").val(code);
    evalCode();
  });
  window.perlin_noise = noise;
  window.perlin_noise.seed(Math.random());
  window.soundData = undefined;
  window.audioContext = new AudioContext();
  window.w = new WaveGenerator(window.audioContext,function(d) {
    window.soundData = d;
  });
  window.w.play();
  function evalCode() {
  var text = $("#code").val();
    // replace all instances of sin, cos etc. with Math.sin, Math.cos
    text = text.replace(/(?:Math\.)?(\w+)/g,function(match, group1) {
      return Math.hasOwnProperty(group1) ? "Math." + group1 : match;
    });
    
    try {
      eval(text);
      window.sample = sample;
      window.w.removeFunc(defaultFuncId);
      defaultFuncId = "default_" + defaultFuncIdNum;
      defaultFuncIdNum++;
      //window.w.addFunction(sample,defaultFuncId,{freq:261.63});
    }
    catch(e) {
      window.sample = undefined;
    }
  }
  evalCode();
  window.noise = function(t) {return window.perlin_noise.simplex2(1.0, t);}
  var canvas = $('#canvas')[0];
  var context = canvas.getContext('2d');
  var defaultFuncIdNum = 0;
  var defaultFuncId = "default_" + defaultFuncIdNum;
  context.translate(0.5, 0.5);
  (function animate() {
    context.fillStyle="#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (window.soundData) {
      context.strokeStyle = '#ff0000';
      context.beginPath();
      //var offset = 1024 - sampleIndex;
      for (var i = 1; i < window.soundData.length/4; i += 1) {
        context.moveTo(i, 100*0.5*(window.soundData[i*4]+1.0));
        context.lineTo(i+1, 100*0.5*(window.soundData[(i+1)*4]+1.0));
      }
      context.stroke();
    }
    requestAnimationFrame(animate);
  })();
  $("#code").bind('input propertychange',function() {
    evalCode();
  });
  // Notes:
  var key_map = {};
  var notes = {65: 174.61, 83:196.00, 68: 220.00,70: 246.94, 71: 261.63, 72:293.66, 74:329.63, 75:349.23, 76:392.00, 186:440.00, 222:493.88};
  $(document).keydown(function(e) {
    if(e.keyCode in notes && !key_map[e.keyCode]) {
      key_map[e.keyCode] = true;
      window.w.removeFunc(defaultFuncId);
      window.w.addFunction(sample,e.keyCode,{freq:notes[e.keyCode]});
      window.audioContext.resume();
    }
  }).keyup(function(e) {
    if(e.keyCode in notes) {
      key_map[e.keyCode] = false;
      window.w.removeFunc(defaultFuncId);
      window.w.removeFunc(e.keyCode);
    }
  });
});
