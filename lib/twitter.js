/*jslint white: true, browser: true, maxlen: 80, indent: 2,
nomen: false, onevar: false, regexp: false, nonoop: false */
/*globals Class, LoginError, PostError, ProtectedError, $, window, 
console, captcha, _*/
/*
 * Twitter actions
 *
 * Copyright(c) 2010 BitTorrent Inc.
 *
 */

// XXX - Need to monitor rate limit status and catch 400 errors to notify that
// it has been hit.
var Twitter = Class.extend({
  init: function (cb) {
    var self = this;
    $.get('http://twitter.com', function (page) {
      if (page.match('twttr.loggedIn = true;')) {
        if (window.debug) { 
          console.log('Already logged in');
        }
        self.metadata(cb);
        return;
      }
      if (window.debug) {
        console.log("Not logged in");
      }
      var err = new LoginError("Automatic login failed.");
      err.user("Unknown");
      err.response(page);
      if (window.debug) console.log("Automatic login error", err);
      if (cb) {
        cb(err);
      }
    });
  },
  metadata: function (cb) {
    var self = this;
    
    //Force everyone to use New Twitter
    $.ajax({
      url:"http://twitter.com/account/use_phx?setting=true", 
      async:false});
      
    $.get('http://twitter.com', function (page) {
      if (page.match("Switch to New Twitter!")) {
        cb(new LoginError("You're using an older version of Twitter that won't be around for much longer. Switch your account to New Twitter to use TorrentTweet."));
        if (window.debug) console.log("Error: old twitter");
        return;
      }
      try {
        self.screen_name = page.match(
          /twttr.currentUserScreenName = '(\S+)'/)[1];
        self.token = page.match("<input type='hidden' value='(.+?)' name='authenticity_token'/>")[1];
        self.id = page.match('"id_str":"([0-9]*)"')[1];
        var creds = page.match('"account/verify_credentials", \\[\\{\\}\\], (.+?), 1')[1];
        if (window.debug) console.log("Screen name: "+ self.screen_name+", Id: "+self.id)
      } catch (error) {
        var err = new LoginError("Cound not find metadata; login failed.");
        if (self.screen_name) {
          err.user(self.screen_name);
        } else {
          err.user("Not found");
        }
        if (window.debug) console.log("Error for "+err.user+": "+err.message, error);
        err.response(page);
        if (cb) {
          cb(err);
        }
        return;
      }
      self.user = new Twitter.user(self.id);
      self.user._data = JSON.parse(creds);
      if (cb) {
        cb();
      }
    });
  },
  /*
  * Params:
  *    status - the status to post
  *    cb - Callback to use when the post is either successful or
  *         failed. Called with an error if it failed.
  */
  post: function (status, cb) {
    var self = this;
    $.ajax({url: 'https://twitter.com/status/update',
            type: 'POST',
            data: { 'authenticity_token': self.token,
                    'status': status,
                    'lat': '',
                    'lon': '',
                    'place_id': '',
                    'display_coordinates': 'false',
                    'twttr': 'true',
                    'return_rendered_status': 'true'
                  },
            success: function (resp) { 
              if (cb) {
                cb();
              }
            },
            error: function (xhr, error) { 
              var err = new PostError("Posting status update failed.");
              err.statusMessage(status);
              err.user(self.screen_name);
              err.xhr(xhr);
              if (cb) {
                cb(err); 
              }
            }
          });
  },
  /*
  * Params:
  *    query - the query string to search for
  *    opts -  (Optional) object containing additional search options
  *    cb - Callback to use when the search results are returned
  */
  search: function (query, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts;
      opts = '';
    }
    $.getJSON("http://search.twitter.com/search.json?q=" +
      encodeURIComponent(query), opts, function (data) {
      if (cb) { 
        cb(data);
      }
    });
  },
  /*
  * Params:
  *    username, password - Twitter login credentials
  *    cb - Callback to use when login completes
  */
  login: function (username, password, cb) {
    var self = this;
    var pdata = {'authenticity_token': self.token,
                 'session[username_or_email]':  username,
                 'session[password]': password,
                 'q': '',
                 'return_to_ssl': 'false'
                };
    if (captcha.get_challenge() && captcha.get_response()) {
      pdata.recaptcha_challenge_field = captcha.get_challenge();
      pdata.recaptcha_response_field = captcha.get_response();
    }
    $.ajax({url: 'https://twitter.com/sessions',
            type: 'POST',
            data: pdata,
            success: function () {},
            complete: function (xhr) {
              var resp = xhr.responseText;
              if (resp.match('twttr.loggedIn = true;')) {
                if (window.debug) console.log("Response found, logged in");
                self.metadata(cb);
                return;
              } else if(resp===""){
                var error = "";
                try{
                  if (window.debug) console.log("No response text, fetching main page");
                  self.metadata(cb);
                }
                catch(err){
                  if (window.debug) console.log("Metadata error", err);
                  error = err
                }
                if(!error) return;
              }
              var captcha_key = resp.match(
             /src=\"https:\/\/api-secure.recaptcha.net\/challenge\?k=(.*)\"\>/
              );
              var badpass = "Wrong Username/Email and password combination.";
              var err;
              if (resp.match(badpass)) {
                err = new LoginError(badpass);
              }else {
                err = new LoginError("Could not log you in.");
              }
              err.user(username);
              err.response(resp);
              
              if (captcha_key) {
                err.captcha(captcha_key[1]);
              }
              if (window.debug) console.log("Throwing final login error: ", err);
              if (cb) {
                cb(err);
              }
            }
          });
  },
  logout: function () {
    var self = this;
    $.ajax({url: 'https://twitter.com/sessions/destroy',
            type: 'POST',
            data: {'authenticity_token': self.token},
            success: function () { },
            complete: function (xhr) {
              // Destroying metadata prevents re-login
              // if user was successfully authenticated,
              // logs out, then provides bad credentials
              self.token = null;
              self.id = null; 
              self.screen_name = null;
            }
    });
  },
  followers: function (cb) {
    var self = this;
    if (self.user._data["protected"]) {
      var err = new ProtectedError("Your user data is protected.");
      err.user(self.screen_name);
      if (cb) {
        cb(err);
      }
      return;
    }
    $.getJSON('http://api.twitter.com/1/friends/ids.json',
             { id: self.id, cursor: -1 }, function (resp) {
                    if (cb) {
                      cb(_.map(resp.ids, function (id) {
                        return new Twitter.user(id);
                      }));
                    }
                  });

  },
  // New Twitter just injects JSON for the timeline into the page, 
  // so grab that JSON to rebuild the current user's timeline.
  timeline: function (page, cb) {
    var self = this;
    $.ajax({
      url: "http://twitter.com/home",
      type: "GET",
      data: {
        'authenticity_token': self.token,
        'page': page || 1,
        'twttr': true
      },
      success: function (resp) {
        var statuses = {};
        $("#timeline li.status", resp).each(function (i, status) {
          var time = $("span.published", status)
                     .attr('data').match(/\'.*\'/)[0];
          var statusobj = 
            {id: $(status).attr('id').replace("status_", ""),
             profile_image_url: $("a.profile-pic img", status).attr("src"),
             from_user: $("a.screen-name", status).text(),
             text: $("span.entry-content", status).text(),
             created_at: time.replace("'", "")
            };
          statuses[statusobj.id] = statusobj;
        });
        if (cb) {
          cb(statuses);
        }
      }
    });
  }
});

Twitter.user = Class.extend({
  init: function (id) {
    this.id = id;
  },
  data: function (cb) {
    var self = this;
    $.getJSON('http://api.twitter.com/1/users/show.json',
              {user_id: self.id }, function (resp) {
                self._data = resp;
                if (cb) {
                  cb(self._data);
                }
              });
  },
  timeline: function (cb) {
    var self = this;
    function tl(userdata) {
        if (userdata["protected"]) {
          var err = 
            new ProtectedError("Cannot get timeline for protected user");
          err.user(self.screen_name);
          if (cb) {
            cb(err);
          }
          return;
        }
        $.getJSON('http://api.twitter.com/1/statuses/user_timeline.json',
          { user_id: self.id }, function (resp) {
            self._timeline = resp;
            if (cb) {
              cb(self._timeline);
            }
          });
      }   
    if (self._data) {
      tl(self._data);
    } else {
      self.data(tl);
    }
  }
});