
export const parseEncrypt = (data: string) => {
    return Buffer.from(data).toString('base64')
}

export const formatDecrypt = (encryptedData: string) => {
    return Buffer.from(encryptedData, 'base64').toString();
}