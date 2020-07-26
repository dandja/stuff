feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
const screenshotImage = document.querySelector('img');
const buttons = [...controls.querySelectorAll('button')];
let model;

const MODEL_URL = 'https://raw.githubusercontent.com/dandja/stuff/master/model.json'

    //https://medium.com/codait/bring-machine-learning-to-the-browser-with-tensorflow-js-part-iii-62d2b09b10a3
    //https://github.com/vabarbosa/tfjs-model-playground/blob/master/image-segmenter/demo/image-segmenter.js

    //window.loadModel = async function () {
    async function loadModel() {

    //disableElements()
    // message('loading model...')

    let start = (new Date()).getTime()

    // https://js.tensorflow.org/api/1.0.0/#loadGraphModel
    model = await tf.loadGraphModel(MODEL_URL)
        tf.loadLayersModel(MODEL_URL)
        //tf.loadModel(MODEL_URL)
        let end = (new Date()).getTime()

        //message(model.modelUrl)
        // message(`model loaded in ${(end - start) / 1000} secs`, true)
        // enableElements()
        console.log(`model loaded in ${(end - start) / 1000} secs`, true)
}

let streamStarted = false;

const[play, pause, screenshot] = buttons;

const constraints = {
    video: {
        width: {
            min: 1280,
            ideal: 1920,
            max: 2560,
        },
        height: {
            min: 720,
            ideal: 1080,
            max: 1440
        },
    }
};

const getCameraSelection = async() => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
    });
    cameraOptions.innerHTML = options.join('');
};

//play.onclick = () => {
function start() {
    loadModel();

    if (streamStarted) {
        video.play();
        play.classList.add('d-none');
        pause.classList.remove('d-none');
        return;
    }
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        const updatedConstraints = {
            ...constraints,
            deviceId: {
                exact: cameraOptions.value
            }
        };
        startStream(updatedConstraints);

        //https://www.w3schools.com/js/js_timing.asp
        check = setInterval(tryImage, 1000);

    }
};

const startStream = async(constraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleStream(stream);
};

const handleStream = (stream) => {
    video.srcObject = stream;
    play.classList.add('d-none');
    //   pause.classList.remove('d-none');
    //  screenshot.classList.remove('d-none');
    streamStarted = true;
};

getCameraSelection();

cameraOptions.onchange = () => {
    const updatedConstraints = {
        ...constraints,
        deviceId: {
            exact: cameraOptions.value
        }
    };
    startStream(updatedConstraints);
};

/*const pauseStream = () => {
    video.pause();
    play.classList.remove('d-none');
    pause.classList.add('d-none');
};*/

/*const doScreenshot = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    screenshotImage.src = canvas.toDataURL('image/webp');
    screenshotImage.classList.remove('d-none');
};*/

//pause.onclick = pauseStream;
//screenshot.onclick = doScreenshot;


async function tryImage() {
    //window.tryImage = async function () {

    if (streamStarted) {
//full size image to keep if ok

 // canvasKeep.getContext('2d').drawImage(video, 0, 0);


// image to check sized for model
        canvas.width = 192;
        canvas.height = 109;

        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 192, 109);

        // create a tensor from an image - tensorflow.js 1.0.0
        // https://js.tensorflow.org/api/1.0.0/#browser.fromPixels


        let imageTensor = tf.browser.fromPixels(canvas) //,'float32')

            // imageTensor.print()

            let imageTensorTyped = tf.cast(imageTensor, 'float32')

            // imageTensorTyped.print()

            // insert a dimension into the tensor's shape
            let preprocessedInput = imageTensorTyped.expandDims()

            const output = model.predict(preprocessedInput);

        //output.print(1);

        const out = output.dataSync()[0];

        console.log(out);

        if (out > 0) {
            clearInterval(check)
            console.log('ouput:yes');

            screenshotImage.src = canvas.toDataURL('image/webp');
            screenshotImage.classList.remove('d-none');

        }

    }

};
