const fs = require('fs');
const path = require('path');
const md5 = require('./md5.min.js');


module.exports = class FileNameFormat {
    // 原文件名和随机文件名的映射表
    fileNameMap = new Map();

    /**
     * 递归遍历文件夹
     * @param {String} folderPath 文件夹
     * @param {Function} callback 回调函数
     */
    traverseFolder(folderPath, callback) {
        // 获取文件夹内所有文件和文件夹
        const items = fs.readdirSync(folderPath);

        // 遍历每一个文件或文件夹
        items.forEach(item => {
            // 构建完整的路径
            const itemPath = path.join(folderPath, item);

            // 检查当前路径是文件还是文件夹
            const stats = fs.statSync(itemPath);

            // 如果是文件夹，则递归调用 traverseFolder 函数
            if (stats.isDirectory()) {
                this.traverseFolder(itemPath, callback);
            }
            // 如果是文件，则打印文件名
            else {
                callback(item, itemPath);
            }
        });
    }

    /**
     * 根据原始文件名生成随机文件名（不带中文）
     * @param {String} originFileName 原始文件名
     */
    genRandomFileName(originFileName) {
        let timestamp = new Date().getTime();
        let extName = originFileName.split('.').pop();
        return `${timestamp}_${md5(originFileName)}.${extName}`;
    }

    /**
     * 替换文件内容
     * @param {String} filePath 
     * @param {String} searchStr 
     * @param {String} replacer 
     */
    replaceFileContent(filePath, searchStr, replacer) {
        try {
            // 同步读取文件内容
            let content = fs.readFileSync(filePath, 'utf8');

            // 将searchStr字符串替换为replacer
            content = content.replace(new RegExp(searchStr), replacer);

            // 将替换后的内容写回文件
            fs.writeFileSync(filePath, content, 'utf8');

            // console.log('文件内容替换成功');
        } catch (err) {
            console.error('文件内容替换失败:', err);
        }
    }

    /**
     * 格式化文件名
     * 将资源文件夹里的文件的文件名格式化，并且将代码文件夹里引用到的资源文件名同步更改
     * @param {String} resFolder 资源文件夹
     * @param {String} codeFolder 代码文件夹
     */
    format(resFolder, codeFolder) {

        // 递归遍历资源文件夹
        this.traverseFolder(resFolder, (fileName, filePath) => {
            let randomFileName = this.genRandomFileName(fileName);
            // console.log(`${fileName}\r\n${filePath}\r\n${randomFileName}`);

            // 如果文件名满足一定规则，则不做转换
            if (/\d{13}_\w{32}\.\w{1,4}/.test(fileName)) return;

            try {
                fs.renameSync(filePath, filePath.replace(fileName, randomFileName));
                // 添加文件名映射表
                this.fileNameMap.set(fileName, randomFileName);
            } catch (err) {
                console.error('文件重命名失败:', err);
            }
        })

        // console.log(this.fileNameMap, this.fileNameMap.size);

        // 递归遍历代码文件夹
        this.traverseFolder(codeFolder, (fileName, filePath) => {
            for (let [originFileName, randomFileName] of this.fileNameMap) {
                this.replaceFileContent(filePath, originFileName, randomFileName);
            }
        })
    }
}