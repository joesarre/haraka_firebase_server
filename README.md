*What is this?*

This is a setup of Haraka to allow it to receive emails and put them in firebase & to send emails from a queue in firebase.

Haraka (https://haraka.github.io/) is a library for NodeJS which handles SMTP.  It's pluggable and I've added a couple of basic plugins for sending and receiving to firebase.

98% of the code is just the Haraka library, the bits I've written are in /plugins/*, package.json and app.js.  I've also modified /config/host_list and /config/plugins - to inject the plugins at the right point in the SMTP processing flow.

.ebextensions is used to disable SMTP on the server.

It's listening for SMTP on port 2025.  Any emails it receives will go into firebase under /inbox.

It's also watching Firebase for messages added to /outbox.

To send, it's something like:
outboxRef.push({date:Firebase.ServerValue.TIMESTAMP, from: encodeFirebase("joe@example.com"), to: encodeFirebase("craig@example.com"), subject: "yo", message: "yo"})

encodeFirebase is defined in /plugins/shared.js

--------------------------------------------------------------------------------

*Limitations*

Messages from it end up in the spam folder a fair amount of the time.  I think there's something I need to do with RDNS, but that's as far as I've got.

--------------------------------------------------------------------------------

*Config*

 * Put in your firebase URL (/plugins/shared.js)
 * Put in your firebase secret (/plugins/shared.js)
 * Hostnames to accept mail for (/config/host_list)


The ROUTER_UID variable (currently "internal:message_router") is the user id of the router and so you need to give it permission to in firebase to access /outbox and /inbox.

--------------------------------------------------------------------------------

*Running locally*

You'll need an installation of visual studio so that there's a compiler on your path.

Install npm and node and then from the command line, run:

	npm install
	npm start

You can test locally with swaks and perl using something like:
	perl swaks.pl -h example.com -t joe@example.com -f joe@example.com -s localhost -p 2025
(On some machines I've had trouble with swaks making connections to the outside world)

--------------------------------------------------------------------------------

*How to deploy*

So far I've been deploying to AWS.  It's probably possible to get it running in Heroku too, but I haven't done it yet.

Using git and the "eb" command line tool (download links are here http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-reference-get-started.html)

	npm install
	git init
	git add .
	git commit -m "initial commit"
	eb init

eb init will ask for loads of options:

	Environment tier = Worker::SQS/HTTP::1.0
	Solution stack = 64bit Amazon Linux 2015.03 v1.3.1 running Node.js
	Environment type = LoadBalanced
	Create an RDS DB Instance? = Nope
	Attach an instance profile = create

Then run "eb start" and press "n".

Then wait for the environment to load.

Then run "eb push".

You'll then need to log on to AWS:
* open up port 2025 on the box
* use the loadbalancer to point :25 publically to :2025 on the box.  You'll need to change the healthcheck to a simple ping. 

--------------------------------------------------------------------------------

*To check it's running*

Go to the AWS Elasticbeanstalk console, click "get logs" and look for nodejs.log

You should see:
[PROTOCOL] [6F5D5614-902C-43AD-8028-D7CE7A6C834F] [core] S: 220 ip-172-31-10-147 ESMTP Haraka 2.5.0 ready

You can send a test mail with telnet or swaks and you should see the [DEBUG] and [NOTICE] messages scrolling past.  You can use the Amazon server address as the host on port 2025 or the loadbalancer address on port 25.
perl swaks.pl -h example.com -t joe@example.com -f joe@example.com -s ec2-1-2-3-4.ap-southeast-1.compute.amazonaws.com -p 2025

--------------------------------------------------------------------------------

*Making changes*

edit the file
git add .
git commit -m "blah blah commit message blah"
eb push