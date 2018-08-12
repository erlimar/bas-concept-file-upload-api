const express = require('express');
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const APP_PORT = process.env.PORT || 3000;
const app = express();
const fileUpload = require('express-fileupload');
const fileBagPath = path.resolve(__dirname, 'files');
const fileBagDataPath = path.resolve(fileBagPath, 'data');
const fileBagInfoPath = path.resolve(fileBagPath, 'info');

if (!fs.existsSync(fileBagPath)) {
    fs.mkdirSync(fileBagPath);
}

if (!fs.existsSync(fileBagDataPath)) {
    fs.mkdirSync(fileBagDataPath);
}

if (!fs.existsSync(fileBagInfoPath)) {
    fs.mkdirSync(fileBagInfoPath);
}

app.use(fileUpload());

app.get('/', (req, res) => {
    res.send(`
<html>
  <body>
    <h1>Prova de conceito BAS</h1>
    <h2>API para upload de arquivos</h2>
    <h3>Página inicial</h3>

    <ul>
      <li><a href="/test">Página para testes</a></li>
    </ul>
  </body>
</html>
    `);
});

app.get('/test', (req, res) => {
    res.send(`
<html>
  <body>
    <h1>Prova de conceito BAS</h1>
    <h2>API para upload de arquivos</h2>
    <p>Página de testes | <a href="/">voltar para página inicial</a></p>
    <form
      action="/upload"
      method="post"
      encType="multipart/form-data">
        <input multiple type="file" name="files" />
        <input type="submit" value="Enviar!" />
    </form>
  </body>
</html>
`);
});

app.post('/upload', function (req, res) {
    if (!req.files)
        return res.status(400).send('Nenhum arquivo enviado');

    let result = [];

    for(let fieldName in req.files){
        let file = req.files[fieldName],
            fileList = Array.isArray(file)
                ? file : [file];

        for(let fileIndex in fileList){
            let fileObject = fileList[fileIndex];
            let fileInfo = utils.createFileInfo(fileObject);
            let infoPath = path.resolve(fileBagInfoPath, fileInfo.id);
            let dataPath = path.resolve(fileBagDataPath, fileInfo.dataHash);


            fs.writeFileSync(infoPath, JSON.stringify(fileInfo, null, 4));

            if (!fs.existsSync(dataPath)) {
                fileObject.mv(dataPath, (err) => {
                    if (err)
                        return res.status(500).send(err);
                });
            }

            result.push({
                fileName: fileInfo.name,
                fileId: fileInfo.id
            });
        }
    }

    res.send(result);
});

app.listen(APP_PORT, function () {
    console.log(`Listening on port ${APP_PORT}...`);
})