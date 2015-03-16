var serviceURL = localStorage.serviceURL;
$(document).ready(function() {
	FastClick.attach(document.body);
	loadingShow("#firstPage");
	document.addEventListener("deviceready", deviceReady, true);
	mainMenuSet();
	userFooterSet();
	getCurrentPosition();
	$("#loginPage").on("pagecreate", loginBindEvent);
	$("#regisPage").on("pagecreate", regisBindEvent);
	$("#editProfilePage").on("pagecreate", editUserBindEvent);
	$("#addReportPage").on("pagecreate", addReportBindEvent);
	$("#editReportPage").on("pagecreate", editReportBindEvent);
	$("#createGroupPage").on("pagecreate", createGroupBindEvent);
	$("#homePage").on("pagecreate", function() {
		checkGroup();
		loadFeed();
		countNotifyGet();
	});
	$(".spNotify").on("click", function() {
		countNotifyReset();
		$.mobile.changePage("#groupPage");
		loadUserGroup();
	});
});

function connectErrorCallback(button) {
	if (button == 2) {
		navigator.app.exitApp();
	}
}

function loadFeedCallback(button) {
	if (button == 2) {
		loadFeed();
	}
}
$("#mapPage").on("pageshow", function(event, data) {
	var center = map.getCenter();
	google.maps.event.trigger(map, "resize");
	map.setCenter(center);
});

function checkPreAuth() {
	if (window.localStorage.username !== undefined && window.localStorage.password !== undefined) {
		$.mobile.changePage("#homePage");
		loadingHide();
		navigator.splashscreen.hide();
	} else {
		$.mobile.changePage("#loginRegisPage");
		loadingHide();
		navigator.splashscreen.hide();
	}
}

function loadingShow(desti) {
	$.mobile.loading('show');
	$(desti).hide();
}

function loadingHide(desti) {
	$.mobile.loading('hide');
	$(desti).show();
}

function onBackbutton(e) {
	if ($.mobile.activePage.is('#loginRegisPage')) {
		e.preventDefault();
		navigator.app.exitApp();
	} else if ($.mobile.activePage.is('#homePage')) {
		e.preventDefault();
		navigator.home.home(function() {
			console.info("Successfully launched home intent");
		}, function() {
			console.error("Error launching home intent");
		});
	} else {
		navigator.app.backHistory();
	}
}

function exitApp() {
	clearCache();
	navigator.app.exitApp();
}

function deviceReady() {
	checkConnection();
	cordova.exec(null, null, "SplashScreen", "hide", []);
	clearCache();
	checkPreAuth();
	document.addEventListener("backbutton", onBackbutton, false);
	regisThisDevice();
}

function clearCache() {
	var success = function(status) {
		console.log('Message: ' + status);
	}
	var error = function(status) {
		console.log('Error: ' + status);
	}
	window.cache.clear(success, error);
}

function checkGroup() {
	if (window.localStorage.userGroup === '000000') {
		$('.disGroupBtn').addClass("ui-state-disabled");
		if (checkNoGroupAlert() !== true) {
			$.mobile.changePage("#groupAlertPage");
		}
	} else {
		$('.disGroupBtn').removeClass("ui-state-disabled");
	}
}

function setNoGroupAlert() {
	window.localStorage.setItem("noGroupAlert", "0");
}

function IsFirstLaunch() {
	var fl = window.localStorage.getItem("firstlaunch");
	if (fl && parseInt(fl) === 0) {
		return false;
	} else {
		window.localStorage.setItem("firstlaunch", "0");
		return true;
	}
}

function checkNoGroupAlert() {
	var fl = window.localStorage.getItem("noGroupAlert");
	if (fl && parseInt(fl) === 0) {
		return true;
	} else {
		return false;
	}
}

function testVar() {
	console.log(localStorage.userGroup);
}

function checkConnection() {
	var networkState = navigator.connection.type;
	var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.CELL] = 'Cell generic connection';
	states[Connection.NONE] = 'No network connection';
	if (states[networkState] == 'No network connection') {
		navigator.notification.confirm('ไม่พบการเชื่อมต่อเครือข่าย ออกจากแอพฯใช่หรือไม่?', connectErrorCallback, 'Error', 'ไม่,ใช่');
	}
}

function countNotify() {
	str_count = localStorage.getItem("notifyCount");
	if (str_count === null || str_count === "null") {
		count = 0;
	} else {
		count = parseInt(str_count);
	}
	count++;
	localStorage.setItem("notifyCount", count);
	notifyCount = window.localStorage.getItem("notifyCount");
	$('.spNotify').text(notifyCount).fadeOut(100).css("color", "#F90").fadeIn(100);
}

function countNotifyReset() {
	localStorage.setItem("notifyCount", 0);
	notifyCount = window.localStorage.getItem("notifyCount");
	$('.spNotify').text(notifyCount).css("color", '');
}

function countNotifyGet() {
	if (parseInt(notifyCount) === 0 || notifyCount === null || notifyCount === "null") {
		localStorage.setItem("notifyCount", 0);
		notifyCount = window.localStorage.getItem("notifyCount");
		$('.spNotify').text(notifyCount).css("color", '');
	} else {
		$('.spNotify').text(notifyCount).css("color", 'yellow');
	}
}

function mainMenuSet() {
	var manMenuHtml = '<ul data-role="listview">' 
						+ '<li data-icon="delete"><a data-rel="close" href="#">ปิดเมนู</a></li>' 
						+ '<li data-icon="recycle"><a data-rel="close" href="#homePage" onclick="loadFeed();">แสดงรายงาน ทั้งหมด</a></li>' 
						+ '<li data-icon="bars"><a data-rel="close" href="#userReportPage" onclick="loadThisUserReport();">รายงานสถานการณ์ของฉัน</a></li>' 
						+ '<li data-icon="bullets"><a data-rel="close" href="#groupPage" onclick="loadUserGroup();">แสดงรายงานและจัดการกลุ่ม</a></li>' 
						+ '<li data-icon="user"><a data-rel="close" href="#profilePage" onclick="getUserDetail();">โปรไฟล์</a></li>' 
						+ '<li data-icon="plus"><a data-rel="close" class="disGroupBtn" href="#addReportPage" onclick="getCurrentPosition();">เพิ่มรายงาน สถานการณ์</a></li>' 
						+ '<li data-icon="search"><a data-rel="close" href="#searchPage" onclick="clearSearchFilter();">ค้นหารายงาน สถานการณ์</a></li>' 
						+ '<li data-icon="lock"><a href="#" onclick="logOut();">ออกจากระบบ</a></li>' + '<li data-icon="power"><a href="#" onclick="exitApp();">ออกจากแอพ</a></li>' 
					+ '</ul>';
	$('.mainMenu').html(manMenuHtml);
}
var serviceURL = localStorage.serviceURL;
var userState = false;
var passState = false;
var emailState = false;
var realNameState = false;
var realSNameState = false;
var bDateState = false;
var userMsgD = " สามารถใช้อักษร a-z,0-9,_,- ความยาว 4-15 ตัว ";
var passMsgD = " สามารถใช้อักษร a-Z,0-9,_,- ความยาว 5-15 ตัว ";
function loginBindEvent() {
	$("#loginForm").on("submit", handleLogin);
}
function regisBindEvent() {
	$('#regisBDate').combodate({
        value: moment(localStorage.userBdate, 'YYYY-MM-DD'),
		template:'DD MMMM YYYY',
        minYear: 1900,
        maxYear: moment().format('YYYY')
    	}); 
	validAll();
	$("#userInputRegis").on('focusout', checkUsedName).on('focusin', function() {
		$("#pMsgU").text(userMsgD).css("color", "black");
	});
	$("#passInputRegis").on('focusout', checkPass).on('focusout', checkUsedName).on('focusin',
		function() {
			$("#pMsgP").text(passMsgD).css("color", "black");
		});
	$("#repassInputRegis").on('focusout', recheckPass);
	$("#emailInputRegis").on('focusout', checkEmail);
	$("#nameInput").on('focusout', function() {
		if ($("#nameInput").val()) {
			realNameState = true;
			validAll();
		} else {
			realNameState = false;
			validAll();
		}
	});
	$("#surnameInput").on('focusout', function() {
		if ($("#surnameInput").val()) {
			realSNameState = true;
			validAll();
		} else {
			realSNameState = false;
			validAll();
		}
	});
	$("#regisBDate").on('change', function() {
		if ($("#regisBDate").val()) {
			bDateState = true;
			validAll();
		} else {
			bDateState = false;
			validAll();
		}
	});
	
	$("#sumitBtn").on("click", handleRegis);
}
function handleLogin() {
	var form = $("#loginForm");
	var url = serviceURL + 'handle_login.php';
	
	loadingShow("#contentLogin");
	$("#submitButton", form).attr("disabled", "disabled");
	var u = $("#username", form).val();
	var p = $("#password", form).val();
	if (u !== '' && p !== '') {
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				username: u,
				password: p
			},
			crossDomain: true,
			timeout: 10000,
			success: function(res) {
				
				if (!jQuery.isEmptyObject(res)) {
					
					window.localStorage.username = u;
					window.localStorage.password = p;
					window.localStorage.userId = res.user_id;
					window.localStorage.userRName = res.user_rname;
					window.localStorage.userSurname = res.user_surname;
					window.localStorage.userEmail = res.user_email;
					window.localStorage.userBdate = res.user_bdate;
					window.localStorage.userGender = res.user_gender;
					window.localStorage.userImageUrl = res.user_imageUrl;
					window.localStorage.userStatus = res.user_status;
					window.localStorage.userGroup = res.user_group;
					userFooterSet();
				regisThisDevice();
					 $(form)[0].reset();
					$.mobile.changePage("#homePage");
					checkGroup();
					loadFeed();
				} else {
					navigator.notification.alert("Your login failed", function() {});
				}
			
				$("#submitButton").removeAttr("disabled");
				loadingHide("#contentLogin");
			},
			error: function(e) {
				navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				loadingHide("#contentLogin");
			},
			complete: function(e) {
				$("#submitButton").removeAttr("disabled");
				loadingHide("#contentLogin");
			}
		});
	} else {
		navigator.notification.alert("You must enter a username and password", function() {});
		
		$("#submitButton").removeAttr("disabled");
		loadingHide("#contentLogin");
	}
	return false;
}
function handleRegis() {
	var form = $("#regisForm");
	var url = serviceURL + 'regisUser.php';
	$("#sumitBtn").addClass("ui-state-disabled");
	var u = $("#userInputRegis", form).val();
	var p = $("#passInputRegis", form).val();
	var e = $("#emailInputRegis", form).val();
	var rn = $("#nameInput", form).val();
	var rsn = $("#surnameInput", form).val();
	var g = $("#genderSelect", form).val();
	var bd = moment($('#regisBDate').val(), "DD-MM-YYYY").format('YYYY-MM-DD');
	loadingShow("#contentRegis");
	if (validAll()) {
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				username: u,
				password: p,
				email: e,
				realname: rn,
				realsname: rsn,
				gender: g,
				bday: bd
			},
			crossDomain: true,
			timeout: 10000,
			success: function(res) {
				if (!jQuery.isEmptyObject(res)) {
					window.localStorage.username = u;
					window.localStorage.password = p;
					window.localStorage.userId = res.user_id;
					window.localStorage.userRName = res.user_rname;
					window.localStorage.userSurname = res.user_surname;
					window.localStorage.userEmail = res.user_email;
					window.localStorage.userBdate = res.user_bdate;
					window.localStorage.userGender = res.user_gender;
					window.localStorage.userImageUrl = res.user_imageUrl;
					window.localStorage.userStatus = res.user_status;
					window.localStorage.userGroup = res.user_group;
					userFooterSet();
					regisThisDevice();
					$(form)[0].reset();
					$("#pMsgU").text("");
					$("#pMsgP").text("");
					$("#pMsgE").text("");
					userState = false;
					passState = false;
					emailState = false;
					realNameState = false;
					realSNameState = false;
					validAll();
					$.mobile.changePage("#homePage");
					checkGroup();
					loadFeed();
				} else {
					navigator.notification.alert("Your login failed", function() {});
					
				}
				
				$("#sumitBtn").removeClass("ui-state-disabled");
				loadingHide("#contentRegis");
			},
			error: function(e) {
				navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				$("#sumitBtn").removeClass("ui-state-disabled");
				loadingHide("#contentRegis");
			},
			complete: function(e) {
			}
		});
	} else {
		navigator.notification.alert("You must fill form");
		$("#submitButton").removeAttr("disabled");
		loadingHide("#contentRegis");
	}
	return false;
}
function dateNow() {
	var now = new Date();
	var day = ("0" + now.getDate()).slice(-2);
	var month = ("0" + (now.getMonth() + 1)).slice(-2);
	var today = now.getFullYear() + "-" + (month) + "-" + (day);
	$('#datePicker').val(today);
}
function validAll() {
	if (userState === true && passState === true && emailState === true && realNameState === true &&
		realSNameState === true && bDateState === true) {
		$("#sumitBtn").removeClass("ui-state-disabled");
		return true;
	} else {
		$("#sumitBtn").addClass("ui-state-disabled");
		return false;
	}
}
function checkUsernameRegEx(username) {
	var pattern = /^[a-z0-9_-]{4,15}$/;
	if (pattern.test(username)) {
		return true;
	} else {
		return false;
	}
}
function checkEmailRegEx(email) {
	var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
	if (pattern.test(email)) {
		return true;
	} else {
		return false;
	}
}
function checkPasswordRegEx(password) {
	var pattern = /^[a-zA-Z0-9_-]{5,15}$/;
	if (pattern.test(password)) {
		return true;
	} else {
		return false;
	}
}
function checkUsedName() {
	var form = $("#regisForm");
	var u = $("#userInputRegis").val();
	
	var url = serviceURL + 'checkUsedName.php';
	if (u !== '') {
		if (checkUsernameRegEx(u) === true) {
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					username: u
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						userState = false;
						validAll();
						$("#pMsgU").text(u + " ชื่อนี้มีผู้ใช้แล้ว").css("color", "red");
						$("#userInputRegis", form).val("");
					} else {
						userState = true;
						validAll();
						$("#pMsgU").text(u + " ชื่อนี้สามารถใช้ได้").css("color", "green");
					}
				},
				error: function(e) {
					userState = false;
					validAll();
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {
					console.log("checkUsedName complete");
				}
			});
		} else {
			userState = false;
			validAll();
			$("#pMsgU").text(userMsgD).css("color", "red");
		}
	} else {
		userState = false;
		validAll();
		$("#pMsgU").text("กรุณากรอก Username").css("color", "red");
	}
	return false;
}
function checkPass() {
	var form = $("#regisForm");
	var p = $("#passInputRegis", form).val();
	if (p !== '') {
		if (checkPasswordRegEx(p) === true) {
			passState = false;
			validAll();
			$("#pMsgP").text(" กรอกรหัสอีกครั้ง ").css("color", "black");
		} else {
			passState = false;
			validAll();
			$("#pMsgP").text(passMsgD).css("color", "red");
		}
	} else {
		passState = false;
		validAll();
		$("#pMsgP").text(" กรุณากรอก Password ").css("color", "red");
	}
}
function recheckPass() {
	var form = $("#regisForm");
	var p = $("#passInputRegis", form).val();
	var rp = $("#repassInputRegis", form).val();
	if (rp !== '') {
		if (checkPasswordRegEx(rp) === true) {
			if (p == rp) {
				passState = true;
				validAll();
				$("#pMsgP").text(" รหัสผ่านนี้สามารถใช้ได้").css("color", "green");
			} else {
				passState = false;
				validAll();
				$("#pMsgP").text(" รหัสผ่านนี้ไม่ตรงกัน").css("color", "red");
			}
		} else {
			passState = false;
			validAll();
			$("#pMsgP").text(passMsgD).css("color", "red");
		}
	} else {
		passState = false;
		validAll();
		$("#pMsgP").text(" กรุณากรอก Password อีกครั้ง").css("color", "red");
	}
}
function checkEmail() {
	var form = $("#regisForm");
	var e = $("#emailInputRegis", form).val();
	var url = serviceURL + 'checkUsedEmail.php';
	if (e !== '') {
		if (checkEmailRegEx(e) === true) {
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					email: e
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						emailState = false;
						validAll();
						$("#pMsgE").text(" Email นี้มีผู้ใช้แล้ว").css("color", "red");
					} else {
						emailState = true;
						validAll();
						$("#pMsgE").text(" Email นี้สามารถใช้ได้").css("color", "green");
					}
				},
				error: function(e) {
					emailState = false;
					validAll();
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต");
				},
				complete: function(e) {
					console.log("checkEmail complete");
				}
			});
		} else {
			emailState = false;
			validAll();
			$("#pMsgE").text(" กรุณากรอก Email ให้ถูกต้อง ").css("color", "red");
		}
	} else {
		emailState = false;
		validAll();
		$("#pMsgE").text("กรุณากรอก Email").css("color", "red");
	}
	return false;
}

function logOut() {
	localStorage.removeItem("username");
	localStorage.removeItem("password");
	localStorage.removeItem("userId");
	localStorage.removeItem("userRName");
	localStorage.removeItem("userSurname");
	localStorage.removeItem("userEmail");
	localStorage.removeItem("userBdate");
	localStorage.removeItem("userGender");
	localStorage.removeItem("userImageUrl");
	localStorage.removeItem("userStatus");
	localStorage.removeItem("userGroup");
	localStorage.removeItem("noGroupAlert");
	deleteThisDevice();
	countNotifyReset();
	$.mobile.changePage("#loginRegisPage");
}

function userFooterSet() {
	$('.userFooter').text(window.localStorage.userRName+" "+window.localStorage.userSurname);
}
var globalProfileImageURI;
var editState = false;

function getUserDetail() {
	clearCache();
	var d = moment();
	var gd = "";
	if (localStorage.userGender === "male") {
		gd = "ชาย";
	} else if (localStorage.userGender === "female") {
		gd = "หญิง";
	} else {
		gd = "อื่นๆ";
	}
	loadingShow("#contentProfile");
	$('#imgPropic').attr('src', serviceURL + "../img/userprofileimage/" + localStorage.userImageUrl + "?" + d.format());
	$('#spNamePro').text(localStorage.userRName + ' ' + localStorage.userSurname);
	$('#spGenderPro').text(gd);
	$('#spBirthPro').text(moment(localStorage.userBdate, 'YYYY-MM-DD', 'th').format('LL'));
	$('#spEmailPro').text(localStorage.userEmail);
	
	loadingHide("#contentProfile");
}

function getEditUserDetail() {
	clearCache();
	var d = moment();
	$('#imgEditPropic').attr('src', serviceURL + "../img/userprofileimage/" + localStorage.userImageUrl + "?" + d.format());
	$('#nameEditInput').val(localStorage.userRName);
	$('#surnameEditInput').val(localStorage.userSurname);
	var gen = $('#genderEditSelect');
	gen.val(localStorage.userGender).attr('selected', true).siblings('option').removeAttr('selected');
	gen.selectmenu().selectmenu('refresh', true);
	$('#genderEditSelect').val(localStorage.userGender);
	$('#emailEditInput').val(localStorage.userEmail);
	$('#editBDate').combodate({
		value: moment(localStorage.userBdate, 'YYYY-MM-DD'),
		template: 'DD MMMM YYYY',
		minYear: 1900,
		maxYear: moment().format('YYYY')
	});
}

function getImage() {
	clearCache();
	navigator.camera.getPicture(getImageSuccess, function(message) {
		alert('get picture failed');
	}, {
		quality: 100,
		destinationType: navigator.camera.DestinationType.FILE_URI,
		sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
		targetWidth: 130,
		targetHeight: 130,
		correctOrientation: 1,
		saveToPhotoAlbum: 0,
		allowEdit: 1
	});
}

function takeImage() {
	clearCache();
	navigator.camera.getPicture(getImageSuccess, function(message) {
		alert('get picture failed');
	}, {
		quality: 100,
		destinationType: Camera.DestinationType.FILE_URI,
		targetWidth: 130,
		targetHeight: 130,
		correctOrientation: 1,
		saveToPhotoAlbum: 0,
		allowEdit: 1
	});
}

function getImageSuccess(imageURI) {
	globalProfileImageURI = imageURI;
	$('#imgEditPropic').attr('src', globalProfileImageURI);
	$('#imgPropic').attr('src', globalProfileImageURI);
	var d = moment();
	uploadPhotoProfileData(imageURI);
}

function uploadPhotoProfileData(imageURI) {
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";
	var params = new Object();
	params.userId = localStorage.userId;
	options.params = params;
	options.chunkedMode = false;
	var ft = new FileTransfer();
	ft.upload(imageURI, encodeURI(serviceURL + "updatePicProfile.php"), uploadProPicwin, uploadProPicfail, options);
}

function uploadProPicwin(r) {

	alert("เปลี่ยนรูปโปรไฟล์ เรียบร้อยแล้ว!");
	getUserDetail();
}

function uploadProPicfail(error) {
	alert("An error has occurred: Code = " + error.code);
}

function editUserBindEvent() {
	$("#nameEditInput").on('focusin', function() {
		editState = false;
	}).on('keyup', function() {
		editState = true;
	}).on('focusout', updateRName);
	$("#surnameEditInput").on('focusin', function() {
		editState = false;
	}).on('keyup', function() {
		editState = true;
	}).on('focusout', updateSurName);
	$("#genderEditSelect").on('change', updateGender);
	$("#editBDate").on('change', updateBDate);
	$("#emailEditInput").on('focusin', function() {
		editState = false;
	}).on('keyup', function() {
		editState = true;
	}).on('focusout', checkEditEmail);
}

function updateRName() {
	if (editState === true) {
		$("#pMsgEditRname").text("กำลังดำเนินการ").css("color", "blue").show();
		var Id = localStorage.userId;
		var rn = $("#nameEditInput").val();
		var url = serviceURL + 'updateUserProfile.php';
		if (rn !== '') {
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					userid: Id,
					realname: rn
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						window.localStorage.userRName = rn;
						getUserDetail();
						getEditUserDetail();
						$("#pMsgEditRname").text("เปลี่ยนชื่อเป็น " + rn + " เรียบร้อยแล้ว").css("color", "green").fadeOut(3200);
					} else {
						$("#pMsgEditRname").text("มีบางอย่างผิดพลาด").css("color", "red");
					}
				},
				error: function(e) {
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {
					console.log("complete");
				}
			});
		} else {
			$("#pMsgEditRname").text("กรุณากรอกชื่อจริงของคุณ").css("color", "red").show();
		}
		return false;
	}
}

function updateSurName() {
	if (editState === true) {
		$("#pMsgEditSurname").text("กำลังดำเนินการ").css("color", "blue").show();
		var Id = localStorage.userId;
		var rsn = $("#surnameEditInput").val();
		var url = serviceURL + 'updateUserProfile.php';
		if (rsn !== '') {
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					userid: Id,
					realsname: rsn
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						window.localStorage.userSurname = rsn;
						getUserDetail();
						getEditUserDetail();
						$("#pMsgEditSurname").text("เปลี่ยนนามสกุลเป็น " + rsn + " เรียบร้อยแล้ว").css("color", "green").fadeOut(3200);
					} else {
						$("#pMsgEditSurname").text("มีบางอย่างผิดพลาด").css("color", "red");
					}
				},
				error: function(e) {
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {
					console.log("complete");
				}
			});
		} else {
			$("#pMsgEditSurname").text("กรุณากรอกนามสกุลจริงของคุณ").css("color", "red").show();
		}
		return false;
	}
}

function updateGender() {
	$("#pMsgEditGender").text("กำลังดำเนินการ").css("color", "blue").show();
	var Id = localStorage.userId;
	var g = $("#genderEditSelect").val();
	var url = serviceURL + 'updateUserProfile.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			userid: Id,
			gender: g
		},
		crossDomain: true,
		timeout: 10000,
		success: function(res) {
			if (res.success === true) {
				window.localStorage.userGender = g;
				getUserDetail();
				getEditUserDetail();
				$("#pMsgEditGender").text("เรียบร้อยแล้ว").css("color", "green").fadeOut(3200);
			} else {
				$("#pMsgEditGender").text("มีบางอย่างผิดพลาด").css("color", "red");
			}
		},
		error: function(e) {
			navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
		},
		complete: function(e) {
			console.log("complete");
		}
	});
	return false;
}

function updateBDate() {
	var bday = moment($('#editBDate').val(), "DD-MM-YYYY").format('YYYY-MM-DD');
	$("#pMsgEditBdate").text("กำลังดำเนินการ").css("color", "blue").show();
	var Id = localStorage.userId;
	var bd = bday;
	var url = serviceURL + 'updateUserProfile.php';
	if (bday !== "Invalid date") {
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				userid: Id,
				birthdate: bd
			},
			crossDomain: true,
			timeout: 10000,
			success: function(res) {
				if (res.success === true) {
					window.localStorage.userBdate = bd;
					getUserDetail();
					getEditUserDetail();
					$("#pMsgEditBdate").text("เรียบร้อยแล้ว").css("color", "green").fadeOut(3200);
				} else {
					$("#pMsgEditBdate").text("มีบางอย่างผิดพลาด").css("color", "red");
				}
			},
			error: function(e) {
				navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
			},
			complete: function(e) {
				console.log("complete");
			}
		});
	} else {
		$("#pMsgEditBdate").text("กรุณากรอกวันเกิดให้ถูกต้อง").css("color", "red").show();
	}
	return false;
}

function updateEmail() {
	var Id = localStorage.userId;
	var e = $("#emailEditInput").val();
	var url = serviceURL + 'updateUserProfile.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			userid: Id,
			email: e
		},
		crossDomain: true,
		timeout: 10000,
		success: function(res) {
			if (res.success === true) {
				window.localStorage.userEmail = e;
				getUserDetail();
				getEditUserDetail();
				$("#pMsgEditE").text("เปลี่ยน Email เรียบร้อยแล้ว").css("color", "green").fadeOut(3200);
			} else {
				$("#pMsgEditE").text("มีบางอย่างผิดพลาด").css("color", "red");
			}
		},
		error: function(e) {
			navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
		},
		complete: function(e) {
			console.log("complete");
		}
	});
	return false;
}

function checkEditEmail() {
	if (editState === true) {
		var e = $("#emailEditInput").val();
		var url = serviceURL + 'checkUsedEmail.php';
		$("#pMsgEditE").text("กำลังดำเนินการ").css("color", "blue").show();
		if (e !== '') {
			if (checkEmailRegEx(e) === true) {
				$.ajax({
					type: 'GET',
					url: url,
					contentType: "application/json",
					dataType: 'jsonp',
					data: {
						email: e
					},
					crossDomain: true,
					timeout: 10000,
					success: function(res) {
						if (res.success === true) {
							$("#pMsgEditE").text(" Email นี้มีผู้ใช้แล้ว").css("color", "red");
						} else {
							$("#pMsgEditE").text(" Email นี้สามารถใช้ได้").css("color", "green");
							updateEmail();
						}
					},
					error: function(e) {
						navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต");
					},
					complete: function(e) {
						console.log("message");
					}
				});
			} else {
				$("#pMsgEditE").text(" กรุณากรอก Email ให้ถูกต้อง ").css("color", "red");
			}
		} else {
			$("#pMsgEditE").text("กรุณากรอก Email").css("color", "red");
		}
		return false;
	}
}
function getOtherUserDetail(otherUserId) {
	loadingShow("#contentOtherProfile");
	$.mobile.loading('show');
	var url = serviceURL + 'getOtherUserDetail.php';
	var ouid = otherUserId;
	var d = moment();
	var gd = "";
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			otherUId: ouid
		},
		crossDomain: true,
		timeout: 10000,
		success: function(res) {
			if (!jQuery.isEmptyObject(res)) {
				if (res.user_gender === "male") {
					gd = "ชาย";
				} else if (res.user_gender === "female") {
					gd = "หญิง";
				} else {
					gd = "อื่นๆ";
				}
				$('#imgOtherPropic').attr('src', serviceURL + "../img/userprofileimage/" + res.user_imageUrl + "?" + d.format());
				$('#spNameOtherPro').text(res.user_rname + ' ' + res.user_surname);
				$('#spGenderOtherPro').text(gd);
				$('#spBirthOtherPro').text(moment(res.user_bdate, 'YYYY-MM-DD', 'th').format('LL'));
				$('#spEmailOtherPro').text(res.user_email);
				$("#getDetailThisUser").data("otherUId", res.user_id);
			} else {
				navigator.notification.alert("failed", function() {});
			}
			loadingHide("#contentOtherProfile");
			$.mobile.loading('hide');
		},
		error: function(e) {
			navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
			loadingHide("#contentOtherProfile");
			$.mobile.loading('hide');
		},
		complete: function(e) {
			console.log("getOtherUserDetail complete");
		}
	});
}
var globalAddReportImageURI = null;
var globalLatitude = null;
var globalLongitude = null;
var globalAccuracy = null;
var globalDateTime = null;
var globalLocat = null;
var titleState = false;
var contentState = false;

function getCurrentPosition() {
		globalAddReportImageURI = null;
		globalLatitude = null;
		globalLongitude = null;
		globalAccuracy = null;
		var d = moment();
		$('#imgMiniPropic').attr('src', serviceURL + "../img/userprofileimage/" + localStorage.userImageUrl + "?" + d.format());
		validReport();
		var option = {
			enableHighAccuracy: true,
			timeout: 60 * 1000,
			maximumAge: 1000 * 60 * 10
		};

		function onSuccess(pos) {
			globalLatitude = pos.coords.latitude;
			globalLongitude = pos.coords.longitude;
			globalAccuracy = pos.coords.accuracy;
			var text = "<div>Latitude: " + pos.coords.latitude + "<br/>" + "Longitude: " + pos.coords.longitude + "<br/>" + "Accuracy: " + pos.coords.accuracy + "m<br/>" + "</div>";
			$("#cur_position").html(text);
			var mapwidth = parseInt($('#map').css("width"), 10); // remove 'px' from width value
			var mapheight = parseInt($('#map').css("height"), 10);
			$('#map').attr('src', "http://maps.googleapis.com/maps/api/staticmap?center=" + pos.coords.latitude + "," + pos.coords.longitude + "&zoom=16&size=400x400&maptype=roadmap&markers=color:green%7C" + pos.coords.latitude + "," + pos.coords.longitude + "&sensor=false");
			//" + mapwidth + "x" + mapheight + "
			$('#map').css('visibility', 'visible');
			$.ajax({
				url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + pos.coords.latitude + ',' + pos.coords.longitude + '&sensor=true&language=th',
				success: function(data) {
					globalLocat = data.results[0].address_components[0].short_name + " " + data.results[0].address_components[1].short_name + " " + data.results[0].address_components[2].short_name + " " + data.results[0].address_components[3].short_name;
					$('#spMiniLocat').text(globalLocat);
					/*or you could iterate the components for only the city and state*/
				}
			});
		}

		function onError(errMsg) {
			alert(JSON.stringify(errMsg));
			$("#cur_position").html("Error getting geolocation: " + error.code);
		}
		$('#cameraImage').css('visibility', 'hidden');
		$('#map').css('visibility', 'hidden');
		$("#cur_position").html("Getting geolocation . . .");
		navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
	}
	//camera
	//function onPhotoURISuccess(imageURI) {
	//var image = document.getElementById('cameraImage');
	//  image.src = imageURI;
	//}

function onPhotoURISuccess(imageURI) {
		var image = document.getElementById('cameraImage');
		image.src = imageURI;
		$('#cameraImage').css('visibility', 'visible');
		globalAddReportImageURI = imageURI;
		validReport();
	}
	//function take_pic() {
	//    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 100, //destinationType: Camera.DestinationType.DATA_URL, targetWidth:320, //targetHeight:320, correctOrientation:1, saveToPhotoAlbum:1, allowEdit:1});
	//}

function testGlobalURI() {}

function take_pic() {
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality: 80,
		destinationType: Camera.DestinationType.FILE_URI,
		sourceType: Camera.PictureSourceType.CAMERA,
		targetWidth: 320,
		targetHeight: 320,
		correctOrientation: 1,
		saveToPhotoAlbum: 0,
		allowEdit: 1
	});
}

function album_pic() {
	clearCache();
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality: 80,
		destinationType: Camera.DestinationType.FILE_URI,
		sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		targetWidth: 320,
		targetHeight: 320,
		correctOrientation: 1,
		saveToPhotoAlbum: 0,
		allowEdit: 1
	});
}

function onFail(message) {
		alert('Failed because: ' + message);
	}
	//////////////////////////////////////////

function addReportBindEvent() {
	var d = moment();
	$("#reportTitleInput").on('focusout', function() {
		if ($("#reportTitleInput").val()) {
			titleState = true;
			validReport();
		} else {
			titleState = false;
			validReport();
		}
	}).on('keyup', function() {
		if ($("#reportTitleInput").val()) {
			titleState = true;
			validReport();
		} else {
			titleState = false;
			validReport();
		}
	});
	$("#reportContentInput").on('keyup', function() {
		if ($("#reportContentInput").val()) {
			contentState = true;
			validReport();
		} else {
			contentState = false;
			validReport();
		}
	}).on('focusout', function() {
		if ($("#reportContentInput").val()) {
			contentState = true;
			validReport();
		} else {
			contentState = false;
			validReport();
		}
	});
	$('#imgMiniPropic').attr('src', serviceURL + "../img/userprofileimage/" + localStorage.userImageUrl + "?" + d.format());
	$('#spNameMiniPro').text(localStorage.userRName + ' ' + localStorage.userSurname);
	$('#spMiniLocat').text();
	$('#spDateMini').text(d.format('DD MMMM YYYY'));
	//$("#addRepSumitBtn").on("click", handleAddreport);
	startTime();
	validReport();
	//getCurrentPosition();
	//$('#spTimeMini').text(d.format('[เวลา] h:mm:ss'));
	// มกราคม 18 2015, 8:47:51 หลังเที่ยงmoment(localStorage.userBdate, 'YYYY-MM-DD', 'th').format('LL')
}

function startTime() {
	var d = moment();
	$('#spTimeMini').text(d.format('HH:mm:ss'));
	var t = setTimeout(function() {
		startTime()
	}, 500);
}

function validReport() {
	if (globalAddReportImageURI !== null && globalLatitude !== null && globalLongitude !== null && globalAccuracy !== null && globalLocat !== null && titleState !== false && contentState !== false) {
		$("#addRepSumitBtn").removeClass("ui-state-disabled");
		return true;
	} else {
		$("#addRepSumitBtn").addClass("ui-state-disabled");
		return false;
	}
}

function handleAddreport() {
	loadingShow("#contentAddReport");
	var dEvent = moment().format('YYYY-MM-DD HH:mm:ss');
	var options = new FileUploadOptions();
	options.fileKey = "file";
	options.fileName = globalAddReportImageURI.substr(globalAddReportImageURI.lastIndexOf('/') + 1);
	options.mimeType = "image/jpeg";
	var params = new Object();
	params.userId = localStorage.userId;
	params.dateEvent = dEvent;
	params.title = $("#reportTitleInput").val();
	params.content = $("#reportContentInput").val();
	params.latitude = globalLatitude;
	params.longitude = globalLongitude;
	params.locat = globalLocat;
	params.group = localStorage.userGroup
	options.params = params;
	options.chunkedMode = false;
	var ft = new FileTransfer();
	ft.upload(globalAddReportImageURI, encodeURI(serviceURL + "addReport.php"), win, fail, options);
}

function win(r) {
	alert("เพิ่มรายงานเรียบร้อยแล้ว!");
	//$('#imgPropic').attr('src', globalProfileImageURI);
	//getUserDetail();
	loadFeed();
	window.history.back();
	loadingHide("#contentAddReport");
}

function fail(error) {
	loadingHide("#contentAddReport");
	alert("An error has occurred: Code = " + error.code);
}
var editState;
var idReport;
function getEditReport (reportId, reportTitle, reportContent){
		$("#sumitEditRpBtn").addClass("ui-state-disabled");
		idReport = reportId;
		clearCache();
		var d = moment();
		//loadingShow("#contentEditProfile");
		$('#editReportTitleInput').val(reportTitle);
		$('#editReportContentInput').val(decodeURI(reportContent));
		/*$('#imgEditPropic').attr('src', serviceURL + "../img/userprofileimage/" + localStorage.userImageUrl+"?"+d.format());
		$('#nameEditInput').val(localStorage.userRName);
		$('#surnameEditInput').val(localStorage.userSurname);
		var gen = $('#genderEditSelect');
		gen.val(localStorage.userGender).attr('selected', true).siblings('option').removeAttr('selected');
		gen.selectmenu().selectmenu('refresh', true);
		
		$('#genderEditSelect').val(localStorage.userGender);
		$('#emailEditInput').val(localStorage.userEmail);
		//loadingHide("#contentEditProfile");
		$('#editBDate').combodate({
        value: moment(localStorage.userBdate, 'YYYY-MM-DD'),
		template:'DD MMMM YYYY',
        minYear: 1900,
        maxYear: moment().format('YYYY')
    	});*/  
}

//////////////////////////////////////////////////////
function editReportBindEvent(){
	$("#editReportTitleInput").on('focusin', function() {editState = false; })
					   .on('keyup', function() {editState = true; $("#sumitEditRpBtn").removeClass("ui-state-disabled");})
					   .on('focusout', updateReportTitle);
	$("#editReportContentInput").on('focusin', function() {editState = false; })
					   .on('keyup', function() {editState = true; $("#sumitEditRpBtn").removeClass("ui-state-disabled");})
					   .on('focusout', updateReportContent);	
}

//////////////////////////////////////////////////////	
function updateReportTitle (){
	var tt_ct = 0;

	var rpId = idReport;
	var editV;
	var url = serviceURL + 'updateReport.php';
	if(editState===true){
	$("#pMsgEditReport").text("กำลังดำเนินการ").css("color", "blue").show();
		editV = $("#editReportTitleInput").val();
	if (editV !== '') {
		
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					edittype: tt_ct,
					reportid: rpId, 
					editval: editV
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						//window.localStorage.userRName = rn;
						loadThisUserReport();
						//getEditUserDetail();
						$("#pMsgEditReport").text("แก้ไขข้อมูล เรียบร้อยแล้ว").css("color", "green").fadeOut(3200);
						
					} else {
						$("#pMsgEditReport").text("มีบางอย่างผิดพลาด").css("color", "red").fadeOut(3200);
					}
				},
				error: function(e) {
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {
				}
			});
	} else {
		$("#pMsgEditReport").text("กรุณากรอกข้อมูล!").css("color", "red").show().fadeOut(3200);
	}
	return false;			
			}
	}
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////	
function updateReportContent (){
	var tt_ct = 1;
	var rpId = idReport;
	var editV;
	var url = serviceURL + 'updateReport.php';
	if(editState===true){
	$("#pMsgEditReport").text("กำลังดำเนินการ").css("color", "blue").show();
	

			editV = $("#editReportContentInput").val();
			
	if (editV !== '') {
		
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					edittype: tt_ct,
					reportid: rpId, 
					editval: editV
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						//window.localStorage.userRName = rn;
						loadThisUserReport();
						//getEditUserDetail();
						$("#pMsgEditReport").text("แก้ไขข้อมูล เรียบร้อยแล้ว").css("color", "green").fadeOut(2000);
					} else {
						$("#pMsgEditReport").text("มีบางอย่างผิดพลาด").css("color", "red").fadeOut(3200);
					}
				},
				error: function(e) {
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {
					
				}
			});
	} else {
		$("#pMsgEditReport").text("กรุณากรอกข้อมูล!").css("color", "red").show().fadeOut(3200);
	}
	return false;			
			}
	}
//////////////////////////////////////////////////////
function setDelReportId (reportIdDelete){
	idReport = null;
	idReport = reportIdDelete;
	}
function deleteReport (){
	
	var rpId = idReport;
	var url = serviceURL + 'deleteReport.php';
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					reportid: rpId
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						//window.localStorage.userRName = rn;
						loadThisUserReport();
						//getEditUserDetail();
						//$("#pMsgEditReport").text("แก้ไขข้อมูล เรียบร้อยแล้ว").css("color", "green").fadeOut(2000, function(){window.history.back();});
						navigator.notification.alert("ลบข้อมูล เรียบร้อยแล้ว");
					} else {
						navigator.notification.alert("มีบางอย่างผิดพลาด");
					}
				},
				error: function(e) {
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {
					console.log("complete");
					
				}
			});

	}
	
function backHistory(){window.history.back();}
var uid;

function loadThisUserReport() {
	uid = window.localStorage.userId;
	loadUserReport();
}

function loadOtherUserReport() {
	uid = $("#getDetailThisUser").data("otherUId");
	loadUserReport();
}

function loadUserReport() {
	clearCache(); //
	loadingShow("#contentUserReport");
	var output = $('#userReportMiddle');
	/*if(!$( "#getDetailThisUser" ).attr( "data-otherUId")){
		uid = window.localStorage.userId;
		}else if($( "#getDetailThisUser" ).data( "otherUId") !== 'undifined'){
			uid = $( "#getDetailThisUser" ).data( "otherUId");
			
			}*/
	output.empty();
	$('#userReportBottom').empty();
	$('#userReportTop').empty();
	var url = serviceURL + 'loadUserReport.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			userid: uid
		},
		//jsonp: 'jsoncallback',
		crossDomain: true,
		timeout: 10000,
		success: function(data, status) {
			/*$.each(data, function(i,item){ 
				var feed = '<h1>'+item.report_by+'</h1>'
				+ '<p>'+item.report_id+'<br>'
				+ '<p>'+item.report_title+'<br>'
				+ '<p>'+item.report_content+'<br>'
				+ '<p>'+item.report_date+'<br>'
				+ '<p>'+item.report_lat+'<br>'
				+ '<p>'+item.report_long+'<br>'
				+ '<p>'+item.report_locat+'<br>'
				+ item.report_imgUrl+'</p>';

				output.append(feed);
			});*/
			if (!jQuery.isEmptyObject(data)) {
				$.each(data, function(i, item) {
					if (uid === window.localStorage.userId) {
						htmlReportUser(item);
					} else {
						htmlReport(item);
					}
					output.append(reportHtml);
					loadingHide("#contentUserReport");
				});
			} else {
				loadingHide("#contentUserReport");
				$("#pMsgUserReport").text('คุณยังไม่มีรายงาน.').show().css("color", "green").fadeOut(3200);
			}
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
			loadingHide("#contentUserReport");
		}
	});
}

function loadNewUserReport() {
		var output = $('#userReportTop');
		var ff = 'new';
		var url = serviceURL + 'loadUserReport.php';
		///////////////////////////////////////////////////////////////////////////////////	
		if (output.html().length === 0) {
			var lastDiv = $('#userReportMiddle').children('div:first-child');
			var lastDivDate = lastDiv.data('report-date');
			var lastDivId = lastDiv.data('report-id');
			loadNewUserReportAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
			///////////////////////////////////////////////////////////////////////////////////	
		} else {
			var lastDiv = $('#userReportTop').children('div:first-child');
			var lastDivDate = lastDiv.data('report-date');
			var lastDivId = lastDiv.data('report-id');
			loadNewUserReportAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		}
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadNewUserReportAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
		/*var uid;
	if($( "#getDetailThisUser" ).data( "otherUId") !== 'undifined'){
		uid = $( "#getDetailThisUser" ).data( "otherUId");
		}else{
			uid = localStorage.userId;
			}*/
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				userid: uid,
				userReportFlag: ff,
				lastRepViewDate: lastDivDate,
				lastRepViewId: lastDivId
			},
			crossDomain: true,
			timeout: 10000,
			success: function(data, status) {
				if (!jQuery.isEmptyObject(data)) {
					$.each(data, function(i, item) {
						if (uid === window.localStorage.userId) {
							htmlReportUser(item);
						} else {
							htmlReport(item);
						}
						output.prepend(reportHtml);
					});
				} else {
					$("#pMsgUserReport").text('ฟีดข่าวล่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
					//output.empty();
				}
			},
			error: function() {
				output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
			}
		});
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadOldUserReport() {
	var output = $('#userReportBottom');
	var ff = 'old';
	var url = serviceURL + 'loadUserReport.php';
	///////////////////////////////////////////////////////////////////////////////////	
	if (output.html().length === 0) {
		var lastDiv = $('#userReportMiddle').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldUserReportAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		///////////////////////////////////////////////////////////////////////////////////	
	} else {
		var lastDiv = $('#userReportBottom').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldUserReportAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
	}
}

function loadOldUserReportAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
	/*var uid;
	if($( "#getDetailThisUser" ).data( "otherUId") !== 'undifined'){
		uid = $( "#getDetailThisUser" ).data( "otherUId");
		}else{
			uid = localStorage.userId;
			}*/
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			userid: uid,
			userReportFlag: ff,
			lastRepViewDate: lastDivDate,
			lastRepViewId: lastDivId
		},
		crossDomain: true,
		timeout: 10000,
		success: function(data, status) {
			if (!jQuery.isEmptyObject(data)) {
				$.each(data, function(i, item) {
					if (uid === window.localStorage.userId) {
						htmlReportUser(item);
					} else {
						htmlReport(item);
					}
					output.append(reportHtml);
				});
			} else {
				$("#pMsgUserReportB").text('ฟีดข่าวเก่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
				//output.empty();
			}
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
		}
	});
}
function htmlReportUser(item){
	var d = moment();
	var de = moment(item.report_date, 'YYYY-MM-DD HH:mm:ss', 'th');
	reportHtml = '<div class="ui-corner-all custom-corners" id="reportView" data-report-date="'+item.report_date+'" data-report-id="'+item.report_id+'" data-report-by="'+item.report_by+'"><a href="#otherProfilePage" class="ui-corner-all" id="lnkThisUpro" onClick="getOtherUserDetail('+"'" + item.report_by + "'"+')"><div class="ui-bar ui-bar-b"><h3><strong><span id="spNameFeed">' + item.report_realNameBy
				+ '</span></strong></h3></div></a><div class="ui-body ui-body-a"><div class="ui-grid-a">'
				 + '<div class="ui-block-a" id="miniPropicHome">' 
				 + '<img alt="" height="40" id="imgMiniPropicHome" src="'+serviceURL + "../img/userprofileimage/" + item.report_userImageUrl + "?" + d.format() + '" width="40">' 
				 + '</div><div class="ui-block-b" id="miniReportdetail">' 
				 + 'วันที่: <span id="spDateReport">' + de.format('DD MMMM YYYY')
				 + '</span><br>เวลา: <em><span id="spTimeReport">' + de.format('HH:mm:ss')
				 + '</span></em></div></div><div class="ui-grid-solo"><b>หัวเรื่อง:</b> <span id="spTitle">' + item.report_title
				 + '</span><br><b>รายละเอียด:</b> <em><span id="spContent">' + item.report_content
				 + '</span></em><br><br><a href="#fullImgPage" class="lnkThisImg" onClick="getFullImg('+ "'"+ item.report_imgUrl + "'"+')"><img align="center" alt="" id="imgReport" src="' +serviceURL + "../img/reportPic/" + item.report_imgUrl + "?" + d.format()
				 + '"></a><b>สถานที่:</b> <em><span id="spLocatReport">' + item.report_locat
				 + '</span></em><br><a href="#mapPage" id="lnkThisMap" data-ajax="false" onClick="showThisMap('+ item.report_lat + ", " + item.report_long +')"><img id="imgMapReport" src="http://maps.googleapis.com/maps/api/staticmap?center=' + item.report_lat + "," + item.report_long
				 + '&zoom=16&size=400x400&maptype=roadmap&markers=color:green%7C' + item.report_lat + "," + item.report_long
				 + '&sensor=true"></a>'
				 + '<div class="ui-grid-a"><div class="ui-block-a">'
				 + '<a class="ui-btn ui-mini ui-icon-refresh ui-btn-icon-left ui-corner-all activeOnce" href="#editReportPage" id="editUserReportBtn" data-transition="none" onClick="getEditReport('+"'"+ item.report_id +"', " +"'"+item.report_title + "', " +"'"+ encodeURI(item.report_content) +"'"+');">แก้ไข</a>'
            	 + '</div><div class="ui-block-b">'
				 + '<a class="ui-btn ui-mini ui-icon-refresh ui-btn-icon-left ui-corner-all activeOnce" href="#deleteReportDialog" id="delReportPopupBtn" data-rel="popup" data-position-to="window" data-transition="pop" onClick="setDelReportId(' +"'"+ item.report_id + "'"+')">ลบ</a>'
		   		 + '</div></div></div></div><br>';
	
	
	}
	var reportHtml;

function loadFeed() {
	clearCache(); //
	loadingShow("#contentHome");
	var output = $('#feedMiddle');
	output.empty();
	$('#feedBottom').empty();
	$('#feedTop').empty();
	var url = serviceURL + 'loadFeed.php';
	$.ajax({
		url: url,
		dataType: 'jsonp',
		//jsonp: 'jsoncallback',
		timeout: 10000,
		success: function(data, status) {
			$.each(data, function(i, item) {
				htmlReport(item);
				output.append(reportHtml);
				loadingHide("#contentHome");
			});
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!');
			loadingHide("#contentHome");
			navigator.notification.confirm('พบข้อผิดพลาดในการโหลดข้อมูล!!โหลดใหม่หรือไม่?', loadFeedCallback, 'Error', 'ไม่,ลองอีกครั้ง');
		}
	});
}

function loadNewFeed() {
		var output = $('#feedTop');
		var ff = 'new';
		var url = serviceURL + 'loadFeed.php';
		///////////////////////////////////////////////////////////////////////////////////	
		if (output.html().length === 0) {
			var lastDiv = $('#feedMiddle').children('div:first-child');
			var lastDivDate = lastDiv.data('report-date');
			var lastDivId = lastDiv.data('report-id');
			loadNewFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
			///////////////////////////////////////////////////////////////////////////////////	
		} else {
			var lastDiv = $('#feedTop').children('div:first-child');
			var lastDivDate = lastDiv.data('report-date');
			var lastDivId = lastDiv.data('report-id');
			loadNewFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		}
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadNewFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				feedFlag: ff,
				lastRepViewDate: lastDivDate,
				lastRepViewId: lastDivId
			},
			crossDomain: true,
			timeout: 10000,
			success: function(data, status) {
				if (!jQuery.isEmptyObject(data)) {
					$.each(data, function(i, item) {
						htmlReport(item);
						output.prepend(reportHtml);
					});
				} else {
					$("#pMsgFeed").text('ฟีดข่าวล่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
					//output.empty();
				}
			},
			error: function() {
				output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!');
			}
		});
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadOldFeed() {
	var output = $('#feedBottom');
	var ff = 'old';
	var url = serviceURL + 'loadFeed.php';
	///////////////////////////////////////////////////////////////////////////////////	
	if (output.html().length === 0) {
		var lastDiv = $('#feedMiddle').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		///////////////////////////////////////////////////////////////////////////////////	
	} else {
		var lastDiv = $('#feedBottom').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
	}
}

function loadOldFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			feedFlag: ff,
			lastRepViewDate: lastDivDate,
			lastRepViewId: lastDivId
		},
		crossDomain: true,
		timeout: 10000,
		success: function(data, status) {
			if (!jQuery.isEmptyObject(data)) {
				$.each(data, function(i, item) {
					//var mapwidth = parseInt($('#imgMapReport').css("width"), 10); // remove 'px' from width value
					//var mapheight = parseInt($('#imgMapReport').css("height"), 10);
					htmlReport(item);
					//' + mapwidth + "x" + mapheight + '
					output.append(reportHtml);
				});
			} else {
				$("#pMsgFeedB").text('ฟีดข่าวเก่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
				//output.empty();
			}
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!');
		}
	});
}
function htmlReport(item){
	var d = moment();
	var de = moment(item.report_date, 'YYYY-MM-DD HH:mm:ss', 'th');
	reportHtml = '<div class="ui-corner-all custom-corners" id="reportView" data-report-date="'+item.report_date+'" data-report-id="'+item.report_id+'" data-report-by="'+item.report_by+'"><a href="#otherProfilePage" class="ui-corner-all" id="lnkThisUpro" onClick="getOtherUserDetail('+"'" + item.report_by + "'"+')"><div class="ui-bar ui-bar-b"><h3><strong><span id="spNameFeed">' + item.report_realNameBy
				+ '</span></strong></h3></div></a><div class="ui-body ui-body-a"><div class="ui-grid-a">'
				 + '<div class="ui-block-a" id="miniPropicHome">' 
				 + '<img alt="" height="40" id="imgMiniPropicHome" src="'+serviceURL + "../img/userprofileimage/" + item.report_userImageUrl + "?" + d.format() + '" width="40">' 
				 + '</div><div class="ui-block-b" id="miniReportdetail">' 
				 + 'วันที่: <span id="spDateReport">' + de.format('DD MMMM YYYY')
				 + '</span><br>เวลา: <em><span id="spTimeReport">' + de.format('HH:mm:ss')
				 + '</span></em></div></div><div class="ui-grid-solo"><b>หัวเรื่อง:</b> <span id="spTitle">' + item.report_title
				 + '</span><br><b>รายละเอียด:</b> <em><span id="spContent">' + item.report_content
				 + '</span></em><br><br><a href="#fullImgPage" class="lnkThisImg" onClick="getFullImg('+ "'"+ item.report_imgUrl + "'"+')"><img align="center" alt="" id="imgReport" src="' +serviceURL + "../img/reportPic/" + item.report_imgUrl + "?" + d.format()
				 + '"></a><b>สถานที่:</b> <em><span id="spLocatReport">' + item.report_locat
				 + '</span></em><br><a href="#mapPage" id="lnkThisMap" data-ajax="false" onClick="showThisMap('+ item.report_lat + ", " + item.report_long +')"><img id="imgMapReport" src="http://maps.googleapis.com/maps/api/staticmap?center=' + item.report_lat + "," + item.report_long
				 + '&zoom=16&size=400x400&maptype=roadmap&markers=color:green%7C' + item.report_lat + "," + item.report_long
				 + '&sensor=true"></a></a></div></div><br>';
	
	
	}
	var gid

function loadUserGroup() {
	clearCache(); //
	gid = localStorage.userGroup;
	if (gid !== '000000') {
		loadingShow("#contentGroup");
		var url = serviceURL + 'loadGroupDetail.php';
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				groupid: gid
			},
			crossDomain: true,
			timeout: 10000,
			success: function(res) {
				if (!jQuery.isEmptyObject(res)) {
					//store
					$('#spGroupName').text(res.group_name);
					$('#spGroupDetail').text(res.group_detail);
					uid = window.localStorage.userId;
					loadGroupFeed();
				} else {
					navigator.notification.alert("Load Group Detail failed", function() {});
				}
				//$("#submitButton").removeAttr("disabled");
				loadingHide("#contentGroup");
			},
			error: function(e) {
				navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				loadingHide("#contentGroup");
			},
			complete: function(e) {
				$("#submitButton").removeAttr("disabled");
				loadingHide("#contentGroup");
			}
		});
	} else {
		$('#spGroupName').text("ยังไม่ได้เลือกกลุ่ม");
		$('#spGroupDetail').text(" ยังไม่มีรายละเอียดกลุ่ม. กรุณาเลือกหรือสร้างกลุ่ม");
	}
}

function loadGroupFeed() {
	loadingShow("#contentGroup");
	var output = $('#feedGroupMiddle');
	output.empty();
	$('#feedGroupBottom').empty();
	$('#feedGroupTop').empty();
	var url = serviceURL + 'loadGroupReport.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			groupid: gid,
			userid: uid
		},
		crossDomain: true,
		timeout: 10000,
		success: function(data, status) {
			$.each(data, function(i, item) {
				htmlReport(item);
				output.append(reportHtml);
				loadingHide("#contentGroup");
			});
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
			loadingHide("#contentGroup");
		}
	});
}

function loadNewGroupFeed() {
		var output = $('#feedGroupTop');
		var ff = 'new';
		var url = serviceURL + 'loadGroupReport.php';
		///////////////////////////////////////////////////////////////////////////////////	
		if (output.html().length === 0) {
			var lastDiv = $('#feedGroupMiddle').children('div:first-child');
			var lastDivDate = lastDiv.data('report-date');
			var lastDivId = lastDiv.data('report-id');
			loadNewGroupFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
			///////////////////////////////////////////////////////////////////////////////////	
		} else {
			var lastDiv = $('#feedGroupTop').children('div:first-child');
			var lastDivDate = lastDiv.data('report-date');
			var lastDivId = lastDiv.data('report-id');
			loadNewGroupFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		}
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadNewGroupFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				groupid: gid,
				userid: uid,
				userReportFlag: ff,
				lastRepViewDate: lastDivDate,
				lastRepViewId: lastDivId
			},
			crossDomain: true,
			timeout: 10000,
			success: function(data, status) {
				if (!jQuery.isEmptyObject(data)) {
					$.each(data, function(i, item) {
						htmlReport(item);
						output.prepend(reportHtml);
					});
				} else {
					$("#pMsgGroupFeed").text('ฟีดข่าวล่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
				}
			},
			error: function() {
				output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
			}
		});
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadOldGroupFeed() {
	var output = $('#feedGroupBottom');
	var ff = 'old';
	var url = serviceURL + 'loadGroupReport.php';
	///////////////////////////////////////////////////////////////////////////////////	
	if (output.html().length === 0) {
		var lastDiv = $('#feedGroupMiddle').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldGroupFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		///////////////////////////////////////////////////////////////////////////////////	
	} else {
		var lastDiv = $('#feedGroupBottom').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldGroupFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
	}
}

function loadOldGroupFeedAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			groupid: gid,
			userid: uid,
			userReportFlag: ff,
			lastRepViewDate: lastDivDate,
			lastRepViewId: lastDivId
		},
		crossDomain: true,
		timeout: 10000,
		success: function(data, status) {
			if (!jQuery.isEmptyObject(data)) {
				$.each(data, function(i, item) {
					htmlReport(item);
					output.append(reportHtml);
				});
			} else {
				$("#pMsgGroupFeedB").text('ฟีดข่าวเก่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
				//output.empty();
			}
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
		}
	});
}
var globalGId = 0;

function getSelectGroupData() {
		clearCache(); //
		loadingShow("#contentSelectGroup");
		var output = $('#selectGroupList');
		output.empty();
		var url = serviceURL + 'loadAllGroup.php';
		var items = "";
		$.ajax({
			url: url,
			dataType: 'jsonp',
			//jsonp: 'jsoncallback',
			timeout: 10000,
			success: function(data, status) {
				$.each(data, function(i, item) {
					items = '<li><a href="#showGroupPage" onClick="getOneGroupData(' + item.group_id + ');">' + item.group_name + '</a></li>';
					output.append(items);
					output.listview("refresh");
				});
				loadingHide("#contentSelectGroup");
			},
			error: function() {
				output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!');
				loadingHide("#contentSelectGroup");
			}
		});
	}
	///////////////////////////////////////////////////////////////////////////////////////

function getOneGroupData(grpid) {
		//clearCache();//
		loadingShow("#contentShowGroup");
		var tgid = grpid;
		globalGId = tgid;
		var url = serviceURL + 'loadGroupDetail.php';
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				groupid: tgid
			},
			crossDomain: true,
			timeout: 10000,
			success: function(res) {
				if (!jQuery.isEmptyObject(res)) {
					//store
					$('#spOneGroupName').text(res.group_name);
					$('#spOneGroupDetail').text(res.group_detail);
					loadOneGroupFeed(tgid);
				} else {
					navigator.notification.alert("Load Group Detail failed", function() {});
				}
				//$("#submitButton").removeAttr("disabled");
				loadingHide("#contentShowGroup");
			},
			error: function(e) {
				navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				loadingHide("#contentShowGroup");
			},
			complete: function(e) {
				//$("#submitButton").removeAttr("disabled");
				loadingHide("#contentShowGroup");
			}
		});
	}
	///////////////////////////////////////////////////////////////////////////////////////

function loadOneGroupFeed(grpid) {
		loadingShow("#contentShowGroup");
		var output = $('#feedGroupOne');
		uid = window.localStorage.userId;
		var tgid = grpid;
		output.empty();
		var url = serviceURL + 'loadGroupReport.php';
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				groupid: tgid,
				userid: uid
			},
			crossDomain: true,
			timeout: 10000,
			success: function(data, status) {
				$.each(data, function(i, item) {
					htmlReport(item);
					output.append(reportHtml);
					loadingHide("#contentShowGroup");
				});
			},
			error: function() {
				output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
				loadingHide("#contentShowGroup");
			}
		});
	}
	/////////////////////////////////////////////////////////////////////////////////////////////	

function loadOldGroupOne() {
	var output = $('#feedGroupOneBottom');
	var ff = 'old';
	var url = serviceURL + 'loadGroupReport.php';
	var tgid = globalGId;
	///////////////////////////////////////////////////////////////////////////////////	
	if (output.html().length === 0) {
		var lastDiv = $('#feedGroupOne').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldGroupOneAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
		///////////////////////////////////////////////////////////////////////////////////	
	} else {
		var lastDiv = $('#feedGroupOneBottom').children('div:last-child');
		var lastDivDate = lastDiv.data('report-date');
		var lastDivId = lastDiv.data('report-id');
		loadOldGroupOneAjax(output, ff, url, lastDiv, lastDivDate, lastDivId);
	}
}

function loadOldGroupOneAjax(output, ff, url, lastDiv, lastDivDate, lastDivId) {
		$.ajax({
			type: 'GET',
			url: url,
			contentType: "application/json",
			dataType: 'jsonp',
			data: {
				groupid: tgid,
				userid: uid,
				userReportFlag: ff,
				lastRepViewDate: lastDivDate,
				lastRepViewId: lastDivId
			},
			crossDomain: true,
			timeout: 10000,
			success: function(data, status) {
				if (!jQuery.isEmptyObject(data)) {
					$.each(data, function(i, item) {
						htmlReport(item);
						output.append(reportHtml);
					});
				} else {
					$("#spGroupOneB").text('ฟีดข่าวเก่าสุดแล้ว.').show().css("color", "green").fadeOut(3200);
					//output.empty();
				}
			},
			error: function() {
				output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!').show().css("color", "red").fadeOut(3200);
			}
		});
	}
	//////////////////////////////////////////////////////	

function selectThisGroup() {
	var Id = localStorage.userId;
	var tg = globalGId;
	var url = serviceURL + 'updateUserProfile.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			userid: Id,
			usergroup: tg
		},
		crossDomain: true,
		timeout: 10000,
		success: function(res) {
			if (res.success === true) {
				window.localStorage.userGroup = tg;
				gid = tg;
				checkGroup();
				loadUserGroup();
				//loadGroupFeed();
				window.history.back(); //navigator.app.backHistory();
				navigator.notification.alert("เลือกกลุ่มเรียบร้อยแล้ว.");
				regisThisDevice();
			} else {
				$("#spGroupOne").text("มีบางอย่างผิดพลาด").css("color", "red");
			}
		},
		error: function(e) {
			navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
		},
		complete: function(e) {
			console.log("complete");
		}
	});
	return false;
}
var crGrptitleState = false;
var crGrpcontentState = false;
var crGrpCityState = false;
//////////////////////////////////////////////////////////////////////////////
function createGroup() {
		var url = serviceURL + 'regisGroup.php';
		$("#crGrpSubmitBtn").addClass("ui-state-disabled");
		var cgname = $("#crGrpTitleInput").val();
		var cgcont = $("#crGrpContentInput").val();
		var cgcity = $("#crGrpCityInput").val();
		var cgd = moment().format('YYYY-MM-DD HH:mm:ss');
		loadingShow("#contentCreateGroup");
		if (validCreateGroup()) {
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					crgrpname: cgname,
					crgrpcontent: cgcont,
					crgrpcity: cgcity,
					crgrpdate: cgd
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (!jQuery.isEmptyObject(res)) {
						window.localStorage.userGroup = res.group_id;
						//globalGId = res.group_id;
						selectThisNewGroup();
						//window.localStorage.userId = res.user_id;
						//window.location.replace(some.html);
						//window.open("home.html", '_self');
						$("#crGrpTitleInput").text("");
						$("#crGrpContentInput").text("");
						$("#crGrpCityInput").text("");
						$("#spcrGrpName").text("");
						crGrptitleState = false;
						crGrpcontentState = false;
						crGrpCityState = false;
						validCreateGroup();
						checkGroup();
						//loadUserGroup();
					} else {
						navigator.notification.alert("การสร้างกลุ่มเกิดข้อผิดพลาด", function() {});
					}
					$("#crGrpSubmitBtn").removeClass("ui-state-disabled");
					loadingHide("#contentCreateGroup");
				},
				error: function(e) {
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
					$("#crGrpSubmitBtn").removeClass("ui-state-disabled");
					loadingHide("#contentCreateGroup");
				},
				complete: function(e) {
					console.log("message");
				}
			});
		} else {
			navigator.notification.alert("กรุณากรอก ชื่อกลุ่มที่จะสร้าง");
			$("#crGrpSubmitBtn").removeClass("ui-state-disabled");
			loadingHide("#contentRegis");
		}
		return false;
	}
	//////////////////////////////////////////////////////////////////////////////

function createGroupBindEvent() {
		$("#crGrpTitleInput").on('focusout', function() {
			if ($("#crGrpTitleInput").val()) {
				crGrptitleState = true;
				validCreateGroup();
				checkUsedGroup();
			} else {
				crGrptitleState = false;
				validCreateGroup();
			}
		}).on('keyup', function() {
			if ($("#crGrpTitleInput").val()) {
				crGrptitleState = true;
				validCreateGroup();
			} else {
				crGrptitleState = false;
				validCreateGroup();
			}
		});
		$("#crGrpContentInput").on('change', function() {
			if ($("#crGrpContentInput").val()) {
				crGrpcontentState = true;
				validCreateGroup();
			} else {
				crGrpcontentState = false;
				validCreateGroup();
			}
		});
		$("#crGrpCityInput").on('keyup', function() {
			if ($("#crGrpCityInput").val()) {
				crGrpCityState = true;
				validCreateGroup();
			} else {
				crGrpCityState = false;
				validCreateGroup();
			}
		});
		validCreateGroup();
	}
	//////////////////////////////////////////////////////////////////////////////

function validCreateGroup() {
		if (crGrptitleState !== false && crGrpcontentState !== false && crGrpCityState !== false) {
			$("#crGrpSubmitBtn").removeClass("ui-state-disabled");
			return true;
		} else {
			$("#crGrpSubmitBtn").addClass("ui-state-disabled");
			return false;
		}
	}
	//////////////////////////////////////////////////////////////////////////////

function checkUsedGroup() {
		var cgname = $("#crGrpTitleInput").val();
		var url = serviceURL + 'checkUsedGroup.php';
		if (cgname !== '') {
			$.ajax({
				type: 'GET',
				url: url,
				contentType: "application/json",
				dataType: 'jsonp',
				data: {
					groupname: cgname
				},
				crossDomain: true,
				timeout: 10000,
				success: function(res) {
					if (res.success === true) {
						crGrptitleState = false;
						validCreateGroup();
						$("#spcrGrpName").text(cgname + " ชื่อกลุ่มนี้มีผู้ใช้แล้ว").css("color", "red");
					} else {
						crGrptitleState = true;
						validCreateGroup();
						$("#spcrGrpName").text(cgname + " ชื่อกลุ่มนี้สามารถใช้ได้").css("color", "green");
					}
				},
				error: function(e) {
					crGrptitleState = false;
					validCreateGroup();
					navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
				},
				complete: function(e) {}
			});
		} else {
			crGrptitleState = false;
			validCreateGroup();
			$("#spcrGrpName").text("กรุณากรอก ชื่อกลุ่มที่จะสร้าง").css("color", "red");
		}
		return false;
	}
	//////////////////////////////////////////////////////	

function selectThisNewGroup() {
	var Id = localStorage.userId;
	var tg = window.localStorage.userGroup;
	var url = serviceURL + 'updateUserProfile.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			userid: Id,
			usergroup: tg
		},
		crossDomain: true,
		timeout: 10000,
		success: function(res) {
			if (res.success === true) {
				window.localStorage.userGroup = tg;
				gid = tg;
				loadUserGroup();
				//loadGroupFeed();
				//window.history.back();//navigator.app.backHistory();
				navigator.notification.alert("เลือกกลุ่มเรียบร้อยแล้ว.");
				regisThisDevice();
			} else {
				$("#spGroupOne").text("มีบางอย่างผิดพลาด").css("color", "red");
			}
		},
		error: function(e) {
			navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
		},
		complete: function(e) {
			console.log("complete");
		}
	});
	return false;
}
$(document).on("pagecreate", "#searchPage", function() {
	$("#searchAutocomplete").on("filterablebeforefilter", function(e, data) {
		var $ul = $(this),
			$input = $(data.input),
			value = $input.val(),
			html = "";
		var url = serviceURL + 'searchReport.php';
		$ul.html("");
		if (value && value.length > 0) {
			$ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
			$ul.listview("refresh");
			$.ajax({
				url: url,
				//dataType: "jsonp",
				crossDomain: true,
				data: {
					query: $input.val()
				}
			}).then(function(html /*response*/ ) {
				/* $.each( response, function ( i, val ) {
                    html += "<li>" + val + "</li>";
                });*/
				$ul.html(html);
				$ul.listview("refresh");
				$ul.trigger("updatelayout");
			});
		}
	});
});

function clearSearchFilter() {
	$('input[data-type="search"]').val("");
	$('input[data-type="search"]').trigger("keyup");
}
function loadOneReport(rpid) {
	clearCache(); //
	loadingShow("#contentOneReport");
	var repid = rpid;
	var output = $('#oneReportDive');
	output.empty();
	var url = serviceURL + 'loadOneReport.php';
	$.ajax({
		type: 'GET',
		url: url,
		contentType: "application/json",
		dataType: 'jsonp',
		data: {
			reportid: repid
		},
		crossDomain: true,
		timeout: 10000,
		success: function(data, status) {
			$.each(data, function(i, item) {
				htmlReport(item);
				output.append(reportHtml);
				loadingHide("#contentOneReport");
			});
		},
		error: function() {
			output.text('พบข้อผิดพลาดในการโหลดข้อมูล!!');
			loadingHide("#contentOneReport");
		}
	});
}

    var pushNotification;
    var php_addRegist = serviceURL + 'addDeviceRegis.php'; // path ไฟล์ 
    var notifyCount = window.localStorage.getItem("notifyCount");
    var count;

    function regisThisDevice() { //ฟังก์ชั่นทำงานเมื่อเครื่องพร้อม
    		var data_did = device.uuid; // เก็บค่า uid 
    		try { // เรียกใช้งาน plugin push
    			pushNotification = window.plugins.pushNotification;
    			//9//$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
    			if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
    				pushNotification.register(successHandler, errorHandler, { // ทำการลง register 
    					"senderID": "320077907247", // เปลี่ยนเป็นค่า project name จาก phonegap ตอนที่ 9
    					"ecb": "onNotification"
    				}); // required!
    			}
    		} catch (err) { // กรณีเกิดข้อผิดพลาด
    			txt = "There was an error on this page.\n\n";
    			txt += "Error description: " + err.message + "\n\n";
    			alert(txt);
    		}
    	}
    	// จัดการกับข้อ GCM notifications สำหรับ Android

    function onNotification(e) {
    		// แสดงสถานะ ใช้งานจริง ตรงนี่ิตัดออกได้ 
    		//28//$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
    		var u = window.localStorage.userId;
    		var grp = window.localStorage.userGroup;
    		switch (e.event) { // การทำงานกับเงื่อนไขเหตุการณ์ที่เกิดขึ้น
    			case 'registered': // มีมีการ registered
    				if (e.regid.length > 0) { // มีค่า regid
    					// ข้อความแสดงสถานะการทำงาน ใช้งานจริง ตรงนี่ิตัดออกได้ 
    					//34// $("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
    					// ทดสอบดูค่า regiid ใช้งานจริงปรับได้ตามต้องการ
    					//console.log("regID = " + e.regid);
    					// ส่งค่า regid และ uid ไปบันทึกไว้บน server
    					$.post(php_addRegist, {
    						did: device.uuid, // คล้าย id เครื่องเรา
    						regid: e.regid,
    						uid: u,
    						grpid: grp,
    						datetime: moment().format('YYYY-MM-DD HH:mm:ss')
    					}, function(data) {
    						console.log(data);
    						//alert(data); // ทำงานตามต้องการ ในที่นี้ทดสอบ ให้ alert ค่าที่ได้จากไฟล์ add_regist.php
    					});
    				}
    				break;
    			case 'message': // เมื่อได้รับข้อความ push
    				// ถ้าเราเปิด app อยู่ หมายถึง กำลังใช้งาน app จะให้ทำอย่างไร
    				if (e.foreground) {
    					// ใสคำสั่งส่วนนี้ตามต้องการ  ในตัวอย่าง เขาจะบอกแค่สถานะว่า เป็นการแจ้งแบบ inline
    					//54//$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
    					console.log("--INLINE NOTIFICATION--");
    					navigator.notification.beep(1);
    				} else { // กรณีอื่นๆ หรือก็คือ เมื่อมี push มา
    					if (e.coldstart) { // แล้วเรากดที่ ข้อความ push ด้านบน
    						// ก็จะเข้ามาทำงานในส่วนนี้ กำหนดตามต้องการ
    						//60//$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
    						console.log("--COLDSTART NOTIFICATION--");
    					} else {
    						// กรณีอื่นๆ เช่น ทำงานแบบ background
    						//63//$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
    						console.log("--BACKGROUND NOTIFICATION--");
    					}
    				}
    				// แสดงข้อความ e.payload.message คือค่าข้อความทีเราได้ เราสามารถส่งตัวแปร อื่นๆ ตามต้องการได้
    				// ส่วนนี้ทำงานเม่อได้รับข้อความ push
    				//69//$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
    				//localStorage.notifyCount += 1;
    				countNotify();
    				console.log("MESSAGE -> MSG: " + e.payload.message + e.payload.title);
    				//$('#spNotify').text(notifyCount);
    				break;
    			case 'error': // กรณี error
    				//$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
    				console.log("ERROR -> MSG: " + e.msg);
    				break;
    			default: // อื่นๆ 
    				//$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
    				console.log("EVENT -> Unknown, an event was received and we do not know what it is");
    				break;
    		}
    	}
    	// ฟังก์ชั่นเมื่อ process สำเร็จ  

    function successHandler(result) {
    		// เวลาใช้งานจริง บรทดัต่อจากนี้สามารถตัดออกได้ หรือใช้กำหนดค่าอื่นตามต้องการได้
    		//83//$("#app-status-ul").append('<li>success:'+ result +'</li>');
    		console.log("success: " + result);
    	}
    	// ฟังก์ชั่นเมื่อ process เกิดข้อผิดพลาด 

    function errorHandler(error) {
    	// เวลาใช้งานจริง บรทดัต่อจากนี้สามารถตัดออกได้ หรือใช้กำหนดค่าอื่นตามต้องการได้
    	//88//$("#app-status-ul").append('<li>error:'+ error +'</li>');
    	console.log("error: " + error);
    }

    function deleteThisDevice() {
    	var data_did = device.uuid;
    	var url = serviceURL + 'deleteDevice.php';
    	$.ajax({
    		type: 'GET',
    		url: url,
    		contentType: "application/json",
    		dataType: 'jsonp',
    		data: {
    			did: device.uuid
    		},
    		crossDomain: true,
    		timeout: 10000,
    		success: function(res) {
    			if (res.success === true) {
    				//window.localStorage.userRName = rn;
    				//loadThisUserReport();
    				//getEditUserDetail();
    				//$("#pMsgEditReport").text("แก้ไขข้อมูล เรียบร้อยแล้ว").css("color", "green").fadeOut(2000, function(){window.history.back();});
    				console.log("ลบข้อมูล เรียบร้อยแล้ว");
    			} else {
    				navigator.notification.alert("มีบางอย่างผิดพลาด");
    			}
    		},
    		error: function(e) {
    			navigator.notification.alert("ERROR กรุณาตรวจสอบการเชื่อมต่อ อินเตอร์เน็ต ");
    		},
    		complete: function(e) {
    			console.log("complete");
    		}
    	});
    }
	var refreshIntervalId = 0;

function showMap() {
	var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434); // Default to Hollywood, CA when no geolocation support
	if (navigator.geolocation) {
		function success(pos) {
			// Location found, show map with these coordinates
			refreshIntervalId = setInterval(function() {
				drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
			}, 300);
		}

		function fail(error) {
				refreshIntervalId = setInterval(function() {
					drawMap(defaultLatLng);
				}, 300);
				// Failed to find location, show default map
			}
			// Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
		navigator.geolocation.getCurrentPosition(success, fail, {
			maximumAge: 500000,
			enableHighAccuracy: true,
			timeout: 6000
		});
	} else {
		refreshIntervalId = setInterval(function() {
			drawMap(defaultLatLng);
		}, 300);
	}

	function drawMap(latlng) {
		clearInterval(refreshIntervalId);
		var myOptions = {
			zoom: 10,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
		// Add an overlay to the map of current lat/lng
		var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			title: "Greetings!"
		});
	}
}

function showThisMap(thisLat, thisLong) {
	// var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434);  // Default to Hollywood, CA when no geolocation support
	clearCache(); //
	var thisLatLng = new google.maps.LatLng(thisLat, thisLong);
	refreshIntervalId = setInterval(function() {
		drawMap(thisLatLng);
	}, 2000);

	function drawMap(latlng) {
		if (refreshIntervalId !== 0) {
			clearInterval(refreshIntervalId);
		}
		refreshIntervalId = 0;
		var myOptions = {
			zoom: 15,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
		// Add an overlay to the map of current lat/lng
		var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			title: "Greetings!"
		});
	}
}
function getFullImg(fullImgSrc) {
	var d = moment();
	//var fullImgSrc = "img/newyork.jpg";
	$('#imgFullImg').attr('src', serviceURL + "../img/reportPic/" + fullImgSrc + "?" + d.format());
	/*$('#imgPropic').attr('src', serviceURL + "../img/userprofileimage/" + localStorage.userImageUrl +"?"+d.format());
	serviceURL + "../img/reportPic/" + item.report_imgUrl + "?" + d.format()*/
}