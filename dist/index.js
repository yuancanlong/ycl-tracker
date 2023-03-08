(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.tracker = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    //版本
    var TrackerConfig;
    (function (TrackerConfig) {
        TrackerConfig["version"] = "1.0.0";
    })(TrackerConfig || (TrackerConfig = {}));

    function createHistoryEvnent(type) {
        var origin = history[type];
        return function () {
            var res = origin.apply(this, arguments);
            var e = new Event(type); // 创建事件
            window.dispatchEvent(e); // 派发事件
            return res;
        };
    }

    var MouseEventList = [
        'click',
        'dblclick',
        'contextmenu',
        'mousedown',
        'mouseup',
        'mouseenter',
        'mouseout',
        'mouseover',
    ];
    var Tracker = /** @class */ (function () {
        function Tracker(option) {
            this.data = __assign(__assign({}, this.initDef()), option);
            this.installInnerTrack();
            setTimeout(function () {
                throw new Error('3333');
            }, 5000);
        }
        // 初始化默认的option
        Tracker.prototype.initDef = function () {
            window.history['pushState'] = createHistoryEvnent('pushState');
            window.history['replaceState'] = createHistoryEvnent('replaceState');
            return {
                sdkVersion: TrackerConfig.version,
                hashTracker: false,
                historyTracker: false,
                domTracker: false,
                jsError: false
            };
        };
        Tracker.prototype.setUserId = function (uuid) {
            this.data.uuid = uuid;
        };
        Tracker.prototype.serExtra = function (extra) {
            this.data.extra = extra;
        };
        Tracker.prototype.sendTracker = function (data) {
            this.reportTracker(data);
        };
        Tracker.prototype.targetKeyReport = function () {
            var _this = this;
            MouseEventList.map(function (item) {
                window.addEventListener(item, function (e) {
                    var target = e.target;
                    var targetKey = target.getAttribute('target-key');
                    console.log(targetKey);
                    if (targetKey) {
                        _this.reportTracker({
                            event: item,
                            targetKey: targetKey
                        });
                    }
                });
            });
        };
        Tracker.prototype.jsError = function () {
            this.errEvent();
            this.promiseReject();
        };
        Tracker.prototype.errEvent = function () {
            var _this = this;
            window.addEventListener('error', function (event) {
                _this.reportTracker({
                    event: 'error',
                    targetKey: 'message',
                    message: event.message
                });
            }, true);
        };
        Tracker.prototype.promiseReject = function () {
            var _this = this;
            window.addEventListener('unhandledrejection', function (event) {
                event.promise["catch"](function (error) {
                    _this.reportTracker({
                        event: 'promise',
                        targetkey: 'message',
                        message: error
                    });
                });
            });
        };
        // 事件捕获——路由跳转
        Tracker.prototype.captureEvents = function (MouseEventList, targetKey, data) {
            var _this = this;
            MouseEventList.forEach(function (event) {
                window.addEventListener(event, function () {
                    console.log('监听到了');
                    _this.reportTracker({
                        event: event,
                        targetKey: targetKey,
                        data: data
                    });
                });
            });
        };
        // 初始化执行上报的数据类型：路由跳转PV、dom事件、js error
        Tracker.prototype.installInnerTrack = function () {
            if (this.data.historyTracker) {
                this.captureEvents(['pushState'], 'history-pv');
                this.captureEvents(['replaceState'], 'history-pv');
                this.captureEvents(['popstate'], 'history-pv');
            }
            if (this.data.hashTracker) {
                this.captureEvents(['hashchange'], 'hash-pv');
            }
            if (this.data.domTracker) {
                this.targetKeyReport();
            }
            if (this.data.jsError) {
                this.jsError();
            }
        };
        Tracker.prototype.reportTracker = function (data) {
            var params = __assign(__assign(__assign({}, this.data), data), { time: new Date().getTime() });
            var headers = {
                type: 'application/x-www-form-urlencoded'
            };
            var bolb = new Blob([JSON.stringify(params)], headers);
            navigator.sendBeacon(this.data.requestUrl, bolb);
        };
        return Tracker;
    }());

    return Tracker;

}));
