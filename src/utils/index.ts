import { Wallet } from "@tonconnect/sdk"
import { resolve } from "path"
import request from "request"


export const generatePayloadString = (id:string) => {

    const dataJSON = {
        timestrap: Date.now(),
        userId: id,
        type: "Platform",
        chainName: "TON"
    }

    return JSON.stringify(dataJSON)
}

export const getPublicKeyByAddress = (walletInfo: Wallet) => {
    return new Promise((resolve, reject) => {
        request.get(
            `https://${walletInfo.account.chain === "-3" ? "testnet." : ""
            }tonapi.io/v2/accounts/${encodeURI(
              walletInfo.account.address
            )}/publickey`,
            (error, response, body) => {
                
              if (error) {
                reject(error)
                
              }
              resolve(JSON.parse(body))
            }
          );
    })
}

// https://ton-connect.github.io/open-tc?sign=${encodeURIComponent(