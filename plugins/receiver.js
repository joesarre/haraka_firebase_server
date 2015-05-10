// write_to_firebase

// documentation via: haraka -c D:\connec\haraka -h plugins/write_to_firebase

// Put your plugin code here
// type: `haraka -h Plugins` for documentation on how to create a plugin

// TODO: global variables
var shared = require("./shared");
var inboxRef = shared.root.child("inbox");

// TODO: handle array of recipients

exports.hook_data = function (next, connection, params) {    
    connection.transaction.parse_body = true;
    next();
}

exports.hook_queue = function (next, connection, params) {
    this.loginfo("hook_queue" + JSON.stringify({
        //connection: connection,
        params: params,
        body: connection.transaction.body ? Object.keys(connection.transaction.body) : null
        }));

    var bodyText;
    if (!connection.transaction.body) {
        bodyText = "";
    }
    else if (connection.transaction.body.children.length > 0) {
        bodyText = connection.transaction.body.children[0].bodytext;
    }
    else {
        bodyText = connection.transaction.body.bodytext;
    }
    inboxRef.push({
        date: Date.now(),
        to: shared.encodeFirebase(connection.transaction.rcpt_to[0].address()),
        from: shared.encodeFirebase(connection.transaction.mail_from.address()),
        message: bodyText,
        subject: connection.transaction.header.get("Subject")
        });
    return next(); 
}
