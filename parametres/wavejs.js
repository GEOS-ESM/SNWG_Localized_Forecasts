$(document).ready(function() {
    function loadHashContent() {
        var hash = window.location.hash.substr(1);
        // Check for URL parameters
        var hasParams = window.location.search.length > 1;
        var pageToLoad;
        if (hasParams && window.location.search.includes("site=")) {
            // If there are URL parameters and location is set, load site.html with params
            pageToLoad = "vues/site.html" + window.location.search;
        } else {
            // Otherwise, use hash routing or default to home.html
            pageToLoad = hash ? "vues/" + hash : "vues/home.html";
        }
        if ($('.main_wave_js').length) {
            $('.main_wave_js').fadeOut(100, function() {
                $('.main_wave_js').load(pageToLoad, function() {
                    $('.main_wave_js').fadeIn(200);
                    $(window).scrollTop(0);
                });
            });
        }
    }

    if ($('.main_wave_js').length) {
        loadHashContent();
    }

    window.onhashchange = function() {
        loadHashContent();
    };

    $(document).on('click', '.nl_wave_routing', function(e) {
        var page = $(this).attr('href');
        if (page && page !== "#") {
            window.location.hash = page;
            $(window).scrollTop(0);
        }
        return false;
    });

    $(document).on('click', '.WaveModal', function() {
        var project = $(this).attr('ProjectName');
        if ($('.WaveInsideContent').length) {
            $(".WaveInsideContent").load("vues/work?p=" + project, function() {
                $(".WaveContentContainer").show();
                $('.WaveInsideContent').addClass('animated');
            });
        }
        return false;
    });

    $(document).on('click', '.WaveCloseModal', function() {
        $(".WaveContentContainer").fadeOut(500);
        return false;
    });

    $(document).mouseup(function(e) {
        var container = $(".WaveInsideContent");
        if (container.length && !container.is(e.target) && container.has(e.target).length === 0) {
            $(".WaveContentContainer").hide();
        }
    });
});




function loadHashContent() {
    var hash = window.location.hash.substr(1);
    // Check for URL parameters
    var hasParams = window.location.search.length > 1;
    var pageToLoad;
    if (hasParams && (window.location.search.includes("site=") || window.location.search.includes("location="))) {
        // If there are URL parameters and site/location is set, load site.html with params
        pageToLoad = "vues/site.html" + window.location.search;
    } else {
        // Otherwise, use hash routing or default to home.html
        pageToLoad = hash ? "vues/" + hash : "vues/home.html";
    }
    if ($('.main_wave_js').length) {
        $('.main_wave_js').fadeOut(100, function() {
            $('.main_wave_js').load(pageToLoad, function() {
                $('.main_wave_js').fadeIn(200);
                $(window).scrollTop(0);
                // Clean the URL: remove query parameters but keep hash if present
                if (hasParams) {
                    var cleanUrl = window.location.origin + window.location.pathname + (window.location.hash || "");
                    window.history.replaceState({}, document.title, cleanUrl);
                }
            });
        });
    }
}

