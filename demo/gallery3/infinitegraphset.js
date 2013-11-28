/*
 * infinitegraphset.js
 */
(function (win, doc) {

    function InfiniteGraphSet(id, dataO) {
        var gallery = new SwipeView(id, {
                hastyPageFlip:true,
                numberOfPages: dataO.length
            }), i, page;
        gallery.bind();

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
                div.style.width = d.get(page).width + "px";
                div.style.height = d.get(page).height + "px";
                img.onload = function () { this.className = ''; }
                // fixes for IE 
                img.setAttribute("unselectable", "on");
                img.ondragstart = function() { return false; };
                div.appendChild(img);
                container.appendChild(div);
            }
        }

        for(i=0; i<3; i++) {
            page = i==0 ? dataO.length-1 : i-1;
            div = doc.createElement('div');
            div.className = 'set-container';
            genImgs(div, page, dataO);
            gallery.masterPages[i].appendChild(div);
        }

        function setImg(el, src) {
            el.className = 'loading';
            el.src = src;
            el.onload = function () { this.className = ''; }
        }

        gallery.onFlip(function () {
            var el,
                upcoming,
                i;

            for (i=0; i<3; i++) {
                upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;

                if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
                    els = gallery.masterPages[i].querySelectorAll('img');
                    setImg(els[0], dataO.get(upcoming).imgs[0]);
                    setImg(els[1], dataO.get(upcoming).imgs[1]);
                    setImg(els[2], dataO.get(upcoming).imgs[2]);
                    setImg(els[3], dataO.get(upcoming).imgs[3]);
                    setImg(els[4], dataO.get(upcoming).imgs[4]);
                }
            }
        });
        return gallery;
    }

    win.InfiniteGraphSet = InfiniteGraphSet;
})(window, window.document);
