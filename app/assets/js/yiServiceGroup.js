/**
* yiServiceGroup Modul;
*
* Description
*/
var yiServiceGroup= angular.module('yiServiceGroup', ['env']);
yiServiceGroup.service('yiServiceGroup', ['$http','$q','$rootScope', '$env','ngDialog','$location', function($http,$q,$rootScope, $env,ngDialog,$location){
     this.commentDialog= function (one) {
        ngDialog.open({
            id: 'commentDialog',
            template: 'html/commentDialog.html',
            className: 'ngdialog-theme-plain',
            controller: ['$scope', '$http', '$location', function ($scope, $http, $location) {
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
	
}])