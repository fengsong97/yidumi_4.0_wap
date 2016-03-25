'use strict';

angular.module('smartDevices', ['ngSanitize','SysConfig', 'env', 'apps', 'ngDialog', 'YiModule'], ['$locationProvider', '$sceDelegateProvider', function ($locationProvider, $sceDelegateProvider) {
    $locationProvider.html5Mode(true);
    $sceDelegateProvider.resourceUrlWhitelist(['self', '**']);
}]);




angular.module('smartDevices').controller('smartDevices.DetailCtrl', ['$scope', '$rootScope', '$window', '$location', '$http', '$timeout', 'clientDownload','$env',
    'appDownload', 'SysConfig', 'findDetails', 'ngDialog', '$interval', 'YiServer',
    function ($scope, $rootScope, $window, $location, $http, $timeout,clientDownload, $env, appDownload,
              SysConfig, findDetails, ngDialog, $interval, YiServer) {

        $window.onscroll =YiServer.scrollUpOrDown;
        $scope.toTop =YiServer.toTop;
        $scope.clientDownload=clientDownload;   
        $scope.$env = $env;

        $scope.platform = $env.platform();

        if ($rootScope.param.inClient == "true") {
            $scope.$env.inClient = true;
            $env.inClient = true;
        }

        $scope.countdown = {}
        //获取详情
        $rootScope.getArticleDetail = function () {
            YiServer.getDetail("devices", $rootScope.param).then(function (data) {
                $scope.item = data;

                YiServer.getInstructions($rootScope.param,5).then(function (instructions) {
                    $scope.item.instructions=instructions.data.results;
                })


                $scope.item.introduceIsArray = angular.isArray($scope.item.introduce)


                $scope.item.tagNames = []
                angular.forEach($scope.item.tags, function (value, key) {
                    
                    $scope.item.tagNames.push(value.name)
                })
                // if ($scope.item.campaigns.count > 0) {
                //     if ($scope.item.campaigns.items[0].status.status == 2) {

                //         $scope.interval = $interval(function () {

                //             var date3 = $scope.item.campaigns.items[0].status.stopTime - new Date().getTime();
                //             //if(date3<=0){
                //             //    $interval.cancel($scope.interval)
                //             //    $scope.item.campaigns.items[0].status.status=3
                //             //}
                //             //计算出相差天数
                //             var days = Math.floor(date3 / (24 * 3600 * 1000))
                //             //计算出小时数
                //             var leave1 = date3 % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
                //             var hours = Math.floor(leave1 / (3600 * 1000))
                //             //计算相差分钟数
                //             var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
                //             var minutes = Math.floor(leave2 / (60 * 1000))
                //             //计算相差秒数
                //             var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
                //             var seconds = Math.round(leave3 / 1000)

                //             $scope.countdown = {
                //                 days: days,
                //                 hours: hours,
                //                 minutes: minutes,
                //                 seconds: seconds
                //             }
                //         }, 1000)
                //     }
                // }

                if ($scope.item.collections !== undefined) {
                    $scope.item.isCollected = YiServer.isInclude($scope.item.collections.users, $rootScope.param.user_id)
                }
                if ($scope.item.recommends !== undefined) {
                    $scope.item.isRecommended = YiServer.isInclude($scope.item.recommends.users, $rootScope.param.user_id)
                }


                $scope.item.recommends.avatars = [];
                angular.forEach($scope.item.recommends == undefined ? [] : $scope.item.recommends.users, function (value, key) {
                    $scope.item.recommends.avatars.push(value)
                })
            })

        }
        $scope.toQuestionDetail= function (id) {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            $window.location.href = "http://" + $location.$$host + ":" + $location.$$port + "/questions/detail.html?id=" + id + "&user_id=" + $rootScope.param.user_id + "&base=" + $rootScope.param.base + "&res=" + $rootScope.param.res + "&_token=" + $rootScope.param._token + "&inClient=" + $rootScope.param.inClient


        }

        //应用Dialog
        $scope.openYingYong= function (data) {
            YiServer.appDownloadDialog(data)
        }

        //酷屏Dialog
        $scope.openKuPin = function (data) {
            YiServer.smartDialog(data)
        }



        //分享Dialog
        $scope.openShare = function (title) {
            YiServer.shareStatistics($rootScope.param,"articles",3)
            if ($env.isAndroid && $env.inClient) {
                $env.call("toShare")
                return
            }
            YiServer.shareDialog(title)


        }


//收藏这篇文章
        $scope.collecteAticle = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            
            if ($scope.item.isCollected == undefined || $scope.item.isCollected == false) {
                YiServer.collecteType("devices", $rootScope.param).then(function (data) {
                    $scope.item.isCollected = true;
                    $env.call('toToastCallBack', {"toast": "收藏成功"});
                })
            } else {
                YiServer.unCollecteType("devices", $rootScope.param).then(function (data) {
                    $scope.item.isCollected = false;
                    $env.call('toToastCallBack', {"toast": "取消收藏"});
                })
            }
        };

        $scope.collectionStyle = function () {
            if ($scope.item == undefined) {
                $scope.item = {
                    isCollected: false
                }
            }
            if ($scope.item.isCollected) {
                return {'color': '#0099E5'}
            }

        }
//推荐
        $scope.recommend = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            if ($scope.item.isRecommended == undefined || $scope.item.isRecommended == false) {
                $http.post($rootScope.param.base + '/v3/users/me/devices/recommends?', {}, {
                        params: {
                            id: $rootScope.param.id,
                            _client: 8,
                            _cver: '28828',
                            _token: $rootScope.param._token
                        },
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                    }
                ).success(function (data) {
                        $scope.item.isRecommended = true;
                    });
            } else {
                $env.call('toToastCallBack', {"toast": "您已经推荐过了"});
            }
        };
        $scope.recommendStyle = function () {
            if ($scope.item == undefined) {
                $scope.item = {
                    isRecommended: false
                }
            }
            if ($scope.item.isRecommended) {
                return {'color': '#0099E5'}
            }

        }
        $scope.isVisitorFn = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {

            }

        }

//返回到客户端的方法
        $scope.toBack = function () {
            if ($rootScope.param.isCanBack == "true") {
                javascript:history.go(-1)
            } else {
                if ($scope.$env.inClient) {
                    $env.call('toBackCallback',{nums:2});
                } else {
                    javascript:history.go(-1)
                }
            }


        }

        function initStyle() {
            var width = $window.document.documentElement.clientWidth,
                height = 3.5;
            $scope.headerImageCornerStyle = {
                'border-bottom': height + 'em solid #fff',
                'border-left': width + 'px solid transparent',
                width: 0,
                height: 0,
                'margin-top': (0.05 - height) + 'em',
                position: 'absolute'
            };
            //angular.element($window.document.body).css('font-size', Math.min(62.5 * width / 320, 125) + '%');
        }

        $timeout(initStyle, 100);

        //购买Dialog
        $scope.saleDialog = function (data) {

            ngDialog.open({
                id: 'saleDialog',
                template: 'saleDialog',
                className: 'ngdialog-theme-plain',
                controller: ['$scope', function ($scope) {
                    $scope.toAddress = function (url) {
                        YiServer.smartDeviceStatistics($rootScope.param, $rootScope.param.id, 3, 2).then(function (data) {
                        })
                        if (url == undefined) {
                            $env.call("appDownload",{url:"http://www.taobao.com"})
                            //$window.open("http://www.taobao.com")
                            return
                        }
                        $env.call("appDownload",{url:(url.indexOf('http') == 0 ? url : "http://" + url)})
                        //$window.open()
                    }
                }],
                data: {'saleData': data},
                showClose: false

            });
        }

        if ($rootScope.param._token == undefined) {
            
            //如果 token为空 则  注册游客登录
            //判断 localStrage 里是否有 token 如果有
            if ($window.localStorage.getItem("login_user_token") != undefined) {
                //取 token
                $rootScope.param._token = $window.localStorage.getItem("login_user_token")
                $rootScope.param.user_id = $window.localStorage.getItem("login_user_id")
                $rootScope.getArticleDetail();

                //获取登录用户的信息
                YiServer.getUserDetail($rootScope.param, $rootScope.param.user_id)
                    .then(function (data) {
                        if (data.data.type == 1 && $env.inClient != true ) {
                            $rootScope.isVisitor = true;

                        }
                        $rootScope.loginUserNickName = data.data.nickName;
                    })

            } else {
                // 如果没有,则注册用户
                YiServer.toSignFree($rootScope.param).then(function (data) {
                    $rootScope.getArticleDetail();
                    $rootScope.isVisitor = true;
                })
            }
        } else {
            $rootScope.getArticleDetail();
        }

        //登录
        $rootScope.login = function () {
            ngDialog.close();

            YiServer.loginDialog()
        }
        //注册
        $rootScope.sign = function () {
            ngDialog.close();
            YiServer.signDialog()
        }
    }]);
