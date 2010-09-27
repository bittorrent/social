/*jslint white: true, browser: true, maxlen: 80, indent: 2,
nomen: false */
/*globals Recaptcha, RecaptchaState, $, RecaptchaDefaultOptions*/
var captcha = {
  create: function (key, widget, theme) {
    this._key = key;
    this._widget = widget;
    Recaptcha.destroy();
    $.ajax({
      url: 'http://www.google.com/recaptcha/api/challenge?k=' + key,
      type: 'GET', 
      beforeSend: function (xhr) {
                    xhr.setRequestHeader("Referer", "http://localhost");
                  },
      success: function (resp) {
        $("head").append("<script type='text/javascript'>" +
                         resp + "</script>");
        Recaptcha.theme = theme || "red";
        var RecaptchaOptions = RecaptchaDefaultOptions;
        Recaptcha.widget = Recaptcha.$(widget);
        Recaptcha._finish_widget();
        $("#recaptcha_reload_btn").attr('href', "#");
      }
    });
    $("#recaptcha_reload_btn").live("click", function () { 
      captcha.reload(); 
    });
  },
  reload: function () {
    $.ajax({
      url: 'http://www.google.com/recaptcha/api/challenge?k=' + this._key,
      type: 'GET', 
      beforeSend: function (xhr) {
                    xhr.setRequestHeader("Referer", "http://localhost");
                  },
      success: function (resp) {
        $("head").append("<script type='text/javascript'>" +
          resp + "</script>");
        $("#recaptcha_image").html("<img src='" + RecaptchaState.server +
                                   "image?c=" + RecaptchaState.challenge + 
                                   "' />");
      }
    });
  },
  destroy: function () {
    Recaptcha.destroy();
  },
  get_challenge: function () {
    return Recaptcha.get_challenge();
  },
  get_response: function () {
    return Recaptcha.get_response();
  }
};