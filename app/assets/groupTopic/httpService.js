/**
* httpModule Module
*
* Description
*/
var httpModule=angular.module('httpModule', [])
httpModule.service('httpService', ['$http','$p', function($http,$p){
	this.send=function (method,url,param,data) {
		// body...

	}


}])