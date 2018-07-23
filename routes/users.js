//主页，包括登录和注册以及展示页
var express = require('express');
var path = require('path');
var router = express.Router();

//建立要存储的对象
var User = require('../models/userModel');
var Post = require('../models/postModel');

//用户页
//好坑啊！！！我一直写的是/:author，因此无论干什么都会匹配到它~这个bug真是，唉
router.get('/:author', checkLogin, function(req, res){
    var username = req.params.author;
    //检查用户是否存在
    User.findOne({'username':username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        //用户不存在
        if(!user){
            req.session.info = "用户不存在";
            return res.redirect('/');
        }
        //用户存在
        req.session.user = user;
        req.session.info = "欢迎您，" + username;
        Post.find({'author':username}, function(err, data){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            //计算文章数
            Post.count({'author':username}, function(err, articles){
                if(err){
                    console.log(err);
                    return res.redirect('/');
                }
                res.render('users',{
                    title:'文章展示',
                    user: req.session.user,
                    info: req.session.info,
                    posts: data,
                    articles: articles,
                });
                
            })
            
        });
        
    });
});

function checkLogin(req, res, next){
    if(!req.session.user){
        res.redirect('/login');
    }
    next();
}

module.exports = router;