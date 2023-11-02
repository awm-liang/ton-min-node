import Router from "koa-router";
import axios from "axios"

import {
  ConvertTonProofMessage,
  CreateMessage,
  SignatureVerify,
} from "../utils/tonProof"
import { Wallet } from "@tonconnect/sdk";
import { generatePayloadString } from "../utils";
import { formatDecrypt, parseEncrypt } from "../utils/crypto";
import { WalletItemProps, readWalletList, writeWalletList } from "../model/wallet";

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

type WalletInfoProps = {
  walletInfo: Wallet;
}


walletRouter.get('/get-wallet', async (ctx) => {
  let postData = ctx.request.query as { userId: string };
  const walletList = await readWalletList();

  const _wallet = walletList.find(wallet => wallet.user_id === postData.userId);

  ctx.body = {
    code: 1,
    data: _wallet || [],
    msg: "Success"
  }
})

walletRouter.post("/bind-address", async (ctx) => {

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

    const { data } = await axios(
      `https://${walletInfo.account.chain === "-3" ? "testnet." : ""
      }tonapi.io/v1/wallet/getWalletPublicKey?account=${encodeURI(
        walletInfo.account.address
      )}`
    );

    const pubkey = Buffer.from(data.publicKey, "hex");

    const parsedMessage = ConvertTonProofMessage(walletInfo, _proof);

    const payload = JSON.parse(formatDecrypt(payloadStr));

    const checkMessage = await CreateMessage(parsedMessage);

    const verifyRes = SignatureVerify(
      pubkey,
      checkMessage,
      parsedMessage.Signature
    );

    if (verifyRes) {
      const walletList = await readWalletList();

      const _wallet = walletList.find(wallet => wallet.user_id === payload.userId);

      console.log(_wallet, '_wallet')
      // 钱包不一样
      if(_wallet && _wallet?.wallet_address !== walletInfo.account.address) {
        console.log(_wallet, 'isOK?')
        ctx.body = {
          code: 0,
          msg: `This user has bound the wallet address of ${_wallet?.wallet_address}. Please switch to this wallet to perform operations.`
        }
        return;
      }

      if(_wallet) {
        ctx.body = {
          code: 1,
          data: {
            pubkey,
            parsedMessage,
            checkMessage,
            verifyRes
          },
          msg: "Get Success"
        };
        return;
      }
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

      walletList.push(walletItem);

      console.log('res,', walletList)

      const isOk = await writeWalletList(walletList)

      if(isOk) {
        ctx.body = {
          code: 1,
          data: {
            pubkey,
            parsedMessage,
            checkMessage,
            verifyRes
          },
          msg: "Add Success"
        };
      } else {
        ctx.body = {
          code: 0,
          data: null,
          msg: "Write Wallet Fail"
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
      msg: 'Fail ' + error,
    };
  }
});

export default walletRouter;
