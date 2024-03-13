const express = require('express');
const os = require('node:os');
const fs = require('node:fs');
const {URL} = require('node:url');
const path = require('node:path');
// const {tryUsePort} = require('./utils');
const axios = require("axios");

// 根目录
const root = os.homedir();
const fileName = 'quickRequest.json';
const basePath = path.join(root, fileName);

const app = express();

let port = 9527;

function createJson() {
    fs.writeFile(basePath, '', (err) => {
        if (err) {
            console.error('创建文件时出错:', err);
        } else {
            console.log('文件创建成功！');
        }
    });
}

function getRouterUrl(config) {
    const {name} = config
    if (name) {
        return name;
    } else {
        const parseUrl = new URL(config.url);
        const {pathname} = parseUrl;
        return pathname;
    }
}

function createRequest(data) {
    data.forEach(config => {
        const url = getRouterUrl(config);
        const {method = 'get'} = config;
        app[method](url, (req, res) => {
            axios(config).then(function (response) {
                console.log(response, 'response')
                res.status(200).send(JSON.parse(JSON.stringify(response.data)));
            })
                .catch(function (error) {
                    console.log(error);
                });
        })
    })
}

function readJson() {
    fs.readFile(basePath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件时出错:', err);
        } else {
            try {
                const jsonData = JSON.parse(data);
                createRequest(jsonData);
            } catch (error) {
                console.log('json格式错误')
            }
        }
    });
}

function checkJson() {
    fs.stat(basePath, (err, stats) => {
        if (err) {
            console.log('文件不存在');
            createJson();
        } else {
            if (stats.isFile()) {
                console.log('文件存在');
                readJson();
            } else {
                console.log('路径存在，但是不是一个文件');
            }
        }
    });
}

app.listen(port, () => {
    console.log('服务已启动');
    checkJson();
})


