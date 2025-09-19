/**
 * �������봦��js
 *
 *
 */
Array.prototype.indexOf = function(obj, start) {
    for (var i = (start||0), j = this.length; i<j; i++) {
        if (this[i]==obj) {
            return i;
        }
    }
    return -1;
}


function getUrlHttp() {
//    var host = window.location.protocol;
    var host = location.href;
    if (host.indexOf("https://")>=0) {
        var urlhttp = "https";
    } else {
        var urlhttp = "http";
    }
    return urlhttp;
}
if (!httpProtocol) {
    var httpProtocol = getUrlHttp();
}

function utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i<len; i++) {
        c = str.charCodeAt(i);
        if ((c>=0x0001)&&(c<=0x007F)) {
            out += str.charAt(i);
        } else if (c>0x07FF) {
            out += String.fromCharCode(0xE0|((c>>12)&0x0F));
            out += String.fromCharCode(0x80|((c>>6)&0x3F));
            out += String.fromCharCode(0x80|((c>>0)&0x3F));
        } else {
            out += String.fromCharCode(0xC0|((c>>6)&0x1F));
            out += String.fromCharCode(0x80|((c>>0)&0x3F));
        }
    }
    return out;
}

function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;
    out = "";
    len = str.length;
    i = 0;
    while (i<len) {
        c = str.charCodeAt(i++);
        switch (c>>4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += str.charAt(i-1);
                break;
            case 12:
            case 13:
                // 110x xxxx    10xx xxxx
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c&0x1F)<<6)|(char2&0x3F));
                break;
            case 14:
                // 1110 xxxx   10xx xxxx   10xx xxxx
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c&0x0F)<<12)|
                        ((char2&0x3F)<<6)|
                        ((char3&0x3F)<<0));
                break;
        }
    }

    return out;
}

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64DecodeChars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

function encode64(str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i<len) {
        c1 = str.charCodeAt(i++)&0xff;
        if (i==len) {
            out += base64EncodeChars.charAt(c1>>2);
            out += base64EncodeChars.charAt((c1&0x3)<<4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i==len) {
            out += base64EncodeChars.charAt(c1>>2);
            out += base64EncodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));
            out += base64EncodeChars.charAt((c2&0xF)<<2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1>>2);
        out += base64EncodeChars.charAt(((c1&0x3)<<4)|((c2&0xF0)>>4));
        out += base64EncodeChars.charAt(((c2&0xF)<<2)|((c3&0xC0)>>6));
        out += base64EncodeChars.charAt(c3&0x3F);
    }
    return out;
}

function decode64(str) {
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i<len) {
        do {
            c1 = base64DecodeChars[str.charCodeAt(i++)&0xff];
        } while (i<len&&c1== -1);
        if (c1== -1)
            break;
        do {
            c2 = base64DecodeChars[str.charCodeAt(i++)&0xff];
        } while (i<len&&c2== -1);
        if (c2== -1)
            break;
        out += String.fromCharCode((c1<<2)|((c2&0x30)>>4));
        do {
            c3 = str.charCodeAt(i++)&0xff;
            if (c3==61)
                return out;
            c3 = base64DecodeChars[c3];
        } while (i<len&&c3== -1);
        if (c3== -1)
            break;
        out += String.fromCharCode(((c2&0XF)<<4)|((c3&0x3C)>>2));
        do {
            c4 = str.charCodeAt(i++)&0xff;
            if (c4==61)
                return out;
            c4 = base64DecodeChars[c4];
        } while (i<len&&c4== -1);
        if (c4== -1)
            break;
        out += String.fromCharCode(((c3&0x03)<<6)|c4);
    }
    return out;
}

//input base64 encode
function strdecode(str) {
    return utf8to16(decode64(str));
}

function getCookie(name) {
    var cookies = '';
    var dc = document.cookie;
    var prefix = name+"=";
    var begin = dc.indexOf("; "+prefix);
    if (begin== -1) {
        begin = dc.indexOf(prefix);
        if (begin!=0)
            cookies = null;
    } else {
        begin += 2;
    }
    var end = document.cookie.indexOf(";", begin);
    if (end== -1) {
        end = dc.length;
    }
    if (cookies!=null) {
        cookies = unescape(dc.substring(begin+prefix.length, end));
    }
    if (cookies==null&&name!='token'&&name!='managertoken') {
        var tokenKey = ['readerid', 'ubuntu', 'ptid', 'email', 'authorid', 'cookietime', 'islocaluser', 'authorname', 'newwindow', 'showname', 'examineright', 'logintype', 'certification', 'userclosecomment',"shareweibo", 'commentfilterversion_key']; //xwb
        var managerKey = ['managerid', 'managertoken', 'moderatorName', 'isAdmin', 'managername', 'loginSource','commentSearch'];
        if (tokenKey.indexOf(name)> -1) {
            var token = getCookie('token');
            var index = tokenKey.indexOf(name);
            if (token!=null) {
                token = strdecode(token);
                token = token.split('|');
                return token[index];
            }
        } else if (managerKey.indexOf(name)> -1) {
            var token = getCookie('managertoken');
            var index = managerKey.indexOf(name);
            if (token!=null) {
                token = strdecode(token);
                token = token.split('|');
                return token[index];
            }
        }
        return null;
    }
    return cookies;
}


// COOKIE���Ƶļ�������
function setCookie(name, value, expires, path, domain, secure) {
    document.cookie = name+"="+escape(value)+
            ((expires) ? "; expires="+expires.toGMTString() : "")+
            ((path) ? "; path="+path : "")+
            ((domain) ? "; domain="+domain : "")+
            ((secure) ? "; secure" : "");
}

if (typeof JSON=='undefined') {
    document.write('<script src="//static.jjwxc.net/scripts/lib/json3.min.js"><\/script>');
}
var jjCookie = {
    everkey: 'JJEVER',
    sesskey: 'JJSESS',
    cookies: {},
    get: function(key, ever, domain) {
        if (typeof ever=='undefined') {
            ever = false
        }
        var allcookies = this.getAllCookies(ever);
        if (typeof allcookies[key]=='undefined') {
            var value = getCookie(key)
            if (value!=null) {
                if (typeof domain=='undefined') {
                    domain = '';
                }
                if (value!=null) {
                    this.set(key, value, ever, domain);
                    return value;
                }
            }
        }
        return allcookies[key];
    },
    set: function(key, value, ever, domain) {
        if (typeof ever=='undefined') {
            ever = false
        }
        if (typeof domain=='undefined'||domain=='') {
            domain = window.location.hostname
            var domainArr = domain.split('.');
            domainArr = domainArr.slice(domainArr.length-2, domainArr.length)
            domain = '.'+(domainArr.join('.'))
        }
        var cookiekey = this.getCookieKey(ever);
        this.getAllCookies(ever);
        this.cookies[cookiekey][key] = value
        var cookievalue = JSON.stringify(this.cookies[cookiekey]);
        if (ever) {
            var expire = new Date();
            expire.setTime(expire.getTime()+365*86400*1000);//����cookie���ó�һ�����
        } else {
            var expire = 0;
        }
        setCookie(cookiekey, cookievalue, expire, '/', domain);
        var expire = new Date();
        expire.setTime(0)
        setCookie(key, '', expire, '/', domain);
    },
    getAllCookies: function(ever) {
        var cookiekey = this.getCookieKey(ever);
        if (typeof this.cookies[cookiekey]=='undefined') {
            var cookievalue = getCookie(cookiekey);
            if (cookievalue!=null) {
                this.cookies[cookiekey] = $.parseJSON(cookievalue);
            } else {
                this.cookies[cookiekey] = {};
            }
        }
        return this.cookies[cookiekey];
    },
    getCookieKey: function(ever) {
        return ever ? this.everkey : this.sesskey;
    },
    clearKey: function(ever){
        var key = this.getCookieKey(ever)
        delete this.cookies[key]
    }
};


$(function() {
    $('#sdo_login').click(show_sdo_login_block);
    $(document).on('click', '#jj_login', function(e) {
        e.preventDefault();
        show_login();
    });
//	$('#sdo_login2').click(show_sdo_login_block);
});
var captchabaseurl = "//my.jjwxc.net/include/checkImage.php?random=";

//���µ�����֤��
function getauthnum() {
    $('#login_auth_num img').attr('src', captchabaseurl+Math.random())
    $('#login_auth_num input').val('');
}

function showauthnum() {
    $('#login_info_remove #login_auth_num').show();
    $('#login_auth_num').show();
    $('#login_submit_tr').attr('rowspan', 3)//login.phpҳ�棬���밴ť�Ű���Ӧ
    if ($('#login_auth_num img').attr('src')=='') {
        getauthnum();
    }
    if ($('#captcha_wrapper_blockui').length === 0) {
        displayShumeiCaptcha();
    }
}

//����Ƿ���Ҫ������֤��
var needauth = false;
//��֤������
var captchaType;

function checkneedauthnum() {
    if (needauth==true) {//����Ѿ����жϹ���Ҫ��֤���˾�ֱ����ʾ��֤��
        showauthnum()
    } else if (jjCookie.get('login_need_authnum')) {//���cookie�������֤��ļ�¼����ʾ��֤��
        needauth = true;
        showauthnum();
    } else {
        var loginname = $.trim($('#loginname').val());
        if (loginname=='����/����/�ֻ���') {//�����û���û�����ͳһ�ɿ�
            loginname = '';
        }
        var time = new Date();
        var urlhttp = getUrlHttp();
        $.ajax({
            'url': urlhttp+'://my.jjwxc.net/login.php?action=checkneedauthnum&r='+Math.random(),
            'data': {'username': loginname},
            'success': function(data) {
                var time = new Date();
                var datastr = ''
                $.each(data, function(k, v) {
                    datastr += ';'+k+'='+v
                })
                if (data.isneed) {
                    needauth = true;
                    showauthnum()
                }
            },
            'dataType': 'jsonp',
            'async': false
        })
    }
}

$(function() {
    $('#loginbycode').live("click", function() {
        var html = "<div align=center><iframe width=250 height=300 frameborder=0 scrolling=no src='//my.jjwxc.net/backend/login/jjreader/login.php'></iframe></div>";
        $("#codelogininput").html(html);
        $("#logininput").hide();
        $("#codelogininput").show();
        $(this).css("color", "#27A751");
        $(this).css("border-bottom", "#27a751 solid 2px");
        $("#loginbyaccount").css("color", "#90A38D");
        $("#loginbyaccount").css("border-bottom", "#90a38d solid 2px");
    })
    $('#loginbyaccount').live("click", function() {
        $("#codelogininput").hide();
        $("#logininput").show();
        $(this).css("color", "#27A751");
        $(this).css("border-bottom", "#27a751 solid 2px");
        $("#loginbycode").css("color", "#90A38D");
        $("#loginbycode").css("border-bottom", "#90a38d solid 2px");

    })
});

//ͳһ�������
function show_login(username, password) {
    checkneedauthnum();
    var url = window.location.href;
    jjCookie.set('returnUrl', url, false, '.jjwxc.net');
//ɾ��ԭ�е�ҳ��
    $('#login_info_remove').remove();
    $('#login_info_for_jj_remove').remove();
    if ($('#mylogin').length>0) {
        $('#mylogin').val('no');
    }
    username = undefined==username ? '' : username;
    password = undefined==password ? '' : password;
    var checked = '';
    if (username&&password) {
        checked = 'checked';
    }
    var widthEnough = parseInt($('body').width())>850;
    var loginWidth = widthEnough ? '810px' : '100%';
    var blockWidth = widthEnough ? '850px' : '450px';
    var blockMargin = widthEnough ? '-430px' : '-270px';
    var pcShow = widthEnough ? 'block' : 'none';
    var wapShow = widthEnough ? 'none' : 'block';
    var justifytype = widthEnough ? '' : 'justify-content: space-around;';
    var leftMargin =  widthEnough ? '80px' : '56px';
    var rightMargin = widthEnough ? '70px' : '40px';
    var blockleft = widthEnough ? '50%' : '56%';
    var blockRadius = widthEnough ? '0px' : '12px';
    var leftdivleft = widthEnough ? '125px' : '100px';
    var u = navigator.userAgent;
    // if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)|| !widthEnough) {
    //     loginWidth = '750px';
    //     blockWidth = '762px'
    //     blockMargin = '-385px';
    // }
    var htmlStr = '<script type="text/javascript" src="//static.jjwxc.net/scripts/shumeiDeviceIdSdk.js?var=20230114"></script><style>#login_info_remove *{font-family: \'΢���ź�\',Arial, Helvetica, sans-serif;}#login_info_remove ul{padding-left:0}#login_info_remove li{list-style:none;}#login_form_ajax{margin: 0 auto; font-weight:bold;}#login_form_ajax .hint{font-family:\'����\';font-size:12px;color:#A7A7A7;margin-left:60px;margin-top:3px;font-weight:normal} #login_form_ajax label{display:inline-block;text-align:right; font-size:16px; }#login_form_ajax input{vertical-align:middle;height: 28px;width: 275px;margin-left:5px;color:black}#login_form_ajax .input_after{color:#009900;font-size:13px;}#login_form_ajax .alert{color:red}#logincaptchaimg *{display:inline-block;vertical-align:middle} </style>';
    ;
    htmlStr += '<div style="width: 100%; position: relative;height: 30px;"><a onclick="$.unblockUI();return false;" style="font-size: 12px; text-decoration: none; float:right; height: 30px;color: black;width:40px;" href="#">�ر�</a></div>';
    htmlStr += '<div style="display:'+wapShow+';position:absolute;left:-1px;top:0px;">' +
            '<img src="//static.jjwxc.net/images/login/login-code.png" alt="ɨ�����" style="width:107px;" onclick="$(this).hide().siblings().show();$(\'.jj-login-right\').hide().siblings(\'.jj-login-left\').show();">' +
            '<img src="//static.jjwxc.net/images/login/login-account.png" alt="�˺ŵ���" style="width: 107px;display: none;" onclick="$(this).hide().siblings().show();$(\'.jj-login-left\').hide().siblings(\'.jj-login-right\').show();"> </div>';
    htmlStr += '<div id="login_info_remove" style="width: '+loginWidth+';background: #FFFFFF;border-radius: 3px;padding:0px;margin: 0;display: flex;'+justifytype+'flex-direction: row;font-family:\'΢���ź�,����\',Arial, Helvetica, sans-serif;">';
    htmlStr += '<div class="jj-login-left" style="width: 410px;display: '+pcShow+';">\n'+
            '                        <div style="width: 215px;margin-left: '+leftdivleft+';text-align: center;">\n'+
            '                            <div class="login-title" style="font-size:20px;font-weight: bold;text-align: right;color:#707070;padding-right: 30px;">ɨ���ά�����</div>\n'+
            '                            <div class="login-qrcode" style="text-align: right;">\n'+
            '                                <iframe width=215 height=295 frameborder=0 scrolling=no src=\'//my.jjwxc.net/backend/login/jjreader/login.php\'></iframe>\n'+
            '                            </div>\n'+
            '                        </div>\n'+
            '                        <div style="position: relative;text-align: left;">\n'+
            '                            <div class="person" style="background-image: url(\'//static.jjwxc.net/images/login/person.jpg\');background-repeat: no-repeat;background-position: 10px 20px;background-size: 130px 130px;width: 150px;height: 150px;">&nbsp;</div>\n'+
            '                            <div style="position: absolute;left:130px;padding:35px 0 0 17px;top:0px;background: url(\'//static.jjwxc.net/images/login/bubble.png\') no-repeat;background-size: 190px 88.3px;color: #999999;font-size: 14px;width: 200px;height: 95px;">\n'+
            '                                ��û��<span style="font-weight: bold;">App</span>��<a href="//www.jjwxc.net/sp/JJ-app-download/" style="color: #529B2E;font-weight: bold;" target="_blank">��������</a>\n'+
            '                            </div>\n'+
            '                        </div>\n'+
            '                    </div>\n'+
            '                    <div style="width: 1px;height: 100%;position: relative;display: '+pcShow+'">\n'+
            '                        <div style="position:absolute;border-right: 1px solid #707070; height: 263px;top:45px;"></div>\n'+
            '                    </div>\n'+
            '                    <div class="jj-login-right" style="flex:1">\n'+
            '                        <div class="login-account" style="display: none;">\n'+
            '                            <div class="login-title" style="font-size:20px;font-weight: bold;text-align: center;color:#707070;">��ܰ��ʾ</div>\n'+
            '                            <div class="account-tip" style="font-size: 16px;color: #707070;height: 340px;width:380px;margin: 18px auto 0 auto;font-weight: bold;"></div>\n'+
            '                        </div>\n'+
            '                        <div class="login-form">\n'+
            '                            <div class="login-title" id="account-title" style="font-size:20px;font-weight: bold;text-align: center;color:#707070;width: 300px;margin-left: '+leftMargin+';">�˺ŵ���</div>\n'+
            '                            <div style="margin-top:18px;">\n'+
            '                                <form id="login_form" class="ajax_login_form" name="form" method="post">\n'+
            '                                    <input type="hidden" name="pwdtype" id="pwdtype" value="" />\n'+
            '                                    <input type=\'hidden\' name=\'shumeideviceId\' id=\'shumeideviceId\' value=\'\'/>\n'+
            '                                    <input type="hidden" name="shumei_captcha_rid" class="shumei_captcha_rid">\n'+
            '                                    <input type="hidden" name="shumei_transcation" class="shumei_transcation">\n'+
            '                                    <div id="login_form_ajax">\n'+
            '                                        <div style="width:330px;margin-left:'+rightMargin+';" class="notErrorCode">\n'+
            '                                            <p><label style="font-size: 14px;color: #707070;">�˺�</label><input name="loginname" tabindex="1" type="text" id="loginname"  maxlength="50" value="'+username+'" placeholder=" ����/����/�ֻ���" onfocus="" onblur="checkneedauthnum();if(this.value==\'\'){this.style.color=\'#A7A7A7\'}" /></p>\n'+
            '                                            <p style="margin-top:10px;"><label style="font-size: 14px;color: #707070;">����</label><input class="loginpassword" tabindex="2" name="loginpassword" type="password" id="loginpassword" value="'+password+'" maxlength="32" onfocus="$(\'.person\').css(\'background-image\',\'url('+'//static.jjwxc.net/images/login/person-back.jpg'+')\')" onblur="$(\'.person\').css(\'background-image\',\'url('+'//static.jjwxc.net/images/login/person.jpg'+')\')"/>\n'+
            '                                                <i class="icon-pass" id ="icon-loginpassword" style="margin-right: 15%;background-image: url(\'//static.jjwxc.net/images/login/yincang_icon.png\');position: relative;margin-top: -29px;background-repeat: no-repeat;width: 22px;height: 22px;float: right;cursor: pointer;" data-show="1" onclick=showicon("loginpassword")></i>\n'+
            '                                            </p>\n'+
            '                                        </div>\n'+
            '                                            <div style="width: 100%;display:none;font-size: 12px" id="deviceErrorCode">\n'+
            '                                               <div style="min-height: 165px;">\n'+
            '                                                   <div style="margin-top: 10px;margin-left: 42px;position: relative;">\n'+
            '                                                       <div style="font-size: 14px;color: #707070; text-align:left;" id="current_device_title"></div>\n'+
            '                                                       <input style="width: 325px;margin-left:0px;" type="text" name="checkdevicecode" value=""/>\n'+
            '                                                       <input type="hidden" class="checktype" name="checktype" value="device"/>\n'+
            '                                                       <input type="hidden" name="deviceType" id="loginDeviceType" value=""/>\n'+
            '                                                       <input type="hidden" name="authKey" id="authKey" value=""/>\n'+
            '                                                       <input type="hidden" name="device" value="pc"/>\n'+
            '                                                       <div class="sendcode" style="display: none;position: absolute;top:26px;right: 40px;color:#529B2E;cursor: pointer;" onclick="getCodeDevice()">��ȡ��֤��</div>\n'+
            '                                                   </div>\n'+
            '                                                   <div id="deviceErrorTip" style="display: none;color:#ff0000;padding-left:42px;"></div>\n'+
            '                                                   <span class="deviceTip" style="display: inline-block;padding-left:42px;width: 330px;font-weight: normal;">���豸��֤���ǰ�����豸�ĸ�������-�˺��밲ȫ-�豸������������豸���¡���ȡ������֤�롱��ȡ</span>\n'+
            '                                                </div>\n'+

            '                                                <div style="margin-left:15px;padding-left: 26px;min-height:185px;">\n'+
            '                                                    <div id="other-checktype-title" style="padding-top:20px;">��Ҳ����ѡ��������֤��ʽ��</div>\n'+
            '                                                    <div id="other-checktype" style="line-height: 30px;"></div>\n'+
            '                                                </div>\n'+
            '                                            </div>\n'+
            '                                    </div>\n'+
            '                                    <div style="width:330px;margin:10px auto 0 '+rightMargin+';font-size:12px;">\n'+
            '                                        <div class="login_blockui_captcha" style="width: 100%;margin-top:10px"></div>\n'+
            '                                        <div class="registerRuleDiv notErrorCode" style="margin-top:10px;">\n'+
            '                                            <input id="login_registerRule"  '+checked+' name="registerRule" type="checkbox" >&nbsp;<label for="login_registerRule">���Ķ���ͬ��</label><a href="http://my.jjwxc.net/register/registerRule.php" target="_blank" style="color:#529B2E;">���û�ע��Э�顷</a>��<a href="https://wap.jjwxc.net/register/showRegisterRule?src=app" target="_blank" style="color:#529B2E;">����˽���ߡ�</a>\n'+
            '                                        </div>\n'+
            '                                        <div class="cookietime notErrorCode" align="left">\n'+
            '                                            <input name="cookietime" id="login_cookietime" type="checkbox" id="" value="true" title="ѡ�˽��ڱ���������ĵ�����Ϣ���벻Ҫ�ڹ�������ʹ��" />&nbsp;<label for="login_cookietime">���ֵ���һ����</label>\n'+
            '                                        </div>\n'+
            '                                        <div style="clear: both;margin-top: 15px;'+(widthEnough ? '' : 'text-align: center;')+'">\n'+
            '                                            <a class="notErrorCode" href="//my.jjwxc.net/register/index.html" rel="nofollow"><span class="registbutton" style="display:inline-block;width: 74px;border:1px solid #66C266; border-radius: 7px;color: #529B2E;font-size: 20px;text-align:center;line-height: 38px;font-weight: normal;">ע��</span></a>\n'+
            '                                            <button onkeydown="enter()" onclick="jj_login();return false;" class="loginbutton" id="window_loginbutton" type="submit" style="background: #66C266;color: #FFFFFF;font-size: 20px;width: 220px;height: 40px;border-radius: 7px;border:none;cursor: pointer;margin-left:15px;">����</button>\n'+
            '                                        </div>\n'+
            '                                        <div class="notErrorCode" style="color:;width:314px;text-align: center;margin:10px 0;"><span style="color:#707070; font-size:14px; font-weight:bold;fon">�����˺ŵ���</span></div>\n'+
            '                                        <div class="thirdLogin notErrorCode" style="width:314px;display:flex;flex-direction: row;justify-content: space-between;">\n'+
            '                                            <a onclick="accountBinding();\n'+
            '                                                return false" href="#"><img width="50" border="0" src="'+httpProtocol+'://static.jjwxc.net/images/login/qqlogin_new.png"></a>\n'+
            '                                            <a onclick="accountBinding();\n'+
            '                                                return false" href="#"><img width="50" border="0" src="'+httpProtocol+'://static.jjwxc.net/images/login/sinaweibo_new.png"></a>\n'+
            '                                            <a onclick="accountBinding();\n'+
            '                                                return false" href="#"><img width="50" border="0" src="'+httpProtocol+'://static.jjwxc.net/images/login/weixin_new.png"></a>\n'+
            '                                            <a onclick="accountBinding();\n'+
            '                                                return false" href="#"><img width="50" border="0" src="'+httpProtocol+'://static.jjwxc.net/images/login/zhifubao_new.png?ver=20150804"/></a>\n'+
            '                                            <a onclick="show_sdo_login_block();\n'+
            '                                                return false;" href="#"><img width="50" border="0" src="'+httpProtocol+'://static.jjwxc.net/images/login/login_snda_btn_new.png"></a>\n'+
            '                                        </div>\n'+
            '                                    </div>\n'+
            '                                </form><input name="loginbywidow" id="loginbywidow" value="1" type="hidden"/>\n'+
            '                            </div>\n'+
            '                        </div>\n'+
            '                    </div>' +
            '                   <div id="overlay_register_rule" style="display: none;z-index: 1003;cursor: wait;border: none;margin: 0px;padding: 0px;width: 100%;height: 100%;top: 0px;left: 0px;position: fixed;background-color: rgb(0, 0, 0);opacity: 0.2;"></div>\n'+
            '                   <div id="popup_register_rule" style="display: none">\n'+
            '                       <div style="border-radius: 5px;z-index: 1004; cursor: wait; padding: 20px; position: fixed; width: 330px; margin: -50px 0px 0px -125px; top: 40%; left: 50%; text-align: left; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255); border: 0px; height: auto; transform: translateX(-8%);">\n'+
            '                            <div>�����Ķ���ͬ��<a href="//my.jjwxc.net/register/registerRule.php" target="_blank" style="color: #0089FF;">���û�ע��Э�顷</a>��<a href="//wap.jjwxc.net/register/showRegisterRule?src=app" target="_blank" style="color: #0089FF;">����˽���ߡ�</a></div>\n'+
            '                            <div style="margin-top: 40px;margin-left: 230px;"><span style="margin-right: 20px;" onclick="cancelBtnFun();return false;">ȡ��</span><span onclick="agreeBtnFun();return false;" style="background-color: #0089FF;color: white;border: none;border-radius: 5px;padding: 10px 15px;cursor: pointer;">ͬ��</span></div>\n'+
            '                       </div>\n'+
            '                   </div>';

        htmlStr += '</div>';

    $.blockUI(htmlStr, {
        'width': blockWidth,
        'padding': '5px 5px 20px 0px',
        'border': '0px',
        'cursor': 'text',
        'top': 'calc(50% - 250px)',
        'left': blockleft,
        'margin':'-50px 0 0 '+ blockMargin,
        'text-align': 'left',
        'background': 'white',
        'border-radius' : blockRadius
    });
    $.ajax({
        url: httpProtocol+"://my.jjwxc.net/lib/ajax.php?action=getCaptchaType",
        dataType: 'jsonp',
        type: "get",
        async: false,
        jsonp: 'callback',
        //jsonpCallback: 'callbackGetCaptchaType',
        success: function(res) {
            captchaType = res.captchaType;
            needauth = res.needAuth;
            if (captchaType=='jjwxc') {
                if (needauth) {
                    var html = '<div id="login_auth_num" style="display:none"><p style="margin-top:10px;"><label>ͼ����֤��</label> <input tabindex="3" name="auth_num" type="input" id="auth_num"  maxlength="32"/></p>';
                    html += '<p style="margin-top:10px;"><label></label> <img src=""><span class="input_after" title="������»�ȡ��֤��" id="getauthnum" onclick="getauthnum()" style="padding-left:1em;">��һ��</span></p><p><label></label><span class="alert"></span></p></div>';
                    $('.login_blockui_captcha').html(html);
                    getauthnum();
                }
            } else if (captchaType=='shumei') {
                if (needauth==0) {
                    $('.login_blockui_captcha').html('');
                    return false;
                }
                displayShumeiCaptcha();

            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest, textStatus, errorThrown);
        }
    });
    return false;
}
//ȡ��ͬ��ע��Э�鰴ť�Ļص�����
function cancelBtnFun(){
    $('#overlay_register_rule').hide();
    $('#popup_register_rule').hide();
}
//ͬ��ע��Э�鰴ť�Ļص�����
function agreeBtnFun(){
    $('#overlay_register_rule').hide();
    $('#popup_register_rule').hide();
    $("#login_registerRule").prop('checked',true);
}

function displayShumeiCaptcha() {
    $('.login_blockui_captcha').html('<div id="captcha_wrapper_blockui">��֤�������...</div>');
    var shumei_deviceid_retry = 0;
    var timer = setInterval(function() {
        var shumei_deviceId = ($('#shumeideviceId').length>0&&$('#shumeideviceId').val().length>0) ? $('#shumeideviceId').val() : '';
        if (shumei_deviceId!=='') {
            clearInterval(timer);
        } else if (shumei_deviceid_retry++>=10) {
            shumei_deviceId = 'get_deviceid_timeout';
            clearInterval(timer);
        } else {
            return true;
        }
        $.ajax({
            url: "//my.jjwxc.net/lib/ajax.php?action=shumeiCodePreRequest&deviceId="+shumei_deviceId+'&appId=pc_login',
            dataType: 'jsonp',
            type: "get",
            async: false,
            jsonp: 'callback',
            //jsonpCallback: 'jsonpHandler',
            success: function(res) {
                $('#login_form > .shumei_transcation').val(res.transactionKey);
                param = {
                    organization: res.organization ? res.organization : 'E9kUZWhov0uih0OKfOb6',
                    appId: res.appId ? res.appId : 'jj_pc_login',
                    mode: res.mode ? res.mode : "select",
                    product: res.product ? res.product : "embed"
                }
                //ĳЩ�ҳ��û������sdk��Ҫ�ֶ�����
                if (typeof initSMCaptcha=='undefined') {
                    loadScriptUtf8('https://castatic.fengkongcloud.cn/pr/v1.0.3/smcp.min.js', initShumeiCaptcha, param);
                } else {
                    initShumeiCaptcha(param);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log(XMLHttpRequest, textStatus, errorThrown);
            }
        });
    }, 300);
}
//��ʼ����֤��
function initShumeiCaptcha(param) {
    //��ʼ����֤��
    initSMCaptcha({
        organization: param.organization ? param.organization :'E9kUZWhov0uih0OKfOb6',
        appId: param.appId ? param.appId : 'jj_pc_login',
        //https: false,
        width: '314',
        mode: param.mode ? param.mode : "select",
        product: param.product ? param.product :"embed",
        appendTo: '#captcha_wrapper_blockui'
    }, smCaptchaCallback);//

    function smCaptchaCallback(SMCaptcha) {
        //��֤��У������ص�
        SMCaptcha.onSuccess(function(data) {
            //�ɹ���ʱ���ύ��
            if (data.pass===true) {
                //��֤�ύ��
                $('#login_form > .shumei_captcha_rid').val(data.rid);
            }
        })
    }
}

//����script utf8��ʽ
function loadScriptUtf8(url, callback, param) {
    var script = document.createElement("script")
    script.type = "text/javascript";
    script.setAttribute('charset', 'UTF-8');
    if (script.readyState) { //IE
        script.onreadystatechange = function() {
            if (script.readyState=="loaded"||script.readyState=="complete") {
                script.onreadystatechange = null;
                callback(param);
            }
        };
    } else { //Others
        script.onload = function() {
            callback(param);
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

//����Ƿ��ѵ���
function is_login() {
    console.log('is_login jjlogin.js');
    if (getCookie('readerid')==null) {
        show_login();
        window.scroll(0, 0);
        return false;
    } else {
        return true;
    }
}

//������������ʾ��
function accountBinding(loginType) {
    $('.login-form').hide();
    $('.login-account').show();
    var htmlStr = '<div style="color:#000000;font-size: 14px;">';
    if (loginType=='sdo') {
        htmlStr += '1��ʢ���˺�ע�᷽ʽ����ͣ����ʹ��������ʽע�ᡣ<br><br>\n\
        2�������˺Ű�ȫ���ǣ�����������ʢ��ͨ��֤�ĵ��뷽ʽ���������˺��Ѿ������ֻ���������ʹ���˺�������е��롣<br><br>\n\
        3��������Ľ�����ѧ���˺Ű���ʢ��ͨ��֤����δ���ֻ������䣬���ڵ����ʱ�����ֻ�������İ󶨡�</div>\n';
    } else {
        htmlStr += '1��������Ѿ��н��������˻�,���ȡ����ر��ص��롿�����뱾���˻��Ժ��ڡ��ҵĽ������еİ��˻�һ�����������󶨵�վ���˻���Ӧͼ����а󶨡�<br><br>\n\
        2��������Ѿ��󶨹����������˻���������δӵ�н��������˻�����ֱ��ʹ�õ������������ֱ�ӵ��롣<br><br>\n\
        3������΢���İ�ȫ�������ƣ�ͨ��΢����¼���û�������Ҫ���ֻ�΢������ɨ����֤������֪Ϥ��</div>\n';
    }
    htmlStr += '<div><br><a onclick="$(\'.login-form\').show();$(\'.login-account\').hide();" style="color:#529B2E;cursor:pointer;font-size:13px;font-family:\'΢���ź�,����\',Arial, Helvetica, sans-serif;"><<�����˺��������</a></div>';
    htmlStr += '<div style="color:;width:100%;text-align: center;margin-top:20px"><span style="color:#707070; font-size:14px; font-weight:bold;fon">�����˺ŵ���</span></div></div>';
    htmlStr += '<div class="pk" style=" margin-left:20px;width:100%;"><ul>';
    htmlStr += '<li class="ott" style="float:left;list-style:none;text-align:left; margin-left:20px; margin-top:10px;"><span style="padding-top:10px;"><a href="//my.jjwxc.net/backend/login/tencent/login.php" target="_self"><img src="//static.jjwxc.net/images/login/qqlogin_new.png?ver=20190423" width="50" border="0" /></a></span>\n\
            <span style="margin-left:16px;padding-top:10px;"><a href="//my.jjwxc.net/backend/login/sinaweibo/login.php" target="_self"><img src="//static.jjwxc.net/images/login/sinaweibo_new.png?ver=20190423" width="50" border="0" /></a></span>\n\
            <span style=" margin-left:16px;padding-top:10px;"><a href="//my.jjwxc.net/backend/login/weixin/login.php" target="_self"><img src="//static.jjwxc.net/images/login/weixin_new.png?ver=20190423" width="50" border="0" /></a></span><span style=" margin-left:16px;padding-top:10px;"><a href="//my.jjwxc.net/backend/login/alipay/alipay_auth_authorize.php" target="_self"><img src="//static.jjwxc.net/images/login/zhifubao_new.png?ver=20190423" width="50" border="0" /></a></span><span style=" margin-left:16px;padding-top:10px;"><a href="#" onclick="show_sdo_login_block();return false;" ><img src="//static.jjwxc.net/images/login/login_snda_btn_new.png?ver=20190423" width="50" border="0" /></a></span></li>';
    htmlStr += '</ul></div>';
    $('.account-tip').html(htmlStr);
}


//�رյ�����Ϣҳ
function login_close() {
    jjCookie.set('clicktype', '');
    $.unblockUI();
    $('#login_info_remove').remove();
    $('#login_info_for_jj_remove').remove();
    $('#login_text_info').remove();
}

//���̻س����¼�
function enter() {
    if (event.keyCode==13) {
        jj_login();
    }
}

// ��ҳ��������һ��˺ŵ���
function login_text_info() {
    login_close();
    var html = '<div id="login_text_info">';
    html += '<div class="blockUI" style="z-index: 1001; cursor: wait; border: medium none; margin: 0pt; padding: 0pt; width: 100%; height: 100%; top: 0pt; left: 0pt; position: fixed; background-color: rgb(0, 0, 0); opacity: 0.2;   filter : Alpha(opacity=30) ;"></div>';
    html += '<div style=" position: absolute; left:50%; margin : 100px 0 0 -205px; width:410px;height:260px; z-index:5001;" >';
    html += '<div style="background: #78B053; width: 400px; height :25px; padding: 0 0 0 10px; line-height:25px; color:#FFFFFF; font-size:13px;"><b style="float:left;">��ܰ��ʾ</b> <a href="#" style="float:right; font-size:12px; margin: 0 10px 0 0; text-decoration: none; color:#FFFFFF;" onclick="login_close();return false;">�ر�</a></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:328px;width:5px; float:left;"> </div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:328px;width:5px; float:right;"> </div>';
    html += '<div style=" width:370px;  padding:20px 15px;  float:right; background:#fff; font-size:14px; color:#666666;line-height:14px;" >';
    html += '<p >��֪���Լ�Ӧ��ѡ�����ֵ��뷽ʽ���������·�ʽ�ж�һ�°�~</p></br>';
    html += '  <ol style="padding:0 25px; margin:0; font-size:12px;">';
    html += '<li style="list-style-type: decimal;">����������ߣ���Ȼ����ʹ�ñ�����ʽ���룬����Ҳ�Ƽ���ʹ�ø÷�ʽ���롣</li> </br>';
    html += '<li style="list-style-type: decimal;">�������ǰʹ��������Ϊ�����˺ţ�������ǽ�����ʽ��ʢ��ͨ��֤��ʽ��QQ����֧������ʽ�ȣ��ɷֱ���һ����ȷ����</li></br>';
    html += '<li style="list-style-type: decimal;">�������ǰʹ�õ����ֻ�����Ϊ�����˺ţ�������ǽ�����ʽ����ʢ��ͨ��֤��ʽ�ȣ��ɷֱ���һ����ȷ����</li></br>';
    html += '<li style="list-style-type: decimal;">�������ǰʹ�õ���һ��Ӣ��������ĸ����š�.������ϣ������ַ����ı���������ʢ��ͨ��֤��ʽ�� �磺ceshi001��xiaohongmao��aa123456.pt��139xxxx8888.sdo�ȡ�</li><br>';
    html += '<li style="list-style-type: decimal;">�������������뷽ʽ������QQ�ȣ������Ե���Ӧλ�ó��ԡ�</li>';
    html += '</ol>';
    html += '<div style="height:30px ;width: 350px; float:left; margin-top: 20px; line-height:25px; font-size:14px;">';
    html += '<a href="#" style=" width: 80px;  float:right;  border: 1px solid #666666; text-decoration: none; color:#666666; text-align:center;" onclick="login_close();return false;" >ȷ ��</a> ';
    html += '</div></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:10px;width:410px; float:left;"></div>';
    html += '</div></div>';
    $('body').prepend(html);
    return false;
}

//lj �һ����뵯������
function getpwdtop() {
    $('#login_info_remove').remove();
    $('#login_info_for_jj_remove').remove();
    var html = '<div id="login_info_remove">';
    // html +='<div class="blockUI" style="z-index: 1001; cursor: wait; border: medium none; margin: 0pt; padding: 0pt; width: 100%; height: 100%; top: 0pt; left: 0pt; position: fixed; background-color: rgb(0, 0, 0); opacity: 0.2;  filter : Alpha(opacity=20) ;"></div>';
    //html +='<div style=" position: absolute; left:50%; margin : 100px 0 0 -205px; width:410px;height:260px; z-index:5001;" >';
    html += '<div style="background: #78B053; width: 400px; height :25px; padding: 0 0 0 10px; line-height:25px; color:#FFFFFF ; font-size:13px;"><b style="float:left;">�����һ�</b> <a href="#" style="float:right; font-size:12px; margin: 0 10px 0 0; text-decoration: none; color:#FFFFFF ;" onclick="login_close();return false;" >�ر�</a></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:320px;width:5px; float:left;"> </div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:320px;width:5px; float:right;"> </div>';
    html += '<div style=" width:370px;height:300px;  padding:10px 15px;  float:right; background:#fff;" >';
    html += '<p style="color:#009900; margin:5px 20px 20px 20px; font-size:12px;">���������һ�</p>';
    html += '<ul style=" font-size:14px; text-align: center; list-style-type:none; ">';
    html += '<li style="margin:0 20px ; padding: 0 0 20px 0;border-bottom:1px dashed #E1E1E1;"> <a href="//www.jjwxc.net/register/forgot.html" style=" text-decoration: none;  " target="_blank"><b>ʹ�ð��������ֻ����뷽ʽ��������</b></a><br /></li>';
    html += '</ul>';
    html += '<p style="color:#009900; margin: 10px 20px 10px 20px; font-size:12px;"> ��վ�����һ�</p>';
    html += '<ul style=" font-size:14px; text-align: center; list-style-type:none; ">';
    html += '<li style="margin:0 20px ; padding: 0 0 30px 0;border-bottom:1px dashed #E1E1E1;  "><div style="height:21px; width:210px; margin: 0 auto ;line-height:21px;  font-size:14px;  ">������ʹ����վ�˺ŵ������뵽��Ӧ��վ�һ�</div></li>';
    html += '</ul>';
    html += '<p style="color:#009900; margin: 10px 20px 10px 20px; font-size:12px;"> ������������һ�</p>';
    html += '<ul style=" font-size:14px; text-align: center; list-style-type:none; ">';
    html += '<li style="margin:0 20px ; padding: 0 0 20px 0;border-bottom:1px dashed #E1E1E1;  "><a href="//help.jjwxc.net/user/password" target="_blank"><b>������/�ֻ����벻������������Ϣ<br>�����˰�����/�ֻ���</b></a></li>';
    html += '</ul></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:10px;width:410px; float:left;"> </div>';
    // html +='</div></div>';
    // $('body').prepend(html);
    $.blockUI(html, {
        'width': '410px',
        'height': '355px',
        'padding': '0px',
        'border': '0px',
        'cursor': 'text',
        'top': '30%',
        'left': '45%'
    });
    return false;
}

// ����ajax
function jj_login(loginsrc) {
    var urlhttp = getUrlHttp();
    var logindev = ''; //��ֹajax�����ҳ���ϵĵ�����ͻ
    if ($("#mylogin").val()=='yes') {
        var loginname = encodeURI($('#my_loginname').val());
        var loginpasswords = $('#my_loginpassword').val();
        var loginpassword = encodeURIComponent(loginpasswords);
    } else {
        if ($('#login_info_remove').length>0) {
            logindev = '#login_info_remove ';
        }
        var loginname = encodeURI($(logindev+'#loginname').val());
        var loginpasswords = $(logindev+'#loginpassword').val();
        var loginpassword = encodeURIComponent(loginpasswords);
        var Ekey = $('#Ekey').val();
        var Challenge = $('#Challenge').val();
        var auth_num = $(logindev+'#auth_num').val();
        var shumei_captcha_rid = $('#login_form > .shumei_captcha_rid').val();
        var shumei_transcation = $('#login_form > .shumei_transcation').val();
        var checkdevicecode = $(logindev+' input[name=checkdevicecode]').val();
        var checktype = $(logindev+' input[name=checktype]').val();
        var deviceType = $(logindev+' input[name=deviceType]').val();
        //var authKeyLogin = $(logindev+' input[name=authKey]').val();
    }

    if (typeof (checkdevicecode) == 'undefined' || !checkdevicecode) {
        checkneedauthnum();
        if (needauth==1) {
            if (captchaType=='jjwxc') {
                if (auth_num=='') {
                    showauthnum();
                    $('#login_auth_num .alert').text('��������֤��');
                    return false;
                }
            } else if (captchaType=='shumei') {
                if ($('#login_form > .shumei_captcha_rid').val()=='') {
                    alert('����У����֤�룡');
                    if ($('#captcha_wrapper_blockui').length === 0) {
                        displayShumeiCaptcha();
                    }
                    return false;
                }
            }
        }
    }

    if (!loginsrc&& !$("#login_registerRule").prop('checked')) {
        $('#overlay_register_rule').show();
        $('#popup_register_rule').show();
        return false;
    }
    if ($('#mylogin').length>0) {
        $('#mylogin').val('yes');
    }
    var randid = Math.random();
    var cookietime_input = $('#login_form.ajax_login_form [name=cookietime]');
    if (cookietime_input.attr('checked')=='checked'||cookietime_input.attr("type")=="hidden") {
        var cookietime = cookietime_input.val();
    } else {
        var cookietime = 0;
    }
    //console.log(cookietime);
    var client_date = new Date();
    var client_time = Math.floor(client_date.getTime()/1000);
    var smsKey = $('#login_sms_key').length ? $('#login_sms_key').val() : '';
    $('#login_info_for_jj_remove').remove();
    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>���Ժ�...</strong>');
    if (loginname==''||loginname==encodeURI('����/����/�ֻ���')) {
        $.blockUI('<br><div align="center" style="cursor:text;line-height:13px;"><b>���������˺ź��ٵ��룬�������û�н����˺ţ�����<a href="https://my.jjwxc.net/register/usersecurity.php" target="_blank"><span style="color:blue">���ע��</span></a>��ʹ����վ����֧�ֵ������˺Ž��е��롣</b><br><br><div align="center"><input type="button" id="yesbuy"  style="text-align:center" value="ȷ ��" onClick="$.unblockUI();show_login();"/></div>', {
            height: '100px'
        });
        if (show_channel_info()=='shop') {
            $('#login_box').show();
            $('#login_auth').hide();
        }
    } else if (loginpassword=='') {
        $.blockUI('<br><div align="center" style="cursor:text;line-height:13px;"><b>��������������ٵ��룬�������û�н����˺ţ�����<a href="https://my.jjwxc.net/register/usersecurity.php" target="_blank"><span style="color:blue">���ע��</span></a>��ʹ����վ����֧�ֵ������˺Ž��е��롣</b><br><br><div align="center"><input type="button" id="yesbuy"  style="text-align:center" value="ȷ ��" onClick="$.unblockUI();show_login();"/></div>', {
            height: '100px'
        });
        if (show_channel_info()=='shop') {
            $('#login_box').show();
            $('#login_auth').hide();
        }
    } else {
        var pwdObj = pwdEncryption(loginpasswords);
        if ($("#shumeideviceId").length>0) {
            var shumeideviceId = $("#shumeideviceId").val();
        } else {
            var shumeideviceId = "";
        }
        $.getJSON(urlhttp+"://my.jjwxc.net/login.php?action=login&login_mode=ajax&loginname="+loginname+"&pwdtype="+pwdObj.pwdtype+"&loginpassword="+pwdObj.pwd+"&Ekey="+Ekey+"&Challenge="+Challenge+"&auth_num="+auth_num+"&cookietime="+cookietime+"&client_time="+client_time+"&shumeideviceId="+shumeideviceId+"&shumei_transcation="+shumei_transcation+"&shumei_captcha_rid="+shumei_captcha_rid+"&deviceType="+deviceType+"&checkdevicecode="+checkdevicecode+"&checktype="+checktype+"&device=pc&smsKey="+smsKey+"&authKey="+authKey+"&jsonp=?", function(data) {
            if (data.state==1) {
                $.unblockUI();
                var loginsid = data.sid;
                var token = data.token;
                var jump_wechat_bind = data.jump_wechat_bind;
                if (show_channel_info()=='shop') {
//�̳ǵ���
                    if (getCookie('issdo')=='yes') {
                        var logoutUrl = 'http://cas.sdo.com/cas/logout?url=http://www.jjwxc.cn/logout/';
                    } else {
                        var logoutUrl = '//www.jjwxc.cn/logout/';
                    }
                    $('#loginTd').css('height', '26px');
                    $('#login_auth').hide();
                    var now = new Date();
                    now.setTime(now.getTime()+365*86400*1000);
                    setCookie('sid', loginsid, now, '/', '.jjwxc.cn');
                    setCookie('readerid', data.readerId, now, '/', '.jjwxc.cn');
                    $('#t_user_jiong').html('<FONT color=#72A1E4>&nbsp;&nbsp;<a href="/myuser/index/action/dingdan">�ҵć��</a>&nbsp;&nbsp;<a href="'+logoutUrl+'">�˳�</a></font>').show();
                    $('#login_menu').html('<a href="/myuser/index/action/zancunkuan"><font color="#FF0000">�ҵ����</font></a>��<a href="/myuser/index/action/dingdan"><font color="#FF0000">��������</font></a>��<a href="/shoppingcar/index"><font color="#FF0000">�����ﳵ</font></a>��<a href="/myuser/index/action/savepass">�޸�����</a>��<a href="'+logoutUrl+'">�˳�����</a>');
                    $('#userinfo').load(urlhttp+'://www.jjwxc.cn/userinfo/index/readerid/'+data.readerId+'/bookshopusername/'+data.bbsnicknameAndsign);
                    var suffix = '<div style="margin-top:10px;"><a href="/myuser/index/action/shoucang">�鿴���ﳵ����</a></div>';
                    $.getJSON("/for_index_shopping/index", {
                        "readerid": data.readerId,
                        "r": Math.random()
                    }, function(data) {
                        var str = '';
                        var html_suffix = suffix;
                        if (data.status==0) {
                            str = data.msg;
                            html_suffix = '';
                        } else if (data.status==1) {
                            var str = '';
                            var all = data.all;
                            var backgroundcolor = new Array('#D9E1F7', '#FFFFFF');
                            if (typeof all!='undefined'&&all.length>0) {
                                for (i = 0; i<all.length; i++) {
                                    var no = i+1;
                                    var divBackgroundcolor = backgroundcolor[no%2];
                                    str += '<div style="background-color:'+divBackgroundcolor+'">'+no+'.<a href="book.php?id='+all[i]['bookid']+'" target="_blank">'+all[i]['bookname']+'</a>&nbsp;<img src="/picture/images/delete.gif" style="width:13px; height:13px; cursor: pointer;"  onclick="deleteColl('+all[i]['bookid']+'); return false;" alt="���ɾ��" /><hr />';
                                }
                                $('#shopping_detail').html(str);
                                $('#shopping_detail').prepend('���ﳵ����<font color="red">'+all.length+'</font>����Ʒ<br/><button onclick="window.location=\'\/index.php\/shoppingcar\'">�޸�</button>&nbsp;<button onclick="window.location=\'\/index.php\/shoppingcar\'">ȥ����</button><br /><br />');
                            } else {
                                $('#shopping_detail').html('<br/>���ﳵ����<font color="red">0</font>����Ʒ');
                            }
                        }
                    });
                } else if (show_channel_info()=='jjqj') {
//�����澳��Ϸ����
                    var now = new Date();
                    now.setTime(now.getTime()+365*86400*1000);
                    setCookie('sid', loginsid, now, '/', '.jjqj.net');
                    setCookie('readerid', data.readerId, now, '/', '.jjqj.net');
                    setCookie('ubuntu', data.sid, now, '/', '.jjqj.net');
                    var reurl = window.location.href;
                    location.href = reurl;
                } else if (show_channel_info()=='yrt') {
                    var url = '//my.jjwxc.net/yrt/jump.php';
                    window.location.href = url
                } else if (show_channel_info()=='caifu') {
                    location.href = '//my.jjwxc.net/pay/tenpay_shortcut.php';
                    //                    window.location.href=urlCaifu
                } else if (show_channel_info()=='zfb') {
                    location.href = '//my.jjwxc.net/pay/yeepay_zfb.php';
                } else if (show_channel_info()=='jjgame'||show_channel_info()=='main'||show_channel_info()=='bbs') {
//��վ����Ϸҳ����
// ��ӹ���:�ж��û��������Ƿ�����������;
//�е�����ʾʱ�������ʾ��������
                    var clicktype = jjCookie.get('clicktype');
                    jjCookie.set('clicktype', '')
                    if (data.isBindMobile==1) {
                        var message_html = '<div style="width:16px;height:16px; position:absolute;;right: 6px;top: 6px;"><input type="image" src="//s9-static.jjwxc.net/images/x_alt_32x32.png" value="" onclick="$.unblockUI();" style="height:16px;width:16px"></div><div style="width:340px;height:120px"><div style="margin: 0 auto"><h3><font color="red">Ϊ���������˺Ű�ȫ��������ֻ���</font></h3></div><div style="margin-top:20px;height:65px;text-align:center;"><p><a href="//my.jjwxc.net/register/usersecurity.php?action=set_mobile_binding">��ʵ����֤��</a><span onclick="$.unblockUI()" target="_self" style="cursor:pointer;color: #666;">���ݲ�ʵ����</span></p> </div><div style="height:33px;width:80px;margin-top:0px;margin-left:251px;"> <img alt="������ѧ��Logo" src="//static.jjwxc.net/images/logo/logo_safe.gif"></div> </div>';
                        $.blockUI(message_html, {background: '#EEFAEE', left: '45%', width: '340px'});
                    } else if (data.notemessage) {
//�޸��û���Ϣ�������;���ȼ���  �������  �� newwindow ��
                        var message_html = '<div style="width:16px;height:16px; position:absolute;;right: 6px;top: 6px;"><input type="image" src="//s9-static.jjwxc.net/images/x_alt_32x32.png" value="" onclick="$.unblockUI();" style="height:16px;width:16px"></div><div style="width:340px;height:175px"><div style="margin: 0 auto"><h3><font color="red">�����˺Ű�ȫ��Ϣ�䶯����</font></h3></div><div style="margin-top:10px;height:125px;text-align:left"><p>&nbsp;&nbsp;&nbsp;&nbsp;'+'�װ����û����ã�ϵͳ��⵽:'+data.notemessage+',��ȷ��֪���������쳣�뾡���޸ĵ����������ϵ�ͷ�Ѱ������������˺Ű�ȫ��Ϣ�����¼�������ҵĽ�������<a href="//my.jjwxc.net/backend/logininfo.php">����ȫ��Ϣ��</a>�鿴 ��'+'</p> </div><div style="height:33px;width:80px;margin-top:0px;margin-left:251px;"> <img alt="������ѧ��Logo" src="//static.jjwxc.net/images/logo/logo_safe.gif"></div> </div>';
                        $.blockUI(message_html, {background: '#EEFAEE', left: '45%', width: '340px'});
                        //12�� ��ʧ
                        setTimeout(function() {
                            $.unblockUI()
                        }, 12000);
                    } else if (clicktype=='weakpassword'&&getCookie('newwindow')!=1) {
                        $.blockUI('�������밲ȫ����ϵ�...<p/>&nbsp;<p/><a href="//my.jjwxc.net/backend/userinfo.php">�����޸�</a><p/>&nbsp;<p/><span onclick="$.unblockUI()" target="_self">�ݲ��޸�</span>');
                        setTimeout(function() {
                            $.unblockUI()
                        }, 4000);
                    } else {
                        $.unblockUI();
                    }

                    if (show_channel_info()!='bbs') {//��̳��checklogin���ں���
                        checkLogin();
                    }
                    //�����ǩ���ղع��ܣ���Ӧ������onebook.091221.js��
                    if (clicktype=='favorite_2'||clicktype=='favorite_3') {
                        $('#'+clicktype).click();
                    } else if (clicktype=='favorite_1') {
                        favorite_novel('favorite_1');
                    } else if (clicktype=='yrt'||clicktype=='yrt_jump') {
//�����ػ
                        if (getCookie('readerid')!='null'&&getCookie('readerid')!='') {
                            $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>����ɹ���ҳ����ת��,���Ժ�...</strong>');
                            var url = '//my.jjwxc.net/yrt/jump.php';
                            window.location.href = url
                        }
                    } else {
                        if (clicktype!=null&&clicktype!='') {
                            var rel = clicktype.split('|');
                            var type = rel[0];
                            var novelid = rel[1];
                            var chapterid = rel[2];
                            //vip�Ķ�
                            if (type=='vip') {
                                var url = "//my.jjwxc.net/onebook_vip.php?novelid="+novelid+"&chapterid="+chapterid;
                                window.location.href = url;
                            } else if (type=='pay') {
//��ֵҳ���Զ���ת
                                location.href = rel[1];
                            }
                        }
                    }
                }
//վ�ڶ��ŵ�����ʾ
                if (getCookie('newwindow')==1 && !data.notemessage && /(www|my)\.jjwxc\.(net|com)/.test(window.location.href)) {
                    $.getJSON(urlhttp+'://my.jjwxc.net/getmessage.php?readerid='+data.readerId+'&action=newwindow&jsonp=?&r='+Math.random(), function(info) {
                        newWindowSms(info);
                    });
                }
                if (getCookie('commentfilterversion_key') > 0) {
                    $.getJSON('//my.jjwxc.net/backend/user_setting.php?action=getFilterWord&callback=?&r='+Math.random(), function(info) {
                        if (info.status == 200) {
                            if ('localStorage' in window && window['localStorage'] !== null && typeof localStorage.setItem === 'function') {
                                localStorage.setItem('commentfilterword_version' + data.readerId, JSON.stringify(info.data));
                            }
                        }
                    });
                }
                //$.getJSON(urlhttp+'://www.jjwxc.cn/passport/index?sid='+loginsid+'&token='+token+'&nicknameAndsign='+data.bbsnicknameAndsign+'&jsonp=?'); //�����̳Ƿ���sid
                //$.getJSON(urlhttp+'://activity.jjwxc.net/index/passport?sid='+loginsid+'&jsonp=?'); //����Ϸվ����cookie
                var url = window.location.href;
                var sendurl = '';
                if (url.indexOf('.jjwxc.net')>=0) {
                    sendurl = "bbs.jjwxc.net";
                } else if (url.indexOf('.jjwxc.com')>=0) {
                    sendurl = "bbs.jjwxc.com";
                }
                //����̳վ����cookie
                var bbsCookieUrl = urlhttp+'://'+sendurl+'/passport.php?bbstoken='+data.bbstoken+'&token='+token+'&bbsnicknameAndsign='+data.bbsnicknameAndsign+'&jsonp=?';
                $.get(bbsCookieUrl, null, function(data) {
                    if (show_channel_info()=='bbs') {
                        checkLogin();
                    } else {
                        $('body').append('<iframe style="display:none" src="'+bbsCookieUrl+'"></iframe>');//�����������ȫ���Ƶ����޷�����ʹ��iframe��ʽ����һ��
                    }
                });
                if (jump_wechat_bind==1) {
                    location.href = '//my.jjwxc.net/register/usersecurity.php?action=wechat_qrcode&wayType=login&referer='+encodeURIComponent(window.location.href);
                }

                if (show_channel_info()=='shop') {
                    $("#t_user_info").html('<img src="//static.jjwxc.net/images/loading.gif">  <strong>���Ժ�...</strong>')
                    setTimeout(function() {
                        checkLogin();
                    }, 2000);
                }
            } else if (data.state== -1) {
                var j = 1;
                var rand = 0;
                for (i = 1; i<=4; i++) {
                    rand += parseInt(Math.random()*(6-1+1)+1)*j;
                    j *= 10
                }
                $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>�����˺Ű���ʢ���ܱ����������ܱ��������ύ</b><br><br>�ܱ����� <input name="Ekey_login" class="input" id="Ekey_login" size="10" maxlength="8" />&nbsp;<input name="Challenge_login" type="hidden" id="Challenge_login" value=\"'+rand+'\" /> ��ս��'+rand+'<br><br><span id="Ekey_message" style="color: red"></span><br><br><input type="button" value="�� ��" onClick="snda_pwder()"/>&nbsp;&nbsp;&nbsp;</div>', {
                    width: '330px',
                    height: '130px',
                    cursor: 'default'
                });
            } else if (data.state==10) {
                /* var imgSrc = captchabaseurl+randid;
                var html = '<div align="center"  id="login_info_remove" ><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>����ȷ������֤���ٵ���</b><input type="hidden" name="loginname" id="loginname" value="'+data.loginname+'"><input type="hidden" name="loginpassword" id="loginpassword" value="'+data.loginpassword+'"><input type="hidden" name="cookietime" id="cookietime" value="'+data.cookietime+'"><div id="login_auth_num" style="margin:10px">��֤�� <input name="auth_num" class="input" id="auth_num" size="10" maxlength="8" />  <img src=\"'+imgSrc+'\"><span class="input_after" title="������»�ȡ��֤��" id="getauthnum" onclick="getauthnum()" style="padding-left:1em;">��һ��</span></div><input type="button" value="�� ��" onClick="jj_login(\'authcode\')"/></div>'
                $.blockUI(html, {
                    width: '330px',
                    height: '130px',
                    cursor: 'default'
                }); */
                alert('��֤�����');
                show_login(loginname, loginpasswords);
            } else if (data.state== -2) {
                $.blockUI('<div style="line-height:13px"><div style="height:0px;position:absolute;left:346px;top:12px"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><div>'+data.message+'</div><div style="text-align:center;margin-top:10px"><input type="button" value="ȷ ��" onClick="show_login()"/></div><div style="position:relative;left:250px;top:-20px;height:0px"><img src="//static.jjwxc.net/images/logo/logo_safeinfo.gif"></div></div>', {
                    width: '330px',
                    cursor: 'text',
                    'text-align': 'left',
                    'background': '#EEFAEE'

                });
            } else if (data.state== -3) {
                var html = data.message
                $.blockUI(html, {
                    width: '330px',
                    height: 'inherit',
                    cursor: 'default'
                });
            } else if (data.state == -5) {
                show_login(loginname, loginpasswords);
                showDeviceErrorCode(data.checkTypeArr, data.deviceType);
                //���ֵ�¼״̬
                if (cookietime=='true') {
                    $('#login_form.ajax_login_form [name=cookietime]').hide().prop('checked', true);
                }
                // ��ʾ��֤�����
                $(logindev+"input[name='checkdevicecode']").css({
                    borderColor: '#FF0000',
                    borderWidth: '1px',
                    appearance: 'button'
                });
                if (data.checkTypeArr[0]['type']!='device_pop_up') {
                    $('#deviceErrorTip').html(data.message).show();
                }
                if (data.checkTypeArr.length==1&&data.checkTypeArr[0]['type']=='email'&&data.email) {
                    $('.deviceTip').show().html('�����ȡ��֤�룬���ǻ����֤�뷢�͵����󶨵�����'+data.email)
                }
                $('#device_item_email').data('info', data.email);
            } else if(data.state == -10) {
                location.reload();
                return;
            } else {
                $.blockUI('<div align="center"><b>����ʧ�ܣ�</b><br />�������Ŀǰ��֧�ֽ��������������롣���ʹ��<span style="font-weight: bold; color: red;">ʢ��ͨ��֤</span>���룬<span style="border-bottom: 1px dashed #999" id="sdo_login2" onclick="show_sdo_login_block()">��������</span><br><a href="//www.jjwxc.net/register/forgot.html"  style="border-bottom: 1px dashed #999">����һ�����</a></div><div align="center"><input type="button" id="yesbuy" value="ȷ ��" onClick="$.unblockUI()"/></div>', {
                    height: '100px',
                    'text-align': 'left',
                    'background': '#EEFAEE'
                });
                if (show_channel_info()=='shop') {
                    $('#login_box').show();
                    $('#login_auth').hide();
                }
            }
        })
    }
    return false;
}

// ��ʾ�豸��֤��
function showDeviceErrorCode (checkType, deviceType) {
    if (!deviceType) {
        var regphone = /^1[3456789][0-9]{9}$/;
        if (checkType.length === 2 && regphone.test($('#loginname').val())!==false) {
            var check_type_str_arr = [];
            checkType.forEach(function(v,i){
                check_type_str_arr.push(v.type);
            })
            // �����������ʽ�Ļ��������û�������Ƿ����ֻ��ţ����ҿ��÷�ʽ�����ֻ�
            if (check_type_str_arr.indexOf('phone_stream') !== -1) {
                deviceType = 'phone_stream';
            } else if (check_type_str_arr.indexOf('phone') !== -1) {
                deviceType = 'phone';
            } else {
                deviceType = checkType[0]['type'];
            }
        } else {
            deviceType = checkType[0]['type'];
        }
    }
    var str = ''
    checkType.forEach(function(v,i){
        var showText = v.text;
        if (v.type=='wechat') {
            showText = '΢�ŷ����';
        } else if (v.type!='device'&&v.type!='device_pop_up') {
            showText = '��'+v.text;
        }
        str += '<div style="color:#337ab7;" id="device_item_'+v.type+'"><span onclick="changeDeviceType(\''+v.type+'\')">ͨ��'+showText+'��֤</span></div>';
    })

    if (checkType.length <= 1) {
        $('#other-checktype-title').html('&nbsp;');
    }
    $('#other-checktype').html(str);
    $('#deviceErrorCode').show();
    $('.login_blockui_captcha').hide();
    $('.notErrorCode').hide();
    $('#account-title').html('��ȫ��֤');

    changeDeviceType(deviceType);
    $('#deviceErrorTip').show();

    (function() {
        var loginname = $('#loginname').val();
        $('#loginname').keyup(function() {
            var newloginname = $(this).val();
            if (loginname==newloginname) {
                $('#deviceErrorCode').show();
            } else {
                $('#deviceErrorCode').hide();
            }
        })
        $('input[name=checkdevicecode]').bind('input porpertychange', function() {
            checkLoginWidowCode();
        })
    })()
}

/**
 * �������밴ť��ʽ
 */
function checkLoginWidowCode() {
    if($('input[name=checkdevicecode]').val().trim()) {
        $('#window_loginbutton').css('background','#66C266').removeAttr('disabled');
    } else {
        $('#window_loginbutton').css('background','#c7c7c7').attr('disabled','disabled');
    }
}

function newWindowSms(data) {
    var sms = data[0];
    if (!sms) {
        return false;
    }
    var btnCommonStyle = "display: inline-block;padding: 5px 12px;border-radius: 25px; width: 65px;  text-align: center;";
    var html = '<a onclick="$.unblockUI();return false;" style="font-size: 12px; text-decoration: none;left: 565px;top:5px;height: 20px; position: absolute; color: black;width:40px;" href="#">�ر�</a>' +
            '<div id="window_sms_wrapper">'+
            '        <div class="window_sms_title" style="font-size: 18px;text-align: center;">'+sms.smssubject+'</div>'+
            '        <div class="window_sms_content" style="height: 100px;overflow: auto;margin: 10px 0;">'+ sms.smsbody + '</div>'+
            '        <div class="window_sms_opration" style="text-align: center;">'+
            '            <a style="'+btnCommonStyle+'background: #FFFFFF; color: #000000;border: 1px solid #000000;" class="default_btn" href="/backend/smsbody.php?smstype='+ (sms.sms_type==2 ? 1 : 2) +'&smsid='+sms.smsid+'&year='+ sms.smsdate.substring(0, 4) +'">'+
            '               �鿴����'+
            '            </a>'+
            '            <div class="success_btn" style="'+btnCommonStyle+'background: #3bcd38;color: #ffffff;margin-left: 10px;" onclick="readWindowSmsLogin('+sms.smsid+', '+ sms.sms_type+')">����</div>'+
            '        </div>'+
            '    </div>';
    $(function() {
        $.blockUI(html, {
            width: '560px',
            height: '200px',
            left: '35%',
            align: 'left',
            top: '30%',
            cursor: 'text'
        });
    })
}

function readWindowSmsLogin(smsid, sms_type) {
    $.post("/backend/sms.php?r="+Math.random(), {smsid: smsid, smstype: (sms_type==1 ? 2 : 1), is_window_sms: 1});
    $.unblockUI();
}

//����ʢ����֤
function show_sdo_login_block() {
    $('#login_info_remove').remove();
    var url = window.location.href;
    var rurl = 'http://my.jjwxc.net/login.sdo.php?rurl='+url;
    rurl = encodeURIComponent(rurl);
    jjCookie.set('returnUrl', url, false, '.jjwxc.net');
    $.blockUI('<iframe src="//login.sdo.com/sdo/iframe/?returnURL='+rurl+'&curURL='+rurl+'&appId=910&areaId=1&geteway=true\" width=\"490\" height=\"490\"scrolling=no frameborder=0></iframe>\n\
               <img src=\'//static.jjwxc.net/images/login/close.gif\' id="close_sdo_login" style="position:absolute;top:9px;right:26px;cursor:pointer" />',
            {
                padding: '0px',
                width: '500px',
                border: '0px',
                top: '28%',
                left: '42%',
                background: 'transparent'
            });
    $('#close_sdo_login').click($.unblockUI); //Ҳ����
    return false;
}

//��ȡ��ǰ����ķ�վ��Ϣ,��վ������Ҫ���������վ����ɹ���Ĳ���
function show_channel_info() {
    var url = window.location.href;
    if (url.indexOf('jjgame')>=0) {
//��ϷƵ��
        return 'jjgame';
    } else if (url.indexOf('bbs')>=0) {
        return 'bbs';
    } else if (url.indexOf('jjqj.net')>=0) {
        return 'jjqj';
    } else if (url.indexOf('jjwxc.cn')>=0) {
//�̳�
        return 'shop';
    } else if (url.indexOf('9year')>=0) {
//������9year��ʾ9����
        return 'yrt';
    } else if (url.indexOf('caifu')>=0) {
        return 'caifu';
    } else if (url.indexOf('zfb')>=0) {
        return 'zfb';
    } else {
        return 'main';
    }
}

var pwdEncryption = function(str) {
    var k;
    $.ajax({
        url: '//my.jjwxc.net/login.php?action=setPwdKey&r='+Math.random(),
        async: false,
        success: function(data) {
            k = data;
            jjCookie.set('sidkey', k, false, '.jjwxc.net');
        }
    });
    var s = "", b, b1, b2, b3, pwdtype = "";
    if (k) {
        pwdtype = "encryption";
        var strLen = k.length;
        var a = k.split("");
        for (var i = 0; i<str.length; i++) {
            b = str.charCodeAt(i);
            b1 = b%strLen;
            b = (b-b1)/strLen;
            b2 = b%strLen;
            b = (b-b2)/strLen;
            b3 = b%strLen;
            s += a[b3]+a[b2]+a[b1];
        }
    } else {
        s = str;
    }
    return {"pwdtype": pwdtype, "pwd": s};
}

function showicon(inputName) {
    if ($('#icon-'+inputName).attr("data-show")==1) { //����
        if ($("."+inputName).attr("type")=="password") $("."+inputName)[0].type = "text";
        $('#icon-'+inputName).css("background-image", "url('//static.jjwxc.net/images/login/xianshi_icon.png')");
        $('#icon-'+inputName).attr("data-show", "2");
    } else if ($('#icon-'+inputName).attr("data-show")==2) {//����
        if ($("."+inputName).attr("type")=="text") $("."+inputName)[0].type = "password";
        $('#icon-'+inputName).css("background-image", "url('//static.jjwxc.net/images/login/yincang_icon.png')");
        $('#icon-'+inputName).attr("data-show", "1");
    }
}

/**
 * �л��豸
 */
function changeDeviceType(deviceType,clearError) {
    //�����֮ǰ�ĵ���ʱ
    clearInterval(device_code_interval);
    $(".sendcode").attr("disabled", false);
    $(".sendcode").html('��ȡ��֤��');

    $('#loginDeviceType').val(deviceType);
    $('input[name=checktype]').val(deviceType);
    $('#device_item_'+deviceType).hide().siblings().show();
    $('input[name=checkdevicecode]').val('').show();
    $('#deviceErrorTip').hide();
    $('#window_loginbutton').show();
    $('#window_loginbutton').html('����').css('background', '#C7C7C7').attr('disabled', 'disabled');
    if (deviceType=='device') {
        $('#current_device_title').html('������<span style="color: #009900;">���豸��֤��</span>');
        $('.sendcode').hide();
        $('.deviceTip').show().html('���豸��֤���ǰ�����豸��App��������-�˺��밲ȫ-�豸������������豸���¡���ȡ������֤�롱��ȡ');
    } else if (deviceType=='wechat') {
        $('#current_device_title').html('������<span style="color: #009900;">������ѧ��΢�ŷ����</span>�������͵���֤��');
        $('.sendcode').show();
        $('.deviceTip').show().html('�����ȡ��֤�룬���ǻ�ͨ����������Ű���֤�뷢�͵����󶨵�΢��');
    } else if (deviceType=='email') {
        $('#current_device_title').html('������<span style="color: #009900;">������֤��</span>');
        $('.sendcode').show();
        $('.deviceTip').show();
        var email_info = $('#device_item_email').data('info') ? $('#device_item_email').data('info') : "";
        $('.deviceTip').html('�����ȡ��֤�룬���ǻ����֤�뷢�͵����󶨵�����'+email_info);
    } else if (deviceType=='phone') {
        $('#current_device_title').html('������<span style="color: #009900;">�ֻ���֤��</span>');
        $('.sendcode').show();
        $('.deviceTip').hide();
    } else if (deviceType=='phone_stream') {
        $('input[name=checkdevicecode]').val('jjwxc').hide();
        $('.sendcode').hide();
        $('.deviceTip').show().html('������Ϣ��<span style="color: red;">�뾲��Ƭ��</span>�ٵ���·���ť</div>');
        var tipStr = '����<span onclick="'+($('#loginbywidow').val()=='1' ? 'show_login()' : 'window.open(\'//my.jjwxc.net/login.php\', \'_self\')')+'" style="color:blue;">��˷�����һ��</span>';
        $('#current_device_title').html('�������ݻ�ȡ�С���');
        // ��ȡ��Ҫ���͵�����
        $.ajax({
            url: "//android.jjwxc.net/appDevicesecurityAndroid/getDeviceSecurityCode",
            data: {'checktype': deviceType, 'username': $("#loginname").val()},
            dataType: 'json',
            type: "get",
            async: false,
            success: function(res) {
                if (res.code==200) {
                    $('#current_device_title').html(res.data.message);
                    $('#deviceErrorTip').html('');
                    $('#window_loginbutton').html('�ѷ�����֤��').css('background', '#66C266').removeAttr('disabled');
                } else {
                    $('#deviceErrorTip').show().html(res.message+tipStr);
                    $('#window_loginbutton').attr('disabled', 'disabled');
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                $('#deviceErrorTip').show().html(tipStr);
                $('#window_loginbutton').attr('disabled', 'disabled');
                console.log(XMLHttpRequest, textStatus, errorThrown);
            }
        });
    } else if (deviceType=='device_pop_up') {
        $('input[name=checkdevicecode]').val('jjwxc').hide();
        $('.sendcode').hide();
        $('#current_device_title').html('<input onclick="push();return false;" class="loginbutton" id="pop_up_login_button"  style="background: #66C266;color: #FFFFFF;font-size: 20px;width:320px;height: 40px;border-radius: 7px;border:none;cursor: pointer;margin-left:5px;text-align:center;" value="��������豸������֤">');
        $('.deviceTip').html('����Ϸ���ť�����豸������֤������������豸ȷ�ϵ��롣���豸��<span style="color: red">Android6.1.7</span>�����ϰ汾��<span style="color: red">iOS5.6.8</span>�����ϰ汾��ʹ�ô���֤��ʽ���粻���ϣ����齫���豸App���������°汾����֪Ϥ�����豸������֤����ǰ������֪ͨ�����⣬�����͵�����Ӱ�죬�����豸δ�յ�������֤����ѡ��ͨ��������ʽ������֤��');
        $('#deviceErrorTip').hide();
        $('#window_loginbutton').hide();
    }

}

//�����豸������Ϣ�����豸
var timesRun = 0;
var authKey = '';

function push() {
    var count = 60;
    var countdown = setInterval(function() {
        count--;
        $("#pop_up_login_button").val('�������豸��ȷ�ϵ��루'+count+'��');
        if (count<=0) {
            clearInterval(countdown);
        }
    }, 1000);
    // ��ȡ��Ҫ���͵�����
    var host = 'my.jjwxc.net';
    var urlhttp = getUrlHttp();
    $.ajax({
        url: urlhttp+"://"+host+"/app.jjwxc/Pc/Login/sendVerifyNotifyToMainDevice",
        data: {'loginName': $("#loginname").val(), 'jsonp': 'callback'},
        dataType: 'jsonp',
        type: "get",
        async: false,
        jsonpCallback: 'callback',
        success: function(res) {
            if (res.code==200) {
                authKey = res.data.authKey;
                var interval = setInterval(function() {
                    timesRun += 1;
                    if (authKey) {
                        $.ajax({
                            url: urlhttp+"://"+host+"/app.jjwxc/Pc/Login/askLoginRes",
                            dataType: 'jsonp',
                            type: "get",
                            async: false,
                            data: {authKey: authKey, action: "check", 'jsonp': 'callback'},
                            jsonpCallback: 'callback',
                            success: function(data) {
                                if (data.code==200) {
                                    clearInterval(interval);
                                    $("#authKey").val(authKey);
                                    if ($("#loginregisterRule").prop('checked')) {
                                        $('#login_form').submit();
                                    } else {
                                        jj_login();
                                    }
                                } else {

                                }
                            }
                        })
                        if (timesRun===60) {
                            clearInterval(interval);
                            $('#deviceErrorTip').show().html('���豸��Ȩʧ�����л�������֤��ʽ');
                            $('#pop_up_login_button').attr('disabled', 'disabled');
                        }
                    }

                }, 1000)
            } else {
                $('#deviceErrorTip').show().html('���豸��Ȩʧ�����л�������֤��ʽ');
                $('#pop_up_login_button').attr('disabled', 'disabled');
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            //$('#errormessage').show().html('�����쳣');
            console.log(XMLHttpRequest, textStatus, errorThrown);
        }
    });
}


var device_code_interval = null

function getCodeDevice() {
    var tipStr = '����<span onclick="'+($('#loginbywidow').val()=='1' ? 'show_login()' : 'window.open(\'//my.jjwxc.net/login.php\', \'_self\')')+'" style="color:blue;">��˷�����һ��</span>';
    var count_down_sec = 60;
    if ($('.sendcode').attr('disabled')==='disabled') {
        return false;
    }
    $.ajax({
        url: "//android.jjwxc.net/appDevicesecurityAndroid/getDeviceSecurityCode",
        data: {'checktype': $('.checktype').val(), 'username': $("#loginname").val()},
        dataType: 'json',
        type: "get",
        async: false,
        // jsonp: 'callback',
        //jsonpCallback: 'jsonpHandler',
        success: function(res) {
            if (res.code==200) {
                //����ʱ
                device_code_interval = setInterval(function() {
                    $(".sendcode").attr("disabled", true);
                    $('.sendcode').html('��֤���ѷ���, '+count_down_sec+'s�����»�ȡ');
                    if (count_down_sec === 0) {
                        count_down_sec = 60;
                        $('.sendcode').html("��ȡ��֤��");
                        clearInterval(device_code_interval);
                        $(".sendcode").attr("disabled", false);
                    }
                    count_down_sec--;
                }, 1000);
            } else {
                $('.sendcode').hide();
                $('#deviceErrorTip').show().html(res.message+tipStr);
                $('#window_loginbutton').attr('disabled','disabled');
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            $('.sendcode').hide();
            $('#deviceErrorTip').show().html(tipStr);
            $('#window_loginbutton').attr('disabled','disabled');
            console.log(XMLHttpRequest, textStatus, errorThrown);
        }
    });
}

window.addEventListener("message", function(event) {
    var eventData = event.data;
    if (!eventData) {
        return false;
    }
    if (eventData.type !== undefined && eventData.type === 'reload') {
        location.href = eventData.data.url;
    }
}, false);
