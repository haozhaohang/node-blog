var express = require('express');
// 加载图片上传模块
var multiparty = require('multiparty');
var router = express.Router();
var User = require('../models/User');
var Label = require('../models/Label');
var Content = require('../models/Contents');

// 统一返回格式
var responseData;

router.use(function(req, res, next) {
    responseData = {
        data: [],
        error: 0,
        message: 'success'
    };
    next();
});


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
router.post('/user/register', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    // 用户名的判断
    if (username === '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    // 密码不能为空
    if (password === '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    // 两次密码不一致
    if (password !== repassword) {
        responseData.code = 3;
        responseData.message = '两次密码不一致';
        res.json(responseData);
        return;
    }

    // 用户名是否已经被注册，如果数据库中存在和我们要注册的用户名同名的数据，表示用户名已经被注册了
    User.findOne({
        username: username
    }).then(function(userInfo) {
        // 表示数据库中有该数据
        if (userInfo) {
            responseData.code = 4;
            responseData.message = '用户已经被注册了';
            res.json(responseData);
            return;
        }
        var newUser = new User({
            username: username,
            password: password
        });
        return newUser.save();
    }).then(function(newUserInfo) {
        responseData.message = '注册成功';
        res.json(responseData);
    })

});

router.post('/user/login', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    // 验证用户名或者密码不能为空
    if (username === '' || password === '') {
        responseData.code = 1;
        responseData.message = '用户名或密码不能为空';
        res.json(responseData);
        return;
    }
    // 查询数据库中是否存在用户名和密码相同的账号
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo) {
        // 账号密码错误
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        // 账号密码正确
        responseData.message = '登陆成功';
        responseData.userInfo = {
            username: userInfo.username,
            _id: userInfo._id
        };
        req.cookies.set('userInfo', JSON.stringify({
            username: userInfo.username,
            _id: userInfo._id
        }));
        return res.json(responseData);

    })
});

router.post('/user/logout', function(req, res, next) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
})


/*
 * 用户管理
 * */
router.get('/user', function(req, res) {
    const { pageSize = 10, pageIndex = 1, username } = req.query;
    const iPageSize = Number(pageSize);
    const iPageIndex = Number(pageIndex);
    const limit = iPageSize;
    const skip = (iPageIndex - 1) * limit;
    const reg = new RegExp(username, 'gi');

    User.count({ username: { $regex: reg } }).then(function(count) {
        User.find({ username: { $regex: reg } }).limit(limit).skip(skip).then(function(users) {
            responseData.data = {
                pageSize: iPageSize,
                pageIndex: iPageIndex,
                list: users,
                total: count,
            };
            res.json(responseData);
        });
    });
});

/**
 * 用户删除
 * @type {[type]}
 */
router.post('/user/del', function(req, res) {
    const { id } = req.body;

    User.remove({
        _id: id
    }).then(function() {
        res.json(responseData);
    });
})

/**
 * 用户添加
 * @type {[type]}
 */

router.post('/user/add', function(req, res) {
    const { username, password, isAdmin } = req.body;

    User.findOne({
        username: username
    }).then(function(userInfo) {
        if (userInfo) {
            responseData.message = "用户名存在";
            responseData.error = 1;

            res.json(responseData);
            return;
        }

        var newUser = new User({
            username,
            password,
            isAdmin,
        });

        return newUser.save();
    }).then(function(newUserInfo) {
        if (newUserInfo) {
            responseData.message = "添加成功";

            res.json(responseData);
        }
    })
})

/**
 * 获取用户信息
 * @type {[type]}
 */
router.get('/user/edit', function(req, res) {
    const { id } = req.query;

    User.findOne({
        _id: id
    }).then(function(userInfo) {
        if (userInfo) {
            responseData.data = {
                info: userInfo,
            };

            res.json(responseData);
        }
    })
});

/**
 * 更新用户信息
 * @type {[type]}
 */
router.post('/user/update', function(res, req) {
    const { id, username, password, isAdmin } = res.body;

    User.update({
        _id: id
    }, {
        $set: { username, password, isAdmin }
    }).then(function(userInfo) {
        if (userInfo) {
            responseData.message = '保存成功';

            req.json(responseData);
        }
    })
});

/**
 * 标签部分
 */
router.get('/label', function(req, res) {
    const { pageSize = 10, pageIndex = 1, name } = req.query;
    const iPageSize = Number(pageSize);
    const iPageIndex = Number(pageIndex);
    const limit = iPageSize;
    const skip = (iPageIndex - 1) * limit;
    const reg = new RegExp(name, 'gi');

    Label.count({ name: { $regex: reg } }).then(function(count) {
        Label.find({ name: { $regex: reg } }).limit(limit).skip(skip).then(function(labels) {
            responseData.data = {
                pageSize: iPageSize,
                pageIndex: iPageIndex,
                list: labels,
                total: count,
            };
            res.json(responseData);
        });
    });
});

/**
 * 标签删除
 * @type {[type]}
 */
router.post('/label/del', function(req, res) {
    const { id } = req.body;

    Label.remove({
        _id: id
    }).then(function() {
        res.json(responseData);
    });
})


/**
 * 标签添加
 * @type {[type]}
 */

router.post('/label/add', function(req, res) {
    const { name } = req.body;

    Label.findOne({
        name: name
    }).then(function(labelInfo) {
        if (labelInfo) {
            responseData.message = "标签名存在";
            responseData.error = 1;

            res.json(responseData);
            return;
        }

        var newLabel = new Label({
            name,
        });

        return newLabel.save();
    }).then(function(newLabelInfo) {
        if (newLabelInfo) {
            responseData.message = "添加成功";

            res.json(responseData);
        }
    })
})

/**
 * 获取标签信息
 * @type {[type]}
 */
router.get('/label/edit', function(req, res) {
    const { id } = req.query;

    Label.findOne({
        _id: id
    }).then(function(labelInfo) {
        if (labelInfo) {
            responseData.data = {
                info: labelInfo,
            };

            res.json(responseData);
        }
    })
});

/**
 * 更新标签信息
 * @type {[type]}
 */
router.post('/label/update', function(res, req) {
    const { id, name } = res.body;

    Label.update({
        _id: id
    }, {
        $set: { name }
    }).then(function(labelInfo) {
        if (labelInfo) {
            responseData.message = '保存成功';

            req.json(responseData);
        }
    })
});



/**
 * 文章部分
 * @type {[type]}
 */

/**
 * 文章管理
 * @type {String}
 */
router.get('/content', function(req, res) {
    const { pageSize = 10, pageIndex = 1, title } = req.query;
    const iPageSize = Number(pageSize);
    const iPageIndex = Number(pageIndex);
    const limit = iPageSize;
    const skip = (iPageIndex - 1) * limit;
    const reg = new RegExp(title, 'gi');

    Content.count({ title: { $regex: reg } }).then(function(count) {
        Content.find({ title: { $regex: reg } }).limit(limit).skip(skip).then(function(contents) {
            responseData.data = {
                pageSize: iPageSize,
                pageIndex: iPageIndex,
                list: contents,
                total: count,
            };
            res.json(responseData);
        });
    });
});

/**
 * 文章删除
 * @type {String}
 */
router.post('/content/del', function(res, req) {
    const { id } = res.body;

    Content.remove({
        _id: id
    }).then(function() {
        req.json(responseData);
    });
});

/**
 * 添加文章
 * @type {[type]}
 */
router.post('/content/add', function(res, req) {
    const { title, content, classify } = res.body;

    Content.findOne({
        title
    }).then(function(contentInfo) {
        if (contentInfo) {
            responseData.message = '文章存在';
            responseData.error = 1;

            req.json(responseData);
        }

        var newContent = new Content({
            title,
            content,
            classify,
            createTime: new Date().getTime(),
        });

        return newContent.save();
    }).then(function(newContentInfo) {
        if (newContentInfo) {
            responseData.message = '保存成功';

            req.json(responseData);
        }
    })
});

/**
 * 文章信息
 * @type {[type]}
 */
router.get('/content/edit', function(req, res) {
    const { id } = req.query;

    Content.findOne({
        _id: id
    }).then(function(contentInfo) {
        if (contentInfo) {
            responseData.data = {
                info: contentInfo
            };

            res.json(responseData);
        }
    })
})

/**
 * 文章信息更新
 * @type {[type]}
 */
router.post('/content/update', function(req, res) {
    const { id, title, content, classify } = req.body;


    Content.update({
        _id: id,
    }, { title, content, classify }).then(function(contentInfo) {
        if (contentInfo) {
            responseData.message = '更改成功';
            responseData.data = {
                info: contentInfo
            };

            res.json(responseData);
        }
    })
})

/**
 * 获取文章列表
 * @type {[type]}
 */
router.get('/article/list', function(req, res) {
    const { pageSize = 10, pageIndex = 1, title, classify } = req.query;
    const iPageSize = Number(pageSize);
    const iPageIndex = Number(pageIndex);
    const limit = iPageSize;
    const skip = (iPageIndex - 1) * limit;
    const regTitle = new RegExp(title, 'gi');
    const regClassify = new RegExp(classify, 'gi');
    const reg = {
        title: { $regex: regTitle },
        classify: { $regex: regClassify },
    };

    /*
     * 1: 升序
     * -1: 降序
     * */
    Content.count(reg).then(function(count) {
        Content.find(reg).sort({ _id: -1 }).limit(limit).skip(skip).then(function(contents) {
            responseData.data = {
                pageSize: iPageSize,
                pageIndex: iPageIndex,
                list: contents,
                total: count,
            };
            res.json(responseData);
        });
    });
});

/**
 * 文章详情页
 * @type {[type]}
 */

/**
 * 文章详情
 * @return {[type]} [description]
 */
router.get('/article/detail', function(req, res) {
    const { id } = req.query;

    Content.findOne({ _id: id }).then(function(contentInfo) {
        const newViews = contentInfo.views + 1;

        responseData.data = {
            info: contentInfo,
        };

        res.json(responseData);

        Content.update({
            _id: id,
        }, { views: newViews }).then();
    });
})

/**
 * 图片上传
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
router.post('/upload', function(req, res) {
    var form = new multiparty.Form({ uploadDir: './public/img' });
    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files);

        if (err) {
            console.log('parse error: ' + err);
        } else {
            testJson = eval("(" + filesTmp + ")");
            console.log(testJson.wangEditorH5File[0].path.split('\\')[2]);
            res.json({ imgSrc: `http://localhost:8888/public/img/${testJson.wangEditorH5File[0].path.split('\\')[2]}` });
            console.log('rename ok');
        }
    });
})

/**
 * aside中achive数据
 */
router.get('/achive/list', function(req, res) {

    /*
     * 1: 升序
     * -1: 降序
     * */
    var promises = [];
    var skip;
    var limit = 8;

    Content.count().then(function(total) {
        promises.push(Content.find({}, ['title', '_id', 'views']).sort({ _id: -1 }).limit(limit).exec());
        promises.push(Content.find({}, ['title', '_id', 'views']).sort({ views: -1 }).limit(limit).exec());

        for (var i = 0; i < limit; i++) {
            skip = Math.floor(Math.random() * total);
            promises.push(Content.find({}, ['title', '_id', 'views']).skip(skip).limit(1).exec());
        }

        Promise.all(promises).then(function (results) {
            const random = results.splice(2).map(val => val[0]);

            responseData.data = {
                newest: results[0],
                hottest: results[1],
                random: random
            };

            res.json(responseData);
        });
    });
});


module.exports = router;
