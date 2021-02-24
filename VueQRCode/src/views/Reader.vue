<template>
  <main class="reader">
    <h1>二维码 识别、读取、解码！(Vue.js版)</h1>
    <hr />

    <button class="sweep">
      <input type="file" @change="upload($event)" />
      扫一扫
    </button>
    <div class="imgurl">
      <img :src="imgurl" alt="当前识别的二维码" />
      <img :src="imgurl2" alt="当前识别的二维码" />
    </div>

    <textarea
      class="result"
      cols="76"
      rows="6"
      v-model="result"
      placeholder="二维码识别结果！"
    ></textarea>
  </main>
</template>

<script>
import jsQR from "jsqr";
import Jimp from "jimp";

export default {
  name: "Reader",
  data() {
    return {
      result: "https://github.com/MuGuiLin",
      imgurl: "https://raw.githubusercontent.com/MuGuiLin/QRCode/main/HtmlQRCode/img/github.com.png",
      imgurl2: "https://raw.githubusercontent.com/MuGuiLin/QRCode/main/HtmlQRCode/img/github.com.png",
    };
  },
  methods: {
    upload(e) {
      const file = e.target.files[0];
      const createObjectURL =
        window.createObjectURL ||
        window.URL.createObjectURL ||
        window.webkitURL.createObjectUR;
      this.result = "";
      this.imgurl = createObjectURL(file);

      const fReader = new FileReader();
      fReader.readAsDataURL(file); // Base64 8Bit字节码
      // fReader.readAsBinaryString(file);  // Binary 原始二进制
      // fReader.readAsArrayBuffer(file);   // ArrayBuffer 文件流
      fReader.onload = (e) => {
        this.imgurl2 = e.target.result;
        e.target.result &&
          Jimp.read(e.target.result)
            .then(async (res) => {
              const { data, width, height } = res.bitmap;
              try {
                const resolve = await jsQR(data, width, height);
                this.result = resolve.data;
                console.info("识别结果：", resolve.data);
              } catch (err) {
                this.result = "识别失败，请检查二维码是否正确！";
                console.error("识别失败，请检查二维码是否正确！", err);
              } finally {
                console.info("读取到的文件：", res);
              }
            })
            .catch((err) => {
              console.error("文件读取错误：", err);
            });
      };
    },
  },
};
</script>

<style lang="less">
.reader {
  font-size: 16px;
  .sweep {
    position: relative;
    margin: 20px;
    padding: 12px;
    width: 300px;
    font-size: 18px;
    cursor: pointer;
    color: white;
    background: #42b983;
    border: 1px solid #42b983;
    overflow: hidden;
    input {
      position: absolute;
      font-size: 100px;
      opacity: 0;
    }
  }
  .imgurl {
    margin: 20px;
    text-align: center;
    img {
      margin: 20px;
      padding: 10px;
      border: 1px solid gray;
      border-radius: 8px;
      width: 280px;
      height: 260px;
    }
  }
  .result {
    box-sizing: border-box;
    padding: 10px;
    border: 1px solid gray;
    border-radius: 8px;
    font-size: 16px;
  }
}
</style>