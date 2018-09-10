$(document).ready(function () {
    
    ready();
    settimeout();
});

function ready() {
    $('div[id^="betprice"]').each(function () {
        $(this).effect("highlight", {}, 500);
        $(this).effect("highlight", {}, 500);
    });
}

function settimeout() {

    var timeout = 15;   
    startTimer(timeout);
    setTimeout(refresh, timeout * 1000);
}

function refresh() {

    clearIntervals();

    $.ajax({
        url: '/markets',
        type: 'GET',
        data: { inplayonly: $('#inplayonly').is(":checked") },
        dataType: 'html'
    })
        .done(function (data) {
            $('#container').hide();
            $('#container').html(data);
            $('#container').show();
        })
        .fail(function () {
            console.log("Something went wrong!");
        });
}

function startTimer(seconds) {

    var interval = setInterval(function () {
        --seconds;
        if (seconds.toString().length == 1) {
            seconds = "0" + seconds;
        }

        $('#timer').html('00:' + '00:' + seconds);

        if (seconds <= 1) {            
            $('#timer').effect("pulsate", { times: 2 }, 2000);
            //clearInterval(interval);
        }
    }, 1000);
}

function clearIntervals() {
    for (var i = setInterval(function () { }, 0); i > 0; i--) {
        window.clearInterval(i);
        //window.clearTimeout(i);        
    }
}


