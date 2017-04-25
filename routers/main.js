var express = require( 'express' );
var router = express.Router();

// router.get( '/', function( req, res, next ) {
//     res.send('111');
//
// } );

/*
* 首页
* */
router.get('/', function(req, res, next) {
    res.render('index');
});

module.exports = router;
