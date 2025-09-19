
    (function() {
        window._smReadyFuncs = [];
        window.SMSdk = {
            ready: function(fn) {
                fn&&_smReadyFuncs.push(fn);
            }
        };
        window._smConf = {
            organization: 'E9kUZWhov0uih0OKfOb6',
            staticHost: 'static.portal101.cn'
        }
        var url = (function() {
            var originHost = "static2.fengkongcloud.com";
            var isHttps = 'https:'===document.location.protocol;
            var protocol = isHttps ? 'https://' : 'http://';
            var fpJsPath = '/fpv2.js';
            var url = protocol+_smConf.staticHost+fpJsPath;
            var ua = navigator.userAgent.toLowerCase();
            var isWinXP = /windows\s(?:nt\s5.1)|(?:xp)/.test(ua);
            var isLowIE = /msie\s[678]\.0/.test(ua);
            if (isHttps&&isWinXP&&isLowIE) {
                url = protocol+originHost+fpJsPath;
            }
            return url;
        })();
        var sm = document.createElement("script");
        var s = document.getElementsByTagName("script")[0];
        sm.src = url;
        s.parentNode.insertBefore(sm, s);

    })();
    $(document).ready(function() {
        var timesRun = 0;
        var interval = setInterval(function() {
            timesRun += 1;
            if (typeof SMSdk === 'object' && SMSdk !== null) {
                dealSmDeviceId(function(deviceId) {
                    if ($("input[type='hidden'][name='shumeideviceId']").length==0) {
                        $("body").append("<input type='hidden' name='shumeideviceId'  id='shumeideviceId' value=''/>");
                    }
                    $("input[type='hidden'][name='shumeideviceId']").val(deviceId);
                    if (deviceId&& typeof jjCookie=="object") {
                        jjCookie.set('shumeideviceId', deviceId, true);
                    }
                });
                clearInterval(interval)
            }
            if (timesRun>=30) {
                clearInterval(interval);
            }
        }, 1000)

    })
    function dealSmDeviceId(cb) {
        var smTimeoutTime = 1000;

        var smDeviceId = "";
        var smDeviceIdReady = false;
        var smTimer = setTimeout(function() {
            smDeviceId = SMSdk.getDeviceId ? SMSdk.getDeviceId() : smDeviceId;
            if (!smDeviceIdReady) {
                smDeviceIdReady = true;
                cb&&cb(smDeviceId);
            }
        }, smTimeoutTime);
        SMSdk.ready(function() {
            smDeviceId = SMSdk.getDeviceId ? SMSdk.getDeviceId() : smDeviceId;
            clearTimeout(smTimer);
            if (!smDeviceIdReady) {
                smDeviceIdReady = true;
                cb&&cb(smDeviceId);
            }
        });
    }

