// Require the necessary packages
const Twit = require('twit');
const axios = require('axios');

// Configure the Twitter API client with your credentials
const T = new Twit({
  consumer_key: '<your_consumer_key>',
  consumer_secret: '<your_consumer_secret>',
  access_token: '<your_access_token>',
  access_token_secret: '<your_access_token_secret>'
});

// Define the URL for the Inscribe News API
const inscribeNewsApiUrl = 'https://inscribe.news/api/info/';

// Set the initial timestamp to start checking for new news from
let lastTimestamp = Date.now();

// Define the function to retrieve the news headlines from the Inscribe News API and tweet them
async function getAndTweetNews() {
  try {
    // Retrieve the news headlines from the Inscribe News API
    const response = await axios.get(inscribeNewsApiUrl);

    // Filter the headlines to only include those in the Ordinal News Standard format and with a timestamp greater than the last one
    const filteredHeadlines = response.data.filter((headline) => {
      return /^\d+\.\s/.test(headline.text) && headline.timestamp > lastTimestamp;
    });

    // If there are any filtered headlines, tweet them and update the last timestamp
    if (filteredHeadlines.length > 0) {
      filteredHeadlines.forEach((headline) => {
        const tweetText = `${headline.text} #OrdinalNewsStandard`;
        T.post('statuses/update', { status: tweetText }, function(err, data, response) {
          if (err) {
            console.log('Error while tweeting:', err);
            return;
          }
          console.log('Tweet posted successfully:', tweetText);
        });
      });
      lastTimestamp = filteredHeadlines[0].timestamp;
    }

  } catch (error) {
    console.log('Error while retrieving news from Inscribe News API:', error);
  }
}

// Call the getAndTweetNews function initially, and then every 60 seconds
getAndTweetNews();
setInterval(getAndTweetNews, 60000);
