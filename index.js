const http = require('http')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const queue = require('async/queue')

module.exports = class Crawler {
    constructor(options = {}) {
        const defaultOptions = {
            getPath: (page) => '',
            from: 1,
            to: 1,
            reg: /<img.*?src='(.*?)'/g,
            dir: './images/',
            concurrency: 5,
            hostname: '',
        }

        this.options = Object.assign({}, defaultOptions, options)
        this.requestNumber = 0
        this.finishNumber = 0
        this._init()
    }
    _init() {
        const { dir, concurrency, hostname } = this.options

        mkdirp(dir)

        this.queuedRequest = queue((url, callback) => {
            http.get(url, (res) => {
                let rowData = ''
                res
                    .setEncoding('utf-8')
                    .on('data', chunk => rowData += chunk)
                    .on('end', (err) => {
                        callback()
                        if (err) throw err
                        const imgs = []
                        let match
                        while (match = this.options.reg.exec(rowData)) {
                            imgs.push(match[1])
                        }
                        this.requestNumber += imgs.length
                        imgs.forEach(img => this._download(`${hostname}${img}`))
                    })
            })
        }, concurrency)

        this.request = url => this.queuedRequest.push(url)
    }
    _download(url) {
        const imageName = url.slice(url.lastIndexOf('/') + 1)

        http.get(url, res => {
            res.pipe(fs.createWriteStream(this.options.dir + imageName))
            res.on('end', () => {
                this.finishNumber++

                if (this.finishNumber === this.requestNumber) {
                    console.log('done')
                }
            })
        })
    }
    start() {
        const { getPath, from, to } = this.options

        for (let page = from; page <= to; page++) {
            const url = getPath(page)
            this.request(url)
        }
    }
}
