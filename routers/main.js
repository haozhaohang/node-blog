var express = require( 'express' );
var router = express.Router();

/*
* 首页
* */
router.use(function(req, res, next) {
    res.render('index');
});

module.exports = router;
