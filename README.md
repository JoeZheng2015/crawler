# Crawler

用于学习 Node.js API 写的简单爬虫

## 使用

``` javascript
const Crawler = require('./index')

const options = {
    getPath: (page) => `http://www.socwall.com/wallpapers/page:${page}/`,
    from: 1,
    to: 1,
    reg: /<img.*? src="(.*?)" .*?\/>/g,
    hostname: 'http://www.socwall.com',
}

const crawler = new Crawler(options)
crawler.start()
```

## Licence
MIT