// Require the necessary packages
const Twit = require('twit');
const axios = require('axios');
require('dotenv').config();

// Configure the Twitter API client with your credentials
const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// Define the URL for the Inscribe News API
const inscribeNewsApiUrl = 'https://inscribe.news/api/data/ord-news';

function tweetNews(tweet) {
  T.post('statuses/update', { status: tweet }, function (err, data, response) {
    if (err) {
      console.log('Error in tweeting:', err);
    } else {
      console.log('Tweeted:', data.text);
    }
  });
}

// Set the initial timestamp to start checking for new news from
let latestTimestamp = 0;

async function getAndTweetNews() {
  try {
    const response = await axios.get('https://inscribe.news/api/data/ord-news');
    const news = response.data.keys;
    // console.log(news);
    for (let i = 0; i < news.length; i++) {
      // console.log(news[i].metadata.timestamp);
      const timestamp = Date.parse(news[i].metadata.timestamp);
      // const timestamp = parseInt(new Date(news[i].timestamp).getTime() / 1000);

      if (timestamp > latestTimestamp) {
        const insId = news[i].metadata.id;
        const insContentResponse = await axios.get(`https://inscribe.news/api/content/${insId}`);
        const insContent = insContentResponse.data;
        // console.log(insContent);
        console.log(insContent.title);
        console.log(insContent.link);
        const tweet = `${insContent.title} ${insContent.link}`;
        tweetNews(tweet);
        latestTimestamp = timestamp;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// Call the getAndTweetNews function initially, and then every 60 seconds
getAndTweetNews();
setInterval(getAndTweetNews, 6000 * 1000);
