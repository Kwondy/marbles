var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// User 모델의 스키마 정의
var socialUserSchema = mongoose.Schema({
    // local strategy 패스포트용 로컬키
   

    
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
});

module.exports = mongoose.model('social', socialUserSchema);