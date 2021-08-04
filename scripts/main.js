(async () => {
  let video = document.getElementById("video");

  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let gray = new cv.Mat();

  let cap = new cv.VideoCapture(video);
  let faces = new cv.RectVector();
  let classifier = new cv.CascadeClassifier();

  let faceCascadeFile = "haarcascade_frontalface_default.xml";

  createFileFromUrl(faceCascadeFile, () => {
    classifier.load(faceCascadeFile);
  });

  /* Source font video based Web Cam */
  let stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  video.srcObject = stream;
  video.play();

  const FPS = 30;

  function processVideo() {
    try {
      if (!stream) {
        src.delete();
        dst.delete();
        gray.delete();
        faces.delete();
        classifier.delete();
        return;
      }

      let begin = Date.now();

      cap.read(src);
      src.copyTo(dst);
      cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);

      classifier.detectMultiScale(gray, faces, 1.1, 3, 0);

      for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        let point1 = new cv.Point(face.x, face.y);
        let point2 = new cv.Point(face.x + face.width, face.y + face.height);
        cv.rectangle(dst, point1, point2, [0, 255, 0, 255], 2);
      }

      cv.imshow("output", dst);

      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    } catch (err) {
      console.log(err);
    }
  }

  function createFileFromUrl(path, callback) {
    let request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    request.onload = function (ev) {
      if (request.readyState === 4) {
        let data = new Uint8Array(request.response);
        cv.FS_createDataFile("/", path, data, true, false, false);
        callback();
      } else {
        self.printError("Failed to load " + url + " status: " + request.status);
      }
    };
    request.send();
  }

  setTimeout(processVideo, 0);
})();
