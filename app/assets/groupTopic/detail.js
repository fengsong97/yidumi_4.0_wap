'use strict';

  var  base="http://192.168.0.200"


angular.module('articles', ['ngSanitize', 'env', 'apps', 'ngDialog', 'YiModule'], ['$locationProvider', '$sceDelegateProvider', function ($locationProvider, $sceDelegateProvider) {
  $locationProvider.html5Mode(true);
  $sceDelegateProvider.resourceUrlWhitelist(['self', '**']);
}]);

angular.module('articles').config(function($httpProvider){  
 
   $httpProvider.interceptors.push('myInterceptor');

  
});  
angular.module('articles').factory('myInterceptor', ['$rootScope','$location','$q', function($rootScope,$location,$q) {
  $rootScope.params=$location.search();
  var  base="http://192.168.0.200"
  var params={
    _client:7,
    _cver:4
 
  }
    var requestInterceptor = {
        request: function(config) {
if( /php/i.test(config.url)){

          if(config.method=="JSONP"){
            config.url=config.url+
            "&_client="+params._client+
            "&_cver="+params._cver+
            "&_token="+$rootScope.params._token+
            "&userId="+$rootScope.params.user_id+
            "&callback=JSON_CALLBACK";

          } else if(config.method=="GET"){
            
             config.url=config.url+""
          }else if(config.method=="POST"){
              
              config.url=config.url+
              "&_client="+params._client+
              "&_cver="+params._cver+
              "&_token="+$rootScope.params._token+
              "&userId="+$rootScope.params.user_id;

              config.headers["Content-Type"]="application/x-www-form-urlencoded; charset=UTF-8"
             
         
            
          }else{

          }
}


          return config;
    
        }
    };

    return requestInterceptor;
}]);


angular.module('articles').controller('articles.DetailCtrl', ['$scope', '$rootScope', '$window', '$http','$location', '$timeout', '$env',
  'appDownload', 'SysConfig', 'findDetails','clientDownload', 'CompareTime', 'ngDialog', 'YiServer',
  function ($scope, $rootScope, $window, $http, $location,$timeout, $env, appDownload,
            SysConfig, findDetails,clientDownload, CompareTime, ngDialog, YiServer) {
    
  //   userInfoService.getUserInfo().then(function (data) {
      
  //     $window.localStorage.setItem('login_user_token',data.token)
  //     $window.localStorage.setItem('login_user_id',data.id)

  //     $rootScope.userInfo=data;

  //     $rootScope.params._token=data.token;
  //     $rootScope.params.user_id=data.id;
  // })


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
    $scope.clientDownload=clientDownload;

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
        $http({
          method:'jsonp',
          url:base+'/v4/group/topics_get_detail.php?',
          params:{topicId:$rootScope.params.id,type:1}
        }).success(function (data) {
          $rootScope.getComment()
          $scope.item = data.data;

          //某用户被关注的信息
          YiServer.getUserDetail($rootScope.param, $scope.item.results[0].user.id)
              .then(function (data) {
                if ($scope.item.results[0].user.fans == undefined) {
                  $scope.item.results[0].user.fans = {count: 0,item:[]}
                }
                $scope.item.results[0].user.fans = data.data.fans;
              })

          // $scope.__ = $scope.item[$scope.platform];
          // if ($scope.__.apps == undefined) {
          //   return null;
          // }

          // if ($env.isAndroid || $env.isIOS) {
          //   $scope.showApps = $scope.__.apps[$scope.platform]
          // } else {
            
          //   $scope.showApps = $scope.__.apps["android"] ? ($scope.__.apps["android"]).concat($scope.__.apps["ios"]?$scope.__.apps["ios"]:[]) : $scope.__.apps["ios"]?$scope.__.apps["ios"]:[];
          // }
          // if ($scope.item.collections !== undefined) {
          //   $scope.item.isCollected = YiServer.isInclude($scope.item.collections.users, $rootScope.param.user_id)
          // }
        })
      }
    }

    //评论列表
    var comment_offset = 0
    var comment_limit = 5
    $rootScope.getComment = function () {
     //话题评论列表详情
 
    $http({
          method:'jsonp',
          url:base+'/v4/group/topics_get_detail.php?',
          params:{topicId:$rootScope.params.id,type:2}
        }).success(function (data) {
           $scope.itemComments=data.data;
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
    $scope.showCommentDialog = function (one,type) {
      
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
      ;
      if ($scope.$env.isAndroid && $scope.$env.inClient && false) {
        $env.call('toPingLunCallback', one == undefined ? "null" : {"id": one.id});
      } else {
        YiServer.commentDialogForPhp(one,type)
      }
    }





//关注作者
    $scope.subscribeAuthor = function () {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
      if (!$scope.item.results[0].user.hasSub) {
        YiServer.focusAuthor($rootScope.param, $scope.item.results[0].user.id).then(function (data) {
          $scope.item.results[0].user.hasSub = !$scope.item.results[0].user.hasSub;
          if ($scope.item.results[0].user.fans == undefined) {
            $scope.item.results[0].user.fans = {
              count: 0
            }
          }
          $scope.item.results[0].user.fans.count = $scope.item.results[0].user.fans.count + 1
        })
      } else {
        YiServer.unFocusAuthor($rootScope.param, $scope.item.results[0].user.id).then(function (data) {
          $scope.item.results[0].user.hasSub = !$scope.item.results[0].user.hasSub;
          $scope.item.results[0].user.fans.count = $scope.item.results[0].user.fans.count - 1
        })
      }
    };

    //收藏这篇文章
    $scope.collecteAticle = function () {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }
          $http({
            method:'jsonp',
            url:base+"/v4/group/topics_operate.php?",
            params:{action:'favorite',topicId:$rootScope.params.id}
        
          }).success(function (data) {
            if(data.code==200){
              $scope.item.isCollected = true;
              $env.call('toToastCallBack', {"toast": "收藏成功"});
            }else if(data.code==429){
                  $http({
                      method:'jsonp',
                      url:base+"/v4/group/topics_operate.php?",
                      params:{action:'favoriteCancel',topicId:$rootScope.params.id}
              
                   }).success(function (data) {
                     $scope.item.isCollected = false;
                      $env.call('toToastCallBack', {"toast": "取消收藏"});
                   })

            }
              
          })

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

    //给评论点赞的方法
    $scope.attitudeToZan = function (one,type) {
      if ($rootScope.isVisitor == true && $env.inClient !== true) {
        $rootScope.login();
        return;
      }

     $http({
      method:'jsonp',
      url:base+"/v4/group/topics_operate.php?",
      params:{action:type,topicId:one.id}
    
      }).success(function(data){  
         if (data.code == 200) {               
                one.statistics[type]=one.statistics[type]+ 1;       
                $env.call('toToastCallBack', {"toast": "操作成功"});
              }
           else if(data.code == 429){
             $env.call('toToastCallBack', {"toast": "您已经操作过了"});
           } 
      })  
    };




//返回到客户端的方法
    $scope.toBack = function () {
      if ($scope.$env.inClient||true) {
        $env.call('toBackCallback',{nums:4});
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
