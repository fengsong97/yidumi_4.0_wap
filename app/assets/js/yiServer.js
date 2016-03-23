/**
 * Created by HOME on 2016/1/13.
 */
angular.module('YiModule', ['env','SysConfig']);
angular.module('YiModule').directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            if (attrs.ngSrc == "" || attrs.ngSrc == undefined) {
                attrs.$set('src', attrs.errSrc);
            }
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    };
})
angular.module('YiModule').directive('focus', function () {
    return function (scope, element, attrs) {
        attrs.$observe('focus', function (newValue) {
            newValue === 'true' && element[0].focus();
        });
    }
});
angular.module('YiModule').directive('sectionScroll', ['$window', function ($window) {
    return function (scope, body) {

        var headerImg = $window.document.querySelector('.header-img-container'),
            headerImgHeight = headerImg.offsetHeight * 1.2;
        $window.addEventListener('scroll', function () {
            var scrollTop = body[0].scrollTop;
            if (scrollTop > headerImgHeight) return;
            headerImg.style.top = (-scrollTop) / 2 + 'px';
        });
    };
}]);
angular.module('YiModule').directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
        element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
        scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
            element.html(value || '');
        });
    };
});
angular.module('YiModule').filter('shijian', function () {
    return function (data) {
        if (!data) return;
        var d = new Date(data);
        var date = (d.getFullYear()) + "-" +
            (d.getMonth() + 1) + "-" +
            (d.getDate()) + " " +
            (d.getHours()) + ":" +
            (d.getMinutes()) + ":" +
            (d.getSeconds());
        return date;
    };
});
angular.module('YiModule').filter('scoreFilter',function () {
    return function (input) {
        if(input<0){
            input=0-input;
            return  0-(input+10)*Math.sqrt(input+10).toFixed(0)
        }
        return  (input+10)*Math.sqrt(input+10).toFixed(0)
    };
});

angular.module('YiModule').filter('findPFilter',function () {
    //得到字符串长度，英文算0.5个长度
    function get_length(s){
        var char_length = 0;
        for (var i = 0; i < s.length; i++){
            var son_char = s.charAt(i);
            encodeURI(son_char).length > 2 ? char_length += 1 : char_length += 0.5;
        }
        return char_length;
    };
    //截取字符串，英文算0.5个长度
    function cut_str(str, len){
        var char_length = 0;
        for (var i = 0; i < str.length; i++){
            var son_str = str.charAt(i);
            encodeURI(son_str).length > 2 ? char_length += 1 : char_length += 0.5;
            if (char_length >= len){
                var sub_len = char_length == len ? i+1 : i;
                return str.substr(0, sub_len);
                break;
            }
        }
    }
    return function (array,int) {
        if(array==undefined||array.length==0)
            return '回答为空';
       if(array.length>0){
           for(var i=0;i<array.length;i++){
               if(array[i].p!==undefined&&array[i].p!==''){
                   array[i].p=array[i].p.replace(/<\/?.+?>/g,"")
                   if(get_length(array[i].p)<int){
                       return  array[i].p
                   }
                   return cut_str(array[i].p,int)+"..."
               }
           }
           return '有图为证'
       }
    };
});
angular.module('YiModule').filter('stringFilter',function () {
    //得到字符串长度，英文算0.7个长度
    function get_length(s){
        var char_length = 0;
        for (var i = 0; i < s.length; i++){
            var son_char = s.charAt(i);
            encodeURI(son_char).length > 2 ? char_length += 1 : char_length += 0.7;
        }
        return char_length;
    };
    //截取字符串，英文算0.7个长度
    function cut_str(str, len){
        var char_length = 0;
        for (var i = 0; i < str.length; i++){
            var son_str = str.charAt(i);
            encodeURI(son_str).length > 2 ? char_length += 1 : char_length += 0.7;
            if (char_length >= len){
                var sub_len = char_length == len ? i+1 : i;
                return str.substr(0, sub_len);
                break;
            }
        }
    }
    return function (str,int) {
        if(get_length(str)<int){
            return  str
        }else{
            return cut_str(str,int)+"..."
        }
    };
});
angular.module('YiModule').service('YiServer', ['$http', '$window', '$q', '$rootScope', '$env','ngDialog','$location','SysConfig',function ($http, $window, $q, $rootScope, $env,ngDialog,$location,SysConfig) {

    $rootScope.param = $location.search();
    if(!$rootScope.param.base){
        $rootScope.param.base=SysConfig.online_openApi;
    }
    if(!$rootScope.param.res){
        $rootScope.param.res=SysConfig.online_resourceBase;
    }
    if ($rootScope.param.res) {
        SysConfig.resourceBase = $rootScope.param.res;
    }


    $rootScope.clientType = $env.isIOS ? "ios" : "android";

    $rootScope.scrollUpOrDown=false;
    var scrolldata=0;
    this.scrollUpOrDown=function () {
            var top = document.documentElement.scrollTop || document.body.scrollTop;

        var viewH =document.documentElement.clientHeight  ;//可见高度
        var  contentH =document.documentElement.scrollHeight || document.body.scrollHeight  ;//内容高度
//console.log(top+"top---"+viewH+"viewH---"+contentH+"contentH")
            if(top>scrolldata){
                //console.log( top)
                $rootScope.scrollUpOrDown=true
                $rootScope.$apply()
            }else if(top<scrolldata){
                //console.log("up")
                $rootScope.scrollUpOrDown=false
                $rootScope.$apply()
            }
        if(top/(contentH -viewH)>=0.95){ //到达底部95%时
            $rootScope.scrollUpOrDown=false
            $rootScope.$apply()
        }


            scrolldata=top;

    }

    var currentPosition,timer;
    this.toTop= function (num) {
        clearInterval(timer);
        //document.documentElement.scrollTop=num;
        //document.body.scrollTop=num;
        currentPosition=window.scrollY;
        function runToTop(){
            //console.log(currentPosition)
            //currentPosition=document.documentElement.scrollTop || document.body.scrollTop;
            if(currentPosition>num&&(currentPosition-num>30)){
                currentPosition=currentPosition-30;
                window.scrollTo(0,currentPosition);
            }else if(currentPosition<num&&(num-currentPosition>30)){
                currentPosition=currentPosition+30;
                window.scrollTo(0,currentPosition);
            }else{
                clearInterval(timer);
                window.scrollTo(0,num);

            }
        }

        timer=setInterval(runToTop,1);

    }
    //获得详情 文章、技能、回答、产品 articles ,questions,answers,smartDevices
    this.getDetail = function (type, param) {
        
        var deferred = $q.defer();
        $http.jsonp(param.base + "/v3/" + type + "/" + param.id + "?_client=" + $rootScope.clientType + "&callback=JSON_CALLBACK",
            {params: param})
            .success(function (data0) {
                $http.get(param.base + '/v3/users/' + param.user_id + '?_client=' + $rootScope.clientType + '&_cver=28828&_token=' + param._token)
                    .success(function (data1) {
                        if (data1.data.type == 1 && $env.inClient != true ) {
                            //$rootScope.isVisitor = true;

                        }
                        $rootScope.loginUserNickName = data1.data.nickName;

                        deferred.resolve(data0);
                    })

            }).error(function (data) {
                deferred.reject(data);
            })
        return deferred.promise;
    }
    //用户的信息
    this.getUserDetail = function (param, user_id) {
        var deferred = $q.defer();
        $http.get(param.base + '/v3/users/' + user_id + '?_client=' + $rootScope.clientType + '&_cver=28828&_token=' + param._token)
            .success(function (data) {
                deferred.resolve(data);
            })
        return deferred.promise;
    }

    this.answerZanOrCai=function (answerId,type) {
        var deferred = $q.defer();
        // /v4/answers/:answerId/viewpoint?view=yes 点击赞(view=yes)，踩(view=no)协议
        $http.get($rootScope.param.base + '/v4/answers/' + answerId + '/viewpoint?view='+type+'&_client=' + $rootScope.clientType + '&_cver=28828&_token=' + $rootScope.param._token)
            .success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
    //是否包含这个Userid
    this.isInclude = function (userIds, userId) {
        var abc = false;
        angular.forEach(userIds, function (value, key) {
            if (key == userId) {
                abc = true;
            }
        })
        return abc;
    }
//获得评论列表
    this.getComments = function (type, param, offset, limit) {
        var deferred = $q.defer();
        $http.get(param.base + "/v3/" + type + "/" + param.id + "/comments?type=1&_token=" + param._token + "&_client=" + $rootScope.clientType + "&offset=" + offset + "&limit=" + limit)
            .success(function (data) {
                deferred.resolve(data);
            })
        return deferred.promise;
    }
//评论
    this.toComment = function (type, param, value, replyToId) {
        var deferred = $q.defer();
        $http.post(param.base + '/v3/' + type + '/' + param.id + '/commentsForJsonp',
            {
                'type': 1,
                'content': value,
                //img: null,
                'replyTo': replyToId
            }, {
                params: {
                    _client: $rootScope.clientType,
                    _cver: '28828',
                    _token: param._token
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            }
        ).success(function (data) {
                deferred.resolve(data);
            })
        return deferred.promise;
    }
    //id	yes	string	收藏资源的ID
    //cat	yes	string	收藏资源类型 articles：文章 devices：酷品 imgs：晒图 campaigns：活动
    // channel	yes	int	分享渠道 1：微信朋友圈 2：微信好友 3：qq空间 4：新浪微博 5：对面好友
    this.shareStatistics= function (param, cat,channel) {
        var deferred = $q.defer();
        $http.post(param.base + '/v4/users/me/'+cat+'/share',
            {
            }, {
                params: {
                    _client: $rootScope.clientType,
                    _cver: '28828',
                    _token: param._token,
                    id:param.id,
                    channel:channel
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
        return deferred.promise;
    }
//    origin=1: 文章 2: 晒图 3：酷品 4：话题5：提问6：回答
//    cat=1为打开，2为下载

    //下载APP 统计
    this.appStatistics = function (param, typeId, origin, cat) {
        var deferred = $q.defer();

        $http.post(param.base + '/v3/apps/androidForJsonp/' + typeId,
            {
                origin: origin,
                cat: cat,
                objId: param.id
            }, {
                params: {
                    _client: $rootScope.clientType,
                    _cver: '28828',
                    _token: param._token
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
        return deferred.promise;
    }
//统计酷品的 打开 和购买
    this.smartDeviceStatistics = function (param, typeId, origin, cat) {
        var deferred = $q.defer();

        $http.post(param.base + '/v3/devices/' + typeId + '/clickForJsonp',
            {
                origin: origin,
                cat: cat,
                objId: param.id
            }, {
                params: {
                    _client: $rootScope.clientType,
                    _cver: '28828',
                    _token: param._token
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
        return deferred.promise;
    }
    //关注作者
    this.focusAuthor = function (param, userId) {
        var deferred = $q.defer();
        $http.post(param.base + '/v3/users/me/subscribes', {}, {
                params: {
                    users: userId,
                    _client: $rootScope.clientType,
                    _token: param._token
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
    //取消关注作者
    this.unFocusAuthor = function (param, userId) {
        var deferred = $q.defer();
        $http.get(param.base + "/v3/users/me/subscribesForJsonp?users=" + userId + "&_client=" + $rootScope.clientType + "&_cver=28828&_token=" + param._token)
            .success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }

    //收藏文章、技能、回答、产品 articles ,questions,answers,smartDevices
    this.collecteType = function (type, param) {
        var deferred = $q.defer();
        $http.post(param.base + '/v3/users/me/' + type + '/collections?', {}, {
                params: {
                    id: param.id,
                    _client: $rootScope.clientType,
                    _cver: '28828',
                    _token: param._token
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
    //取消收藏文章、技能、回答、产品 articles ,questions,answers,smartDevices
    this.unCollecteType = function (type, param) {
        var deferred = $q.defer();
        $http.get(param.base + "/v3/users/me/" + type + "/collectionsForJsonp?id=" + param.id + "&_client=" + $rootScope.clientType + "&_cver=28828&_token=" + param._token)
            .success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
//点态度
    this.clickAttitude = function (type, param, typeId, attId) {
        var deferred = $q.defer();
        $http.jsonp(param.base + "/v3/" + type + "/" + typeId + "/attitude?att=" + attId + "&_client=" + $rootScope.clientType + "&_token=" + param._token + "&callback=JSON_CALLBACK")
            .success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
//给评论点赞
    this.clickCommentZan = function (type, param, commentId) {
        var deferred = $q.defer();
        $http.post(param.base + '/v3/' + type + '/comments/' + commentId + '/attitude', {}, {
                params: {
                    att: '1',
                    _client: $rootScope.clientType,
                    _cver: '28828',
                    _token: param._token
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
        return deferred.promise;
    }


//自动注册 并返回 注册用户信息
    this.toSignFree = function (param) {
        var deferred = $q.defer();
        var token = ''
        $http.jsonp(param.base + "/v3/users/me/0/sharwe?_client=7&callback=JSON_CALLBACK")
            .success(function (data) {
                token = data.token;
                //获取登录用户的信息
                $http.get(param.base + '/v3/users/' + data.id + '?_client=' + $rootScope.clientType + '&_cver=28828&_token=' + token)
                    .success(function (data) {
                        data.data.token = token;
                        //保存登录用户的 token 和id
                        $window.localStorage.setItem("login_user_token", data.data.token)
                        $window.localStorage.setItem("login_user_id", data.data.id)
                        $rootScope.param._token = data.data.token,
                            $rootScope.param.user_id = data.data.id,
                            $rootScope.loginUserNickName = data.data.nickName;

                        $rootScope.isVisitor = true;
                        deferred.resolve(data);
                        //deferred.resolve({data:data,token:token});
                    })
            })
        return deferred.promise;
    }
//去注册
    this.toSign = function (param, name, passWord, nickName) {
        var deferred = $q.defer();
        var token = ''
        $http.jsonp(param.base + "/v3/users/me/1/sharwe?_client=" + $rootScope.clientType + "&cat=1&name=" + name + "&pwd=" + passWord + "&nickName=" + nickName + "&callback=JSON_CALLBACK")
            .success(function (data) {
                if (data.token !== undefined) {
                    token = data.token;
                    //获取用户的信息
                    $http.get(param.base + '/v3/users/' + data.id + '?_client=' + $rootScope.clientType + '&_cver=28828&_token=' + token)
                        .success(function (data) {
                            data.data.token = token;
                            //保存登录用户的 token 和id
                            $window.localStorage.setItem("login_user_token", data.data.token)
                            $window.localStorage.setItem("login_user_id", data.data.id)
                            $rootScope.param._token = data.data.token,
                                $rootScope.param.user_id = data.data.id,
                                $rootScope.loginUserNickName = data.data.nickName;

                            $rootScope.isVisitor = false;
                            deferred.resolve(data);
                            //deferred.resolve({data:data,token:token});
                        })
                } else {
                    deferred.resolve(data);
                }
            })
        return deferred.promise;
    }
    //登录
    this.toLogin = function (param, name, passWord) {
        var deferred = $q.defer();
        var token = ''
        $http.jsonp(param.base + '/v3/users/0/loginForCampus?_client=' + $rootScope.clientType + '&name=' + name + '&pwd=' + passWord + '&callback=JSON_CALLBACK')
            .success(function (data) {
                if (data.token !== undefined) {
                    token = data.token;
                    //获取登录用户的信息
                    $http.get(param.base + '/v3/users/' + data.id + '?_client=' + $rootScope.clientType + '&_cver=28828&_token=' + token)
                        .success(function (data) {
                            data.data.token = token;
                            //保存登录用户的 token 和id
                            $window.localStorage.setItem("login_user_token", data.data.token)
                            $window.localStorage.setItem("login_user_id", data.data.id)
                            $rootScope.param._token = data.data.token,
                                $rootScope.param.user_id = data.data.id,
                                $rootScope.loginUserNickName = data.data.nickName;

                            $rootScope.isVisitor = false;
                            deferred.resolve(data);
                            //deferred.resolve({data:data,token:token});
                        })
                } else {
                    deferred.resolve(data);
                }
            })
        return deferred.promise;
    }

    //关注标签
    this.focusTag = function (param, tagId) {
        var deferred = $q.defer();
        $http.post(param.base + '/v3/users/me/subscribes', {}, {
                params: {
                    tags: tagId,
                    _client: $rootScope.clientType,
                    _token: param._token
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
            }
        ).success(function (data) {
                deferred.resolve(data);
            });
        return deferred.promise;

    }
    //取消关注标签
    this.UnFocusTag = function (param, tagId) {
        var deferred = $q.defer();
        $http.get(param.base + "/v3/users/me/subscribesForJsonp", {
            params: {
                tags: tagId,
                _client: $rootScope.clientType,
                _token: param._token
            },
        }).success(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    //获得酷品说明书--所有关联这个酷品的技能列表
    this.getInstructions= function (param,limit) {
        var deferred = $q.defer();
        //$http.get("http://192.168.3.66:9000/v3/questions?_client=8&devicesId=56826ed0b0e5e03901d57fe8&_cver=28828&_token=54b4914387806fb4bdc49c07&limit=5")
        $http.get(param.base + "/v3/questions", {
            params: {
                devicesId: param.id,
                _client: $rootScope.clientType,
                _cver:28828,
                limit:limit,
                _token: param._token
            },
        })
        .success(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    this.getLongTimeAgo = function (date) {
        var year = date.substring(0, 4);
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        var hour = date.substring(8, 10)
        var minute = date.substring(10, 12);
        var second = date.substring(12, 14);

        var time = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;

        Date.prototype.diff = function (date) {
            return (this.getTime() - date.getTime());
        }
        var now = new Date();
        var date = new Date(time);
        var diff = now.diff(date);

        var diffYear = diff / (24 * 60 * 60 * 1000 * 30 * 12);
        var diffMonth = diff / (24 * 60 * 60 * 1000 * 30);
        var diffDay = diff / (24 * 60 * 60 * 1000);
        var diffHour = diff / ( 1000 * 60 * 60);
        var diffMinute = diff / ( 1000 * 60);
        var diffSecond = diff / ( 1000);
        if (Math.floor(diffYear) > 0) {
            return Math.floor(diffYear) + '年前';
        } else if (Math.floor(diffMonth) > 0) {
            return Math.floor(diffMonth) + '个月前';
        } else if (Math.floor(diffDay) > 0) {
            return Math.floor(diffDay) + '天前';
        } else if (Math.floor(diffHour) > 0) {
            return Math.floor(diffHour) + '小时前';
        } else if (Math.floor(diffMinute) > 0) {
            return Math.floor(diffMinute) + '分钟前';
        } else if (Math.floor(diffSecond) > 0) {
            return Math.floor(diffSecond) + '秒前';
        } else return "";
    }
    
    this.appDownloadDialog= function (data) {
        ngDialog.open({
            id: 'appDialog',
            template: 'html/appDialog.html',
            className: 'ngdialog-theme-plain',
            controller: ['$scope', 'appDownload', 'YiServer', function ($scope, appDownload, YiServer) {
                $scope.appDownload = function (appData) {
                    YiServer.appStatistics($rootScope.param, appData.id, 1, 2).then(function (data) {
                    })
                    appDownload(appData)
                };
            }],
            data: {'appData': data},
            showClose: false

        });
    }
    this.smartDialog= function (data) {
        ngDialog.open({
            id: 'fromAService',
            template: 'html/smartDeviceDialog.html',
            className: 'ngdialog-theme-plain',
            controller: ['$scope','$env','YiServer' ,'findDetails',function ($scope,$env,YiServer,findDetails) {
                $scope.deviceOrder = function (url, id) {
                    YiServer.smartDeviceStatistics($rootScope.param, id, 1, 2).then(function (data) {
                    })
                    $env.call("appDownload",{url:(url.indexOf('http') == 0 ? url : SysConfig.resourceBase + "/" + url)})
                };
                $scope.findDetails = function (type, id) {
                    YiServer.smartDeviceStatistics($rootScope.param, id, 1, 1).then(function (data) {
                    })
                    findDetails(type, id, $rootScope.param);
                };
            }],
            data: {'devicesData': data},
            showClose: false

        });
    }
    this.shareDialog= function (title) {
        ngDialog.open({
            id: 'ShareDialog',
            template: 'html/shareDialog.html',
            controller: ['$scope', '$location', '$env','$window', function ($scope, $location, $env,$window) {
                $scope.$env=$env;
                var shareUrl="http://"+$location.$$host+":"+$location.$$port+$location.$$path+"?id="+$location.$$search.id+"&base="+$location.$$search.base+"&res="+$location.$$search.res;
                $scope.data={}
                $scope.data.url=encodeURIComponent(shareUrl);
                $scope.showCode=false
                function toUtf8(str) {
                    var out, i, len, c;
                    out = "";
                    len = str.length;
                    for(i = 0; i < len; i++) {
                        c = str.charCodeAt(i);
                        if ((c >= 0x0001) && (c <= 0x007F)) {
                            out += str.charAt(i);
                        } else if (c > 0x07FF) {
                            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
                            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                        } else {
                            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
                            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
                        }
                    }
                    return out;
                }
                toUtf8($scope.data.url)
                $scope.URL_share={}
                $scope.URL_share.shareToSina="http://service.weibo.com/share/share.php?" +
                    "url="+$scope.data.url+"&" +
                    "title="+title+"&" +
                    "pic=";
                $scope.URL_share.shareToQQzone="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?" +
                    "url="+$scope.data.url+"&" +
                    "title="+title+"&" +
                    "desc="+title+"&" +
                    "summary="+title+"&" +
                    "site=";

                $scope.qqshare = function () {
                    $env.call("shareToQQ")
                }
                $scope.qqZoneShare = function () {
                    $env.call("shareToQzone")
                }
                $scope.shareToWeibo = function () {
                    $env.call("shareToWeibo")
                }

                $scope.shareWeChat = function () {
                    $env.call("shareToWechat")
                    //$scope.showCode=!$scope.showCode;
                    //
                    //if($('#qrcode')[0].childElementCount==0){
                    //  $("#qrcode").qrcode({
                    //    text: toUtf8(shareUrl)
                    //  });
                    //
                    //  var imgSrc=$("#qrcode")[0].children[0].toDataURL("image/png")
                    //  $("#qrcode").empty();
                    //  var imgElement=document.createElement("img")
                    //  imgElement.src=imgSrc;
                    //  $("#qrcode")[0].appendChild(imgElement)
                    //
                    //}


                }
                $scope.shareWeChatZone = function () {
                    $env.call("shareToWechatZone")
                }
                $scope.xinlangShare = function () {
                    $env.call("shareSina")
                }

            }],
            className: 'ngdialog-theme-plain',
            showClose: false
        });
    }

    this.commentDialog= function (one) {
        ngDialog.open({
            id: 'commentDialog',
            template: 'html/commentDialog.html',
            className: 'ngdialog-theme-plain',
            controller: ['$scope', '$http', '$location', 'YiServer', function ($scope, $http, $location, YiServer) {
                $scope.commentShow = "说点什么";
                $scope.commentId = null;
                if (one != undefined) {

                    if (one.content.user != undefined) {
                        $scope.commentShow = "回复：" + one.content.user;
                        $scope.commentId = one.id;
                    }
                }
                $scope.commentValue = "";
                $scope.commentSend = function () {
                    if ($scope.commentValue != "") {
                        YiServer.toComment("articles", $rootScope.param, $scope.commentValue, $scope.commentId)
                            .then(function (data) {
                                $env.call('toToastCallBack', {"toast": "评论成功"});
                                $rootScope.getComment()
                                ngDialog.close();


                            })

                    } else {
                        $env.call('toToastCallBack', {"toast": "评论不能为空"});
                    }

                }
            }],
            showClose: false
        });
    }

    this.loginDialog= function () {
        ngDialog.open({
            id: 'loginDialog',
            template: '/html/loginDialog.html',
            className: 'ngdialog-theme-plain',
            showClose: false,
            controller: ['$scope', '$http', '$location', '$window', 'YiServer', function ($scope, $http, $location, $window, YiServer) {
                $scope.user = {};
                $scope.user.name = "";
                $scope.user.passWord = "";
                $scope.toLogin = function () {
                    if ($scope.user.name.length < 1) {
                        $env.call('toToastCallBack', {"toast": "用户名不能为空"});
                        return;
                    }
                    if ($scope.user.passWord.length < 1) {

                        $env.call('toToastCallBack', {"toast": "密码不能为空"});
                        return;
                    }
                    //是在登录
                    YiServer.toLogin($rootScope.param, $scope.user.name, $scope.user.passWord).then(function (data) {
                        if (data == 'error.openapi.user.notfound') {
                            $env.call('toToastCallBack', {"toast": "用户名或密码错误"});
                            return ""
                        }
                        ngDialog.close();
                        $env.call('toToastCallBack', {"toast": "成功登录"});
                    })

                }
            }]

        })
    }
    this.signDialog= function () {
        ngDialog.open({
            id: 'signDialog',
            template: '/html/signDialog.html',
            className: 'ngdialog-theme-plain',
            showClose: false,
            controller: ['$scope', '$http', '$location', '$window', 'YiServer', function ($scope, $http, $location, $window, YiServer) {
                $scope.user = {};
                $scope.user.name = "";
                $scope.user.passWord = "";
                $scope.user.nickName = "";
                $scope.toSign = function () {
                    if ($scope.user.name.length < 1) {
                        $env.call('toToastCallBack', {"toast": "用户名不能为空"});
                        return;
                    }
                    if ($scope.user.passWord.length < 6) {
                        $env.call('toToastCallBack', {"toast": "密码不符合要求"});
                        return;
                    }
                    if ($scope.user.nickName.length < 1 || $scope.user.nickName.length > 10) {
                        $env.call('toToastCallBack', {"toast": "昵称长度大于0小于10位"});
                        return;
                    }
                    if ($scope.user.green != true) {
                        $env.call('toToastCallBack', {"toast": "请阅读《注册协议》和《版权声明》"});
                        return;
                    }
                    //是在注册
                    YiServer.toSign($rootScope.param, $scope.user.name, $scope.user.passWord, $scope.user.nickName).then(function (data) {
                        if (data == 'You have been the group member') {
                            $env.call('toToastCallBack', {"toast": "已被注册"});
                            return ""
                        } else {
                            ngDialog.close();
                            $env.call('toToastCallBack', {"toast": "完成注册，已成功登录"});
                        }

                    })

                }

            }]
        })
    }
}]);

angular.module('YiModule').service('CompareTime', function () {
    this.getTime = function (date) {
        var year = date.substring(0, 4);
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        var hour = date.substring(8, 10);
        var minute = date.substring(10, 12);
        var second = date.substring(12, 14);
        return year + "." + month + "." + day + " " + hour + ":" + minute;
    }
});





























































