module.exports = function(noodle, app) {
  app.get("/", function(req, res) {
    res.render('index', { title: 'Noodle Talk' });
  });
};
