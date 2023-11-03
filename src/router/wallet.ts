import Router from "koa-router";
import request from "request"

import {
  ConvertTonProofMessage,
  CreateMessage,
  SignatureVerify,
} from "../utils/tonProof"
import { Wallet } from "@tonconnect/sdk";
import { generatePayloadString, getPublicKeyByAddress } from "../utils";
import { formatDecrypt, parseEncrypt } from "../utils/crypto";
import { WalletItemProps, readWalletList, writeWalletList } from "../model/wallet";
import { UserItemProps, readUser, writeUser } from "../model/user";

let walletRouter = new Router();

type GeneratePayloadProps = {
  userId: string;
}

walletRouter.post("/generatePayload", async (ctx) => {
  const postData = ctx.request.body as GeneratePayloadProps;

  const str = generatePayloadString(postData.userId);
  const text = parseEncrypt(str);

  ctx.body = {
    code: 1,
    msg: 'Success',
    data: text
  }
})


walletRouter.get('/get-wallet', async (ctx) => {
  let postData = ctx.request.query as { userId: string };
  const walletList = await readWalletList();

  const _wallet = walletList.find(wallet => wallet.user_id.toString() === postData.userId.toString());

  ctx.body = {
    code: 1,
    data: _wallet,
    msg: "Success"
  }
})

type WalletInfoProps = {
  walletInfo: Wallet;
  userInfo: any
}

walletRouter.post("/register", async (ctx) => {

  let postData = ctx.request.body as WalletInfoProps;

  const walletInfo = postData.walletInfo;

  const _proof = walletInfo?.connectItems?.tonProof as any;

  const payloadStr = _proof?.proof?.payload;

  if (!_proof || !payloadStr) {
    ctx.body = {
      code: 0,
      data: "The wallet requires a signature to bind！",
    };
    return;
  }


  try {
    console.log(1)
  const data: any = await getPublicKeyByAddress(walletInfo);
  if(data.public_key === undefined) {
    throw JSON.stringify(data)
  }
  console.log(2, data)
  const pubkey = Buffer.from(data.public_key, "hex");
  console.log(3)
  const parsedMessage = ConvertTonProofMessage(walletInfo, _proof);
  console.log(4)
  const payload = JSON.parse(formatDecrypt(payloadStr));
  console.log(5)
  const checkMessage = await CreateMessage(parsedMessage);
  console.log(6)
  const verifyRes = SignatureVerify(
    pubkey,
    checkMessage,
    parsedMessage.Signature
  );
  if (verifyRes) {
    const walletList = await readWalletList();
    const userList = await readUser();

    const _userIndex = userList.findIndex(user => user.id.toString() === payload.userId.toString())
    const param = postData.userInfo;

    // 钱包不一样
    if (_userIndex !== -1 && userList[_userIndex].wallet_address !== walletInfo.account.address) {
      ctx.body = {
        code: 0,
        msg: `This user has bound the wallet address of ${userList[_userIndex].wallet_address}. Please switch to this wallet to perform operations.`
      }
      return;
    }

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
      isRegister: true,
      wallet_address: walletInfo.account.address
    };


    const walletItem: WalletItemProps = {
      "timestrap": Date.now(),
      "user_id": payload.userId,
      "type": "Platform",
      "chain_name": "TON",
      "wallet_address": walletInfo.account.address,
      "payload": payload,
      "publicKey": pubkey.toString(),
      "check_message": checkMessage.toString(),
      "signature": parsedMessage.Signature.toString()
    }


    let isOk;
    if (_userIndex !== -1) { // 更新用户信息
      console.log('更新用户信息')
      userList[_userIndex] = userItem;
      isOk = true;
    } else { // 新增用户信息
      console.log('新增用户信息')
      userList.push(userItem);
      walletList.push(walletItem);
      isOk = await writeWalletList(walletList)
    }
    const writeRes = await writeUser(userList);
    if (isOk && writeRes) {
      ctx.body = {
        code: 1,
        data: {
          pubkey,
          checkMessage,
          parsedMessage: parsedMessage.Signature
        },
        msg: _userIndex !== -1 ? "User Info Has Updata" : "Add Success",
      };
    } else {
      console.log(6)
      console.log('失败')
      ctx.body = {
        code: 0,
        data: null,
        msg: "Write User Fail"
      };
    }
  } else {
    ctx.body = {
      code: 0,
      data: null,
      msg: "Wallet signature verification failed"
    };
  }

  } catch (error) {
    ctx.body = {
      code: 0,
      data: null,
      msg: "Get PublicKey error: " + error
    };
  }
  
});

export default walletRouter;
