var express = require('express');
var router = express.Router();
var gravatar = require('gravatar');
var passport = require('passport');
var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose);
var User  = require("../models/user");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Hey'});
});

router.get('/login', function(req,res){
  res.render('login', { title: 'Login',
  message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect : '/', 
  failureRedirect : '/login', //로그인 실패시 redirect할 url주소
  failureFlash : true 
}));

router.get('/signup', function(req,res){
  res.render('signup', { title: 'Signup',
  message: req.flash('signupMessage')});
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect : '/profile', 
  failureRedirect : '/signup', //가입 실패시 redirect할 url주소
  failureFlash : true 
}));


router.get('/profile', isLoggedIn, function(req,res){
  res.render('profile', { title: 'Profile', user : req.user,
  avatar:gravatar.url(req.user.email , {s: '100', r: 'x', d: 'retro'}, true) });
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
      return next();
  } else {
      res.redirect('login');
  }
};

router.get('/admin', function (req, res, next) {
  if (user.email == "test@gmail.com"){
    res.redirect('admin');
  } else {
    return next();
  }
});


router.get('/logout', function(req,res){
  req.logout();

  res.redirect('/');
});

router.get('/email-verification/:URL', isLoggedIn, function(req, res){
  var url = req.params.URL;
  nev.confirmTempUser(url, function(err, user){
      console.log("confirmed user " + user);
      if(err) console.log(err);
      if (user) {
          nev.sendConfirmationEmail(user.email, function(err, info) {
              if (err) {
                  return res.status(404).send('ERROR: sending confirmation email FAILED');
              }
              res.send({
                  msg: 'CONFIRMED!',
                  info: info 
              });
             
          });
      } else {
          return res.status(404).send('ERROR: confirming temp user FAILED');
      }
  });


});

// Facebook routes
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {  
  successRedirect: '/profile',
  failureRedirect: '/',
}));


// Google routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {  
  successRedirect: '/profile',
  failureRedirect: '/',
}));


// naver routes
router.get('/auth/naver', passport.authenticate('naver', { scope: 'email' }));

router.get('/auth/naver/callback', passport.authenticate('naver', {  
  successRedirect: '/profile',
  failureRedirect: '/',
}));

// kakao routes
router.get('/auth/kakao', passport.authenticate('kakao'));

router.get('/oauth', passport.authenticate('kakao', {
  successRedirect: '/profile',
  failureRedirect: '/',
}));




// admin

router.get("/admin/user", function(req, res){
  User.find({})
  .sort({user:1})
  .exec(function(err, users){
   if(err) return res.json(err);
   res.render("admin_userlist", {users:users, title: 'userlist'});
  });
 });

 // adim_users_show
router.get("/admin/user/:id", function(req, res){
  User.findOne({_id:req.params.id}, function(err, user){
   if(err) return res.json(err);
   res.render("admin_user_show", {user:user, title: 'usershow'});
  });
 });

 router.delete("/admin/user/:id",isLoggedIn, function(req, res){
  User.remove({_id:req.params.id}, function(err){
   if(err) return res.json(err);
   res.redirect("/admin/user", {title:'userlist'});
  });
 });


module.exports = router;
