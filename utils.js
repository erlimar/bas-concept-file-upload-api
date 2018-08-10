const crypto = require('crypto');
const algorithm = 'md5';

module.exports = {
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
    }
}