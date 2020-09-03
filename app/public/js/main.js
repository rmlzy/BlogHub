// 禁用双指缩放
document.documentElement.addEventListener(
  "touchstart",
  function (event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  false
);

// 禁用双击缩放
var lastTouchEnd = 0;
document.documentElement.addEventListener(
  "touchend",
  function (event) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

$("#js_showWechatBtn").on("click", function () {
  layer.open({
    type: 1,
    title: "请备注: BlogHub",
    skin: "layui-layer-rim",
    area: ["500px", "720px"],
    content: "<img style='width: 100%;' src='/public/img/wechat-qr.jpeg' />",
  });
});
