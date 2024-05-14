const fs = require('fs');
const path = require('path');
const md5 = require('./md5.min.js');


module.exports = class FileNameFormat {
    // 原文件名和随机文件名的映射表
    fileNameMap = new Map();

    /**
     * 递归遍历文件夹
     * @param {String} filePath 文件夹或文件名
     * @param {Function} callback 回调函数
     */
    traverseFolder(filePath, callback) {

        // 将路径中的反斜杠“\”替换为斜杠“/”
        filePath = filePath.replace(/\\/g, '/');

        // 检查当前路径是文件还是文件夹，如果是文件夹，则递归调用 traverseFolder 函数
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {

            // 获取文件夹内所有文件和文件夹
            const items = fs.readdirSync(filePath);

            // 遍历每一个文件或文件夹
            items.forEach(item => {
                // 构建完整的路径
                const itemPath = path.join(filePath, item);

                this.traverseFolder(itemPath, callback);
            });
        }
        // 如果是文件，则打印文件名
        else {
            let fileName = filePath.split('/').pop();
            callback(fileName, filePath);
        }
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
     */
    replaceFileContent(filePath) {
        try {
            // 同步读取文件内容
            let content = fs.readFileSync(filePath, 'utf8');

            for (let [searchStr, replacer] of this.fileNameMap) {

                // 将searchStr字符串替换为replacer
                content = content.replace(new RegExp(searchStr, 'gmui'), replacer);

            }

            // 将替换后的内容写回文件
            fs.writeFileSync(filePath, content, 'utf8');
        } catch (err) {
            console.error('文件内容替换失败:', err);
        }
    }

    /**
     * 格式化文件名
     * 将资源文件夹里的文件的文件名格式化
     * @param {String} resFolder 资源文件夹
     */
    formatRes(resFolder) {
        // 递归遍历资源文件夹
        this.traverseFolder(resFolder, (fileName, filePath) => {
            let randomFileName = this.genRandomFileName(fileName);

            // 如果文件名满足一定规则，则不做转换
            if (/^\d{13}_\w{32}\.\w{1,4}$/.test(fileName)) return;

            try {
                fs.renameSync(filePath, filePath.replace(fileName, randomFileName));
                // 添加文件名映射表
                this.fileNameMap.set(fileName, randomFileName);
            } catch (err) {
                console.error('文件重命名失败:', err);
            }
        })

        try {
            fs.writeFileSync('./fileNameMap.json', JSON.stringify(Array.from(this.fileNameMap)));
        } catch (err) {
            console.error('文件内容写入失败:', err);
        }
    }

    /**
     * 格式化文件名
     * 将代码文件夹里引用到的资源文件名同步更改
     * @param {String} codeFolder 代码文件夹
     */
    formatCode(codeFolder) {
        // 递归遍历代码文件夹
        this.traverseFolder(codeFolder, (fileName, filePath) => {
            this.replaceFileContent(filePath);
        })
    }

    /**
     * 格式化文件名
     * 将资源文件夹里的文件的文件名格式化，并且将代码文件夹里引用到的资源文件名同步更改
     * @param {String} resFolder 资源文件夹
     * @param {String} codeFolder 代码文件夹
     */
    format(resFolder, codeFolder) {
        this.formatRes(resFolder);
        this.formatCode(codeFolder);
    }
}