/*jslint white: true, browser: true, plusplus: false, strict: false, maxlen: 80, indent: 2, nomen: false, onevar: false */
/*global window: false, self: false */

var TwitterError = (function () {
  function F() {}
  function CustomError() {
    var _this = (this === window) ? new F() : this,
      tmp = Error.prototype.constructor.apply(_this, arguments);
    for (var i in tmp) {
      if (tmp.hasOwnProperty(i)) { 
        _this[i] = tmp[i]; 
      }
    }
    return _this;
  }
  function SubClass() {}
  SubClass.prototype = Error.prototype;
  F.prototype = CustomError.prototype = new SubClass();
  CustomError.prototype.constructor = CustomError;

  CustomError.prototype.user = function (sn) {
    if (sn !== null) {
      this._screen_name = sn;
    }
    return this._screen_name;
  };

  return CustomError;
}());

var LoginError = (function () {
  function F() {}
  function CustomError() {
    var _this = (this === window) ? new F() : this,
      tmp = TwitterError.prototype.constructor.apply(_this, arguments)
    ;
    for (var i in tmp) {
      if (tmp.hasOwnProperty(i)) {
        _this[i] = tmp[i];
      }
    }
    return _this;
  }
  function SubClass() {}
  SubClass.prototype = TwitterError.prototype;
  F.prototype = CustomError.prototype = new SubClass();
  CustomError.prototype.constructor = CustomError;
    
  CustomError.prototype.response = function (resp) {
    if (resp !== null) {
      this._resp = resp;
    }
    return this._resp;
  };
    
  CustomError.prototype.captcha = function (cap) {
    if (cap !== null) {
      this._captcha = cap;
    }
    return this._captcha;
  };
        
  return CustomError;
}());

var ProtectedError = (function () {
  function F() {}
  function CustomError() {
    var _this = (this === window) ? new F() : this,
      tmp = TwitterError.prototype.constructor.apply(_this, arguments)
    ;
    for (var i in tmp) {
      if (tmp.hasOwnProperty(i)) {
        _this[i] = tmp[i];
      }
    }
    return _this;
  }
  function SubClass() {}
  SubClass.prototype = TwitterError.prototype;
  F.prototype = CustomError.prototype = new SubClass();
  CustomError.prototype.constructor = CustomError;
        
  return CustomError;
}());

var PostError = (function () {
  function F() {}
  function CustomError() {
    var _this = (this === window) ? new F() : this,
      tmp = TwitterError.prototype.constructor.apply(_this, arguments)
    ;
    for (var i in tmp) {
      if (tmp.hasOwnProperty(i)) {
        _this[i] = tmp[i];
      }
    }
    return _this;
  }
  function SubClass() {}
  SubClass.prototype = TwitterError.prototype;
  F.prototype = CustomError.prototype = new SubClass();
  CustomError.prototype.constructor = CustomError;
    
  CustomError.prototype.xhr = function (resp) {
    if (resp !== null) {
      this._xhr = resp;
    }
    return this._xhr;
  };
    
  CustomError.prototype.statusMessage = function (tweet) {
    if (tweet !== null) {
      this._tweet = tweet;
    }
    return this._tweet;
  };
        
  return CustomError;
}());