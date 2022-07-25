"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
/**
 * contains functions that do all the standard set operations
 */
var SetOps = /** @class */ (function () {
    function SetOps() {
    }
    SetOps.isEmpty = function (a) {
        if (a.size === 0)
            return true;
        return false;
    };
    /**
     * returns true if a is a subset of b
     * @param a
     * @param b
     * @returns
     */
    SetOps.isSubset = function (a, b) {
        var c = this.toArray(a);
        if (a.size !== b.size) {
            for (var _i = 0, c_1 = c; _i < c_1.length; _i++) {
                var item = c_1[_i];
                if (!b.has(item)) {
                    return false;
                }
            }
        }
        return true;
    };
    SetOps.isSubsetEq = function (a, b) {
        if (this.isSubset(a, b) || this.areEqual(a, b)) {
            return true;
        }
        return false;
    };
    /**
     * returns true if a contains the same elements as b
     * @param a
     * @param b
     * @returns
     */
    SetOps.areEqual = function (a, b) {
        var c = this.toArray(a);
        var d = this.toArray(b);
        for (var _i = 0, c_2 = c; _i < c_2.length; _i++) {
            var value = c_2[_i];
            if (!b.has(value)) {
                return false;
            }
        }
        for (var _a = 0, d_1 = d; _a < d_1.length; _a++) {
            var value = d_1[_a];
            if (!b.has(value)) {
                return false;
            }
        }
        return true;
    };
    /**
     * returns intersect of sets a and b
     * @param a
     * @param b
     * @returns
     */
    SetOps.intersect = function (a, b) {
        return new Set(this.toArray(a).filter(function (value) { return b.has(value); }));
    };
    /**
     * returns union of sets a and b
     * @param a
     * @param b
     * @returns
     */
    SetOps.union = function (a, b) {
        return new Set(__spreadArrays(this.toArray(a), this.toArray(b)));
    };
    /**
     * returns a \ b
     * @param a
     * @param b
     * @returns
     */
    SetOps.difference = function (a, b) {
        return new Set(this.toArray(a).filter(function (value) { return !b.has(value); }));
    };
    SetOps.toArray = function (a) {
        var b = [];
        a.forEach(function (value) {
            b.push(value);
        });
        return b;
    };
    return SetOps;
}());
exports.SetOps = SetOps;
