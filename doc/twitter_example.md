---
layout: default
title: Building a Twitter App
---

This is a tutorial that will introduce the basic functionality of the 
social library for Bittorrent Apps, specifically how to manage Twitter 
authentication and interaction with Twitter's APIs.

For a basic introduction to Bittorrent Apps development, see the 
[introduction](http://btapps-sdk.bittorrent.com/). 
A tutorial introducing the bascs of the Bittorrent API can be found at: 
[Media Downloader](http://github.com/bittorrent/apps-sdk/blob/master/doc/tutorials/media_downloader.md).

A complete version of the app from this tutorial can be found at:
[Twitter Example](http://github.com/bittorrent/social/tree/master/examples/twitter/).

Setup
-----
Create a new app and add the social package to the app as a dependency:

    % apps setup --name=twitter
    % cd twitter
    % apps add --file=http://staging.apps.bittorrent.com/pkgs/social.pkg

Add the following to `html/index.html` to set up all the page elements we'll need:

    <form id="login" class="out">
        <h2>Log in to Twitter</h2>
        Username: <input type="text" name="username">
        Password: <input type="password" name="password">
        <button type="submit">Submit</button>
    </form>
    <div class="in">
        <span id="status"></span><br/>
        <a href="#" id="logout">Log out</a><br/>
        <form id="update">
          <input type="text" name="status">
          <button type="submit">Post</button>
        </form>
        <span id="msg"></span>
        <form id="search">
          <input type="text" name="query">
          <button type="submit">Search</button>
        </form>
        <h2>Home</h2>
        <div id="feed"></div>
    </div>
    
Login and Logout
----------------
Front the HTML, it's easy to see how display the right page elements to the 
user based on their login state; we just need to instantiate a Twitter object 
to handle the actual authentication. 

In `lib/index.js`, change your code to the following:

    $(document).ready(function() {
      $(".out").show();
      $(".in").hide();
      var twt = new Twitter();
      
      $("#login").submit(function() {
        twt.login(
          $("input[name=username]").val(),
          $("input[name=password]").val(), 
          function (error) {
            if(!error){
              $("#status").html("Logged in as: " + twt.screen_name);
              $(".in").show();
              $(".out").hide();          
            }
          }
        );
        return false;
      });
      
      $("#logout").click(function() {
        twt.logout();
        $(".in").hide();
        $(".out").show();
        return false;
      });
    });
    
User interaction with the login form and the logout link calls the respective 
twitter login and logout functions. The login function takes the form values 
as parameters, as well as a callback function. This callback will be passed a 
LoginError if login is unsuccessful for any reason.

The twitter object can also automatically log a user in when we instantiate 
it; it can use the same callback function as the login method:

    function show_login (error) {
      if(!error) {
        $("#status").html("Logged in as: " + twt.screen_name);
        $(".in").show();
        $(".out").hide();
        twt.timeline(1, function(statuses){
          _.each(statuses, function(status){
            $("#feed").append(status.from_user + ": " + status.text + "<br/>");
          });
        });
      }
    }
    var twt = new Twitter(show_login);
    $("#login").submit(function() {
      twt.login(
        $("input[name=username]").val(),
        $("input[name=password]").val(), 
        show_login
      );
      return false;
    });

The the timeline method in the common callback function fetches 
the home timeline of the authenticated user and prints out each item; this 
timeline is the same as a user would see when logged into twitter.com.

You should now be able to run the app (either via the serve or package 
commands) and log in to Twitter! If you refresh the page after successfully 
logging in, the app should automatically re-login to the same account for you.
You may also try generating a few LoginErrors and take a look at the 
information the error provides.

Search
------
Interacting with the Twitter Search API is a simple next step. Since the event 
handlers for searching and posting tweets are similar, add them both:

    $("#update").submit(function() {
      twt.post($("input[name=status]").val());
      return false;
    });
    $("#search").submit(function() {
      twt.search($("input[name=query]").val());
      return false;
    });
    
In order to do anything with the search results, we need to add a callback function.

    twt.search($("input[name=query]").val(), function (data) {
      $("#feed").html("");
      $("div.in h2").text("Search: " + $("input[name=query]").val());
      _.each(data.results, function(tweet){
        $("#feed").append(tweet.from_user + ": " + tweet.text + "<br/>");
      });
    });

Try out the new search functionality; you might also take a look at the JSON 
object which the search function returns as well as the result objects.

The search function can also take as a parameter an object containing 
additional search options; for more information on these and the Twitter 
search API in general, see the Twitter API page on 
[the search method](http://apiwiki.twitter.com/Twitter-Search-API-Method%3A-search) 
(http://apiwiki.twitter.com/Twitter-Search-API-Method%3A-search)

Post
----
By adding the event handler for the 'update' form above, we've actually fully 
enabled the user to post a tweet, but it would be nice to add a callback to 
show the user that their action was successful:

    $("#update").submit(function() {
      twt.post($("input[name=status]").val(), function(error){
        var msg = "A error occurred.";
        if(!error){
          msg = "Post successful.";
          if ($("div.in h2").text() === "Home") {
            $("#feed").prepend(
              twt.screen_name + ": " + 
              $("input[name=status]").val() + "<br/>"
            );
          }           
          $("input[name=status]").val("");
        }
        $("#msg").text(msg).show().fadeOut(2000);
      });
      return false;
    });

The function chooses the message to display based on the existence of a 
PostError; if the post was successful, the form field is cleared for the next 
tweet. Additionally, if the user is looking at their home timeline, the new 
tweet is prepended to it.
