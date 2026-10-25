(function (window, document, name) {
  const pixelId = String(window.ROCKSTAR_TIKTOK_PIXEL_ID || "").trim();
  if (!pixelId || /YOUR_/i.test(pixelId)) return;

  const ttq = (window[name] = window[name] || []);
  ttq.methods = [
    "page", "track", "identify", "instances", "debug", "on", "off", "once",
    "ready", "alias", "group", "enableCookie", "disableCookie",
  ];
  ttq.setAndDefer = function (target, method) {
    target[method] = function () {
      target.push([target].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
  ttq.instance = function (id) {
    const instance = ttq._i[id] || [];
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(instance, ttq.methods[i]);
    return instance;
  };
  ttq.load = function (id, options) {
    const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[id] = [];
    ttq._i[id]._u = url;
    ttq._t = ttq._t || {};
    ttq._t[id] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[id] = options || {};
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = url + "?sdkid=" + id + "&lib=" + name;
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  };
  ttq.load(pixelId);
  ttq.page();
})(window, document, "ttq");
