require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var logger = require('morgan');
const ejs = require("ejs");
const _ = require('lodash');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


var app = express();

mongoose.connect("mongodb://localhost:27017/blog2", {useNewUrlParser: true});
//mongoose.set("useCreateIndex", true);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    session: false //added to not store cookie
  }));

  
  app.use(passport.initialize());
  app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static("public"));



app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));



const userSchema = new mongoose.Schema ({
    email: String,
    password: String,
    googleId: String,
    secret: String
  });
  
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);
  
  const User = new mongoose.model("User", userSchema);
  
  passport.use(User.createStrategy());
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
  passport.use(new GoogleStrategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
  
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ));



//blog schema
const postSchema = {
    title: String,
    content: String,
    username: String,
    createdAt: {
      type: Date,
      default: new Date()
    }
  };
  


  const Post = mongoose.model("Post", postSchema); //Blog Model
  


  /*
  
    var perPage = 3;
      var page = req.params.page || 1;
  
    Post.find({})
             .skip((perPage * page) - perPage)
             .limit(perPage).exec(function(err,posts){
                  if(err) throw err;
            Post.countDocuments({}).exec((err,count)=>{          
            res.render('home', { startingContent: homeStartingContent,
                        //posts: posts,        
                        posts: posts,
                        current: page,
                        pages: Math.ceil(count / perPage) });
    
  });
    });
    
  });

  app.get('/:page', function(req, res, next) {
    var perPage = 3;
      var page = req.params.page || 1;
  
    Post.find({})
             .skip((perPage * page) - perPage)
             .limit(perPage).exec(function(err,posts){
                  if(err) throw err;
            Post.countDocuments({}).exec((err,count)=>{          
    res.render('home', { startingContent: homeStartingContent,
                    //posts: posts,
                    posts: posts,
                    current: page,
                    pages: Math.ceil(count / perPage) });
    
  });
    });
    
  });
*/

  
  

app.get('/', function(req, res) {
    let currentPage = req.query.page || 1;
    let perPage = 4; //restart the server when change is made
    let totalItems;
    const lastPage = Math.ceil(totalItems / perPage);

    Post.find()
        .countDocuments()
         .then(count => {
            totalItems = count;
            Post.find()
              .skip((currentPage - 1) * perPage)
              .limit(perPage)
              .then(posts => {
                  res.render("home", {
                    startingContent: homeStartingContent,
                    posts: posts,
                    totalItems: totalItems,
                    lastPage: lastPage,
                    currentPage: currentPage
                  });
              });

            });
     });
        //Post.find({}, function(err, posts) {
    
    //res.render("home", { startingContent: homeStartingContent, 
   //                       posts: posts
      //});


      app.get("/auth/google",
      passport.authenticate('google', { scope: ["profile"] })
    );
    
    app.get("/auth/google/secrets",
      passport.authenticate('google', { failureRedirect: "/login" }),
      function(req, res) {
        // Successful authentication, redirect to admin page.
        res.redirect("/admin");
      });
    
    app.get("/login", function(req, res){
      res.render("login");
    });

  
    

      app.get("/admin", function(req, res){
        //res.set('Cache-Control', 'no-store'); //not needed
        if (req.isAuthenticated()){
          res.render("admin"); //submit before
        } else {
          res.redirect("/login");
        }
      });

      

app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });


  app
    .route('/logout')
    .get((req, res) => {
          req.logout(function(err) {
               if (err) { return next(err); }
           res.redirect('/');
      });
  });

  /*
      app.post("/submit", function(req, res){
        const submittedSecret = req.body.secret;
      
      //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
        // console.log(req.user.id);
      
        User.findById(req.user.id, function(err, foundUser){
          if (err) {
            console.log(err);
          } else {
            if (foundUser) {
              foundUser.secret = submittedSecret;
              foundUser.save(function(){
                res.redirect("/admin");
              });
            }
          }
        });
      });
*/
  
  app.get("/about", function(req, res) {
    res.render("about", { abContent: aboutContent}); //render home page, pass KEY which is startingContent in home.ejs  (KEY VALUE)
  });
  
  app.get("/contact", function(req, res) {
    res.render("contact", { conContent: contactContent}); //render home page, pass KEY which is startingContent in home.ejs  (KEY VALUE)
  });
  
  app.get("/compose", function(req, res) { //make compose page authenticated for blog usage
    if (req.isAuthenticated()){
        res.render("compose");
      } else {
        res.redirect("/login");
      }
  });
  
  app.post("/compose", function(req, res) {
    
    
    //const mycontent = tinymce.get("myTextarea").setContent({ format: "text" });
    
    //create JS object
    const post = new Post({
        
      title: _.lowerCase(req.body.postTitle),
      content: req.body.postBody,
      //content: tinymce.get("mytextarea").getContent({ format: "text" }).req.body.postBody,
      username: _.lowerCase(req.body.postUsername)
    });
  
    post.save(function(err) {
    //post.save();
    //posts.push(post);
      if(!err) {
    res.redirect("/"); //send user back to home route
      }
  });
  });
  

  app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/admin");
        });
      }
    });
  
  });
  
  app.get("/posts/:postId", function(req, res) { //dynamic site with Node and Express
    
    //const requestedPostId = _.lowerCase(req.params.postId);
    const requestedPostId = req.params.postId;
    
    

    Post.findOne({_id: requestedPostId}, function(err, post){
        

        res.render("post", {
        title: post.title,
        content: post.content,
        //content: tinymce.get("mytextarea").getContent({ format: "text" }).post.content,
        username: post.username,
        createdAt: post.createdAt
      });
    }); 
   
  });



//app.use('/index', indexRouter);
//app.use('/users', usersRouter);



//module.exports = app;

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });