var settings = require('./settings');

var app = settings.app;

// routes
require("./routes")(app);
require("./routes/message")(app);
require("./routes/auth")(app);

app.listen(settings.options.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
