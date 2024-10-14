const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const isBinaryFile = require('isbinaryfile').isBinaryFile;

module.exports = class FileNameFormat {
    // 原文件名和随机文件名的映射表
    #fileNameMap = new Map();
    #fileNameMapFileName = 'fileNameMap.json';
    #logFileName = 'log.txt';
    #resFileFormatRule = /^\d{13}_\w{32}\.\w{1,4}$/;
    #whiteList = [];
    #encoding = 'utf8';

    #log(...txts) {
        console.log(...txts);
        for (let txt of txts) {
            if (txt instanceof Error) txt = txt.toString();
            fs.appendFileSync(this.#logFileName, `${txt}\r\n\r\n`);
        }
    }

    #init() {
        fs.writeFileSync(this.#logFileName, '');
    }

    /**
     * 递归遍历文件夹
     * @param {String} filePath 文件夹或文件名
     * @param {Function} callback 回调函数
     */
    #traverseFolder(filePath, callback) {

        // 将路径中的反斜杠“\”替换为斜杠“/”
        filePath = filePath.replace(/\\/g, '/');

        // 检查当前路径是文件还是文件夹，如果是文件夹，则递归调用 #traverseFolder 函数
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {

            // 获取文件夹内所有文件和文件夹
            const items = fs.readdirSync(filePath);

            // 遍历每一个文件或文件夹
            items.forEach(item => {
                // 构建完整的路径
                const itemPath = path.join(filePath, item);

                this.#traverseFolder(itemPath, callback);
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
    #genRandomFileName(originFileName) {
        let timestamp = new Date().getTime();
        let extName = originFileName.split('.').pop();
        return `${timestamp}_${md5(originFileName)}.${extName}`;
    }

    /**
     * 获取离文件名最近的目录名
     * @param {String} filePath 
     * @returns 
     */
    #getClosestPath(filePath) {
        let pathnameArr = filePath.split('/');
        let closestPathname = pathnameArr[pathnameArr.length - 2];

        return closestPathname;
    }

    /**
     * 转义正则表达式的特殊字符
     * @param {String} str 
     * @returns 
     */
    #regExpEscaping(str) {
        let escapingMap = [
            '\\*',
            '\\+',
            '\\?',
            '\\|',
            '\\{',
            '\\}',
            '\\(',
            '\\)',
            '\\^',
            '\\$',
            '\\.',
        ]

        for (let escapChar of escapingMap) {
            let regExp = new RegExp(escapChar, 'g');
            str = str.replace(regExp, escapChar);
        }
        return str;
    }

    /**
     * 替换文件里的一个资源文件
     * @param {String} fileContent 
     * @param {String} oldFileName 
     * @param {String} newFileName 
     * @returns 
     */
    #replaceOneRes(fileContent, oldFileName, newFileName) {
        // url转义
        let oldFileName1 = encodeURI(oldFileName);
        let oldFileName2 = encodeURIComponent(oldFileName);

        // 正则转义
        let _oldFileName = this.#regExpEscaping(oldFileName);
        let _oldFileName1 = this.#regExpEscaping(oldFileName1);
        let _oldFileName2 = this.#regExpEscaping(oldFileName2);

        // 匹配正则
        let regExp = new RegExp(
            `/(${_oldFileName}|${_oldFileName1}|${_oldFileName2})`,
            'gmui'
        )

        // 替换内容
        let replacer = `/${newFileName}`;

        return fileContent.replace(regExp, replacer);
    }

    /**
     * 替换文件内容
     * @param {String} filePath 
     */
    #replaceFileContent(filePath) {
        isBinaryFile(filePath).then(isBinary => {
            if (isBinary) {
                this.#log(`${filePath}是二进制文件，无需替换内容`);
            } else {
                try {
                    // 同步读取文件内容
                    let content = fs.readFileSync(filePath, this.#encoding);

                    for (let [oldFileName, newFileName] of this.#fileNameMap) content = this.#replaceOneRes(content, oldFileName, newFileName);

                    // 将替换后的内容写回文件
                    fs.writeFileSync(filePath, content, this.#encoding);

                } catch (err) {
                    this.#log(`文件内容替换失败:${err.toString()}`);
                }
            }
        }).catch(err => {
            this.#log(err);
        })
    }

    #bubbleSort() {
        let arr = Array.from(this.#fileNameMap);

        let arrSorted = arr.sort((a, b) => b[0].length - a[0].length);

        this.#fileNameMap = new Map(arrSorted);
    }

    /**
     * 设置不需要被改名的资源文件列表
     * @param {Arrar} whiteList 
     */
    setResWhiteList(whiteList) {
        this.#whiteList = whiteList;
    }

    /**
     * 将代码文件夹里引用到的资源文件名同步更改
     * @param {String} codeFolder 代码文件夹
     */
    formatCode(codeFolder, flag = false) {

        if (flag === false) {
            let fileNameMapContent = fs.readFileSync(this.#fileNameMapFileName, this.#encoding);
            this.#fileNameMap = new Map(JSON.parse(fileNameMapContent));
        }

        // 递归遍历代码文件夹
        this.#traverseFolder(codeFolder, (fileName, filePath) => {
            this.#replaceFileContent(filePath);
        })
    }

    /**
     * 格式化资源文件名
     * 将资源文件夹里的文件的文件名格式化
     * @param {String} #resFolder 资源文件夹
     */
    formatRes(resFolder) {
        this.#init();
        // 递归遍历资源文件夹
        this.#traverseFolder(resFolder, (fileName, filePath) => {
            let randomFileName = this.#genRandomFileName(fileName);

            // 如果文件名满足一定规则，则不做转换
            if (this.#resFileFormatRule.test(fileName)) return;

            // 如果是白名单文件，则不做转换
            if (this.#whiteList.includes(fileName)) return;

            try {
                fs.renameSync(filePath, filePath.replace(fileName, randomFileName));

                let closestPathname = this.#getClosestPath(filePath);

                // 添加文件名映射表
                this.#fileNameMap.set(`${closestPathname}/${fileName}`, `${closestPathname}/${randomFileName}`);
            } catch (err) {
                this.#log(`文件重命名失败:${err.toString()}`);
            }
        })

        this.#bubbleSort();

        try {
            fs.writeFileSync(this.#fileNameMapFileName, JSON.stringify(Array.from(this.#fileNameMap), undefined, 4));
        } catch (err) {
            this.#log(`文件内容写入失败:${err}`);
        }
    }

    /**
     * 格式化文件名
     * 将资源文件夹里的文件的文件名格式化，并且将代码文件夹里引用到的资源文件名同步更改
     * @param {String} resFolder 资源文件夹
     * @param {String} codeFolder 代码文件夹
     */
    format(resFolder, codeFolder) {
        this.formatRes(resFolder);
        this.formatCode(codeFolder, true);
    }
}