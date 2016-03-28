'use strict';

angular.module('apps', ['SysConfig','env']);
angular.module('apps').filter('resource', ['SysConfig', function (SysConfig) {
  return function (input) {
    if (!input) return null;
    return input.indexOf('http') == 0 ? input : SysConfig.resourceBase + "/" + input;
  };
}]);

angular.module('apps').filter('securityLevel', [function () {
  var nameMap = {0: '安全', 1: '较安全', 2: '未检测'};
  return function (input) {
    return nameMap[input] || nameMap[2];
  };
}]);

angular.module('apps').filter('mb', ['$filter', function ($filter) {
  return function (input) {
    if (!input) return;
    return $filter('number')(input / 1024 / 1024) + 'MB';
  };
}]);
//即单例对象，用于将操作、数据等集中管理，避免分散
angular.module('apps').factory('appDownload', ['$window', '$env', 'SysConfig', function ($window, $env, SysConfig) {
   return function (app, t) {
    var args = {id: app.id};
    if ($env.isAndroid&&$env.inClient) {
      args.packageName = app.packageName;
      args.apkUrl = app.apkUrl;

      var url = app.appId ? "http://itunes.apple.com/cn/app/id" + app.appId : (app.apkUrl.indexOf('http') == 0 ? app.apkUrl : SysConfig.resourceBase + "/" + app.apkUrl) + (app.packageName ? '?filename=' + app.packageName + '.apk' : '');
      $env.call("appDownload",{url:url})
      return;

    } else if ($env.isIOS&&$env.inClient) {
      args.bundleId = app.bundleId;
      args.appId = app.appId;

      var path = (t == 'client_open' || t == 'client_download') ? app.url : "http://itunes.apple.com/cn/app/id" + app.appId;
      var url;
      url = app.appId ? "http://itunes.apple.com/cn/app/id" + app.appId : (app.apkUrl.indexOf('http') == 0 ? app.apkUrl : SysConfig.resourceBase + "/" + app.apkUrl) + (app.packageName ? '?filename=' + app.packageName + '.apk' : '');

      $env.call("iosAppDownload",url)
      return ;
    }
    if(t == 'client_open' || t == 'client_download' ){
        $window.location.href='yidumi:';

       
        setTimeout(function(){
            $window.location.href='/html/client_download.html'
        },500)
        return;
    }
    var path = (t == 'client_open' || t == 'client_download') ? app.url : "http://itunes.apple.com/cn/app/id" + app.appId;

    var url = "";
    url = app.appId ? "http://itunes.apple.com/cn/app/id" + app.appId : (app.apkUrl.indexOf('http') == 0 ? app.apkUrl : SysConfig.resourceBase + "/" + app.apkUrl) + (app.packageName ? '?filename=' + app.packageName + '.apk' : '');
   
   $window.location.href = $env.canDownload ? url : '/html/sys_browser.html?t=' + $env.platform() + '_' + (t || 'app_download') + '&url=' + url;
    // $window.location.href = $env.canDownload ? url : '/html/sys_browser.html?t=' + $env.platform() + '_' + (t || 'app_download') + '&url=' + url;
  
  };
}]);

angular.module('apps').factory('findDetails', ['$window', '$location', '$env', 'clientDownload', 'SysConfig', function ($window, $location, $env, clientDownload, SysConfig) {
  return function (type, id, param) {
    $window.location.href = "/" + type + "/detail.html?id=" + id + "&base=" + param.base + "&res=" + SysConfig.resourceBase + "&user_id=" + param.user_id + "&_token=" + param._token + "&inClient=" + (param.inClient ? param.inClient : "false") + "&isCanBack=true";

  }
}]);

angular.module('apps').factory('clientDownload', ['$window', '$location', '$env', 'appDownload', function ($window, $location, $env, appDownload) {
  return function (type, id) {
    var isAppInstalled = $location.search()['isappinstalled'] == '1',
        classType = isAppInstalled ? 'client_open' : 'client_download',
        openUrl = 'yidumi://';
    if ($env.isIOS) {
      appDownload(isAppInstalled ? {url: openUrl} : {
        appId: 759795923,
        url: 'http://itunes.apple.com/cn/app/xia-yi-ge/id759795923?mt=8'
      }, classType);
    } else if ($env.isAndroid) {
      appDownload(isAppInstalled ? {apkUrl: openUrl} : {
        apkUrl: 'http://app.xiaomi.com/download/53123',
        packageName: 'com.winsland.findapp'
      }, classType);
    } else {
      $window.location.href = '/html/client_download.html';
    }
  };
}]);
