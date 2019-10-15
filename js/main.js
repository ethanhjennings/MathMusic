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
  zelda_song[i].freq = Note.parse(zelda_song[i].note).toFreq();
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
  let keyboardMapping = {
    'Q': Note.parse('D#3'),
    'A': Note.parse('E3'),
    'S': Note.parse('F3'),
    'E': Note.parse('F#3'),
    'D': Note.parse('G3'),
    'R': Note.parse('G#3'),
    'F': Note.parse('A3'),
    'T': Note.parse('A#3'),
    'G': Note.parse('B3'),
    'H': Note.parse('C4'),
    'U': Note.parse('C#4'),
    'J': Note.parse('D4'),
    'I': Note.parse('D#4'),
    'K': Note.parse('E4'),
    'L': Note.parse('F4'),
    'P': Note.parse('F#4'),
    ';': Note.parse('G4'),
    '[': Note.parse('G#4'),
    '\'': Note.parse('A4'),
    ']': Note.parse('A#4'),
  };
  window.pianoKeyboard = new PianoKeyboard(
      document.getElementById("main-piano-keyboard"), 
      'C1', 'C7', // range
      keyboardMapping,
      function keyboardPress(note) {
        window.w.addFunction(sample,note.toString(),{freq:note.toFreq()});
        window.audioContext.resume();
      },
      function keyboardRelease(note) {
        window.w.removeFunc(note.toString());
      },
  );
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
      window.w.setFunc(sample);
    }
    catch(e) {
      window.sample = undefined;
      window.w.setFunc(() => {return 0.0;});
    }
  }
  evalCode();
  window.noise = function(t) {return window.perlin_noise.simplex2(1.0, t);}
  var canvas = $('#canvas')[0];
  var context = canvas.getContext('2d');
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
});
