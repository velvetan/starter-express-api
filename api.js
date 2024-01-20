// functions/upload.js
const express = require('express');
const fs = require('fs');
const Client = require('ftp');

const app = express();

const ftpConfig = {
    host: 'storage.bunnycdn.com',
    user: 'gtpsfunweb',
    password: '686d34f3-14b2-4bb0-8f419c100c44-48fc-4cdc'
};

app.get('/upload', async (req, res) => {
    const { name, host } = req.query;

    if (!name || !host) {
        return res.status(400).json({ status: 'failed', message: 'Missing required parameters' });
    }

    const fileName = name + '.txt';
    const fileContent = `${host} growtopia1.com\n${host} growtopia2.com\n${host} www.growtopia1.com\n${host} www.growtopia2.com\n${host} Rvlnd.com`;

    const fullFileName = fileName;

    if (fs.existsSync(fullFileName)) {
        return res.status(400).json({ status: 'failed', message: 'File already exists' });
    }

    fs.writeFileSync(fullFileName, fileContent);

    const ftp = new Client();
    ftp.connect(ftpConfig);

    ftp.on('ready', () => {
        ftp.list((err, list) => {
            if (err) {
                ftp.end();
                return res.status(500).json({ status: 'failed', message: 'FTP error' });
            }

            if (list.some((entry) => entry.name === fullFileName)) {
                ftp.end();
                return res.status(400).json({ status: 'failed', message: 'File already exists on FTP' });
            } else {
                ftp.put(fullFileName, fullFileName, (err) => {
                    ftp.end();

                    if (err) {
                        return res.status(500).json({ status: 'failed', message: 'FTP upload error' });
                    }

                    const fileLink = `https://storage.bunnycdn.com/gtpsfunweb/${fullFileName}`;
                    return res.status(200).json({ status: 'success', host: fileLink });
                });
            }
        });
    });
});

exports.handler = app;
