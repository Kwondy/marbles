// passport 모듈 로드
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;  
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var NaverStrategy = require('passport-naver').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;  
// user 모델 가져오기
var User = require('../models/user');
var configAuth = require('./auth');  

module.exports = function(passport, nev) {
    // passport 초기화 설정
    // 세션을 위해 user 직렬화
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    // user 역직렬화
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // local strategy 사용
    passport.use('local-login', new LocalStrategy({
        // 사용자명과 패스워드의 기본값을'email'과 'password'로 변경
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) { 
        if (email)
        // 소문자로 변환
        email = email.toLowerCase();
        // 비동기로 처리
        process.nextTick(function(){
            User.findOne({ 'email' : email }, function(err, user) {
                // 에러 발생 시
                if (err)
                    return done(err);
                // 에러 체크한 후 메시지 가져오기
                if (!user)
                    return done(null, false, req.flash('loginMessage', '사용자를 찾을 수 없습니다.'));
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', '비밀번호가 다릅니다.')); 
                // 모든 것이 문제없다면 user 가져오기
                else
                    return done(null, user);
            });
        });
    }));
    // local strategy 등록

    passport.use('local-signup', new LocalStrategy({
        // 사용자명과 패스워드의 기본값을 'email'과 'password'로 변경
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        if (email)
        // 소문자로 변환
        email = email.toLowerCase();
        // 비동기로 처리
        process.nextTick(function(){
            // user가 아직 로그인하지 않았다면
            if (!req.user) {
                User.findOne({ 'local.email' : email }, function(err, user) {
                // 에러 발생 시    
                if (err) 
                    return done(err);
                // 이메일 중복 검사
                if (user) {
                    return done(null, false, req.flash('signupMessage', '이메일이 존재합니다.'));
                } else {
                    // user 생성
                    var newUser = new User();
                    // req.body로부터 사용자명 가져오기
                    newUser.name = req.body.name;
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    // 데이터 저장 
                    newUser.save(function(err) {
                        if (err)
                        throw err;
                        return done(null, newUser);
                    });
                }
            });
            
            } else {
                return done(null, req.user);
            }
        });
        
    }));
    
    // email 검증

//     passport.use('local-signup', new LocalStrategy({
//         usernameField : 'email',
//         passwordField : 'password',
//         passReqToCallback : true
//     },
//     function(req, email, password, done){
//         var newUser = new User();
//         newUser.email=email;
//         newUser.password = newUser.generateHash(password);
//         newUser.name=req.body.name;
//         nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser){
//             if(err) console.error(err);
//             if(existingPersistentUser){
//                 console.log('You have already signed up and confirmed your account. Did you forget your password?');
//                 return done(null);
//             }
//             if(newTempUser){
//                 var URL = newTempUser[nev.options.URLFieldName];
//                 nev.sendVerificationEmail(email, URL, function(err, info){
//                     if(err) console.error(err);
//                     console.log('An email has been sent to you. Please check it to verify your account.');
//                     return done(null);
//                 })
//             } else {
//                 console.log('You have already signed up. Please check your email to verify your account.');
//                 return done(null);
//             }
//         });
//     })
// );

// facebook 
passport.use(new FacebookStrategy({  
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'email', 'first_name', 'last_name'],
  },
  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'social.facebook.id': profile.id }, function(err, user) {
        if (err)
          return done(err);
        if (user) {
          return done(null, user);
        } else {
          var newUser = new User();
          newUser.social.facebook.id = profile.id;
          newUser.social.facebook.token = token;
          newUser.social.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.social.facebook.email = (profile.emails[0].value || '').toLowerCase();
        //   newUser.password = token;
        //   newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
        //   newUser.email = (profile.emails[0].value || '').toLowerCase();


          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));

  // google 
  passport.use(new GoogleStrategy({  
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
  },
    function(token, refreshToken, profile, done) {
      process.nextTick(function() {
        User.findOne({ 'social.google.id': profile.id }, function(err, user) {
          if (err)
            return done(err);
          if (user) {
            return done(null, user);
          } else {
            var newUser = new User();
            newUser.social.google.id = profile.id;
            newUser.social.google.token = token;
            newUser.social.google.name = profile.displayName;
            newUser.social.google.email = profile.emails[0].value;
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      });
    }));

    // naver
    passport.use(new NaverStrategy({
        clientID: configAuth.naverAuth.clientID,
        clientSecret: configAuth.naverAuth.clientSecret,
        callbackURL: configAuth.naverAuth.callbackURL
      },
      
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
          User.findOne({ 'social.naver.id': profile.id }, function(err, user) {
            if (err)
              return done(err);
            if (user) {
              return done(null, user);
            } else {
              var newUser = new User();
              newUser.social.naver.id = profile.id;
              newUser.social.naver.name = profile.displayName,
              newUser.social.naver.email = profile.emails[0].value,
              newUser.social.naver.username = profile.displayName,
    
              newUser.save(function(err) {
                if (err)
                  throw err;
                return done(null, newUser);
              });
            }
          });
        });
    }));

    // kakao
    passport.use(new KakaoStrategy({
        clientID: configAuth.kakaoAuth.clientID,
        callbackURL: configAuth.kakaoAuth.callbackURL
      },
     
      function(accessToken, refreshToken, profile, done){
        User.findOne({
            'social.kakao.id' : profile.id
        }, function(err, user){
            if(err){
                return done(err);
            }
            if(!user){
                var newUser = new User();
                newUser.social.kakao.id = profile.id;
                newUser.social.kakao.name = profile.username,
                newUser.social.kakao.email = profile.id;
                newUser.social.kakao.username = profile.displayName;
                // newUser.password = profile.id;
                // newUser.name = profile.username,
                // newUser.email = profile.id;
        

                  newUser.save(function(err){
                    if(err){
                        console.log(err);
                    }
                    return done(err, user);
                });
            }else{
                return done(err, user);
            }
        });
    }
));


};