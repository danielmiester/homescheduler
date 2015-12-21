var basicController = [
	'$scope', 
	function($scope) {
		$scope.foo = new Date();
		$scope.saveDate = function(value){
			console.log("saving value", value);
		}
		$scope.cancelDate = function(){
			console.log("Date Canceled")
		}
	}
];
var controller = //[
	// '$scope',
	// '$cookies',
	// '$resource',
	// '$sanitize',
	// 'socket',
	// ''
	function controller($scope,$cookies,$resource,$sanitize,socket,$mdDialog){
		$scope.chores = [];
		$scope.options = {
			showDone:false,
			hideSnoozed:false
		}
		$scope.sortBy = ["done","name"];
		socket.emit("initialized");
		socket.emit("chores:getAll",{"done":$scope.showDone});
		socket.on("choresResp",function(chores){
			$scope.chores = chores;
		});
		socket.on("options:load",function(options){
			for(var i in options){
				$scope.options[i] = options[i];
			}
		})
		$scope.saveOptions=function(){
			var f = arguments;
			console.log(f);
			socket.emit("options:set",this.options)
		}
		$scope.choreDone=function(){
			socket.emit("chore:done",this.chore._id);
		}
		$scope.choreWake=function(){
			socket.emit("chore:wake",this.chore._id);
		}
		$scope.sortOptions=function (){
			console.log("sortOptions",arguments);
		}
		socket.on("chores:update",function updateChores(){
			console.log(arguments)
		})
		$scope.loadDone=function(){
			socket.emit("chores:get",{"done":$scope.showDone});
		}
		$scope.showAdvanced = function(ev) {
		    $mdDialog.show({
		      controller: DialogController,
		      templateUrl: 'dialog1.tmpl.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true,
		      fullscreen: $mdMedia('sm') && $scope.customFullscreen
		    })
		    .then(function(answer) {
		      $scope.status = 'You said the information was "' + answer + '".';
		    }, function() {
		      $scope.status = 'You cancelled the dialog.';
		    });
		    $scope.$watch(function() {
		      return $mdMedia('sm');
		    }, function(sm) {
		      $scope.customFullscreen = (sm === true);
		    });
		  };
		 
	}
// ];
var app = angular.module('HomeSchedulerApp', [
	'ngCookies',
	'ngResource',
	'ngMaterial',
	'ngSanitize',
	'scDateTime'
])
app.factory('socket', function ($rootScope) {
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
app.config(function($mdThemingProvider) {
  		$mdThemingProvider.theme('default')
		.primaryPalette('brown')
		.accentPalette('red')
});
app.value('scDateTimeConfig', {
		    defaultTheme: 'material',
		    autosave: false,
		    defaultMode: 'date/time',
		    defaultDate: undefined, //should be date object!!
		    displayMode: undefined,
		    defaultOrientation: false,
		    displayTwentyfour: false,
		    compact: false
		})
app.controller('basicController', basicController)
app.controller('ChoreCtrl', controller)
