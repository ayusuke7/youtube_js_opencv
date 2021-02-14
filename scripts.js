const video = document.getElementById("video-input");
const canvas = document.getElementById("canvas-output");

(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  let cap = new cv.VideoCapture(video);

  if (!stream) {
    src.delete();
    dst.delete();
    return;
  }

  video.srcObject = stream;
  video.play();

  const FPS = 30;
  function processVideo() {
    let begin = Date.now();
    cap.read(src);

    // start processing.
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    let thresh = new cv.Mat();
    cv.threshold(gray, thresh, 90, 255, cv.THRESH_OTSU);

    let hierarchy = new cv.Mat();
    let contours = new cv.MatVector();

    cv.findContours(
      thresh,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    for (let i = 0; i < contours.size(); ++i) {
      let color = new cv.Scalar(255, 0, 0);
      cv.drawContours(src, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }

    cv.imshow("canvas-output", src);

    // schedule the next one.
    let delay = 1000 / FPS - (Date.now() - begin);
    setTimeout(processVideo, delay);
  }

  setTimeout(processVideo, 0);
})();
