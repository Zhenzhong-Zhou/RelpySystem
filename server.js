const express = require("express");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;

// initial app
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({limit: "10mb", extend: false}));
app.use(bodyParser.json());

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect("mongodb://localhost:27017", {useNewUrlParser: true}, (error, client) => {
    let blog = client.db("blog");
    console.log("Connected to MongoDB....");
    app.get("/", (req, res) => {
        blog.collection("posts").find().sort({"_id": -1}).toArray((error, posts) => {
            res.render("user/home", {posts: posts});
        });
    });

    app.get("/admin/dashboard", (req, res) => {
        res.render("admin/dashboard");
    });

    app.get("/admin/posts", (req, res) => {
        res.render("admin/posts");
    });

    app.post("/do-post", (req, res) => {
        blog.collection("posts").insertOne(req.body, function(error, document) {
            console.log(error);
            res.redirect("/admin/posts");
        });
    });

    app.get("/posts/:id", (req, res) => {
        blog.collection("posts").findOne({"_id": ObjectId(req.params.id)}, (error, post) => {
            res.render("user/post", {post: post})
        })
    });

    app.post("/do-comment", (req, res) => {
        blog.collection("posts").updateOne({"_id": ObjectId(req.body.post_id)}, {
            $push: {
                "comments": {
                    username: req.body.username,
                    comment: req.body.comment
                }
            }, function(error, post) {
                res.send("comment successfully");
            }
        });
    });

    app.listen(3000, () => {
        console.log("Connected to Server......")
    });
});

