const http = require("http");
/** 載入 mongoose 套件 */
const mongoose = require('mongoose');
/** 載入 全域變數套件 */
const dotenv = require('dotenv');

// 全域變數套件設定
dotenv.config({ path: "./config.env" })

const libs = require('./libs');
const { successHandler, errorHandler } = require('./responseHandler');
const Todo = require("./models/todo");
//const { getTodo, getTodos } = require('./getTodo');

//#region 連接資料庫
// 本地連線
//mongoose.connect('mongodb://localhost:27017/hotel')

// 遠端連線
const connectString = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

mongoose.connect(connectString)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((error) => {
    console.log(error);
  });
//#endregion

const requestListener = async (req, res) => {
  const { headers, message } = libs
  const { url, method } = req

  if (url === "/todos" && method === "GET") {
    const todos = await Todo.find();
    console.log(todos)
    successHandler(res, todos)
  } else if (url.startsWith("/todos/") && method === "GET") {
    const id = req.url.split('/').pop();
    const todos = await Todo.find();
    const index = todos.findIndex((todo) => todo._id === id);

    if (index !== -1) {
      successHandler(res, todos[index]);
    } else {
      const { noData } = message
      errorHandler(res, 400, noData);
    }
  } else if (method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    errorHandler(res, 404, message[404])
  }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);