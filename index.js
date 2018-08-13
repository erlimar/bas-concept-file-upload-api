const express = require('express');
const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const APP_PORT = process.env.PORT || 3000;
const app = express();
const fileUpload = require('express-fileupload');
const bagInfo = utils.getFileBagInfo();

// --------------------------------------------------------
// Inicializa os diretórios locais para guardar os arquivos
// --------------------------------------------------------
if (!fs.existsSync(bagInfo.rootPath)) {
    fs.mkdirSync(bagInfo.rootPath);
}

if (!fs.existsSync(bagInfo.dataPath)) {
    fs.mkdirSync(bagInfo.dataPath);
}

if (!fs.existsSync(bagInfo.infoPath)) {
    fs.mkdirSync(bagInfo.infoPath);
}

// --------------------------------------------------------
// Inicializa o componente FileUpload para Express()
// --------------------------------------------------------
app.use(fileUpload());

// --------------------------------------------------------
// Página inicial
// --------------------------------------------------------
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

// --------------------------------------------------------
// Página para testes
// --------------------------------------------------------
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

// --------------------------------------------------------
// API: POST "/upload" - Faz upload de arquivos
// --------------------------------------------------------
app.post('/upload', function (req, res) {
    if (!req.files)
        return res.status(400).send('Nenhum arquivo enviado');

    let result = [];

    for (let fieldName in req.files) {
        let file = req.files[fieldName],
            fileList = Array.isArray(file)
                ? file : [file];

        for (let fileIndex in fileList) {
            let fileObject = fileList[fileIndex];
            let fileInfo = utils.createFileInfo(fileObject);
            let infoPath = path.resolve(bagInfo.infoPath, fileInfo.id);
            let dataPath = path.resolve(bagInfo.dataPath, fileInfo.dataHash);

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

    if (!result.length)
        return res.status(400).send('Nenhum arquivo enviado');

    res.send(result);
});

// --------------------------------------------------------
// Lista todos os arquivos disponíveis
// --------------------------------------------------------
app.get('/files', (req, res) => {
    let files = utils.getAllFilesInfo().map(file => {
        return {
            name: file.name,
            mimetype: file.mimetype,
            id: file.id
        }
    });

    res.send(files);
});

// --------------------------------------------------------
// Retorna as informações de um único arquivo
// --------------------------------------------------------
app.get('/file/:id', (req, res) => {
    let file = utils.getFileInfo(req.params.id);

    if (!file)
        return res.status(404).send('Arquivo não encontrado!');

    res.send({
        name: file.name,
        mimetype: file.mimetype,
        id: file.id
    });
});

// --------------------------------------------------------
// Faz o download de uma arquivo
// --------------------------------------------------------
app.get('/download/:id', (req, res) => {
    let fileInfo = utils.getFileInfo(req.params.id);

    if (!fileInfo)
        return res.status(404).send('Arquivo não encontrado!');

    let fileDataPath = path.resolve(bagInfo.dataPath, fileInfo.dataHash);

    res.set('Content-Disposition', `attachment;filename=${fileInfo.name}`);
    res.set('Content-Type', fileInfo.mimetype);
    res.sendFile(fileDataPath);
});

// --------------------------------------------------------
// Inicializa aplicativo
// --------------------------------------------------------
app.listen(APP_PORT, function () {
    console.log(`Listening on port ${APP_PORT}...`);
})