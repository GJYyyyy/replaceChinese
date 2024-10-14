// 引入核心类
const FileNameFormat = require('./src/FileNameFormat');
// 实例化
const fnFormat = new FileNameFormat();

// 具体操作
const replaces = [
    {
        whiteList: [],
        resFolder: 'D:/gjy/ceyu/jujia_hospital/static2/monitor4/img',
        codeFolder: "D:/gjy/ceyu/jujia_hospital/static2",
    },
    {
        whiteList: ['custom.scss', 'customElementUI.scss', 'customMonitor.scss'],
        resFolder: 'D:/gjy/ceyu/jujia_hospital/src/assets',
        codeFolder: "D:/gjy/ceyu/jujia_hospital/src",
    },
    {
        whiteList: [],
        resFolder: 'D:/gjy/ceyu/jujia_hospital/static',
        codeFolder: "D:/gjy/ceyu/jujia_hospital/src",
    },
]

let replace = replaces[2];

fnFormat.setResWhiteList(replace.whiteList);
fnFormat.format(replace.resFolder, replace.codeFolder);