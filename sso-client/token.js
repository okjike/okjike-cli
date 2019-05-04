const util = require('util');
const fs = require('fs');

function SSOToken(filePath) {

    this.filePath = filePath;

}

module.exports = SSOToken;

SSOToken.prototype.inspect = function () {
    return '{}'
}

SSOToken.prototype.setToken = function setToken(params) {
    this.setTokenToFile(params)
}

SSOToken.prototype.setTokenToFile = function setTokenToFile(params) {
    fs.writeFile(this.filePath, JSON.stringify(params), (err) => {
        if (err) throw err;
        //cb(null);
    });
}
