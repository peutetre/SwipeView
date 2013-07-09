/**
 * app.js
 */

function genData(size) {

    function getImgURL() {
        return "http://lorempixel.com/186/125/?t=" + Math.ceil(Math.random()*100000);
    }

    return {
        get : function (i) {
            return {
                imgs : [getImgURL(), getImgURL(), getImgURL(), getImgURL(), getImgURL()],
                height : 125,
                width : 186
            };
        },
        length : size
    };
}

var gallery, el, i = 0, page;

gallery = new SwipeView('#wrapper', {
    numberOfPages: 100,
    vertical: true,
    hastyPageFlip:true
});

function init(domElt, myGallery, id, idx) {
    domElt = document.createElement('div');
    domElt.className = 'wrapper';
    domElt.id = "wrap" + idx + "-" + id;

    myGallery.masterPages[id]['swipeview'+idx] = InfiniteGraphSet(domElt, genData(100));
    myGallery.masterPages[id].appendChild(domElt);
}

// Load initial data
for (; i<3; i++) {
    page = i==0 ? 100-1 : i-1;
    init(el, gallery, i, 0);
    init(el, gallery, i, 1);
    init(el, gallery, i, 2);
    init(el, gallery, i, 3);
}

gallery.onFlip(function () {
    var upcoming, i=0;
    for (; i<3; i++) {
        upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;
        if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
            gallery.masterPages[i].swipeview0.reset(genData(100));
            gallery.masterPages[i].swipeview1.reset(genData(100));
            gallery.masterPages[i].swipeview2.reset(genData(100));
            gallery.masterPages[i].swipeview3.reset(genData(100));
        }
    }
});
