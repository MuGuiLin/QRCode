; (function (window, QrCodeRecognition) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define(QrCodeRecognition());
    } else if (typeof exports === "object") {
        module.exports = QrCodeRecognition();
    } else {
        window.QrCodeRecognition = QrCodeRecognition();
    }
}(typeof window !== "undefined" ? window : this, () => {
    "use strict";

    return class QrCodeRecognition {
        constructor(opts = {}) {
            this.timer = null;
            this.stream = null;
            this.result = "";
            this.isAnimation = false;
            this.isTorchOn = false;
            this.cameraFacingMode = "environment";
            this.lineWidth = opts.borderWidth || 4;
            this.strokeStyle = opts.lineColor || "#13c2c2";
            this.audio = new Audio(opts.audio || "./js/tone.mp3");
            this.video = document.createElement("video");
            this.file = document.querySelector(opts.uploadId);
            this.cvsele = document.querySelector(opts.sweepId);
            this.canvas = this.cvsele.getContext("2d");
            this.layer = document.querySelector(opts.layerId);
            this.preview = document.querySelector(opts.previewId || "#imgurl");
            this.closeButton = document.querySelector(opts.closeId);
            this.torchButton = document.querySelector(opts.torchId);
            this.switchButton = document.querySelector(opts.switchId);
            this.seuccess = opts.seuccess || Function;
            this.error = opts.error || Function;
            this.status = opts.status || Function;

            this.video.muted = true;
            this.video.setAttribute("playsinline", true);
            this.video.setAttribute("webkit-playsinline", true);

            if (this.closeButton) {
                this.closeButton.addEventListener("click", () => this.cance());
            }

            if (this.torchButton) {
                this.torchButton.addEventListener("click", () => this.toggleTorch());
            }

            if (this.switchButton) {
                this.switchButton.addEventListener("click", () => this.switchCamera());
            }

            this.refreshCameraTools();
        }

        setStatus(text) {
            this.status(text);
        }

        playTone() {
            const promise = this.audio.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(() => {});
            }
        }

        getVideoTrack() {
            if (!this.stream) {
                return null;
            }

            return this.stream.getVideoTracks()[0] || null;
        }

        hasLiveStream() {
            const track = this.getVideoTrack();
            return Boolean(track && track.readyState === "live");
        }

        setStreamEnabled(enabled) {
            if (!this.stream) {
                return;
            }

            this.stream.getTracks().forEach(track => {
                track.enabled = enabled;
            });
        }

        async getCameraStream() {
            if (this.hasLiveStream()) {
                this.setStreamEnabled(true);
                this.video.srcObject = this.stream;
                return this.stream;
            }

            const constraints = {
                audio: false,
                video: {
                    facingMode: { ideal: this.cameraFacingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.isTorchOn = false;
            this.refreshCameraTools();
            return this.stream;
        }

        draw(begin, end) {
            this.canvas.beginPath();
            this.canvas.moveTo(begin.x, begin.y);
            this.canvas.lineTo(end.x, end.y);
            this.canvas.lineWidth = this.lineWidth;
            this.canvas.strokeStyle = this.strokeStyle;
            this.canvas.stroke();
        }

        drawCodeBorder(location) {
            this.draw(location.topLeftCorner, location.topRightCorner);
            this.draw(location.topRightCorner, location.bottomRightCorner);
            this.draw(location.bottomRightCorner, location.bottomLeftCorner);
            this.draw(location.bottomLeftCorner, location.topLeftCorner);
        }

        releaseStream() {
            if (!this.stream) {
                return;
            }

            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.video.srcObject = null;
            this.isTorchOn = false;
            this.refreshCameraTools();
        }

        cance() {
            this.isAnimation = false;
            cancelAnimationFrame(this.timer);
            this.timer = null;
            if (this.isTorchOn) {
                this.setTorchState(false);
            }
            this.setStreamEnabled(false);

            if (this.layer) {
                this.layer.classList.remove("is-open");
            }

            this.cvsele.style.display = "none";
            this.setStatus("");
        }

        destroy() {
            this.cance();
            this.releaseStream();
        }

        untie() {
            if (!this.isAnimation) {
                return;
            }

            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                const { videoWidth, videoHeight } = this.video;
                this.cvsele.width = videoWidth;
                this.cvsele.height = videoHeight;
                this.canvas.drawImage(this.video, 0, 0, videoWidth, videoHeight);

                const img = this.canvas.getImageData(0, 0, videoWidth, videoHeight);
                const code = jsQR(img.data, img.width, img.height, {
                    inversionAttempts: "attemptBoth"
                });

                if (code) {
                    this.drawCodeBorder(code.location);

                    if (this.result !== code.data) {
                        this.result = code.data;
                        this.playTone();
                        this.cance();
                        this.seuccess(code);
                    }

                    return;
                }
            }

            this.timer = requestAnimationFrame(() => this.untie());
        }

        async sweep() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.error("当前浏览器不支持摄像头扫描，请使用图片上传识别。");
                return;
            }

            this.isAnimation = false;
            cancelAnimationFrame(this.timer);
            this.result = "";
            this.cvsele.style.display = "block";

            if (this.layer) {
                this.layer.classList.add("is-open");
            }

            this.setStatus(this.hasLiveStream() ? "正在恢复摄像头..." : "正在打开摄像头...");

            try {
                await this.getCameraStream();
                await this.video.play();
                this.isAnimation = true;
                this.setStatus("请将二维码放入取景框内！");
                this.refreshCameraTools();
                this.untie();
            } catch (err) {
                this.cance();

                if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
                    this.error("摄像头需要在 localhost 或 127.0.0.1 或部署的 Apache、Nginx、IIS等Web服务器环境下使用。");
                    return;
                }

                this.error("无法打开摄像头，请检查浏览器权限或设备是否可用。");
            }
        }

        async toggleTorch() {
            await this.setTorchState(!this.isTorchOn, true);
        }

        async setTorchState(enabled, showStatus = false) {
            const track = this.getVideoTrack();
            if (!track || typeof track.getCapabilities !== "function") {
                if (showStatus) {
                    this.setStatus("当前设备不支持闪光灯。");
                }
                return;
            }

            const capabilities = track.getCapabilities();
            if (!capabilities.torch) {
                if (showStatus) {
                    this.setStatus("当前摄像头不支持闪光灯。");
                }
                return;
            }

            try {
                await track.applyConstraints({
                    advanced: [{ torch: enabled }]
                });
                this.isTorchOn = enabled;
                this.refreshCameraTools();
                if (showStatus) {
                    this.setStatus(this.isTorchOn ? "闪光灯已开启" : "闪光灯已关闭");
                }
            } catch (err) {
                this.isTorchOn = false;
                this.refreshCameraTools();
                if (showStatus) {
                    this.setStatus("闪光灯切换失败，请检查设备是否支持。");
                }
            }
        }

        async switchCamera() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.error("当前浏览器不支持摄像头切换。");
                return;
            }

            const wasScanning = this.isAnimation;
            this.isAnimation = false;
            cancelAnimationFrame(this.timer);
            this.setStatus("正在切换摄像头...");
            this.releaseStream();
            this.cameraFacingMode = this.cameraFacingMode === "environment" ? "user" : "environment";

            try {
                await this.getCameraStream();
                await this.video.play();
                this.setStatus(this.cameraFacingMode === "environment" ? "已切换到后置摄像头" : "已切换到前置摄像头");

                if (wasScanning || (this.layer && this.layer.classList.contains("is-open"))) {
                    this.isAnimation = true;
                    this.untie();
                }
            } catch (err) {
                this.cameraFacingMode = this.cameraFacingMode === "environment" ? "user" : "environment";
                this.error("摄像头切换失败，请检查设备是否有多个摄像头。");
            } finally {
                this.refreshCameraTools();
            }
        }

        refreshCameraTools() {
            const track = this.getVideoTrack();
            const hasTrack = Boolean(track && track.readyState === "live");
            const hasTorch = hasTrack && typeof track.getCapabilities === "function" && Boolean(track.getCapabilities().torch);

            if (this.torchButton) {
                this.torchButton.disabled = !hasTorch;
                this.torchButton.textContent = this.isTorchOn ? "关闭闪光灯" : "开启闪光灯";
                this.torchButton.title = hasTorch ? "" : "当前摄像头不支持闪光灯";
            }

            if (this.switchButton) {
                this.switchButton.disabled = !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia;
                this.switchButton.textContent = this.cameraFacingMode === "environment" ? "切换前置" : "切换后置";
            }
        }

        upload() {
            this.cance();

            const file = this.file && this.file.files ? this.file.files[0] : null;
            if (!file) {
                this.error("请先选择一张二维码图片。");
                return;
            }

            if (!file.type || !file.type.startsWith("image/")) {
                this.error("请选择图片文件进行识别。");
                return;
            }

            const fReader = new FileReader();
            fReader.readAsDataURL(file);

            fReader.onload = (e) => {
                const dataUrl = e.target.result;
                if (this.preview) {
                    this.preview.src = dataUrl;
                }

                Jimp.read(dataUrl).then((res) => {
                    const { data, width, height } = res.bitmap;
                    const code = jsQR(data, width, height, {
                        inversionAttempts: "attemptBoth"
                    });

                    if (!code) {
                        this.error("没有识别到二维码，请换一张更清晰的图片。");
                        return;
                    }

                    this.result = code.data;
                    this.playTone();
                    this.seuccess(code);
                }).catch(() => {
                    this.error("图片读取失败，请重新选择一张二维码图片。");
                });
            };

            fReader.onerror = () => {
                this.error("图片读取失败，请重新选择。");
            };
        }
    };
}));
