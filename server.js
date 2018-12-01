//express框架
var express = require("express");
var app = express();
// 异步流程控制
var async = require("async");
// 文件模块
var fs = require("fs");
// 路径模块
var path = require("path");
// 上传文件模块
var multer = require("multer");
// dest是设置文件存放的临时目录
var upload = multer({ dest: 'c:/uploads' })
// mongodb数据库
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://127.0.0.1:27017";
//获取POST请求体body中的数据（查询串）
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// 注册用户和登录时都要验证该用户之前是否存在数据库
app.post("/api/userCheck", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });
    //1.获取前端传递过来的参数
    var name = req.body.name;
    var result = {}; //
    // 注册的时候需要先校验用户名是否已注册过
    MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
        if (error) {
            result.code = -1;//非0表示错误
            result.message = "连接服务器失败";
            res.json(result);
            return;
        }
        //连接数据库
        var db = client.db("MS")
        //校验用户名是否已注册过
        db.collection("user").find({ userName: name }).count(function (error, num) {
            if (error) {
                result.code = -1;//非0表示错误
                result.message = "查询数据失败";
                res.json(result);
            } else if (num > 0) {//这个人已经注册过
                result.code = -1;//非0表示错误
                result.message = "该账户存在";
                res.json(result);
            } else {
                result.code = 0;//非0表示错误
                result.message = "该用户不存在";
                res.json(result);
            }
        })
        //关闭数据库连接
        client.close();
    })
})

//注册的请求
app.post("/api/register.html", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });
    //1.获取前端传递过来的参数
    var name = req.body.name;
    var pwd = req.body.pwd;
    var nickname = req.body.nickname;
    var age = req.body.age;
    var sex = req.body.sex == "true" ? "男" : "女";
    var isAdmin = req.body.isAdmin == "true" ? "是" : "否";
    var result = {}; //
    // 注册的时候需要先校验用户名是否已注册过
    MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
        if (error) {
            result.code = -1;//非0表示错误
            result.message = "连接服务器失败";
            res.json(result);
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
                        result.code = -1;//非0表示错误
                        result.message = "查询数据失败";
                        cb(result.code, result);
                    } else if (num > 0) {//这个人已经注册过
                        result.code = -1;//非0表示错误
                        result.message = "该账户已被注册";
                        cb(result.code, result);
                    } else {
                        result.code = 0;//非0表示错误
                        result.message = "可以注册";
                        cb(null, result);
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
                        result.code = -1;//非0表示错误
                        result.message = "注册失败";
                        cb(result.code, result);
                    } else {
                        result.code = 0;//非0表示错误
                        result.message = "注册成功";
                        cb(null, result);
                    }
                })
            }
        ], function (error, result) {
            if (error) {
                res.json(error);
            } else {
                res.json(result);
            }
            //关闭数据库连接
            client.close();
        })
    })
})

//登录的请求
app.post("/api/login.html", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });

    //1.获取前端传递过来的参数
    var username = req.body.name;
    var password = req.body.pwd;
    var result = {};

    // 2.表单验证参数的有效性
    // var nameReg = new RegExp(/^[0-9a-zA-Z]{5,20}$/);
    // var pwdReg = new RegExp(/^[0-9a-zA-Z]{5,20}$/);
    // if (username == "" || !nameReg.test(username)) {
    //     res.render("error", {
    //         message: "用户名不符",
    //         error: new Error("用户名不符")
    //     })
    //     return;
    // }
    // if (password == "" || !pwdReg.test(password)) {
    //     res.render("error", {
    //         message: "密码不符",
    //         error: new Error("密码不符")
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
        db.collection("user").find({ userName: username, password: password }).toArray(function (error, docs) {
            if (error) {
                result.code = -1;//非0表示错误
                result.message = "查询用户数据失败";
            } else if (docs.length <= 0) {
                //没查询到数据
                result.code = -1;//非0表示错误
                result.message = "用户名或密码错误";
            } else {
                //登录成功,写入cookie
                result.code = 0;//非0表示错误
                result.message = "登录成功";
                result.data = {
                    nickname: docs[0].nickname,
                    isAdmin: docs[0].isAdmin
                }
            }
            //关闭数据库连接
            client.close();
            res.json(result);
        })
    })
})

//用户管理页面渲染请求
app.get("/api/userInfo.html", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });

    //1.获取前端传递过来的参数
    var page = parseInt(req.query.page) || 1;//初始化默认页码1
    var pageSize = parseInt(req.query.pageSize) || 2;//初始化默认每页显示5条数据
    var totalSize = 0;//数据总条数
    var totalPage = 1;//总页数
    var result = {};
    if (req.query.totalSize) {
        // 当前页码
        result.page = page;
        // 每页显示数据条数
        result.pageSize = pageSize;
        //总条数  
        result.totalSize = parseInt(req.query.totalSize);
        // 总页数
        result.totalPage = Math.ceil(result.totalSize / result.pageSize);
        res.json(result);
        return;
    } else {
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

            async.series([
                function (cb) {
                    //查询MongoDB数据
                    db.collection("user").find().count(function (error, num) {
                        if (error) {
                            result.code = -1;//非0表示错误
                            result.message = "查询失败";
                            cb(result.code, result);
                        } else {
                            result.code = 0;//非0表示错误
                            result.message = "查询成功";
                            result.totalSize = num;//取数据库查询总数据条数
                            cb(null, result);
                        }
                    })
                },
                //获取当前页码的几条数据
                function (cb) {
                    //查询MongoDB数据
                    db.collection("user").find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (error, docs) {
                        if (error) {
                            result.code = -1;//非0表示错误
                            result.message = "查询数据失败";
                            cb(result.code, result);
                        } else {
                            result.code = 0;//非0表示错误
                            result.message = "查询数据成功";
                            result.data = docs //当前页面数据
                            cb(null, result);
                        }
                    })
                }], function (error, rel) {//注意：data是一个数组，前面没有传参[undefined,docs]
                    if (error == null) {
                        // 当前页码
                        result.page = page;
                        // 每页显示数据条数
                        result.pageSize = pageSize;
                        // 总页数
                        result.totalPage = Math.ceil(result.totalSize / result.pageSize);
                        res.json(result);
                    }
                    //关闭连接
                    client.close();
                })
        })
    }
})

// 用户管理页面搜索请求(默认查询昵称数据)
app.get("/api/userInfo/search", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });
    // 要查询的关键字
    var searchVal = req.query.searchVal;
    var result = {};
    // 正则模糊匹配
    var filter = new RegExp(searchVal);
    // 连接服务器
    MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
        if (error) {
            result.code = -1;//非0表示错误
            result.message = "连接服务器失败";
            res.json(result);
            return;
        }
        //连接数据库
        var db = client.db("MS")
        //查询数据
        db.collection("user").find({ nickname: filter }).toArray(function (error, docs) {
            if (error) {
                result.code = -1;//非0表示错误
                result.message = "查询数据失败";
                res.json(result);
            } else if (docs.length <= 0) {
                result.code = 0;//非0表示错误
                result.message = "查询0条数据";
                res.json(result);
            } else {
                result.code = 0;//非0表示错误
                result.message = "查询" + docs.length + "条数据";
                result.data = docs;
                res.json(result);
            }
        })
        //关闭数据库连接
        client.close();
    })
})

// 删除用户信息
app.get("/api/userInfo/delete", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });
    // 要查询的关键字
    var name = req.query.name;
    var result = "";
    // 连接服务器
    MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
        if (error) {
            result.code = -1;//非0表示错误
            result.message = "连接服务器失败";
            res.json(result);
            return;
        }
        //连接数据库
        var db = client.db("MS")

        //串行无关联async.series
        async.series([
            //删除用户
            function (cb) {
                //插入数据到MongoDB中
                db.collection("user").remove({ userName: name }, function (error) {
                    if (error) {
                        result.code = -1;//非0表示错误
                        result.message = "删除失败";
                        cb(result.code, result);
                        return;
                    } else {
                        result.code = 0;//非0表示错误
                        result.message = "删除成功";
                        cb(null, result);
                    }
                })
            },
            //确认是否真正删除成功
            function (cb) {
                db.collection("user").find({ userName: name }).toArray(function (error, data) {
                    if (error) {
                        result.code = -1;//非0表示错误
                        result.message = "查询失败";
                        cb(result.code, result);
                    } else if (data) {
                        result.code = -1;//非0表示错误
                        result.message = "确认删除失败";
                        cb(result.code, result);
                    } else {
                        result.code = 0;//非0表示错误
                        result.message = "确认删除成功";
                        cb(null, result);
                    }
                })
            }], function (error, result) {
                if (error) {
                    res.json(error);
                } else {
                    res.json(result);
                }
                //关闭数据库连接
                client.close();
            })
    })
})

//手机管理页面渲染请求
app.get("/api/phone.html", function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });

    //1.获取前端传递过来的参数
    var page = parseInt(req.query.page) || 1;//初始化默认页码1
    var pageSize = parseInt(req.query.pageSize) || 2;//初始化默认每页显示5条数据
    var totalSize = 0;//数据总条数
    var totalPage = 0;//总页数
    var result = {};

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

        async.series([
            function (cb) {
                //查询MongoDB数据
                db.collection("phone").find().count(function (error, num) {
                    if (error) {
                        result.code = -1;//非0表示错误
                        result.message = "查询失败";
                        cb(result.code, result);
                    } else {
                        result.code = 0;//非0表示错误
                        result.message = "查询成功";
                        result.totalSize = num;//取数据库查询总数据条数
                        cb(null, result);
                    }
                })
            },
            //获取当前页码的几条数据
            function (cb) {
                //查询MongoDB数据
                db.collection("phone").find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (error, docs) {
                    if (error) {
                        result.code = -1;//非0表示错误
                        result.message = "查询数据失败";
                        cb(result.code, result);
                    } else {
                        result.code = 0;//非0表示错误
                        result.message = "查询数据成功";
                        result.data = docs //当前页面数据
                        cb(null, result);
                    }
                })
            }], function (error, rel) {//注意：data是一个数组，前面没有传参[undefined,docs]
                if (error == null) {
                    // 当前页码
                    result.page = page;
                    // 每页显示数据条数
                    result.pageSize = pageSize;
                    // 总页数
                    result.totalPage = Math.ceil(result.totalSize / result.pageSize);
                    res.json(result);
                }
                //关闭连接
                client.close();
            })
    })
})

//新增手机数据请求(手机)
app.post("/api/phone/upload", upload.single('file'), function (req, res) {
    //设置响应头来处理跨域问题
    res.set({ "Access-Control-Allow-Origin": "*" });
    console.log(req.body);
    console.log(req.file);
    //1.获取前端传递过来的参数
    var productName = req.body.productName;
    var brandName = req.body.brandName;
    var officialPrices = parseInt(req.body.officialPrices);
    var resalePrice = parseInt(req.body.resalePrice);
    var fileName = "phoneImg/" + new Date().getTime() + "_" + req.file.originalname;
    // console.log(fileName);
    var result = "";
    // 将文件从缓存路径提取到c:/uploads拷贝到public--->images--->phoneImg目录
    var newFileName = path.resolve(__dirname, "./public/images/", fileName);
    try {
        var data = fs.readFileSync(req.file.path);
        fs.writeFileSync(newFileName, data);
    } catch (error) {
        result.code = -1;//文件上传失败
        result.message = "文件上传失败";
        res.json(result);
    }
    console.log(fileName);
    //连接服务器
    MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
        if (error) {
            result.code = -1;//非0表示错误
            result.message = "连接服务器失败";
            res.json(result);
            return;
        }
        // //连接服务器
        var db = client.db("MS");
        //插入数据到MongoDB中
        db.collection("phone").insertOne({
            "fileName": fileName, "productName": productName, "brandName": brandName, "officialPrices": officialPrices, "resalePrice": resalePrice
        }, function (error) {
            if (error) {
                result.code = -1;//非0表示错误
                result.message = "新增失败";
                res.json(result);
            } else {
                result.code = 0;//非0表示错误
                result.message = "新增成功";
                res.json(result);
            }
        })
        //关闭数据库连接
        client.close();
    })
})


app.listen(3000);