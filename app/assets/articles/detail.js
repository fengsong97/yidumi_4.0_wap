'use strict';

angular.module('articles', ['ngSanitize', 'env', 'apps', 'ngDialog', 'YiModule'], ['$locationProvider', '$sceDelegateProvider', function ($locationProvider, $sceDelegateProvider) {
  $locationProvider.html5Mode(true);
  $sceDelegateProvider.resourceUrlWhitelist(['self', '**']);
}]);



angular.module('articles').controller('articles.DetailCtrl', ['$scope', '$rootScope', '$window', '$http', '$timeout', '$env',
  'appDownload', 'SysConfig', 'findDetails', 'CompareTime', 'ngDialog', 'YiServer',
  function ($scope, $rootScope, $window, $http, $timeout, $env, appDownload,
            SysConfig, findDetails, CompareTime, ngDialog, YiServer) {

    $window.onscroll =YiServer.scrollUpOrDown;
    $scope.toTop =YiServer.toTop;
    $scope.scrollTo= function (id) {
      if(document.getElementById(id)){
        $scope.toTop(document.getElementById(id).offsetTop)
        $rootScope.scrollUpOrDown=true
      }

    }
    $scope.compareTime = CompareTime;
    $scope.$env = $env;
    $scope.platform = $env.platform();

    if ($rootScope.param.inClient == "true") {
      $scope.$env.inClient = true;
      $env.inClient = true;
      $env.setInClient(true)

    }
    //获取文章详情 和 该作者 的被关注信息
    $rootScope.getArticleDetail = function () {
      if (!($rootScope.param.base && $rootScope.param.id)) {
      } else {
        //文章详情
        
        YiServer.getDetail("articles", $rootScope.param).then(function (data) {
          $rootScope.getComment()
          $scope.item = data;

          //某用户被关注的信息
          YiServer.getUserDetail($rootScope.param, $scope.item.user.id)
              .then(function (data) {
                if ($scope.item.user.fans == undefined) {
                  $scope.item.user.fans = {count: 0,item:[]}
                }
                $scope.item.user.fans = data.data.fans;
              })

          $scope.__ = $scope.item[$scope.platform];
          if ($scope.__.apps == undefined) {
            return null;
          }

          if ($env.isAndroid || $env.isIOS) {
            $scope.showApps = $scope.__.apps[$scope.platform]
          } else {
            
            $scope.showApps = $scope.__.apps["android"] ? ($scope.__.apps["android"]).concat($scope.__.apps["ios"]?$scope.__.apps["ios"]:[]) : $scope.__.apps["ios"]?$scope.__.apps["ios"]:[];
          }
          if ($scope.item.collections !== undefined) {
            $scope.item.isCollected = YiServer.isInclude($scope.item.collections.users, $rootScope.param.user_id)
          }
        })
      }
    }

    //评论列表
    var comment_offset = 0
    var comment_limit = 5
    $rootScope.getComment = function () {
      YiServer.getComments("articles", $rootScope.param, comment_offset, comment_limit)
          .then(function (data) {
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
              for (var j = 0; j < $scope.commentfs[i].quote.length; j++) {
                $scope.commentfs[i].quote[j].orderId = $scope.commentfs[i].quote.length - j;
                $scope.commentfs[i].quote[j].child = [];
              }
              if ($scope.commentfs[i].quote.length > 0) {
                var kongArray = [];
                $scope.commentfs[i].quote = $scope.toNeedArray(kongArray, $scope.commentfs[i].quote);
              }
            }
          })
    }
    //$timeout($rootScope.getComment(), 500)
//加载更多评论
    $scope.showMoreComment = function () {
      comment_limit = 5 + comment_limit;
      $rootScope.getComment()
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
      if ($env.isAndroid && $env.inClient) {
        $env.call("toShare")
        return
      }
      YiServer.shareStatistics($rootScope.param,"articles",3)

      YiServer.shareDialog(title)


    }
//点击评论的方法
    $scope.showCommentDialog = function (one) {
      
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
      ;
      if ($scope.$env.isAndroid && $scope.$env.inClient && false) {
        $env.call('toPingLunCallback', one == undefined ? "null" : {"id": one.id});
      } else {
        YiServer.commentDialog(one)
      }
    }





//关注作者
    $scope.subscribeAuthor = function () {
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

    //收藏这篇文章
    $scope.collecteAticle = function () {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }

      if ($scope.item.isCollected == undefined || $scope.item.isCollected == false) {
        YiServer.collecteType("articles", $rootScope.param).then(function (data) {
          $scope.item.isCollected = true;
          $env.call('toToastCallBack', {"toast": "收藏成功"});
        })
      } else {
        YiServer.unCollecteType("articles", $rootScope.param).then(function (data) {
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
        return {'color': '#0099e5'}
      }

    }
//点态度的方法
    $scope.attitude = function (att, articleId) {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
      var client = $env.isIOS ? "ios" : "android";
      var scored = $scope.item.attitudes.scored;
      //$env.call('attitudesCallback', {'attId': att.id, 'scored': scored});
      if (!scored) {
        YiServer.clickAttitude("articles", $rootScope.param, articleId, att.id).then(function (data) {
          if (!$scope.item.attitudes.scored) {
            $scope.item.attitudes.scored = true;
            att.users.count += 1;
            att.hasClick = true;
          }
        })
      } else {
        $env.call('toToastCallBack', {"toast": "您已经点过态度了"});
      }

    };
    //点击 态度评论的方法  颜色变化的方法
    $scope.attitudesColorStyle = function (att) {
      if (att.hasClick)
        return {color: "#e5e5e5"};
      else
        return {color: "#0099e5"};
    };
    //给评论点赞的方法
    $scope.attitudeToZan = function (one) {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
      YiServer.clickCommentZan("articles", $rootScope.param, one.id).then(function (data) {
        if (data.code == 200) {
          if (one.attitudes == undefined) {
            one.attitudes = {}
            one.attitudes.count = {}
            one.attitudes.count.like = 0;
          }

          one.attitudes.count.like = one.attitudes.count.like + 1;
        }
      }, function (data) {
        if (data.code == 429) {
          $env.call('toToastCallBack', {"toast": "您已经点过赞了"});

        }
      })
    };



//关注标签
    $scope.subscribeArticle = function (tag) {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
      if (!tag.hasSub) {
        YiServer.focusTag($rootScope.param, tag.id).then(function () {
          tag.hasSub = !tag.hasSub;
        })

      } else {
        YiServer.UnFocusTag($rootScope.param, tag.id).then(function () {
          tag.hasSub = !tag.hasSub;
        })
      }
    };
//返回到客户端的方法
    $scope.toBack = function () {
      if ($scope.$env.inClient) {
        $env.call('toBackCallback',{nums:1});
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
//态度条的 长度的方法
    $scope.attitudesBarStyle = function (att) {
      var height = 100 * (att.users.count / $scope.attitudesCount);
      return {height: height + '%'};
    };

//.....
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
//查看库品详情的方法
    $scope.findDetails = function (type, id) {
      findDetails(type, id, $rootScope.param);
    };

    //监听态度
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
        closeByEscape: true,
        showClose: false
      });
      setTimeout(function () {
        dialog.close();
      }, 1200);
    };



    $scope.toUserHome = function (userId) {
      if($env.readOnlyInHere){
        return
      }
      $env.call('toUserHome', {"id": userId})
      //$window.location.href='http://localhost:63342/yidu/www/index.html#/userList/'+$scope.item.user.id
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
