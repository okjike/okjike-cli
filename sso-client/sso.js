const SESSIONS_CREATE = 'https://app.jike.ruguoapp.com/sessions.create';
const UUID_SCAN = 'https://ruguoapp.com/account/scan?uuid=';
const QR_ORIGN_CODE = 'jike://page.jk/web?displayHeader=false&displayFooter=false&url=';
const SESSIONS_WATI_FOR_LOGIN = 'https://app.jike.ruguoapp.com/sessions.wait_for_login';
const SESSIONS_WATI_FOR_CONFIRMATION = 'https://app.jike.ruguoapp.com/sessions.wait_for_confirmation';


const http = require('http');
const url = require('url');
const request = require('request');
const queryString = require('querystring');
const os = require('os');
const path = require('path');

const HOME_DIR = os.homedir();
const JAR_FILE = path.join(HOME_DIR, '.okjike.json');
const qrcode = require('qrcode-terminal');
const FileCookieStore = require('./filestore');
const Token = require('./token');

const jikeToken = new Token(JAR_FILE);

const client = request.defaults({
    jar: true,
    header: {
        authority: 'app.jike.ruguoapp.com',
        method: 'GET',
        scheme: 'https',
        accept: 'application/json',
        'app-version': '4.1.0',
        'content-type': 'application/json',
        'platform': 'web',
        Referer: "https://web.okjike.com/login",
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    }
});

const fetchLoginToken = () => {
    return new Promise((resolve, reject) => {
        client.post({
            url: SESSIONS_CREATE,
        }, (e, res, body) => {
            console.log(body);
            if (e) {
                reject(e);
                return;
            }
            let { uuid } = JSON.parse(body);
            console.log(uuid);
            if (!uuid) {
                reject(body);
                return;
            }
            resolve(JSON.parse(body));
        })
    })
}

const sleep = time => {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    })
}

const fetchLoginInApp = data => {
    return new Promise((resolve, reject) => {
        console.log(data);
        sleep(2000).then(() => {
            client.get({
                url: SESSIONS_WATI_FOR_LOGIN + '?uuid=' + data,
                // data: { uuid: data },

            }, (e, res, body) => {
                console.log(body);
                fetchLoginConfirm(data).then((cb) => {
                    console.log(cb);
                    resolve(cb);
                })
            })
        })
    })
}

const fetchLoginConfirm = data => {
    return new Promise((resolve, reject) => {
        client.get({
            url: SESSIONS_WATI_FOR_CONFIRMATION + '?uuid=' + data,
            // data: { uuid: data }
        }, (e, ress, body) => {
            console.log(body);
            resolve(body);
        })
    })
}

const Login = callback => {
    return new Promise((resolve, reject) => {
        fetchLoginToken().then((data) => {

            let { uuid } = data;
            if (!uuid) {
                reject('获取uuid失败');
                return;

            }
            console.log('use jike app scan qrcode');
            const url = encodeURIComponent(UUID_SCAN + uuid);
            const qrOriginCode = QR_ORIGN_CODE + url;
            qrcode.generate(qrOriginCode);

            fetchLoginInApp(uuid).then((data) => {
                console.log('fetchLogin', data);

                jikeToken.setToken(data);
            })
        })
    })
}
module.exports = function () {
    return new Promise((resolve, reject) => {
        checkLoginStatus(url).then((data) => {
            console.log(data);
            resolve();
        }).catch(() => {
            Login(url).catch(reject)
        });
    })
}

const checkLoginStatus = function (url) {
    return new Promise((resolve, reject) => {
        const file = require(JAR_FILE);
        console.log(file);
        const tokenInfo = JSON.parse(file);
        console.log('tokenInfo', tokenInfo);
        const tokenKey = 'x-jike-refresh-token';
        if (!tokenInfo[tokenKey]) {
            return reject();
        }
        resolve('2');
    })
}
