var canvas_data; //данные из канвас
var width; //ширина канвас     
var height; //высота канвас
var squares = []; //массив областей 

self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'calc_colors':
      canvas_data = data.data_calc.canvas_data;
      width = data.data_calc.canvas_width;      
      height = data.data_calc.canvas_height;
      var squares = calculate(data.data_calc); // Функция, вычисляющая области
      self.postMessage({status: 'ok',squares: squares}); //отправляем сообщение с найденными областями
      break;
    default:
      self.postMessage('Unknown command');
  }
}, false);

//функция проверяет принадлежность точки ранее найденным областям
function in_square(x,y){	
 for(var i=0; i<squares.length; i++){
   if(x >= squares[i]['left'] && x <= squares[i]['right'] && y >= squares[i]['up'] && y <= squares[i]['down']){
    return(true);   
   } 
 }
 return(false);
}

//информация по пикселю
function getPixel(x, y) {
		if (x < 0) { x = 0; }
		if (y < 0) { y = 0; }
		if (x >= width) { x = width - 1; }
		if (y >= height) { y = height - 1; }
		var index = (y * width + x) * 4;
		return [
			canvas_data.data[index + 0],
			canvas_data.data[index + 1],
			canvas_data.data[index + 2],
			canvas_data.data[index + 3],
    		];
}
	
//получаем яркость	
function getYarkost(R=0,G=0,B=0){
	var Y = 0.2126*R + 0.7152*G + 0.0722*B; //Фотометрический/цифровой ITU BT.709:
	return(Y);
}
	
//поиск ярких областей	
function calculate(data_calc){	
	var step = parseInt(data_calc.step);
	var canvas_height = parseInt(data_calc.canvas_height);
	var canvas_width = parseInt(data_calc.canvas_width);
	var minY = parseInt(data_calc.minY);
	var min_width = parseInt(data_calc.min_width);
	var min_height = parseInt(data_calc.min_height);
	
		var i=0;
		var pixels_get = 1; //кол-во пройденных пикселей
	//console.log(data_calc.canvas_height,data_calc.canvas_width,data_calc.step);	
	for(var y=0; y<canvas_height; y++){
		for(var x=0; x<canvas_width; x++){
			pixels_get++;
			//если точка в ранее найденной области пропускаем
			if(in_square(x,y)){
				continue;			
			}
			
			//для наглядности пользователю показываем процент проведенных вычислений				
			var proc = parseInt(100*(pixels_get)/(canvas_height*canvas_width));
			self.postMessage({status: 'calculate',proc: proc});
			
			var rgba = getPixel(x, y);
			
			//получить яркость точки
			var Y = getYarkost(rgba[0],rgba[1],rgba[2]);
			   var left = x;
            var up = y;
            var right = x;
            var down = y;
            var max_right = right;
         
         //проходим вправ пока яркость выше минимально заданной   	
			while(Y > minY){
				right = right+step;
 			 	rgba_f = getPixel(right, y);	
 			 	Y = getYarkost(rgba_f[0],rgba_f[1],rgba_f[2]); 			 	
			}
			
			//если получили отрезок больше минимально заданной ширины, то проходим по высоте
			if(right - left > min_width){				
			 var flag = true;
			 max_right = right;
			 down = down+step;
			 right = left;	
			 while(flag){	
			   //console.log("right: " + right + " left: " + left + " up: " + up + " down: " + down);
			   rgba_f = getPixel(right, down);	
 			 	Y = getYarkost(rgba_f[0],rgba_f[1],rgba_f[2]);
			   while(Y > minY){		
			     right = right+step;		
			     console.log("right: " + right + " left: " + left + " up: " + up + " down: " + down);
 			 	  rgba_f = getPixel(right, down);	
 			 	  Y = getYarkost(rgba_f[0],rgba_f[1],rgba_f[2]); 			 	
			   }
			   
			   //если получили отрезок боьше минимально необходимой ширины, проходим дальше по высоте, иначе выходим
			   if(right - left < min_width){
					flag = false;			   
			   }else{
			     down = down+step;
			     right = left;
			   }
		    }
		    //console.log("Itog: max_right: " + max_right + " left: " + left + " up: " + up + " down: " + down);
			 //если высота боьше минимально необходимой, то добавляем область
			 if(down - up > min_height){
   			squares.push({left: left, up: up,right:max_right,down:down});	
   			//y = down;		 
			 }
			}
			
			

			//var res = rgba.filter((q, i) => (i % 4) === 0);
         //console.log(x,y, rgba,Y);		
		}				
	}
	return(squares);
}