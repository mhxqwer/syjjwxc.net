/**
 * 检测js是否加载成功
 * 通过判断js中的方法
 */
$(function() {
    // 检测是否为IE浏览器
    function isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return true;
        } else {
            return false;
        }
    }
    if (isIE()) {
        $('.show-browser').html('网站系统与IE浏览器适配性较低，部分功能在IE浏览器中无法正常使用，建议您更换其他浏览器。').addClass('with-padding');
        document.body.style.backgroundPositionY = '-435px';
    }

    var message = __check_js_function();
    $("#checkJs").html(message);

})
function __check_js_function() {
    var message = '';
    try {
        if (typeof (eval(showTime))=="function") {
        }

    } catch (e) {
        message += "        main.120724.js  load fail;请将浏览器、安全软件对晋江的屏蔽策略取消。";
    }
    try {
        if (typeof (eval(show_login))=="function") {
        }

    } catch (e) {
        message += "        jjlogin.js load fail;请将浏览器、安全软件对晋江的屏蔽策略取消。";
    }
    var url = window.location.href;
    var str = /onebook|onebook_vip/;
    var loginStr = /login\.php/;
    if (str.test(url)&&!loginStr.test(url)) {
        try {
            if (typeof (eval(reply_submit))=="function") {
            }

        } catch (e) {
            message += "      onebook.120711.js load fail;请将浏览器、安全软件对晋江的屏蔽策略取消。";
        }
    }
    //IE 8以下给一个浏览器提示 ie8及以下不支持 addEventListener可以用来判断是否是ie8
    if (window.attachEvent && !window.addEventListener) {
        message += '您的浏览器版本过低，网站部分功能可能无法使用，浏览VIP章节可能出现乱码，建议您对浏览器进行更新，或使用极速模式。';
    }
    return message;
}




