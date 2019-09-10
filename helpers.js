const fs = require("fs");
const path = require("path");
const request = require("request");

module.exports = {
  compose: (...fns) => x => fns.reduceRight((v, f) => f(v), x),
  pipe: (...fns) => x => fns.reduce((v, f) => f(v), x),
  randomFromArray: arr => {
    if (!arr) {
      return false;
    }
    return arr[Math.floor(Math.random() * arr.length)];
  },
  getRandomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  getRandomRange: (min, max, fixed) => (Math.random() * (max - min) + min).toFixed(fixed) * 1,
  prependArrItems: (arr, str) => arr.map(arrItem => `${str}${arrItem}`),
  genReplyTweet: (username, reply) => {
    return { generated_reply: `@${username} ${reply}` };
  },
  shuffleArr: arr => arr.sort(() => 0.5 - Math.random()),
  loadImageAssets(cb) {
    /* Load images from the assets folder */
    console.log("reading assets folder...");
    var that = this;
    fs.readFile("./assets", "utf8", function(err, data) {
      if (err) {
        console.log("error:", err);
        if (cb) {
          cb(err);
        }
        return false;
      }
      data = data.split("\n");
      var data_json = JSON.parse("[" + data.join(",").slice(0, -1) + "]"),
        deleted_images = data_json.reduce(function(filtered, data_img) {
          if (data_img.deleted) {
            var someNewValue = { name: data_img.name, newProperty: "Foo" };
            filtered.push(data_img.uuid);
          }
          return filtered;
        }, []),
        img_urls = [];

      for (var i = 0, j = data.length; i < j; i++) {
        if (data[i].length) {
          var img_data = JSON.parse(data[i]),
            image_url = img_data.url;

          if (image_url && deleted_images.indexOf(img_data.uuid) === -1 && that.extensionCheck(image_url)) {
            var file_name = that.getFilenameFromUrl(image_url).split("%2F")[1];
            img_urls.push(image_url);
          }
        }
      }
      if (cb) {
        cb(null, img_urls);
      }
    });
  },
  loadRemoteImage(img_url, cb) {
    if (!img_url) {
      console.log("missing remote image URL");
      return false;
    }
    console.log(`loading remote image: ${img_url} ...`);
    request({ url: img_url, encoding: null }, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        var b64content = "data:" + res.headers["content-type"] + ";base64,";
        if (cb) {
          cb(null, body.toString("base64"));
        }
      } else {
        console.log("error:", err);
        if (cb) {
          cb(err);
        }
      }
    });
  },
  extensionCheck(url) {
    var file_extension = path.extname(url).toLowerCase(),
      extensions = [".png", ".jpg", ".jpeg", ".gif"];
    return extensions.indexOf(file_extension) !== -1;
  },
  getFilenameFromUrl(url) {
    return url.substring(url.lastIndexOf("/") + 1);
  }
};
