var Twit = require('twit'),
  T = new Twit(require('./config.js'));



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

  console.log('data', result.data);
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

    console.log(message);

    // Return when the account has replied to itself and prevent infinite loops
    if (screenName === botName) {
      return;
    }

    T.post('statuses/update', {
      status: 'I hear you @' + screenName,
      in_reply_to_status_id: message.id_str
    }, function(err, data, response) {
      // console.log(data)
    })

    // stream.stop();
  })
})


