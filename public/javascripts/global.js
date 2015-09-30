var controller = [
	'$scope',
	'$cookies',
	'$resource',
	'$sanitize',
	'socket',
	'db',
	function ($scope,$cookies,$resource,$sanitize,socket,db){
		$scope.db = db;
		$scope.chores = [];
		$scope.sortBy = ["done","name"];
		socket.emit("initialized");
		socket.emit("getChores");
		socket.on("choresResp",function(chores){
			$scope.chores = chores.sort(byAll($scope.sortBy))
		});
		$scope.choreDone=function(){
			socket.emit("choreDone",this.chore._id);
		}
		$scope.choreWake=function(){
			socket.emit("choreWake",this.chore._id);
		}
		socket.on("choresUpdate",function(chore){
			var i = $scope.chores.findIndex(function(e){
				return chore._id === e._id;
			});
			$scope.chores.splice(i,1,chore);
		})
	}
];
var app = angular.module('HomeSchedulerApp', [
	'ngCookies',
	'ngResource',
	'ngMaterial',
	'ngSanitize'
])
.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
	on: function (eventName, callback) {
	  socket.on(eventName, function () {  
		var args = arguments;
		$rootScope.$apply(function () {
		  callback.apply(socket, args);
		});
	  });
	},
	emit: function (eventName, data, callback) {
	  socket.emit(eventName, data, function () {
		var args = arguments;
		$rootScope.$apply(function () {
		  if (callback) {
			callback.apply(socket, args);
		  }
		});
	  })
	}
  };
})
.factory("db",function(){
  return {};
})
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
	.primaryPalette('brown')
	.accentPalette('red')


}).controller('ChoreCtrl', controller);

