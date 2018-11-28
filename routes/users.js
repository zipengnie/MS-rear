var express = require('express');
var router = express.Router();
var async = require("async");
//导入mongodb模块并创建一个 MongoClient 对象
var MongoClient = require("mongodb").MongoClient;

//配置好指定的 URL 和 端口号
var url = "mongodb://127.0.0.1:27017";
router.get("/", function (req, res) {
  res.render("index");
})
/* 用户管理*/
// router.get("/userInfo.html", function (req, res) {
//   router.get("/", function (req, res) {
//   // 连接服务器和数据库
//   MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
//     if (error) {
//       console.log("连接服务器失败");
//       res.render("error", { message: "连接服务器失败", error: error });
//       return;
//     }
//     //连接数据库
//     var db = client.db("MS");
//     //查询MongoDB数据
//     db.collection("user").find().toArray(function (err, docs) {
//       if (error) {
//         console.log("查询用户数据失败");
//         res.render("error", { message: "查询失败", error: error });
//       } else {
//         console.log(docs);
//         res.render("userInfo", { list: docs });
//       }
//       //关闭数据库连接
//       client.close();
//     })
//   })
// })

/* 登录页面localhost:3000/users/login.html*/
router.post("/login.html", function (req, res) {
  //1.获取前端传递过来的参数(cookie会随着http请求一起发送)
  var username = req.body.name;
  var password = req.body.pwd;
  console.log(username, password);

  //2.验证参数的有效性
  if (username == "") {
    res.render("error", {
      message: "用户名不能为空",
      error: new Error("用户名不能为空")
    })
    return;
  } else if (username.length < 3 || username.length > 20) {
    res.render("error", {
      message: "用户名长度为3-20",
      error: new Error("用户名长度不符")
    })
    return;
  }

  if (!password) {
    res.render("error", {
      message: "密码不能为空",
      error: new Error("密码不能为空")
    })
    return;
  }


  // 连接服务器和数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log("连接服务器失败");
      res.render("error", { message: "连接服务器失败", error: new Error("连接服务器失败") });
      return;
    }
    //连接数据库
    var db = client.db("MS");

    //查询MongoDB数据
    // db.collection("user").find({
    //   userName:username,
    //   password:password
    // }).count(function (err, num) {
    //   if (error) {
    //     console.log("查询用户数据失败");
    //     res.render("error", { message: "查询失败", error: error});
    //   } else if (num > 0){
    //     //注意：登录成功跳转到首页后url地址是http://localhost:3000/users/login.html。如果直接会用res.render()，页面地址不会改变。需要使用重定向res.redirect()方法
    //     res.redirect("/");//或者res.redirect("http://localhost:3000/");

    //     //登录成功，写入cookie
    //     res.cookie("nickname", ) //由于使用count拿不到nickname信息，所以要改造一下
    //   } else {
    //     res.render("error", { message: "登录失败", error: new Error("登录失败") });
    //   }
    //   //关闭数据库连接
    //   client.close();
    // })

    //查询MongoDB数据
    db.collection("user").find({
      userName: username,
      password: password
    }).toArray(function (error, docs) {
      if (error) {
        console.log("查询用户数据失败");
        res.render("error", { message: "查询失败", error: error });
      } else if (docs.length <= 0) {
        //没查询到数据
        res.render("error", { message: "登录失败", error: new Error("登录失败") });
      } else {
        //登录成功,写入cookie
        res.cookie("nickname", docs[0].nickname, {
          maxAge: 10 * 60 * 1000
        });
        //需要使用重定向res.redirect()方法,改变登录成功时页面的url地址
        res.redirect("/");
      }
      //关闭数据库连接
      client.close();
    })

  })
})

/* 注册页面localhost:3000/users/register.html*/
router.post("/register.html", function (req, res) {
  //1.获取前端传递过来的参数
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = req.body.age;
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin == "是" ? true : false;
  console.log(name, pwd, age, sex, isAdmin);
  // 注册的时候需要先校验用户名是否已注册过
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log("连接服务器失败");
      res.render("error", { message: "连接服务器失败", error: error });
      return;
    }
    //连接数据库
    var db = client.db("MS")

    //串行无关联async.series
    async.series([
      //校验用户名是否已注册过
      function (cb) {
        db.collection("user").find({ userName: name }).count(function (error, num) {
          if (error) {
            cb(error)
          } else if (num > 0) {//这个人已经注册过
            cb(new Error("已被注册"));
          } else {
            //可以注册
            cb(null);
          }
        })
      },
      //用户注册
      function (cb) {
        //连接数据库
        var db = client.db("MS");
        //插入数据到MongoDB中
        db.collection("user").insertOne({
          userName: name,
          password: pwd,
          nickname: nickname,
          sex: sex,
          age: parseInt(age),
          isAdmin: isAdmin
        }, function (error) {
          if (error) {
            cb(error);
          } else {
            cb(null);
          }
        })
      }
    ], function (error, result) {
      if (error) {
        res.render("error", { message: "注册失败", error: error })
      } else {
        res.redirect("/login.html");
      }
      //关闭数据库连接
      client.close();
    })
  })

  // MongoClient.connect(url,{ useNewUrlParser: true }, function (error, client) {
  //   if (error) {
  //     console.log("连接服务器失败");
  //     res.render("error", { message: "连接服务器失败", error: error });
  //     return;
  //   }
  //   //连接数据库
  //   var db = client.db("MS");
  //   //插入数据到MongoDB中
  //   db.collection("user").insertOne({
  //     userName: name,
  //     password: pwd,
  //     nickname: nickname,
  //     sex: sex,
  //     age: parseInt(age),
  //     isAdmin: isAdmin
  //   }, function (error) {
  //     if (error) {
  //       console.log("注册失败");
  //       res.render("error", {
  //         message: "注册失败",
  //         error: error
  //       })
  //     } else {
  //       //注册成功
  //       res.redirect("/login.html");
  //     }
  //     //关闭数据库连接
  //     client.close();
  //   })
  // })
})

module.exports = router;