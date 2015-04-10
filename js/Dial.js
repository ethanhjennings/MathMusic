function Dial(name,min,max,value) {
  this.id = "dial_" + name;
  this.canvas = $("<canvas/>",{id:id,width:100,height:100})[0];
  this.context = this.canvas.getContext("2d");
  $(body).add($(this.canvas));

  var that = this;

  (function draw() {

  })();
}