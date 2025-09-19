/**
 * 晋江登入处理js
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


// COOKIE控制的几个函数
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
            expire.setTime(expire.getTime()+365*86400*1000);//永久cookie设置成一年过期
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

//更新登入验证码
function getauthnum() {
    $('#login_auth_num img').attr('src', captchabaseurl+Math.random())
    $('#login_auth_num input').val('');
}

function showauthnum() {
    $('#login_info_remove #login_auth_num').show();
    $('#login_auth_num').show();
    $('#login_submit_tr').attr('rowspan', 3)//login.php页面，登入按钮排版适应
    if ($('#login_auth_num img').attr('src')=='') {
        getauthnum();
    }
    if ($('#captcha_wrapper_blockui').length === 0) {
        displayShumeiCaptcha();
    }
}

//检查是否需要登入验证码
var needauth = false;
//验证码类型
var captchaType;

function checkneedauthnum() {
    if (needauth==true) {//如果已经被判断过需要验证码了就直接显示验证码
        showauthnum()
    } else if (jjCookie.get('login_need_authnum')) {//如果cookie有输错验证码的记录，显示验证码
        needauth = true;
        showauthnum();
    } else {
        var loginname = $.trim($('#loginname').val());
        if (loginname=='笔名/邮箱/手机号') {//如果还没填用户名就统一成空
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

//统一登入界面
function show_login(username, password) {
    checkneedauthnum();
    var url = window.location.href;
    jjCookie.set('returnUrl', url, false, '.jjwxc.net');
//删除原有的页面
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
    var htmlStr = '<script type="text/javascript" src="//static.jjwxc.net/scripts/shumeiDeviceIdSdk.js?var=20230114"></script><style>#login_info_remove *{font-family: \'微软雅黑\',Arial, Helvetica, sans-serif;}#login_info_remove ul{padding-left:0}#login_info_remove li{list-style:none;}#login_form_ajax{margin: 0 auto; font-weight:bold;}#login_form_ajax .hint{font-family:\'宋体\';font-size:12px;color:#A7A7A7;margin-left:60px;margin-top:3px;font-weight:normal} #login_form_ajax label{display:inline-block;text-align:right; font-size:16px; }#login_form_ajax input{vertical-align:middle;height: 28px;width: 275px;margin-left:5px;color:black}#login_form_ajax .input_after{color:#009900;font-size:13px;}#login_form_ajax .alert{color:red}#logincaptchaimg *{display:inline-block;vertical-align:middle} </style>';
    ;
    htmlStr += '<div style="width: 100%; position: relative;height: 30px;"><a onclick="$.unblockUI();return false;" style="font-size: 12px; text-decoration: none; float:right; height: 30px;color: black;width:40px;" href="#">关闭</a></div>';
    htmlStr += '<div style="display:'+wapShow+';position:absolute;left:-1px;top:0px;">' +
            '<img src="//static.jjwxc.net/images/login/login-code.png" alt="扫码登入" style="width:107px;" onclick="$(this).hide().siblings().show();$(\'.jj-login-right\').hide().siblings(\'.jj-login-left\').show();">' +
            '<img src="//static.jjwxc.net/images/login/login-account.png" alt="账号登入" style="width: 107px;display: none;" onclick="$(this).hide().siblings().show();$(\'.jj-login-left\').hide().siblings(\'.jj-login-right\').show();"> </div>';
    htmlStr += '<div id="login_info_remove" style="width: '+loginWidth+';background: #FFFFFF;border-radius: 3px;padding:0px;margin: 0;display: flex;'+justifytype+'flex-direction: row;font-family:\'微软雅黑,宋体\',Arial, Helvetica, sans-serif;">';
    htmlStr += '<div class="jj-login-left" style="width: 410px;display: '+pcShow+';">\n'+
            '                        <div style="width: 215px;margin-left: '+leftdivleft+';text-align: center;">\n'+
            '                            <div class="login-title" style="font-size:20px;font-weight: bold;text-align: right;color:#707070;padding-right: 30px;">扫描二维码登入</div>\n'+
            '                            <div class="login-qrcode" style="text-align: right;">\n'+
            '                                <iframe width=215 height=295 frameborder=0 scrolling=no src=\'//my.jjwxc.net/backend/login/jjreader/login.php\'></iframe>\n'+
            '                            </div>\n'+
            '                        </div>\n'+
            '                        <div style="position: relative;text-align: left;">\n'+
            '                            <div class="person" style="background-image: url(\'//static.jjwxc.net/images/login/person.jpg\');background-repeat: no-repeat;background-position: 10px 20px;background-size: 130px 130px;width: 150px;height: 150px;">&nbsp;</div>\n'+
            '                            <div style="position: absolute;left:130px;padding:35px 0 0 17px;top:0px;background: url(\'//static.jjwxc.net/images/login/bubble.png\') no-repeat;background-size: 190px 88.3px;color: #999999;font-size: 14px;width: 200px;height: 95px;">\n'+
            '                                还没有<span style="font-weight: bold;">App</span>？<a href="//www.jjwxc.net/sp/JJ-app-download/" style="color: #529B2E;font-weight: bold;" target="_blank">点我下载</a>\n'+
            '                            </div>\n'+
            '                        </div>\n'+
            '                    </div>\n'+
            '                    <div style="width: 1px;height: 100%;position: relative;display: '+pcShow+'">\n'+
            '                        <div style="position:absolute;border-right: 1px solid #707070; height: 263px;top:45px;"></div>\n'+
            '                    </div>\n'+
            '                    <div class="jj-login-right" style="flex:1">\n'+
            '                        <div class="login-account" style="display: none;">\n'+
            '                            <div class="login-title" style="font-size:20px;font-weight: bold;text-align: center;color:#707070;">温馨提示</div>\n'+
            '                            <div class="account-tip" style="font-size: 16px;color: #707070;height: 340px;width:380px;margin: 18px auto 0 auto;font-weight: bold;"></div>\n'+
            '                        </div>\n'+
            '                        <div class="login-form">\n'+
            '                            <div class="login-title" id="account-title" style="font-size:20px;font-weight: bold;text-align: center;color:#707070;width: 300px;margin-left: '+leftMargin+';">账号登入</div>\n'+
            '                            <div style="margin-top:18px;">\n'+
            '                                <form id="login_form" class="ajax_login_form" name="form" method="post">\n'+
            '                                    <input type="hidden" name="pwdtype" id="pwdtype" value="" />\n'+
            '                                    <input type=\'hidden\' name=\'shumeideviceId\' id=\'shumeideviceId\' value=\'\'/>\n'+
            '                                    <input type="hidden" name="shumei_captcha_rid" class="shumei_captcha_rid">\n'+
            '                                    <input type="hidden" name="shumei_transcation" class="shumei_transcation">\n'+
            '                                    <div id="login_form_ajax">\n'+
            '                                        <div style="width:330px;margin-left:'+rightMargin+';" class="notErrorCode">\n'+
            '                                            <p><label style="font-size: 14px;color: #707070;">账号</label><input name="loginname" tabindex="1" type="text" id="loginname"  maxlength="50" value="'+username+'" placeholder=" 笔名/邮箱/手机号" onfocus="" onblur="checkneedauthnum();if(this.value==\'\'){this.style.color=\'#A7A7A7\'}" /></p>\n'+
            '                                            <p style="margin-top:10px;"><label style="font-size: 14px;color: #707070;">密码</label><input class="loginpassword" tabindex="2" name="loginpassword" type="password" id="loginpassword" value="'+password+'" maxlength="32" onfocus="$(\'.person\').css(\'background-image\',\'url('+'//static.jjwxc.net/images/login/person-back.jpg'+')\')" onblur="$(\'.person\').css(\'background-image\',\'url('+'//static.jjwxc.net/images/login/person.jpg'+')\')"/>\n'+
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
            '                                                       <div class="sendcode" style="display: none;position: absolute;top:26px;right: 40px;color:#529B2E;cursor: pointer;" onclick="getCodeDevice()">获取验证码</div>\n'+
            '                                                   </div>\n'+
            '                                                   <div id="deviceErrorTip" style="display: none;color:#ff0000;padding-left:42px;"></div>\n'+
            '                                                   <span class="deviceTip" style="display: inline-block;padding-left:42px;width: 330px;font-weight: normal;">主设备验证码可前往主设备的个人中心-账号与安全-设备管理，点击“主设备”下“获取登入验证码”获取</span>\n'+
            '                                                </div>\n'+

            '                                                <div style="margin-left:15px;padding-left: 26px;min-height:185px;">\n'+
            '                                                    <div id="other-checktype-title" style="padding-top:20px;">您也可以选择其他验证方式：</div>\n'+
            '                                                    <div id="other-checktype" style="line-height: 30px;"></div>\n'+
            '                                                </div>\n'+
            '                                            </div>\n'+
            '                                    </div>\n'+
            '                                    <div style="width:330px;margin:10px auto 0 '+rightMargin+';font-size:12px;">\n'+
            '                                        <div class="login_blockui_captcha" style="width: 100%;margin-top:10px"></div>\n'+
            '                                        <div class="registerRuleDiv notErrorCode" style="margin-top:10px;">\n'+
            '                                            <input id="login_registerRule"  '+checked+' name="registerRule" type="checkbox" >&nbsp;<label for="login_registerRule">已阅读并同意</label><a href="http://my.jjwxc.net/register/registerRule.php" target="_blank" style="color:#529B2E;">《用户注册协议》</a>和<a href="https://wap.jjwxc.net/register/showRegisterRule?src=app" target="_blank" style="color:#529B2E;">《隐私政策》</a>\n'+
            '                                        </div>\n'+
            '                                        <div class="cookietime notErrorCode" align="left">\n'+
            '                                            <input name="cookietime" id="login_cookietime" type="checkbox" id="" value="true" title="选此将在本机保存你的登入信息，请不要在公共电脑使用" />&nbsp;<label for="login_cookietime">保持登入一个月</label>\n'+
            '                                        </div>\n'+
            '                                        <div style="clear: both;margin-top: 15px;'+(widthEnough ? '' : 'text-align: center;')+'">\n'+
            '                                            <a class="notErrorCode" href="//my.jjwxc.net/register/index.html" rel="nofollow"><span class="registbutton" style="display:inline-block;width: 74px;border:1px solid #66C266; border-radius: 7px;color: #529B2E;font-size: 20px;text-align:center;line-height: 38px;font-weight: normal;">注册</span></a>\n'+
            '                                            <button onkeydown="enter()" onclick="jj_login();return false;" class="loginbutton" id="window_loginbutton" type="submit" style="background: #66C266;color: #FFFFFF;font-size: 20px;width: 220px;height: 40px;border-radius: 7px;border:none;cursor: pointer;margin-left:15px;">登入</button>\n'+
            '                                        </div>\n'+
            '                                        <div class="notErrorCode" style="color:;width:314px;text-align: center;margin:10px 0;"><span style="color:#707070; font-size:14px; font-weight:bold;fon">其他账号登入</span></div>\n'+
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
            '                            <div>我已阅读并同意<a href="//my.jjwxc.net/register/registerRule.php" target="_blank" style="color: #0089FF;">《用户注册协议》</a>和<a href="//wap.jjwxc.net/register/showRegisterRule?src=app" target="_blank" style="color: #0089FF;">《隐私政策》</a></div>\n'+
            '                            <div style="margin-top: 40px;margin-left: 230px;"><span style="margin-right: 20px;" onclick="cancelBtnFun();return false;">取消</span><span onclick="agreeBtnFun();return false;" style="background-color: #0089FF;color: white;border: none;border-radius: 5px;padding: 10px 15px;cursor: pointer;">同意</span></div>\n'+
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
                    var html = '<div id="login_auth_num" style="display:none"><p style="margin-top:10px;"><label>图案验证码</label> <input tabindex="3" name="auth_num" type="input" id="auth_num"  maxlength="32"/></p>';
                    html += '<p style="margin-top:10px;"><label></label> <img src=""><span class="input_after" title="点击重新获取验证码" id="getauthnum" onclick="getauthnum()" style="padding-left:1em;">换一个</span></p><p><label></label><span class="alert"></span></p></div>';
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
//取消同意注册协议按钮的回调函数
function cancelBtnFun(){
    $('#overlay_register_rule').hide();
    $('#popup_register_rule').hide();
}
//同意注册协议按钮的回调函数
function agreeBtnFun(){
    $('#overlay_register_rule').hide();
    $('#popup_register_rule').hide();
    $("#login_registerRule").prop('checked',true);
}

function displayShumeiCaptcha() {
    $('.login_blockui_captcha').html('<div id="captcha_wrapper_blockui">验证码加载中...</div>');
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
                //某些活动页面没有引用sdk需要手动加载
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
//初始化验证码
function initShumeiCaptcha(param) {
    //初始化验证码
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
        //验证码校验情况回调
        SMCaptcha.onSuccess(function(data) {
            //成功的时候提交表单
            if (data.pass===true) {
                //验证提交表单
                $('#login_form > .shumei_captcha_rid').val(data.rid);
            }
        })
    }
}

//加载script utf8方式
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

//检查是否已登入
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

//第三方登入提示框
function accountBinding(loginType) {
    $('.login-form').hide();
    $('.login-account').show();
    var htmlStr = '<div style="color:#000000;font-size: 14px;">';
    if (loginType=='sdo') {
        htmlStr += '1、盛大账号注册方式已暂停，请使用其他方式注册。<br><br>\n\
        2、出于账号安全考虑，我们已限制盛大通行证的登入方式，若您的账号已经绑定了手机，建议您使用账号密码进行登入。<br><br>\n\
        3、如果您的晋江文学城账号绑定了盛大通行证，但未绑定手机或邮箱，请在登入后及时进行手机或邮箱的绑定。</div>\n';
    } else {
        htmlStr += '1、如果您已经有晋江本地账户,请先【返回本地登入】，登入本地账户以后，在【我的晋江】中的绑定账户一栏，点击所需绑定的站外账户对应图标进行绑定。<br><br>\n\
        2、如果您已经绑定过晋江本地账户，或者暂未拥有晋江本地账户，可直接使用第三方登入入口直接登入。<br><br>\n\
        3、由于微博的安全政策限制，通过微博登录的用户可能需要用手机微博进行扫码验证，请您知悉。</div>\n';
    }
    htmlStr += '<div><br><a onclick="$(\'.login-form\').show();$(\'.login-account\').hide();" style="color:#529B2E;cursor:pointer;font-size:13px;font-family:\'微软雅黑,宋体\',Arial, Helvetica, sans-serif;"><<返回账号密码登入</a></div>';
    htmlStr += '<div style="color:;width:100%;text-align: center;margin-top:20px"><span style="color:#707070; font-size:14px; font-weight:bold;fon">其他账号登入</span></div></div>';
    htmlStr += '<div class="pk" style=" margin-left:20px;width:100%;"><ul>';
    htmlStr += '<li class="ott" style="float:left;list-style:none;text-align:left; margin-left:20px; margin-top:10px;"><span style="padding-top:10px;"><a href="//my.jjwxc.net/backend/login/tencent/login.php" target="_self"><img src="//static.jjwxc.net/images/login/qqlogin_new.png?ver=20190423" width="50" border="0" /></a></span>\n\
            <span style="margin-left:16px;padding-top:10px;"><a href="//my.jjwxc.net/backend/login/sinaweibo/login.php" target="_self"><img src="//static.jjwxc.net/images/login/sinaweibo_new.png?ver=20190423" width="50" border="0" /></a></span>\n\
            <span style=" margin-left:16px;padding-top:10px;"><a href="//my.jjwxc.net/backend/login/weixin/login.php" target="_self"><img src="//static.jjwxc.net/images/login/weixin_new.png?ver=20190423" width="50" border="0" /></a></span><span style=" margin-left:16px;padding-top:10px;"><a href="//my.jjwxc.net/backend/login/alipay/alipay_auth_authorize.php" target="_self"><img src="//static.jjwxc.net/images/login/zhifubao_new.png?ver=20190423" width="50" border="0" /></a></span><span style=" margin-left:16px;padding-top:10px;"><a href="#" onclick="show_sdo_login_block();return false;" ><img src="//static.jjwxc.net/images/login/login_snda_btn_new.png?ver=20190423" width="50" border="0" /></a></span></li>';
    htmlStr += '</ul></div>';
    $('.account-tip').html(htmlStr);
}


//关闭登入信息页
function login_close() {
    jjCookie.set('clicktype', '');
    $.unblockUI();
    $('#login_info_remove').remove();
    $('#login_info_for_jj_remove').remove();
    $('#login_text_info').remove();
}

//键盘回车键事件
function enter() {
    if (event.keyCode==13) {
        jj_login();
    }
}

// 首页导航点击找回账号弹窗
function login_text_info() {
    login_close();
    var html = '<div id="login_text_info">';
    html += '<div class="blockUI" style="z-index: 1001; cursor: wait; border: medium none; margin: 0pt; padding: 0pt; width: 100%; height: 100%; top: 0pt; left: 0pt; position: fixed; background-color: rgb(0, 0, 0); opacity: 0.2;   filter : Alpha(opacity=30) ;"></div>';
    html += '<div style=" position: absolute; left:50%; margin : 100px 0 0 -205px; width:410px;height:260px; z-index:5001;" >';
    html += '<div style="background: #78B053; width: 400px; height :25px; padding: 0 0 0 10px; line-height:25px; color:#FFFFFF; font-size:13px;"><b style="float:left;">温馨提示</b> <a href="#" style="float:right; font-size:12px; margin: 0 10px 0 0; text-decoration: none; color:#FFFFFF;" onclick="login_close();return false;">关闭</a></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:328px;width:5px; float:left;"> </div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:328px;width:5px; float:right;"> </div>';
    html += '<div style=" width:370px;  padding:20px 15px;  float:right; background:#fff; font-size:14px; color:#666666;line-height:14px;" >';
    html += '<p >不知道自己应该选择哪种登入方式？请用以下方式判断一下吧~</p></br>';
    html += '  <ol style="padding:0 25px; margin:0; font-size:12px;">';
    html += '<li style="list-style-type: decimal;">如果您是作者，必然可以使用笔名方式登入，我们也推荐您使用该方式登入。</li> </br>';
    html += '<li style="list-style-type: decimal;">如果您以前使用邮箱作为登入账号，则可能是晋江方式、盛大通行证方式、QQ或者支付宝方式等，可分别尝试一下再确定。</li></br>';
    html += '<li style="list-style-type: decimal;">如果您以前使用的是手机号作为登入账号，则可能是晋江方式或者盛大通行证方式等，可分别尝试一下再确定。</li></br>';
    html += '<li style="list-style-type: decimal;">如果您以前使用的是一串英文数字字母或符号“.”的组合，而它又非您的笔名，则是盛大通行证方式。 如：ceshi001、xiaohongmao、aa123456.pt、139xxxx8888.sdo等。</li><br>';
    html += '<li style="list-style-type: decimal;">其他第三方登入方式，比如QQ等，您可以到相应位置尝试。</li>';
    html += '</ol>';
    html += '<div style="height:30px ;width: 350px; float:left; margin-top: 20px; line-height:25px; font-size:14px;">';
    html += '<a href="#" style=" width: 80px;  float:right;  border: 1px solid #666666; text-decoration: none; color:#666666; text-align:center;" onclick="login_close();return false;" >确 定</a> ';
    html += '</div></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:10px;width:410px; float:left;"></div>';
    html += '</div></div>';
    $('body').prepend(html);
    return false;
}

//lj 找回密码弹出界面
function getpwdtop() {
    $('#login_info_remove').remove();
    $('#login_info_for_jj_remove').remove();
    var html = '<div id="login_info_remove">';
    // html +='<div class="blockUI" style="z-index: 1001; cursor: wait; border: medium none; margin: 0pt; padding: 0pt; width: 100%; height: 100%; top: 0pt; left: 0pt; position: fixed; background-color: rgb(0, 0, 0); opacity: 0.2;  filter : Alpha(opacity=20) ;"></div>';
    //html +='<div style=" position: absolute; left:50%; margin : 100px 0 0 -205px; width:410px;height:260px; z-index:5001;" >';
    html += '<div style="background: #78B053; width: 400px; height :25px; padding: 0 0 0 10px; line-height:25px; color:#FFFFFF ; font-size:13px;"><b style="float:left;">密码找回</b> <a href="#" style="float:right; font-size:12px; margin: 0 10px 0 0; text-decoration: none; color:#FFFFFF ;" onclick="login_close();return false;" >关闭</a></div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:320px;width:5px; float:left;"> </div>';
    html += '<div style = "background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:320px;width:5px; float:right;"> </div>';
    html += '<div style=" width:370px;height:300px;  padding:10px 15px;  float:right; background:#fff;" >';
    html += '<p style="color:#009900; margin:5px 20px 20px 20px; font-size:12px;">晋江密码找回</p>';
    html += '<ul style=" font-size:14px; text-align: center; list-style-type:none; ">';
    html += '<li style="margin:0 20px ; padding: 0 0 20px 0;border-bottom:1px dashed #E1E1E1;"> <a href="//www.jjwxc.net/register/forgot.html" style=" text-decoration: none;  " target="_blank"><b>使用绑定邮箱或绑定手机号码方式重置密码</b></a><br /></li>';
    html += '</ul>';
    html += '<p style="color:#009900; margin: 10px 20px 10px 20px; font-size:12px;"> 外站密码找回</p>';
    html += '<ul style=" font-size:14px; text-align: center; list-style-type:none; ">';
    html += '<li style="margin:0 20px ; padding: 0 0 30px 0;border-bottom:1px dashed #E1E1E1;  "><div style="height:21px; width:210px; margin: 0 auto ;line-height:21px;  font-size:14px;  ">关联或使用外站账号的密码请到相应外站找回</div></li>';
    html += '</ul>';
    html += '<p style="color:#009900; margin: 10px 20px 10px 20px; font-size:12px;"> 特殊情况密码找回</p>';
    html += '<ul style=" font-size:14px; text-align: center; list-style-type:none; ">';
    html += '<li style="margin:0 20px ; padding: 0 0 20px 0;border-bottom:1px dashed #E1E1E1;  "><a href="//help.jjwxc.net/user/password" target="_blank"><b>绑定邮箱/手机号码不能正常接收信息<br>忘记了绑定邮箱/手机号</b></a></li>';
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

// 登入ajax
function jj_login(loginsrc) {
    var urlhttp = getUrlHttp();
    var logindev = ''; //防止ajax登入和页面上的登入框冲突
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
                    $('#login_auth_num .alert').text('请输入验证码');
                    return false;
                }
            } else if (captchaType=='shumei') {
                if ($('#login_form > .shumei_captcha_rid').val()=='') {
                    alert('请先校验验证码！');
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
    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
    if (loginname==''||loginname==encodeURI('笔名/邮箱/手机号')) {
        $.blockUI('<br><div align="center" style="cursor:text;line-height:13px;"><b>请您输入账号后再登入，如果您还没有晋江账号，可以<a href="https://my.jjwxc.net/register/usersecurity.php" target="_blank"><span style="color:blue">点此注册</span></a>或使用网站现在支持的其他账号进行登入。</b><br><br><div align="center"><input type="button" id="yesbuy"  style="text-align:center" value="确 定" onClick="$.unblockUI();show_login();"/></div>', {
            height: '100px'
        });
        if (show_channel_info()=='shop') {
            $('#login_box').show();
            $('#login_auth').hide();
        }
    } else if (loginpassword=='') {
        $.blockUI('<br><div align="center" style="cursor:text;line-height:13px;"><b>请您输入密码后再登入，如果您还没有晋江账号，可以<a href="https://my.jjwxc.net/register/usersecurity.php" target="_blank"><span style="color:blue">点此注册</span></a>或使用网站现在支持的其他账号进行登入。</b><br><br><div align="center"><input type="button" id="yesbuy"  style="text-align:center" value="确 定" onClick="$.unblockUI();show_login();"/></div>', {
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
//商城登入
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
                    $('#t_user_jiong').html('<FONT color=#72A1E4>&nbsp;&nbsp;<a href="/myuser/index/action/dingdan">我的囧囧</a>&nbsp;&nbsp;<a href="'+logoutUrl+'">退出</a></font>').show();
                    $('#login_menu').html('<a href="/myuser/index/action/zancunkuan"><font color="#FF0000">我的余额</font></a>｜<a href="/myuser/index/action/dingdan"><font color="#FF0000">订单管理</font></a>｜<a href="/shoppingcar/index"><font color="#FF0000">看购物车</font></a>｜<a href="/myuser/index/action/savepass">修改密码</a>｜<a href="'+logoutUrl+'">退出登入</a>');
                    $('#userinfo').load(urlhttp+'://www.jjwxc.cn/userinfo/index/readerid/'+data.readerId+'/bookshopusername/'+data.bbsnicknameAndsign);
                    var suffix = '<div style="margin-top:10px;"><a href="/myuser/index/action/shoucang">查看购物车详情</a></div>';
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
                                    str += '<div style="background-color:'+divBackgroundcolor+'">'+no+'.<a href="book.php?id='+all[i]['bookid']+'" target="_blank">'+all[i]['bookname']+'</a>&nbsp;<img src="/picture/images/delete.gif" style="width:13px; height:13px; cursor: pointer;"  onclick="deleteColl('+all[i]['bookid']+'); return false;" alt="点击删除" /><hr />';
                                }
                                $('#shopping_detail').html(str);
                                $('#shopping_detail').prepend('购物车中有<font color="red">'+all.length+'</font>件商品<br/><button onclick="window.location=\'\/index.php\/shoppingcar\'">修改</button>&nbsp;<button onclick="window.location=\'\/index.php\/shoppingcar\'">去结账</button><br /><br />');
                            } else {
                                $('#shopping_detail').html('<br/>购物车中有<font color="red">0</font>件商品');
                            }
                        }
                    });
                } else if (show_channel_info()=='jjqj') {
//晋江奇境游戏登入
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
//主站和游戏页登入
// 添加功能:判断用户的密码是否输入弱密码;
//有弹窗提示时，这个提示不开启。
                    var clicktype = jjCookie.get('clicktype');
                    jjCookie.set('clicktype', '')
                    if (data.isBindMobile==1) {
                        var message_html = '<div style="width:16px;height:16px; position:absolute;;right: 6px;top: 6px;"><input type="image" src="//s9-static.jjwxc.net/images/x_alt_32x32.png" value="" onclick="$.unblockUI();" style="height:16px;width:16px"></div><div style="width:340px;height:120px"><div style="margin: 0 auto"><h3><font color="red">为保护您的账号安全，请进行手机绑定</font></h3></div><div style="margin-top:20px;height:65px;text-align:center;"><p><a href="//my.jjwxc.net/register/usersecurity.php?action=set_mobile_binding">【实名认证】</a><span onclick="$.unblockUI()" target="_self" style="cursor:pointer;color: #666;">【暂不实名】</span></p> </div><div style="height:33px;width:80px;margin-top:0px;margin-left:251px;"> <img alt="晋江文学城Logo" src="//static.jjwxc.net/images/logo/logo_safe.gif"></div> </div>';
                        $.blockUI(message_html, {background: '#EEFAEE', left: '45%', width: '340px'});
                    } else if (data.notemessage) {
//修改用户信息后的提醒;优先级比  弱密码高  比 newwindow 高
                        var message_html = '<div style="width:16px;height:16px; position:absolute;;right: 6px;top: 6px;"><input type="image" src="//s9-static.jjwxc.net/images/x_alt_32x32.png" value="" onclick="$.unblockUI();" style="height:16px;width:16px"></div><div style="width:340px;height:175px"><div style="margin: 0 auto"><h3><font color="red">晋江账号安全信息变动提醒</font></h3></div><div style="margin-top:10px;height:125px;text-align:left"><p>&nbsp;&nbsp;&nbsp;&nbsp;'+'亲爱的用户您好，系统检测到:'+data.notemessage+',请确认知晓，如有异常请尽快修改登入密码或联系客服寻求帮助。更多账号安全信息变更记录请点击【我的晋江】→<a href="//my.jjwxc.net/backend/logininfo.php">【安全信息】</a>查看 。'+'</p> </div><div style="height:33px;width:80px;margin-top:0px;margin-left:251px;"> <img alt="晋江文学城Logo" src="//static.jjwxc.net/images/logo/logo_safe.gif"></div> </div>';
                        $.blockUI(message_html, {background: '#EEFAEE', left: '45%', width: '340px'});
                        //12秒 消失
                        setTimeout(function() {
                            $.unblockUI()
                        }, 12000);
                    } else if (clicktype=='weakpassword'&&getCookie('newwindow')!=1) {
                        $.blockUI('您的密码安全级别较低...<p/>&nbsp;<p/><a href="//my.jjwxc.net/backend/userinfo.php">点我修改</a><p/>&nbsp;<p/><span onclick="$.unblockUI()" target="_self">暂不修改</span>');
                        setTimeout(function() {
                            $.unblockUI()
                        }, 4000);
                    } else {
                        $.unblockUI();
                    }

                    if (show_channel_info()!='bbs') {//论坛的checklogin放在后面
                        checkLogin();
                    }
                    //添加书签和收藏功能，相应函数在onebook.091221.js上
                    if (clicktype=='favorite_2'||clicktype=='favorite_3') {
                        $('#'+clicktype).click();
                    } else if (clicktype=='favorite_1') {
                        favorite_novel('favorite_1');
                    } else if (clicktype=='yrt'||clicktype=='yrt_jump') {
//易瑞特活动
                        if (getCookie('readerid')!='null'&&getCookie('readerid')!='') {
                            $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>登入成功，页面跳转中,请稍候...</strong>');
                            var url = '//my.jjwxc.net/yrt/jump.php';
                            window.location.href = url
                        }
                    } else {
                        if (clicktype!=null&&clicktype!='') {
                            var rel = clicktype.split('|');
                            var type = rel[0];
                            var novelid = rel[1];
                            var chapterid = rel[2];
                            //vip阅读
                            if (type=='vip') {
                                var url = "//my.jjwxc.net/onebook_vip.php?novelid="+novelid+"&chapterid="+chapterid;
                                window.location.href = url;
                            } else if (type=='pay') {
//充值页面自动跳转
                                location.href = rel[1];
                            }
                        }
                    }
                }
//站内短信弹窗提示
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
                //$.getJSON(urlhttp+'://www.jjwxc.cn/passport/index?sid='+loginsid+'&token='+token+'&nicknameAndsign='+data.bbsnicknameAndsign+'&jsonp=?'); //向新商城发送sid
                //$.getJSON(urlhttp+'://activity.jjwxc.net/index/passport?sid='+loginsid+'&jsonp=?'); //向游戏站发送cookie
                var url = window.location.href;
                var sendurl = '';
                if (url.indexOf('.jjwxc.net')>=0) {
                    sendurl = "bbs.jjwxc.net";
                } else if (url.indexOf('.jjwxc.com')>=0) {
                    sendurl = "bbs.jjwxc.com";
                }
                //向论坛站发送cookie
                var bbsCookieUrl = urlhttp+'://'+sendurl+'/passport.php?bbstoken='+data.bbstoken+'&token='+token+'&bbsnicknameAndsign='+data.bbsnicknameAndsign+'&jsonp=?';
                $.get(bbsCookieUrl, null, function(data) {
                    if (show_channel_info()=='bbs') {
                        checkLogin();
                    } else {
                        $('body').append('<iframe style="display:none" src="'+bbsCookieUrl+'"></iframe>');//部分浏览器安全限制导致无法跨域，使用iframe方式再来一次
                    }
                });
                if (jump_wechat_bind==1) {
                    location.href = '//my.jjwxc.net/register/usersecurity.php?action=wechat_qrcode&wayType=login&referer='+encodeURIComponent(window.location.href);
                }

                if (show_channel_info()=='shop') {
                    $("#t_user_info").html('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>')
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
                $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>您的账号绑定了盛大密宝，请输入密宝密码再提交</b><br><br>密宝密码 <input name="Ekey_login" class="input" id="Ekey_login" size="10" maxlength="8" />&nbsp;<input name="Challenge_login" type="hidden" id="Challenge_login" value=\"'+rand+'\" /> 挑战码'+rand+'<br><br><span id="Ekey_message" style="color: red"></span><br><br><input type="button" value="登 入" onClick="snda_pwder()"/>&nbsp;&nbsp;&nbsp;</div>', {
                    width: '330px',
                    height: '130px',
                    cursor: 'default'
                });
            } else if (data.state==10) {
                /* var imgSrc = captchabaseurl+randid;
                var html = '<div align="center"  id="login_info_remove" ><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>请正确输入验证码再登入</b><input type="hidden" name="loginname" id="loginname" value="'+data.loginname+'"><input type="hidden" name="loginpassword" id="loginpassword" value="'+data.loginpassword+'"><input type="hidden" name="cookietime" id="cookietime" value="'+data.cookietime+'"><div id="login_auth_num" style="margin:10px">验证码 <input name="auth_num" class="input" id="auth_num" size="10" maxlength="8" />  <img src=\"'+imgSrc+'\"><span class="input_after" title="点击重新获取验证码" id="getauthnum" onclick="getauthnum()" style="padding-left:1em;">换一个</span></div><input type="button" value="登 入" onClick="jj_login(\'authcode\')"/></div>'
                $.blockUI(html, {
                    width: '330px',
                    height: '130px',
                    cursor: 'default'
                }); */
                alert('验证码错误！');
                show_login(loginname, loginpasswords);
            } else if (data.state== -2) {
                $.blockUI('<div style="line-height:13px"><div style="height:0px;position:absolute;left:346px;top:12px"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><div>'+data.message+'</div><div style="text-align:center;margin-top:10px"><input type="button" value="确 定" onClick="show_login()"/></div><div style="position:relative;left:250px;top:-20px;height:0px"><img src="//static.jjwxc.net/images/logo/logo_safeinfo.gif"></div></div>', {
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
                //保持登录状态
                if (cookietime=='true') {
                    $('#login_form.ajax_login_form [name=cookietime]').hide().prop('checked', true);
                }
                // 显示验证码错误
                $(logindev+"input[name='checkdevicecode']").css({
                    borderColor: '#FF0000',
                    borderWidth: '1px',
                    appearance: 'button'
                });
                if (data.checkTypeArr[0]['type']!='device_pop_up') {
                    $('#deviceErrorTip').html(data.message).show();
                }
                if (data.checkTypeArr.length==1&&data.checkTypeArr[0]['type']=='email'&&data.email) {
                    $('.deviceTip').show().html('点击获取验证码，我们会把验证码发送到您绑定的邮箱'+data.email)
                }
                $('#device_item_email').data('info', data.email);
            } else if(data.state == -10) {
                location.reload();
                return;
            } else {
                $.blockUI('<div align="center"><b>登入失败！</b><br />本登入框目前仅支持晋江邮箱或笔名登入。如果使用<span style="font-weight: bold; color: red;">盛大通行证</span>登入，<span style="border-bottom: 1px dashed #999" id="sdo_login2" onclick="show_sdo_login_block()">请点击这里</span><br><a href="//www.jjwxc.net/register/forgot.html"  style="border-bottom: 1px dashed #999">点击找回密码</a></div><div align="center"><input type="button" id="yesbuy" value="确 定" onClick="$.unblockUI()"/></div>', {
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

// 显示设备验证码
function showDeviceErrorCode (checkType, deviceType) {
    if (!deviceType) {
        var regphone = /^1[3456789][0-9]{9}$/;
        if (checkType.length === 2 && regphone.test($('#loginname').val())!==false) {
            var check_type_str_arr = [];
            checkType.forEach(function(v,i){
                check_type_str_arr.push(v.type);
            })
            // 如果有两种形式的话，看下用户输入的是否是手机号，并且可用方式里有手机
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
            showText = '微信服务号';
        } else if (v.type!='device'&&v.type!='device_pop_up') {
            showText = '绑定'+v.text;
        }
        str += '<div style="color:#337ab7;" id="device_item_'+v.type+'"><span onclick="changeDeviceType(\''+v.type+'\')">通过'+showText+'验证</span></div>';
    })

    if (checkType.length <= 1) {
        $('#other-checktype-title').html('&nbsp;');
    }
    $('#other-checktype').html(str);
    $('#deviceErrorCode').show();
    $('.login_blockui_captcha').hide();
    $('.notErrorCode').hide();
    $('#account-title').html('安全验证');

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
 * 调整登入按钮样式
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
    var html = '<a onclick="$.unblockUI();return false;" style="font-size: 12px; text-decoration: none;left: 565px;top:5px;height: 20px; position: absolute; color: black;width:40px;" href="#">关闭</a>' +
            '<div id="window_sms_wrapper">'+
            '        <div class="window_sms_title" style="font-size: 18px;text-align: center;">'+sms.smssubject+'</div>'+
            '        <div class="window_sms_content" style="height: 100px;overflow: auto;margin: 10px 0;">'+ sms.smsbody + '</div>'+
            '        <div class="window_sms_opration" style="text-align: center;">'+
            '            <a style="'+btnCommonStyle+'background: #FFFFFF; color: #000000;border: 1px solid #000000;" class="default_btn" href="/backend/smsbody.php?smstype='+ (sms.sms_type==2 ? 1 : 2) +'&smsid='+sms.smsid+'&year='+ sms.smsdate.substring(0, 4) +'">'+
            '               查看详情'+
            '            </a>'+
            '            <div class="success_btn" style="'+btnCommonStyle+'background: #3bcd38;color: #ffffff;margin-left: 10px;" onclick="readWindowSmsLogin('+sms.smsid+', '+ sms.sms_type+')">已阅</div>'+
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

//弹出盛大验证
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
    $('#close_sdo_login').click($.unblockUI); //也可以
    return false;
}

//获取当前登入的分站信息,主站函数主要处理各个分站登入成功后的操作
function show_channel_info() {
    var url = window.location.href;
    if (url.indexOf('jjgame')>=0) {
//游戏频道
        return 'jjgame';
    } else if (url.indexOf('bbs')>=0) {
        return 'bbs';
    } else if (url.indexOf('jjqj.net')>=0) {
        return 'jjqj';
    } else if (url.indexOf('jjwxc.cn')>=0) {
//商城
        return 'shop';
    } else if (url.indexOf('9year')>=0) {
//易瑞特9year表示9周年
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
    if ($('#icon-'+inputName).attr("data-show")==1) { //明文
        if ($("."+inputName).attr("type")=="password") $("."+inputName)[0].type = "text";
        $('#icon-'+inputName).css("background-image", "url('//static.jjwxc.net/images/login/xianshi_icon.png')");
        $('#icon-'+inputName).attr("data-show", "2");
    } else if ($('#icon-'+inputName).attr("data-show")==2) {//密文
        if ($("."+inputName).attr("type")=="text") $("."+inputName)[0].type = "password";
        $('#icon-'+inputName).css("background-image", "url('//static.jjwxc.net/images/login/yincang_icon.png')");
        $('#icon-'+inputName).attr("data-show", "1");
    }
}

/**
 * 切换设备
 */
function changeDeviceType(deviceType,clearError) {
    //清除掉之前的倒计时
    clearInterval(device_code_interval);
    $(".sendcode").attr("disabled", false);
    $(".sendcode").html('获取验证码');

    $('#loginDeviceType').val(deviceType);
    $('input[name=checktype]').val(deviceType);
    $('#device_item_'+deviceType).hide().siblings().show();
    $('input[name=checkdevicecode]').val('').show();
    $('#deviceErrorTip').hide();
    $('#window_loginbutton').show();
    $('#window_loginbutton').html('登入').css('background', '#C7C7C7').attr('disabled', 'disabled');
    if (deviceType=='device') {
        $('#current_device_title').html('请输入<span style="color: #009900;">主设备验证码</span>');
        $('.sendcode').hide();
        $('.deviceTip').show().html('主设备验证码可前往主设备的App个人中心-账号与安全-设备管理，点击“主设备”下“获取登入验证码”获取');
    } else if (deviceType=='wechat') {
        $('#current_device_title').html('请输入<span style="color: #009900;">晋江文学城微信服务号</span>给您发送的验证码');
        $('.sendcode').show();
        $('.deviceTip').show().html('点击获取验证码，我们会通过晋江服务号把验证码发送到您绑定的微信');
    } else if (deviceType=='email') {
        $('#current_device_title').html('请输入<span style="color: #009900;">邮箱验证码</span>');
        $('.sendcode').show();
        $('.deviceTip').show();
        var email_info = $('#device_item_email').data('info') ? $('#device_item_email').data('info') : "";
        $('.deviceTip').html('点击获取验证码，我们会把验证码发送到您绑定的邮箱'+email_info);
    } else if (deviceType=='phone') {
        $('#current_device_title').html('请输入<span style="color: #009900;">手机验证码</span>');
        $('.sendcode').show();
        $('.deviceTip').hide();
    } else if (deviceType=='phone_stream') {
        $('input[name=checkdevicecode]').val('jjwxc').hide();
        $('.sendcode').hide();
        $('.deviceTip').show().html('发送信息后，<span style="color: red;">请静待片刻</span>再点击下方按钮</div>');
        var tipStr = '，请<span onclick="'+($('#loginbywidow').val()=='1' ? 'show_login()' : 'window.open(\'//my.jjwxc.net/login.php\', \'_self\')')+'" style="color:blue;">点此返回上一步</span>';
        $('#current_device_title').html('发送内容获取中……');
        // 获取需要发送的内容
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
                    $('#window_loginbutton').html('已发送验证码').css('background', '#66C266').removeAttr('disabled');
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
        $('#current_device_title').html('<input onclick="push();return false;" class="loginbutton" id="pop_up_login_button"  style="background: #66C266;color: #FFFFFF;font-size: 20px;width:320px;height: 40px;border-radius: 7px;border:none;cursor: pointer;margin-left:5px;text-align:center;" value="点此向主设备申请验证">');
        $('.deviceTip').html('点击上方按钮向主设备申请验证，申请后在主设备确认登入。主设备在<span style="color: red">Android6.1.7</span>及以上版本或<span style="color: red">iOS5.6.8</span>及以上版本可使用此验证方式，如不符合，建议将主设备App更新至最新版本。请知悉，主设备弹窗验证需提前打开推送通知，另外，受推送到达率影响，如主设备未收到弹窗验证，请选择通过其他方式进行验证。');
        $('#deviceErrorTip').hide();
        $('#window_loginbutton').hide();
    }

}

//推送设备登入信息到主设备
var timesRun = 0;
var authKey = '';

function push() {
    var count = 60;
    var countdown = setInterval(function() {
        count--;
        $("#pop_up_login_button").val('请在主设备上确认登入（'+count+'）');
        if (count<=0) {
            clearInterval(countdown);
        }
    }, 1000);
    // 获取需要发送的内容
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
                            $('#deviceErrorTip').show().html('主设备授权失败请切换其他验证方式');
                            $('#pop_up_login_button').attr('disabled', 'disabled');
                        }
                    }

                }, 1000)
            } else {
                $('#deviceErrorTip').show().html('主设备授权失败请切换其他验证方式');
                $('#pop_up_login_button').attr('disabled', 'disabled');
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            //$('#errormessage').show().html('请求异常');
            console.log(XMLHttpRequest, textStatus, errorThrown);
        }
    });
}


var device_code_interval = null

function getCodeDevice() {
    var tipStr = '，请<span onclick="'+($('#loginbywidow').val()=='1' ? 'show_login()' : 'window.open(\'//my.jjwxc.net/login.php\', \'_self\')')+'" style="color:blue;">点此返回上一步</span>';
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
                //倒计时
                device_code_interval = setInterval(function() {
                    $(".sendcode").attr("disabled", true);
                    $('.sendcode').html('验证码已发送, '+count_down_sec+'s后重新获取');
                    if (count_down_sec === 0) {
                        count_down_sec = 60;
                        $('.sendcode').html("获取验证码");
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
