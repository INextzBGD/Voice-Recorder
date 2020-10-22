
let audioContext;
let streamCopy;
let audioSource;
let audioList = [];

function showAppList() {

    const audio = $('.app-listeng audio')[0];
    audio.pause();

    $('.app-list').addClass('show');
    $('.app-recording').removeClass('show');
    $('.app-listeng').removeClass('show');
}

function showAppListeng(event) {

    const $element = $(event.currentTarget);
    const title = $element.find('.title').html();
    const date = $element.find('.date').html();
    const id = parseInt($element.attr('data-id'));
    const audio = audioList.find((audio) => audio.id === id);

    $('.app-list').removeClass('show');


    $('.app-listeng').addClass('show');
    $('.app-listeng').html(`
    <i class="back fa fa-angle-left"></i>
        <div class="recording-info" data-id="${id}">
            <span class="title">${title}</span>
            <span class="date">${date}</span>
            <audio controls src="${audio.file}"></audio>
            <i class="remove far fa-trash-alt"></i>
        </div>
    `);

    $('.back').click(showAppList);
    $('.remove').click(deleteRecording);
}

function startRecording() {

    $('.app-list').removeClass('show');
    $('.app-listeng').removeClass('show');
    $('.app-recording').addClass('show');
    $('.play-pause').css('background-color', '#aaa').css('color', '#555');

    recVoice();
}

function stopRecording() {

    $('.play-pause').attr('class','play-pause fa fa-pause');

    rec.stop();
    streamCopy.getAudioTracks()[0].stop();
    rec.exportWAV((blob) => {

        let reader = new FileReader();

        reader.readAsDataURL(blob); 
        reader.onloadend = function() {             

            const audioData = {
                title: `Gravação (${audioList.length})`,
                date: new Date().toLocaleDateString(),
                duration: $('.app-timer .timer').html(),
                file: reader.result,
                id: new Date().getTime()
            };
        
            audioList.push(audioData);
            createRecordingHtml(audioData.id, audioData.title, audioData.date, audioData.duration);
        
            showAppList();
            saveData();
        };
    });
}

function playPause() {

    const $playPause = $('.play-pause');
    
    if ($playPause.attr('class') === 'play-pause fa fa-play') {

        $playPause.attr('class','play-pause fa fa-pause');
        $playPause.css('background-color', '#aaa').css('color', '#555');

        rec.stop();
    }
    else {
        $playPause.attr('class','play-pause fa fa-play');
        $playPause.css('background-color', '#ddd').css('color', '#aaa');

        rec.record();
    }
}

function recVoice() {

    const permissions = {audio: true, video: false};
    const promise = navigator.mediaDevices.getUserMedia(permissions);

    promise.then((stream) => {

        audioContext = new AudioContext();
        streamCopy = stream;
        audioSource = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(audioSource, {numChannels:1});

        rec.record();
    })
    .catch(() => {

        alert('Falha ao executar a gravação');
    });
}

function createRecordingHtml(id, title, date, duration) {

    const $recordingsItem = $(`
        <div class="recording" data-id="${id}">
            <span class="title">${title}</span>
            <div class="recording-data">
                <span class="date">${date}</span>
                <span class="duration">${duration}</span>
            </div>
        </div>
    `);

    $recordingsItem.click(showAppListeng);
    $('.recordings-list').append($recordingsItem);
}

function saveData() {

    localStorage.setItem('audioList', JSON.stringify(audioList));
}

function loadData() {
    
    audioList = JSON.parse(localStorage.getItem('audioList'));

    if (audioList === null) {

        audioList = [];
    }

    for (let i = 0; i < audioList.length; i++) {

        createRecordingHtml(audioList[i].id, audioList[i].title, audioList[i].date, audioList[i].duration,);
    }
}

function deleteRecording() {

    const recordingId = parseInt($('.recording-info').attr('data-id'));
    const $recording = $(`.recordings-list [data-id="${recordingId}"]`);

    $recording.remove();

    let audioIndex = audioList.findIndex((audio) => audio.id === recordingId);
    audioList.splice(audioIndex, 1);

    saveData();
    showAppList();
}

$(document).ready(() => {

    $('.fa-microphone-alt').click(startRecording);
    $('.fa-stop').click(stopRecording);
    $('.play-pause').click(playPause);
    
    loadData();
});