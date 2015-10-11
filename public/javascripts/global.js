var controller = [
	'$scope',
	'$cookies',
	'$resource',
	'$sanitize',
	'socket',
	'db',
	function controller($scope,$cookies,$resource,$sanitize,socket,db){
		$scope.db = db;
		$scope.chores = [];
		$scope.sortBy = ["done","name"];
		socket.emit("initialized");
		socket.emit("getChores");
		socket.on("choresResp",function(chores){
			$scope.chores = chores;
		});
		$scope.choreDone=function(){
			socket.emit("choreDone",this.chore._id);
		}
		$scope.choreWake=function(){
			socket.emit("choreWake",this.chore._id);
		}
		$scope.sortOptions = function sortOptions(){
			console.log("sortOptions",arguments)
		}
		socket.on("choresUpdate",function updateChores(){
			console.log(arguments)
		})
		$scope.chore
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

