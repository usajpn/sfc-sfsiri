var speechFlag = 0;
var sendFlag = false;
var result = '';
var option = new Object();
var zanryuMP3A = 'http://tts-api.com/tts.mp3?q=Which%20building%20are%20you%20going%20to%20stay%3F';
var zanryuMP3B = 'http://tts-api.com/tts.mp3?q=Where%3F';
var classroomMP3A = 'http://tts-api.com/tts.mp3?q=Which%20day%3F';
var classroomMP3B = 'http://tts-api.com/tts.mp3?q=When%3F';
var peMP3A = 'http://tts-api.com/tts.mp3?q=When%3F';
var peMP3B = 'http://tts-api.com/tts.mp3?q=Which%20period%3F';
var peMP3C = 'http://tts-api.com/tts.mp3?q=Which%20sport%3F';
var okMP3 = 'http://tts-api.com/tts.mp3?q=No%20problemo';
var waitMP3 = 'http://tts-api.com/tts.mp3?q=Wait%20a%20sec';
var sorryMP3 = 'http://tts-api.com/tts.mp3?q=sorry';
var earlyMP3 = 'http://tts-api.com/tts.mp3?q=time%20to%20early';
var daySet = ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'];
var url = 'ws://133.27.171.57:8080';
var zanryuQuestions = [zanryuMP3A, zanryuMP3B];
var classroomQuestions = [classroomMP3A, classroomMP3B];
var peQuestions = [peMP3A, peMP3B, peMP3C];
var ws = new WebSocket(url);

ws.onmessage = function(e) {
    var responce = e.data;
    var responceMp3 = 'http://tts-api.com/tts.mp3?q=' + responce;

    if (option.app == 'report') {
        document.getElementById('result_printarea').innerHTML = responce;
        say(okMP3);
    }
    else {
        say(responceMp3);
    }
}

var recognition = new webkitSpeechRecognition();
recognition.onresult = function(event) {
    result = event.results[0][0].transcript;

    if (!speechFlag) {
        console.log(result);
        selectApp(result);
    }
    else if (speechFlag == 1) {
        console.log(result);
        if (option.app == 'zanryu') {
            selectBuilding(result);
        }
        else if (option.app == 'pe') {
            selectDate(result);
        }
        else if (option.app == 'classroom') {
            selectDay(result);
        }
    }
    else if (speechFlag == 2) {
        console.log(result);
        if (option.app == 'zanryu') {
            sendFlag = true;
            selectPlace(result);
        }
        else if (option.app == 'pe') {
            selectPeriod(result);
        }
        else if (option.app == 'classroom') {
            sendFlag = true;
            selectPeriod(result);
        }
    }
    else if (speechFlag == 3) {
        console.log(result);
        if (option.app == 'pe') {
            sendFlag = true;
            selectSport(result);
        }
    }
};

function askUser() {
    if (sendFlag) {
        sendRequest();
        return;
    }
    else if (option.app == 'zanryu') {
        say(zanryuQuestions[speechFlag]);
    }
    else if (option.app == 'pe') {
        say(peQuestions[speechFlag]);
    }
    else if (option.app == 'classroom') {
        say(classroomQuestions[speechFlag]);
    }
    speechFlag++;
    setTimeout(function() {
        jQuery('#talk').trigger('click');
    }, 1000);
}

function say(mp3) {
    jQuery('#audio-responce').children().remove();

    var audioNode = jQuery('<audio controls></audio>')
        .attr('id', 'audio')
        .css('visibility', 'hidden')
        .appendTo(jQuery('#audio-responce'));
    var audioSource = jQuery('<source></source>')
        .attr('id', 'audio_src')
        .attr('src', mp3)
        .appendTo(audioNode);

    audio.play();
}

function currentHour() {
    var now = new Date();

    return now.getHours();
}

function selectApp(result) {
    if (result == '残留') {
        if (currentHour() < 18) {
            say(earlyMP3);
            return;
        } 
        else {
            option.app = 'zanryu';
        }
    }
    else if (result == '課題') {
        option.app = 'report';
        sendRequest();
        return;
    }
    else if (result == '体育') {
        option.app = 'pe';
    }
    else if (result == '教室') {
        option.app = 'classroom';
        say(classroomMP3A);
    }
    else {
        say(sorryMP3);
        speechFlag = 0;
        return;
    }
    askUser();
}

function selectBuilding(result) {
    option.building = result.substr(0, 1);
    askUser();
}

function selectPlace(result) {
    option.floor = '';
    option.room = '';
    if (option.building == 'd') {
        option.floor = result.substr(0, 2);
        option.room = result.substr(1);
    }
    else {
        option.floor = result.substr(0, 1);
        option.room = result.substr(1);
    }

    sendRequest();
}

function selectDate(result) {
    var resultSet = result.split('年');
    option.year = resultSet[0].toString(10);

    var monthDay = resultSet[1].split('月');
    option.month = monthDay[0].toString(10);

    var day = monthDay[1].split('日');
    option.day = day[0].toString(10);

    console.log(option);
    askUser();
}

function selectDay(result) {
    for (var i = 0; i < 7; i++) {
        if (result == daySet[i]) {
            option.day = i;
            askUser();
            return;
        }
    }
    say(sorryMP3);
}

function selectSport(result) {
    option.sport = result;

    askUser();
}

function selectPeriod(result) {
    if (option.app == 'classroom') {
        option.period = result - 1;
    }
    else if (option.app == 'pe') {
        option.period = result.toString();
    }

    askUser();
}

function sendRequest() {
    option.login = $('#login').val();
    option.pass = $('#pw').val();
    var jsonObj = JSON.stringify(option);
    console.log(jsonObj);

    ws.send(jsonObj);

    speechFlag = 0;
    sendFlag = 0;
    say(waitMP3);
}
