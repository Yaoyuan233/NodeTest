var mongoose = require('mongoose');
var config = require('./../config/config');
mongoose.createConnection(config.mongodb);
var CommentSchema = new mongoose.Schema({
    name:String,
    time:String,
    content:String,
    article:String
});

//这里会数据库会创建一个users集合
var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;