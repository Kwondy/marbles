var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// User 모델의 스키마 정의
var userSchema = mongoose.Schema({
    // local strategy 패스포트용 로컬키
   
    name: String,
    email: {type:String, unique:true},
    password: String,
    
    // name: {type:String, required:[true,"Name is required!"]},
    // email : {type:String},
    // password : {type:String, required:[true,"Password is required!"]},
    
    social: {
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        username: String,
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String,
    },
    naver: {
        id : String,
        name : String,
        email: String,
        username: String
    },
    kakao: {
        id : String,
        name: String,
        email: String,
        username: String

    }

    }
});
// },{
//     toObject:{virtuals:true}
// });

// // virtuals // 2
// userSchema.virtual("passwordConfirmation")
// .get(function(){ return this._passwordConfirmation; })
// .set(function(value){ this._passwordConfirmation=value; });

// userSchema.virtual("originalPassword")
// .get(function(){ return this._originalPassword; })
// .set(function(value){ this._originalPassword=value; });

// userSchema.virtual("currentPassword")
// .get(function(){ return this._currentPassword; })
// .set(function(value){ this._currentPassword=value; });

// userSchema.virtual("newPassword")
// .get(function(){ return this._newPassword; })
// .set(function(value){ this._newPassword=value; });

// // password validation // 3
// userSchema.path("password").validate(function(v) {
//  var User = this; // 3-1

//  // create user // 3-3
//  if(User.isNew){ // 3-2
//   if(!User.passwordConfirmation){
//    User.invalidate("passwordConfirmation", "Password Confirmation is required!");
//   }
//   if(User.password !== User.passwordConfirmation) {
//    User.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
//   }
//  }

//  // update user // 3-4
//  if(!User.isNew){
//   if(!User.currentPassword){
//    User.invalidate("currentPassword", "Current Password is required!");
//   }
//   if(User.currentPassword && user.currentPassword != User.originalPassword){
//    User.invalidate("currentPassword", "Current Password is invalid!");
//   }
//   if(user.newPassword !== User.passwordConfirmation) {
//    user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
//   }
//  }
// });

//password를 암호화
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
//password의 유효성 검증
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);