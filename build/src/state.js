/// <reference path="refs.d.ts" />
/**
* @ngdoc object
* @name dotjem.routing.$stateProvider
*
* @description
* Used for configuring states.
* <br/>
* Here is a very basic example of configuring states.
*
* <pre dx-syntax class="brush: js">
* angular.module('demo', ['dotjem.routing']).
*   config(['$stateProvider', function($stateProvider) {
*   $stateProvider
*       .state('phones', { ...Parameters for the state... })
*       .state('tablets', { ...Parameters for the state... });
* }]);
* </pre>
*
* In it self that is not really useful, but the state it self can have views added as well as onEnter / onExit handlers.
* <br/>
* # Views
* <hr/>
* At this basic level you can also configure multiple views, just add a number of `ui - view` directives with unique names, and simply target those from the configuration.
* <br/>
* e.g.if we had a `main` view and a `hint` view we could do.
*
* <pre dx-syntax class="brush: js">
*  angular.module('demo', ['dotjem.routing']).
*    config(['$stateProvider', function ($stateProvider) {
*      $stateProvider
*        .state('phones', {
*          views: {
*           'main': { template: 'phones.html' },
*           'hint': { template: { html: '@phones' } }
*         }
*      })
*      .state('tablets', {
*          views: {
*           'main': { template: 'tablets.html' },
*           'hint': { template: { html: '@tablets' } }
*         }
*       })
*  }]);
* </pre>
* <br/>
* **Note:** The template is suddenly an object with an `html` property, there is a number of ways to configure templates, see {@link dotjem.routing.$template $template} for more details on that.
* <br/>
* # Controllers
* <hr/>
* Standing alone like this, views are very static , but just like the original angular routing, we can add controllers to a view.
*
* <pre dx-syntax class="brush: js">
*  angular.module('demo', ['dotjem.routing']).
*    config(['$stateProvider', function ($stateProvider) {
*      $stateProvider
*        .state('phones', {
*          views: {
*            'main': { template: 'phones.html', controller: 'PhonesCtrl' },
*            'hint': { template: { html: '@phones' } }
*          }
*        })
*        .state('tablets', {
*          views: {
*            'main': { template: 'tablets.html', controller: 'TabletsCtrl' },
*            'hint': { template: { html: '@tablets' } }
*          }
*        })
*    }])
*    .controller('PhonesCtrl', ['$scope', function ($scope) { ... }])
*    .controller('TabletsCtrl', ['$scope', function ($scope) { ... }]);
* </pre>
* <br/>
* # Nested States
* <hr/>
* Until now we have had a flat list of states, but this doesn't really provide many enhancements over the existing routing concept, even with multiple views, all views are always reloaded. Also it could get quite complex if views dependent on each other couldn't be arranged in a hierarchy.
* <br/>
* The `$stateProvider` provides configuring states in a hierarchy in two ways.
* <br/>
* One way is using a name convention for states where `.` is used to separate state levels. So that the state `phones.list` becomes a child of `phones`, it is important however that `phones` is defined before it's children.
*
* <pre dx-syntax class="brush: js">
*  angular.module('demo', ['dotjem.routing']).
*    config(['$stateProvider', function($stateProvider) {
*      $stateProvider
*          .state('phones', {
*            views: {
*              'main': { template: 'phones.html', controller: 'PhonesCtrl' },
*             'hint': { template: { html: '@phones' } }
*         }
*     })
*     .state('phones.list', {
*         views: {
*             'main.content': {
*                 template: 'phones.list.html',
*                 controller: 'PhonesListCtrl'
*             },
*             'hint': { template: { html: '@phones.list' } }
*         }
*     })
*     .state('phones.detail', {
*         views: {
*             'main.content': {
*                 template: 'phones.detail.html',
*                 controller: 'PhonesDetailsCtrl'
*             },
*             'hint': { template: { html: '@phones.list' } }
*         }
*     })
* }])
*  .controller('PhonesCtrl', ['$scope', function ($scope) { ... }])
*  .controller('PhonesListCtrl', ['$scope', function ($scope) { ... }])
*  .controller('PhonesDetailsCtrl', ['$scope', function ($scope) { ... }]);
* </pre>
*
* The above may indicate that views also has a child to parent relation in the naming, but this is merely a good naming convention, there is no constraint on how views are named.
* <br/>
* It is recommended that they are unique however, unless you diliberately wish to load the same content into multiple areas of a page, if multiple views use the same name within a page, they will load the same content, but they will render independendly.
*/
var $StateProvider = [
    '$routeProvider', '$stateTransitionProvider', '$pipelineProvider', function ($routeProvider, $transitionProvider, $pipelineProvider) {
        'use strict';

        this.routes = $routeProvider;
        this.transitions = $transitionProvider;
        this.pipeline = $pipelineProvider;

        //TODO: maybe create a stateUtilityProvider that can serve as a factory for all these helpers.
        //      it would make testing of them individually easier, although it would make them more public than
        //      they are right now.
        var factory = new StateFactory($routeProvider, $transitionProvider), root = factory.createState(rootName, {}), browser = new StateBrowser(root);

        /**
        * @ngdoc method
        * @name dotjem.routing.$stateProvider#state
        * @methodOf dotjem.routing.$stateProvider
        *
        * @param {string} fullname Full name of the state, use '.' to seperate parent and child states.
        *
        * E.g. if the full name "home" is given, the state is directly located under the root.
        * It then becomes possible to register "home.recents" as a child named "recents" under the state "home".
        *
        * The following registrations would result in the ilustated hierachy.
        *
        * <pre dx-syntax class="brush: js">
        *  .state('home', {})
        *  .state('home.recents', {})
        *  .state('home.all', {})
        *  .state('staff', {})
        *  .state('staff.all', {})
        *  .state('staff.single', {})
        * </pre>
        *
        * <img type="image/svg+xml" src="docs/assets/$state/state.provider.structure.svg"/>
        *
        * @param {Object} state All information about the state.
        *
        *    Object properties:
        *
        * - `views`: `{Object=}` A list og views to be updated when the state is activated.
        * - `route`: `{string=}` A route to associate the state with,
        *    this will be registered with the {@link dotjem.routing.$routeProvider $routeProvider}
        * - `resolve`: `{Object=}` A list of values to resolve before the state transition completes.
        * - `onEnter`: `{string|function|Object=}` value
        * - `onExit`: `{string|function|Object=}` value
        * - `reloadOnSearch`: `{boolean=}` If associated with a route, should that route reload on search.
        * - `scrollTo`: {string=} An element defined by it's id to scroll to when the state has been loaded.
        *
        * @returns {Object} self
        *
        * @description
        * Adds a new state definition to the `$state` service.
        */
        /**
        * @ngdoc method
        * @name dotjem.routing.$stateProvider#state
        * @methodOf dotjem.routing.$stateProvider
        *
        * @param {function} Registration function, this is an injectable function and can be used to load state configurations
        *        from the backend, e.g. using the `$http` service.
        *
        *        The function should at least depend on `$register` which is used in place of the {@link dotjem.routing.$stateProvider#state state} function.
        *
        * <pre dx-syntax class="brush: js">
        *  .state(['$register', '$http', function($register, $http) {
        *      return $http.get('/stateConfig').then(function (result) {
        *          // result is delivered as:
        *          // {
        *          //   'state1name': { ...params },
        *          //   'state2name': { ...params }
        *          // }
        *          // in this example.
        *          angular.forEach(result.data, function (state, name) {
        *              $register(name, state);
        *          });
        *      });
        *  }])
        * </pre>
        *
        * Note: The function should return a promise that is resolved when registration is done, so that the state service knows when it can resume normal operation.
        *
        * @returns {Object} self
        */
        this.state = function (nameOrFunc, state) {
            if (!isInjectable(nameOrFunc)) {
                StateRules.validateName(nameOrFunc);

                initializers.push(function () {
                    internalRegisterState(nameOrFunc, state);
                    return null;
                });
            } else {
                initializers.push(function () {
                    return nameOrFunc;
                });
            }
            return this;
        };

        function registerState(fullname, state) {
            StateRules.validateName(fullname);

            internalRegisterState(fullname, state);
        }

        function internalRegisterState(fullname, state) {
            var parent = browser.lookup(fullname, 1);
            parent.add(factory.createState(fullname, state, parent));
        }

        var initializers = [];

        this.$get = [
            '$rootScope', '$q', '$inject', '$route', '$view', '$stateTransition', '$location', '$scroll', '$resolve', '$exceptionHandler', '$pipeline',
            function ($rootScope, $q, $inject, $route, $view, $transition, $location, $scroll, $resolve, $exceptionHandler, $pipeline) {
                function init(promise) {
                    var defer = $q.defer();
                    $route.$waitFor(defer.promise);

                    root.clear($routeProvider);

                    forEach(initializers, function (init) {
                        try  {
                            var injectable = init();
                            if (injectable !== null) {
                                promise = promise.then(function () {
                                    return $inject.invoke(injectable, injectable, { $register: registerState });
                                });
                            }
                        } catch (error) {
                            $exceptionHandler(error);
                        }
                    });
                    return promise.finally(defer.resolve);
                }
                var initPromise = init($q.when(0));

                /**
                * @ngdoc object
                * @name dotjem.routing.$state
                *
                * @requires $rootScope
                * @requires $q
                * @requires $injector
                * @requires $route
                * @requires $view
                * @requires $stateTransition
                * @requires $location
                * @requires $scroll
                *
                * @property {Object} current Reference to the current state loaded.
                *
                * @description
                *
                * You can define states through {@link dotjem.routing.$stateProvider $stateProvider}'s API.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateChangeStart
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                * Broadcasted before a route change. At this  point the route services starts
                * resolving all of the dependencies needed for the route change to occurs.
                *
                * @param {Object} angularEvent Synthetic event object.
                * @param {State} next Future state.
                * @param {State} current Current state.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateChangeSuccess
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                * Broadcasted after a route dependencies are resolved.
                *
                * @param {Object} angularEvent Synthetic event object.
                * @param {State} next Future state.
                * @param {State} current Current state.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateChangeError
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                * Broadcasted if any of the resolve promises are rejected.
                *
                * @param {Object} angularEvent Synthetic event object.
                * @param {State} next Future state.
                * @param {State} current Current state.
                * @param {Object} rejection Rejection of the promise. Usually the error of the failed promise.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateUpdate
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#goto
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string} state Current state.
                * @param {Object} params Current state.
                *
                * @description
                * To transition to another state, use `goto`...
                *
                * - state: either the full name of a state or a state object (e.g. use `lookup` to get that object).
                * - params: (optional) a set of parameters to use for the state.
                *
                * If the state has an associated route, that route will be activated and the location with change it the address bar of the browser. It is also important that all parameters are defined for such route, however if the previous state defines any of those, they won't need to be redefined.
                *
                * e.g. say the following states are defined:
                *
                * <pre>
                * $stateProvider
                *   .state('home', { route: '/home/:homeParam' })
                *   .state('home.child', { route: '/child/:childParam' })
                * </pre>
                *
                * To activate the `home` state, a call to goto must include the `:homeParam` e.g:
                *
                * <pre>
                * $state.goto('home', { homeParam: 'goHome' } );
                * </pre>
                *
                * To activate the `home.child` state, a call to goto must include the `:homeParam` and the `:childParam` e.g:
                *
                * <pre>
                * $state.goto('home.child', { homeParam: 'goHome', childParam: 'goChild' } );
                * </pre>
                *
                * To activate the `home.child` state when currently in the `home` state, a call to goto must include the the `:childParam` and can optionally include the `:homeParam` e.g:
                *
                * </pre>
                * $state.goto('home.child', { childParam: 'goChild' } );
                * $state.goto('home.child', { homeParam: 'goHome', childParam: 'goChild' } );
                * </pre>
                *
                * We can leave out the home param as that is already defined in the current set of params, that also means we can goto home from child without specifying any params, but if we wish to change it we must specify it, the following example will demonstrate a full flow:
                *
                * <pre>
                * $state.goto('home', { homeParam: 1 } );
                * // - location set to: '/home/1'
                *
                * $state.goto('home.child', { childParam: 1 } );
                * // - location set to: '/home/1/child/1'
                *
                * $state.goto('home');
                * // - location set to: '/home/1'
                *
                * $state.goto('home.child', { homeParam: 2, childParam: 2 } );
                * // - location set to: '/home/2/child/2'
                *
                * $state.goto('home.child', { childParam: 4 } );
                * // - location set to: '/home/2/child/4'
                *
                * $state.goto('home.child', { homeParam: 4 } );
                * // - location set to: '/home/4/child/4'
                * </pre>
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#lookup
                * @methodOf dotjem.routing.$state
                *
                * @param {string} path Path expression to the state that can either be relative to the current state or from the root (/).
                *
                * @description
                * To lookup a state, use `lookup`...
                * <br/>
                * <br/>
                * Path is inspired by XPath and supports a subset of that syntax.
                *
                * - `.` : current state
                * - `..` : parent state
                * - `/` : path separator
                * - `[]` : index selector, errors on overflow
                * - `$node()` : sibling selector, can overflow
                *
                * <br/><br/>
                * Using these selectors, the following are examples of paths:
                *
                * - `state` : Selects `state` from the current node.
                * - `/state` : Selects `state` from the root.
                * - `./state` : Selects `state` from the current node.
                * - `./state/child` : Selects `child` under `state` from the current node.
                * - `../state` : Selects `state` under the parent of the current state.
                * - `[0]` : Selects the first child of the current state.
                * - `[-1]` : Selects the last child of the current state.
                * - `./state/[-1]` : Selects the last child under `state` under current state.
                * - `$node(1)` : Selects the next sibling of the current state.
                * - `$node(-1)` : Selects the previous sibling of the current state.
                *
                * <br/><br/>
                * **Note:** When using `$node()`, it allows for overflow. this means if you are at the last child of a state and selects `$node(1)`, it will select the first child instead.
                * <br/><br/>
                * Finally it is also possible to select states by their full name, however as `state` would also be a valid relative selector, full name selection is only used when the name contains a `.`, this means that if you wish to select the states directly under root by name you will have to use either the syntax above or it's full name with root included:
                *
                * - `root.state`: Selects `state` under root.
                * - `/state` : Selects `state` under root.
                *
                * <br/><br/>
                * Errors will be thrown in cases where the path isn't valid.
                * The root state it self can't be selected. (The root state is implicitly defined by the system, when defining `.state('home', {...});`, the state `home` isn't a root state, it is instead a child of root.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#reload
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string|boolean=} state Name or State in the current hierachy or true/false
                *
                * @description
                * To force reload a state, use `reload`...
                *
                * - call `.reload()` to reload only the current leaf state.
                * - call `.reload(true)` to reload all active states from the root state to the current leaf.
                * - call `.reload('state.full.name')` to reload all states from `state.full.name` and down to the current leaf.
                * <br/><br/>
                * E.g. if the current state is `state.full.name.to.here` and `.reload()` is called then all views etc. will be reloaded for the leaf state `here`.
                * <br/><br/>
                * If `.reload(true)` called, views etc. will be reloaded for all the states `state`, `full`, `name`, `to`, `here`.
                * <br/><br/>
                * Finally if  `.reload('state.full.name')` is called, views etc. will be reloaded for the states `name`, `to`, `here`.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#url
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string=} state A state to generate an URL for
                * @param {Object=} params A set of parameters to use when generating the url
                * @param {Boolean=} basePath If true (default) the basePath is used when generating the url, otherwas not.
                *
                * @description
                * To build a url for a particular state, use `url`...
                * <br/><br/>
                * If the state defined either by state, or current state does not have an route associated with it, it will throw an error.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#is
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string=} state A State or name to check against the current state.
                * @param {Boolean=} basePath If true (default) the basePath is used when generating the url, otherwas not.
                *
                * @description
                * Checks if the current state matches the provided state.
                *
                * @returns {boolean} true if the stats mathces, otherwise false.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#is
                * @methodOf dotjem.routing.$state
                *
                * @param {Boolean=} basePath If true (default) the basePath is used when generating the url, otherwas not.
                *
                * @description
                * Checks if the current state matches the provided state.
                *
                * @returns {boolean} true if the stats mathces, otherwise false.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#reinitialize
                * @methodOf dotjem.routing.$state
                *
                * @description
                * Clears all states and associated routes and reinitializes the state service.
                */
                var urlbuilder = new StateUrlBuilder($route);

                var current = root, $state = {
                    // NOTE: root should not be used in general, it is exposed for testing purposes.
                    root: root,
                    current: extend(root.self, { $params: buildParams() }),
                    params: buildParams(),
                    reinitialize: function () {
                        return initPromise = init(initPromise);
                    },
                    goto: function (state, params) {
                        return initPromise.then(function () {
                            return goto({
                                state: state,
                                params: buildParams(params),
                                updateroute: true
                            });
                        });
                    },
                    lookup: function (path) {
                        return browser.resolve(current, path, true);
                    },
                    reload: function (state) {
                        return initPromise.then(function () {
                            return reload(state);
                        });
                    },
                    //             State  Params Base
                    url: function (arg1, arg2, arg3) {
                        var target = current;

                        //Note: No params means we will use current state as both target and source.
                        if (arguments.length === 0) {
                            //                         current,        target, params?,   base?
                            return urlbuilder.buildUrl($state.current, target, undefined, undefined);
                        }

                        //Note: One param means we either got a target state or was asked to use base.
                        if (arguments.length === 1) {
                            if (isBool(arg1)) {
                                //                         current,        target, params?,   base?
                                return urlbuilder.buildUrl($state.current, target, undefined, arg1);
                            } else {
                                target = browser.resolve(current, toName(arg1), false);

                                //                         current,        target, params?,   base?
                                return urlbuilder.buildUrl($state.current, target, undefined, undefined);
                            }
                        }

                        if (isDefined(arg1)) {
                            target = browser.resolve(current, toName(arg1), false);
                        }

                        if (isBool(arg2)) {
                            //                         current,        target, params?,   base?
                            return urlbuilder.buildUrl($state.current, target, undefined, arg2);
                        } else {
                            //                         current,        target, params?, base?
                            return urlbuilder.buildUrl($state.current, target, arg2, arg3);
                        }
                    },
                    is: function (state, params) {
                        return current && current.is(toName(state)) && checkParams(params);
                    },
                    isActive: function (state, params) {
                        return current && current.isActive(toName(state)) && checkParams(params);
                    }
                };

                function checkParams(params) {
                    var result = true;
                    forEach(params, function (value, key) {
                        if (!equals($state.params[key], value)) {
                            result = false;
                        }
                    });
                    return result;
                }

                $transition.browser(browser);
                $transition.state($state);

                $rootScope.$on(EVENTS.ROUTE_CHANGE_SUCCESS, function () {
                    var route = $route.current;

                    if (route) {
                        if (route.state) {
                            initPromise.then(function () {
                                return goto({
                                    state: route.state,
                                    params: buildParams(route.params, route.pathParams, route.searchParams)
                                });
                            });
                        }
                    } else {
                        initPromise.then(function () {
                            return goto({ state: root, params: buildParams() });
                        });
                    }
                });

                $rootScope.$on(EVENTS.ROUTE_UPDATE, function () {
                    var route = $route.current, params = buildParams(route.params, route.pathParams, route.searchParams);

                    $state.params = params;
                    $state.current.$params = params;
                    $rootScope.$broadcast(EVENTS.STATE_UPDATE, $state.current);
                });

                function reload(state) {
                    var forceReload;
                    if (isDefined(state)) {
                        if (isString(state) || isObject(state)) {
                            forceReload = toName(state);

                            //TODO: We need some name normalization OR a set of "compare" etc methods that can ignore root.
                            if (forceReload.indexOf(rootName) !== 0) {
                                forceReload = rootName + '.' + forceReload;
                            }
                        } else if (state) {
                            forceReload = root.fullname;
                        }
                    } else {
                        forceReload = current.fullname;
                    }

                    var defered = $q.defer();
                    $rootScope.$evalAsync(function () {
                        goto({ state: current, params: $state.params, force: forceReload }).then(defered.resolve, defered.reject);
                    });
                    return defered.promise;
                }

                var comparer = new StateComparer();
                var running, gotoPromise = $q.when(initPromise), inProgress = false;
                function goto(args) {
                    if (inProgress) {
                        running.reject("Transition defered by another call to goto");
                    }
                    var next = browser.resolve(current, toName(args.state), false);
                    var changes = comparer.path(current, next, $state.params, args.params, { force: args.force });
                    var context = { gotofn: goto };

                    return gotoPromise = gotoPromise.finally(function () {
                        var defered = $q.defer();
                        inProgress = true;

                        running = $pipeline.run({ $changes: changes, $context: context, $args: args });
                        running.promise.then(function () {
                            current = changes.to;
                            defered.resolve(current);
                        }).catch(defered.reject);
                        return defered.promise.finally(function () {
                            inProgress = false;
                        });
                    });
                }
                return $state;
            }];
    }];
angular.module('dotjem.routing').provider('$state', $StateProvider);
