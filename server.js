/* Setting things up. */
var path = require("path"),
  tweetData = require(__dirname + "/tweetData.js"),
  express = require("express"),
  fs = require("fs"),
  helpers = require(__dirname + "/helpers.js"),
  twitter = require(__dirname + "/twitter.js"),
  app = express(),
  res = null;

const { Console } = require("console");
const output = fs.createWriteStream("./stdout.log");
const errorOutput = fs.createWriteStream("./stderr.log");
// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });
// use it like console

app.use(express.static("/"));

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */

app.all(`/${process.env.BOT_ENDPOINT}`, function(req, res) {
  // Select two tags from shuffled array of tags, and convert to string for search
  let tags = helpers
    .prependArrItems(helpers.shuffleArr(tweetData.proTags), "#")
    .slice(0, 2)
    .join(", ");
  twitter.find(tags, 10, function(err, data, response) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      let temp = data.statuses.map(d => {
        return helpers.genReplyTweet(d.user.screen_name, helpers.randomFromArray(tweetData.antiProBrexit));
        // return {
        // user_name: d.user.screen_name,
        // tags: tags,
        // reply_tweet: helpers.randomFromArray(tweetData.random)
        // generated_reply: `@${d.user.screen_name} ${helpers.randomFromArray(tweetData.random)}`
        // };
      });
      temp.forEach(message => console.log(message.generated_reply));
      logger.log(
        data.statuses.map(d => {
          return {
            user_name: d.user.screen_name,
            tags: tags
          };
        })
      );

      res.sendStatus(200);
    }
  });

  // twitter.tweet("Remain remain remain! #🇪🇺#MeEU", function(err, data) {
  //   if (err) {
  //     console.log(err);
  //     res.sendStatus(500);
  //   } else {
  //     console.log("tweeted");
  //     res.sendStatus(200);
  //   }
  // });
});

var listener = app.listen(process.env.PORT, function() {
  console.log("your bot is running on port " + listener.address().port);
});
