import { readFile, writeFile } from "../../utils/file";

export type WalletItemProps = {
    timestrap: number,
    user_id: string,
    type: "Platform",
    chain_name: "TON",
    wallet_address: string,
    payload: any,
    publicKey: string,
    check_message: any,
    signature: string
}

export const readWalletList = async (): Promise<WalletItemProps[]> => {
    const walletList: WalletItemProps[] = await readFile("wallet/wallet.json");
    
    return walletList;
};

export const writeWalletList = async (walletList: WalletItemProps[]) => {
    const text = JSON.stringify(walletList, "" as any, "\t");
    const isOk = await writeFile("wallet/wallet.json", text);
    return isOk;
};
