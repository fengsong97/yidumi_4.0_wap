/**
*  Module
*
* Description
*/
var urlParamModule=angular.module('urlParamModule', []);

urlParamModule.constant('urlParamConstant', {

  	// base:'http://openapi.1du.me', 
 	// res:'http://image.1dume.com.cn'

	base:'http://118.186.210.42:9288',
	res:'http://image.1dume.com.cn'

	// res: 'http://118.186.210.42:280',
    // html5Url:'http://m.1dume.com.cn',

});


urlParamModule.service('userInfoService', ['$http','$q','$location','$window','urlParamConstant' ,function($http,$q,$location,$window,urlParamConstant){
	
this.getUserInfo=function () {
	var params=$location.search();	
	var deferred=$q.defer();
	if(!params._token){

	 	if(!$window.localStorage.getItem("login_user_token")){

	 		$http({
	 			method:'get',
	 			url:urlParamConstant.base+ "/v3/users/me/0/sharwe?"
	 		}).success(function (data0) {
	 			$http({
	 				method:'get',
	 				url:urlParamConstant.base+ '/v3/users/' + data0.id + '?_client=' + '7' + '&_cver=28828&_token=' + data0.token
	 			}).success(function (data1) {
	 				deferred.resolve(data1);
	 			})
	 		})

	 	}else{
			var _token=$window.localStorage.getItem("login_user_token");
			var user_id=$window.localStorage.getItem("login_user_id")

			
			$http({
	 				method:'get',
	 				url:urlParamConstant.base+ '/v3/users/' + user_id + '?_client=' + '7' + '&_cver=28828&_token=' + _token
	 			}).success(function (data) {
	 				deferred.resolve(data);
	 			})
 			 

	 	}
		

	 }else{
	 	
			$http({
	 				method:'get',
	 				url:urlParamConstant.base+ '/v3/users/' + params.user_id + '?_client=' + '7' + '&_cver=28828&_token=' + params._token
	 			}).success(function (data) {
	 				deferred.resolve(data);
	 			})
 		

	 }
	return deferred.promise;
}
	 

}])

// urlParamModule.factory('myInterceptor', ['$rootScope','$location','$q','userInfoService','urlParamConstant', function($rootScope,$location,$q,userInfoService,urlParamConstant) {
//   $rootScope.params=$location.search();
//   var  base="http://192.168.0.200"
//   var params={
//     _client:7,
//     _cver:4
 
//   }
//     var requestInterceptor = {
//         request: function(config) {
// if( /php/i.test(config.url)){

//           if(config.method=="JSONP"){
//             config.url=config.url+
//             "&_client="+params._client+
//             "&_cver="+params._cver+
//             "&_token="+$rootScope.params._token+
//             "&userId="+$rootScope.params.user_id+
//             "&callback=JSON_CALLBACK";

//           } else if(config.method=="GET"){
            
//              config.url=config.url+""
//           }else if(config.method=="POST"){
              
//               config.url=config.url+
//               "&_client="+params._client+
//               "&_cver="+params._cver+
//               "&_token="+$rootScope.params._token+
//               "&userId="+$rootScope.params.user_id;

//               config.headers["Content-Type"]="application/x-www-form-urlencoded; charset=UTF-8"
             
         
            
//           }else{

//           }
// }


//           return config;
    
//         }
//     };

//     return requestInterceptor;
// }]);