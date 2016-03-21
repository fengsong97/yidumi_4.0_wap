'use strict';

angular.module("ngLocale", [], ["$provide", function ($provide) {
  $provide.value("$locale", {
    "NUMBER_FORMATS": {
      "CURRENCY_SYM": "\u00a5",
      "DECIMAL_SEP": ".",
      "GROUP_SEP": "",
      "PATTERNS": [
        {
          "gSize": 3,
          "lgSize": 3,
          "maxFrac": 2,
          "minFrac": 0,
          "minInt": 1,
          "negPre": "-",
          "negSuf": "",
          "posPre": "",
          "posSuf": ""
        },
        {
          "gSize": 3,
          "lgSize": 3,
          "maxFrac": 2,
          "minFrac": 0,
          "minInt": 1,
          "negPre": "\u00a4\u00a0-",
          "negSuf": "",
          "posPre": "\u00a4\u00a0",
          "posSuf": ""
        }
      ]
    },
    "id": "zh-cn"
  });
}]);