'use strict';

angular.module('env', []);



angular.module('env').service("$env",  ['$window', '$document', '$timeout','$location','SysConfig', function ($window, $document, $timeout,$location,SysConfig) {

    var html5Url= SysConfig.html5Url;

    var ua = $window.navigator.userAgent;
    var isIOS = /iphone|ipod/i.test(ua);
    var isAndroid = /android/i.test(ua);
    var inWeixin = /MicroMessenger/i.test(ua);
    //inWeibo = /weibo/i.test(ua),
    var inClient = /yidumi/i.test(ua);
    var readOnlyInHere=($location.search()._token==undefined)&&($location.search().user_id==undefined);

    function platform() {
        return isIOS ? 'ios' : (isAndroid ? 'android' : 'web');
    }
    function iosMethod(name, args, cb) {
        if(name == "toUserHome"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/userList/"+args.id
            return
        }else if(name == "toQuestion"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/addSkillTitle"
            return
        }else if(name == "toAnswer"&&inClient!==true){
            setTimeout(function () {
                $window.location.href="http://"+html5Url+"/index.html#/addArticle/answer/"+args.id+"?p="+args.p+"&img="+args.img
            } , 500)
            return
        }

        if(name=="appDownload"){
            name="openInBrowser"
        }
        if (name == "toToastCallBack") {
            notie.alert(5, args.toast, 1);
            return;
        }
        if (name == "toast") {
            $window.localStorage.setItem("toastValue", args)
        }
        if (name == "toUserHome") {
            $window.localStorage.setItem("toUserId", args.id)
        }
        if(name == "iosAppDownload"){
            $window.localStorage.setItem("iosAppDownloadURL", args)
        }
        if(name == "openInBrowser"){
            $window.localStorage.setItem("openInBrowserUrl", args.url)
        }
        $window.localStorage.setItem("messageForIosClient", name)
    }

    function androidMethod(name, args, cb) {
        //android "appDownload" ָ
        if(name == "toUserHome"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/userList/"+args.id
            return
        }else if(name == "toQuestion"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/addSkillTitle"
            return
        }else if(name == "toAnswer"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/addArticle/answer/"+args.id+"?p="+args.p+"&img="+args.img
            return
        }else if(name == "appDownload"&&inClient!==true){
            $window.location.href=args.url
            return
        }

        if (inClient == false) {
            if (name == "toToastCallBack") {
                notie.alert(5, args.toast, 1);
                return;
            }
        }

        if (args == undefined) {
            $window['WebViewJavascriptBridge'][name].call($window['WebViewJavascriptBridge']);
        } else {
            $window['WebViewJavascriptBridge'][name].call($window['WebViewJavascriptBridge'], angular.toJson(args));
        }
    }

    function webMethod(name, args, cb) {
        if(name == "toUserHome"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/userList/"+args.id
            return
        }else if(name == "toQuestion"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/addSkillTitle"
            return
        }else if(name == "toAnswer"&&inClient!==true){
            $window.location.href="http://"+html5Url+"/index.html#/addArticle/answer/"+args.id+"?p="+args.p+"&img="+args.img
            return
        }
        if (name == "toToastCallBack") {
            notie.alert(5, args.toast, 1);
        }else if(name=="appDownload"){
            $window.location.href=args.url;
        }
        cb();
    }
    var callMethod = isIOS ? iosMethod : (isAndroid ? androidMethod : webMethod);

    this.platform=platform;
    this.isIOS =isIOS;
    this.inWeixin =inWeixin;
    this.isAndroid= isAndroid ;
    this.readOnlyInHere= readOnlyInHere ;
    this.setInClient= function (data) {
            inClient=data;
    }
    this.call= function (method, args, cb) {
        if (angular.isFunction(args)) {
            cb = args;
            args = null;
        }
        if (!cb) cb = angular.noop;
        callMethod(method, args, cb);
    }

}])
