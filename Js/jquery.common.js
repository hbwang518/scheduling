/// <reference path="jquery-2.0.3.js" />
//------------------------------------------------
// guid
//-------
(function ($) {
    $.fn.newguid = $.newguid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); });
    };
}(jQuery));

//------------------------------------------------
// string format
//-------

String.prototype.format = function () {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

//------------------------------------------------
// uniqueArray
//-------
jQuery.uniqueArray = function () {
    this.items = new Array();
    this.itemsCount = 0;
    this.add = function (value) {
        if (!this.contains(value)) {
            this.items.push(value);
            this.itemsCount++;
        }
        else
            throw "The value '" + value + "' allready exists."
    }

    this.contains = function (value) {
        return jQuery.inArray(value, this.items) > -1;
    }

    this.clear = function () {
        this.items = new Array();
        this.itemsCount = 0;
    }
    this.size = function () {
        return this.itemsCount;
    }

    this.isEmpty = function () {
        return this.size() == 0;
    }

    this.remove = function (value) {
        if (this.contains(value)) {
            var index = jQuery.inArray(value, this.items);
            this.items.splice(index, 1);
            this.itemsCount--;
        }
        else
            throw "value '" + value + "' does not exists."
    }

    this.get = function (index) {
        if (index >= this.size()) {
            throw "index '" + index + "' is out of range."
        }
        else {
            return this.items[index];
        }
    }
};

//------------------------------------------------
// hashtable
//
jQuery.hashtable = function () {
    this.items = new Array();
    this.itemsCount = 0;
    this.uniqueArray = new jQuery.uniqueArray();
    this.add = function (key, value) {
        if (!this.containsKey(key)) {
            this.items[key] = value;
            this.uniqueArray.add(key);
            this.itemsCount++;
        }
        else
            throw "key '" + key + "' allready exists."
    }

    this.set = function (key, value) {
        this.items[key] = value;
    }

    this.get = function (key) {
        if (this.containsKey(key))
            return this.items[key];
        else
            return null;
    }

    this.remove = function (key) {
        if (this.containsKey(key)) {
            delete this.items[key];
            this.uniqueArray.remove(key);
            this.itemsCount--;
        }
        else
            throw "key '" + key + "' does not exists."
    }
    this.containsKey = function (key) {
        return typeof (this.items[key]) != "undefined";
    }
    this.containsValue = function containsValue(value) {
        for (var item in this.items) {
            if (this.items[item] == value)
                return true;
        }
        return false;
    }
    this.contains = function (keyOrValue) {
        return this.containsKey(keyOrValue) || this.containsValue(keyOrValue);
    }
    this.clear = function () {
        this.items = new Array();
        this.uniqueArray = new jQuery.uniqueArray();
        itemsCount = 0;
    }
    this.size = function () {
        return this.itemsCount;
    }
    this.isEmpty = function () {
        return this.size() == 0;
    }
    this.keys = this.uniqueArray.items;
};