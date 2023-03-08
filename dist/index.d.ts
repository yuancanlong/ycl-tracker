/**
 * @requestUrl 接口地址
 * @historyTracker history上报
 * @hashTracker hash上报
 * @domTracker 携带Tracker-key 点击事件上报
 * @sdkVersionsdk版本
 * @extra透传字段
 * @jsError js 和 promise 报错异常上报
 */
interface DefaultOptons {
    uuid: string | undefined;
    requestUrl: string | undefined;
    historyTracker: boolean;
    hashTracker: boolean;
    domTracker: boolean;
    sdkVersion: string | number;
    extra: Record<string, any> | undefined;
    jsError: boolean;
}
interface Options extends Partial<DefaultOptons> {
    requestUrl: string;
}

declare class Tracker {
    data: Options;
    constructor(option: Options);
    private initDef;
    setUserId<T extends DefaultOptons['uuid']>(uuid: T): void;
    serExtra<T extends DefaultOptons['extra']>(extra: T): void;
    sendTracker<T>(data: T): void;
    private targetKeyReport;
    private jsError;
    private errEvent;
    private promiseReject;
    private captureEvents;
    private installInnerTrack;
    private reportTracker;
}

export { Tracker as default };
