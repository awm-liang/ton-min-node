import fs from 'fs';
import path from 'path'

export const readFile = (url: string) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../', 'model', url), "utf8");
        // parse JSON string to JSON object
        const config = JSON.parse(data);
        return config;
    } catch (err) {
        console.log(`Error reading file from disk: ${url} -- ${err}`);
        return false
    }
}

export const writeFile = (url: string, text: string) => {
    try {
        fs.writeFileSync(path.join(__dirname, '../', 'model', url), text);
        return true;
    } catch (err) {
        console.log(`Error reading file from disk: ${err}`);
        return false;
    }
}