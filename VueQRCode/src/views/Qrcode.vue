<template>
  <main class="qrcode">
    <h1>二维码 生成、渲染！(Vue.js版)</h1>
    <hr />

    <div class="form">
      <input
        type="text"
        v-model="text"
        placeholder="请在这里输入要生成的内容！"
      />
      <button>
        <a
          :href="href"
          target="_blank"
          download="下载的二维码"
          rel="noopener noreferrer"
        >
          下载二维码</a
        >
      </button>
    </div>

    <div class="code" ref="code">
      <vue-qr
        qid="qrid"
        :text="text"
        :size="size"
        :bgSrc="bgSrc"
        :logoSrc="logoSrc"
        :callback="callBack"
        :logoScale="logoScale"
        :colorDark="colorDark"
        :colorLight="colorLight"
        :backgroundColor="backgroundColor"
      ></vue-qr>
    </div>
  </main>
</template>

<script>
// https://www.npmjs.com/package/vue-qr
import VueQr from "vue-qr";

export default {
  name: "Qrcode",
  components: {
    VueQr,
  },
  data() {
    return {
      href: "",
      text: "https://github.com/MuGuiLin",  // 二维码内容
      size: 360,                            // 二维码宽高尺寸, 长宽一致, 包含外边距
      bgSrc: "",                            // 嵌入背景图地址，
      logoSrc: "https://raw.githubusercontent.com/MuGuiLin/QRCode/master/VueQRCode/src/assets/logo.png", // 嵌入至二维码中心的 LOGO 地址
      margin: 0,                            // 二维码图像的外边距, 默认20px
      colorDark: "blue",                    // 实点的颜色
      colorLight: "#42B983",                // 空白区的颜色
      backgroundColor: "#EEE",              // 背景色
      logoScale: 0.15,                      // 中间图的尺寸，不要设太大，太大会导致扫码失败的 默认0.2
      dotScale: 0.35,                       // 数据区域点缩小比例,默认为0.35
    };
  },
  methods: {
    callBack(base64, pid) {
      // 生成的二维码 Data URI 可以在回调中取得,第一个参数为二维码 data URL, 第二个参数为 props 传过来的 qid(因为二维码生成是异步的,所以加个 id 用于排序)
      this.href = base64;
      console.log(base64, pid);
    },
  },
};
</script>

<style lang="less">
.qrcode {
  .form {
    margin: 30px;
    input {
      padding: 0 10px;
      width: 360px;
      height: 46px;
      font-size: 18px;
    }
    button {
      width: 150px;
      height: 50px;
      font-size: 18px;
      vertical-align: top;
      background: #42b983;
      border: 1px solid #767676;
      border-left: none;
      a {
        color: white;
        text-decoration: none;
      }
    }
  }
  .code {
    margin: auto;
    padding: 8px;
    width: 360px;
    height: 360px;
    border-radius: 8px;
    border: 2px solid gray;
  }
}
</style>
