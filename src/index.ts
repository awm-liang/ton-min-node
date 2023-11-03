import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "koa2-cors";
import Router from "koa-router";
import ngrok from "@ngrok/ngrok";

import userRouter from "./router/user";
import walletRouter from "./router/wallet";

const app = new Koa();

app.use(bodyParser());
app.use(cors());

// 装载所有子路由
let router = new Router();
router.use("/user", userRouter.routes(), userRouter.allowedMethods());
router.use("/wallet", walletRouter.routes(), walletRouter.allowedMethods());

// 加载路由中间件
app.use(router.routes()).use(router.allowedMethods());

app.listen(30012, async () => {
  console.log("[demo] route-use-middleware is starting at port 30012");
  // Establish connectivity
  const listener = await ngrok.connect({
    addr: 30012,
    authtoken: '2XerJFoj4PRKWV5DQHcCqxjLzfv_2wqNtEsRXLajdW1gQCEg6',
  });

  // Output ngrok url to console
  console.log(`Ingress established at: ${listener.url()}`);
});
