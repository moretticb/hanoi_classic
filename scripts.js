var book_spr;
var pages_spr;
var room_spr;

// viewport dimensions
var vp_width = 700;
var vp_height = 400;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

window.onload = function(){
	room_spr = new Spriter("room_anim", 700, 400, "./images/room_sprite.jpg", 10, 59, 1, 0, true);
	room_spr.gotoAndStop(0);

	book_spr = new Spriter("book_anim", 700, 400, "./images/book_sprite.png", 1, 12, 1, 0, true);
	book_spr.gotoAndStop(0);

	pages_spr = new Spriter("book_menu_pages", 700, 400, "./images/pages_sprite.png", 10, 27, 1, 0, true);
	pages_spr.gotoAndStop(0);

	place_towers();

	logo_intro([all2desk, show_book, show_book_menu]);
}
window.oncontextmenu = function(evt){
	evt.preventDefault();
}

function incdisk(inc,input_id){
	if(start_time != null && input_id=="input_disks"){
		change_page_to("newgame");
		return;
	}

	var input_disk = document.getElementById(input_id);
	input_disk.value = parseInt(input_disk.value)+inc;
	if(input_disk.value < 1){
		input_disk.value = 1;
	}
	return false;
}

function chain_anims(anims){
	if(anims.length > 0){
		var next = anims.shift();
		if(typeof next == "function"){
			next(anims);
		} else {
			for(var i=0;i<next.length;i++){
				next[i](i==0 ? anims : []);
			}
		}
	}
}

function logo_intro(anims){
	logo_spr = new Spriter("logoscreen", 700, 400, "./images/logospr.png", 10, 107, 1, 0, true);
	logo_spr.onFrameChange = function(frame){
		if(frame == 59){
			logo_spr.stop();
			stage = 1;
			setTimeout(function(){
				logo_spr.gotoAndPlay(60);
				new AdvTween(Quad.prototype.easeIn, 255, 0, 7, false, function(value){
					var hx = Math.round(value).toString(16);
					document.getElementById("logoscreen").style.backgroundColor="#"+hx+hx+hx;

					if(parent.document){
						parent.document.getElementsByTagName("DIV")[0].style.opacity = 1-value/255;
					}
				})
			}, f2m(getFPS(),25))
		} else if(frame == 65){
			logo_spr.stop();
			blur_all();
			setTimeout(function(){
				logo_spr.gotoAndPlay(66);
				new AdvTween(Quad.prototype.easeIn, 1, 0, 7, false, function(value){
					document.getElementById("logoscreen").style.backgroundColor="rgba(0,0,0,"+value+")";
				})
			}, f2m(getFPS(),25))
		} else if(frame == 85){
			unblur_room(anims);
		} else if(frame == 106){
			document.getElementById("logoscreen").style.display = "none";
		}
	}
}

function fall_raise_book(value){
	value = Math.abs(value);
	var book_anim = document.getElementById("book_anim");
	var scale = 0.3*(1-value);

	book_anim.style.opacity = value;
	book_anim.style.backgroundSize = ((1+scale)*vp_width)+"px";
	book_anim.style.width = ((1+scale)*vp_width)+"px";
	book_anim.style.height = ((1+scale)*vp_height)+"px";

	book_anim.style.left = (-scale/2*vp_width)+"px"
	book_anim.style.top = (-scale/2*vp_height)+"px"
}

function show_book(anims){
	var fall_twn = new AdvTween(Elastic.prototype.easeInOut, 0, 1, 24, false, fall_raise_book);
	fall_twn.onMotionFinished = function(){
		document.getElementById("book_menu_pages").style.display="";
		book_spr.gotoAndPlay(0);
		book_spr.onFrameChange = function(frame){
			if(frame == book_spr.spriteData._totalTiles-1){
				book_spr.stop();

				chain_anims(anims);
			}
		}
	}
}


function set_book_page(page){
	var book_menu = document.getElementById("book_menu");

	if(page == "main" && user == null){ // very first time
		var markup = '<div class="classiclogo"></div>';
		markup += '<div class="diskselector">';
		markup += '<p><span style="font-weight: bold; font-size: 20px; border: 1px dashed #773C00;">W</span>elcome to the classic tow-<br>er of hanoi game. What is</p><br>';
		markup += '<p>your name?</p><br><br>';
		markup += '<p><input type="text" id="user_name" style="width: 190px; border: none; border-bottom: 1px solid #377C00;" value="'+(user?user:"user")+'" /></p><br><div style="display: block; text-align: center;"><p>user name</p></div>';
		markup += '</div>';
		markup += '<div class="startbtn" id="next_btn">next &gt;&gt;</div>';

		book_menu.innerHTML = markup;

		document.getElementById("next_btn").onclick = function(evt){
			user = document.getElementById("user_name").value;
			if(user.length == 0){
				user = null;
			} else {
				document.getElementById("username").innerHTML = user;
				change_page_to("main");
			}
		}
	} else if(page == "main"){
		var markup = '<div class="classiclogo"></div>';
		markup += '<div class="diskselector">';
		markup += '<p><span style="font-weight: bold; font-size: 20px; border: 1px dashed #773C00;">W</span>elcome to the classic tow-<br>er of hanoi game. Play with</p><br>';
		markup += '<div class="input_num">';
		markup += '<div onclick="return incdisk(-1,\'input_disks\')">&nbsp;&minus;</div>';
		markup += '<input type="text" id="input_disks" value="'+disks+'" />';
		markup += '<div onclick="return incdisk(1,\'input_disks\')">+&nbsp;</div>';
		markup += '</div>';
		markup += '<p>disks, set animation<br> speed to</p>';
		markup += '<div class="input_num">';
		markup += '<div onclick="return incdisk(-1,\'anim_spd\')">&nbsp;&minus;</div>';
		markup += '<input type="text" id="anim_spd" value="'+spd_disk_anim+'" />';
		markup += '<div onclick="return incdisk(1,\'anim_spd\')">+</div>';
		markup += '</div> <p>frames and </p><br>';
		markup += '<p>see </p><div onclick="change_page_to(\'controls\')">controls</div> <p>for more</p><br><p>instructions. Good game!</p>';
		markup += '</div>';
		markup += '<div class="startbtn" id="start_btn" style="margin-left: -40px;">'+(start_time == null ? 'Start' : 'Resume')+'</div>';
		markup += '<div class="startbtn" onclick="change_page_to(\'more\')" style="margin-left: 50px;">More</div>';

		book_menu.innerHTML = markup;

		var startbtn = document.getElementById("start_btn");
		startbtn.onclick = function(){
			spd_disk_anim = parseInt(document.getElementById('anim_spd').value);
	
			if(startbtn.innerHTML != "Resume") init_disks(document.getElementById('input_disks').value);
	
			if(seq.length == 0) seq_rec(disks,TOWER_START,TOWER_AUX,TOWER_DEST,seq);
	
			place_disks();
			set_disks_opacity(0);
			hide_book_menu([pages_backward,hide_book,desk2wall,[blur_wall,show_towers],show_classicbar, start_resume_clock])
		}
	} else if(page == "more"){
		var counter = 0;
		var markup = '<div class="classiclogo"></div>';
		markup += '<div class="diskselector">';
		markup += '<p><table>';
		markup += '<tr onclick="change_page_to(\'controls\')"><td>Controls.................</td><td>'+(++counter)+'</td></tr>';
		markup += '<tr onclick="window.user=null; change_page_to(\'main\')"><td>Change user..........</td><td>'+(++counter)+'</td></tr>';
		markup += '<tr onclick="change_page_to(\'about\')"><td>About......................</td><td>'+(++counter)+'</td></tr>';
		markup += '<tr onclick="change_page_to(\'main\')"><td>Main menu.............</td><td>'+(++counter)+'</td></tr>';
		if(start_time != null){
			markup += '<tr id="resume_game_entry"><td>Resume game.........</td><td>'+(++counter)+'</td></tr>';
			markup += '<tr onclick="change_page_to(\'newgame\')"><td>New game..............</td><td>'+(++counter)+'</td></tr>';
		}
		markup += '</table></p>';
		markup += '</div>';

		book_menu.innerHTML = markup;

		var resume_game_entry = document.getElementById("resume_game_entry");
		if(resume_game_entry){
			resume_game_entry.onclick = function(){
				place_disks();
				set_disks_opacity(0);
				hide_book_menu([
					pages_backward,
					hide_book,
					desk2wall,
					blur_wall,
					show_towers,
					show_classicbar,
					start_resume_clock
				]);
			}
		}
		
	} else if(page == "about"){
		var markup = '<div class="classiclogo"></div>';
		markup += '<div class="diskselector">';
		markup += '<p><span style="font-weight: bold; font-size: 20px; border: 1px dashed #773C00;">A</span>bout Hanoi Classic</p><br><br>';
		markup += '<p>Programming and design:</p><br>';
		markup += '<a href="http://www.moretticb.com" target="_blank">Caio Benatti Moretti</a><br>';
		markup += '<p>Art:</p><br>';
		markup += '<a href="https://github.com/matheus-crivellari" target="_blank">Matheus Crivellari</a><br><br>';
		markup += '</div>';
		markup += '<div class="startbtn" onclick="change_page_to(\'main\')" style="width: 150px; margin-left: -30px;">Main menu</div>';

		book_menu.innerHTML = markup;
	} else if(page == "newgame"){
		var markup = '<div class="classiclogo"></div>';
		markup += '<div class="diskselector">';
		markup += '<p><span style="font-weight: bold; font-size: 20px; border: 1px dashed #773C00;">N</span>ew game?</p><br><br>';
		markup += '<p>The progress of the current</p><br>';
		markup += '<p>game will be lost.</p><br><br>';
		markup += '<p>Do you want to proceed?</p>';
		markup += '</div>';
		markup += '<div class="startbtn" onclick="reset_game(); change_page_to(\'main\')" style="margin-left: -40px;">Yes</div>';
		markup += '<div class="startbtn" onclick="change_page_to(\'main\')" style="margin-left: 50px;">No</div>';

		book_menu.innerHTML = markup;
	} else if(page == "controls"){
		var markup = '<div class="diskselector" style="margin-top: -90px;">';
		markup += '<p>&nbsp;&nbsp;Move disk from-to (keys):</p>';
		markup += '<table style="font-size: 12px; text-align: right; width: 160px;">';
		markup += '<tr><th>tower</th><td>1</td><td>2</td><td>3</td></tr>';
		markup += '<tr><th>key<br><br>&nbsp;</th>';
		markup += '<td><div class="keycap"><div><b>1</b></div></div><br>or<br><div class="keycap"><div>&#x25C0;</div></div></td>';
		markup += '<td><div class="keycap"><div><b>2</b></div></div><br>or<br><div class="keycap"><div>&#x25BC;</div></div></td>';
		markup += '<td><div class="keycap"><div><b>3</b></div></div><br>or<br><div class="keycap"><div>&#x25B6;</div></div></td>';
		markup += '</tr></table>';

		markup += '<br><p>Control modes:</p>';
		markup += '<table style="font-size: 12px; text-align: center;">';
		markup += '<tr><th>drag</th><th>swipe</th><th>keys</th></tr>';
		markup += '<tr>';
		markup += '<td style="width: 62px;"><div class="keycap"><div><b>8</b></div></div></td>';
		markup += '<td style="width: 62px;"><div class="keycap"><div><b>9</b></div></div></td>';
		markup += '<td style="width: 62px;"><div class="keycap"><div><b>0</b></div></div></td>';
		markup += '</tr></table>';

		markup += '<br><p>Other:</p>';
		markup += '<table style="font-size: 12px; text-align: center; width: 200px;">';
		markup += '<tr>';
		markup += '<th>pause</th><td><div class="keycap"><div>'+(isMobile?"&#128337;":"&#x21B2;")+'</div></div></td>';
		markup += '<td>&nbsp;</td>';
		markup += '<th>undo</th><td><div class="keycap"><div>esc</div></div></td>';
		markup += '</tr>';
		markup += '<th colspan="4">show disk number</th><td colspan="1"><div class="keycap"><div>space</div></div></td>';
		markup += '</table>';

		markup += '<div class="startbtn" onclick="change_page_to(\'main\')" style="top: 243px; left: 30px; width: 110px;">main menu</div>';
		markup += '</div>';

		book_menu.innerHTML = markup;
	} else {
		book_menu.innerHTML = "";
	}
}

function change_page_to(page, options){
	var book_menu = document.getElementById("book_menu");

	if(options && options.first){
		set_book_page(page);
		pages_flip([function(){
			new Tween(book_menu.id, "opacity", Quad.prototype.easeInOut, 0, 1, 15, false);
		}]);
		return;
	}

	var twn = new Tween(book_menu.id, "opacity", Quad.prototype.easeInOut, 1, 0, 15, false);
	twn.onMotionFinished = function(){
		change_page_to(page,{first: true});
	}	
}

function show_book_menu(anims){
	change_page_to("main", {first: true});
}

function hide_book_menu(anims){
	var book_menu = document.getElementById("book_menu");
	var twn = new Tween(book_menu.id, "opacity", Quad.prototype.easeInOut, 1, 0, 15, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function hide_book(anims){
	var close_twn = new AdvTween(Quad.prototype.easeInOut, 11, 0, 12, false, function(value){
		book_spr.gotoAndStop(Math.round(value));
	});
	close_twn.onMotionFinished = function(){
		document.getElementById("book_menu_pages").style.display="none";
		new AdvTween(Cubic.prototype.easeOut, 1, 0, 12, false, fall_raise_book);
		chain_anims(anims);
	}
}


function fall_book(){
	new AdvTween(Elastic.prototype.easeInOut, 0, 1, 24, false, fall_raise_book);
}

function raise_book(){
	var teste = new AdvTween(Cubic.prototype.easeOut, 1, 0, 12, false, fall_raise_book);
}

function open_book(anims){
	book_spr.gotoAndPlay(0);
	book_spr.onFrameChange = function(frame){
		if(frame == book_spr.spriteData._totalTiles-1){
			book_spr == stop();
			chain_anims(anims);
		}
	}
}


function close_book(anims){
	var twn = new AdvTween(Quad.prototype.easeInOut, 11, 0, 12, false, function(value){
		book_spr.gotoAndStop(Math.round(value));
	});
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function pages_forward(anims){
	pages_spr.gotoAndPlay(0);
	pages_spr.onFrameChange = function(frame){
		if(frame == pages_spr.spriteData._totalTiles-1){
			pages_spr.stop();
			chain_anims(anims);
		}
	}
}

function pages_backward(anims){	
	var finished = function(){
		chain_anims(anims);
	};

	if(pages_spr.spriteData._currentframe == 0){
		finished();
		return;
	}

	var twn = new AdvTween(None.prototype.easeNone, 27, 0, 32, false, function(value){
		pages_spr.gotoAndStop(Math.round(value));
	});
	twn.onMotionFinished = finished;
}

function pages_flip(anims){
	next = pages_spr.spriteData._currentframe == 0 ? pages_forward : pages_backward;
	next(anims);
}


function game_complete(anims){
	var logoscr = document.getElementById("logoscreen");
	logoscr.style.display="inline-block";
	logoscr.style.backgroundImage = 'url("images/completemsg.png")';
	logoscr.style.backgroundRepeat = "no-repeat";
	logoscr.style.backgroundPosition = "center";
	var twn = new AdvTween(Cubic.prototype.easeOut, 0, 0.5, 10, false, function(value){
		logoscr.style.backgroundColor = "rgba(0,0,0,"+value+")";
	})

	twn.onMotionFinished = function(){
		setTimeout(function(){
			chain_anims(anims);
		}, 1000);
	}
}


function show_final_score(anims){
	var twn = new Tween("scorescreen", "top", Elastic.prototype.easeInOut, -400, 0, 20, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function hide_final_score(anims){
	var twn = new Tween("scorescreen", "top", Elastic.prototype.easeInOut, 0, -400, 20, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function update_score_board(){
	document.getElementById("cell_num_disks").innerHTML = disks;
	document.getElementById("cell_num_moves").innerHTML = moves;
	document.getElementById("cell_time").innerHTML = update_clock();
	document.getElementById("cell_moves_sec").innerHTML = (moves/game_duration()).toFixed(1);
	document.getElementById("cell_score").innerHTML = score;

	var hl_markup = "<ul>";
	
	for(h in hl){
		if(h=="min_moves" && hl[h]){
			hl_markup += "<li>Minimum number of moves!</li>";
		} else if(h=="disks_min_moves" && hl[h].length > 0){
			hl_markup += "<li>Disks placed with minimum number of moves: "+hl[h].join(", ")+".</li>";
		} else if(h=="streak_min" && hl[h] > 3){
			hl_markup += "<li>"+hl[h]+" correct moves in a streak</li>";
		} else if(h=="correct_start" && hl[h]){
			hl_markup += "<li>Very first move was correct!</li>";
		}
	}
	
	document.getElementById("cell_highlights").innerHTML = hl_markup;
	
	document.getElementById("play_again_btn").onclick = document.getElementById("next_level_btn").onclick = function(){
		if(this.id == "next_level_btn") disks++;
		reset_game();

		chain_anims([
			unblur_room,
			[
				all2wall,
				hide_final_score,
				function(){
					var screenlogo = document.getElementById("logoscreen");
					screenlogo.style.backgroundImage = "none";
					new AdvTween(Quad.prototype.easeInOut, 0.5, 0, 10, false, function(value){
						screenlogo.style.backgroundColor = "rgba(0,0,0,"+value+")";
					}).onMotionFinished = function(){
						screenlogo.style.display = "none";
					}
				}
			],
			[blur_wall,show_towers],
			show_classicbar,
			start_resume_clock
		]);
	}


	document.getElementById("exit_main_menu_btn").onclick = function(){
		reset_game();

		chain_anims([
			unblur_room,
			[
				all2desk,
				hide_final_score,
				function(){
					var screenlogo = document.getElementById("logoscreen");
					screenlogo.style.backgroundImage = "none";
					new AdvTween(Quad.prototype.easeInOut, 0.5, 0, 10, false, function(value){
						screenlogo.style.backgroundColor = "rgba(0,0,0,"+value+")";
					}).onMotionFinished = function(){
						screenlogo.style.display = "none";
					}
				}
			],
			show_book,
			show_book_menu
		]);
	}
}


function all2desk(anims){
	room_spr.onFrameChange = function(frame){
		if(frame == 29){
			room_spr.stop();
			chain_anims(anims);
		}
		
	}
	room_spr.gotoAndPlay(0);
}

function desk2wall(anims){
	room_spr.gotoAndPlay(29);
	room_spr.onFrameChange = function(frame){
		if(frame == 58) chain_anims(anims);
	}
}

function wall2desk(anims){
	var twn = new AdvTween(Quad.prototype.easeInOut, 59, 29, 24, false, function(value){
		room_spr.gotoAndStop(Math.round(value));
	});
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function wall2all(anims){
	new AdvTween(Cubic.prototype.easeIn, 59, 35, 30, false, function(value){
		room_spr.gotoAndStop(Math.round(value));
	}).onMotionFinished = function(){
		new AdvTween(Quad.prototype.easeInOut, 13, 0, 20, false, function(value){
			room_spr.gotoAndStop(Math.round(value));
		}).onMotionFinished = function(){
			chain_anims(anims);
		}
	}
}

function all2wall(anims){
	new AdvTween(Quad.prototype.easeInOut, 0, 11, 20, false, function(value){
		room_spr.gotoAndStop(Math.round(value));
	}).onMotionFinished = function(){
		new AdvTween(None.prototype.easeNone, 35, 59, 30, false, function(value){
			room_spr.gotoAndStop(Math.round(value));
		}).onMotionFinished = function(){
			chain_anims(anims);
		}
	}

	/*room_spr.gotoAndPlay(0);
	room_spr.onFrameChange = function(frame){
		if(frame == 13){
			room_spr.stop();
			room_spr.gotoAndPlay(35);
		}
	}*/
}

function blur_wall(anims){
	var room_blur = document.getElementById("room_blur");
	room_blur.style.opacity = 0;
	room_blur.style.backgroundImage = "url('./images/wall_blur.jpg')";
	var twn = new Tween(room_blur.id, "opacity", Quad.prototype.easeInOut, 0, 1, 15, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function unblur_room(anims){
	var twn = new Tween("room_blur", "opacity", Quad.prototype.easeInOut, 1, 0, 15, false);

	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function blur_all(anims){
	var room_blur = document.getElementById("room_blur");
	room_blur.style.opacity = 0;
	room_blur.style.backgroundImage = "url('./images/all_blur.jpg')";
	var twn = new Tween(room_blur.id, "opacity", Quad.prototype.easeInOut, 0, 1, 15, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}


function show_towers(anims){
	var base = document.getElementById("base");
	var t0 = document.getElementById("tower0");
	var t1 = document.getElementById("tower1");
	var t2 = document.getElementById("tower2");

	var target_base = base.offsetLeft;
	base.style.left = base.offsetLeft-vp_width;
	var twn = new Tween("base","left",Quad.prototype.easeInOut,base.offsetLeft,target_base,15,false,{opacity: 1});

	var target_t = [t0.offsetLeft, t1.offsetLeft, t2.offsetLeft]

	t0.style.left = t0.offsetLeft-vp_width;
	new Tween(t0.id,"left",Quad.prototype.easeInOut,t0.offsetLeft,target_t[0],15,false,{opacity: 1});

	t1.style.left = t1.offsetLeft-vp_width;
	new Tween(t1.id,"left",Quad.prototype.easeInOut,t1.offsetLeft,target_t[1],15,false,{opacity: 1});

	t2.style.left = t2.offsetLeft-vp_width;
	new Tween(t2.id,"left",Quad.prototype.easeInOut,t2.offsetLeft,target_t[2],15,false,{opacity: 1});

	twn.onMotionFinished = function(){
		for(var d=0;d<disks;d++){
			var disk_elem = document.getElementById("disk"+d);
			var target_disk = disk_elem.offsetTop;
			disk_elem.style.top = disk_elem.offsetTop-vp_height;

			setTimeout(function(disk_elem, target_disk){
				var twn = new Tween(disk_elem.id,"top",Cubic.prototype.easeIn,disk_elem.offsetTop,target_disk,15,false,{opacity: 1});
				twn.onMotionFinished = function(){
					if(parseInt(disk_elem.id.substr(4)) == 0){
						chain_anims(anims);
						enabled = 1;
					}
						
				}
			}, f2m(getFPS(), 10+5*(disks-d)), disk_elem, target_disk);
		}
	}
}

function hide_towers(anims){
	for(var d=0;d<disks;d++){
		var disk_elem = document.getElementById("disk"+d);
		new Tween(disk_elem.id,"left",Quad.prototype.easeInOut,disk_elem.offsetLeft,disk_elem.offsetLeft-vp_width,15,false);
	}

	
	var base = document.getElementById("base");
	var t0 = document.getElementById("tower0");
	var t1 = document.getElementById("tower1");
	var t2 = document.getElementById("tower2");
	
	new Tween(base.id,"left",Quad.prototype.easeInOut,base.offsetLeft,base.offsetLeft-vp_width,15,false);
	new Tween(t0.id,"left",Quad.prototype.easeInOut,t0.offsetLeft,t0.offsetLeft-vp_width,15,false);
	new Tween(t1.id,"left",Quad.prototype.easeInOut,t1.offsetLeft,t1.offsetLeft-vp_width,15,false);
	var twn = new Tween(t2.id,"left",Quad.prototype.easeInOut,t2.offsetLeft,t2.offsetLeft-vp_width,15,false);

	twn.onMotionFinished = function(){
		for(var d=0;d<disks;d++){
			var disk_elem = document.getElementById("disk"+d);
			disk_elem.style.opacity = 0;
			disk_elem.style.left = disk_elem.offsetLeft + vp_width;
		}

		base.style.opacity = 0;
		base.style.left = base.offsetLeft + vp_width;

		t0.style.opacity = 0;
		t0.style.left = t0.offsetLeft + vp_width;

		t1.style.opacity = 0;
		t1.style.left = t1.offsetLeft + vp_width;

		t2.style.opacity = 0;
		t2.style.left = t2.offsetLeft + vp_width;


		chain_anims(anims);
	}
}

function show_classicbar(anims){
	var bar = document.getElementById("classicbar");
	var twn = new Tween("classicbar", "top", Elastic.prototype.easeOut, -bar.offsetHeight, 0, 20, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}

function hide_classicbar(anims){
	var bar = document.getElementById("classicbar");
	var twn = new Tween(bar.id, "top", Elastic.prototype.easeOut, 0, -bar.offsetHeight, 20, false);
	twn.onMotionFinished = function(){
		chain_anims(anims);
	}
}


function game_loop(){
	document.getElementById("stopwatch").innerHTML = update_clock();
}
var interval_gameloop = setInterval(game_loop, 1000);


//////////// ENGINE ///////////

var min_gap = 10;
var max_disk_width = 190
var min_disk_width = 15;
var max_disk_height = 20;
var min_disk_height = 15;

var towers = null;
var disks = 3;
var TOWER_START = 0;
var TOWER_AUX = 1;
var TOWER_DEST = 2;

var start_time = null;
var paused_time = null;
var pause_durations = 0;

var score = 0;
var moves = 0;
var seq = [];
var perfect = true;
var last_move = "";
var last_score = 0;
var last_perfect = false;
var user = null;

function create_highlights(){
	return {
		correct_start: false,
		min_moves: false,
		streak_min: 0,
		disks_min_moves: []
	}
}
var hl = create_highlights();

var show_disk_number = false;
var dragging = -1;

// CONTROL MODE: 0 for mouse, 1 for fast mouse, 2 for keyb
var mode = 0;

var keyb_from = -1;
var keyb_pick_gap = 5; //px

var spd_disk_anim = 5;

var setting_control = false;
var ctrl_pos = [577,625,673];
var ctrl_pos_y = 33;

var enabled = false; // whether controls are enabled

var mode1_ref;
var mode1_gap = 10;

function reset_game(){
	init_disks(disks);
	place_disks();
	set_disks_opacity(0);

	start_time = null;
	paused_time = null;
	pause_durations = 0;
	hl = create_highlights();

	score = 0;
	change_display("score",0,0);

	moves = 0;
	change_display("move",0,0);

	seq=[];
	seq_rec(disks,TOWER_START,TOWER_AUX,TOWER_DEST,seq);
	last_move = "";
	last_score = 0;
	perfect=true;
	last_perfect = false;
}

function place_towers(){
	var base = document.getElementById("base");
	var t1 = document.getElementById("tower0");
	var t2 = document.getElementById("tower1");
	var t3 = document.getElementById("tower2");

	t1.style.left = (base.offsetLeft+base.offsetWidth/2 - min_gap - max_disk_width - t1.offsetWidth/2)+"px";
	t2.style.left = (base.offsetLeft+base.offsetWidth/2 - t2.offsetWidth/2)+"px";
	t3.style.left = (base.offsetLeft+base.offsetWidth/2 + min_gap + max_disk_width - t3.offsetWidth/2)+"px";
}

function get_disk_width(disk,total){
	var disk = disk+1; // rationale using ordinal numbers, not index numbers

	// linear function from two points (cases):
	//   x -------  y
	// 1disk --- max_width/3
	// all ----- max_width
	//
	// Notice that term 3 here can be another function,
	// so the smallest piece is bigger with less disks
	// and smaller with more disks. So let's call 3 as decay:



	// calculating decay function
	// x (disks) ------- y (decay, i.e., divide max size by)
	// 3 --------------- 2
	// 12 -------------- 6
	// arbitrary numbers, adjusted manually

	//using y-y0 == m(x-x0)
	// 6-2 = m(12-3)
	m = 4/9

	// plugging one of the points above in a line eq y == mx+b
	// 2 == m*3 + b
	b = 2 - m*3;


	// using linear function with m and b calculated
	decay = m*total + b;




	// now back to the original problem:

	// using y-y0 == m(x-x0)
	// max_width - max_width/3 == m*(all-1)
	m = (max_disk_width - max_disk_width/decay)/(total-1);

	// plugging one of the points above in a line eq y == mx+b
	// max_width/3 == m*1 + b
	b = max_disk_width/decay - m

	// using linear function with m and b calculated
	return m*disk + b;
}

function get_disk_pos(disk, tower, disk_width, disk_height){
	disk_width = disk_width ? disk_width : max_disk_width;
	disk_height = disk_height ? disk_height : max_disk_height;
		
	var base_dom = document.getElementById("base");
	var tower_dom = document.getElementById("tower"+tower);

	idx = towers[tower].indexOf(disk);
	

	var pos = [
		tower_dom.offsetLeft + tower_dom.offsetWidth/2 - disk_width/2, // left
		base_dom.offsetTop - towers[tower].length*max_disk_height // top is undefined so far
	];

	if(idx < 0) return pos;

	pos[1] =  base_dom.offsetTop - (idx+1) * disk_height +1 // defining top

	return pos;
}


function init_disks(disks){
	window.disks = disks;
	window.towers = [
		[], //1st tower
		[], //2nd tower
		[]  //3rd tower
	]

	for(var d=disks-1;d>=0;d--){
		towers[0].push(d);
	}
}

function set_disks_opacity(o){
	console.log("change to "+o);
	for(var d=0;d<disks;d++){
		var disk_elem = document.getElementById("disk"+d)
		disk_elem.style.opacity = o;
	}
}

function place_disks(){
	var base =  document.getElementById("base");

	var markup = "";
	
	for(var t=0; t<3; t++){
		for(var d=0; d<towers[t].length; d++){
			var disk = towers[t][d];

			var height = max_disk_height;
			var width = get_disk_width(disk,disks);

			var disk_pos = get_disk_pos(disk,t, width);

			var op = disk%2==0 ? 1 : 0.6;
			var disknum = show_disk_number ? disk : "";
			
			var disk_markup = "<div class='disk' id='disk"+disk+"' style='top: "+disk_pos[1]+"px; left: "+disk_pos[0]+"px; width: "+width+"px; height: "+height+"px;'><div class='texture' id='texture"+disk+"' style='width: "+width+"px; opacity: "+op+";'>"+disknum+"</div></div>";
			markup += disk_markup;
		}
	}

	markup += '<div class="ghost_disk" id="ghost_disk"></div>'

	document.getElementById("disks").innerHTML = markup;
}

function show_ghost_disk_0(disk_elem){
	var gdisk = document.getElementById("ghost_disk");
	var nearest_from = get_nearest_tower(disk_elem);
	var nearest = nearest_from[0];
	var from = nearest_from[1];

	nearest = violated_larger_disk_rule(parseInt(disk_elem.id.substr(4)),nearest) ? from : nearest; // ENFORCING RULE

	var tower_elem = document.getElementById("tower"+nearest);

	gdisk.style.display = "inline-block";
	gdisk.style.width = disk_elem.offsetWidth;
	gdisk.style.height = max_disk_height;

	var new_tower_adjust = nearest==from ? 0 : 1;
	gdisk.style.top = (document.getElementById("base").offsetTop - (towers[nearest].length+new_tower_adjust)*max_disk_height)+"px";
	gdisk.style.left = (tower_elem.offsetLeft + tower_elem.offsetWidth/2 - disk_elem.offsetWidth/2)+"px";
}


function mode1_dest_disk(evt){
	var from = get_nearest_tower(document.getElementById("disk"+dragging))[1];
	if(from == 0){
		var aboveline = evt.clientY < mode1_ref[1] + mode1_ref[0]-evt.clientX;
		if(!aboveline && evt.clientX > mode1_ref[0] + mode1_gap)
			return 0;
		else if(aboveline && evt.clientY < mode1_ref[1] - mode1_gap)
			return 1;
	} else if(from == 2){
		var aboveline = evt.clientY < mode1_ref[1] - mode1_ref[0]+evt.clientX;
		if(!aboveline && evt.clientX < mode1_ref[0] - mode1_gap)
			return 1;
		else if(aboveline && evt.clientY < mode1_ref[1] - mode1_gap)
			return 0;
	} else {
		if(evt.clientY < mode1_ref[1] - mode1_gap)
			return (evt.clientX < mode1_ref[0])+0;
	}
	return -1;
}

function show_mode1_interface(){
	var from = get_nearest_tower(document.getElementById("disk"+dragging))[1];
	var a1 = document.getElementById("area1");
	var a2 = document.getElementById("area2");

	var adiv = document.getElementById("area_div");
	var adiv_size = 106;
	var hyp = Math.floor(Math.sqrt(Math.pow(adiv_size,2)*2));
	adiv.style.height = hyp+"px";
	adiv.style.width = hyp+"px";

	adiv.style.border = a1.style.border = a2.style.border = "none";
	var border_style = "2px dashed #fff";

	if(from == 0){
		a2.style.left = mode1_ref[0] + mode1_gap;
		a2.style.top = mode1_ref[1] - mode1_gap;	
	
		a1.style.left = mode1_ref[0] - a1.offsetWidth + mode1_gap;
		a1.style.top = mode1_ref[1] - a1.offsetHeight - mode1_gap;

		adiv.style.transform = "translateX(-"+Math.floor(hyp/2)+"px) translateY(-"+Math.floor(hyp/2)+"px) rotate(45deg)";
		hyp = Math.floor(Math.sqrt(Math.pow(hyp,2)*2));
		adiv.style.left = mode1_ref[0] + mode1_gap + hyp/2;
		adiv.style.top = mode1_ref[1] - mode1_gap;

		adiv.style.borderLeft = a1.style.borderBottom = a2.style.borderLeft = border_style;
		
	} else if(from == 2){
		a2.style.left = mode1_ref[0] - a1.offsetWidth - mode1_gap;
		a2.style.top = mode1_ref[1] - mode1_gap;	
	
		a1.style.left = mode1_ref[0] - mode1_gap;
		a1.style.top = mode1_ref[1] - a1.offsetHeight - mode1_gap;

		adiv.style.transform = "translateX(-"+Math.floor(hyp/2)+"px) translateY(-"+Math.floor(hyp/2)+"px) rotate(-45deg)";
		hyp = Math.floor(Math.sqrt(Math.pow(hyp,2)*2));
		adiv.style.left = mode1_ref[0] - mode1_gap;// - hyp/2;
		adiv.style.top = mode1_ref[1] - mode1_gap - hyp/2;

		adiv.style.borderLeft = a1.style.borderBottom = a2.style.borderRight = border_style;
	} else {
		a1.style.top = mode1_ref[1] - mode1_gap;
		a1.style.left = mode1_ref[0] - a1.offsetWidth/2;
		a2.style.top = a2.style.left = "-150px";

		adiv.style.left = mode1_ref[0];
		adiv.style.top = mode1_ref[1] - mode1_gap - adiv.offsetHeight;
		adiv.style.transform = "rotate(0deg)";
		adiv.style.borderLeft = a1.style.borderTop = a2.style.borderTop = border_style;
	}
}

function hide_mode1_interface(){
	var a1 = document.getElementById("area1");
	var a2 = document.getElementById("area2");
	var adiv = document.getElementById("area_div");

	a2.style.left = a2.style.top = a1.style.left = a1.style.top = adiv.style.left = adiv.style.top = "-150px";

}

function show_ghost_disk_1(disk_elem,dest_area){
	var from = get_nearest_tower(disk_elem)[1];
	var dest_tower = (from+(-2*dest_area)+1)%3;
	dest_tower = dest_tower < 0 ? 2 : dest_tower;

	dest_tower = violated_larger_disk_rule(parseInt(disk_elem.id.substr(4)),dest_tower) ? from : dest_tower; // ENFORCING RULE
	var tower_elem = document.getElementById("tower"+dest_tower);
	var gdisk = document.getElementById("ghost_disk");

	gdisk.style.display = "inline-block";
	gdisk.style.width = disk_elem.offsetWidth;
	gdisk.style.height = max_disk_height;

	var new_tower_adjust = dest_tower==from ? 0 : 1;
	var gdisk_pos = [
		document.getElementById("base").offsetTop - (towers[dest_tower].length+new_tower_adjust)*max_disk_height,
		(tower_elem.offsetLeft + tower_elem.offsetWidth/2 - disk_elem.offsetWidth/2)
	];
	gdisk.style.top = gdisk_pos[0]+"px";
	gdisk.style.left = gdisk_pos[1]+"px";

	return gdisk_pos;
}

function hide_ghost_disk(){
	var gdisk = document.getElementById("ghost_disk");
	var pos = [gdisk.offsetTop, gdisk.offsetLeft];
	gdisk.style.display = "none";

	return pos;
}


function get_nearest_tower(disk_elem){
	var curr_disk = parseInt(disk_elem.id.substr(4));
	var nearest = -1;
	var dist = 0;
	var from = -1;
	for(t=0;t<towers.length;t++){
		from = towers[t].indexOf(curr_disk) < 0 ? from : t;

		var tower_elem = document.getElementById("tower"+t);
		var curr_dist = Math.abs((disk_elem.offsetLeft+disk_elem.offsetWidth/2)-(tower_elem.offsetLeft+tower_elem.offsetWidth/2));
		if(nearest == -1 || curr_dist < dist){
			nearest = t;
			dist = curr_dist;
		}
	}
	return [nearest,from];
}



//////////// scoring ////////////

function score_dummy_move(){
	return 1;
}

function score_nth_disk_ok(thedisk, from, to){
	// nth disk in final position with min number of moves

	var min_moves = 0;
	for(var d=disks; d>thedisk; d--)
		min_moves += Math.pow(2,d-1);

	if(towers[TOWER_DEST].indexOf(thedisk) > -1 && moves == min_moves){
		hl["disks_min_moves"].push(thedisk);
		return score*2;
	}

	return 0;
}

function score_min_moves(){
	// finishing with min number of moves

	if(towers[TOWER_DEST].length == disks && moves == Math.pow(2,disks)-1){
		hl["min_moves"] = true;
		return score*disks;
	}

	return 0;
}

function score_fast_moves(){
	// speed between moves (the faster, the better)?

	return 0;
}

function score_correct_start(disk_to){
	// very first move is correct

	var correct_tower = disks % 2 == 0 ? TOWER_AUX : TOWER_DEST;
	if(disk_to == correct_tower && moves == 1){
		hl["correct_start"] = true;
		return 50;
	}

	return 0;
}


function seq_rec(t,a,b,c,s){
	if(t==1){
		s.push(a+" "+c);
	} else {
		seq_rec(t-1,a,c,b,s);
		s.push(a+" "+c);
		seq_rec(t-1,b,a,c,s);
	}
}

function undo_move(){
	moves -= 1;
	score = last_score;
	perfect = last_perfect;
	var from_to = last_move.split(" ");
	towers[parseInt(from_to[0])].push(towers[parseInt(from_to[1])].pop());
	place_disks();
	change_display("score", score, score);
	change_display("move", moves, moves);
}

function score_perfect_streak(from, to){
	// correct moves from the beginning (not a single mistake)

	last_perfect = perfect;
	
	console.log("from is "+from+" and to is "+to);
	if(seq[moves-1] == from+" "+to && perfect){
		hl["streak_min"]++;
		return 50;
	}

	perfect = false;
	return 0;
}

function scoring(last_disk_from, last_disk_to){
	if(last_disk_from == last_disk_to) return;

	last_move = last_disk_from+" "+last_disk_to;
	count_move();

	var thedisk = towers[last_disk_to][towers[last_disk_to].length-1];

	var score_after =  score;

	score_after += score_dummy_move();

	score_after += score_nth_disk_ok(thedisk, last_disk_from, last_disk_to);
	score_after += score_min_moves();
	score_after += score_fast_moves();
	score_after += score_correct_start(last_disk_to);
	score_after += score_perfect_streak(last_disk_from, last_disk_to);

	change_display("score", score, score_after);
	last_score = score;
	score = score_after;

	if(towers[TOWER_DEST].length == disks){
		console.log("Finished!");
		enabled = false;

		update_score_board();
		game_complete([
			function(anims){
				hide_classicbar();
				hide_towers();
				unblur_room();

				chain_anims(anims);
			},
			[wall2all, show_final_score],
			blur_all
		]);
	}
}

////////// end of scoring ///////////


function start_resume_clock(){
	if(start_time == null){
		start_time = new Date();
		console.log("starting clock");
	} else {
		pause_durations += Math.abs(new Date() - paused_time);
		paused_time = null;
		console.log("resuming clock");
	}
	
}

function game_duration(){
	if(start_time == null || paused_time != null) return -1;

	var duration = new Date() - start_time - pause_durations;
	var sec = duration/1000;

	return sec;
}

function update_clock(){
	sec = game_duration();
	if(sec < 0) return "- - : - -";

	var min = sec/60;
	var hor = Math.floor(min/60);
	sec = Math.floor(sec)%60;
	min = Math.floor(min)%60;

	return (
		(hor == 0 ? "" : hor+":")
		+
		(min < 10 ? "0"+min : min)
		+":"+
		(sec < 10 ? "0"+ sec : sec)
	);
}


function handle_mode0_down(evt){
	var dist = 0;
	var nearest = -1;
	for(t=0;t<towers.length;t++){
		var tower_elem = document.getElementById("tower"+t);
		var curr_dist = Math.abs(evt.clientX-(tower_elem.offsetLeft+tower_elem.offsetWidth/2));
		if(nearest==-1 || curr_dist < dist){
			nearest = t;
			dist = curr_dist;
		}
	}

	console.log("grab top disk from tower "+nearest);
	if(towers[nearest].length > 0){
		var top_disk = document.getElementById("disk"+towers[nearest][towers[nearest].length-1]);
		//top_disk.style.top = (evt.clientY-top_disk.offsetHeight/2)+"px";
		//top_disk.style.left = (evt.clientX-top_disk.offsetWidth/2)+"px";

		dragging = parseInt(top_disk.id.substr(4));
	}
}

function handle_mode0_move(evt){
	if(dragging < 0) return false;

	//document.title = evt.clientY;
	var top_disk = document.getElementById("disk"+dragging);
	top_disk.style.top = (evt.clientY-top_disk.offsetHeight/2)+"px";
	top_disk.style.left = (evt.clientX-top_disk.offsetWidth/2)+"px";

	show_ghost_disk_0(top_disk);
	return true;
}

function handle_mode0_up(evt){
	if(dragging < 0) return false;
	hide_ghost_disk();

	var curr_disk = dragging;
	var disk_elem = document.getElementById("disk"+curr_disk);
			
	var nearest_from = get_nearest_tower(disk_elem);
	var from = nearest_from[1]; // from this tower
	var nearest = nearest_from[0]; // to this tower

	nearest = violated_larger_disk_rule(curr_disk,nearest) ? from : nearest; // ENFORCING RULE
			
	var target_pos = get_disk_pos(curr_disk,nearest, get_disk_width(curr_disk,disks));
	target_pos[1] -= from != nearest ? max_disk_height : 0; //giving actual top position to disk, if it is going to new tower

	enabled = false;
	var disk_twn = new Tween(disk_elem.id, "left", Quad.prototype.easeInOut, disk_elem.offsetLeft, target_pos[0], spd_disk_anim, false);
	new Tween(disk_elem.id, "top", Quad.prototype.easeInOut, disk_elem.offsetTop, target_pos[1], spd_disk_anim, false);
	disk_twn.onMotionFinished = function(){
		towers[nearest].push(towers[from].pop());
		
		place_disks();
		enabled = true;

		scoring(from, nearest);
	}

	dragging = -1;
	return true;
}



function handle_mode1_down(evt){
	handle_mode0_down(evt);
	mode1_ref = [evt.clientX, evt.clientY];
	show_mode1_interface();
}

function handle_mode1_move(evt){
	if(dragging < 0) return false;

	handle_mode0_move(evt);
	var top_disk = document.getElementById("disk"+dragging);
	
	dest_area = mode1_dest_disk(evt);
	if(dest_area < 0){
		show_ghost_disk_0(top_disk);
		return false;
	}

	show_ghost_disk_1(top_disk,dest_area);	
	 
	return true;
}

function handle_mode1_up(evt){
	if(dragging < 0) return false;
	var target_pos = hide_ghost_disk();
	hide_mode1_interface();

	var curr_disk = dragging;
	var disk_elem = document.getElementById("disk"+curr_disk);

	var dest_area = mode1_dest_disk(evt);
	var from = get_nearest_tower(disk_elem)[1];
	var nearest = (from+(-2*dest_area)+1)%3;
	nearest = nearest < 0 ? 2 : nearest;
	nearest = violated_larger_disk_rule(curr_disk,nearest) ? from : nearest; // ENFORCING RULE


	enabled = false;
	var disk_twn = new Tween(disk_elem.id, "left", Quad.prototype.easeInOut, disk_elem.offsetLeft, target_pos[1], spd_disk_anim, false);
	new Tween(disk_elem.id, "top", Quad.prototype.easeInOut, disk_elem.offsetTop, target_pos[0], spd_disk_anim, false);
	disk_twn.onMotionFinished = function(){
		towers[nearest].push(towers[from].pop());

		place_disks();
		enabled = true;

		scoring(from, nearest);
	}

	dragging = -1;
	return true;
}


// making top disks draggable
function mousedown(evt){
	if(!enabled) return;
	if(evt.clientY < 55){
		var stopwatch = document.getElementById("stopwatch");
		if(evt.clientX > stopwatch.offsetLeft && evt.clientX < stopwatch.offsetLeft+stopwatch.offsetWidth){
			pause_game();
			return;
		}
		setting_control = evt.clientX > ctrl_pos[0] && evt.clientX < ctrl_pos[2];
		return;
	} 

	if(mode <= 1) // for both mouse modes
		window["handle_mode"+mode+"_down"](evt)
}

function mousemove(evt){
	if(!enabled) return;
	if(setting_control){
		var pin = document.getElementById("controlind");
		pin.style.left = evt.clientX < ctrl_pos[0] ? ctrl_pos[0] : evt.clientX > ctrl_pos[2]-pin.offsetWidth/2 ? ctrl_pos[2] : evt.clientX;
		pin.style.top = ctrl_pos_y+5;
		return;
	}

	if(mode <= 1) // for both mouse modes
		window["handle_mode"+mode+"_move"](evt)

	return false; // avoid text selection
}


// RULE: a larger disk is not allowed to be stacked on a smaller one
function violated_larger_disk_rule(curr_disk,nearest){
	return towers[nearest].length > 0 && curr_disk > towers[nearest][towers[nearest].length-1]
}

function set_mode(newmode){
	mode = newmode;
	var pin = document.getElementById("controlind");
	pin.style.top = ctrl_pos_y+5;
	var twn = new Tween(pin.id, "left", Quartic.prototype.easeIn, pin.offsetLeft, ctrl_pos[mode], 10, false);
	twn.onMotionFinished = function(){
		pin.style.top = ctrl_pos_y+"px";
	}
}

function mouseup(evt){
	if(!enabled) return;
	if(setting_control){
		var pin = document.getElementById("controlind");
		mode = -1;
		nearest = 0;
		for(var i=0;i<ctrl_pos.length;i++){
			var dist = Math.abs(pin.offsetLeft-pin.offsetWidth/2 - ctrl_pos[i]);
			if(mode==-1 || dist < nearest){
				mode = i;
				nearest = dist;
			}
		}
		set_mode(mode);
		setting_control = false;
	}

	if(mode <= 1) // for both mouse modes
		window["handle_mode"+mode+"_up"](evt)
}



if (isMobile) {
	addEventListener("touchstart", function(evt){ mousedown(evt.touches[0]) });
	addEventListener("touchmove", function(evt){ mousemove(evt.touches[0]) });
	addEventListener("touchend", function(evt){ mouseup(evt.changedTouches[0]) });
} else {
	document.onmousedown = mousedown;
	document.onmousemove = mousemove;
	document.onmouseup = mouseup;
}


function toggle_disk_number(){
	show_disk_number = !show_disk_number;
	for(var d=0;d<=disks;d++){
		document.getElementById("texture"+d).innerHTML = show_disk_number ? d : "";
	}
}

function keyb_tower(tower){
	if(keyb_from == -1 && towers[tower].length > 0){
		keyb_from = tower;
		var disk = towers[keyb_from][towers[keyb_from].length-1];
		document.getElementById("disk"+disk).style.top = (get_disk_pos(disk,keyb_from)[1] - keyb_pick_gap)+"px";
	} else if(keyb_from > -1) {
		var disk = towers[keyb_from][towers[keyb_from].length-1];
		if(violated_larger_disk_rule(disk, tower) || keyb_from == tower){
			keyb_undo();
		} else {
			var disk_elem = document.getElementById("disk"+disk);
			var target_disk = get_disk_pos(disk, tower, disk_elem.offsetWidth);
			target_disk[1] -= max_disk_height;


			enabled = false;
			twn = new Tween(disk_elem.id, "top", Quad.prototype.easeInOut, disk_elem.offsetTop, target_disk[1], spd_disk_anim, false);
			new Tween(disk_elem.id, "left", Quad.prototype.easeInOut, disk_elem.offsetLeft, target_disk[0], spd_disk_anim, false);

			twn.onMotionFinished = function(){
				towers[tower].push(towers[keyb_from].pop());

				place_disks();

				enabled = true;				

				scoring(keyb_from, tower);
				keyb_from = -1;
			}

			
		}
	}
}

function keyb_undo(){
	if(keyb_from > -1){
		var disk = towers[keyb_from][towers[keyb_from].length-1];
		document.getElementById("disk"+disk).style.top = get_disk_pos(disk,keyb_from)[1]+"px";
		

		var undo_at = keyb_from;
		keyb_from = -1;
		console.log("returning "+undo_at);
		return undo_at;
	}

	return keyb_from;
}


function change_display(display, from, to){
	for(var i=8; i>=0; i--){
		var digitElement = document.getElementById(display+"_e"+i);
		if(digitElement==null) continue;

		var digit_from = Math.floor(from/Math.pow(10,i)%10);
		var digit_to = Math.floor(to/Math.pow(10,i)%10);

		digit_to += digit_to < digit_from ? 10 : 0;

		//if(digit_from==digit_to) continue;

		new Tween(
			digitElement.id,
			"top",
			Quad.prototype.easeInOut,
			-digitElement.offsetHeight/20*digit_from,
			-digitElement.offsetHeight/20*digit_to,
			from==to? 1 : 10,
			false,
			{position: "relative"}
		);
	}
}

function count_move(){
	console.log("COUNTING MOVE!");
	change_display("move",moves,++moves);
}

function pause_game(){
	if(!enabled) return;

	enabled = false;		
	chain_anims([[hide_towers, hide_classicbar, unblur_room], wall2desk, show_book, show_book_menu]);
	paused_time = new Date();
}


document.onkeydown = function (evt){
	console.log(evt.keyCode);
	if(evt.keyCode == 32){ //space
		toggle_disk_number();
	}

	if(evt.keyCode == 27){ //esc
		if(mode==2){
			if(keyb_undo() < 0) {
				undo_move();
			}
		} else {
			undo_move();
		}
	}

	if(enabled && evt.keyCode == 13){ //enter
		pause_game();
	}

	if(mode == 2 && enabled){
		if(evt.keyCode == 49 || evt.keyCode == 37){ // key 1 or left arrow
			keyb_tower(0);
		} else if(evt.keyCode == 50 || evt.keyCode == 40){ // key 2 or down arrow
			keyb_tower(1);
		} else if(evt.keyCode == 51 || evt.keyCode == 39){ // key 3 or right arrow
			keyb_tower(2);
		}
	}

	if(evt.keyCode == 56){ // 8
		if(enabled) set_mode(0);
	} else if(evt.keyCode == 57){ // 9
		if(enabled) set_mode(1);
	} else if(evt.keyCode == 48){ // 0
		if(enabled) set_mode(2);
	}
}
