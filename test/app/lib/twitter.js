/*
 * Copyright(c) 2010 BitTorrent Inc.
 *
 * Date: %date%
 * Version: %version%
 *
 */

module('social:twitter');

var twt = new twitter();
twt.logout();

// Don't try testing with a good uname/bad pass combination--twitter will 
// flag your account, forcing reCaptcha on login and tests will start failing
var good_uname = "btunittest";
var good_pass = "foobar546";
var bad_uname = "whatever4096283";
var bad_pass = "whatever";

var rand = Math.floor(Math.random()*100001);
var status = "Unit test " + rand;

test('search', function() {
  stop();
  expect(7);
  
  var query = "the yes men";
  var uquery = "東京";
  var per_page = 15;
  var opts = {'page': 2, 'rpp': 30};
  
  twt.search(query, function(resp1){
    equals(resp1["query"].replace(/[+]/g, " "), query, "Queries match");
    equals(resp1["results"].length, per_page, "Found results for query 1");
    
    twt.search(uquery, function(resp2){
      equals(resp2["results"].length, per_page, "Found results for query 2");
      equals(resp2["query"], encodeURIComponent(uquery), "Queries match");
    
      twt.search(query, opts, function(resp3){
        equals(resp3["results"].length, opts['rpp'], "Found expanded results using options");
        equals(resp3["page"], opts['page'], "Fetched correct page");
        equals(resp3["query"].replace(/[+]/g, " "), query, "Queries match");
        start();
      });
      
    });
    
  });
  
});

test('goodlogin', function(){
  expect(1);
  stop();
  twt.login(good_uname, good_pass, function(error){    
    ok(!error, "Successfully logged in"); 
    start();    
  });
});

test('post', function() {
  expect(1);
  stop();
  
  twt.post(status, function(error){  
    if(!error) ok(true, "Post was successful");
    start();
  });
  
});

test('user', function(){
  expect(5);
  var user = new twitter.user(twt.id);
  equals(user.id, twt.id, "ID set correctly");
  
  stop();
  
  user.data(function(data){
    
    equals(data.screen_name, twt.screen_name, 
      "User ID correct, Fetched the right data")
    same(user._data, data, "Data stored correctly");
    
    user.timeline(function(timeline) {
      if(timeline instanceof PostError && user._data["protected"])
        ok(true, "Returned error for protected user");
      else
        ok(timeline && timeline.length, "Returned status objects for user");
        _.each(timeline, function(tweet){
          if(tweet.text.match(status)) ok(true, "Found posted status in user timeline");
        });
      start();
    });
    
  });    

});

test('followers', function() {
  expect(1);
  stop(3000);
  twt.followers(function(data) {
      start();
      if(data instanceof PostError && user._data["protected"])
        ok(true, "Returned error for protected user")
      else
        ok(data && data.length, "Returned friend objects for user");    
  });
});

test('login-combo', function(){
  expect(6);
  stop();  
  
  twt.login(bad_uname, bad_pass, function(error){
    ok(error, error.message);
    equals(error.user(), bad_uname, "Error includes correct username");
    ok(typeof error.response != undefined,
      "Error includes valid response HTML");      
    
    twt.login(good_uname, good_pass, function(error){          
      ok(!error, "Successfully logged in");       
      
      twt.logout();
      setTimeout(function(){     
        ok(!twt.screen_name, "Deleted previous credentials");        
        
        twt.login(bad_uname, bad_pass, function(error){
          start();
          ok(error, "Couldn't log in with bad credentials after a good login");
        });
        
      }, 2000);     
    });
  });
});

test("captcha", function(){
  expect(4);
  stop();
  captcha.create('6LfbTAAAAAAAAE0hk8Vnfd1THHnn9lJuow6fgulO', 'captcha', 'red');
  
  _.delay(function(){
    ok(RecaptchaState, 'Got captcha data');
    var challenge1 = captcha.get_challenge();
    ok(challenge1!='', 'Challenge has valid value');
    captcha.reload();
    
    _.delay(function(){
      if(challenge1 != captcha.get_challenge())
        ok(true, "Got new challenge");
      
      captcha.destroy();
      ok($("#captcha").html().length==0, "Removed captcha");
      
      start();
    }, 2000);
    
  }, 2000);
  
});