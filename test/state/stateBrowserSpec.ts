/// <reference path="../testcommon.ts" />

/// <reference path="../../src/state/state.ts" />
/// <reference path="../../src/state/stateBrowser.ts" />

describe('state.stateBrowser', function () {
    'use strict';
    var nui = typeof dotjem !== 'undefined' ? dotjem.ui : ui;
    var mod = angular.mock['module'];
    var inject = angular.mock.inject;
    beforeEach(mod('ui.routing', function () { return function () { }; }));

    describe('lookup', () => {
        it('"first" succeeds.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        children: {
                            'first': { msg: "find me" },
                            'second': {}
                        }
                    });
                var result = <any>browser.lookup('first');
                expect(result.msg).toBe("find me");
            });
        });

        it('"first.second" succeeds.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        children: {
                            'first': {
                                children: {
                                    'second': {
                                        msg: 'find me'
                                    }
                                }
                            }
                        }
                    });
                var result = <any>browser.lookup('first.second');
                expect(result.msg).toBe("find me");
            });
        });

        it('"first.second.third" succeeds.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        children: {
                            'first': {
                                children: {
                                    'second': {
                                        children: {
                                            'third': {
                                                msg: 'find me'
                                            }
                                        }
                                    }
                                }
                            },
                            second: {}
                        }
                    });
                var result = <any>browser.lookup('first.second.third');
                expect(result.msg).toBe("find me");
            });
        });

        it('"second.second" succeeds.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        children: {
                            'first': { children: { 'second': {} } },
                            second: {
                                children: {
                                    'second': {
                                        msg: 'find me'
                                    }
                                }
                            }
                        }
                    });
                var result = <any>browser.lookup('second.second');
                expect(result.msg).toBe("find me");
            });
        });

        it('"nan" fails.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        fullname: 'root',
                        children: {
                        }
                    });
                expect(function () { browser.lookup('nan'); }).toThrow("Could not locate 'nan' under 'root'.");
            });
        });

        it('"first.nan" fails.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        fullname: 'root',
                        children: {
                            'first': { fullname: 'root.first', children: {} }
                        }
                    });
                expect(function () { browser.lookup('first.nan'); }).toThrow("Could not locate 'nan' under 'root.first'.");
            });
        });

        it('"first.nan" fails.', function () {
            inject(function () {
                var browser = new nui.routing.StateBrowser(<ui.routing.State>
                    {
                        fullname: 'root',
                        children: {
                            'first': { fullname: 'root.first', children: {} }
                        }
                    });
                expect(function () { browser.lookup('first.nan.other'); }).toThrow("Could not locate 'nan' under 'root.first'.");
            });
        });
    });
});