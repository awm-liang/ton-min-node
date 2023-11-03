import Router from "koa-router";
import fs from "fs";
import { UserItemProps, readUser, writeUser } from "../model/user";
import { readWalletList } from "../model/wallet";

let userRoute = new Router();

userRoute.get("/user-list", async (ctx) => {
  const userList = await readUser();
  ctx.body = {
    code: 1,
    msg: "Success",
    data: userList,
    total: userList.length,
  };
});

userRoute.get('/user-detail', async (ctx) => {
  let postData = ctx.request.query as { userId: string };
  const userList = await readUser();

  const _user = userList.find(user => user.id.toString() === postData.userId.toString());

  ctx.body = {
    code: 1,
    data: _user || [],
    msg: "Success"
  }
})

userRoute.get('/check-user', async (ctx) => {
  let postData = ctx.request.query as { userId: string };
  const userList = await readUser();
  const walletList = await readWalletList();

  const _user = userList.find(user => user.id.toString() === postData.userId.toString());

  const _wallet = walletList.find(wallet => wallet.user_id.toString() === postData.userId.toString());

  ctx.body = {
    code: 1,
    data: Number(Boolean(_wallet && _user)),
    msg: "Success"
  }
})


export default userRoute;
