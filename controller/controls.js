var db = require("../server.js");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
// requiring wikinews
var wikinews = require("../models/wikinews.js");
// requiring note
var notes = require("../models/note.js");
//set up controls to fine and grab the articles
var controller = {

        newarticles: function (res, cb) {
            cb();

        },
        pullarticles: function (req, res) {

                request('https://en.wikinews.org/wiki/Main_Page', function (error, response, html) {

                            // '$' becomes a cheerio's selector commands
                            var $ = cheerio.load(html);

                            $('h2.story-heading').each(function (i, element) {


                                        // Save an empty search object
                                        var search = {};

                                        search.title = $(element).children().text();
                                        search.link = $(element).children().attr("href");

                                        showArticle: function (req, res) {
                                                // Article.find({}, function(error, doc) {
                                                //     // Log any errors
                                                //     if (error) {
                                                //         console.log(error);
                                                //     }
                                                //     // Or send the doc to the browser as a json object
                                                //     else {
                                                //         res.json(doc);
                                                //     }
                                                // });

                                                wikinews.find({})
                                                    // ..and populate all of the notes similiar with it
                                                    .populate("note")
                                                    // now, execute our query
                                                    .exec(function (error, doc) {
                                                        // Log any errors
                                                        if (error) {
                                                            console.log(error);
                                                        }
                                                        // Otherwise, send the doc to the browser as a json object
                                                        else {
                                                            // console.log(doc);
                                                            var searches = {
                                                                    article: doc
                                                                }
                                                                //res.json(doc);
                                                            res.render("index", searches);
                                                        }
                                                    });



                                            },

                                            matchingNote: function (req, res) {
                                                // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
                                                wikinews.findOne({
                                                        "_id": req.params.id
                                                    })
                                                    // ..and populate all of the notes similiar with it
                                                    .populate("note")
                                                    // now, execute our query
                                                    .exec(function (error, doc) {
                                                        // Log any errors
                                                        if (error) {
                                                            console.log(error);
                                                        }
                                                        // Otherwise, send the doc to the browser as a json object
                                                        else {
                                                            res.json(doc);
                                                        }
                                                    });

                                            },
//create add note function
                                            addNote: function (req, res) {
                                                console.log("inside add note");
                                                console.log(req.body);
                                                // Create a new note and pass the req.body to the search
                                                var newNote = new Note(req.body);

                                                // And save the new note the db
                                                newNote.save(function (error, doc) {
                                                    // Log any errors
                                                    if (error) {
                                                        console.log(error);
                                                    }
                                                    // Otherwise
                                                    else {
                                                        // Use the article id to find and update it's note

                                                        wikinews.findOneAndUpdate({
                                                            "_id": req.params.id
                                                        }, {
                                                            $push: {
                                                                "note": doc._id
                                                            }
                                                        }, function (err, newdoc) {
                                                            // Send any errors to the browser
                                                            if (err) {
                                                                res.send(err);
                                                            }
                                                            // Or send the newdoc to the browser
                                                            else {
                                                                res.redirect("/wikinews");
                                                            }
                                                        });
                                                    }
                                                });

                                            },
//create delete note function
                                            deleteNote: function (req, res) {
                                                console.log("remove");
                                                console.log(req.body.noteId)
                                                Note.remove({
                                                    _id: req.params.id
                                                }, function (err) {
                                                    if (!err) {
                                                        res.redirect("/wikinews");
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });


                                            },
//create save article function
                                            saveArticle: function (req, res) {
                                                console.log("inside save")
                                                var search = new wikinews(req.body);
                                                wikinews.findOne({
                                                    "title": req.body.title
                                                }, function (error, data) {
                                                    // Log any errors
                                                    if (error) {
                                                        console.log(error);
                                                    }
                                                    // Or send the doc to the browser as a json object
                                                    else if (data == null) {

                                                        console.log("inside null");


                                                        // Now, save that search to the db
                                                        search.save(function (err, doc) {
                                                            console.log("inside save");
                                                            // Log any errors
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            // Or log the doc
                                                            else {
                                                                res.redirect("/wikinews");

                                                            }
                                                        });

                                                    } else {
                                                        res.redirect("/wikinews");
                                                    }
                                                });
                                            },
//create delete article function
                                            deleteArticle: function (req, res) {
                                                console.log("remove");
                                                wikinews.remove({
                                                    _id: req.params.id
                                                }, function (err) {
                                                    if (!err) {
                                                        res.redirect("/wikinews");
                                                    } else {
                                                        console.log(err);
                                                    }
                                                });


                                            },

                                    }

                                    module.exports = mainController;