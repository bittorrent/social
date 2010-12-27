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
        Recaptcha._finish_widget = function () {
            var a =
            Recaptcha.$,
                b = RecaptchaStr;
            b = RecaptchaState;
            var c = RecaptchaOptions,
                d = c.theme;
            switch (d) {
            case "red":
            case "white":
            case "blackglass":
            case "clean":
            case "custom":
            case "context":
                break;
            default:
                d = "red"
            }
            if (!Recaptcha.theme) Recaptcha.theme = d;
            Recaptcha.theme != "custom" ? Recaptcha._init_builtin_theme() : Recaptcha._set_style("");
            d = document.createElement("span");
            d.id = "recaptcha_challenge_field_holder";
            d.style.display = "none";
            a("recaptcha_response_field").parentNode.insertBefore(d, a("recaptcha_response_field"));
            a("recaptcha_response_field").setAttribute("autocomplete", "off");
            a("recaptcha_image").style.width = "300px";
            a("recaptcha_image").style.height = "57px";
            Recaptcha.should_focus = false;
            Recaptcha._set_challenge(b.challenge, "image");
            if (c.tabindex) {
                a("recaptcha_response_field").tabIndex = c.tabindex;
                if (Recaptcha.theme != "custom") {
                    a("recaptcha_whatsthis_btn").tabIndex = c.tabindex;
                    a("recaptcha_switch_img_btn").tabIndex = c.tabindex;
                    a("recaptcha_switch_audio_btn").tabIndex = c.tabindex;
                    a("recaptcha_reload_btn").tabIndex = c.tabindex
                }
            }
            if (Recaptcha.widget) Recaptcha.widget.style.display = "";
            c.callback && c.callback()
        }
        Recaptcha._get_help_link = function () {
            var a = RecaptchaOptions.lang;
            return "http://recaptcha.net/popuphelp/" + (a == "en" ? "" : a + ".html")
        }
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