//主页，包括登录和注册以及展示页
var express = require('express');
var path = require('path');
var markdown = require('markdown').markdown;
var router = express.Router();

//建立要存储的对象
var User = require('../models/userModel');
var Post = require('../models/postModel');
var Comment = require('../models/commentModel');

var moment = require('moment');//时间控件
var formidable = require('formidable');//表单控件

//获取文章详情页
router.get('/detail',function(req,res){
    var id = req.query.id;
    if(id && id!=''){
        Comment.count({'article':id}, function(err, count){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            //console.log('count' + count);
            Post.update({"_id":id},{$inc:{"pv":1}, 'comments': count},function(err){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                };
            });
        })
        Post.findById(id,function(err,data){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            
            Comment.find({'article':id}, function(err, comment){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                }
                res.render('detail',{
                    title:'文章展示',
                    user: req.session.user,
                    info: req.session.info,
                    post: data,
                    comments: comment,
                    img: path.dirname(__dirname) + '/public/images/' + data.postImg
                })
            })
            
        });
    }
});
//提交评论
router.post('/detail', checkLogin, function(req,res){
    
    var id = req.query.id;
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.keepExtensions = true; //保留后缀
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            return;
        }
        
        var comment = new Comment({
            name: req.session.user.username,
            time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString(),
            content: fields.comment,
            article: id
        });
        comment.save(function(err){
            if(err){
                console.log(err);
                return res.redirect('/article/detail?id=' + id);
            }
            req.session.info = "评论成功！";
            /*
            Post.update( {'article':id}, {$inc: {'comments':1}}, function(err){
                if(err){
                    console.log(err);
                    
                }
            })*/
            res.redirect('/article/detail?id=' + id);
        });
    });
});

//发表文章页面的获取
router.get('/post',checkLogin,function (req, res) {
    res.render('post',{
        title:'发表',
        user: req.session.user,
        info: "null"
    })
});
//文章提交页面
router.post('/post',checkLogin,function(req,res,next){
    var imgPath = path.dirname(__dirname) + '/public/images/';
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = imgPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            return;
        }
        var file = files.postImg;//获取上传文件信息

        if(file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif' && file.type != 'image/jpg'){
            req.session.info = '上传文件格式错误，只支持png,jpeg,gif';
            return res.redirect('/upload');
        }
        var title = fields.title;
        var author = req.session.user.username;
        var article = fields.article;
        var postImg = file.path.split(path.sep).pop();
        var pv = fields.pv;
        var comments = fields.comments;
        // 校验参数
        try {
            if (!title.length) {
                throw new Error('请填写标题');
            }
            if (!article.length) {
                throw new Error('请填写内容');
            }
        } catch (e) {
            return res.redirect('/post');
        }
        var post = new Post({
            title:title,
            author:author,
            article:article,
            postImg:postImg,
            publishTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString(),
            pv:pv,
            comments:comments
        });
        post.save(function(err){
            if(err){
                console.log(err);
                return res.redirect('/post');
            }
            req.session.info = "发表成功！";
            res.redirect('/users/' + author);
        });
    });
});
//更改博客文章内容页面的获取
router.get('/edit/:author/:title',checkLogin, function (req, res) {
    var id = req.query.id;
    Post.findById(id, function (err, data) {
        
        if (err) {
            return res.redirect('/article/detail?id=' + id);
        }
        res.render('edit', {
            title: '编辑',
            post: data,
            user: req.session.user,
            info: "null"
        });
    });
});
//编辑博客页面内容的提交
router.post("/edit/:author/:title",checkLogin,function(req,res,next){
    var post = {
        id:req.body.id,
        author:req.session.user,
        title:req.body.title,
        article:req.body.article
    };
    //markdow转格式文章
    post.article = markdown.toHTML(post.article);
    //修改博客内容
    Post.update({"_id":post.id},{$set:{title:post.title,article:post.article}},function(err){
        if(err){
            console.log(err);
            return;
        }
        console.log("更新成功！");
        res.redirect('/article/detail?id=' + post.id);
    });
});

//删除博客
router.get('/delete',checkLogin,function(req,res){
    var id = req.query.id;
    var author = req.query.author;
    if(id && id!=''){
        Post.findByIdAndRemove(id,function(err){
            if(err){
                console.log(err);
                return req.redirect('/users/' + author)
            }
            req.session.info = "删除成功！"
            res.redirect('/users/' + author);
        })
    }
});

function checkLogin(req, res, next){
    if(!req.session.user){
        res.redirect('/login');
    }
    next();
}

module.exports = router;