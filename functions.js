var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context_canvas = canvas.getContext('2d');
var minY;
var canvas_width = 320;
var canvas_height = 240; 
var squares = [];
var min_width = 5;
var min_height = 5;
var step;

var worker = new Worker('calc.js');

worker.addEventListener('message', function(e) {
    //console.log(e.data);
    switch(e.data.status){
     case 'ok':
      $('#proc').text("100");
		$("#getcolors").attr('disabled',false);
	   $(".i_colors").hide();    
    
      if(e.data.squares && e.data.squares.length){
        squares = e.data.squares;     
      }
      //console.log("l: " + squares.length);
      if(squares.length){
		  var S_max = 0;
		  if($('#all_squares').is(':checked')){
		  	for(var i=0; i<squares.length; i++){		  	
           var sheet = new EasyC(canvas, [
    		  {
    			type: "rectangle",
    			x: parseInt(squares[i].left),
    			y: parseInt(squares[i].up),
    			width: (parseInt(squares[i].right) - parseInt(squares[i].left)),
  				height: (parseInt(squares[i].down) - parseInt(squares[i].up)),
  				//fill: "#000",
  				stroke: { fill: "#ffdc03", thick: 2},
    			z: 25
  		     }]);
   		 sheet.draw();	
		   }	
		  }
		  else{
		  for(var i=0; i<squares.length; i++){

          var S_square = (squares[i].right-squares[i].left)*(squares[i].down-squares[i].up);
          if(S_square > S_max){
				var square_max = squares[i];
				S_max = S_square;          
          }	
         }
         var sheet = new EasyC(canvas, [
    		{
    			type: "rectangle",
    			x: parseInt(square_max.left),
    			y: parseInt(square_max.up),
    			width: (parseInt(square_max.right) - parseInt(square_max.left)),
  				height: (parseInt(square_max.down) - parseInt(square_max.up)),
  				//fill: "#000",
  				stroke: { fill: "#ffdc03", thick: 2},
    			z: 25
  			}]);
   		sheet.draw();	
		 }	 
	  }
    break;
    case "calculate":     
     $('#proc').text(e.data.proc);
    break;
   }
    
  }, false);


// Получаем доступ к камере
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Не включаем аудио опцией `{ audio: true }` поскольку сейчас мы работаем только с изображениями
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.srcObject = stream;
        video.play();
    });
}

document.getElementById("snap").addEventListener("click", function() {
	context_canvas.drawImage(video, 0, 0, 320, 240);
});

document.getElementById("getcolors").addEventListener("click", function() {
	$("#getcolors").attr('disabled',true);
	$(".i_colors").show();
	step = $("input[name=step]").val();
	minY = $("input[name=yarkost]").val();
   worker.postMessage({'cmd': 'calc_colors', 'data_calc': {minY: minY,step: step,canvas_height: canvas_height,canvas_width: canvas_width,canvas_data: context_canvas.getImageData(0, 0, canvas.width, canvas.height),min_width: min_width,min_height:min_height}});

});