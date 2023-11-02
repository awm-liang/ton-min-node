

export const generatePayloadString = (id:string) => {

    const dataJSON = {
        timestrap: Date.now(),
        userId: id,
        type: "Platform",
        chainName: "TON"
    }

    return JSON.stringify(dataJSON)
}