const utils = require("./utils");

module.exports = {
    columnGenerate: function (columns) {
        let fileContent = "";
        let propertyNames = "";
        for (let column of columns) {
            let columnName = column.column_name;

            if (columnName === "created_at" || columnName === "is_deleted" || columnName === "updated_at") {
                continue;
            }

            let columnComment = column.column_comment;
            let propertyName = utils.fileNameExec(columnName);
            let propertyType = "", columnType = "";
            switch (column.data_type) {

                case "bigint":
                    columnType = "BIGINT";
                    propertyType = "number";
                    break;
                case "timestamp":
                    columnType = "TIMESTAMP";
                    propertyType = "timestamp";
                    break;
                case "tinyint":
                    columnType = "BOOLEAN";
                    propertyType = "boolean";
                    break;
                case "varchar":
                    if (column.character_maximum_length > 255) {
                        columnType = "VARCHAR_1024";
                    } else {
                        columnType = "VARCHAR_255";
                    }
                    propertyType = "string";
                    break;
                case "decimal":
                case "double":
                case "float":
                    columnType = "NUMERIC";
                    propertyType = "number";
                    break;
                case "json":
                    columnType = "JSON";
                    propertyType = "any";
                    break;
                case "date":
                    columnType = "DATE";
                    propertyType = "Date";
                    break;
                case "int":
                    columnType = "INT";
                    propertyType = "number";
                    break;
                case "geometry":
                    columnType = "GEOMETRY";
                    propertyType = "any";
                    break;
                case "text":
                case "mediumtext":
                case "longtext":
                    columnType = "TEXT";
                    propertyType = "string";
                    break;
            }

            // 是否有默认值
            if (column.column_default) {
                columnComment += ",默认值:" + column.column_default;
            }
            let columnKey = "PRIMARY_KEY";
            // 是否允许为空
            switch (column.is_nullable) {
                case "YES":
                    columnKey = "NULLABLE";
                    break;
                case "NO":
                    columnKey = "NOT_NULL";
                    break;
            }
            // 是否为主键或索引键
            switch (column.column_key) {
                case "PRI":
                    columnKey = "PRIMARY_KEY";
                    break;
                case "MUL":
                    columnComment += "(索引)";
                    break;
            }

            // 是否为自增
            let defaultValue = "";
            if (column.extra === "auto_increment") {
                defaultValue = ", SqlDefaultValue.SERIAL()";
            }


            let columnContent = `
  @Column("${columnName}", SqlType.${columnType}, SqlFlag.${columnKey}, "${columnComment}"${defaultValue})
  ${propertyName}: ${propertyType};
`;

            fileContent += columnContent;
            propertyNames += `
      ${propertyName}: this.${propertyName},`;
        }

        fileContent += `
  toJSON(): any {
    return {${propertyNames}
    }
  }
`;

        return fileContent;
    }
};