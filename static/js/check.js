/**
 * ���js�Ƿ���سɹ�
 * ͨ���ж�js�еķ���
 */
$(function() {
    // ����Ƿ�ΪIE�����
    function isIE() {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return true;
        } else {
            return false;
        }
    }
    if (isIE()) {
        $('.show-browser').html('��վϵͳ��IE����������Խϵͣ����ֹ�����IE��������޷�����ʹ�ã����������������������').addClass('with-padding');
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
        message += "        main.120724.js  load fail;�뽫���������ȫ����Խ��������β���ȡ����";
    }
    try {
        if (typeof (eval(show_login))=="function") {
        }

    } catch (e) {
        message += "        jjlogin.js load fail;�뽫���������ȫ����Խ��������β���ȡ����";
    }
    var url = window.location.href;
    var str = /onebook|onebook_vip/;
    var loginStr = /login\.php/;
    if (str.test(url)&&!loginStr.test(url)) {
        try {
            if (typeof (eval(reply_submit))=="function") {
            }

        } catch (e) {
            message += "      onebook.120711.js load fail;�뽫���������ȫ����Խ��������β���ȡ����";
        }
    }
    //IE 8���¸�һ���������ʾ ie8�����²�֧�� addEventListener���������ж��Ƿ���ie8
    if (window.attachEvent && !window.addEventListener) {
        message += '����������汾���ͣ���վ���ֹ��ܿ����޷�ʹ�ã����VIP�½ڿ��ܳ������룬����������������и��£���ʹ�ü���ģʽ��';
    }
    return message;
}




