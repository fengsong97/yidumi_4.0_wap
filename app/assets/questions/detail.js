'use strict';

angular.module('questions', ['ngSanitize', 'SysConfig', 'env', 'apps', 'ngDialog', 'YiModule','angular-carousel'], ['$locationProvider', '$sceDelegateProvider', function ($locationProvider, $sceDelegateProvider) {
    $locationProvider.html5Mode(true);
    $sceDelegateProvider.resourceUrlWhitelist(['self', '**']);

}]);


angular.module('questions').service('questionService', function ($http, $window,$rootScope) {
    $rootScope.rootShow={};
    $rootScope.rootShow.num=1;

});

angular.module('questions').controller('questions.DetailCtrl', ['$scope', '$rootScope', '$window', '$location', '$http', '$timeout', '$env',
    'appDownload', 'SysConfig', 'findDetails', 'CompareTime', 'ngDialog', 'questionService', 'YiServer',
    function ($scope, $rootScope, $window, $location, $http, $timeout, $env, appDownload,
              SysConfig, findDetails, CompareTime, ngDialog, questionService, YiServer) {
        $scope.compareTime = CompareTime;

        $window.onscroll =YiServer.scrollUpOrDown;
        $scope.toTop =YiServer.toTop;
        $scope.$env = $env;
        if ($rootScope.param.inClient == "true") {
            $scope.$env.inClient = true;
            $env.inClient = true;
            $env.setInClient(true)

        }
        $scope.platform = $env.platform();
        //获取技能详情
        $rootScope.getArticleDetail = function () {

            YiServer.getDetail("questions", $rootScope.param).then(function (data) {
                $scope.item = data;

                //某用户被关注的信息
                YiServer.getUserDetail($rootScope.param, $scope.item.user.id)
                    .then(function (data) {
                        if ($scope.item.user.fans == undefined) {
                            $scope.item.user.fans = {count: 0,item:[]}
                        }
                        $scope.item.user.fans = data.data.fans;
                    })

                $scope.item.accordionOpen=true
                
                $scope.__ = $scope.item[$scope.platform];
                if ($scope.__.apps !== undefined) {
                    if ($env.isAndroid || $env.isIOS) {
                        $scope.showApps = $scope.__.apps[$scope.platform]
                    } else {
                        $scope.showApps = $scope.__.apps["android"] ? ($scope.__.apps["android"]).concat($scope.__.apps["ios"]?$scope.__.apps["ios"]:[]) : $scope.__.apps["ios"]?$scope.__.apps["ios"]:[];
                    }
                }


                for (var i = 0; i < $scope.item.answers.items.length; i++) {
                    $scope.item.answers.items[i].needAnswer = $scope.item.answers.items[i][$scope.platform];
                    $scope.item.answers.items[i].needAnswer.allData = $scope.item.answers.items[i];
                }
                if ($scope.item.collections !== undefined) {
                    $scope.item.isCollected = YiServer.isInclude($scope.item.collections.users, $rootScope.param.user_id)
                }
                if ($scope.item.anrs !== undefined) {
                    $scope.item.isCommonAsked = YiServer.isInclude($scope.item.anrs.users, $rootScope.param.user_id)
                }
                

                angular.forEach($scope.item.answers.items == undefined ? [] : $scope.item.answers.items, function (value, key) {
                    if (value.attitudes !== undefined) {
                        value.attitudes.avatars = []
                        angular.forEach(value.attitudes.users, function (value2, key2) {
                            value.attitudes.avatars.push(value2)
                        })
                    }

                })

                $scope.answersList.showMoreAnswers();

            })

        }
        //关注作者
        $scope.subscribeAuthor_question = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            if (!$scope.item.user.hasSub) {
                YiServer.focusAuthor($rootScope.param, $scope.item.user.id).then(function (data) {
                    $scope.item.user.hasSub = !$scope.item.user.hasSub;
                    if ($scope.item.user.fans == undefined) {
                        $scope.item.user.fans = {
                            count: 0
                        }
                    }
                    $scope.item.user.fans.count = $scope.item.user.fans.count + 1
                })
            } else {
                YiServer.unFocusAuthor($rootScope.param, $scope.item.user.id).then(function (data) {
                    $scope.item.user.hasSub = !$scope.item.user.hasSub;
                    $scope.item.user.fans.count = $scope.item.user.fans.count - 1
                })
            }
        };


        $scope.answersList={}
        $scope.answersList.answersArrayLength=5;
        $scope.answersList.showMoreAnswers= function () {
            $scope.answersList.data=  $scope.item.answers.items.slice(0,  $scope.answersList.answersArrayLength);
            $scope.answersList.answersArrayLength=$scope.answersList.answersArrayLength+5;
            
        }

        $scope.changeHeight = function () {
            return {height: auto}
        }

//收藏这篇文章
        $scope.collecteAticle_question = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            
            if ($scope.item.isCollected == undefined || $scope.item.isCollected == false) {
                YiServer.collecteType("questions", $rootScope.param).then(function (data) {
                    $scope.item.isCollected = true;
                    //alert($env.inClient)
                    $env.call('toToastCallBack', {"toast": "收藏成功"});
                })
            } else {
                YiServer.unCollecteType("questions", $rootScope.param).then(function (data) {
                    $scope.item.isCollected = false;

                    $env.call('toToastCallBack', {"toast": "取消收藏"});
                })
            }
        };
        //是否收藏过这个提问
        $scope.collectionStyle_question = function () {
            if ($scope.item == undefined) {
                $scope.item = {
                    isCollected: false
                }
            }
            if ($scope.item.isCollected) {
                return {'color': '#0099E5'}
            }

        }
        //是否赞过或者踩过，颜色变成蓝色
        $scope.zanOrCaiedStyle = function () {
            if ($scope.item == undefined) {
                $scope.item = {
                    isCollected: false
                }
            }
            if ($scope.item.isCollected) {
                return {'color': '#0099E5'}
            }

        }
        //同问
        $scope.commonAsk = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            if ($scope.item.isCommonAsked) {
                $env.call('toToastCallBack', {"toast": "已经同问过了"});
                return;
            }
            $http.get($rootScope.param.base + "/v3/questions/questions/anr/" + $rootScope.param.id + "?_client=8&_token=" + $rootScope.param._token)
                .success(function (data) {
                    $scope.item.isCommonAsked = true;
                })
        };
        //是否同问过 样式变蓝
        $scope.commonAskStyle = function () {
            if ($scope.item == undefined) {
                $scope.item = {
                    isCommonAsked: false
                }
            }
            if ($scope.item.isCommonAsked) {
                return {'color': '#0099E5'}
            }

        }


//返回到客户端的方法
        $scope.toBackInClient = function () {
            if ($scope.$env.inClient) {
                $env.call('toBackCallback',{nums:3});
            } else {
                javascript:history.go(-1)
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
        //监听态度 和应用
        $scope.$watch(function () {
            if (!$scope.item || !$scope.item.attitudes) return;
            var count = 0;
            for (var i in $scope.item.attitudes.items) {
                count += $scope.item.attitudes.items[i].users.count;
            }
            $scope.attitudesCount = count;
        });

        $rootScope.messageDialog = function (message) {
            var dialog = ngDialog.open({
                template: '<div align="center" >' + message + '</div>',
                plain: true,
                closeByDocument: true,
                closeByEscape: true
            });
            setTimeout(function () {
                dialog.close();
            }, 1500);
        };
        //回到列表跳望详情的方法      
        $scope.question_carousel = function (id) {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            $rootScope.param.needId=angular.copy($rootScope.param.id);
            $rootScope.param.p=angular.copy($scope.item.title);
            $rootScope.param.img=angular.copy($scope.item.coverfigure);
            $rootScope.rootShow.num=2;
            $rootScope.param.id=id;
            $rootScope.getArticleDetail2()

        }

        $scope.wapClose = function () {
            if ($env.isIOS) {
                $window.localStorage.setItem("skillDetail", "close");
            } else if ($env.isAndroid) {
                $env.call('toBackCallback');
            }
        }
        //去回答的方法
        $scope.toAnswer= function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            if($env.inClient){
                $env.call('toAnswer')
            }else{
                questionService
                var param={id:$rootScope.param.id,p:$scope.item.title,img:$scope.item.coverfigure}
                $env.call('toAnswer',param)
            }
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



$scope.goback= function (goNum) {
    $rootScope.param.id=$rootScope.param.needId;
    $rootScope.rootShow.num=goNum;
};



//获得回答详情的方法
        $rootScope.getArticleDetail2 = function () {
            $scope.carouselIndex=0;
            $scope.all_slides = []
            //获取详情
            YiServer.getDetail("answer", $rootScope.param).then(function (data) {

                $scope.item_answer = data;

                $scope.all_slides = data[$env.platform()].content.sections;
                if($scope.all_slides==undefined){
                    $scope.all_slides = []
                }
                $scope.all_slides.push({});
                $scope.showList = false;

                //某用户被关注的信息
                YiServer.getUserDetail($rootScope.param, $scope.item_answer.user.id)
                    .then(function (data) {
                        if ($scope.item_answer.user.fans == undefined) {
                            $scope.item_answer.user.fans = {count: 0}
                        }

                        $scope.item_answer.user.fans.count = data.data.fans.count;
                    })

                if ($scope.item_answer.collections !== undefined) {
                    $scope.item_answer.isCollected = YiServer.isInclude($scope.item_answer.collections.users, $rootScope.param.user_id)
                }

            })
        }
        //点赞和猜的方法,参数是 回答详情，和yes / no
$scope.zanOrCai=function (answer,type) {
            if(!answer.viewpoint.canExpress){

                $env.call('toToastCallBack', {"toast": "您已操作"});
                return;
            }
        answer.viewpoint.canExpress=!answer.viewpoint.canExpress;
        answer.viewpoint.isSupport[type]++;
 
        YiServer.answerZanOrCai(answer.id,type).then(function (data) {
            
        })
}
        //关注作者
        $scope.subscribeAuthor = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            if (!$scope.item_answer.user.hasSub) {
                YiServer.focusAuthor($rootScope.param, $scope.item_answer.user.id).then(function (data) {
                    $scope.item_answer.user.hasSub = !$scope.item_answer.user.hasSub;
                    if ($scope.item_answer.user.fans == undefined) {
                        $scope.item_answer.user.fans = {
                            count: 0
                        }
                    }
                    $scope.item_answer.user.fans.count = $scope.item_answer.user.fans.count + 1
                })
            } else {
                YiServer.unFocusAuthor($rootScope.param, $scope.item_answer.user.id).then(function (data) {
                    $scope.item_answer.user.hasSub = !$scope.item_answer.user.hasSub;
                    $scope.item_answer.user.fans.count = $scope.item_answer.user.fans.count - 1
                })
            }
        };

        //收藏这篇回答
        $scope.collecteAticle = function () {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }

            if ($scope.item_answer.isCollected == undefined || $scope.item_answer.isCollected == false) {
                YiServer.collecteType("answers", $rootScope.param).then(function (data) {
                    $scope.item_answer.isCollected = true;
                    $env.call('toToastCallBack', {"toast": "收藏成功"});
                })
            } else {
                YiServer.unCollecteType("answers", $rootScope.param).then(function (data) {
                    $scope.item_answer.isCollected = false;
                    $env.call('toToastCallBack', {"toast": "取消收藏"});
                })
            }
        };

        $scope.collectionStyle = function () {
            if ($scope.item_answer == undefined) {
                $scope.item_answer = {
                    isCollected: false
                }
            }
            if ($scope.item_answer.isCollected) {
                return {'color': '#0099E5'}
            }

        }

        
//点态度的方法
        $scope.attitude = function (att, articleId) {
            if ($rootScope.isVisitor == true && $env.inClient !== true) {
                $rootScope.login();
                return;
            }
            var client = $env.isIOS ? "ios" : "android";
            var scored = $scope.item_answer.attitudes.scored;
            if (!scored) {
                YiServer.clickAttitude("answers", $rootScope.param, articleId, att.id).then(function (data) {
                    if (!$scope.item_answer.attitudes.scored) {
                        $scope.item.attitudes.scored = true;
                        att.users.count += 1;
                        att.hasClick = true;
                    }
                })
            } else {
                $env.call('toToastCallBack', {"toast": "您已经点过态度了"});
            }

        };
        //态度条的 长度的方法
        $scope.attitudesBarStyle = function (att) {
            var height = 100 * (att.users.count / $scope.attitudesCount);
            return {height: height + '%'};
        };

        //点击 态度评论的方法  颜色变化的方法
        $scope.attitudesColorStyle = function (att) {
            if (att.hasClick)
                return {color: "#e5e5e5"};
            else
                return {color: "#0099e5"};
        };


        $scope.goto = function (data) {
            $scope.showList = false;
            $scope.carouselIndex = data;
        }


        $scope.toUserHome = function (userId) {
            if($env.readOnlyInHere){
                return
            }
            $env.call('toUserHome', {"id": userId})
        }
        //监听态度
        $scope.$watch(function () {
            if (!$scope.item_answer || !$scope.item_answer.attitudes) return;
            var count = 0;
            for (var i in $scope.item_answer.attitudes.items) {
                count += $scope.item_answer.attitudes.items[i].users.count;
            }
            $scope.attitudesCount = count;
        });
//返回到客户端的方法
        $scope.toBack = function () {
            if ($scope.$env.inClient) {
                $env.call('toBackCallback');
            } else {
                javascript:history.go(-1)
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

        $rootScope.messageDialog = function (message) {
            var dialog = ngDialog.open({
                template: '<div align="center" >' + message + '</div>',
                plain: true,
                closeByDocument: true,
                closeByEscape: true
            });
            setTimeout(function () {
                dialog.close();
            }, 1500);
        };
        $scope.toAnswer= function () {
            questionService
            if($env.inClient){
                $env.call('toAnswer')
            }else{
                var param={id:$rootScope.param.needId,p:$rootScope.param.p,img:$rootScope.param.img}
                $env.call('toAnswer',param)
            }
        }

        $scope.toComment = function () {
            $rootScope.rootShow.num=3;
            $rootScope.getComment()

            //$window.location.href = "http://" + $location.$$host + ":" + $location.$$port + "/answers/topic.html?id=" + $rootScope.param.id + "&base=" + $rootScope.param.base + "&res=" + $rootScope.param.res + "&_token=" + $rootScope.param._token + "&user_id=" + $rootScope.param.user_id + "&inClient=" + $rootScope.param.inClient
        }

        //评论列表
        var comment_offset = 0
        var comment_limit = 5
        $rootScope.getComment = function () {
            //$http.get($rootScope.param.base + "/v3/questions/54b728cb3500003f055aee06/comments?type=1&_token=" + $rootScope.param._token + "&offset=" + comment_offset + "&limit=" + comment_limit)
            $http.get($rootScope.param.base + "/v3/answers/" + $rootScope.param.id + "/comments?type=1&_token=" + $rootScope.param._token + "&offset=" + comment_offset + "&limit=" + comment_limit)
                .success(function (data) {
                    $scope.commentfs = {}
                    if (data.data.results.length == 0) {
                        return;
                    }
                    for (var i = 0; i < data.data.results.length; i++) {
                        data.data.results[i].quote = [];
                        var a = data.data.results[i].content;
                        $scope.show = function (a) {
                            if (a.quote == undefined) {
                                return true;
                            } else {
                                data.data.results[i].quote.push(a.quote);
                                $scope.show(a.quote);
                            }
                        };
                        $scope.show(a);
                        $scope.commentfs = data.data.results;

                        $scope.commentfs.showMore = false;
                        if (data.data.count < data.data.total) {
                            $scope.commentfs.showMore = true;
                        }
                    }
                    for (var i = 0; i < $scope.commentfs.length; i++) {
                        $scope.commentfs[i].createdOn = $scope.compareTime.getTime($scope.commentfs[i].createdOn);
                        //$scope.commentfs[i].createdOn = $scope.commentfs[i].createdOn;
                        for (var j = 0; j < $scope.commentfs[i].quote.length; j++) {
                            $scope.commentfs[i].quote[j].orderId = $scope.commentfs[i].quote.length - j;
                            $scope.commentfs[i].quote[j].child = [];
                        }
                        if ($scope.commentfs[i].quote.length > 0) {
                            var kongArray = [];
                            $scope.commentfs[i].quote = $scope.toNeedArray(kongArray, $scope.commentfs[i].quote);
                        }
                    }
                    $scope.commentfs;
                }).error(function (data) {
                });
        }
        $timeout($rootScope.getComment(), 500)
//加载更多评论
        $scope.showMoreComment = function () {
            comment_limit = 5 + comment_limit;
            $rootScope.getComment()
        }

//楼层数大于 5时 开始不显示 边框
        $scope.louStyle = function (one) {
            if (one.orderId > 5) {
                return {
                    'border-left': '0px solid rgba(0, 51, 77, 0.1)',
                    'border-right': '0px solid rgba(0, 51, 77, 0.1)',
                    'padding-left': '0px ',
                    'padding-right': '0px',

                }
            }
        };

//变化评论数据结构的方法（盖楼）
        var toNeedArray_index = 0;
        $scope.toNeedArray = function (array, oldArray) {
            array.push(oldArray[toNeedArray_index]);
            if (toNeedArray_index < oldArray.length) {
                toNeedArray_index = toNeedArray_index + 1;
                $scope.toNeedArray(array[0].child, oldArray);
            }
            toNeedArray_index = 0;
            return array;
        }


        //点击评论的方法
        $scope.showCommentDialog = function (one) {
            ngDialog.open({
                id: 'commentDialog',
                template: 'html/commentDialog.html',
                className: 'ngdialog-theme-plain',
                controller: ['$scope', '$http', function ($scope, $http) {

                    $scope.commentShow = "说点什么";
                    $scope.commentId = null;
                    if (one != undefined) {

                        if (one.content.user != undefined) {
                            $scope.commentShow = "回复：" + one.content.user;
                            $scope.commentId = one.id
                        }
                    }

                    $scope.commentValue = "";
                    $scope.commentSend = function () {

                        if ($scope.commentValue != "") {
                            ngDialog.close();
                            $http.post($rootScope.param.base + '/v3/answers/' + $rootScope.param.id + '/commentsForJsonp',
                                {
                                    'type': 1,
                                    'content': $scope.commentValue,
                                    //img: null,
                                    'replyTo': $scope.commentId
                                }
                                , {
                                    params: {
                                        _client: '7',
                                        _cver: '28828',
                                        _token: $rootScope.param._token
                                    },
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                    }
                                }
                            ).success(function () {
                                    //$rootScope.messageDialog("评论成功!")
                                    $rootScope.getComment();
                                }).error(function () {

                                });
                        } else {
                            $env.call('toToastCallBack', {"toast": "评论不能为空"});
                        }

                    }
                }],
                showClose: false
            });

        }

        //给评论点赞的方法
        $scope.attitudeToZan = function (one) {
            if ($rootScope.isVisitor == true) {
                $scope.isVisitorFn();
                return;
            }
            $http.post($rootScope.param.base + '/v3/answers/comments/' + one.id + '/attitude', {}, {
                    params: {
                        att: '1',
                        _client: '7',
                        _cver: '28828',
                        _token: $rootScope.param._token
                    },
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                }
            ).success(function (data) {
                    if (data.code == 200) {
                        if (one.attitudes == undefined) {
                            one.attitudes = {}
                            one.attitudes.count = {}
                            one.attitudes.count.like = 0;
                        }

                        one.attitudes.count.like = one.attitudes.count.like + 1;
                    }
                }).error(function (data) {
                    if (data.code == 429) {
                        $env.call('toToastCallBack', {"toast": "您已经点过赞了"});

                    }
                });
        };
    }]);