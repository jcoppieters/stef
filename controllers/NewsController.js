//
// Johan Coppieters - apr 2014 - website StefDekien started from jsconf.be
//
//
console.log("loading " + module.id);

var cody = require("cody/index.js");

/*
Form:
 insert into atoms values (98,88,6,'Anekdote','{"name":"Anekdote","labels":{"nl":"Anekdote"},"generator":2,"options":{"required":false,"cols":54,"rows":7},"reader":1}','',now(), now());

| 88 |      3 |         5 | Registreer                | {"name":"Registreer","labels":{"nl":"Wij komen !"},"generator":1,"options":{},"reader":1}                               | NULL      | 2015-03-23 09:40:40 | 2015-03-31 17:00:00 |
| 89 |     88 |         5 | name                      | {"name":"name","labels":{"nl":"Namen"},"generator":1,"options":{"required":true},"reader":1}                            | ---       | 2015-03-23 09:40:46 | 2016-04-05 17:18:29 |
| 91 |     88 |         5 | Email                     | {"name":"Email","labels":{"nl":"E-mail"},"generator":1,"options":{"required":true,"email":true},"reader":2}             | ---       | 2015-03-23 09:41:51 | 2015-03-31 17:16:45 |
| 97 |     88 |         5 | Aantal                    | {"name":"Aantal","labels":{"nl":"We komen met"},"generator":0,"options":{"required":true,"number":true},"reader":7}     | ---       | 2015-03-23 10:08:43 | 2016-04-05 17:26:15 |
| 98 |     88 |         6 | Anekdote                  | {"name":"Anekdote","labels":{"nl":"Anekdote"},"generator":2,"options":{"required":false,"cols":54,"rows":7},"reader":1} |           | 2024-04-14 10:50:42 | 2024-04-14 10:50:42 |

*/

/*
create table wall(
 id int(11) not null unique key auto_increment,
 at datetime,
 note varchar(1024),
 kind char(1) default 'R'
);

 */
function NewsController(context) {
  console.log("Stef - NewsController");
	// init inherited controller
	cody.Controller.call(this, context);
}

// get us a prototype object
NewsController.prototype = Object.create( cody.Controller.prototype );

// export our constructor
module.exports = NewsController;


// we get this function whenever Cody thinks we're responsible for handling the http request
NewsController.prototype.doRequest = function( finish ) {
  var self = this;
  var topic = self.context.page.link;

  if (self.isRequest("thanks")) {
    self.feedBack(true, "Dank je.<br>Je reactie (en email adres) is enkel zichtbaar voor Katrien.");
    self.getList(finish);

  } else if (self.isRequest("delete")) {
    self.query("delete from wall where id = ?", [this.getParam("id", 0)], function(err, result) {
      self.nextRequest(err, "list", finish);
    });

  } else if ((self.isRequest("Vertel")) || (self.isRequest("Reactie"))) {
    // get our 2 main parameters   +   Q = vertel or question -- R = reaction
    var kind = (this.isRequest("Vertel")) ? "Q" : "R";
    var note = this.getParam("note", "");
    var email = this.getParam("email", "");

    self.query("insert into wall (at, note, kind, topic, email) values (now(), ?, ?, ?, ?)", [note, kind, topic, email], function(err, result) {
       self.nextRequest(err, (kind === "R") ? "thanks" : "list", finish);
    });

  } else {
    self.getList(finish);

  }
};


NewsController.prototype.getList = function( finish ) {
  var self = this;

  // var kind = (self.getLoginLevel() > 0) ? "'Q','R'" : "'Q'";

  self.query("select id, note, at, kind, email from wall where topic = ? order by at desc limit 3000", [self.context.page.link], function(err, results) {
    if (err) self.feedBack(false, err);
    console.log("got " + results.length + " Wall results");
    self.context.wallList = results;
    console.log("message: " + self.context.message);
    finish();
  });
};
