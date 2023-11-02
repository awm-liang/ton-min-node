import Router from "koa-router";
import fs from "fs";
import { UserItemProps, readUser, writeUser } from "../model/user";

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

  const _user = userList.find(user => user.id === postData.userId);

  ctx.body = {
    code: 1,
    data: _user || [],
    msg: "Success"
  }
})

userRoute.get("/join-updata", async (ctx) => {
  const userList = await readUser();

  const param = ctx.request.query as any;

  const _user = userList.findIndex(user => user.id === param.id)

  const userItem: UserItemProps = {
    id: param.id,
    gender: "",
    name: {
      username: param.username,
      first: param.first_name,
      last: param.last_name,
    },
    email: "",
    picture: "",
  };

  if (_user !== -1) { // 更新用户信息
    console.log('更新用户信息')
    userList[_user] = userItem;
  } else { // 新增用户信息
    console.log('新增用户信息')
    userList.push(userItem);
  }

  const writeRes = await writeUser(userList);

  if (writeRes) {
    ctx.body = {
      code: 1,
      msg: _user !== -1 ? "User Info Has Updata" : "Add Success",
      total: userList.length,
    };
  } else {
    ctx.body = {
      code: 0,
      msg: "Fail",
      total: userList.length,
    };
  }
});

export default userRoute;
