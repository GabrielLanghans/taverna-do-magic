'use strict';


angular.module('tavernadomagicApp').factory('User', function () {
	var userResponse = [];

	return {
		setUser:function (data) {
			userResponse = data;
		//console.log(data);
		},
		getUser:function () {
			return userResponse;
		}
	};
});

angular.module('tavernadomagicApp').controller('authCtrl', function($scope, $rootScope, $location, $firebase, $firebaseSimpleLogin, fireFactory, User){

	$rootScope.user = User.getUser();

	$scope.loginObj = $firebaseSimpleLogin(fireFactory.firebaseRef());

	console.log($scope.loginObj);

	$scope.loginObj.$getCurrentUser().then(function(loginStatus){
		if(loginStatus === null){
			console.log('=======================');
			console.log('usuário deslogado');
			console.log('=======================');

			User.setUser(null);
			$rootScope.user = null;

			$location.path('/');
		}
		else{
			console.log('=======================');
			console.log('usuário logado: ', loginStatus);
			console.log('=======================');

			User.setUser(loginStatus);
			$rootScope.user = loginStatus;

			var userRef = fireFactory.firebaseRef('users/' + $rootScope.user.uid);
			userRef.on('value', function(snapshot) {
				if(snapshot.val() === null){
					console.log('Vazio. Usuário não existe na base! Criar usuário na firebase!');
				}
				else{
					$rootScope.$apply(function() {
						// console.log("usuario existente: ");
						// console.log(snapshot.val());
						$location.path('/home');
					});
				}
			});
		}


	});



	$scope.login = function(type){
		$scope.loginObj.$login(type, {
			// email: 'my@email.com',
			// password: 'mypassword'
			}).then(function(user) {
				console.log('=======================');
				console.log('usuário logado: ', user);
				console.log('=======================');

				User.setUser(user);
				$rootScope.user = user;

				var userRef = fireFactory.firebaseRef('users/' + $rootScope.user.uid);
				userRef.on('value', function(snapshot) {
					if(snapshot.val() === null){
						console.log('Vazio. Usuário não existe na base! Criar usuário na firebase!');

						var newUserRef = fireFactory.firebaseRef('users/');

						newUserRef.child($rootScope.user.uid).set({name: $rootScope.user.displayName, uid: $rootScope.user.uid, tradeList: ''}, function(){
							console.log('USER Adicionado!!!');
						});

					}
					else{
						$rootScope.$apply(function() {
						// console.log("usuario existente: ");
						// console.log(snapshot.val());
						$location.path('/home');
						});
					}
				});

			}, function(error) {
				User.setUser(error);
				$rootScope.user = error;

				console.error('Login failed: ', error);
			}
		);

	};

	$scope.logout = function(){
		console.log('oi');
		//$scope.loginObj.$logout();
		//$location.path("/home");



			$scope.loginObj.$logout();

			//$location.path("/");
	};
});



angular.module('tavernadomagicApp').controller('MainCtrl', function($scope, $rootScope, firebaseData){

	$scope.data = firebaseData;
	console.log($scope.data);

	//NO LOGOUT ELE N TA ATUALIZANDO OS DADOS DA TELA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


});