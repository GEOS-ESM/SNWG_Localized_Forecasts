$(document).ready(function() {
    function loadHashContent() {
        var hash = window.location.hash.substr(1);
        var pageToLoad = hash ? "vues/" + hash : "vues/home.html";
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
    var pageToLoad = hash ? "vues/" + hash : "vues/home.html";
    if ($('.main_wave_js').length) {
        showLoader('Loading...');
        $('.main_wave_js').fadeOut(100, function() {
            $('.main_wave_js').load(pageToLoad, function() {
                $('.main_wave_js').fadeIn(200);
                $(window).scrollTop(0);
                hideLoader();
            });
        });
    }
}