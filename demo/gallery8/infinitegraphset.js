/*
 * infinitegraphset.js
 */
(function (win, doc) {

    function InfiniteGraphSet(id, dataO, f) {
        var gallery = new SwipeView(id, {
                hastyPageFlip:true,
                numberOfPages: dataO.length
            }), i, page, df = dataO,
            ƒ = f || function () {
                console.log("tap cb");
            },
            locked = false,
            x = 0, y = 0, id;

        function onTouchStart(evt) {
            console.log('touchstart');
            if (locked) return;
            locked = true;
            x = evt.targetTouches.item(0).pageX;
            y = evt.targetTouches.item(0).pageY;
            id = evt.targetTouches.item(0).identifier;
        }
        function onTouchMove(evt) {
            console.log('touchmove');
            if(!locked) return;
            var i,l= evt.changedTouches.length, point;
            for(; i<l; i++) {
                if (evt.changedTouches.item(i).identifier === this.identifier)
                        point = e.changedTouches.item(i);
            }
            if (!point) return;
            if (Math.abs(point.pageX - x) < 10 && Math.abs(point.pageY - y) < 10) {
                x = point.pageX;
                y = point.pageY;
            }
            else {
                locked = false;
            }
        }
        function onTouchEnd() {
            console.log('touchend');
            if (!locked) return;
            var i,l= evt.touches.length, point;
            for(; i<l; i++) {
                if (evt.touches.item(i).identifier === this.identifier)
                        point = e.touches.item(i);
            }
            if(!point) {
                if (Math.abs(point.pageX - x) < 10 && Math.abs(point.pageY - y) < 10) {
                    ƒ();
                }
                locked = false;
            }
        }

        function genImgs(container, page, d) {
            var img, div;
            for(var i=0; i< 5; i++) {
                div = doc.createElement('div');
                div.className = 'container';
                img = doc.createElement('img');
                img.className = 'loading';
                img.src = d.get(page).imgs[i];
                img.width = d.get(page).width;
                img.height = d.get(page).height;
                // fixes for IE 
                img.setAttribute("unselectable", "on");
                img.ondragstart = function() { return false; };
                div.style.width = d.get(page).width + "px";
                div.style.height = d.get(page).height + "px";
                img.onload = function () { this.className = ''; }
                div.ontouchstart = onTouchStart;
                div.ontouchmove = onTouchMove;
                div.ontouchend = onTouchEnd;
                div.appendChild(img);
                container.appendChild(div);
            }
        }

        for(i=0; i<3; i++) {
            page = i==0 ? df.length-1 : i-1;
            div = doc.createElement('div');
            div.className = 'set-container';
            genImgs(div, page, df);
            gallery.masterPages[i].appendChild(div);
        }

        function setImg(el, src) {
            el.className = 'loading';
            el.src = src;
            el.onload = function () { this.className = ''; }
        }

        function init(newdf) {
            df = newdf;
            var el, page, i;
            for (i=0; i<3; i++) {
                page = i==0 ? newdf.length-1 : i-1;
                els = gallery.masterPages[i].querySelectorAll('img');
                setImg(els[0], newdf.get(page).imgs[0]);
                setImg(els[1], newdf.get(page).imgs[1]);
                setImg(els[2], newdf.get(page).imgs[2]);
                setImg(els[3], newdf.get(page).imgs[3]);
                setImg(els[4], newdf.get(page).imgs[4]);
            }
        }

        gallery.onFlip(function () {
            var els,
                upcoming,
                i;

            for (i=0; i<3; i++) {
                upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;

                if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
                    els = gallery.masterPages[i].querySelectorAll('img');
                    setImg(els[0], df.get(upcoming).imgs[0]);
                    setImg(els[1], df.get(upcoming).imgs[1]);
                    setImg(els[2], df.get(upcoming).imgs[2]);
                    setImg(els[3], df.get(upcoming).imgs[3]);
                    setImg(els[4], df.get(upcoming).imgs[4]);
                }
            }
        });
        return {
            gallery: gallery,
            reset:function (newdf) {
                gallery.reset();
                init(newdf);
            }
        };
    }

    win.InfiniteGraphSet = InfiniteGraphSet;
})(window, window.document);
