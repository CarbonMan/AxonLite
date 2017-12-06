/**
 *  @file eventTarget.js
 *  @brief Event handling
 *  If used as a prototype;
 * DataSession.prototype = new EventTarget();
 * DataSession.prototype.constructor = DataSession;
 * and call;
 * EventTarget.call(this);
 * in the constructor
 * the event handling will be shared across all objects of the same type
 *
 * That is not always desirable. Sometimes objects exist in different hierachies
 * in that case it is necessary to have handling on the individual objects. In that case use;
 * DataSession.prototype.eventHandler = eventHandler;
 * and call;
 * this.eventHandler();
 * in the constructor
 */
//Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
//MIT License

/**
 *  eventHandler is meant to be used as a prototype method so that objects maintain separate subscriptions
 */
function eventHandler(src) {
	src._listeners = {};
	src.on = function (type, listener) {
		if (typeof src._listeners[type] == "undefined") {
			src._listeners[type] = [];
		}

		src._listeners[type].push(listener);
		return src;
	};
	src.fire = function (event, eParam) {
		if (typeof event == "string") {
			event = {
				type : event
			};
		}
		if (!event.target) {
			event.target = src;
		}

		if (!event.type) { //falsy
			throw new Error("Event object missing 'type' property.");
		}

		if (src._listeners[event.type]instanceof Array) {
			var listeners = src._listeners[event.type];
			for (var i = 0, len = listeners.length; i < len; i++) {
				listeners[i].call(src, eParam);
			}
		}
		if (!eParam || eParam.bubble !== false) {
		    if (src._listeners.ALL_EVENTS) {
		        var listeners = src._listeners.ALL_EVENTS;
		        for (var i = 0, len = listeners.length; i < len; i++) {
		            listeners[i].call(src, event.type, eParam);
		        }
		    }
		}
		return src;
	};
	src.removeListener = function (type, listener) {
		if (src._listeners[type]instanceof Array) {
			var listeners = src._listeners[type];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i] === listener) {
					listeners.splice(i, 1);
					break;
				}
			}
		}
		return src;
	};
}

/**
 *  Type based events.
 */
function EventTarget() {
	this._listeners = {};
}

EventTarget.prototype = {

	constructor : EventTarget,

	/**
	 *  Allows "ALL_EVENTS" to listen to all events, in which case 2 parameters are passed the event, and its parameters
	 *  "ALL_EVENTS" string should not be changed without consulting db.js
	 */
	on : function (type, listener) {
		this.addListener(type, listener);
	},

	addListener : function (type, listener) {
		if (typeof this._listeners[type] == "undefined") {
			this._listeners[type] = [];
		}

		this._listeners[type].push(listener);
	},

	fire : function (event, eParam) {
		if (typeof event == "string") {
			event = {
				type : event
			};
		}
		if (!event.target) {
			event.target = this;
		}

		if (!event.type) { //falsy
			throw new Error("Event object missing 'type' property.");
		}

		if (this._listeners[event.type]instanceof Array) {
			var listeners = this._listeners[event.type];
			for (var i = 0, len = listeners.length; i < len; i++) {
				listeners[i].call(this, eParam);
			}
		}
		if (this._listeners.ALL_EVENTS) {
			var listeners = this._listeners.ALL_EVENTS;
			for (var i = 0, len = listeners.length; i < len; i++) {
				listeners[i].call(this, event.type, eParam);
			}
		}
	},

	removeListener : function (type, listener) {
		if (this._listeners[type]instanceof Array) {
			var listeners = this._listeners[type];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i] === listener) {
					listeners.splice(i, 1);
					break;
				}
			}
		}
	}
};
