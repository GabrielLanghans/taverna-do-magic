'use strict';

var tavernadomagicApp = angular.module('tavernadomagicApp', ['firebase', 'ngRoute', 'ngAnimate']);

tavernadomagicApp.factory('fireFactory', function(Firebase, $firebase) {
    var baseUrl = 'https://taverna-do-magic.firebaseio.com/',
    scopeName = '';

    return {
        firebaseRef: function(path) {
            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;
            return new Firebase(path);
        },
        dataRef: function(path, name) {
            if(name === undefined){
                scopeName = 'dataList';
            }
            else{
                scopeName = name;
            }

            path = (path !== undefined) ?  baseUrl + '/' + path : baseUrl;

            var ref = new Firebase(path);

            return $firebase(ref);
        }
    };
});

tavernadomagicApp.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'MainCtrl',
        resolve: {
            firebaseData: ['fireFactory', '$firebaseSimpleLogin', '$q', '$rootScope', 'User', function(fireFactory, $firebaseSimpleLogin, $q, $rootScope, User) {

                //aqui se estiver logado tem que carregar os dados do usuario, senão carrega só as cartas
                var loginObj = $firebaseSimpleLogin(fireFactory.firebaseRef()),
                    defer = $q.defer();

                console.log(loginObj);

                loginObj.$getCurrentUser().then(function(loginStatus){
                    console.log(loginStatus);

                    if(loginStatus === null){
                        console.log('=======================');
                        console.log('usuário deslogado');
                        console.log('=======================');

                        var def = $q.defer(),
                            obj = fireFactory.dataRef('cards/');

                        User.setUser(null);
                        $rootScope.user = null;

                        //$location.path('/');
                        obj.$on('loaded', function() {
                            def.resolve(obj);
                        });
                        defer.resolve(def.promise);
                    }
                    else{
                        console.log('=======================');
                        console.log('usuário logado: ', loginStatus);
                        console.log('=======================');

                        var cardsPromise = $q.defer(),
                            userPromise = $q.defer(),
                            cardsObj = fireFactory.dataRef('cards/'),
                            userObj = fireFactory.dataRef('users/' + $rootScope.user.uid);

                        User.setUser(loginStatus);
                        $rootScope.user = loginStatus;

                        cardsObj.$on('loaded', function() {
                            cardsPromise.resolve(cardsObj);
                        });

                        userObj.$on('loaded', function() {
                            userPromise.resolve(userObj);
                        });

                        $q.all([cardsPromise.promise, userPromise.promise]).then(function (results) {
                            console.log(results);
                            defer.resolve({cards: results[0], user: results[1]});
                        });
                    }
                });

                return defer.promise;
            }]
        }
    })

    .otherwise({
        redirectTo: '/'
    });

    //$locationProvider.html5Mode(true); 
});