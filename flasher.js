(function(win) {
    var target = win.document
    var body = win.document.body
    var flasherEl = target.createElement('div')
    flasherEl.setAttribute('id', 'flasher')
    body.appendChild(flasherEl)

    var flasher = {}
    var funcs = {}
    flasher.funcs = funcs
    var settings = {}
    flasher.settings = settings
    var flashRate = 60
    Object.defineProperty(settings,
        'msFlashRate', {
            get: function() {
                return flashRate
            },
            set: function(newV) {
                flashRate = newV
                flasher.stop()
                flasher.start()
            }
        })

    funcs.nextCol = function(col) {
        switch (col) {
            case 'red':
                return 'green'
            case 'green':
                return 'blue'
            case 'blue':
                return 'red'
        }
    }
    funcs.setWH = function(el) {
        el.style.width = "100%"
        el.style.height = "100%"
        el.style.margin = "0"
    }
    var curColor = "red"
    funcs.start = function(func) {
        var flashingIntv = win.setInterval(func, settings.msFlashRate)
        return function() {
                win.clearTimeout(flashingIntv)
            };
    }
    funcs.changeColor = function() {
        curColor = funcs.nextCol(curColor)
        flasherEl.style.backgroundColor = curColor
    }
    // will get overriden when started.
    flasher.stop = function() {}
    flasher.start = function() {
        flasher.stop = flasher.funcs.start(flasher.funcs.changeColor)
    }

    var ar = ([target.documentElement, body, flasherEl])
    ar.map(funcs.setWH)
    win.flasher = flasher

    settings.msFlashRate = 17;
    win.console.log('FLASHER help, type: "flasher"')
    win.console.log(flasher)
})(window)
