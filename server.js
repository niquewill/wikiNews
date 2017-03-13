// initialize express
var express = require('express');
var app = express();

//scrapers
var request = require('request'); 
var cheerio = require('cheerio');
var methodOverride = require('method-override');
var exphbs = require('express-handlebars');

//body parser and morgan
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

//mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_70f85ms8:1an1qbou71vtnakpon11g0n809@ds129260.mlab.com:29260/heroku_70f85ms8');
var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

//models
var Note = require('./models/note.js');
var Nyt = require('./models/wikinews.js');


// Routes
app.use(express.static(path.join(__dirname, 'public')));
var exphbs  = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//home with handlebars
app.get('/', function (req, res) {
    res.render('home');
});

app.get('/scrape', function(req, res) {
	var weburl = 'https://en.wikinews.org/wiki/Category:North_America';
	request(weburl, function(error, response, html) {
	  	var $ = cheerio.load(html);
	    var headline = [];
	    var summary = [];
	    var byline = [];
	    var date = [];
	    $('h2.headline').each(function(i, element) {
	    	var thisHeadline = $(this).text();
	    	headline.push(thisHeadline);
	    });
	    $('p.summary').each(function(i, element) {
	    	var thisSummary = $(this).text();
	    	summary.push(thisSummary);
	    });
	    $('p.byline').each(function(i, element) {
	    	var thisByline = $(this).text();
	    	byline.push(thisByline);
	    });
	    $('time.dateline').each(function(i, element) {
	    	var thisDate = $(this).text();
	    	date.push(thisDate);
	    });

	    for (i=0; i<headline.length; i++){
	    	var news = {};
			news.title = headline[i];
			news.summary = summary[i];
			news.byline = byline[i];
			news.date = date[i];
			var search = new wikinews (result);

			search.save(function(err, doc) {
			  if (err) {
			    console.log(err);
			  } 
			  else {
			    console.log(doc);
			  }
			});
	    }
	});
  res.send("Scrape Complete");
});

app.get('/wikinews', function(req, res){
	wikinews.find({}, function(err, doc){
		if (err){
			console.log(err);
		} 
		else {
			res.json(doc);
		}
	});
});

app.get('/wikinews/:id', function(req, res){
	wikinews.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		}
		else {
			res.json(doc);
		}
	});
});

app.post('/wikinews/:id', function(req, res){
	var newNote = new Note(req.body);
	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} 
		else {
			wikinews.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});
		}
	});
});

app.listen(3000, function() {
  console.log('App running on port 3000!');
});