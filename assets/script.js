console.log("Foobar");

(function showCookieNoticeIfFirstVisit() {
    if(!userHasVisitedBefore()) {
        showCookieNotice();
        setUserHasVisitedBefore();
    }
})();

function userHasVisitedBefore() {
    var cookies = document.cookie.split(";");
    if(cookies.length < 1) {
        return false;
    }
    cookies = cookies.filter(function(cookie) {
        return cookie.trim().match(/^etreeCookieNoticeShown=/);
    });
    var cookie = cookies[0];
    return !!cookie;
}

function showCookieNotice() {
    var cookieNotice = elementFromHtml('<div class="cookieNotice">Vi bruger cookies for at forbedre bruger&#173;oplevelsen. <span>Ok</span></div>');

    document.body.appendChild(cookieNotice);
    cookieNotice.addEventListener("click", function(event) {
        this.className += " hidden";
    });
}

function elementFromHtml(html) {
    var utilityDiv = document.createElement("div");
    utilityDiv.innerHTML = html;
    return utilityDiv.firstChild;
}

function setUserHasVisitedBefore() {
    document.cookie = "etreeCookieNoticeShown=1;expires=" + new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)).toUTCString() + ";path=/";
}
