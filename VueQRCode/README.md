# QRCode

> 🌟 纯 Web 前端实现的二维码解决方案（HTML / Vue.js）
>
> **核心功能**：动态生成 | 实时扫描 | 图片识别解析 | 跨平台支持

[🚀 在线演示 Demo](https://muguilin.github.io/QRcode) | [📂 GitHub 仓库](https://github.com/MuGuiLin/QRCode)

---

## ✨ 项目简介

本项目是一个轻量级、无依赖的纯前端二维码工具库，提供 **HTML 原生版** 和 **Vue 版**（兼容 Vue2 & Vue3）两种实现方式。

### 🚀 核心优势

- **零依赖环境**：完全独立运行，不依赖微信 JS-SDK、无需微信授权，摆脱特定平台限制。
- **全功能覆盖**：
  - 📝 **二维码生成**：支持文本/链接转二维码，实时动态渲染。
  - 📷 **扫码识别**：调用摄像头实时扫描解码。
  - 🖼️ **相册解析**：支持从本地相册选择图片进行二维码识别。
- **多端兼容**：完美适配 PC 端浏览器及移动端（iOS/Android）H5 页面。

---

## 📸 效果预览

### 1. 二维码生成
将任意文本或 URL 快速转换为二维码图像。
![二维码生成效果](http://demo.muguilin.com/qrcode/create-qrcode.png)

### 2. 图片识别解析
上传包含二维码的图片，自动解析其中内容。
![二维码识别效果](http://demo.muguilin.com/qrcode/qrcode-qrcode.png)

### 3. 实时扫码
调用设备摄像头，实时捕获并解析二维码。
![二维码扫描效果](http://demo.muguilin.com/qrcode/scan-qrcode.png)

---

## 🛠️ 技术栈

- **基础版本**：HTML5 + JavaScript (ES6+)
- **框架版本**：Vue.js 2.x / Vue.js 3.x
- **核心算法**：基于纯前端解码库（如 jsQR / qrcode-reader 等，*注：可根据实际使用的库补充具体名称*）

---

## 📦 快速开始

*(此处建议补充简单的安装或使用代码片段，例如：)*

### HTML 版本
```html
<!-- 引入脚本 -->
<script src="./qrcode.min.js"></script>
<!-- 使用示例 -->
<div id="qrcode"></div>