

$(document).ready(function () {
    ready();
})

var interval_ids = [];
var interval = null;

(function () {
    var timeout = 15;
    startTimer(timeout);
    setTimeout(reload, timeout * 1000);
  
})();


function ready() {
    $('div[id^="betprice"]').each(function () {
        $(this).effect("highlight", {}, 500);
        $(this).effect("highlight", {}, 500);
    });
}

function reload() {

   
    
    $.ajax({
        url: '/runners',
        type: 'GET',
        data: { inplayonly: $('#inplayonly').is(":checked") },
        dataType: 'html'
    }).done(function (data) {
        
            $('#container').hide();
            $('#container').empty();
           $('#container').html(data);
            $('#container').show();

        })
        .fail(function () {
            console.log("refresh() failed in local.js");
        });
}

 
function init() {
    

    $.ajax({
        url: '/runners',
        type: 'GET',
        data: { inplayonly: true },
        dataType: 'html'
    })
        .done(function (data) {
            $('#container').html(data);
            
        })
        .fail(function () {
            console.log("init() failed in local.js");
        });
}

function startTimer(seconds) {
    timer(seconds, callback);    
}

function timer(seconds, cb) {
    var remaningTime = seconds;
    window.setTimeout(function () {
        cb();
        console.log(remaningTime);
        if (remaningTime > 0) {


            var seconds = remaningTime;

            if (seconds.toString().length == 1) {
                seconds = "0" + seconds;
            }

            $('#timer').html('00:' + '00:' + seconds);

            if (seconds <= 2) {
                $('#timer').effect("pulsate", { times: 4 }, 2000);                
            }

            timer(remaningTime - 1, cb);
        }
    }, 1000);
}

var callback = function () {
    console.log('callback');
};





