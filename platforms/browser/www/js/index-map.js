  (function(window, document) {

	var floor = window.floor  = [];
	var imgs = ['img/1.png', 'img/2.png', 'img/3.png', 'img/4.png'];
	var filter = ['img/1-filter.png', 'img/2-filter.png', 'img/3-filter.png', 'img/4-filter.png'];
	var async = window.async;
	var matrix;
	var matrixArr;
	var paеhArr;
	var start = true;
//	var host = 'http://127.0.0.1/Curs/www/';
	var host = 'http://85.142.163.241/fileadmin/rsmu/app/';
	
	var last = window.last = [];

	var showModal = true;
	var lastWidth = [];
	var lastHeight = [];
	

	/*
		.......................
		кэш пуьей от точки до точки на заданном этаже
		.......................

	*/
	var cash = window.cash = {};

	var curFloor;
	var changeVal;

	var patch = [];
	var finder = new PF.AStarFinder({
		allowDiagonal: true,
	});

	window.getFloor = function () {
		console.log(curFloor);
	};

	window.getMatrix = function () {
		return matrix;
	};

	var strWhiteSpace = function(str) {

		while (/\n/.test(str)) {
			str = str.replace(/\n/, '<br>');
		}

		return str;
	}


	/*
		.................
		Определение этажа на котором находится точка с заданным id
		................. 
	*/

	var findFloorPoint = function (id) {

		var flr = false, point = false, cur;

		for (var i = 0; i < floor.length; i++) {

			cur = floor[i];

			cur.points.forEach(function (val) {

				if (val.id === id && flr === false) {
					flr = i;
					point = val;
				}

			});

			cur.stairs.forEach(function (val) {
				
				if (val.id === id && flr === false) {
					flr = i;
					point = val;
				}

			});

			if (flr !== false)
				break;
		}

		return [flr, point];

	};

	var showModal = function () {

		$('#modal').show();

	};

	var setModal = function (index, str) {

		if (index) {
			$('#modal #first').text(str);
		}
		else {
			$('#modal #second').text(str);
		}

	};

	var hideModal = function () {

		$('#modal').hide();
		$('#modal #first').text('');
		$('#modal #second').text('');

	};

	var showLoad = function () {

		$('#load_map').show();

	};

	var hideLoad = function () {
		$('#load_map').hide();		
	}


	/*
		....................
		Сохранение floor и cash в Localstorage
		....................
	*/

	var save = function () {

		var arr = [];

		localStorage.setItem("cash", JSON.stringify(cash));

		floor.forEach(function (val) {

			var obj = {};

			obj.filterSrc = val.filterSrc;
			obj.imgSrc = val.imgSrc;
			obj.points = val.points;
			obj.stairs = val.stairs;
			obj.floor = val.floor;

			arr.push(obj);

		});

		localStorage.setItem("floor", JSON.stringify(arr));

	};

	/*
		....................
		Удаление сохраненных путей для данной точки
		....................
	*/

	var deletePoint = function (point, callback) {

		arr = curFloor.points;
		arr.forEach(function(val, index) {

			if (val.id === point.id) {
				arr.splice(index, 1);
			}

		});

		arr = curFloor.stairs;
		arr.forEach(function(val, index) {

			if (val.id === point.id) {
				arr.splice(index, 1);
			}

		});

		form = new FormData();
		form.append('table', 'point');		
		form.append('typeReq',  'delete');
		form.append('where',  JSON.stringify({
			id: {
				type: '==',
				value: point.id
			},
		}));

		request(form, function(json) {
			
			if (callback !== undefined)
				callback();

		});

	};

	var deleteCashe = function (point, callback) {

		var index, val;

		arr = cash[point.floor];

		for (index = 0; index < arr.length; index++) {
			
			val = arr[index];

			if (val.start.id === point.id || val.end.id === point.id) {
				arr.splice(index, 1);
				index--;
			}

			
		}

		// arr.forEach(function(val, index) {

		// 	if (val.start.id === point.id || val.end.id === point.id) {
		// 		arr.splice(index, 1);
		// 	}

		// });

		form = new FormData();
		form.append('table', 'patchs');		
		form.append('typeReq',  'delete');
		form.append('where',  JSON.stringify({
			start_id: {
				type: '==',
				value: point.id
			},
			end_id: {
				type: '==',
				value: point.id
			}
		}));

		request(form, function(json) {
			
			if (callback !== undefined)
				callback();

		});

	};


	/*

		....................
		Добавление путей для данной точки в кэш
		....................

	*/
	var insertCash = function (point, floor, callback1) {


		deleteCashe(point, (function(callback1) {

			return function () {

				var grid = floor.grid, max, arr1, arrCash, load;
	
				arr1 = floor.points.concat(floor.stairs);
				arrCash = cash[point.floor];
				max = arr1.length;
				load = 0;
	
				async.eachSeries(arr1, function(val, callback) {
	
					var obj = {};
	
					if (val.id === point.id) {
						callback();
						return;
					}
	
					obj.start = point;
					obj.end = val
					obj.path = finder.findPath(point.x, point.y, val.x, val.y, grid.clone());
					arrCash.push(obj);
	
					reqPat(obj, function() {
						load++;
						console.log('------', 100/max*load + '%');
						setModal(false, Math.round(100/max*load) + '% paths cashed for current point');
						callback();
					});
	
				},
				function(err) {
	
					console.log(11111111111111111111);
	
					if (err)
						throw new Error(err);
					else
						if (callback1 !== undefined)
							callback1();
	
				});

			}

		})(callback1)); ///  Удаляем сохраненные пути для данной точки


	};

	var reqPoint = function(obj, type, callback) {

		var form = new FormData();

		form.append('table', 'point');		
		form.append('typeReq', type? 'insert' : 'update');	
		form.append('name', obj.name);
		form.append('x', obj.x);
		form.append('y', obj.y);
		form.append('ind', obj.ind);
		form.append('floor', getFloorIndex(curFloor));
		form.append('type', 'floors' in obj? '1': '0');
		if (!type) {
			form.append('where',  JSON.stringify({
				id: {
					type: '==',
					value: obj.id
				},
			}));
		}
		if ('floors' in obj)
			form.append('floors', JSON.stringify(obj.floors));

		if (obj.ind !== '0') {
			form.append('img', obj.img);
			form.append('info', obj.info);
		}

		//////////// ----- показать гиф загрузки
		request(form, function(json) {

			//////////// ----- скрыть гиф загрузки
			if ('err' in json && json.err !== false) {
				ons.notification.alert('error try later');
			}
			else {
				callback(json);
			}

		});

	};

	var reqPat = function(obj, callback) {

		var form = new FormData();

		form.append('table', 'patchs');		
		form.append('typeReq', 'insert');	
		form.append('start_id', obj.start.id);
		form.append('end_id', obj.end.id);
		form.append('path', JSON.stringify(obj.path));

		//////////// ----- показать гиф загрузки
		request(form, function(json) {

			//////////// ----- скрыть гиф загрузки
			if ('err' in json && json.err !== false) {
				ons.notification.alert('error try later');
			}
			else {
				callback(json);
			}

		});

	};

	var request = function (form, callback) {

		var xhr = new XMLHttpRequest();
		var start = new Date().getTime();

		xhr.onload = function(e) {

			var info;

			console.log(e, new Date().getTime() - start);
			if (e.target.response === '')
				info = '';
			else 
				info = JSON.parse(e.target.response);
			
			callback(info);

		};
	
		xhr.open("post", host + "index.php", true);
		xhr.send(form);
	
	};

	var requestWhere = function(table, name, val, callback) {

		var form = new FormData(), where = {};
		
		form.append('typeReq', 'select');
		form.append('table', table);

		where[name] = val;

		// where[name] = {
		// 	value: item.id,
		// 	type: "=="
		// }
		
		form.append('where', JSON.stringify(where));
		
		// request(form, function (data) {
		// 	console.log(data);
		// 	// $.map(data, function(item){
		// 	// 	return item;
		// 	// })
		// 	response($.map(data, function(item){
		// 		return item;
		// 	}));
		// });

		request(form, callback);

	};

	var fn = window.fn;

	var isDescendant = function (parent, child) {
		var node = child.parentNode;
		while (node != null) {
			if (node == parent) {
				 return true;
			}
			node = node.parentNode;
		}
		return false;
	}

	fn.rightSlide = function () {
		document.querySelector('#menu').open();
	}

	fn.close = function () {
		document.querySelector('#menu').close();
	}

	fn.load = function (nav, str, opt) {
		document.querySelector('#' + nav).pushPage(str, opt);
	}

	fn.canvasPoint = function () {

		var cl = new MouseEvent('click');
		var back = document.querySelector('ons-back-button');

		back.dispatchEvent(cl);

		setTimeout(function() {
			
			fn.close();
			curFloor.canvas.onclick = function (event) {

				console.log(event.offsetX, event.offsetY);
				document.querySelector('#nav').pushPage('add.html', {data: {pos: {
					x: event.offsetX,
					y: event.offsetY
				}}});

			};


		}, 100);

	};

	var getFloorIndex = function (obj) {

		var index;

		for (var i = 0; i < floor.length; i++) {

			if (floor[i] === obj) {
				index = i;
				break;
			}

		}

		return index;

	};

	window.onunload = function () {
		// save();
	};

	var listView = function (list, arr, callback) {

		arr.forEach(function(val) {

			var elem = ons._util.createElement('<ons-list-item>'
				+	'<div class="left">' + val.name + '</div>'
				+	'<div class="right">' + (val.floor-0+1) + ' этаж ' + (val.type === '0'? 'кабинет' : 'лестница') + '</div>'
				+'</ons-list-item>');

			console.log(elem);

			list.appendChild(elem);

			elem.addEventListener('click', (function(obj) {
				return function () {
					callback(event, obj);
				}
			})(val));

		});

	};

	var findStairs = function (name, to) {

		var toFloor = floor[to],
			toStair;

		for (i = 0; i < toFloor.stairs.length; i++) {
			if (toFloor.stairs[i].name === name) {
				toStair = toFloor.stairs[i];

				break;
			}
		}

		return toStair;

	};

	/*
		.............
		Проверка на какой этаж ссылается данная точка
		.............
	*/

	var findFloor = function (obj) {

		var fl;

		if ('floor' in obj) {

			fl = obj.floor;

		}
		else {

			fl = undefined;

			floor.forEach(function(value, index) {

				if (fl === undefined) {
					
					value.points.concat(value.stairs).forEach(function(val) {
	
						if (fl === undefined) {
	
							if (val === obj) {
								fl = index;
							}
							
						}
	
	
					});

				}

			});

		}


		return fl;
	};

	/*
		...............
		Поиск пути между точками в кэше путей
		...............
	*/

	var findPathFromCash =  function (from, to) {

		var arr, patch, floor, floorTest, i, value;

		patch = [];

		floor = findFloor(from);
		floorTest = findFloor(to);

		if (floor === floorTest) {

			arr = cash[floor];

			for (i = 0; i < arr.length; i++) {

				value = arr[i];

				if (value.start.id === from.id && value.end.id === to.id || value.end.id === from.id && value.start.id === to.id) {
					patch = value.path;
					break;
				}

			}

		}
		else {

			if (from.type === '1' && to.type === '1' && from.name === to.name && Math.abs(from.floor-to.floor) === 1) {
				patch[99] = undefined;			
			}

		}

		return patch;

	};

	/*
		...............
		Построение массива точек
		...............
	*/

	var generateMatrixArr = function () {

		var arr = [];

		floor.forEach(function (val) {

			arr = arr.concat(val.stairs).concat(val.points);

		});

		return arr;

	};

	/*
		...............
		Построение матрицы графа
		...............
	*/

	var generateMatrix = function () {

		var length, find, i, j;

		matrix = [];
		matrixArr = generateMatrixArr();
		length = matrixArr.length;

		for (i = 0; i < length; i++) {

			// на случай если массив уже был инициализорован
			if (!Array.isArray(matrix[i]))
				matrix[i] = [];

			for (j = i; j < length; j++) {

				if (matrix[i][j] === undefined) {

					find = findPathFromCash(matrixArr[i], matrixArr[j]);
					find = {
						path: find,
						start: matrixArr[i],
						end: matrixArr[j],
						length: find.length === 0? Infinity : find.length,
					};

					matrix[i][j] = find;

					if (i !== j) {

						// т.к. в случае обратной последователности меняются только начальная и конечная точка
						if (!Array.isArray(matrix[j]))
							matrix[j] = [];

						matrix[j][i] = {
							path: find.path,
							start: find.end,
							end: find.start,
							length: find.length

						};

					}

				}

			}

		}

		return matrix;

	};

	/*
		.............
		Получение точки из массива точек для матрицы
		.............
	*/

	var getPointFromMatrixArr = function (point) {

		var res;

		for (var i = 0; i < matrixArr.length; i++) {
			if (point.id === matrixArr[i].id) {
				res = i;
				break;
			}
		}

		return res;

	};

	/*
		.......
		Попирование объекта
		......
	*/

	var copy = function (obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	/*
		................
		Поиск кратчайшего пути между точкаи
		................
	*/


	var getPath = function (from, to) {

		var res, findCash, shortArr, fi, ti, n, i, point, p, arr;

		// parent = []; // массив все возможных путей
		// arr = [];	
		
		fi = getPointFromMatrixArr(from);
		ti = getPointFromMatrixArr(to);

		shortArr = [];
		findCash = []; // кэш уже проверенных точек
		p = [];
		arr = [];

		n = matrixArr.length;

		for (i = 0; i < n; i++) {
			shortArr[i] = Infinity;
			findCash[i] = false;
		}

		shortArr[fi] = 0;

		for (i = 0; i < n; i++) {

			point = -1;
			
			for (var j = 0; j < n; j++) {
				if (!findCash[j] && (point == -1 || shortArr[j] < shortArr[point]))
					point = j;
			}

			if (!isFinite(shortArr[point]))
				break;

			findCash[point] = true;

			for (j = 0; j < n; j++) {

				if (shortArr[point] + matrix[point][j].length < shortArr[j]) {
					shortArr[j] = shortArr[point] + matrix[point][j].length;
					p[j] = point;
				}

			}

		}

		// console.log(matrixArr);
		// console.log(p);

		for (i = ti; i != fi; i = p[i]) {
			if (i === undefined) {
				ons.notification.alert('Не нашел путь');
				return [];
			}
			arr.push(i);
		}

		arr.push(fi);

		// console.log(arr);

		p = [];

		for (i = (arr.length-2); i >= 0; --i) {
			p.push(matrix[arr[(i+1)]][arr[i]]);
		}

		console.log(p);

		

		return p;

	};


	var viewPath = function (path) {

		// var index = false;

		path.forEach(function (val) {

			if (val.start.floor === val.end.floor) {
				// index = false;
				document.querySelector('ons-tab[label="' + (val.start.floor-0+1) + '"] div').style.color = 'red';
				Draw(floor[val.start.floor], val.path);
			}

		});

	};

	var clearPath = function () {

		[0,1,2,3].forEach(function (index) {

			var elem;
			
			if (floor[index].context !== undefined) {
				clearCanvas(floor[index]);
				elem = document.querySelector('ons-tab[label="' + (index-0+1) + '"] div');
				if (elem !== null)
					elem.removeAttribute('style');
				drawAllPoint(floor[index]);
			}

		});

	};


	var Filter = function(imageData, fun, index) {
		// получаем одномерный массив, описывающий все пиксели изображения
		var pixels = imageData.data;
		// циклически преобразуем массив, изменяя значения красного, зеленого и синего каналов
		for (var i = 0; i < pixels.length; i += 4) {

			var r = pixels[i];
			var g = pixels[i + 1];
			var b = pixels[i + 2];

			if (r === g && r === b && g === b && r < 210) { // && !(r === 255 && g === 255 && b === 255)
				
				if (index === true) {
					pixels[i]     = 0; // red
					pixels[i + 1] = 0; // green
					pixels[i + 2] = 0; // blue
				}
				
				if (fun !== undefined)
					fun(i, true);
			}
			else {
				if (index === true) {
					pixels[i]     = 255; // red
					pixels[i + 1] = 255; // green
					pixels[i + 2] = 255; // blue
				}
				// if (fun !== undefined)
				// 	fun(i, true);
			}
			
		}
		
		return imageData;
	};

	var setFloor = function (img, filtered, obj, callback) {

		var canvas = obj.canvas,
			grid,
			context,
			imageData,
			fcan;

		fcan = document.createElement('canvas');
		ican = document.createElement('canvas')

		if (lastWidth[obj.floor] === undefined && lastHeight[obj.floor] === undefined || lastWidth[obj.floor] !== img.width || lastHeight[obj.floor] !== img.height) {
			canvas.width = img.width;
			canvas.height = img.height;

			lastHeight[obj.floor] = img.height;
			lastWidth[obj.floor] = img.width;
		}

		fcan.width = img.width;
		fcan.height = img.height;

		ican.width = img.width;
		ican.height = img.height;

		grid = obj.grid = new PF.Grid(img.width, img.height);
		obj.img = img;

		context = obj.context = canvas.getContext('2d');
		context = ican.getContext('2d');
		context.drawImage(img, 0, 0);

		ican.toBlob(function(blob) {

			reader = new FileReader()

			reader.onload = (function (obj) {

				return function () {

					obj.imgSrc = reader.result;

					imageData = obj.imageData = context.getImageData(0, 0, img.width, img.height);

					if (filtered !== false) {

						grid = obj.grid = new PF.Grid(filtered.width, filtered.height);
						fcan.getContext('2d').drawImage(filtered, 0, 0);

						fcan.toBlob(function(blob) {

							reader = new FileReader()

							reader.onload = (function (obj) {

								return function () {

									obj.filterSrc = reader.result;

									// Filter(context.getImageData(0, 0, filtered.width, filtered.height), (function (width, height) {
									
									// 	return function(num, wall) {
									
									// 		var x,y;
									
									// 		if (wall) {
									// 			num = (num-num%4) / 4;
									// 			x = num % width;
									// 			y = (num-x)/width;
									
									// 			grid.setWalkableAt(x, y, false);
									// 		}
									
									// 	};
									
									// })(filtered.width, filtered.height));

									// context.drawImage(img, 0, 0);

									callback();

								};

							})(obj);

							reader.readAsDataURL(blob);

						});
						
						

					}
					else {
						grid = obj.grid = new PF.Grid(img.width, img.height);
						// Filter(imageData, (function (width, height) {
						
						// 	return function(num, wall) {
						
						// 		var x,y;
						
						// 		if (wall) {
						// 			num = (num-num%4) / 4;
						// 			x = num % width;
						// 			y = (num-x)/width;
						
						// 			grid.setWalkableAt(x, y, false);
						// 		}
						
						// 	};
						
						// })(img.width, img.height));

						// context.drawImage(img, 0, 0);

						callback();

					}

				};

			})(obj);

			reader.readAsDataURL(blob);

		});

	};

	var getLocalFile = function (obj, index, callback) {

		var img;
		
		if (obj.imgSrc === undefined || obj.imgSrc === '') {
			callback();
			return;
		}

		img = new Image();
		img.src = obj.imgSrc;
		img.onload = (function (obj, index) {
			return function () {
				
				var img = this,
					filtered;

				if (obj.filterSrc !== undefined && obj.filterSrc !== '') {
					filtered = new Image();
					filtered.src = obj.filterSrc;
					filtered.onload = (function(img, obj, index) {

						return function () {
							setFloor(img, this, obj, callback);
						};

					})(img, obj, index);

				}
				else {
					
					setFloor(img, false, obj, callback);

				}

			}
		})(obj, index);

		// строим матрицу из закешированных данных

	};

	var loadImg = function (src, callback) {

		
		var xhr = new XMLHttpRequest();

		xhr.open('GET', src, true);
		xhr.responseType = 'blob';

		xhr.onload = function() {

			var blob, reader;

			if (this.status == 200) {

				blob = new Blob([this.response], { type: 'image/png' });
				reader = new FileReader();

				reader.onload = function () {

					var img = new Image();

					img.onload = function () {

						callback(img, blob);

					};

					img.src = reader.result;

				};

				reader.readAsDataURL(blob);
				
				

			}
		};

		xhr.send();

	}

	var getServerFile = function (obj, index, callback) {
		
		requestWhere('maps', 'floor', {value: (index+1), type: '=='} ,function(json) {

			console.log(json);

			json.forEach(function (val) {

				var img;

				obj.floor = index;
				cash[index] = [];

				img = new Image();
				img.src = host + val.img;
				img.onload = (function (obj, index, val) {
					return function () {
						
						var img = this,
							filtered;

						if (val.filter !== null && val.filter !== '') {
							filtered = new Image();
							filtered.src = host + val.filter;
							filtered.onload = (function(img, obj, index) {

								return function () {
									setFloor(img, this, obj, callback);
								};

							})(img, obj, index);

						}
						else {
							
							setFloor(img, false, obj, callback);

						}

					}
				})(obj, index, val);

			});
		});


	};


	var initFloors = function(fun, call) {

		// showModal();
		async.eachSeries([0,1,2,3], function(index, callback) {

			
			var obj, img;

			if (floor[index] !== undefined)
				obj = floor[index];
			else
				obj = {};

			obj.floor = index;
			// cash[index] = [];

			if (last[index] !== undefined) {
				obj.points = last[index].points;
				obj.stairs = last[index].stairs;
				obj.imgSrc = last[index].imgSrc;
				obj.filterSrc = last[index].filterSrc;
					
			}
			else {
				obj.points = [];
				obj.stairs = [];	
			}

			if (floor[index] === undefined)
				floor.push(obj);

			if (index === 0)
				setTimeout((function (obj) {
					return function () {
						curFloor = obj;
					}
				})(obj), 100);

			fun(obj, index, callback);

			
		}, function(err){
			
			if (err)
				throw err;

			call();

			
		});	


		

	};

	var drawPoint = function (obj, x, y) {

		var ctx = obj.context;

		ctx.beginPath();
		ctx.strokeStyle = "orange";
		ctx.fillStyle = "red";
		ctx.lineWidth = 5;
		ctx.arc(x,y,3,0,Math.PI*2,true); // Outer circle
		ctx.stroke();
		ctx.fill();

	};

	var drawAllPoint = function (obj) {

		obj.points.concat(obj.stairs).forEach(function (value) {
			drawPoint(obj, value.x, value.y);
		});

	};

	var Draw  = function (obj, patch) {

		var ctx = obj.context;

		if (patch.length !== 0) {

			ctx.beginPath(); 

			ctx.beginPath(); 
			ctx.lineWidth="2";
			ctx.strokeStyle="red";
			ctx.moveTo(patch[0][0], patch[0][1]);
			
			for (var i = 1; i < patch.length; i++)
				ctx.lineTo(patch[i][0], patch[i][1]);

			ctx.stroke();

		}
		else {
			ons.notification.alert('Не нашел путь');
		}

	};

	var clearCanvas = function (obj) {

		var context = obj.context,
			img = obj.img;

		// context.drawImage(img, 0, 0);
		// obj.imageData = context.getImageData(0, 0, img.width, img.height);
		context.putImageData(obj.imageData, 0, 0);

	};

	var insertCallback = function(index) {

		var str = index? 'stairs': 'points';

		return (function (str) {
			return function (json) {
	
				console.log(json);
				
				curFloor[str].push(json);
				insertCash(json, curFloor, function () {
					
					var nav = document.querySelector('#nav'),
						length = nav.pages.length;

					generateMatrix();
					save();

					hideModal();
					nav.resetToPage('main.html', {
						callback: function () {
							clearCanvas(curFloor);
							drawAllPoint(curFloor);
						}
					});
					// nav.insertPage(length-3, document.querySelector('#main'));

					// document.querySelector('#nav').popPage({
					// 	callback: function () {
					// 		optionInit();
					// 	}
					// });
		
				});
	
			}
		})(str);
	};

	var updateCallback = function (json) {

		console.log(json);
									
		insertCash(json, curFloor, function () {

			var nav = document.querySelector('#nav'),
				length = nav.pages.length;

			generateMatrix();
			save();
			hideModal();

			nav.resetToPage('main.html', {
				callback: function () {
					clearCanvas(curFloor);
					drawAllPoint(curFloor);
				}
			});

			// document.querySelector('#nav').popPage({
			// 	callback: function () {
			// 		optionInit();
			// 	}
			// });
		
		});

	};

	var optionInit = function (page) {

		if (page === undefined)
			page = document.querySelector('#option');

		var list = page.querySelector('ons-list'), form;

		var elem = ons._util.createElement('<ons-list-header>'
		+	'лестница'
		+'</ons-list-header>');

		list.innerHTML = '';
		list.appendChild(elem);

		curFloor.stairs.forEach(function(value) {

			var elem = ons._util.createElement('<ons-list-item modifier="nodivider material--flat">'
			+	'<div class="left">'
			+		value.name
			+	'</div>'
			+	'<div class="right">'
			+		'<ons-icon icon="fa-close">'
			+	'</div>'
			+ '</ons-list-item>');

			list.appendChild(elem);

			$(elem).find('.left').click((function(value) {
				return function() {
					fn.load('nav', 'add.html', {data: {value: value}}); // , index: false
				}
			})(value));

			$(elem).find('.center').click((function(value) {
				return function() {
					fn.load('nav', 'add.html', {data: {value: value}}); // , index: false
				}
			})(value));
			$(elem).find('.right').click((function(value, elem, list) {
				return function() {
					
					elem.style.opacity = 0.5;

					deletePoint(value, function() {

						deleteCashe(value, function () {
							list.removeChild(elem);
						});

					});

				}
			})(value, elem, list)); 

		});

		elem = ons._util.createElement('<ons-list-header>'
		+	'кабинет'
		+'</ons-list-header>');

		list.appendChild(elem);

		curFloor.points.forEach(function(value) {
			
			var elem = ons._util.createElement('<ons-list-item modifier="nodivider material--flat">'
			+	'<div class="left">'
			+		value.name
			+	'</div>'
			+	'<div class="right">'
			+		'<ons-icon icon="fa-close">'
			+	'</div>'
			+'</ons-list-item>');

			list.appendChild(elem);

			if (value.type === '0') {

				value.x = value.x-0;
				value.y = value.y-0;
				delete value.floors;

			}
			else if (val.type === '1') {

				value.x = value.x-0;
				value.y = value.y-0;
				value.floors = JSON.parse(value.floors);

			}


			$(elem).find('.left').click((function(value) {
				return function() {
					fn.load('nav', 'add.html', {data: {value: value}}); // , index: false
				}
			})(value));

			$(elem).find('.center').click((function(value) {
				return function() {
					fn.load('nav', 'add.html', {data: {value: value}}); // , index: false
				}
			})(value));
			$(elem).find('.right').click((function(value, elem, list) {
				return function() {
					
					elem.style.opacity = 0.5;

					deletePoint(value, function() {

						deleteCashe(value, function () {
							list.removeChild(elem);
							clearCanvas(curFloor);
							drawAllPoint(curFloor);
						});

					});
				}
			})(value, elem, list)); 

		});

		document.querySelector('ons-back-button').options.callback = function (event) {
			
			console.log(event);

			var elem = document.querySelector('#can');
			// setTimeout(function() {
				// if (!isDescendant(elem, curFloor.canvas))
				// elem.removeChild(curFloor.canvas);
				// elem.appendChild(curFloor.canvas);

			// }, 100);

		};

	};

	


	/*
		..........................
		Достаем все точки из базы и сохраняем
		Нужно чтобы кешировать пути при добавлении новой точки
		..........................
	*/

	// initFloors(function (obj, index, callback) {

	// 	var canvas = obj.canvas = document.createElement('canvas');

	// 	getLocalFile(obj, index, callback);
	// 	getServerFile(obj, index, callback);

	// });

	if (localStorage.getItem('cash') !== null) {
		cash = JSON.parse(localStorage.getItem('cash'));
	}

	if (localStorage.getItem('floor') !== null) {
		last = JSON.parse(localStorage.getItem('floor'));
	}

	// initFloors(function (obj, index, callback) {

	// 	var canvas = obj.canvas = document.createElement('canvas');

	// 	// getLocalFile(obj, index, callback);
	// 	getServerFile(obj, index, callback);

	// }, function () {

	// 	var form = new FormData();
	// 	form.append('table', 'point');		
	// 	form.append('typeReq',  'select');
		
	// 	request(form, function(json) {
	// 		console.log(json);

	// 		[0,1,2,3].forEach(function(index) {

	// 			floor[index].points = [];
	// 			floor[index].stairs = []

	// 		});

	// 		json.forEach(function(val) {

	// 			if (val.type === '0') {

	// 				val.x = val.x-0;
	// 				val.y = val.y-0;
	// 				delete val.floors;
	// 				floor[val.floor].points.push(val);

	// 			}
	// 			else if (val.type === '1') {

	// 				val.x = val.x-0;
	// 				val.y = val.y-0;
	// 				floor[val.floor].stairs.push(val);
	// 				val.floors = JSON.parse(val.floors);

	// 			}

	// 			drawPoint(floor[val.floor], val.x, val.y);

	// 		});

	// 		form = new FormData();
	// 		form.append('table', 'patchs');		
	// 		form.append('typeReq',  'select');

	// 		request(form, function(json) {
	// 			console.log(json);

	// 			[0,1,2,3].forEach(function(index) {

	// 				cash[index] = [];

	// 			});

	// 			json.forEach(function(val) {

	// 				var start, end, patch, floorStart, floorEnd;

	// 				start = findFloorPoint(val.start_id);
	// 				end =  findFloorPoint(val.end_id);

	// 				floorStart = start[0];
	// 				floorEnd = end[0];

	// 				if (floorStart === floorEnd) {

	// 					cash[floorStart].push({
	// 						start: start[1],
	// 						end: end[1],
	// 						path: JSON.parse(val.path)
	// 					});

	// 				}
	// 				else
	// 					throw new Error('Error of patch. Points on different floors');

	// 			});

	// 			generateMatrix(); // строим матрицу графа после загрузкиж всех данных
	// 			save();
	// 			hideModal();

	// 		});
	// 	});

	// });


	document.addEventListener('DOMContentLoaded', function(event) {

		initFloors(function (obj, index, callback) {

			var canvas = obj.canvas = document.createElement('canvas');

			getLocalFile(obj, index, callback);
			// getServerFile(obj, index, callback);
			// callback();

		}, function () {

			generateMatrix();
			document.dispatchEvent(new Event('mapLoad'));
			window.loadIndex = true;
			clearPath();
			// hideModal();
			showLoad();
			// showModal = false;

			initFloors(function (obj, index, callback) {

				// var canvas = obj.canvas = document.createElement('canvas');

				// getLocalFile(obj, index, callback);
				getServerFile(obj, index, callback);

			}, function () {

				var form = new FormData();
				form.append('table', 'point');		
				form.append('typeReq',  'select');
				
				request(form, function(json) {
					console.log(json);

					[0,1,2,3].forEach(function(index) {

						floor[index].points = [];
						floor[index].stairs = []

					});

					json.forEach(function(val) {

						if (val.type === '0') {

							val.x = val.x-0;
							val.y = val.y-0;
							delete val.floors;
							floor[val.floor].points.push(val);

						}
						else if (val.type === '1') {

							val.x = val.x-0;
							val.y = val.y-0;
							floor[val.floor].stairs.push(val);
							val.floors = JSON.parse(val.floors);

						}

						// drawPoint(floor[val.floor], val.x, val.y);

					});

					form = new FormData();
					form.append('table', 'patchs');		
					form.append('typeReq',  'select');

					request(form, function(json) {
						console.log(json);

						[0,1,2,3].forEach(function(index) {

							cash[index] = [];

						});

						json.forEach(function(val) {

							var start, end, patch, floorStart, floorEnd;

							start = findFloorPoint(val.start_id);
							end =  findFloorPoint(val.end_id);

							floorStart = start[0];
							floorEnd = end[0];

							if (floorStart === floorEnd) {

								cash[floorStart].push({
									start: start[1],
									end: end[1],
									path: JSON.parse(val.path)
								});

							}
							else
								throw new Error('Error of patch. Points on different floors');

						});

						generateMatrix(); // строим матрицу графа после загрузкиж всех данных
						save();
						clearPath();
						hideLoad();
						// hideModal();

					});
				});

			});

			
		});
		
	});

	// document.addEventListener('deviceready', function(event) {

	// 	initFloors(function (obj, index, callback) {

	// 		var canvas = obj.canvas = document.createElement('canvas');

	// 		getLocalFile(obj, index, callback);
	// 		getServerFile(obj, index, callback);

	// 	});

	// });

	// window.addEventListener('filePluginIsReady', function(){ 

	// 	// initFloors(function (obj, index, callback) {

	// 	// 	var canvas = obj.canvas = document.createElement('canvas');

	// 	// 	getLocalFile(obj, index, callback);
	// 	// 	getServerFile(obj, index, callback);

	// 	// });

	// }, false);

	document.addEventListener('init', function(event) {
		
		var page = event.target, tabs;

		console.log(page.id);


		if (page.id === 'main') {

			if (start) {
				start = false;
				// if (showModal)
					// showModal();
			}

		}
		else if (page.id === 'maps') {

			// clearPath();
			
			tabs = page.querySelector('ons-tabbar');
			tabs.addEventListener('prechange', function (event) {
				console.log('pre', event.index, tabs.getActiveTabIndex(event.index));
				console.log('pre', event.target.querySelector('ons-page[style="display: block;"]'));
					
			});
			tabs.addEventListener('postchange', function (event) {
				
				var page = event.target.querySelector('ons-page[style="display: block;"]');
				var can = page.querySelector('#can');
				var canvas = floor[event.index].canvas;

				// floor[event.index].context.putImageData(floor[event.index].imageData, 0, 0);
				// clearPath();				
				
				can.innerHTML = '';
				can.appendChild(canvas);

				curFloor = floor[event.index];

				canvas.onclick = (function (index) {

					return function (event) {

						var arr = curFloor.points.concat(curFloor.stairs),
							x = event.offsetX,
							y = event.offsetY,
							val;


						for (var i = 0; i < arr.length; i++) {
							
							val = arr[i];

							if (Math.abs(val.x-x) <= 5 && Math.abs(val.y-y) <= 5 && val.ind !== '0') {
								document.querySelector('#nav').pushPage('info.html', {data: {val: val}});
								break;
							}

						}

						// arr.forEach(function(val) {

						// 	if (Math.abs(val.x-x) <= 5 && Math.abs(val.y-y) <= 5) {

						// 	}

						// });


						
						// var map, last, pat;
						// // console.log(event.target, canvas);
						// console.log(event.offsetX, event.offsetY);
						// map = floor[index];

						// // drawPoint(map, event.offsetX, event.offsetY);
	
						// switch (patch.length) {
						// 	case 0:
						// 		drawPoint(map, event.offsetX, event.offsetY);
						// 		patch[0] = [event.offsetX, event.offsetY];
						// 		console.log(1, patch);
						// 	break;
						// 	case 1:

						// 		drawPoint(map, event.offsetX, event.offsetY);
						// 		patch[1] = [event.offsetX, event.offsetY];
						// 		console.log(2, patch, map);

						// 		// console.log(map);

						// 		// finder = new PF.AStarFinder({
						// 		// 	allowDiagonal: true,
						// 		// });

						// 		last = new Date().getTime();
						// 		pat = finder.findPath(patch[0][0], patch[0][1], patch[1][0], patch[1][1], map.grid.clone());
						// 		// clearGrid(map.grid, pat);
						// 		// console.log(new Data().getTime() - last);
						// 		if (pat.length === 0) {
						// 			ons.notification.alert('No patch');
						// 		}
						// 		else {
						// 			console.log(pat, new Date().getTime() - last);
						// 			Draw(map, pat);
						// 			// copyGrid = map.grid.clone();
						// 		}


						// 	break;
						// 	case 2:

						// 		clearCanvas(map);

						// 		drawPoint(map, event.offsetX, event.offsetY);

						// 		patch = [];
						// 		patch[0] = [event.offsetX, event.offsetY];
								
						// 		console.log(3, patch);

						// 	break;
						// }
		
					};
				})(event.index);

			});

			// if (changeVal !== undefined) {
			// 	curFloor.canvas.onclick = function (event) {

			// 		console.log(event.offsetX, event.offsetY);

			// 		document.querySelector('#nav').pushPage('add.html', {data: {
			// 			pos: {
			// 				x: event.offsetX,
			// 				y: event.offsetY
			// 			},
			// 			value: changeVal
			// 		}});

			// 	};
			// }

		}
		else if (page.id === 'form') {

			setTimeout(function() {

				var from = page.querySelector('span.from'),
					to = page.querySelector('span.to');

				console.log(from, to);

			}, 100);

		}
		else if (page.id === 'search') {

			setTimeout(function () {

				var back = page.querySelector('ons-back-button');
				var inp = page.querySelector('#search input');
				var list = page.querySelector('ons-list');
				var arr = [];
				var type = page.data.type;

				console.log(type);

				floor.forEach(function (val) {
					arr = arr.concat(val.points).concat(val.stairs);
				});
	
				back.options.callback = function () {
	
					var from = document.querySelector('span.from'),
						to = document.querySelector('span.to');
	
					console.log(from, to);
				};

				inp.addEventListener('input', (function(arr){

					return function () {
					
						var result = [];
						var str = this.value;

						if (this.value.length < 1) {
							list.innerHTML = '';
							return;
						}

						arr.forEach(function(val) {

							if (new RegExp(str, 'i').test(val.name)) {
								result.push(val);
							}

						});

						list.innerHTML = '';

						listView(list, result, function (event, val) {

							document.querySelector('#nav').popPage({
								callback: function () {

									var from = document.querySelector('span.from'),
										to = document.querySelector('span.to');

									console.log(type);
									
									if (type === 'from') {

										from.info = val;
										from.innerHTML = val.name;

									}
									else if (type === 'to') {

										to.info = val;
										to.innerHTML = val.name;

									}

									if (from.info !== undefined && to.info !== undefined) {

										console.log('search...', from.info, findFloor(from.info), to.info, findFloor(to.info));

										clearPath();
										viewPath(getPath(from.info, to.info));

									}

								}
							})

						});

					};

				})(arr));

				/*
					function (event) {
					
						var result = [];
						var str = this.value;

						arr.forEach(function(val) {

							if (new RegExp(str, 'i'))

						});

					}
				*/

			}, 100);

		}
		else if (page.id === 'add') {

			var obj = {};
			var name = page.querySelector('#name input');
			var office = page.querySelector('#office');
			var stairway = page.querySelector('#stairway');
			var type = false;
			var arr = [page.querySelector('#check-1'), page.querySelector('#check-2'), page.querySelector('#check-3'), page.querySelector('#check-4')];
			var index = page.querySelector('#index');
			var img = page.querySelector('#img');
			var info = page.querySelector('#info');
			var pos = page.data.pos;
			var val = page.data.value;
			// var type = page.data.index;
			// if (pos !== undefined) {
			// 	obj.x = pos.x;
			// 	obj.y = pos.y;
			// }

			$('.change').hide();
			$('.floor').hide();
			$('.info').hide();

			console.log(val);

			if (val !== undefined) {

				name.value = val.name;
				type = 'floors' in val? true: false;

				if (type) {
					var cl = new MouseEvent('click');
					stairway.querySelector('input').dispatchEvent(cl);

					name.focus(); //dispatchEvent(cl);

					$('.floor').show();
					if (typeof val.floors === 'string')
						val.floors = JSON.parse(val.floors);

					val.floors.forEach(function(val) {
						var cl = new MouseEvent('click');
						arr[val].querySelector('input').dispatchEvent(cl);
						// arr[val].setAttribute('clicked', '');
					});

					// $('.change').show();
				}
				else {
					var cl = new MouseEvent('click');
					office.querySelector('input').dispatchEvent(cl);
				}

				$('.change').show();

				obj = val;

				console.log(page.querySelector('#change'));

				// setTimeout(function() {
				$('#change').click((function(val) {
					return function () {

						changeVal = val;
						fn.load('nav', 'floor' + (curFloor.floor+1) + '.html');


					};
				})(val));

				if (val.ind !== '0') {

					var cl = new MouseEvent('click');
					index.querySelector('input').dispatchEvent(cl);

					if (val.img !== null) {
						// img.style.maxWidth = '80%';

						if (typeof val.img !== 'string') {
							var reader  = new FileReader();
							reader.readAsDataURL(val.img);
							reader.onloadend = function () {
								img.src = reader.result;
							}
						}
						else
							img.src = host + val.img;
					}

					if (val.info !== null) {
						info.value = val.info;
					}
					
					$('.info').show();

				}
				// }, 100);
				

			}

			if (pos !== undefined) {
				obj.x = pos.x;
				obj.y = pos.y;
			}

			office.querySelector('input').addEventListener('change', function() {
				$('.floor').hide();
				type = false;
			});

			stairway.querySelector('input').addEventListener('change', function() {
				$('.floor').show();
				type = true;
			});

			obj.ind = '0';

			index.querySelector('input').addEventListener('click', (function (index, obj) {

				return function () {

					if (index === false) {
						$('.info').show();
						index = true;
						obj.ind = '1';
					}
					else {
						$('.info').hide();
						index = false;
						obj.ind = '0';
					}

				};

			})(val === undefined? false: val.ind !== '0', obj));

			img.addEventListener('click', (function (obj) {

				return function() {

					var input = document.createElement('input'), click, that;
	
	
					input.setAttribute('type', 'file');
	
					that = this;
	
					input.addEventListener('change', (function (obj) {
	
						return function (event) {
	
							var file = input.files[0];
							var reader  = new FileReader();
	
							reader.readAsDataURL(file);
							reader.onloadend = function () {
								that.src = reader.result;
							}
	
							// form.append('img', file);
							obj.img = file;
	
						};
	
					})(obj));
	
					click = new MouseEvent('click');
					input.dispatchEvent(click);

				}
			})(obj));

			console.log(page.querySelector('#send'));

			// setTimeout(function() {
			$('#send').click((function (obj) {
				return function() {

					var err = false, index = false;
			
					if (name.value === '') {
			
						err = true;
						ons.notification.alert('set name');
			
					}
			
					if (type) {
			
						arr.forEach(function(value) {
			
							if (value.checked)
								index = true;
			
						});
			
						if (!index) {
							err = true;
							ons.notification.alert('not selected floor');	
						}
			
					}
			
			
					if (!err) {
						
						obj.name = name.value;

						if (obj.ind !== '0') 
							obj.info = info.value;

						showModal();

						if (index) { // stairway
							
							obj.floors = [];

							arr.forEach(function(value, index) {
							
								if (value.checked)
									obj.floors.push(index);
							
							});

							if (val === undefined) { // insert
								// curFloor.stairs.push(obj);
								reqPoint(obj, true, insertCallback(true));
							}
							else { // update
								reqPoint(obj, false, updateCallback);
							}

						}
						else { // office

							if (val === undefined) { // insert
								// curFloor.points.push(obj);
								reqPoint(obj, true, insertCallback(false));
							}
							else { // update
								reqPoint(obj, false, updateCallback);
							}
						}

						// save();
						// document.querySelector('#nav').popPage();
						// ons.notification.alert('ok');
					}

				}
			})(obj));
			

		}

		else if (page.id === 'option') {

			optionInit(page);

			

		}
		else if (page.id === 'maplist') {

			(function () {

				var form = new FormData();
				var maplist = page.querySelector('#maplist');
				
				maplist.innerHTML = '';

				form.append('table', 'maps');		
				form.append('typeReq',  'select');
				
				request(form, function(json) {

					var battom,  formList = [];

					console.log(json);
					json.forEach(function(val, index) {

						var elem, img, battom, tWidth, tHeight, form;
						
						form = new FormData();

						elem = document.createElement('div');
						elem.style.margin = '20px 0 20px 0';
						elem.style.textAlign = 'center';
						elem.id = 'img-'+(index+1);

						battom = ons._util.createElement('<div style="margin: 20px 0 20px 0; text-align: center;">'
							+ '<ons-button modifier="quiet">Отфильтровать</ons-button>'
						+ '</div>');

						console.log(val);

						form.append('id', val.id);
						form.append('where', JSON.stringify({
							
							id: {
								type: '==',
								value: val.id
							}
							
						}));
						

						form.append('floor', val.floor);

						img = document.createElement('img');
						img.src = host + val.img;
						img.onload = function () {

							tWidth = this.width;
							tHeight = this.height;

						};
						img.addEventListener('click', (function (form,index) {

							return function () {

								var input = document.createElement('input'), click, that;


								input.setAttribute('type', 'file');

								that = this;

								input.addEventListener('change', (function (form, index) {

									return function (event) {

										var file = input.files[0];
										var reader  = new FileReader();

										console.log(file);
										reader.readAsDataURL(file);
										reader.onloadend = function () {
											that.src = reader.result;
										}

										form.append('img', file);


									};

								})(form, index));

								click = new MouseEvent('click');
								input.dispatchEvent(click);

							};

						})(form, index));

						elem.appendChild(img);
						maplist.appendChild(elem);
						maplist.appendChild(battom);

						battom.querySelector('ons-button').addEventListener('click', (function (index, img, maplist, form) {

							return function () {

								var canvas, context, imageData, url;

								canvas = document.createElement('canvas');

								canvas.width = img.width;
								canvas.height = img.height;

								context = canvas.getContext('2d');
								context.drawImage(img, 0, 0);
								imageData = context.getImageData(0, 0, img.width, img.height);
								// imageData = Filter(imageData, undefined, true);

								context.putImageData(imageData, 0, 0);

								url = canvas.toDataURL();

								img = maplist.querySelector('#filter-'+(index+1) + ' img');
								img.src = url;

								canvas.toBlob(function(blob) {

									console.log(blob);

									form.append('filter', blob);

								}, 'image/png');

							}

						})(index, img, maplist, form));

						img.onload = function () {

						};

						elem = document.createElement('div');
						elem.style.margin = '20px 0 20px 0';
						elem.style.textAlign = 'center';
						elem.id = 'filter-'+(index+1);

						img = document.createElement('img');
						// img.style.width = '100%';

						if (val.filter !== null && val.filter !== '') {

							img.src = host + val.filter;

						}

						img.addEventListener('click', (function (form,index) {

							return function () {

								var input = document.createElement('input'), click, that;
								input.setAttribute('type', 'file');

								that = this;

								input.addEventListener('change', (function (form, index) {

									return function (event) {

										var file = input.files[0];
										var reader  = new FileReader();
										reader.readAsDataURL(file);
										reader.onloadend = function () {
											that.src = reader.result;
										}

										form.append('filter', file);

									};

								})(form, index));

								click = new MouseEvent('click');
								input.dispatchEvent(click);

							};

						})(form, index));


						elem.appendChild(img);
						maplist.appendChild(elem);

						formList.push(form);

					});


					battom = ons._util.createElement('<div style="margin: 100px 0 20px 0; text-align: center;">'
							+ '<ons-button modifier="material">Send</ons-button>'
						+ '</div>');

					battom.querySelector('ons-button').addEventListener('click', (function (formList) {

						return function () {

							showModal();

							formList.forEach(function (form) {

								form.append('typeReq', 'update');
								form.append('table', 'maps');
								request(form, function (json) {
	
									// document.querySelector('ons-back-button').options.callback = function (event) {
										
									// 	console.log(event);

									// 	var elem = document.querySelector('#can');
									// 	console.log(curFloor);


									// };

									document.querySelector('#nav').popPage({
										callback: function() {
											console.log(curFloor);

											async.eachSeries(floor, function(floor, callback1) {

												var indexFloor = getFloorIndex(floor);

												getServerFile(floor, indexFloor, function() {

														var arr1, load;

														arr = floor.points.concat(floor.stairs);
														load = 0;
														max = arr.length;

														// curFloor;
														async.eachSeries(arr, function(val, callback) {

															console.log(100/max*load + '%');
															setModal(true, Math.round(100/max*load) + '% points cashed on floor ' + (indexFloor-0+1));
															load++;

															insertCash(val, floor, callback);
															

														},
														function(err) {

															console.log(222222222222);

															if (err)
																throw new Error(err);
															else
																callback1();

														});

												});
												

											},
											function(err) {

												console.log(222222222222);

												if (err)
													throw new Error(err);
												else {

													hideModal();
													console.log('done');
													floor.forEach(function (val) {
														clearCanvas(val);
													});
													floor.forEach(function (val) {
														drawAllPoint(val);
													});

												}

											});
											

										}

									});
	
								});	
								
							});

						};

					})(formList));

					maplist.appendChild(battom);

				});

			})();

		}
		else if (page.id === 'info') {

			var name = page.querySelector('#name');
			var img = page.querySelector('#img');
			var info = page.querySelector('#info');
			var val = page.data.val;

			name.innerHTML = val.name;
			
			if (val.img !== null) {
				// img.style.maxWidth = '80%';

				if (typeof val.img !== 'string') {
					var reader  = new FileReader();
					reader.readAsDataURL(val.img);
					reader.onloadend = function () {
						img.src = reader.result;
					}
				}
				else
					img.src = host + val.img;
			}

			if (val.info !== null)
				info.innerHTML = strWhiteSpace(val.info);

		}

		else if (/floor/.test(page.id)) {

			if (curFloor !== undefined) {
				
				var clone = curFloor.canvas.cloneNode(), context;

				page.querySelector('#can').appendChild(clone);
				context = clone.getContext('2d');

				if (curFloor.imageData !== undefined) {

					context.putImageData(curFloor.imageData, 0, 0);
					if (changeVal)
						drawPoint({context: context}, changeVal.x, changeVal.y);

				}
			
				clone.onclick = function (event) {
	
					console.log(event.offsetX, event.offsetY, changeVal);

					changeVal.x = event.offsetX;
					changeVal.y = event.offsetY;


					// document.querySelector('#can').removeChild(document.querySelector('#can canvas'));
					document.querySelector('#nav').popPage();
	
				};
			}
		}

	});

})(window, document);