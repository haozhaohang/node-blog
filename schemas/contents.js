var mongoose = require('mongoose');

// 文章结构
module.exports = new mongoose.Schema({

    // 标题
    title: String,

    // 作者
    author: {
        type: String,
        default: '宿雨'
    },

    // 创建时间
    createTime: {
        type: Date,
        default: new Date()
    },

    // 阅读量
    views: {
        type: Number,
        default: 0
    },

    // 文章类型
    classify: String,

    //内容
    content: {
        type: String,
        default: ''
    },

    //评论
    comments: {
        type: Array,
        default: []
    }
})