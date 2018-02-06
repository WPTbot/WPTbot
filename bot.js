var Twit = require('twit'),
  T = new Twit(require('./config.js'));

var wptKey = require('./wpt.config.js').k;

var querystring = require('querystring'),
    http = require('http'),
    fs = require('fs');

var parseString = require('xml2js').parseString;

var JSON = require('JSON');

T.get('account/verify_credentials', { skip_status: true })
.catch(function (err) {
  console.log('caught error', err.stack)
})
.then(function (result) {
  // `result` is an Object with keys "data" and "resp". 
  // `data` and `resp` are the same objects as the ones passed 
  // to the callback. 
  // See https://github.com/ttezel/twit#tgetpath-params-callback 
  // for details. 

  //console.log('data', result.data);
  return (result.data.screen_name);
}).then(function(botName) {
  var stream = T.stream('statuses/filter', {
    track: '@' + botName
  });

  console.log('The bot is now listening...');

  // var stream = T.stream('user');
  // stream.on('follow', function(event) {
  //   var source = event.source;
  //
  //   var name = source.name,
  //     screenName = source.screen_name;
  //
  //   console.log(event);
  //   console.log(name, screenName);
  //   //
  //   // T.post('statuses/update', {
  //   //   status: '@' + screenName + ' welcome, welcome, 123'
  //   // }, function(err, data, response) {
  //   //   console.log(data)
  //   // })
  // })

  stream.on('tweet', function(message) {
    var screenName = message.user.screen_name;

    //console.log(message);

    // Return when the account has replied to itself and prevent infinite loops
    if (screenName === botName) {
      return;
    }

    var reURL = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm;

    console.log('URL: ', message.text.match(reURL)[0].split(' ')[0]);

    var urlToTest = message.text.match(reURL)[0].split(' ')[0];

    if (!urlToTest) {
      return;
    }

    var post_data = querystring.stringify({
      'url': urlToTest,
      'f': 'xml',
      'k': wptKey
    });

    var post_options = {
      host: 'www.webpagetest.org',
      path: '/runtest.php',
      port: '80',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      }
    };

    var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
          parseString(chunk, function (err, result) {
            var resultUrl = JSON.parse(JSON.stringify(result)).response.data[0].userUrl[0]
            T.post('statuses/update', {
              status: 'No problem @' + screenName + '.  I submitted the test for ' + urlToTest + ' to www.webpagetest.org, check the result at ' + resultUrl,
              in_reply_to_status_id: message.id_str
            }, function(err, data, response) {
              // console.log(data)
            })
          });
      });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

    // stream.stop();
  })
})


