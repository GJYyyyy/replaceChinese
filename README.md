# replaceChinese

该项目是专门用来将命名不规范的文件名替换为符合规范的文件名的。  
起初是公司要求项目引用的文件名是不能有中文的，所以写了这个项目。

# 使用

```javascript
// 引入核心类
const FileNameFormat = require("./FileNameFormat");
// 实例化
const fnFormat = new FileNameFormat();

/*
如果需要格式化资源文件夹里的文件名，并同步引用了这些资源文件的代码文件，可以使用 format 方法
resFolder为资源文件夹的路径，codeFolder为引用了这些资源的代码文件夹的路径
*/
const resFolder = "C:/yourResFolder";
const codeFolder = "C:/yourCodeFolder";
fnFormat.format(resFolder, codeFolder);

/*
如果需要添加白名单，来阻止一些资源文件被改名
*/
fnFormat.setResWhiteList(['a.scss', 'b.png']);

/*
如果想分开处理资源文件和代码文件，可以这样操作
*/
const resFolder = "C:/yourResFolder";
const codeFolder = "C:/yourCodeFolder";
fnFormat.formatRes(resFolder);
fnFormat.formatCode(codeFolder);

/*
如果只需要格式化资源文件夹里的文件名，可以使用 formatRes 方法
*/
const resFolder = "C:/yourResFolder";
fnFormat.formatRes(resFolder);
```
