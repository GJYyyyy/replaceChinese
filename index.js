const FileNameFormat = require('./FileNameFormat');

const fnFormat = new FileNameFormat();


// 使用示例
const resFolder = 'D:/gjy/ceyu/yuannei_web_rail/static/monitorV2/img';
const codeFolder = 'D:/gjy/ceyu/yuannei_web_rail/src/views/monitor/monitorV2'

fnFormat.format(resFolder, codeFolder);