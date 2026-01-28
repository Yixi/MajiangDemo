/**
 * Created by liuyixi on 14-3-27.
 */
class ResourceLoader {
    constructor() {
        this.cache = {};
        this.readyCallbacks = [];
    }

    // Load an image url or an array of image urls
    load(urlOrArr) {
        if (Array.isArray(urlOrArr)) {
            urlOrArr.forEach((url) => this._load(url));
        } else {
            this._load(urlOrArr);
        }
    }

    _load(url) {
        if (this.cache[url]) {
            return this.cache[url];
        }

        const img = new Image();
        img.onload = () => {
            this.cache[url] = img;

            if (this.isReady()) {
                this.readyCallbacks.forEach((func) => func());
            }
        };
        this.cache[url] = false;
        img.src = url;
        return this.cache[url];
    }

    get(url) {
        return this.cache[url];
    }

    isReady() {
        for (const key in this.cache) {
            if (Object.prototype.hasOwnProperty.call(this.cache, key) && !this.cache[key]) {
                return false;
            }
        }
        return true;
    }

    onReady(func) {
        this.readyCallbacks.push(func);
    }
}

export const resources = new ResourceLoader();

class SpriteFrame {
    constructor(ctx, url, name, pos, size) {
        this.ctx = ctx;
        this.url = url;
        this.name = name;
        this.pos = pos;
        this.size = size;
    }

    draw(x, y) {
        this.ctx.drawImage(resources.get(this.url), this.pos.x, this.pos.y, this.size.w, this.size.h, x, y, this.size.w, this.size.h);
    }
}

export class Sprite {
    constructor(ctx, url, json) {
        this.ctx = ctx;
        this.url = url;
        this.json = json;
    }

    get(name) {
        const frames = this.json.frames;
        let currentInfo = null;
        for (let i = 0; i < frames.length; i++) {
            if (frames[i].filename === name) {
                currentInfo = frames[i];
                break;
            }
        }

        if (!currentInfo) {
            return null;
        }

        return new SpriteFrame(this.ctx, this.url, name, {
            x: currentInfo.frame.x,
            y: currentInfo.frame.y
        }, {
            w: currentInfo.frame.w,
            h: currentInfo.frame.h
        });
    }
}
