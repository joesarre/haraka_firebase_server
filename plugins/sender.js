var Firebase = require("firebase");
var shared = require("./shared");
var outbound = require('./outbound');

var root = shared.root;

exports.hook_init_master = function(next, connection, params) {
	var plugin = this;

	function process(message) {
		plugin.loginfo("processing message");

		var to = shared.decodeFirebase(message.to);
		var from = shared.decodeFirebase(message.from);
		var date = message.date;
		var body = message.message;
		var subject = message.subject;

		var contents = [
		    "From: " + from,
		    "To: " + to,
		    "MIME-Version: 1.0",
		    "Content-type: text/plain; charset=us-ascii",
		    "Subject: " + subject,
		    "",
		    body,
		    ""].join("\n");

		var outnext = function (code, msg) {
		    switch (code) {
		        case DENY:  plugin.logerror("Sending mail failed: " + msg);
		                    break;
		        case OK:    plugin.loginfo("mail sent");
		                    break;
		        default:    plugin.logerror("Unrecognised return code from sending email: " + msg);
		    }
		};

		plugin.loginfo("Sending mail to " + to);
		outbound.send_email(from, to, contents, outnext);
	}

	function listenMessages() {
		plugin.loginfo("listening for messages");
		root.child("outbox").on("child_added", function(dataSnapshot){
			var messageRef = dataSnapshot.ref();
			var message = null;
			messageRef.transaction(function(m) {
				message = m;
				if(message) {
					return null;
				} else {
					return;
				}
			}, function(error, committed, snapshot, dummy) {
				if (error) throw error;
				if(committed) {
					process(message);
				}
				else {
					plugin.loginfo("Another worker beat me to the job.");
				}
			});

		}, function (error) {
			plugin.loginfo(error);
		});
	}

	shared.login(listenMessages);
	next();
}
