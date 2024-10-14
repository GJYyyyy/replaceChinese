// 引入核心类
const FileNameFormat = require('./src/FileNameFormat');
// 实例化
const fnFormat = new FileNameFormat();

// 具体操作
const folders = [
    [
        'D:/gjy/ceyu/jujia_hospital/src/assets/accstic',
        "D:/gjy/ceyu/jujia_hospital/static2/monitor4"
    ],
    [
        'D:/gjy/ceyu/jujia_hospital/static',
        "D:/gjy/ceyu/jujia_hospital/static2/monitor4"
    ],
    [
        'D:/gjy/ceyu/jujia_hospital/static2/monitor4/img',
        "D:/gjy/ceyu/jujia_hospital/static2"
    ],
]

let folder = folders[2];

fnFormat.format(folder[0], folder[1]);
// fnFormat.formatRes(folder[0]);