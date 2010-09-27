$(document).ready(function() {
  $(".out").show();
  $(".in").hide();
  function show_login (error) {
    if(!error){
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
  $("#logout").click(function() {
    twt.logout();
    $(".in").hide();
    $(".out").show();
    return false;
  });
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
  $("#search").submit(function() {
    twt.search($("input[name=query]").val(), function (data) {
      $("div.in h2").text("Search: " + $("input[name=query]").val());
      $("#feed").html("");
      _.each(data.results, function(tweet){
        $("#feed").append(tweet.from_user + ": " + tweet.text + "<br/>");
      });
    });
    return false;
  });
});
