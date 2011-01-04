
// SmoothScroll v0.9.0
// Licensed under the terms of the MIT license.
// Balázs Galambosi (c) 2010

/**
 * A module for middle mouse scrolling.
 */
(function(){

// local settings
var img = document.createElement("div"); // img at the reference point
var scrolling = false; // guards one phase
var enabled   = false; // from settings
var framerate = 100;

// get global settings
chrome.extension
 .connect({ name: "smoothscroll"})
 .onMessage.addListener(function (settings) {
    enabled = (settings.middlemouse == "true");
 });   
 
/**
 * Initializes the image at the reference point.
 */
function init() {
    var url = chrome.extension.getURL("../img/cursor.png");
    var style = img.style;
    style.display    = "none";
    style.background = "url("+url+")";
    style.position   = "fixed";
    style.zIndex     = "1000";
    style.width      = "20px";
    style.height     = "20px";
    document.body.appendChild(img);
}

/**
 * Helper function for adding an event listener.
 */
function addEvent(type, fn) {
    window.addEventListener(type, fn, false);
}

/**
 * Helper function for removing an event listener.
 */
function removeEvent(type, fn) {
    window.removeEventListener(type, fn, false);  
}

/**
 * Shows the reference image, and binds event listeners for scrolling.
 * It also manages the animation.
 * @param {Object} event
 */
function mousedown(e) {

    var elem = document.elementFromPoint(e.clientX, e.clientY);
    var isLink = elem.nodeName.toLowerCase() === "a";

    // if it's not the middle button, or
    // it's being used on an <a> element
    // take the default action
    if (!enabled || e.button !== 1 || isLink) {
        return true;
    }
    
    // we don't want the default by now
    e.preventDefault();
    
    // quit if there's an ongoing scrolling
    if (scrolling) {
        return false;
    }
    
    // set up a new scrolling phase
    scrolling = true;
 
    // reference point
    img.style.left = e.clientX - 10 + "px";
    img.style.top  = e.clientY - 10 + "px";
    img.style.display = ""; // show
    
    var refereceX = e.clientX;
    var refereceY = e.clientY;

    var speedX = 0;
    var speedY = 0;
    
    // animation loop
    var delay = 1000 / framerate;
    var interval = setInterval(function(){
        window.scrollBy(speedX, speedY);
    }, delay);
    
    var first = true;

    function mousemove(e) {
        if (first) {
            addEvent("mouseup", remove);
            first = false;
        }
        speedX = (e.clientX - refereceX) / 10;
        speedY = (e.clientY - refereceY) / 10;
    }
    
    function remove(e) {
        removeEvent("mousemove", mousemove);
        removeEvent("mousedown", remove);
        removeEvent("mouseup", remove);
        removeEvent("keydown", remove);
        clearInterval(interval);
        img.style.display = "none";
        scrolling = false;
    }
    
    addEvent("mousemove", mousemove);
    addEvent("mousedown", remove);
    addEvent("keydown", remove);
}

addEvent("mousedown", mousedown);
addEvent("DOMContentLoaded", init);

})();
