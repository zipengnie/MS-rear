var express = require('express');
var router = express.Router();
var async = require("async");

// /* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 品牌管理页面*/
router.get("/brand.html", function (req, res) {
  res.render("brand", { title: ' 品牌管理页面' })
})

/* 手机管理页面*/
router.get("/phone.html", function (req, res) {
  res.render("phone", { title: '手机管理页面' })
})

/* 用户登录页面localhost:3000/users/login.html*/
router.get("/login.html", function (req, res) {
  res.render("login");
})

/* 用户注册页面localhost:3000/users/register.html*/
router.get("/register.html", function (req, res) {
  res.render("register");
})


//导入mongodb模块并创建一个 MongoClient 对象
var MongoClient = require("mongodb").MongoClient;
//获取MongoDB的文档ID
var ObjectId = require("mongodb").ObjectId;
//配置好指定的 URL 和 端口号
var url = "mongodb://127.0.0.1:27017";
/* 用户管理页面*/
router.get("/userInfo.html", function (req, res) {
  var page = parseInt(req.query.page) || 1;//初始化默认页码1
  var pageSize = parseInt(req.query.pageSize) || 2;//初始化默认每页显示5条数据
  var totalSize = 0;//数据总条数
  var totalPage = 0;//总页数

  // 连接服务器和数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log("连接服务器失败");
      res.render("error", { message: "连接服务器失败", error: error });
      return;
    }
    //连接数据库
    var db = client.db("MS");
    async.series([
      function (cb) {
        //查询MongoDB数据
        db.collection("user").find().count(function (error, num) {
          if (error) {
            cb(error);
          } else {
            totalSize = num;//取数据库查询总数据条数
            cb(null);
          }
          //关闭数据库连接
        })
      },
      //获取当前页码的几条数据
      function (cb) {
        // db.collection('user').find().limit(5).skip(0)
        // db.collection('user').find().limit(5).skip(5)
        // db.collection('user').find().limit(5).skip(10)
        // db.collection('user').find().limit(5).skip(15)
        //查询MongoDB数据
        db.collection("user").find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (error, docs) {
          if (error) {
            cb(error);
          } else {
            cb(null, docs);
          }
        })
      }], function (error, result) {//注意：result是一个数组，前面没有传参[undefined,docs]
        if (error) {
          res.render('error', {
            message: '错误',
            error: error
          })
        } else {
          //获取总页数
          totalPage = Math.ceil(totalSize / pageSize);
          //将当前页码数据渲染到前端显示
          res.render("userInfo", { list: result[1], pageSize: pageSize, page: page, totalPage: totalPage })
        }
        //关闭连接
        client.close();
      })
  })
})

/* 用户管理页面---删除操作*/
router.get("/delete", function (req, res) {
  var id = req.query.id;
  console.log(id);
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log("连接服务器失败");
      res.render("error", { message: "连接服务器失败", error: error });
      return;
    }
    //连接数据库
    var db = client.db("MS");
    //查询MongoDB数据
    db.collection("user").deleteOne({ _id: ObjectId(id) }, function (error) {
      if (error) {
        res.render("error", { message: "删除失败", error: error });
      } else {
        //删除成功
        res.redirect("/userInfo.html")
      }
      //关闭数据库连接
      client.close();
    })
  })
})

module.exports = router;
