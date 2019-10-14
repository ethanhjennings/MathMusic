class WaveGenerator {

  constructor(context, waveCallback) {
    let that = this;
    this.context = context;
    this.node = context.createScriptProcessor(2048, 1, 1);
    this.node.onaudioprocess = function(e) {
      waveCallback(that.process(e));
    };
    this.sampleRate = context.sampleRate;
    this.sampleFuncs = [];
  }


  setFunc(func) {
    this.func = func;
  }

  addFunction(func, id, params) {
    this.sampleFuncs.push({
      volume: 0.0,
      state:"created",
      t:0,
      id:id,
      params:params,
    });
  }

  removeFunc(id) {
    for (let i = 0; i < this.sampleFuncs.length; i++) {
      if (this.sampleFuncs[i].id == id) {
        this.sampleFuncs[i].state = "deleted";
      }
    }
  }

  process(audioProcessingEvent) {
    let data = audioProcessingEvent.outputBuffer.getChannelData(0);
    let max = 0.0;
    for (let i = 0; i < data.length; i++) {
      data[i] = 0;
        for (let j = 0; j < this.sampleFuncs.length; j++) {
          let s = this.sampleFuncs[j];
          try {
            data[i] += this.func(s.t,this.sampleRate,s.params.freq)*s.volume;
          } catch (e) {
          }
          s.t++;
        }
      if (Math.abs(data[i]) > max) {
        max = Math.abs(data[i]);
      }
      // add decay and fade in functions
      for (let j = 0; j < this.sampleFuncs.length; j++) {
        let s = this.sampleFuncs[j];
        if (s.state === "created") {
          s.volume = Math.min(s.volume + 0.1, 1.0);
        }
        else if (s.state === "deleted") {
          s.volume *= 0.999;
        }
      }

      // remove the functions that have decayed.
      this.sampleFuncs = this.sampleFuncs.filter(function(func) {
        return func.state === "created" || func.volume > 0.01;
      });
    }

    return data;
  }
  
  play() {
    this.node.connect(this.context.destination);
  }
  
  pause() {
    this.node.disconnect();
  }
}
