var mongoose = require('mongoose');
var config = require('./../config/config');
mongoose.createConnection(config.mongodb);
var PostSchema = new mongoose.Schema({
    title:String,//标题
    author:String,//作者
    article:String,//文章内容
    publishTime:String,//发表时间
    postImg:String,//封面
    comments:Number,//评论数
    pv:Number//访问次数
});

//这里会数据库会创建一个users集合
var Post = mongoose.model('Post', PostSchema);
module.exports = Post;