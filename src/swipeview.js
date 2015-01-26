/*!
 * SwipeView v1.0 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */

// UMD wrapper
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {

var SwipeView = (function (window, document) {
  

  function indexOf (array, el) {
    var i;
    for (i=array.length-1; i>-1 && array[i]!==el; --i);
    return i;
  }

  /**
   * MicroEvent - https://github.com/jeromeetienne/microevent.js
   *
Copyright (c) 2011 Jerome Etienne, http://jetienne.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */
  var MicroEvent = function(){};
  MicroEvent.prototype = {
    bind: function(event, fct){
      this._events = this._events || {};
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
    },
    unbind: function(event, fct){
      this._events = this._events || {};
      if( event in this._events === false  ) return;
      this._events[event].splice(indexOf(this._events[event], fct), 1);
    },
    trigger: function(event /* , args... */){
      this._events = this._events || {};
      if( event in this._events === false  ) return;
      for(var i = 0; i < this._events[event].length; i++){
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };


  var dummyStyle = document.createElement('div').style,
        vendor = (function () {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle ) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',

        // Style properties
        transform = prefixStyle('transform'),
        transitionDuration = prefixStyle('transitionDuration'),

        // Browser capabilities
        has3d = prefixStyle('perspective') in dummyStyle,
        hasTouch = 'ontouchstart' in window,
        hasTransform = !!vendor,
        hasTransitionEnd = prefixStyle('transition') in dummyStyle,

        // Helpers
        translateZ = has3d ? ' translateZ(0)' : '',

        // Events
        resizeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize',
        startEvent = hasTouch ? 'touchstart' : 'mousedown',
        moveEvent = hasTouch ? 'touchmove' : 'mousemove',
        endEvent = hasTouch ? 'touchend' : 'mouseup',
        cancelEvent = hasTouch ? 'touchcancel' : 'mouseup',
        transitionEndEvent = (function () {
            if ( vendor === false ) return false;

            var transitionEnd = {
                    ''            : 'transitionend',
                    'webkit'    : 'webkitTransitionEnd',
                    'Moz'        : 'transitionend',
                    'O'            : 'oTransitionEnd',
                    'ms'        : 'MSTransitionEnd'
                };

            return transitionEnd[vendor];
        })(),

        //~~~ IE polyfills
        on = function (el, evt, fn, bubble) {
          if("addEventListener" in el) {
            el.addEventListener(evt, fn, bubble);
          } else if("attachEvent" in el) {
            el.attachEvent("on" + evt, fn);
          }
        },
        off = function (el, evt, fn) {
          if("removeEventListener" in el) {
            el.removeEventListener(evt, fn);
          }
          else if ("detachEvent" in el) {
            el.detachEvent("on" + evt, fn);
          }
        },
        preventDefault = function (e) {
          if (e.preventDefault) e.preventDefault();
          else e.returnValue = false;
        },
        getPageX = function (e) {
          if ('pageX' in e)
            return e.pageX;
          else
            return e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          return 0;
        },
        getPageY = function (e) {
          if ('pageY' in e)
            return e.pageY;
          else
            return e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          return 0;
        },
        //~~~ end of IE polyfills

        uuid = 0,

        SwipeView = function (el, options) {
            var i,
                div,
                className,
                pageIndex;

            this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
            this.id = this.wrapper.id || 'sw-id' + (++uuid);
            this.options = {
                text: null,
                numberOfPages: 3,
                snapThreshold: null,
                hastyPageFlip: false,
                vertical: false,
                loop: true,
                clientWidth: 1024,
                clientHeight: 145
            };

            // User defined options
            for (i in options) this.options[i] = options[i];

            this.currentMasterPage =  1;
            this.k = 0;
            this.maxK = 0;
            this.page = 0;
            this.pageIndex = 0;
            this.E = new MicroEvent();
            this.customEvents = [];
            this.wrapperWidth = 0;
            this.wrapperHeight = 0;
            this.pageSize = 0;
            this.initiated = false;
            this.identifier = null;
            this.moved = false;
            this.thresholdExceeded = false;
            this.startX = 0;
            this.startX = 0;
            this.pointX = 0;
            this.pointY = 0;
            this.stepsX = 0;
            this.stepsY = 0;
            this.direction = 0;
            this.directionLocked = false;
            this.cssPosition = this.options.vertical ? 'top' : 'left';

            this.wrapper.style.overflow = 'hidden';
            this.wrapper.style.position = 'relative';

            this.masterPages = [];

            div = document.createElement('div');
            div.className = 'swipeview-slider';
            div.style.cssText = 'position:relative;top:0;height:100%;width:100%;' +
                cssVendor + 'transition-duration:0;' +
                cssVendor + 'transform:translateZ(0);' +
                cssVendor + 'transition-timing-function:ease-out';
            this.wrapper.appendChild(div);
            this.slider = div;

            this.refreshSize();

            for (i=-1; i<2; i++) {
                div = document.createElement('div');
                div.style.cssText = cssVendor +
                    'transform:translateZ(0);position:absolute;top:0;height:100%;width:100%;' +
                    this.cssPosition + ':' + i*100 + '%';
                if (!div.dataset) div.dataset = {};
                pageIndex = i == -1 ? this.options.numberOfPages - 1 : i;
                div.dataset.pageIndex = pageIndex;
                div.dataset.upcomingPageIndex = pageIndex;

                if (!this.options.loop && i == -1) {
                  div.style.visibility = 'hidden';
                }

                this.slider.appendChild(div);
                this.masterPages.push(div);
            }

            className = this.masterPages[1].className;
            this.masterPages[1].className = !className ? 'swipeview-active' : className + ' swipeview-active';

            // handleEventF is used for binding function (required for IE)
            var self = this;
            this.handleEventF = function (e) {
              self.handleEvent(e);
            };

        };

    SwipeView.prototype = {
        bind: function () {
            if (this._bound) throw new Error("SwipeView was already bounded");
            this._bound = true;
            on(window, resizeEvent, this.handleEventF, false);
            on(this.wrapper, startEvent, this.handleEventF, false);
            on(this.wrapper, moveEvent, this.handleEventF, false);
            on(this.wrapper, endEvent, this.handleEventF, false);
            on(this.slider, transitionEndEvent, this.handleEventF, false);
            // in Opera >= 12 the transitionend event is lowercase so we register both events
            if ( vendor == 'O' ) on(this.slider, transitionEndEvent.toLowerCase(), this.handleEventF, false);

            if (!hasTouch) {
                on(this.wrapper, 'mouseout', this.handleEventF, false);
            }
            return this;
        },

        unbind : function(){
            if (!this._bound) throw new Error("SwipeView was not bounded");
            this._bound = false;
            // Remove the event listeners
            off(window, resizeEvent, this.handleEventF);
            off(this.wrapper, startEvent, this.handleEventF);
            off(this.wrapper, moveEvent, this.handleEventF);
            off(this.wrapper, endEvent, this.handleEventF);
            off(this.slider, transitionEndEvent, this.handleEventF);

            if (!hasTouch) {
                off(this.wrapper, 'mouseout', this.handleEventF);
            }
            return this;
        },

        /**
         * Removes all external events callbacks
         */
        offAll: function () {
            while ( this.customEvents.length ) {
                this.E.unbind(this.customEvents[0][0], this.customEvents[0][1]);
                this.customEvents.shift();
            }
        },

        reset : function (pageCount) {
            this.goToPage(0);
            this.updatePageCount(pageCount);
            this.refreshSize();
        },

        onFlip: function (fn) {
          this.E.bind('flip', fn);
          this.customEvents.push(['flip', fn]);
        },

        onMoveOut: function (fn) {
            this.E.bind('moveout', fn);
            this.customEvents.push(['moveout', fn]);
        },

        onMoveIn: function (fn) {
            this.E.bind('movein', fn);
            this.customEvents.push(['movein', fn]);
        },

        onTouchStart: function (fn) {
            this.E.bind('touchstart', fn);
            this.customEvents.push(['touchstart', fn]);
        },

        destroy: function () {
            this.unbind();
            this.offAll();
        },

        refreshSize: function () {
            this.wrapperWidth = this.wrapper.clientWidth === 0 ? this.options.clientWidth : this.wrapper.clientWidth;
            this.wrapperHeight = this.wrapper.clientHeight === 0 ? this.options.clientHeight : this.wrapper.clientHeight;
            this.wrapperSize = this.options.vertical ? this.wrapperHeight : this.wrapperWidth;
            this.pageSize = this.options.vertical ? this.wrapperHeight : this.wrapperWidth;
            this.maxK = -this.options.numberOfPages * this.pageSize + this.wrapperSize;
            this.snapThreshold = this.options.snapThreshold === null ?
                Math.round(this.pageSize * 0.15) :
                /%/.test(this.options.snapThreshold) ?
                    Math.round(this.pageSize * this.options.snapThreshold.replace('%', '') / 100) :
                    this.options.snapThreshold;
        },

        updatePageCount: function (n) {
            this.options.numberOfPages = n;
            this.maxK = -this.options.numberOfPages * this.pageSize + this.wrapperSize;
        },

        goToPage: function (p) {
            var i;

            this.masterPages[this.currentMasterPage].className = this.masterPages[this.currentMasterPage].className.replace(/(^|\s)swipeview-active(\s|$)/, '');
            for (i=0; i<3; i++) {
                className = this.masterPages[i].className;
                if(!/(^|\s)swipeview-loading(\s|$)/.test(className))
                    this.masterPages[i].className = !className ? 'swipeview-loading' : className + ' swipeview-loading';
            }

            p = p < 0 ? 0 : p > this.options.numberOfPages-1 ? this.options.numberOfPages-1 : p;
            this.page = p;
            this.pageIndex = p;
            this.slider.style[transitionDuration] = '0s';
            this.__pos(-p * this.pageSize);

            this.currentMasterPage = (this.page + 1) - Math.floor((this.page + 1) / 3) * 3;

            this.masterPages[this.currentMasterPage].className = this.masterPages[this.currentMasterPage].className + ' swipeview-active';


            var indices = (function calculatePagesIndexFromCurrent( currentMasterPage ){
                if (currentMasterPage === 0)      return [2, 0, 1];
                else if (currentMasterPage === 1) return [0, 1, 2];
                else                              return [1, 2, 0];
            })(this.currentMasterPage);

            this.masterPages[ indices[0] ].style[this.cssPosition] = this.page * 100 - 100 + '%';
            this.masterPages[ indices[1] ].style[this.cssPosition] = this.page * 100 + '%';
            this.masterPages[ indices[2] ].style[this.cssPosition] = this.page * 100 + 100 + '%';

            this.masterPages[ indices[0] ].dataset.upcomingPageIndex = this.page === 0 ? 
                (this.options.loop ? this.options.numberOfPages-1 : undefined ): this.page - 1;
            this.masterPages[ indices[1] ].dataset.upcomingPageIndex = this.page;
            this.masterPages[ indices[2] ].dataset.upcomingPageIndex = this.page == this.options.numberOfPages-1 ? 
                (this.options.loop ? 0 : undefined ): this.page + 1;

            if (!this.options.loop) {
              this.masterPages[ indices[0] ].style.visibility = this.page === 0 ? "hidden" : "";
              this.masterPages[ indices[1] ].style.visibility = "";
              this.masterPages[ indices[2] ].style.visibility = this.page === this.options.numberOfPages-1 ? "hidden" : "";
            }

            this.__flip( true );
        },

        next: function () {
            if (!this.options.loop && this.k == this.maxK) return;

            this.direction = -1;
            this.k -= 1;
            this.__checkPosition();
        },

        prev: function () {
            if (!this.options.loop && this.k === 0) return;

            this.direction = 1;
            this.k += 1;
            this.__checkPosition();
        },

        handleEvent: function (e) {
            switch (e.type) {
            case startEvent:
                this.__start(e);
                break;
            case moveEvent:
                this.__move(e);
                break;
            case "mouseout":
                if (this.initiated) {
                    var elts = this.wrapper.getElementsByTagName('*');
                    for (var i=0; i< elts.length; i++)
                        if( e.toElement == elts[i]) return;
                    this.__end(e);
                }
                break;
            case cancelEvent:
            case endEvent:
                this.__end(e);
                break;
            case resizeEvent:
                this.__resize();
                break;
            case transitionEndEvent:
            case 'otransitionend':
                if (e.target == this.slider && !this.options.hastyPageFlip) this.__flip();
                break;
            }
        },


        /**
        *
        * Pseudo private methods
        *
        */
        __pos: function (k) {
            this.k = k;
            if (hasTransform) {
              this.slider.style[transform] = (this.options.vertical ? 'translate(0,' + k + 'px)' : 'translate(' + k + 'px,0)') + translateZ;
            }
            else {
              if (this.options.vertical) {
                this.slider.style.top = k+"px";
              }
              else {
                this.slider.style.left = k+"px";
              }
            }
        },

        __resize: function () {
            this.refreshSize();
            this.slider.style[transitionDuration] = '0s';
            this.__pos(-this.page * this.pageSize);
        },

        __start: function (e) {
            //e.preventDefault();

            if (this.initiated) return;

            var point = hasTouch ? e.targetTouches[0] : e;

            this.initiated = true;
            this.identifier = point.identifier;
            this.moved = false;
            this.thresholdExceeded = false;
            this.startX = getPageX(point);
            this.startY = getPageY(point);
            this.pointX = getPageX(point);
            this.pointY = getPageY(point);
            this.stepsX = 0;
            this.stepsY = 0;
            this.direction = 0;
            this.directionLocked = false;

            this.slider.style[transitionDuration] = '0s';

            this.E.trigger('touchstart');
        },

        __move: function (e) {
            if (!this.initiated) return;
            var i, l, point;

            if (hasTouch) {
                i = 0;
                l = e.changedTouches.length;
                for(;i<l;i++) {
                    if (e.changedTouches.item(i).identifier === this.identifier)
                        point = e.changedTouches.item(i);
                }
                if (!point) return;
            }
            else {
                point = e;
            }

            var deltaX = getPageX(point) - this.pointX,
                deltaY = getPageY(point) - this.pointY,
                newC = this.options.vertical ? this.k + deltaY : this.k + deltaX,
                dist = this.options.vertical ? Math.abs(getPageY(point) - this.startY): Math.abs(getPageX(point) - this.startX);

            if (Math.abs(dist) >= this.pageSize) { return; }

            this.moved = true;
            this.pointX = getPageX(point);
            this.pointY = getPageY(point);
            this.direction = this.options.vertical ? (deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0): (deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0);
            this.stepsX += Math.abs(deltaX);
            this.stepsY += Math.abs(deltaY);

            // We take a 10px buffer to figure out the direction of the swipe
            if (this.stepsX < 10 && this.stepsY < 10) {
//                e.preventDefault();
                return;
            }

            // We are scrolling vertically, so skip SwipeView and give the control back to the browser
            if (!this.directionLocked && (this.options.vertical ? this.stepsX > this.stepsY : this.stepsY > this.stepsX)) {
                this.initiated = false;
                return;
            }

            preventDefault(e);

            this.directionLocked = true;

            if (!this.options.loop && (newC > 0 || newC < this.maxC)) {
                newC = this.k + ((this.options.vertical ?deltaY : deltaX) / 2);
            }

            if (!this.thresholdExceeded && dist >= this.snapThreshold) {
                this.thresholdExceeded = true;
                this.E.trigger('moveout');
            } else if (this.thresholdExceeded && dist < this.snapThreshold) {
                this.thresholdExceeded = false;
                this.E.trigger('movein');
            }

            this.__pos(newC);
        },

        __end: function (e) {
            if (!this.initiated) return;

            var point;

            if(hasTouch) {
                var i=0, l = e.touches.length;
                for(;i<l;i++) {
                    if (e.touches.item(i).identifier === this.identifier)
                        return;
                }
                i = 0; l = e.changedTouches.length;
                for(;i<l;i++) {
                    if(e.changedTouches.item(i).identifier === this.identifier)
                        point = e.changedTouches.item(i);
                }
                if (!point) {
                    this.__pos(-this.page * this.pageSize);
                    this.initiated = false;
                    return;
                }
            }
            else {
                point = e;
            }

            var dist = this.options.vertical ? Math.abs(getPageY(point) - this.startY) : Math.abs(getPageX(point) - this.startX);


            this.initiated = false;

            if (!this.moved) return;

            if (!this.options.loop && (this.k > 0 || this.k < this.maxK)) {
                dist = 0;
                this.E.trigger('movein');
            }

            // Check if we exceeded the snap threshold
            if (dist < this.snapThreshold) {
                this.slider.style[transitionDuration] = Math.floor(300 * dist / this.snapThreshold) + 'ms';
                this.__pos(-this.page * this.pageSize);
                return;
            }

            this.__checkPosition();
        },

        abort: function () {
          if (!this.initiated) return;
          this.__pos(-this.page * this.pageSize);
          this.initiated = false;
        },

        __checkPosition: function () {
            var pageFlip,
                pageFlipIndex,
                className;

            this.masterPages[this.currentMasterPage].className = this.masterPages[this.currentMasterPage].className.replace(/(^|\s)swipeview-active(\s|$)/, '');

            // Flip the page
            if (this.direction > 0) {
                this.page = -Math.ceil(this.k / this.pageSize);
                this.currentMasterPage = (this.page + 1) - Math.floor((this.page + 1) / 3) * 3;
                this.pageIndex = this.pageIndex === 0 ? this.options.numberOfPages - 1 : this.pageIndex - 1;

                pageFlip = this.currentMasterPage - 1;
                pageFlip = pageFlip < 0 ? 2 : pageFlip;
                this.masterPages[pageFlip].style[this.cssPosition] = this.page * 100 - 100 + '%';

                pageFlipIndex = this.page - 1;
                pageFlipIndex = pageFlipIndex - Math.floor(pageFlipIndex / this.options.numberOfPages) * this.options.numberOfPages;
                pageFlipIndex = pageFlipIndex === this.options.numberOfPages && !this.options.loop ? undefined : pageFlipIndex;
            } else {
                this.page = -Math.floor(this.k / this.pageSize);
                this.currentMasterPage = (this.page + 1) - Math.floor((this.page + 1) / 3) * 3;
                this.pageIndex = this.pageIndex == this.options.numberOfPages - 1 ? 0 : this.pageIndex + 1;

                pageFlip = this.currentMasterPage + 1;
                pageFlip = pageFlip > 2 ? 0 : pageFlip;
                this.masterPages[pageFlip].style[this.cssPosition] = this.page * 100 + 100 + '%';

                pageFlipIndex = this.page + 1;
                pageFlipIndex = pageFlipIndex - Math.floor(pageFlipIndex / this.options.numberOfPages) * this.options.numberOfPages;
                pageFlipIndex = pageFlipIndex === 0 && !this.options.loop ? undefined : pageFlipIndex;
            }

            // Add active class to current page
            className = this.masterPages[this.currentMasterPage].className;
            if(!/(^|\s)swipeview-active(\s|$)/.test(className))
                this.masterPages[this.currentMasterPage].className = !className ? 'swipeview-active' : className + ' swipeview-active';

            // Add loading class to flipped page
            className = this.masterPages[pageFlip].className;
            if(!/(^|\s)swipeview-loading(\s|$)/.test(className))
                this.masterPages[pageFlip].className = !className ? 'swipeview-loading' : className + ' swipeview-loading';

            this.masterPages[pageFlip].dataset.upcomingPageIndex = pageFlipIndex;        // Index to be loaded in the newly flipped page

            newC = -this.page * this.pageSize;

            this.slider.style[transitionDuration] = Math.floor(500 * Math.abs(this.k - newC) / this.pageSize) + 'ms';

            // Hide the next page if we decided to disable looping
            if (!this.options.loop) {
                this.masterPages[pageFlip].style.visibility = newC === 0 || newC == this.maxK ? 'hidden' : '';
            }

            if (this.k == newC) {
                this.__flip();        // If we swiped all the way long to the next page (extremely rare but still)
            } else {
                this.__pos(newC);
                if (this.options.hastyPageFlip) this.__flip();
            }
        },

        __flip: function ( fromGoTo ) {
            this.E.trigger('flip', { triggeredByGoto : !!fromGoTo });

            for (var i=0; i<3; i++) {
                this.masterPages[i].className = this.masterPages[i].className.replace(/(^|\s)swipeview-loading(\s|$)/, '');        // Remove the loading class
                this.masterPages[i].dataset.pageIndex = this.masterPages[i].dataset.upcomingPageIndex;
            }
        }
    };

    function prefixStyle (style) {
        if ( vendor === '' ) return style;

        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    }

    return SwipeView;
})(window, document);

// End of UMD wrapper
return SwipeView;
}));
