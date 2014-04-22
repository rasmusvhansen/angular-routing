/// <reference path="../refs.d.ts" />
/// <reference path="state.d.ts" />
declare class StateComparer {
    public buildStateArray(state: any, params: any): any[];
    public compare(from: any, to: any, fromParams: any, toParams: any, forceReload: any): {
        array: any[];
        stateChanges: boolean;
        paramChanges: boolean;
    };
    public isSameState(from: any, to: any): boolean;
    public isEquals(from: any, to: any): boolean;
    public path(from: any, to: any, fromParams: any, toParams: any): any;
    public toArray(state: any, params: any, activate: any): any[];
    public extractParams(params: any, current: any): {};
}
