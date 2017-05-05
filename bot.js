var Twit = require('twit'),
  T = new Twit(require('./config.js'));

var stream = T.stream('statuses/filter', {
  track: '#testing123'
});

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

  T.post('statuses/update', {
    status: '@' + screenName + " I'm testing too, hope it all works",
    in_reply_to_status_id: message.id_str
  }, function(err, data, response) {
    // console.log(data)
  })

  // stream.stop();
})
