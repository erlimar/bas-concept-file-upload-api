const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const algorithm = 'md5';
const fileBagPath = path.resolve(__dirname, 'files');
const fileBagDataPath = path.resolve(fileBagPath, 'data');
const fileBagInfoPath = path.resolve(fileBagPath, 'info');

module.exports = {
    getFileBagInfo: function() {
        return {
            rootPath: fileBagPath,
            dataPath: fileBagDataPath,
            infoPath: fileBagInfoPath
        }
    },

    createFileInfo: function(fileUploaded){
        let hashName = crypto.createHash(algorithm);
        let hashData = crypto.createHash(algorithm);
        let idHash = crypto.createHash(algorithm);

        hashName.update(fileUploaded.name);
        hashData.update(fileUploaded.data);

        let info = {
            name: fileUploaded.name,
            mimetype: fileUploaded.mimetype,
            dataHash: hashData.digest('hex'),
            nameHash: hashName.digest('hex'),
        }

        info.id = idHash.update(info.dataHash + info.nameHash).digest('hex');

        return info;
    },

    getAllFilesInfo: function() {
        return fs.readdirSync(fileBagInfoPath).map(fileName => {
            let filePath = path.resolve(fileBagInfoPath, fileName);
            let content = fs.readFileSync(filePath);
            return JSON.parse(content);
        });
    },

    getFileInfo: function(id) {
        return this.getAllFilesInfo()
            .filter(fileInfo => fileInfo.id === id)[0];
    }
}