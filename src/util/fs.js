const fs = require('fs');
const util = require('util');
const fsAccess = util.promisify(fs.access);
const fsReadFile = util.promisify(fs.readFile);
const fsWriteFile = util.promisify(fs.writeFile);

async function existFile(path) {
    let bool;
    try {
        await fsAccess(path);
        bool = true;
    } catch (err) {}
    return bool;
}

async function readFile(path) {
    let content;
    try {
        content = await fsReadFile(path);
        content = content.toString();
    } catch (err) {
        console.error('readFile failed', err);
    }
    return content;
}

async function writeFile(path, content) {
    let succeed;
    try {
        await fsWriteFile(path, content);
        succeed = true;
    } catch (err) {
        console.error('writeFile failed', err);
    }
    return succeed;
}


module.exports = {
    existFile,
    readFile,
    writeFile,
};