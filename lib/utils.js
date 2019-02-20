const fs = require("fs");

module.exports = {
    fileNameExec: function (fileName, firstIsUpper = false) {
        if (firstIsUpper) {
            // 首字母大写
            fileName = fileName.slice(0, 1).toUpperCase() + fileName.slice(1);
        }
        return fileName
            .replace(/_a/g, "A")
            .replace(/_b/g, "B")
            .replace(/_c/g, "C")
            .replace(/_d/g, "D")
            .replace(/_e/g, "E")
            .replace(/_f/g, "F")
            .replace(/_g/g, "G")
            .replace(/_h/g, "H")
            .replace(/_i/g, "I")
            .replace(/_j/g, "J")
            .replace(/_k/g, "K")
            .replace(/_l/g, "L")
            .replace(/_m/g, "M")
            .replace(/_n/g, "N")
            .replace(/_o/g, "O")
            .replace(/_p/g, "P")
            .replace(/_q/g, "Q")
            .replace(/_r/g, "R")
            .replace(/_s/g, "S")
            .replace(/_t/g, "T")
            .replace(/_u/g, "U")
            .replace(/_v/g, "V")
            .replace(/_w/g, "W")
            .replace(/_x/g, "X")
            .replace(/_y/g, "Y")
            .replace(/_z/g, "Z");
    },
    replaceObliqueLine: function (str) {
        let result = "../";
        let strLength = str.split("/").length;
        for (let i = 0; i < strLength; i++) {
            result += "../";
        }
        return result;
    },
    makeDirByModelPath: function (nowExecPath, filePath) {
        let strs = filePath.split("/");
        let path = nowExecPath;
        for (let str of strs) {
            this.makeDir(path += "/" + str);
        }
    },
    makeDir: function (dir) {
        let exists = fs.existsSync(dir);
        if (!exists) {
            fs.mkdirSync(dir);
        }
    }
};