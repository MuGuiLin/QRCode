class QrCodeRecognition {
    constructor(opts = {}) {
        this.timer = null;
        this.result = "";
        this.isAnimation = true;
        this.lineWidth = opts.borderWidth || 3;
        this.strokeStyle = opts.lineColor || 'red';
        this.audio = new Audio(opts.audio || './js/tone.mp3');
        this.video = document.createElement('video');
        this.cvsele = document.querySelector(opts.id);
        this.canvas = this.cvsele.getContext('2d');
        this.seuccess = opts.seuccess || Function;
        this.error = opts.error || Function;
    };

    draw(begin, end) {
        this.canvas.beginPath();
        this.canvas.moveTo(begin.x, begin.y);
        this.canvas.lineTo(end.x, end.y);
        this.canvas.lineWidth = this.lineWidth;
        this.canvas.strokeStyle = this.strokeStyle;
        this.canvas.stroke();
    };

    sweep() {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            const { videoWidth, videoHeight } = this.video;
            this.cvsele.width = videoWidth;
            this.cvsele.height = videoHeight;
            this.canvas.drawImage(this.video, 0, 0, videoWidth, videoHeight);
            try {
                const img = this.canvas.getImageData(0, 0, videoWidth, videoHeight);
                document.querySelector('#imgurl').src = img;
                const obj = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
                if (obj) {
                    const loc = obj.location;
                    this.draw(loc.topLeftCorner, loc.topRightCorner);
                    this.draw(loc.topRightCorner, loc.bottomRightCorner);
                    this.draw(loc.bottomRightCorner, loc.bottomLeftCorner);
                    this.draw(loc.bottomLeftCorner, loc.topLeftCorner);
                    if (this.result != obj.data) {
                        this.audio.play();
                        this.seuccess(obj);
                        this.isAnimation = false;
                        cancelAnimationFrame(this.timer);
                        console.info("识别结果：", obj.data);
                        setTimeout(() => {
                            this.cvsele.style.display = "none";
                        }, 1000);
                    }
                } else {
                    this.error("识别失败，请检查二维码是否正确！");
                    console.error("识别失败，请检查二维码是否正确！");
                }
            } catch (err) {
                this.error(err);
                console.error("识别失败，请检查二维码是否正确！", err);
            };
        };
        if (this.isAnimation) {
            this.timer = requestAnimationFrame(() => {
                this.sweep();
            });
        }
    };

    upload() {
        const ele = document.querySelector('#file');
        const file = ele.files[0];
        const createObjectURL = window.createObjectURL || window.URL.createObjectURL || window.webkitURL.createObjectUR;
        document.querySelector('#result').value = '';

        const fReader = new FileReader();
        fReader.readAsDataURL(file); // Base64 8Bit字节码
        // fReader.readAsBinaryString(file);  // Binary 原始二进制
        // fReader.readAsArrayBuffer(file);   // ArrayBuffer 文件流
        fReader.onload = (e) => {
            document.querySelector('#imgurl').src = e.target.result || createObjectURL(file);
            e.target.result && Jimp.read(e.target.result).then(async (res) => {
                const { data, width, height } = res.bitmap;
                try {
                    const resolve = await jsQR(data, width, height);
                    this.audio.play();
                    this.seuccess(resolve);
                    console.info("识别结果：", resolve.data);
                } catch (err) {
                    this.error("识别失败，请检查二维码是否正确！");
                    console.error("识别失败，请检查二维码是否正确！", err);
                } finally {
                    console.info("读取到的文件：", res);
                }
            }).catch((err) => {
                this.error("文件读取错误：", err);
                console.error("文件读取错误：", err);
            });
        };
    };

    init() {
        this.isAnimation = true;
        this.cvsele.style.display = "block";
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            }).then(stream => {
                this.video.srcObject = stream;
                this.video.setAttribute('playsinline', true);
                this.video.setAttribute('webkit-playsinline', true);
                this.video.addEventListener('loadedmetadata', () => {
                    this.video.play();
                    this.sweep();
                });
            }).catch(error => {
                console.error(error.name + "：" + error.message + "，" + error.constraint);
            });
        } else if (navigator.getUserMedia) {
            navigator.getUserMedia({
                video: { facingMode: "environment" }
            }, (stream) => {
                this.video.srcObject = stream;
                this.video.setAttribute('playsinline', true);
                this.video.setAttribute('webkit-playsinline', true);
                this.video.addEventListener('loadedmetadata', () => {
                    this.video.play();
                    this.sweep();
                });
            }, (error) => {
                console.error(error.name + "：" + error.message + "，" + error.constraint);
            });
        } else {
            if (navigator.userAgent.toLowerCase().match(/chrome/) && location.origin.indexOf('https://') < 0) {
                console.error('获取浏览器录音功能，因安全性问题，需要在localhost 或 127.0.0.1 或 https 下才能获取权限！');
            } else {
                alert('对不起：未识别到扫描设备!');
            }
        };
    }
};