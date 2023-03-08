import {
	DefaultOptons,
	Options,
	TrackerConfig,
	reportTrackerData,
} from '../types/core';
import { createHistoryEvnent } from '../utils/pv';

const MouseEventList: string[] = [
	'click',
	'dblclick',
	'contextmenu',
	'mousedown',
	'mouseup',
	'mouseenter',
	'mouseout',
	'mouseover',
];

export default class Tracker {
	public data: Options;
	constructor(option: Options) {
		this.data = { ...this.initDef(), ...option };
		this.installInnerTrack();
		setTimeout(function () {
			throw new Error('3333');
		}, 5000);
	}
	// 初始化默认的option
	private initDef(): DefaultOptons {
		window.history['pushState'] = createHistoryEvnent('pushState');
		window.history['replaceState'] = createHistoryEvnent('replaceState');
		return <DefaultOptons>{
			sdkVersion: TrackerConfig.version,
			hashTracker: false,
			historyTracker: false,
			domTracker: false,
			jsError: false,
		};
	}

	public setUserId<T extends DefaultOptons['uuid']>(uuid: T) {
		this.data.uuid = uuid;
	}
	public serExtra<T extends DefaultOptons['extra']>(extra: T) {
		this.data.extra = extra;
	}
	public sendTracker<T>(data: T) {
		this.reportTracker(data);
	}

	private targetKeyReport() {
		MouseEventList.map((item) => {
			window.addEventListener(item, (e) => {
				const target = e.target as HTMLElement;
				const targetKey = target.getAttribute('target-key');
				console.log(targetKey);
				if (targetKey) {
					this.reportTracker({
						event: item,
						targetKey,
					});
				}
			});
		});
	}
	private jsError() {
		this.errEvent();
		this.promiseReject();
	}
	private errEvent() {
		window.addEventListener(
			'error',
			(event) => {
				this.reportTracker({
					event: 'error',
					targetKey: 'message',
					message: event.message,
				});
			},
			true
		);
	}

	private promiseReject() {
		window.addEventListener('unhandledrejection', (event) => {
			event.promise.catch((error) => {
				this.reportTracker({
					event: 'promise',
					targetkey: 'message',
					message: error,
				});
			});
		});
	}

	// 事件捕获——路由跳转
	private captureEvents<T>(
		MouseEventList: string[],
		targetKey: string,
		data?: T
	) {
		MouseEventList.forEach((event) => {
			window.addEventListener(event, () => {
				console.log('监听到了');
				this.reportTracker({
					event,
					targetKey,
					data,
				});
			});
		});
	}

	// 初始化执行上报的数据类型：路由跳转PV、dom事件、js error
	private installInnerTrack() {
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
	}

	private reportTracker<T>(data: T) {
		const params = { ...this.data, ...data, time: new Date().getTime() };
		let headers = {
			type: 'application/x-www-form-urlencoded',
		};
		let bolb = new Blob([JSON.stringify(params)], headers);
		navigator.sendBeacon(this.data.requestUrl, bolb);
	}
}
