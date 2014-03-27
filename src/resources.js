/**
 * Created by liuyixi on 14-3-27.
 */
(function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    // Load an image url or an array of image urls
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
                !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    window.resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();


function Sprite(Ctx,url,json) {
    var z = this;
    this.Ctx = Ctx;
    this.url = url;
    this.json = json;

    function _Sprite(name,pos, size) {
        this.pos = pos;
        this.size = size;
        this.Ctx = z.Ctx;
        this.url = z.url;
        this.name = name;
    }

    _Sprite.prototype = {
        draw: function (x, y) {
            this.Ctx.drawImage(resources.get(this.url), this.pos.x, this.pos.y, this.size.w, this.size.h, x, y,this.size.w, this.size.h);
        }
    };
    this._Sprite = _Sprite;
}


Sprite.prototype = {
    get:function(name){
        var frames = this.json.frames;
        var currentInfo;
        for(var i=0;i<frames.length;i++){
            if(frames[i].filename == name){
                currentInfo = frames[i];
                break;
            }
        }
        return new this._Sprite(name,{
            x:currentInfo.frame.x,
            y:currentInfo.frame.y
        },{
            w:currentInfo.frame.w,
            h:currentInfo.frame.h
        });
    },

};

