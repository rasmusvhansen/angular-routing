/// <reference path="testcommon.ts" />


describe('$routeProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope: ng.IRootScopeService;

    beforeEach(mock.module('dotjem.routing', function () {
        return function ($rootScope) {
            scope = $rootScope;
        };
    }));

    describe("reloadOnSearch", function () {
        it('raises $routeUpdate when only search params changes', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Search/{param}', { id: "search", reloadOnSearch: false })
                    .when('/Other', { id: "other" });
            });

            mock.inject(function ($route, $location) {
                $location.path('/Search/one?par=there');

                var next, update;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$on('$routeUpdate', (self, n) => { update = n; });

                scope.$digest();
                expect(next).toBeDefined();
                expect(next.id).toBe('search');

                $location.path('/Search/one?here=other');
                scope.$digest();
                expect(update).toBeDefined();
                expect(update.id).toBe('search');
            });
        });

        it('raises $routeChangeSuccess when entire route changes', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Search/{param}', { id: "search", reloadOnSearch: false })
                    .when('/Other', { id: "other" });
            });

            mock.inject(function ($route, $location) {
                $location.path('/Search/one?par=there');

                var next, update;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$on('$routeUpdate', (self, n) => { update = n; });

                scope.$digest();
                expect(next).toBeDefined();
                expect(next.id).toBe('search');

                $location.path('/Other?here=other');
                scope.$digest();
                expect(update).toBeUndefined();
                expect(next.id).toBe('other');
            });
        });
    })

    describe("when", () => {
        describe("match variations", () => {
            var path, route;
            beforeEach(mock.module(function ($routeProvider: dotjem.routing.IRouteProvider, $locationProvider) {
                $routeProvider.when('/route/:param', { id: "route", reloadOnSearch: true });
                return function($location, $route) {
                    path = function path(val){
                        route = undefined;
                        $location.url(val);
                        scope.$digest();
                    }
                    scope.$on('$routeChangeSuccess', (self, n) => { route = n; });
                }
            }));

            it('/route/value1 success', function () {
                mock.inject(function () {
                    path("/route/value1");
                    expect(route.id).toBe('route');
                    expect(route.params.param).toBe('value1');
                });
            });

            it('/route/value2 success', function () {
                mock.inject(function () {
                    path("/route/value2");
                    expect(route.id).toBe('route');
                    expect(route.params.param).toBe('value2');
                });
            });

            it('/route/value1?search=quarck success', function () {
                mock.inject(function () {
                    path("/route/value1?search=quarck");
                    expect(route.id).toBe('route');
                    expect(route.params.param).toBe('value1');
                    expect(route.params.search).toBe('quarck');
                });
            });

            it('/route/value1?search=bark success', function () {
                mock.inject(function () {
                    path("/route/value2?search=bark");
                    expect(route.id).toBe('route');
                    expect(route.params.param).toBe('value2');
                    expect(route.params.search).toBe('bark');
                });
            });

            it('/route/value1?search=quarckx&sort=asc success', function () {
                mock.inject(function () {
                    path("/route/value1?search=moo&sort=asc");
                    expect(route.id).toBe('route');
                    expect(route.params.param).toBe('value1');
                    expect(route.params.search).toBe('moo');
                    expect(route.params.sort).toBe('asc');
                });
            });

            it('/route', function () {
                mock.inject(function () {
                    path("/route");
                    expect(route).toBeUndefined();
                });
            });

            it('/route?search=moo&sort=asc fail', function () {
                mock.inject(function () {
                    path("/route?search=moo&sort=asc");
                    expect(route).toBeUndefined();
                });
            });

        });



        it('matches first defined route', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book', { message: "bookRoute" })
                    .when('/Customer', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });

                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });

        it('matches second defined route', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book', { message: "bookRoute" })
                    .when('/Customer', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Customer');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
            });
        });

        it('matches no route', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book', { message: "bookRoute" })
                    .when('/Customer', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Fubar');

                var next;
                scope.$on('$routeChangeSuccess', (event, n) => { next = n; });
                scope.$digest();

                expect(next).toBeUndefined();
            });
        });

        it('matches no route if different casing', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book', { message: "bookRoute" })
                    .when('/Customer', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/book');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeUndefined();
            });
        });

        it('matches first route with paramter', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{id}', { message: "bookRoute" })
                    .when('/Customer/{id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/number80');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id']).toBe('number80');
            });
        });

        it('matches second route with paramter', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{id}', { message: "bookRoute" })
                    .when('/Customer/{id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Customer/number80');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
                expect(next.params['id']).toBe('number80');
            });
        });

        it('matches first route with number paramter and converts to number', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{num:id}', { message: "bookRoute" })
                    .when('/Customer/{num:id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/80');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id']).toBe(80);
            });
        });

        it('matches second route with number paramter and converts to number', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{num:id}', { message: "bookRoute" })
                    .when('/Customer/{num:id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Customer/80');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
                expect(next.params['id']).toBe(80);
            });
        });

        it('matches no route when number parameter is invalid', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{num:id}', { message: "bookRoute" })
                    .when('/Customer/{num:id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/hello90');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeUndefined();
            });
        });

        it('matches route when using regex parameter', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{regex(^\\w{2,5}$):id}', { message: "bookRoute" })
                    .when('/Customer/{id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/what');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id'].toString()).toBe("what");
            });
        });

        it('matches no route when regex parameter is invalid', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{regex(^\\w{2,5}$):id}', { message: "bookRoute" })
                    .when('/Customer/{id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/whatup');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeUndefined();
            });
        });

        it('matches no route when parameter is invalid created with object', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{regex( { "exp" : "^\\\\w{2,5}$", "flags": "i" } ):id}', { message: "bookRoute" })
                    .when('/Customer/{id}', { message: "customerRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/what');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id'].toString()).toBe("what");
            });
        });

        it('should be possible to overwrite a route', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book', { message: "oldBookRoute" })
                    .when('/Customer', { message: "customerRoute" })
                    .when('/Book', { message: "bookRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });

        it('should be possible to register same route with different parameter types a route', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{num:param}', { message: "numberBookRoute" })
                    .when('/Book/{param}', { message: "bookRoute" });
            });

            mock.inject(function ($route, $location) {
                var next;
                $location.path('/Book/10');
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('numberBookRoute');
                expect(next.params['param']).toBe(10);

                $location.path('/Book/Hello');
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['param']).toBe('Hello');
            });
        });

        it('normalize names', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/:param1/:param2', {})
                    .when('/Home/:param3/:param4', {})
                    .when('/Rear/:param3/:param4', {});
            });

            mock.inject(function ($route, $location) {
                expect($route.routes['/Book/:param1/:param2']).toBeUndefined();
                expect($route.routes['/Book/$0/$1']).toBeDefined();

                expect($route.routes['/Home/:param3/:param4']).toBeUndefined();
                expect($route.routes['/Home/$0/$1']).toBeDefined();

                expect($route.routes['/Rear/:param3/:param4']).toBeUndefined();
                expect($route.routes['/Home/$0/$1']).toBeDefined();

                expect(Object.keys($route.routes).length).toBe(3);
            });
        });

        it('normalized names allow for overwriting routes', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/:param1/:param2', {})
                    .when('/Book/:param3/:param4', {});
            });

            mock.inject(function ($route, $location) {
                expect($route.routes['/Book/:param1/:param2']).toBeUndefined();
                expect($route.routes['/Book/$0/$1']).toBeDefined();
                expect(Object.keys($route.routes).length).toBe(1);
            });
        });

        it('different converters can be used to seperate routes', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{num:param1}/numbers', {})
                    .when('/Book/{param1}/others', {});
            });

            mock.inject(function ($route, $location) {
                expect($route.routes['/Book/$0:num/numbers']).toBeDefined();
                expect($route.routes['/Book/$0/others']).toBeDefined();
                expect(Object.keys($route.routes).length).toBe(2);
            });
        });

        it('catch all parameters', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/{*url}', { message: "catchAll" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/route/with/long/path');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('catchAll');
                expect(next.params.url).toBe('route/with/long/path');
            });
        });

        it('can define more specific routes before catch all', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{*url}', { message: "bookRoute" })
                    .when('/{*url}', { message: "catchAll" });
            });

            mock.inject(function ($route, $location) {
                var next; scope.$on('$routeChangeSuccess', (self, n) => { next = n; });

                $location.url('/Book/with/catch/all');
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params.url).toBe('with/catch/all');

                $location.url('/route/with/long/path');
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('catchAll');
                expect(next.params.url).toBe('route/with/long/path');
            });
        });
    });

    describe("decorate", () => {
        it('converts message paramter into template parameter', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book', { message: "bookRoute" })
                    .when('/Customer', { message: "customerRoute" })
                    .decorate('template', function () {
                        this.decoratedMessage = this.message;
                    });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.decoratedMessage).toBe('bookRoute');
            });
        });
    });

    describe("convert", () => {

        it('matches route when custom parameter starts with a', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{custom:param}', { message: "bookRoute" })
                    .when('/Customer/{custom:param}', { message: "customerRoute" })
                    .convert('custom', () => {
                        return (param: string) => {
                            return param[0] == 'a';
                        };
                });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/aBook');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });

        it('matches no route when custom parameter starts with b', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{custom:param}', { message: "bookRoute" })
                    .when('/Customer/{custom:param}', { message: "customerRoute" })
                    .convert('custom', () => {
                        return (param: string) => {
                            if (param.charAt(0) === 'a')
                                return true;
                            return false;
                        };
                });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/bBook');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeUndefined();
            });
        });

        it('matches route when custom parameter contains pattern sub', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{contains(sub):param}', { message: "bookRoute" })
                    .when('/Customer/{contains(sub):param}', { message: "customerRoute" })
                    .convert('contains', (substring) => {
                        return (param: string) => {
                            if (param.search(substring) != -1)
                                return true;
                            return false;
                        };
                });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/Booksubstore');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });

        it('matches no route when custom parameter contains pattern fubar', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{contains(fubar):param}', { message: "bookRoute" })
                    .when('/Customer/{contains(fubar):param}', { message: "customerRoute" })
                    .convert('contains', (substring) => {
                        return (param: string) => {
                            if (param.search(substring) != -1)
                                return true;
                            return false;
                        };
                });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/Booksubstore');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeUndefined();
            });
        });

        it('matches no route when custom parameter contains pattern fubar', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{custom({"name":"John Doe", "age": 42}):param}', { message: "bookRoute" })
                    .convert('custom', (args) => {
                        converterArgs = args;
                        return (param: string) => {
                            return true;
                        };
                });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/Something');
                scope.$digest();

                expect(converterArgs.name).toBe('John Doe');
                expect(converterArgs.age).toBe(42);
            });
        });

        it('can use catch all with parameters', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/Book/{contains(catch):*param}', { message: "bookRoute" })
                    .when('/Customer/{contains(catch):*param}', { message: "customerRoute" })
                    .convert('contains', function(substring) {
                        return (param: string) => {
                            if (param.search(substring) != -1)
                                return true;
                            return false;
                        };
                });
            });

            mock.inject(function ($route, $location) {
                var next; scope.$on('$routeChangeSuccess', (self, n) => { next = n; });

                $location.url('/Book/with/catch/all');
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params.param).toBe('with/catch/all');

                $location.url('/Customer/with/catch/all');
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
                expect(next.params.param).toBe('with/catch/all');
            });
        });
    });

    describe("otherwise", () => {
        // Tested in legacy specs for now.
    });

    describe("ignoreCase", () => {

        it('matches an uppercase route whit an lowercase location', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .ignoreCase()
                    .when('/BOOK', { message: "bookRoute" });
            });

            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/book');

                var next;
                scope.$on('$routeChangeSuccess', (self, n) => { next = n; });
                scope.$digest();

                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });
    });


    describe("format", () => {

        it('without parameters returns simple route', function () {
            mock.inject(function ($route: dotjem.routing.IRouteService) {
                expect($route.format('/look')).toBe('/look');
            });
        });

        it('with simple parameters returns formated route', function () {
            mock.inject(function ($route: dotjem.routing.IRouteService) {
                expect($route.format('/look/:one', { one: 1 })).toBe('/look/1');
            });
        });

        it('with converter parameters returns formated route', function () {
            mock.inject(function ($route: dotjem.routing.IRouteService) {
                expect($route.format('/look/{regex([0-9]*):one}', { one: 1 })).toBe('/look/1');
            });
        });

        it('with missing parameters throws error', function () {
            mock.inject(function ($route: dotjem.routing.IRouteService) {
                expect(() => { $route.format('/look/:one/:two'); })
                    .toThrow("Could not find parameter 'one' when building url for route '/look/:one/:two', ensure that all required parameters are provided.");
            });
        });

        it('regex converter throws error when values does not match', function () {
            //TODO: Built in regex should check for valid parameters.
            mock.inject(function ($route: dotjem.routing.IRouteService) {
                expect(() => { $route.format('/look/{regex([0-9]+):one}', { one: 'invalid' }); })
                    .toThrow();
            });
        });

        it('custom converter can define formatting', function () {
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider.convert('custom', function() {
                    return {
                        parse: function (param) { return true; },
                        format: function (value) {
                            switch (value) {
                                case 1: return "One";
                                case 2: return "Two";
                                case 3: return "Three";
                            }
                            throw Error("Invalid parameter value");
                        }
                    };
                } );
            });
            //TODO: Built in regex should check for valid parameters.
            mock.inject(function ($route: dotjem.routing.IRouteService) {
                expect($route.format('/look/{custom:one}', { one: 1 })).toBe('/look/One');
                expect($route.format('/look/{custom:one}', { one: 2 })).toBe('/look/Two');
                expect($route.format('/look/{custom:one}', { one: 3 })).toBe('/look/Three');
                expect(() => { $route.format('/look/{custom:one}', { one: 4 }); }).toThrow("Invalid parameter value");
            });
        });
    });


    describe("change", () => {
        var location: ng.ILocationService;
        beforeEach(mock.module('dotjem.routing', function ($routeProvider: dotjem.routing.IRouteProvider) {
            return function ($rootScope, $location) {
                scope = $rootScope;
                location = $location;
            };
        }));

        function goto(target: string) {
            location.path(target);
            scope.$digest();
        }

        it('without params changes location', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/book', { message: "bookRoute" })
                    .when('/look', { message: "lookRoute" });
            });

            mock.inject(function ($route: dotjem.routing.IRouteService, $location) {
                goto('/book');
                expect($route.current.message).toBe('bookRoute');

                $route.change({ route: '/look' });
                scope.$digest();

                expect($route.current.message).toBe('lookRoute');
                expect(location.path()).toBe('/look');
            });
        });

        it('with params changes location', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/book', { message: "bookRoute" })
                    .when('/book/:id', { message: "bookRouteWithId" })
                    .when('/look', { message: "lookRoute" })
                    .when('/look/:id', { message: "lookRouteWithId" });
            });

            mock.inject(function ($route: dotjem.routing.IRouteService, $location) {
                goto('/book');
                expect($route.current.message).toBe('bookRoute');

                $route.change({ route: '/look/:id', params: { id: 42 } });
                scope.$digest();

                expect($route.current.message).toBe('lookRouteWithId');
                expect(location.path()).toBe('/look/42');
            });
        });

        it('with params with {x} notation', function () {
            var converterArgs;
            mock.module(function ($routeProvider: dotjem.routing.IRouteProvider) {
                $routeProvider
                    .when('/book', { message: "bookRoute" })
                    .when('/book/{id}', { message: "bookRouteWithId" })
                    .when('/look', { message: "lookRoute" })
                    .when('/look/{id}', { message: "lookRouteWithId" });
            });

            mock.inject(function ($route: dotjem.routing.IRouteService, $location) {
                goto('/book');
                expect($route.current.message).toBe('bookRoute');

                $route.change({ route: '/look/{id}', params: { id: 42 } });
                scope.$digest();

                expect($route.current.message).toBe('lookRouteWithId');
                expect(location.path()).toBe('/look/42');
            });
        });
    });
});