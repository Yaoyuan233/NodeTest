//主页，包括登录和注册以及展示页
var express = require('express');
var path = require('path');
var markdown = require('markdown').markdown;
var router = express.Router();

//建立要存储的对象
var User = require('../models/userModel');
var Post = require('../models/postModel');

//首页
router.get('/', function(req, res, next) {
    Post.find({},function(err,data){
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        res.render('index',{
            title:'首页',
            user: req.session.user,
            info: req.session.info,
            posts:data
        });
  })
});

//注册页的获取
router.get('/reg', function(req, res, next) {
    res.render('reg', { 
        title: '注册',
        user: req.session.user,
        info: req.session.info
    });
});
//注册页的登录
router.post('/reg', function (req, res) {
    //新建用户，获取表单中的内容
    var user = new User({
        username:req.body.username,
        password:req.body.password,
        email:req.body.email
    });
    //两次输入的密码不相同
    if(user.password != req.body.password_repeat){
        req.session.info = "两次输入的密码不一致";
        return res.redirect('/');
    }
    //在存储中寻找是否有重复的用户名
    User.findOne({'username':user.username},function(err,data){
        //出现不可知的错误
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        //如果该用户已存在
        if(data != null){
            req.session.info = "该用户已存在";
            return res.redirect('/reg');
        }
        else {
            //保存新的用户
            user.save(function(err){
            if(err){
              console.log(err);
              return res.redirect('/');
            }
            req.session.info = "注册成功！";
            res.redirect('/');//注册成功后返回主页
          })
        }
    })
});

//用户登录页面的获取
router.get('/login', function(req, res, next) {
    res.render('login', { 
        title: '登录',
        user: req.session.user,
        info: req.session.info
    });
});
//用户登录功能
router.post('/login',function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    //检查用户是否存在
    User.findOne({'username':username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/');
        }
        //用户不存在
        if(!user){
            req.session.info = "用户名或密码错误";
            return res.redirect('/login');
        }
        //判断密码是否一致
        if(user.password != password){
            req.session.info = "用户名或密码错误";
            return res.redirect('/login');
        }
        //用户名密码都匹配后，将用户信息存入 session
        req.session.user = user;
        req.session.info = "登录成功！";
        res.redirect('/');
    });
});

//退出登录
router.get('/logout',checkLogin,function (req, res) {
    req.session.user = null;
    req.session.info = "登出成功！";
    res.redirect('/');//登出成功后跳转到主页
});

//搜索结果页面的获取，最终通过index尽心渲染
router.get('/search', function(req, res){
    var type = req.query.type;
    var keyword = req.query.keyword;
    if(type == "作者"){
        Post.find({'author': keyword}, function(err, data){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            
            res.render('index',{
                title:'首页',
                user: req.session.user,
                info: "null",
                posts:data
            });
        });
    }
    else if(type == "题目"){
        var str = new RegExp(keyword);
        Post.find({'title': { $regex: str}}, function(err, data){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            res.render('index',{
                title:'首页',
                user: req.session.user,
                info: "null",
                posts:data
            });
        });
    }
    else{
        var str = new RegExp(keyword);
        Post.find({"$or":[{"author":keyword},{'title': { $regex: str}} ]}, function(err, data){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            res.render('index',{
                title:'首页',
                user: req.session.user,
                info: "null",
                posts:data
            });
        });
    }
})

function checkLogin(req, res, next){
    if(!req.session.user){
        res.redirect('/login');
    }
    next();
}

module.exports = router;
