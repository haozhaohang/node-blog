/**
 * create by haozh 2016/12/21
 * 应用程序的启动（入口）文件
*/

// 加载express模块
var express = require( 'express' );
// 加载模板处理模块
// var swig = require( 'swig' );
// 加载数据库模块
var mongoose = require( 'mongoose' );
// 加载bodyparse模块,用来处理post提交过来的数据
var bodyParser = require( 'body-parser' );
// 加载cookies模块
var Cookies = require( 'cookies' );
// 创建app应用 => nodejs http.createServer();
var app = express();

var User = require( './models/User' );

// 设置静态文件托管
// 当用户访问的是以/public开始，那么直接返回对应__dirname + '/public'下的文件
app.use( '/public', express.static( __dirname + '/public' ) );

// 配置应用模板
// 定义当前应用所使用的模板引擎
// 第一个参数:模板引擎名称，同时也是模板文件的后缀；第二个参数表示用于解析处理模板内容的方法
// app.engine( 'html', swig.renderFile );
// 设置模板文件存放目录，第一个参数必须是views;第二个参数是目录地址
// app.set( 'views', './public' );
// 注册所使用的模板引擎,第一个参数必须是view engine,第二个参数和app.engine这个方法中定义的模板引擎的名称(第一个参数)是一致的
// app.set( 'view engine', 'html' );
// 在开发过程中，需要取消模板引擎的缓存
// swig.setDefaults({
// 	cache: false
// });

/**
 * 首页
 * req request
 * res responent
*/
// app.get( '/', function( req, res, next ) {
// 	res.send( '<h1>demo</h1>' );
// });

/**
 * 读取views目录下的指定文件，解析并返回客户端
 * 第一个参数: 表示模板的文件，相对于views目录 views/index.html
 * 第二个参数: 传递给模板使用的数据
*/
// 	res.render( 'index' );
// } )

// bodyparser设置
app.use( bodyParser.urlencoded({ extended: true }) );

// 设置cookies
app.use( function( req, res, next ) {
    req.cookies = new Cookies( req, res );
    req.userInfo = {};
    // 解析cookies信息
    if ( req.cookies.get( 'userInfo' ) ) {
        try {
            req.userInfo = JSON.parse( req.cookies.get( 'userInfo' ) );
            // 获取当前登录用户是否是管理员
            User.findById( req.userInfo._id ).then( function( userInfo ) {
                req.userInfo.isAdmin = Boolean( userInfo.isAdmin );
                next();
            } );
        } catch(e) {
            next();
        }
    } else {
        next();
    }
} );

/**
 * 根据不同的功能划分模块
*/
app.use( '/api', require( './routers/api' ) );
app.use( '/', require( './routers/main' ) );

// 监听http请求
mongoose.connect( 'mongodb://localhost:27018/blog', function( err ) {
	if ( err ) {
		console.log( '数据库连接失败' );
	} else {
		console.log( '数据库连接成功' );
		app.listen( 8888 );
	}
} );

console.log( 'listen 8888' );
