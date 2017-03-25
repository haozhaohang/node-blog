var express = require( 'express' );
var router = express.Router();
var User = require( '../models/User' );

// 统一返回格式
var responseData;

router.use( function( req, res, next ) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
} );

/*
    * 用户注册模块
*   注册逻辑
*   1.用户名不能为空
*   2.密码不能为为空
*   3.两次输入密码必须一致
*
*   1.用户名是否已经被注册
*       需要数据库查询
*/
router.post( '/user/register', function( req, res, next ) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    // 用户名的判断
    if ( username === '' ) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json( responseData );
        return;
    }

    // 密码不能为空
    if ( password === '' ) {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json( responseData );
        return;
    }

    // 两次密码不一致
    if ( password !== repassword ) {
        responseData.code = 3;
        responseData.message = '两次密码不一致';
        res.json( responseData );
        return;
    }

    // 用户名是否已经被注册，如果数据库中存在和我们要注册的用户名同名的数据，表示用户名已经被注册了
    User.findOne({
        username: username
    }).then( function( userInfo ) {
        // 表示数据库中有该数据
        if ( userInfo ) {
            responseData.code = 4;
            responseData.message = '用户已经被注册了';
            res.json( responseData );
            return;
        }
        var newUser = new User({
            username: username,
            password: password
        });
        return newUser.save();
    } ).then( function( newUserInfo ) {
        responseData.message = '注册成功';
        res.json( responseData );
    } )

} );

router.post( '/user/login', function( req, res, next ) {
    console.log('------------');
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    // 验证用户名或者密码不能为空
    if ( username === '' || password === '' ) {
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json( responseData );
        return;
    }
    // 查询数据库中是否存在用户名和密码相同的账号
    User.findOne({
        username: username,
        password: password
    }).then( function( userInfo ) {
        // 账号密码错误
        if ( !userInfo ) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json( responseData );
            return;
        }
        // 账号密码正确
        responseData.message = '登陆成功';
        responseData.userInfo = {
            username: userInfo.username,
            _id: userInfo._id
        };
        req.cookies.set( 'userInfo', JSON.stringify({
            username: userInfo.username,
            _id: userInfo._id})
        );
        return res.json( responseData );

    } )
} );

router.post( '/user/logout', function( req, res, next ) {
    req.cookies.set( 'userInfo', null );
    res.json( responseData );
} )

router.get( '/', function( req, res, next ) {
    console.log(req.userInfo);
    res.json( { userInfo: req.userInfo } );
} )

// router.post( '/test', function( req, res, next ) {
//     console.log(req.userInfo);
//     res.json( { test: 111 } );
// } )

module.exports = router;