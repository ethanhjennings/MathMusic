WaveGenerator = function(context,waveFunc) {
  var that = this;
  this.context = context;
  this.node = context.createScriptProcessor(2048, 1, 1);
  this.node.onaudioprocess = function(e) {
    waveFunc(that.process(e)) 
  };
  this.sampleRate = context.sampleRate;
  this.sampleFuncs = [];
  this.current_id = 0;
}

WaveGenerator.prototype.addFunction = function(func,id, params) {
  this.sampleFuncs.push({func:func,volume:0.0,state:"created",t:0,id:id,params:params});
}

WaveGenerator.prototype.removeFunc = function(id) {
  for (var j = 0; j < this.sampleFuncs.length; j++) {
    if (this.sampleFuncs[j].id == id) {
      this.sampleFuncs[j].state = "deleted";
    }
  }
}

WaveGenerator.prototype.clearFunctions = function() {
  for (var j = 0; j < this.sampleFuncs.length; j++) {
    this.sampleFuncs[j].state = "deleted";
  }
}

WaveGenerator.prototype.process = function(e) {
  console.log(this.sampleFuncs.length);
  try {
    var data = e.outputBuffer.getChannelData(0);
    var max = 0.0;
    for (var i = 0; i < data.length; ++i) {
      data[i] = 0;
      for (var j = 0; j < this.sampleFuncs.length; j++) {
        var s = this.sampleFuncs[j];
        data[i] += s.func(s.t,this.sampleRate,s.params.freq)*s.volume;
        s.t++;
      }
      if (Math.abs(data[i]) > max) {
        max = Math.abs(data[i]);
      }
      // add decay and fade in functions
      for (var j = 0; j < this.sampleFuncs.length; j++) {
        var s = this.sampleFuncs[j];
        if (s.state === "created") {
          s.volume = Math.min(s.volume + 0.1, 1.0);
        }
        else if (s.state === "deleted") {
          s.volume *= 0.9999;
        }
      }

      // remove the functions that have decayed.
      this.sampleFuncs = this.sampleFuncs.filter(function(func) {
        return func.state === "created" || func.volume > 0.01;
      });
    }

    return data;
  }
  catch (e) {
      console.log(e.message);
      this.sampleFuncs = [];
  }
  return [];
}

WaveGenerator.prototype.play = function() {
  this.node.connect(this.context.destination);
}

WaveGenerator.prototype.pause = function() {
  this.node.disconnect();
}