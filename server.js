const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.set('useCreateIndex', true);

mongoose.connect("mongodb://localhost:27017/pathokDB", {useUnifiedTopology: true, useNewUrlParser: true});

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});
const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    }
});
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

var User = mongoose.model('User', UserSchema);
const Review = mongoose.model("Review", reviewSchema);
const Message = mongoose.model("Message", contactSchema);
module.exports = User;


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));

let messages = [];
let out_of_the_maze_reviews = [];
let who_moved_my_cheese_reviews = [];
let eat_that_frog_reviews = [];
let the_4_hour_work_week_reviews = [];
let the_alchemist_reviews = [];
let the_subtle_art_of_not_giving_a_fck_reviews = [];

app.get('/', function (req, res) {
    res.render("index", {styles: ['styles.css', 'navbar_and_footer.css']});
});

app.get("/signin", function (req,res) {
   res.render("signIn", {styles: ['signIn.css', 'navbar_and_footer.css']});
});
app.post("/signIn", function (req, res, next) {
    if (req.body.inputEmail && req.body.inputPassword){
        User.authenticate(req.body.inputEmail, req.body.inputPassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                return res.redirect('/home');
            }
        });
    }
});

app.get("/signup", function (req,res) {
    res.render("signUp", {styles: ['signIn.css', 'navbar_and_footer.css']});
});
app.post("/signup", function (req, res) {
    if (req.body.user_email &&
        req.body.user_name &&
        req.body.user_password &&
        req.body.user_conf_password &&
        req.body.user_password == req.body.user_conf_password) {
        var userData = {
            email: req.body.user_email,
            username: req.body.user_name,
            password: req.body.user_password,
        };
        User.create(userData, function (err, user) {
            if (err) {
                return next(err)
            } else {
                return res.redirect('/home');
            }
        });
    }else{
        res.send("<h1>Passswords didn't Match!</h1>");
    }
});

app.get('/home', function (req, res) {
   res.render("home", {styles: ['home.css', 'navbar_and_footer.css']});
});
app.get('/non-fiction', function (req, res) {
   res.render("non-fiction", {styles: ['home.css', 'navbar_and_footer.css']})
});
app.get('/biography', function (req, res) {
    res.render("biography", {styles: ['home.css', 'navbar_and_footer.css']})
});
app.get('/about', function (req, res) {
   res.render("about", {styles: ['styles.css', 'about.css','navbar_and_footer.css']})
});

app.get('/contact', function (req, res) {
    res.render("contact", {styles: ['styles.css', 'signIn.css','navbar_and_footer.css']})
});
app.post('/contact', function (req, res) {
    const message = new Message({
        name: req.body.userName,
        email: req.body.userEmail,
        message: req.body.userMessage
    });
    message.save();
    res.send("<h1>Message Succesfully Sent!</h1>")

});

app.get("/out-of-the-maze", function (req, res) {
   res.render("out-of-the-maze", {
       styles: ['single_book.css','navbar_and_footer.css'],
       reviews: out_of_the_maze_reviews});
});
app.post("/out-of-the-maze", function (req, res) {
   const review = {
       name: req.body.user_name,
       email: req.body.user_email,
       review: req.body.user_review
   };
    out_of_the_maze_reviews.push(review);
    res.redirect("/out-of-the-maze");
});

app.get("/who-moved-my-cheese", function (req, res) {
    res.render("who-moved-my-cheese", {
        styles: ['single_book.css','navbar_and_footer.css'],
        reviews: who_moved_my_cheese_reviews});
});
app.post("/who-moved-my-cheese", function (req, res) {
    const review = {
        name: req.body.user_name,
        email: req.body.user_email,
        review: req.body.user_review
    };
    who_moved_my_cheese_reviews.push(review);
    res.redirect("/who-moved-my-cheese");
});

app.get("/eat-that-frog", function (req, res) {
    res.render("eat-that-frog", {
        styles: ['single_book.css','navbar_and_footer.css'],
        reviews: eat_that_frog_reviews});
});
app.post("/eat-that-frog", function (req, res) {
    const review = {
        name: req.body.user_name,
        email: req.body.user_email,
        review: req.body.user_review
    };
    eat_that_frog_reviews.push(review);
    res.redirect("/eat-that-frog");
});

app.get("/the-subtle-art-of-not-giving-a-fck", function (req, res) {
    res.render("the-subtle-art-of-not-giving-a-fck", {
        styles: ['single_book.css','navbar_and_footer.css'],
        reviews: the_subtle_art_of_not_giving_a_fck_reviews});
});
app.post("/the-subtle-art-of-not-giving-a-fck", function (req, res) {
    const review = {
        name: req.body.user_name,
        email: req.body.user_email,
        review: req.body.user_review
    };
    the_subtle_art_of_not_giving_a_fck_reviews.push(review);
    res.redirect("/the-subtle-art-of-not-giving-a-fck");
});

app.get("/the-4-hour-work-week", function (req, res) {
    res.render("the-4-hour-work-week", {
        styles: ['single_book.css','navbar_and_footer.css'],
        reviews: the_4_hour_work_week_reviews});
});
app.post("/the-4-hour-work-week", function (req, res) {
    const review = {
        name: req.body.user_name,
        email: req.body.user_email,
        review: req.body.user_review
    };
    the_4_hour_work_week_reviews.push(review);
    res.redirect("/the-4-hour-work-week");
});

app.get("/the-alchemist", function (req, res) {
    res.render("the-alchemist", {
        styles: ['single_book.css','navbar_and_footer.css'],
        reviews: the_alchemist_reviews});
});
app.post("/the-alchemist", function (req, res) {
    const review = {
        name: req.body.user_name,
        email: req.body.user_email,
        review: req.body.user_review
    };
    the_alchemist_reviews.push(review);
    res.redirect("/the-alchemist");
});

app.listen(3000, function () {
    console.log("Server started at port: 3000");
});