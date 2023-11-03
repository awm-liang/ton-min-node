import { readFile, writeFile } from "../../utils/file";

export type UserItemProps = {
    id: string,
    gender?: string,
    name: {
        username?: string,
        first?: string,
        last?: string
    },
    email?: string,
    picture?: string,
    isRegister: boolean,
    wallet_address: string,
}

export const readUser = async (): Promise<UserItemProps[]> => {
    const isOk = await readFile("user/user.json");
    return isOk;
};

export const writeUser = async (userList: UserItemProps[]) => {
    const text = JSON.stringify(userList, "" as any, "\t");
    const isOk = await writeFile("user/user.json", text);
    return isOk;
};
