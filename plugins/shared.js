var FirebaseTokenGenerator = require("firebase-token-generator");
var Firebase = require("firebase");

var ROUTER_UID = "internal:message_router";
var root = new Firebase("https://YOURURL.firebaseio.com/");

function login(cont) {
	var tokenGenerator = new FirebaseTokenGenerator("YOUR_SECRET_HERE");
	var token = tokenGenerator.createToken({uid: ROUTER_UID});
	root.authWithCustomToken(token, function(error, authData) {
		if (error) {
	    	console.log("Login Failed!", error);
	  	} else {
		    console.log("Login Succeeded!", authData);
	  	}
		cont();
	});
}

function encodeFirebase(s){
    return encodeURIComponent(s).replace(/\./g, '%2E');
}

// TODO: less copy-pasting
function decodeFirebase(s){
    return decodeURIComponent(s.replace(/%2E/g, '.'));
}

module.exports = {
	login: login,
	root: root,
	encodeFirebase: encodeFirebase,
	decodeFirebase: decodeFirebase
}