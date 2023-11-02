import Koa from "koa";
import bodyParser from 'koa-bodyparser';
import cors from 'koa2-cors';
import Router from "koa-router";

import userRouter from './router/user';
import walletRouter from './router/wallet';
import path from "path";

const app = new Koa();

app.use(bodyParser())
app.use(cors())

// 装载所有子路由
let router = new Router();
router.use("/user", userRouter.routes(), userRouter.allowedMethods());
router.use("/wallet", walletRouter.routes(), walletRouter.allowedMethods());

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods());

app.listen(30012, () => {
  console.log("[demo] route-use-middleware is starting at port 30012");
});
