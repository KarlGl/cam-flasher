(function(win, nav) {
    var cameraRatio = 1.2903225806451613

    // For decent performance, we really need a large scale factor.
    var scale = 1

    var getH = function(w) {
        return Math.round(w / cameraRatio)
    }
    var avMedia = {};
    var curColors = ['red', 'green', 'blue']

    captureSize = 130
    captureRate = 30
    Object.defineProperty(avMedia,
        'captureSize', {
            get: function() {
                return captureSize
            },
            set: function(newV) {
                captureSize = newV
                updateScaleFromWin()
            }
        })

    win.document.onclick = function() {
        avMedia.snap();
    }

    avMedia.imageData = null;
    avMedia.video = null;

    var unpixelateEffect = function(curo, endo, rateo) {
        var unpixelateEffectImp = function(cur, end, rate) {
            if (cur < end)
                win.setTimeout(function() {
                    avMedia.captureSize = cur
                    unpixelateEffect(cur * 2, end, rate)
                }, rate)
            else
                avMedia.captureSize = end
        }
        unpixelateEffectImp(curo, endo, rateo)
    }

    var updateScale = function(wid) {
        scale = wid / captureSize // float
        setWH([origCanvas], captureSize);
        setWH([canvas], captureSize * scale);
    }
    var updateScaleFromWin = function() {
        updateScale(cameraRatio * window.document.body.clientHeight)
    }
    window.onresize = function() {
        updateScaleFromWin();
    }

    var audio = win.document.createElement('audio')
    audio.autoplay = false
    audio.loop = true
    audio.src = "loop2.ogg"
    audio.volume = 1.0
    audio.preload = true
    avMedia.audio = audio

    var element = win.document.createElement('video')
    var canvas = win.document.createElement('canvas')
    var origCanvas = win.document.createElement('canvas')
    var ctx = canvas.getContext('2d');
    var origCtx = origCanvas.getContext('2d');
    element.setAttribute('id', 'av-media')
    element.setAttribute('autoplay', '')
    win.document.body.style.margin = 0
    win.document.body.style.textAlign = 'center'
    win.document.body.style.backgroundColor = 'black'
    element.style.position = 'absolute'
    setWH = function(els, size) {
        els.forEach(function(el) {
            el.style.width = size + "px"
            el.style.height = getH(size) + "px"
            el.style.margin = "0"
            el.setAttribute('width', size)
            el.setAttribute('height', getH(size))
        })
    };
    origCanvas.style.display = 'none';
    setWH([element], 40);
    (function() {
        var shit = [canvas, element, origCanvas, audio]
        shit.map(function(el) {
            win.document.body.appendChild(el)
        })
    })();

    var rgbObjs = function(flat) {
        // To real array.
        var newAr = []
        for (var i = 0; i < flat.length; i++) {
            if ((i < flat.length - 3) && i % 4 === 0)
                newAr.push({
                    red: flat[i],
                    green: flat[i + 1],
                    blue: flat[i + 2],
                })
        }
        return newAr;
    }

    var domColor = function(pxl) {
        var fullColor = function(key) {
            pxl[key] = 255;
            return pxl
        }
        var fullColorOnly = function(key) {
            var ret = deadPixel()
            ret[key] = 255;
            return ret
        }
        var deadPixel = function() {
            return {
                red: 0,
                blue: 0,
                green: 0
            }
        }
        var mode = function(col) {
            return (Math.random() > 0.5) ? fullColor(col) : fullColorOnly(col)
        }
        // prefernce to red if all same
        if (pxl.red >= pxl.green && pxl.red >= pxl.blue)
            return mode(curColors[0])
        if (pxl.green > pxl.red && pxl.green > pxl.blue)
            return mode(curColors[1])
        if (pxl.blue > pxl.green && pxl.blue > pxl.red)
            return mode(curColors[2])
            // else
        return pxl;
    }

    var colorFillEffect = function(pxls) {
        return pxls.map(function(pxl) {
            return domColor(pxl);
        })
    }

    var drawImage = function(ctx, pxls) {
        pxls.forEach(function(pxl, i) {
            ctx.fillStyle = 'rgba(' +
                pxl.red + ',' +
                pxl.green + ',' +
                pxl.blue + ',255)';
            var x = i % captureSize;
            var y = Math.floor(i / captureSize)
            ctx.fillRect(Math.round(x * scale), Math.round(y * scale), scale, scale)
        })
    }

    avMedia.snap = function() {
        // Take a snapshot of the camera
        origCtx.drawImage(element, 0, 0, captureSize, getH(captureSize));
        avMedia.imageData = rgbObjs(origCtx.getImageData(0, 0, captureSize, getH(captureSize)).data)
        drawImage(ctx, colorFillEffect(avMedia.imageData))
        rotateColors()

    }
    Object.defineProperty(avMedia,
        'captureRate', {
            get: function() {
                return captureRate
            },
            set: function(newV) {
                captureRate = newV
                avMedia.stopCapture()
                avMedia.startCapture()
            }
        })

    avMedia.stopCapture = function() {}
    avMedia.startCapture = function() {
        var inv = win.setInterval(
            function() {
                avMedia.snap()
            },
            avMedia.captureRate)
        avMedia.stopCapture = function() {
            win.clearInterval(inv)
        }
    }

    var rotateColors = function() {
        newColors = []
        newColors[0] = curColors[1]
        newColors[1] = curColors[2]
        newColors[2] = curColors[0]
        curColors = newColors
    }

    Modernizr.prefixed('getUserMedia', win.navigator)(
        // constraints
        {
            video: true
        },
        // successCallback

        function(localMediaStream) {
            element.src = window.URL.createObjectURL(localMediaStream);
            element.onloadedmetadata = function(e) {
                // avMedia.snap();
                avMedia.startCapture();
                unpixelateEffect(1, captureSize, 1000);
                captureSize = 1
                win.setTimeout(function() {
                    audio.play()
                }, 5300)
            };
        }
    );

    updateScaleFromWin()
    win.avMedia = avMedia;
    avMedia.video = element;
    avMedia.snap()
    win.console.log('AVMEDIA help, type: "avMedia"')
    win.console.log(avMedia)
})(window)
