let fs = require('fs');
let request = require('request');
let path = require('path');
// 下载单张图片 src是图片的网上地址 dest是你将这图片放在本地的路径 callback可以是下载之后的事}
const downloadImage = (src, dest, callback) => {
  request.head({
    url: src,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36'
    }
  }, (err, res, body) => {
    if (err) {
      console.log(err);
      return;
    }
    src && request({
      url: src,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36'
      }
    }).pipe(fs.createWriteStream(dest)).on('close', () => {
      callback && callback(null, dest);
    });
  });
};
const retry = (src, dest) => {
  downloadImage(src, dest, () => {
    retry(src, dest);
  });
};

let Bagpipe = require('bagpipe');
// 1表示同时发出多少个请求 timeout表示多长时间下载完 这里自定义吧
let bagpipe = new Bagpipe(3, { timeout: 120000 });
const index = '012';
let imageLinks = Array(41).fill(0).map((v, i) => {
  return {
    title: i + 1,
    url: `http://img.itmtu.com/mm/d/dounianglishi/NO.${index}/${(i + 1 + '').padStart(4, '0')}.jpg`
    // url: `http://www.itmtu.net/wp-content/uploads/2020/04/${(i + 1 + '').padStart(4, '0')}-960x2104.jpg`
  };
});
const getSuffix = str => str.slice(str.lastIndexOf('.'));
for (let i = 0; i < imageLinks.length; i++) {
  let item = imageLinks[i];
  const dir = path.join(__dirname, index);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync((dir));
  }
  let destImage = path.join(dir, `${item.title}${getSuffix(item.url)}`);

  bagpipe.push(downloadImage, item.url, destImage, (err, data) => {
    if (err) {
      retry(item.url, destImage);
    } else {
      console.log(path.resolve(data))
    }
  });
}
