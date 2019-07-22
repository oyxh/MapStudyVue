/* eslint-disable no-useless-constructor */
import XLSX from 'xlsx'
class ImportWindow {
  constructor (thisDom, output) { // thisDom:弹出窗口,output输出对象
    this._thisDom = thisDom
    this._output = output
    this.init()
  }
  init () {
    this._thisDom.$Modal.confirm({
      title: '请选择导入文件（仅支持xls,xlsx）：',
      render: (h) => {
      // <input type="file" ref="upload" accept=".xls,.xlsx" class="outputlist_upload">
        const inputData = [{
          domProps: {
            type: 'file',
            ref: 'upload',
            accept: '.xls,.xlsx',
            class: 'outputlist_upload'
          },
          on: {
            input: (val) => {
              // that._labelName = that._layerData.polygonName = val.target.value
            }
          }
        }
        ]
        return h('div', inputData.map(item => h('input', item)))
      },
      onOk: function () {
        alert('it is ok')
      },
      onCancel: function () {
        alert('it is cancel')
      }
    })
  }
  readExcel (e) { // 表格导入
    var that = this
    const files = e.target.files
    console.log(files)
    if (files.length <= 0) { // 如果没有文件名
      return false
    } else if (!/\.(xls|xlsx)$/.test(files[0].name.toLowerCase())) {
      this.$Message.error('上传格式不正确，请上传xls或者xlsx格式')
      return false
    }

    const fileReader = new FileReader()
    fileReader.onload = (ev) => {
      try {
        const data = ev.target.result
        const workbook = XLSX.read(data, {
          type: 'binary'
        })
        const wsname = workbook.SheetNames[0]// 取第一张表
        const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])// 生成json表格内容
        console.log(ws)
        that.outputs = []// 清空接收数据
        // 编辑数据
        for (var i = 0; i < ws.length; i++) {
          var sheetData = {
            address: ws[i].addr,
            value: ws[i].value
          }
          that.outputs.push(sheetData)
        }
        this.$refs.upload.value = ''
      } catch (e) {
        return false
      }
    }
    fileReader.readAsBinaryString(files[0])
  }
  get thisDom () {
    return this._thisDom
  }
  set thisDom (thisDom) {
    this._thisDom = thisDom
  }
  get output () {
    return this._output
  }
  set output (output) {
    this._output = output
  }
}
export default ImportWindow
