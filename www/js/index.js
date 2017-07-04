var map;
var geocoder;
var marker;

var localPage = {};
var infoObj = window.info = {
	anons: [],
	news: []
};
var host = 'http://85.142.163.241/fileadmin/rsmu/app/';

var infoInput = window.infoInput = {
	klin: [
		{
			type: 'text',
			name: 'name',
			title: true,
			placeholder: 'Название',
		},
		{
			type: 'text',
			name: 'addr',
			placeholder: 'Адрес',
		},
	],
	rasp: [
		{
			type: 'text',
			name: 'name',
			placeholder: 'Факультет',
			title: true,
		},
		{
			type: 'text',
			placeholder: 'Группа',
			name: 'groop'
		},
	],
	faq: [
		{
			type: 'text',
			name: 'name',
			title: true,
			placeholder: 'Факультет'
		},
	],
	kont: [
		{
			type: 'text',
			name: 'name',
			title: true,
			placeholder: 'Категория'
		},
	],
	rasp_full: [
		{
			type: 'check',
			name: 'type',
			dis: 'dat',
			placeholder: 'Заголовок'
		},
		{
			type: 'text',
			name: 'name',
			placeholder: 'Предмет (кабинет)',
			title: true,
		},
		{
			type: 'text',
			placeholder: 'начало-конец',
			name: 'dat'
		},
		{
			type: 'hidden',
			name: 'rel',
			prop: 'id',
		},
		{
			type: 'hidden',
			name: 'ned',
			prop: 'ned',
		}
	],
	faq_full: [
		{
			type: 'text',
			name: 'name',
			title: true,
			placeholder: 'Информация'
		},
		{
			type: 'check',
			name: 'type',
			dis: 'text',
			placeholder: 'Заголовок'
		},
		{
			type: 'hidden',
			name: 'rel',
			prop: 'id',
		},
	],
	kont_full: [
		{
			type: 'text',
			name: 'name',
			title: true,
			placeholder: 'Информация'
		},
		{
			type: 'check',
			name: 'type',
			dis: 'text',
			placeholder: 'Заголовок'
		},
		{
			type: 'hidden',
			name: 'rel',
			prop: 'id',
		},
	],
	
};

var showLoad = function () {

	$('#load_map').show();

};

var hideLoad = function () {
	$('#load_map').hide();		
}

var createElement = function (text) {

	var elem = document.createElement('div');
	elem.innerHTML = text;
	return elem.childNodes;

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

var viewListInfo = function(arr, list) {

	if (arr.length !== 0)
		list.innerHTML = '';

	arr.forEach(function (obj) {

		var elem = ons._util.createElement('<ons-list-item tappable modifier="chevron material--flat">'
				+ '	<div class="left">'
				+ '		<img class="list__item__thumbnail" src="' + obj.src + '">'
				+ '	</div>'
				+ '	<div class="center">'
				+ '		' + obj.text + ''
				+ '	</div>'
				+ '</ons-list-item>'), all, origin;

		origin = new RegExp(document.baseURI.match(/(.+?)index.html/)[1]);

		all = elem.querySelectorAll('.center *[href]');

		for (var i = 0; i < all.length; i++) {

			val  = all[i];
			if (origin.test(val.href)) {
				val.href = val.href.replace(origin, 'http://rsmu.ru/');
				// 'http://rsmu.ru/' + val.href;
			}

		}

		all = elem.querySelectorAll('.center *[src]');

		for (var i = 0; i < all.length; i++) {

			val  = all[i];
			if (origin.test(val.href)) {
				// val.src = 'http://rsmu.ru/' + val.src;
				val.src = val.src.replace(origin, 'http://rsmu.ru/');
			}

		}


		elem.addEventListener('click', (function(obj) {

			return function() {

				var a = document.createElement('a');
				// a.href = obj.link;
				// a.setAttribute('target', '_system');
				// a.setAttribute('data-rel', 'external');
				// a.dispatchEvent(new MouseEvent('click'));
				window.open(encodeURI(obj.link), '_system', 'location=yes');

			}

		})(obj), true);

		list.appendChild(elem);

	});

};

var initViewListInfo = function() {

	var arr, list;

	if (localPage.name !== 'news' && localPage.name !== 'anons')
		return

	arr = infoObj[localPage.name];
	list = localPage.link.querySelector('ons-list');

	viewListInfo(arr, list);

};

var requestRSMU = function (callback) {

	var xhr = new XMLHttpRequest();
	var start = new Date().getTime();

	xhr.onload = function(e) {

		var info;

		console.log(e, new Date().getTime() - start);
		info = e.target.response;
		callback(info);

	};
	xhr.open("post", "http://rsmu.ru", true);
	xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
	xhr.withCredentials = false;
	xhr.send();
};

window.fn = {};

window.fn.openLeft = function() {
	var menu = document.getElementById('menu-left');
	menu.open();
};

window.fn.openRightMap = function() {
	var menu = document.getElementById('menu-right');
	var nav = document.getElementById('menuNav');
	nav.pushPage('menu-right-map.html');
	menu.open();
};

window.fn.openRightKlin = function() {
	var menu = document.getElementById('menu-right');
	var nav = document.getElementById('menuNav');
	nav.pushPage('menu-right-klin.html');
	menu.open();
};

window.fn.closeRightKlin = function() {
	var menu = document.getElementById('menu-right');
	var nav = document.getElementById('menuNav');
	nav.pushPage('menu-right-klin.html');
	menu.close();
};

window.fn.openRightGrup = function() {
	var menu = document.getElementById('menu-right');
	var nav = document.getElementById('menuNav');
	nav.pushPage('menu-right-group.html');
	menu.open();
};

window.fn.loadPage = function(page) {
	var content = document.getElementById('content');
	var menu = document.getElementById('menu-left');
	content.load(page)
		.then(menu.close.bind(menu));
};

window.fn.pushPage = function(page, info) {
	document.querySelector('#mainNav').pushPage('full.html', {data: {title: page, info: info}});
};

var loadData = function (arr, callback) {

	document.addEventListener('mapLoad', function() {
		console.log('////.....MAP LOAD......./////')
		callback();
	});

	if (window.loadIndex)
		callback();

	// setTimeout(function() {
	// 	callback();
	// }, 0);
};

var createList = function (page, arr, list) {

	var elem;

	list.innerHTML = '';

	if (arr.length === 0) {
		
		elem = ons._util.createElement('<ons-list-header>'
			+	'<div style="text-align: center; width: 99%">нет записей</div>'
			+'</ons-list-header>');

		list.appendChild(elem);

	}
	else {

		/*
			+	'<div class="left">' + val.name + '</div>'
			+	'<div class="right">' + (val.floor-0+1) + ' floor ' + (val.type === '0'? 'office' : 'stairway') + '</div>'
		*/

		arr.forEach(function (info) {

			var str = '', elem;

			infoInput[page].forEach(function (val) {
				if (val.type === 'text') {
					if (val.title) {
						str += '<span class="list__item__title">' + info[val.name] + '</span>';
					}
					else {
						str += '<span class="list__item__subtitle">' + info[val.name] + '</span>';
					}
				}
			});

			if (info.type === '1') {

				elem = ons._util.createElement('<ons-list-header>'
					// +	'<div class="center">'
					+		info.name
					// +	'</div>'
					+	'<div class="right" style="display: none;"><span>x</span></div>'
					+'</ons-list-header>');

				elem.info = info;

			}
			else {

				elem = ons._util.createElement('<ons-list-item modifier="chevron">'
					+	'<div class="center">'
					+		str
					+	'</div>'
					+	'<div class="right" style="display: none;"><span>x</span></div>'
					+'</ons-list-item>');

				elem.info = info;

				if (!/full/.test(page) && !/klin/.test(page))
					elem.onclick = function () {

						this.info.table = (page + '_full');
						fn.pushPage(page, this.info);

					};

			}

			list.appendChild(elem);

		});

	}

};

var createForm = function (page, list) {

	list.innerHTML = '';

	infoInput[page].forEach(function(val) {

		if (val.type === 'text') {

			elem = ons._util.createElement('<ons-list-item>'
				+	'<div class="center">'
				+		'<ons-input id="' + val.name + '" modifier="underbar" placeholder="' + val.placeholder + '..." float style="width: 98%;"></ons-input>'
				+	'</div>'
				+'</ons-list-item>');

		}
		else if (val.type === 'check') {
			
			elem = ons._util.createElement('<ons-list-item>'
				+	'<div class="center">'
				+		'<ons-switch id="' + val.name + '" modifier="underbar" style="margin-right: 5px;"></ons-switch>' + val.placeholder
				+	'</div>'
				+'</ons-list-item>');

			elem.querySelector('ons-switch input').onchange = (function (val) {

				return function () {

					if (this.checked) {
						document.querySelector('#'+val.dis).setAttribute('disabled', null);
					}
					else {
						document.querySelector('#'+val.dis).removeAttribute('disabled', null);
					}

				};

			})(val);

		}

		list.appendChild(elem);

	});

};

var createAddList = function (page, upd) {

	var obj = page.data;
	var form = new FormData();
	var table = page.data.info.table
	var info = page.data.info;

	form.append('typeReq', 'select');
	form.append('table', table);

	if (info !== undefined && info.id !== undefined) {
		
		var whereObj = {};

		whereObj.rel = {
			type: '==',
			value: page.data.info.id
		}

		if (info.ned !== undefined) {

			whereObj.ned = {
				type: '==',
				value: page.data.info.ned
			}

		}

		form.append('where', JSON.stringify(whereObj));
	

	}



	///////////// info
	showLoad();

	request(form, (function(list) {
		return function (json) {

			var str = '';

			hideLoad();

			createList(table, json, list);

			var items = page.querySelector('#info').childNodes;

			for (var i = 0; i < items.length; i++) {

				items[i].onclick = (function (info) {

					return function () {

						upd.data = info;
						page.querySelector('#send').innerHTML = 'Обновить';

						infoInput[table].forEach(function (val) {

							var elem, input;

							if (val.type === 'text') {
								page.querySelector('#form #' + val.name + ' input').value = info[val.name];
							}
							else if (val.type === 'check') {

								elem = page.querySelector('#form #' + val.name);
								input = elem.querySelector('input');

								if (info.type === '0' && input.checked === true) {
									input.dispatchEvent(new MouseEvent('click'));
								}
								else if (info.type === '1' && input.checked === false) {
									input.dispatchEvent(new MouseEvent('click'));
								}

							}
						});

					};

				})(items[i].info);

				items[i].querySelector('.right').style.display = 'block';
				items[i].querySelector('.right span').onclick = (function (info, item) {

					return function (event) {

						event.stopPropagation();

						var form = new FormData();

						form.append('typeReq', 'delete');
						form.append('table', table);
						form.append('where', JSON.stringify({
							id: {
								type: '==',
								value: info.id
							}
						}));

						showLoad();
						request(form, function () {
							
							hideLoad();
							item.style.display = 'none';

							infoInput[table].forEach(function (val) {

								var elem, input;

								if (val.type === 'text') {
									page.querySelector('#form #' + val.name + ' input').value = '';
								}
								else if (val.type === 'check') {

									elem = page.querySelector('#form #' + val.name);
									input = elem.querySelector('input');

									if (input.checked === true) {
										elem.dispatchEvent(new MouseEvent('click'));
									}

								}
							});

						});

					};

				})(items[i].info, items[i]);

			}

			// var items = page.querySelectorAll('#info ons-list-header');

			infoInput[table].forEach(function (val) {
				if (val.type === 'text') {
					if (val.title) {
						str += '<span class="list__item__title">-</span>';
					}
					else {
						str += '<span class="list__item__subtitle">-</span>';
					}
				}
			});

			elem = ons._util.createElement('<ons-list-item>'
					+	'<div class="center">'
					+		str
					+	'</div>'
					+'</ons-list-item>');

			elem.onclick = function () {

				upd.data = undefined;
				page.querySelector('#send').innerHTML = 'Добавить';

				infoInput[table].forEach(function (val) {

					var elem, input;

					if (val.type === 'text') {
						page.querySelector('#form #' + val.name + ' input').value = '';
					}
					else if (val.type === 'check') {

						elem = page.querySelector('#form #' + val.name);
						input = elem.querySelector('input');

						if (input.checked === true) {
							elem.dispatchEvent(new MouseEvent('click'));
						}

					}
				});

			};

			page.querySelector('#info').appendChild(elem);

		}

	})(page.querySelector('#info')));

};

var initPage = function (page) {

	console.log(page.id);
	localPage.name = page.id;
	localPage.link = page;
	
	if (page.id === 'load') {
		loadData([], function () {
			
			document.querySelector('#mainNav').pushPage('main.html');


		})
	}
	else if (page.id === 'main') {
		
		
	}
	else if (page.id === 'klin') {
	
		map = new google.maps.Map(page.querySelector('#google'), {
			center: {lat: 55.75494070247917, lng: 37.614097595214844},
			zoom: 11,
			disableDefaultUI: true
		});

		geocoder = new google.maps.Geocoder();

		//////////////////
		fn.closeRightKlin();
		
		
	}
	else if (page.id === 'full') {

		page.querySelector('ons-toolbar .right').style.display = 'block';
		page.querySelector('ons-toolbar .right ons-icon').onclick = (function (page) {

			return function () {
				fn.pushPage('add', page.data.info);
			};

		})(page);

		switch (page.data.title) {
			// case 'news':
			// 	page.querySelector('ons-toolbar .center').innerHTML = 'Новости';
			// 	page.querySelector('#fullNav').pushPage('full-news.html');
			// break;
				
			// case 'anons':
			// 	page.querySelector('ons-toolbar .center').innerHTML = 'Анонс';
			// 	page.querySelector('#fullNav').pushPage('full-anons.html');
			// break;
				
			case 'rasp':
				page.querySelector('ons-toolbar .center').innerHTML = 'Расписание';
				page.querySelector('#fullNav').pushPage('full-rasp.html', {data: page.data});
			break;
				
			case 'kont':
				page.querySelector('ons-toolbar .center').innerHTML = 'Контакты';
				page.querySelector('#fullNav').pushPage('full-kont.html', {data: page.data});
			break;
				
			case 'faq':
				page.querySelector('ons-toolbar .center').innerHTML = 'Факультет';
				page.querySelector('#fullNav').pushPage('full-faq.html', {data: page.data});
			break;

			case 'add':
				page.querySelector('ons-toolbar .right').style.display = 'none';
				page.querySelector('ons-toolbar .center').innerHTML = 'Редактирование';
				page.querySelector('#fullNav').pushPage('full-add.html', {data: page.data});

				page.querySelector('ons-back-button').options.callback = (function (data) {

					return function () {

						var table = data.info.table.replace(/(\w+)_(\w+)/, function(m, p1, p2) {return p2 + '-' + p1});

						console.log(data);
						document.querySelector('ons-page#' + table).data = data;
						initPage(document.querySelector('ons-page#' + table));

					};

				})(page.data);
			break;

		}

	}
	else if (page.id === 'news' || page.id === 'anons'){
		
		document.removeEventListener('rnimu', initViewListInfo);
		document.addEventListener('rnimu', initViewListInfo);
		initViewListInfo();

	}
	else if (page.id === 'rasp') {
		
		var form = new FormData();
		form.append('typeReq', 'select');
		form.append('table', 'rasp');

		showLoad();
		request(form, (function(list) {
			return function (json) {
				hideLoad();
				createList('rasp', json, list);
			}
		})(page.querySelector('ons-list')));

	}
	else if (page.id === 'faq') {

		var form = new FormData();
		form.append('typeReq', 'select');
		form.append('table', 'faq');

		request(form, (function(list) {
			return function (json) {
				createList('faq', json, list);
			}
		})(page.querySelector('ons-list')));

	}
	else if (page.id === 'kont') {

		var form = new FormData();
		form.append('typeReq', 'select');
		form.append('table', 'kont');

		request(form, (function(list) {
			return function (json) {
				createList('kont', json, list);
			}
		})(page.querySelector('ons-list')));

	}
	else if (page.id === 'menu-right-klin') {

		var form = new FormData();
		form.append('typeReq', 'select');
		form.append('table', 'klin');

		request(form, (function(list) {
			return function (json) {
				createList('klin', json, list);

				var items = page.querySelector('ons-list').childNodes;

				for (var i = 0; i < items.length; i++) {

					items[i].onclick = function () {

						geocoder.geocode({'address': this.info.addr}, function(results, status) {
							if (status === 'OK') {
								map.setCenter(results[0].geometry.location);

								if (marker !== undefined)
									marker.setMap(null);
								
								marker = new google.maps.Marker({
									map: map,
									position: results[0].geometry.location
								});
								fn.closeRightKlin();
							} else {
								ons.notification.alert('Geocode was not successful for the following reason: ' + status);;
							}
						});

					};

				}

			}
		})(page.querySelector('ons-list')));

	}
	else if (page.id === 'full-rasp') {

		tabs = page.querySelector('ons-tabbar');

		// tabs.addEventListener('prechange', (function (data) {
		// 	return function (event) {

		// 		console.log(data);

		// 		console.log('pre', event.index, tabs.getActiveTabIndex(event.index));
		// 		console.log('pre', event.target.querySelector('#full-rasp-cs'));
		// 		console.log('pre', event.target.querySelector('#full-rasp-zn'));
					
		// 	}
		// })(page.data));

		if (tabs.getActiveTabIndex() === 0) {
			setTimeout(function() {

				tabs.setActiveTab(1);
				setTimeout(function() {
					tabs.setActiveTab(0);
				}, 30);

			}, 30);
		}
		else {
			setTimeout(function() {

				tabs.setActiveTab(0);
				setTimeout(function() {
					tabs.setActiveTab(1);
				}, 30);

			}, 30);
		}

		tabs.addEventListener('postchange', (function (data) {
			return function (event) {

				var page, info = data.info;

				console.log('post', event.index, tabs.getActiveTabIndex(event.index));
				console.log('post', event.target.querySelector('#full-rasp-cs'));
				console.log('post', event.target.querySelector('#full-rasp-zn'));

				if (event.index === 0) {
					data.info.ned = '0'
					page = event.target.querySelector('#full-rasp-cs');
				}
				else {
					data.info.ned = '1'
					page = event.target.querySelector('#full-rasp-zn');
				}

				page.data = data;

				console.log(data);

				var form = new FormData();
				form.append('typeReq', 'select');
				form.append('table', 'rasp_full');

				if (info !== undefined && info.id !== undefined) {
					
					var whereObj = {};
					
					whereObj.rel = {
						type: '==',
						value: page.data.info.id
					}

					if (info.ned !== undefined) {

						whereObj.ned = {
							type: '==',
							value: page.data.info.ned
						}

					}

					form.append('where', JSON.stringify(whereObj));
				

				}

				request(form, (function(list) {
					return function (json) {
						createList('rasp_full', json, list);
					}
				})(page.querySelector('ons-list')));
			
			}
		})(page.data));

		// var form = new FormData();
		// form.append('typeReq', 'select');
		// form.append('table', 'rasp');
		// form.append('where', JSON.stringify({
		// 	rel: {
		// 		type: '==',
		// 		value: page.data.info.id
		// 	}
		// }));

		// request(form, (function(list) {
		// 	return function (json) {
		// 		createList('rasp_full', json, list);
		// 	}
		// })(page.querySelector('ons-list')));

	}
	else if (page.id === 'full-kont') {

		var form = new FormData();
		form.append('typeReq', 'select');
		form.append('table', 'kont_full');
		form.append('where', JSON.stringify({
			rel: {
				type: '==',
				value: page.data.info.id
			}
		}));

		request(form, (function(list) {
			return function (json) {
				createList('kont_full', json, list);
			}
		})(page.querySelector('ons-list')));

	}
	else if (page.id === 'full-faq') {

		var form = new FormData();
		form.append('typeReq', 'select');
		form.append('table', 'faq_full');
		form.append('where', JSON.stringify({
			rel: {
				type: '==',
				value: page.data.info.id
			}
		}));

		request(form, (function(list) {
			return function (json) {
				createList('faq_full', json, list);
			}
		})(page.querySelector('ons-list')));

	}
	else if (page.id === 'full-add') {

		var obj = page.data;
		var form = new FormData();
		var table = page.data.info.table
		var info = page.data.info;
		var upd = {};

		createAddList(page, upd);
		

		/////////// form

		createForm(table, page.querySelector('#form'));

		

		//////////////// send

		page.querySelector('#send').onclick = function () {
	
			var form = new FormData();
			var err = false;

			if (upd.data === undefined) {

				form.append('table', table);
				form.append('typeReq', 'insert');

			}
			else {

				form.append('table', table);
				form.append('typeReq', 'update');
				form.append('where', JSON.stringify({
					id: {
						type: '==',
						value: upd.data.id
					}
				}));

			}

			infoInput[table].forEach(function(val) {
				
				var elem;

				if (val.type === 'text') {

					elem = page.querySelector('#form #' + val.name + ' input');
					if ((elem.value === undefined || elem.value === '') && (!elem.hasAttribute('disabled'))) {

						err = true;
						ons.notification.alert('Введите поле ' + val.placeholder);

					}
					else
						form.append(val.name, elem.value);

				}
				else if (val.type === 'check') {

					elem = page.querySelector('#form #' + val.name);
					input = elem.querySelector('input');

					if (input.checked === true) {
						form.append(val.name, '1');
					}
					else if (input.checked === false) {
						form.append(val.name, '0');
					}

				}
				else if (val.type === 'hidden') {
					form.append(val.name, info[val.prop]);
				}

			});

			if (!err) {

				showLoad();

				request(form, function () {

					hideLoad();

					infoInput[table].forEach(function (val) {

						var elem, input;

						if (val.type === 'text') {
							page.querySelector('#form #' + val.name + ' input').value = '';
						}
						else if (val.type === 'check') {

							elem = page.querySelector('#form #' + val.name);
							input = elem.querySelector('input');

							if (input.checked === true) {
								input.dispatchEvent(new MouseEvent('click'));
							}

						}
					});
					
					createAddList(page, upd);

				});

			}
	
		};
	
	}

};

document.addEventListener('init', function(event) {

	var page = event.target;

	initPage(page);

});



// requestRSMU(function (text) {
	
// 	var cont = document.querySelector('#docum'), all, val;
	
// 	cont.innerHTML = text;
	
// 	all = document.querySelectorAll('*[href]');

// 	for (var i = 0; i < all.length; i++) {

// 		val  = all[i];
// 		if (!/http/.test(val.href)) {
// 			val.href = 'http://rsmu.ru/' + val.href;
// 		}

// 	}

// 	all = document.querySelectorAll('*[src]');

// 	for (var i = 0; i < all.length; i++) {

// 		val  = all[i];
// 		if (!/http/.test(val.href)) {
// 			val.href = 'http://rsmu.ru/' + val.href;
// 		}

// 	}
// });


document.addEventListener('DOMContentLoaded', function() {

	var doc = document.querySelector('#docum');

	console.log(doc);
	doc.onload = function() {

		var anon, news, obj;

		doc = doc.contentDocument;

		anon = doc.querySelectorAll('#calendar_1_place > table > tbody > tr');
		news = doc.querySelectorAll('.news-list > table > tbody > tr');

		for (var i = 0; i < anon.length; i++) {

			if (anon[i].childNodes.length === 2) {

				obj = {};

				obj.src = anon[i].childNodes[0].querySelector('img').src;
				obj.link = anon[i].childNodes[0].querySelector('a').href;
				obj.text = anon[i].childNodes[1].querySelector('p').innerHTML;

				infoObj.anons.push(obj);
				
			}

		}

		for (var i = 0; i < news.length; i++) {

			if (news[i].childNodes.length === 5) {

				obj = {};

				obj.src = news[i].childNodes[1].querySelector('img').src;
				obj.link = news[i].childNodes[1].querySelector('a').href;
				obj.text = news[i].childNodes[3].querySelector('p').innerHTML;
				
				infoObj.news.push(obj);

			}

		}

		console.log(anon, news, infoObj);

		document.dispatchEvent(new Event('rnimu'));
	};

});
