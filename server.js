//express框架
var express = require("express");
var app = express();
// mongodb数据库
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb:127.0.0.1:27017";

//注册的请求
// app.post("/api/register.html", function (req, res) {
//     //1.获取前端传递过来的参数
//     var name = req.body.name;
//     var pwd = req.body.pwd;
//     var nickname = req.body.nickname;
//     var age = req.body.age;
//     var sex = req.body.sex;
//     var isAdmin = req.body.isAdmin == "是" ? true : false;
//     var result = {}; //
//     // 注册的时候需要先校验用户名是否已注册过
//     MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
//         if (error) {
//             result.code = -1;//非0表示错误
//             result.message = "连接服务器失败";
//             res.json(result);
//             return;
//         }
//         //连接数据库
//         var db = client.db("MS")

//         //串行无关联async.series
//         async.series([
//             //校验用户名是否已注册过
//             function (cb) {
//                 db.collection("user").find({ userName: name }).count(function (error, num) {
//                     if (error) {
//                         cb(error)
//                     } else if (num > 0) {//这个人已经注册过
//                         cb(new Error("已被注册"));
//                     } else {
//                         //可以注册
//                         cb(null);
//                     }
//                 })
//             },
//             //用户注册
//             function (cb) {
//                 //连接数据库
//                 var db = client.db("MS");
//                 //插入数据到MongoDB中
//                 db.collection("user").insertOne({
//                     userName: name,
//                     password: pwd,
//                     nickname: nickname,
//                     sex: sex,
//                     age: parseInt(age),
//                     isAdmin: isAdmin
//                 }, function (error) {
//                     if (error) {
//                         cb(error);
//                     } else {
//                         cb(null);
//                     }
//                 })
//             }
//         ], function (error, result) {
//             if (error) {
//                 res.render("error", { message: "注册失败", error: error })
//             } else {
//                 res.redirect("/login.html");
//             }
//             //关闭数据库连接
//             client.close();
//         })
//     })
// })

//登录的请求
app.post("/api/login.html", function (req, res) {
    //1.获取前端传递过来的参数
    var username = req.body.name;
    var password = req.body.pwd;
    var result = {};

    //2.表单验证参数的有效性
    // if (username == "") {
    //     res.render("error", {
    //         message: "用户名不能为空",
    //         error: new Error("用户名不能为空")
    //     })
    //     return;
    // } else if (username.length < 3 || username.length > 20) {
    //     res.render("error", {
    //         message: "用户名长度为3-20",
    //         error: new Error("用户名长度不符")
    //     })
    //     return;
    // }

    // if (!password) {
    //     res.render("error", {
    //         message: "密码不能为空",
    //         error: new Error("密码不能为空")
    //     })
    //     return;
    // }

    // 连接服务器和数据库
    MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
        if (error) {
            result.code = -1;//非0表示错误
            result.message = "连接服务器失败";
            res.json(result);
            return;
        }
        //连接数据库
        var db = client.db("MS");
        //查询MongoDB数据
        db.collection("user").find({userName: username,password: password}).toArray(function (error, data) {
            if (error) {
                result.code = -1;//非0表示错误
                result.message = "查询用户数据失败";
            } else if (data.length <= 0) {
                //没查询到数据
                result.code = -1;//非0表示错误
                result.message = "用户名或密码错误";
            } else {
            //登录成功,写入cookie
                result.code = 0;//非0表示错误
                result.message = "登录成功";
                // result.data = {
                //     data:
                // }
            //     res.cookie("nickname", data[0].nickname, {
            //     maxAge: 10 * 60 * 1000
            // });
            }
            //关闭数据库连接
            client.close();
            res.json(result);
        })
    })
})







    //用户页面信息请求
    app.post("/api/userInfo.html", function (req, res) {

    })

app.listen(3000)