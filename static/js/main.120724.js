var httpProtocol = getUrlHttp();

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

function MyTemplate(html) {
    this.html = html;
    var re = /(<%|{%|<script>)([\s\S]*?)(%}|%>|<\/script>)/g;
    var reExp = /(([\s\S]*)?(if|for|else|switch|case|break|{|}|var))([\s\S]*)?/g;
    var code = 'var r=[];\n';
    var cursor = 0;
    var add = function(line, js) {

        js ? (code += line.match(reExp) ? line+'\n' : 'r.push('+line+');\n') :
            (code += line!='' ? 'r.push("'+line.replace(/"/g, '\\"')+'");\n' : '');
        return add;
    }
    var match;
    while (match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[2], true);
        cursor = match.index+match[0].length;
    }

    add(html.substr(cursor, html.length-cursor));
    code += 'return r.join("");';
    this.code = code;
    var tplfunc = new Function(code.replace(/[\r\t\n]/g, ''));
    this.render = function(data) {
        return tplfunc.apply(data)
    }
    return this;
}

String.prototype.render = function(data) {
    var html = this;
    var tpl = new MyTemplate(html);
    return tpl.render(data);
}

//���������
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

//�еĵط�����es6��forEach���Ͱ汾������޷����� ��Polyfill��ʵ�ּ���һ��
if (!Array.prototype['forEach']) {
    Array.prototype.forEach = function(callback, thisArg) {
        if (this==null) {
            throw new TypeError('Array.prototype.forEach called on null or undefined');
        }
        var T, k;
        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);
        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length>>>0;
        // 4. If isCallable(callback) is false, throw a TypeError exception.
        // See: https://es5.github.com/#x9.11
        if (typeof callback!=="function") {
            throw new TypeError(callback+' is not a function');
        }
        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length>1) {
            T = thisArg;
        }
        // 6. Let k be 0
        k = 0;
        // 7. Repeat, while k < len
        while (k<len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //    This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty
            //    internal method of O with argument Pk.
            //    This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {
                // i. Let kValue be the result of calling the Get internal
                // method of O with argument Pk.
                kValue = O[k];
                // ii. Call the Call internal method of callback with T as
                // the this value and argument list containing kValue, k, and O.
                callback.call(T, kValue, k, O);
            }
            // d. Increase k by 1.
            k++;
        }
        // 8. return undefined
    };
}

if (top!=self) {
    var f = document.createElement("form");
    f.action = location;
    f.target = "_parent";
    f.method = 'post';
    document.body.appendChild(f);
    f.submit();
}
var url = window.location.href //��ȡ��ǰURL
var domain = '';
url = url.split("?")[0];
domain = url.split(".net/")[0]+'.net/';
url = url.split(".net/")[1];

// �񵥺��ü��ص���Ч;
function lazyloadimg() {
//    imgs = document.getElementsByTagName("img");
    imgs = $('.rearLoading img');// ָ����ǩ�������
    imgsnum = imgs.length;
    for (i = 0; i<imgsnum; i++) {
        if ((typeof (imgs[i].src)=='undefined'||imgs[i].src==''||imgs[i].src.indexOf('readyLoading')>0)&&imgs[i].getAttribute('imgsrc')!=null) {
            imgs[i].src = imgs[i].getAttribute('imgsrc');
        }
    }
}


// --- ��ΪIE6��֧��indexOf����
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start||0), j = this.length; i<j; i++) {
            if (this[i]==obj) {
                return i;
            }
        }
        return -1;
    }
}

//���Cookie��ԭʼֵ
function getCookieCN(name) {
    var arg = name+"=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i<clen) {
        var j = i+alen;
        if (document.cookie.substring(i, j)==arg)
            return getCookieVal(j);
        i = document.cookie.indexOf(" ", i)+1;
        if (i==0)
            break;
    }
    return null;
}

//���Cookie������ֵ
function getCookieVal(offset) {
    var endstr = document.cookie.indexOf(";", offset);
    if (endstr== -1)
        endstr = document.cookie.length;
    return decodeURI(document.cookie.substring(offset, endstr));
}

function CookieEnable() {
    var url = window.location.href;
    var result = false;
    if (navigator.cookiesEnabled)
        return true;
    if (url.indexOf('9917')>=0) {
        setCookie('testcookie', 'yes', 0, '/', '.9917.com');
    } else if (url.indexOf('jjqj')>=0) {
        setCookie('testcookie', 'yes', 0, '/', '.jjqj.net');
    } else if (url.indexOf('91pod')>=0) {
        setCookie('testcookie', 'yes', 0, '/', '.91pod.com');
    } else if (url.indexOf('jjwxc.cn')>=0) {
        setCookie('testcookie', 'yes', 0, '/', '.jjwxc.cn');
    } else {
        setCookie('testcookie', 'yes', 0, '/', '.jjwxc.net');
    }
    if (getCookie('testcookie')=='yes')
        result = true;
    return result;
}

//---����ʱ��
clientTimeZone = (new Date().getTimezoneOffset()/60)*(-1);
if (clientTimeZone<=0) {
    timeZoneOffset = (Math.abs(clientTimeZone)+8)*3600000;
} else if (clientTimeZone>=1&&clientTimeZone<=7) {
    timeZoneOffset = (8-clientTimeZone)*3600000;
} else if (clientTimeZone>8) {
    timeZoneOffset = -((clientTimeZone-8)*3600000);
} else {
    timeZoneOffset = 0;
}

/**
 *
 * ���з�վ����Ʊ�°��ܰ��ڷ�ָ������js
 */
$(function() {
    $bdhe_lef = $(".Over_one_tit ul li")
    $bdhe_lef.click(function() {
        $(this).addClass("hover").siblings().removeClass("hover");
        index = $(this).parents().children().index(this);
        $(this).parents("ul").siblings("a").eq(index).show().siblings("a").hide();
        $(this).parents(".Over_one_tit").siblings(".b4box1").children("ul").eq(index).show().siblings().hide();
    })
})

function showTime() {
    if (getCookie("timeOffset_o")==null) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.src = "//my.jjwxc.net/servertime.php";
        script.onload = script.onreadystatechange = function() {
            if (!this.readyState||this.readyState=="loaded"||this.readyState=="complete") {
                clientTime = new Date();
                if (typeof (serverTime_new)=='undefined') {
                    myTimeOffset = 0;
                } else {
                    myTimeOffset = serverTime_new-clientTime.getTime()+timeZoneOffset;
                }
                echoTime(myTimeOffset);
                setCookie("timeOffset_o", myTimeOffset, new Date(eval(clientTime.getTime()+86400*7*1000)));
                script.onload = script.onreadystatechange = null;
            }
        };
        head.appendChild(script);
    } else {
        myTimeOffset = getCookie("timeOffset_o");
        echoTime(myTimeOffset);
    }
}

function echoTime(myTimeOffset) {
    clientTime = new Date();
    var realTime = new Date(Number(clientTime.getTime())+Number(myTimeOffset));
    var year = realTime.getFullYear().toString().slice(-2);
    var month = realTime.getMonth()+1;
    var date = realTime.getDate();
    var hours = realTime.getHours();
    var minutes = realTime.getMinutes();
    //var seconds = realTime.getSeconds();
    var timeValue = '����ʱ�� '+year+'��'+month+'��'+date+'��'+' ';

    timeValue += hours;
    timeValue += ((minutes<10) ? ":0" : ":")+minutes;
    o = document.getElementById('serverTime');
    if (typeof (o)!='undefined'&&null!=o) {
        o.innerHTML = timeValue;
        setTimeout("echoTime("+myTimeOffset+")", 60000);
    }
}

// ��ȡURI����
function getURLParam(strParamName) {
    var strReturn = "";
    var strHref = window.location.href;
    if (strHref.indexOf("?")> -1) {
        var strQueryString = strHref.substr(strHref.indexOf("?")).toLowerCase();
        var aQueryString = strQueryString.split("&");
        for (var iParam = 0; iParam<aQueryString.length; iParam++) {
            if (aQueryString[iParam].indexOf(strParamName+"=")> -1) {
                var aParam = aQueryString[iParam].split("=");
                strReturn = aParam[1];
                break;
            }
        }
    } else if (url.indexOf('book/')!= -1||url.indexOf('vip/')!= -1) {
        var reg = /(book|vip)\/([0-9]+)\/?([0-9]*)/
        var params = reg.exec(strHref);
        if (strParamName=='novelid') {
            strReturn = params[2];
        } else if (strParamName=='chapterid') {
            strReturn = params[3];
        }
    }
    return strReturn;
}

(function() {
// --- ��¼�û�λ���ĸ���վ���
    var fenpin = {
        'yq':[
                "bgg.html",
                "bgx.html",
                "qc.html",
                "chy.html",
                "wx.html",
                "kh.html"
        ],
        "dm":[
                "tr.html",
                "ys.html",
                "bl.html",
                "blhx.html",
                "gbl.html",
                "bh.html",
                "nocp.html",
                "dtr.html",
                "ysnocp.html",
                "wlhx.html",
        ]
    };
    var href = window.location.href;
    var parts = href.split('/');
    var fenzhanindex = parts.indexOf('fenzhan')+1;
    if (fenzhanindex>0&&parts.length>fenzhanindex) {
        var cookievalue = parts[fenzhanindex];
        var fenpinvalue = parts[fenzhanindex+1];
        if (cookievalue=='dm'&&fenpinvalue=='bh.html') {
            cookievalue = 'bh';
        }
        jjCookie.set('fenzhan', cookievalue, true, '.jjwxc.net');
        if (typeof fenpin[cookievalue]!="undefined"&&fenpin[cookievalue].indexOf(fenpinvalue)>=0) {
            jjCookie.set('fenpin', fenpinvalue, true, '.jjwxc.net');
        }
    }
}());

var LoginInfo = (function () {
    var login_info = undefined;
    // 'uninitialized' | 'guest' | 'ok' | 'failed'
    var login_state = 'uninitialized';

    var use_storage = (typeof JSON === 'object' && typeof localStorage === 'object');
    var readerid = getCookie('readerid') || '';
    var login_info_storage_key = 'jj_login_info_20250825_' + readerid;
    var client_persist = {};
    var refreshed = false;

    function write_storage() {
        if (!use_storage) {
            return;
        }
        try {
            var payload = {
                time: Date.now(),
                state: login_state,
                data: (login_state === 'ok' ? login_info : null),
                persist: client_persist || {}
            };
            localStorage.setItem(login_info_storage_key, JSON.stringify(payload));
        } catch (e) {
            console.dir(e);
        }
    }

    function read_storage() {
        if (!use_storage) {
            return false;
        }
        try {
            var storage = localStorage.getItem(login_info_storage_key);
            if (!storage) {
                return false;
            }
            storage = JSON.parse(storage);

            if (storage && storage.time && (Date.now() - storage.time) < 86400000) {
                login_state = storage.state || (storage.data ? 'ok' : 'failed');
                // data === undefined ��Ϊδ��ȡ��null ��Ϊʧ��
                login_info = (Object.prototype.hasOwnProperty.call(storage, 'data') ? storage.data : undefined);
                client_persist = (storage && typeof storage.persist === 'object' && storage.persist) ? storage.persist : {};
                return true;
            }
        } catch (e) {
            console.dir(e);
        }
        return false;
    }

    function get_data(refresh = false) {
        if (!readerid) {
            login_state = 'guest';
            login_info = null;
            return;
        }

        if (!refresh && read_storage()) {
            return;
        }

        if (!refresh && login_state === 'ok') {
            return;
        }
        refreshed = true;
        $.ajax({
            url: '/app.jjwxc/Pc/Login/checklogin',
            async: false,
            success: function (json) {
                if (json && json.code == 200 && json.data) {
                    login_state = 'ok';
                    login_info = json.data;
                    write_storage();
                } else {
                    login_state = 'failed';
                    login_info = null;
                }
            },
            error: function () {
                // �������Ҳ��ʧ�ܴ���
                login_state = 'failed';
                login_info = null;
            }
        });
    }

    function get_from_data(field) {
        if (login_state !== 'ok' || !login_info) {
            return {hit: false, value: null};
        }
        if (!Object.prototype.hasOwnProperty.call(login_info, field)) {
            return {hit: false, value: null};
        }
        var v = login_info[field];
        if (v === undefined || v === null) {
            return {hit: false, value: null};
        }
        return {hit: true, value: v};
    }

    function get_from_persist(field) {
        if (!client_persist || typeof client_persist !== 'object') return null;
        return Object.prototype.hasOwnProperty.call(client_persist, field) ? client_persist[field] : null;
    }

    return {
        get: function (field) {
            if (login_state === 'uninitialized') {
                get_data(false);
            }
            var d = get_from_data(field);
            if (d.hit) {
                return d.value;
            }
            return get_from_persist(field);
        },

        set: function (field, value, is_persist = false) {
            if (login_state !== 'ok' || !login_info) {
                get_data(false);
            }

            if (is_persist) {
                if (!client_persist || typeof client_persist !== 'object') {
                    client_persist = {};
                }
                client_persist[field] = value;
            } else {
                login_info[field] = value;
            }

            write_storage();
        },

        // ���ص�ǰ״̬��'uninitialized' | 'guest' | 'ok' | 'failed'
        status: function () {
            return login_state;
        },
        refresh: function () {
            if (refreshed) {
                return;
            }
            get_data(true)
        }
    };
})();

var cookieNickName = (function () {
    var nickname, nickname_empty;
    var data_initialized = false;
    function init_data() {
        data_initialized = true;
        nickname = LoginInfo.get('nickname') || '';
        var login_status = LoginInfo.status();
        if (login_status == 'ok') {
            nickname_empty = !nickname;
        } else {
            nickname_empty = false;
            nickname = '�ǳƻ�ȡʧ��';
        }
    }

    return {
        is_empty: function () {
            if (!data_initialized) {
                init_data();
            }
            if (nickname_empty) {
                LoginInfo.refresh();
                init_data();
            }
            var nickname_set = LoginInfo.get('nickname_set') || 0;
            return nickname_empty && nickname_set != 1;
        },
        get: function () {
            if (!data_initialized) {
                init_data();
            }
            return nickname;
        },
        set: function (nick) {
            nickname = nick
            nickname_empty = false;
            LoginInfo.set('nickname', nick);
            LoginInfo.set('nickname_set', 1, true);
        }
    }
})();


// ������֤
function checkLogin() {
    if (getCookie("readerid")!=null&&getCookie("ubuntu")) {
        if ($('#replacediv').length>0) {
            window.location.reload();
        }
        try{
            jjCookie.clearKey(true);
        }catch (e) {
            console.dir(e)
        }

        var is_nickname_empty = cookieNickName.is_empty();
        showUserInfo();
        if (is_nickname_empty) {
            if (show_channel_info()!='jjgame') {
                nickname_ui();
            }
            cookieNickName.set('')
        }
        if (getCookie("cookieofauthorid")!=null||(getCookie("authorid")!=null&&getCookie("authorid")!='')) {
            writer();
        } else {
            reader();
        }
        getMessage();
        setUserSigninHtml();
        getExamineLeft(getCookie("readerid"));
    } else {
        guest();
    }
}

// -- �û������˵�,�������
function guest() {
    lt = (getCookie("logintype")!='jjwxc') ? ' selected' : '';
    var s = '<input type="hidden" name="noallow_pop" id="noallow_pop" value="0">';
    s += '<input type="hidden" name="USEUUID" value="0">';
    s += '<a href="#" id="jj_login">����</a>&nbsp;&nbsp;&nbsp;'
    s += '<input type="hidden" name="Ekey" id="Ekey" value=""/><input name="Challenge" type="hidden" id="Challenge" value=""/>';
    s += '<a id="register" href="https://my.jjwxc.net/register/usersecurity.php" target="_parent" rel="nofollow" onclick="_czc.push([\'_trackEvent\', \'WWW��ҳ\', \'���\', \'ע�ᰴť\']);">ע��</a>&nbsp;&nbsp;&nbsp;';
    s += '<a href="#"  onclick="login_text_info();return false;">�һ��˺�</a>&nbsp;&nbsp;&nbsp;';
    s += '<a href="#" onclick="getpwdtop(); return false;">�һ�����</a>&nbsp;&nbsp;&nbsp;';
    // s +='<a href="http://www.jjwxc.net/onebook.php?novelid=494708&chapterid=4" target="_blank"><img src="//static.jjwxc.net/images/jj-fox.gif" width="100" height="18" border="0" /></a>';
    s += '</form>';
    $("#t_user_nav").html(s);
}

function writer() {
    jsid = '?jsid='+getCookie("readerid")+'-'+Math.random();
    var islocaluser = (getCookie("islocaluser")!=null) ? getCookie("islocaluser") : '';//�ж��Ƿ�Ϊ�����û�
    var logoutUrl;
    if (islocaluser==1) {
        logoutUrl = "//my.jjwxc.net/backend/logout.php"+jsid+'&returnUrl='+URLEncode(window.location.href);
    } else {
        var encodeUrl = URLEncode("//my.jjwxc.net/backend/logout.php"+jsid);
        //ʢ���û��˳���ȥʢ���˳���url�ӵ��˳��ɹ��󷵻ص�ҳ���ַ��
        logoutUrl = "http://cas.sdo.com/cas/logout?url="+encodeUrl;
    }
    //�����Ȩ��
    var examineright = (getCookie("examineright")!=null) ? getCookie("examineright") : '';
    var examstr;
    if (examineright==1) {
        examstr = "<li class='examinenav examineli'><a href=\"\/\/my.jjwxc.net\/backend\/comment_check.php"+jsid+"\"><span><font color=\"red\"><b>����ý�����</b><\/font><\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul style='width: 125px;'><li><a href=\"\/\/my.jjwxc.net\/backend\/examine_read_primary.php"+jsid+"\"><font color=\"red\">��������<font class=\"examine_left_novel\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/bbs_check.php"+jsid+"\"><font color=\"red\">��̳����<font class=\"examine_left_bbs\"><\/font>&nbsp;<\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/comment_check.php"+jsid+"\"><font color=\"red\">��������<font class=\"examine_left_comment\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=4\"><font color=\"red\">����ר������<font class=\"examine_left_reader_column\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=3\"><font color=\"red\">����ר������<font class=\"examine_left_author_column\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=6\"><font color=\"red\">�İ�����<font class=\"examine_left_novel_summary\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/user_comment_appeal.php"+jsid+"\"><font color=\"black\">�������<\/font><\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>";
    } else {
        examstr = "";
    }
    var t_menu = "<ul class=\"cssMenu cssMenum\">"+
            "<li><a href=\"\/\/my.jjwxc.net\/backend\/logininfo.php"+jsid+"\"><span>�ҵĽ���<\/span><\/a><ul><li><a href=\"//my.jjwxc.net/backend/logininfo.php"+jsid+"\">��ȫ��Ϣ<\/a><\/li><li><a href=\"//my.jjwxc.net/backend/userinfo.php"+jsid+"\">������Ϣ<\/a><\/li><li><a href=\"//my.jjwxc.net/backend/sms.php"+jsid+"\">վ�ڶ���<\/a><\/li><li><a href=\"//my.jjwxc.net/backend/user_setting.php"+jsid+"\">��������<\/a><\/li><\/ul><\/li>" +
            "<li><a href=\"\/\/my.jjwxc.net\/backend\/favorite.php"+jsid+"\"><span>����<\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td algin=\"center\"><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/backend\/favorite.php"+jsid+"\">�ղ��б�<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/booklist.php"+jsid+"&from=logininfo\">�ҵ��鵥<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/top100.php"+jsid+"\">TOP��ѡ<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/favoriteauthor.php"+jsid+"&from=logininfo\">�����ղ�<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/favoritereader.php"+jsid+"&from=logininfo\">��ע�б�<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/commentshistory.php"+jsid+"\">������¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/vip_services.php"+jsid+"\">VIP����<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/novel_lucky_draw.php?action=readerluckydraw\">�н���¼<\/a></li><li><a href=\"\/\/my.jjwxc.net\/backend\/readerKingTickets.php"+jsid+"\">����Ʊ��¼<\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>" +
            "<li id=\"is_writer\" style=\"display:none\"><a href=\"\/\/my.jjwxc.net\/backend\/oneauthor_login.php"+jsid+"\"><span>д��<\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/backend\/publish.php"+jsid+"\">��������<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/oneauthor_login.php"+jsid+"\">���¾���<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/novelcomment.php"+jsid+"\">���յ�������<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/goodnovelrecommend.php"+jsid+"\">��������<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/contract.php"+jsid+"\">��ҪǩԼ<\/a><\/li><li><a href=\"\/\/www.jjwxc.net\/sp\/author_questions\/index.php"+jsid+"\">����ר��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/vipnovel.php"+jsid+"\">�Լ����<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/complaint.php"+jsid+"\">����Ͷ��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/authorKingTickets.php"+jsid+"\">����Ʊ<\/a></li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>" +
            "<li><a href=\"\/\/my.jjwxc.net\/backend\/bankbook.php"+jsid+"\"><span>����<\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/backend\/bankbook.php"+jsid+"\">�ҵ����<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/sendpointlist.php"+jsid+"\">���ּ�¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/consumerecord.php"+jsid+"\">���Ѽ�¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/incomerecord.php"+jsid+"\">�����¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/payrecord.php"+jsid+"\">����һ�<\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li><li><a href=\"\/\/my.jjwxc.net\/pay\/yeepay_zfb.php"+jsid+"\"><span><font color=\"red\">��ֵ<\/font><\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/pay\/yeepay_zfb.php\">֧����֧��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/pay\/weixinPay\/weixinPay.php\">΢��֧��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/fenzhan\/yq\/action_center.html"+jsid+"\">���¿�����<\/a><\/li><li><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>"+examstr+"<li><a href=\""+logoutUrl+"\" title=\"�˳�����״̬\">�˳�<\/a><\/li><\/ul>";
    $("#t_user_nav").html(t_menu);
    $('#is_writer').show();
}

function reader() {
    jsid = '?jsid='+getCookie("readerid")+'-'+Math.random();
    var encodeUrl = URLEncode("http://my.jjwxc.net/backend/logout.php"+jsid);
    var islocaluser = (getCookie("islocaluser")!=null) ? getCookie("islocaluser") : '';//�ж��Ƿ�Ϊ�����û�
    if (islocaluser==1) {
        var logoutUrl = "//my.jjwxc.net/backend/logout.php"+jsid;
    } else {
        //ʢ���û��˳���ȥʢ���˳���url�ӵ��˳��ɹ��󷵻ص�ҳ���ַ��
        var logoutUrl = "http://cas.sdo.com/cas/logout?url="+encodeUrl;
    }
    if (getCookie("authorid")!='') {
        var registerAuthorUrl = ""
    } else {
        var registerAuthorUrl = "<li><a href=\"\/\/my.jjwxc.net\/register\/registeauthor.php"+jsid+"\"><font color=red>��Ҫ��Ϊ����</font><\/a></li>"
    }
    //�����Ȩ��
    var examineright = (getCookie("examineright")!=null) ? getCookie("examineright") : '';
    var examstr;
    if (examineright==1) {
        examstr = "<li class=\"examineli\"><a href=\"\/\/my.jjwxc.net\/backend\/comment_check.php"+jsid+"\"><span><font color=\"red\"><b>����ý�����</b><\/font><\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul style='width: 125px;'><li><a href=\"\/\/my.jjwxc.net\/backend\/examine_read_primary.php"+jsid+"\"><font color=\"red\">��������<font class=\"examine_left_novel\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/comment_check.php"+jsid+"\"><font color=\"red\">��������<font class=\"examine_left_comment\"><\/font>&nbsp;<\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/bbs_check.php"+jsid+"\"><font color=\"red\">��̳����<font class=\"examine_left_bbs\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=4\"><font color=\"red\">����ר������<font class=\"examine_left_reader_column\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=3\"><font color=\"red\">����ר������<font class=\"examine_left_author_column\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=6\"><font color=\"red\">�İ�����<font class=\"examine_left_novel_summary\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/user_comment_appeal.php"+jsid+"\"><font color=\"black\">�������<\/font><\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>";
    } else {
        // examstr = "<li class=\"examineli\"><a href=\"\/\/my.jjwxc.net\/backend\/comment_check.php"+jsid+"\"><span><font color=\"blue\">����ý�����<\/font><\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul style='width: 125px;'><li><a href=\"\/\/my.jjwxc.net\/backend\/examine_read_primary.php"+jsid+"\">��������<font class=\"examine_left_novel\"><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/bbs_check.php"+jsid+"\">��̳����<font class=\"examine_left_bbs\"><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=4\"><font>����ר������<font class=\"examine_left_reader_column\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=3\"><font>����ר������<font class=\"examine_left_author_column\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/textFlowCheck.php"+jsid+"&type=6\"><font>�İ�����<font class=\"examine_left_novel_summary\"><\/font><\/font><\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/user_comment_appeal.php"+jsid+"\"><font color=\"black\">�������<\/font><\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>";
         examstr = "";
    }

    var t_menu = "<ul class=\"cssMenu cssMenum\">" +
            "<li><a href=\"\/\/my.jjwxc.net\/backend\/logininfo.php"+jsid+"\"><span>�ҵĽ���<\/span><\/a><ul>" +
            "<li><a href=\"//my.jjwxc.net/backend/logininfo.php\">��ȫ��Ϣ<\/a><\/li>" +
            "<li><a href=\"//my.jjwxc.net/backend/userinfo.php\">������Ϣ<\/a><\/li><li><a href=\"//my.jjwxc.net/backend/sms.php\">վ�ڶ���<\/a><\/li><li><a href=\"//my.jjwxc.net/backend/user_setting.php"+jsid+"\">��������<\/a><\/li><\/ul><\/li>" +
            "<li><a href=\"\/\/my.jjwxc.net\/backend\/favorite.php"+jsid+"\"><span>����<\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td algin=\"center\"><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/backend\/favorite.php"+jsid+"\">�ղ��б�<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/booklist.php"+jsid+"&from=logininfo\">�ҵ��鵥<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/top100.php"+jsid+"\">TOP��ѡ<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/favoriteauthor.php"+jsid+"&from=logininfo\">�����ղ�<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/favoritereader.php"+jsid+"&from=logininfo\">��ע�б�<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/commentshistory.php"+jsid+"\">������¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/vip_services.php"+jsid+"\">VIP����<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/novel_lucky_draw.php?action=readerluckydraw\">�н���¼<\/a></li><li><a href=\"\/\/my.jjwxc.net\/backend\/readerKingTickets.php"+jsid+"\">����Ʊ��¼<\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li>"+registerAuthorUrl+"<\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>" +
            "<li><a href=\"\/\/my.jjwxc.net\/register\/registeauthor.php"+jsid+"\"><span>д��<\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul id=\"is_writer\" style=\"display:none\"><li><a href=\"\/\/my.jjwxc.net\/backend\/publish.php"+jsid+"\">��������<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/oneauthor_login.php"+jsid+"\">���¾���<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/novelcomment.php"+jsid+"\">���յ�������<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/goodnovelrecommend.php"+jsid+"\">��������<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/contract.php"+jsid+"\">��ҪǩԼ<\/a><\/li><li><a href=\"\/\/www.jjwxc.net\/sp\/author_questions\/index.php"+jsid+"\">����ר��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/vipnovel.php"+jsid+"\">�Լ����<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/complaint.php"+jsid+"\">����Ͷ��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/authorKingTickets.php"+jsid+"\">����Ʊ<\/a></li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>" +
            "<li><a href=\"\/\/my.jjwxc.net\/backend\/bankbook.php"+jsid+"\"><span>����<\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/backend\/bankbook.php"+jsid+"\">�ҵ����<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/sendpointlist.php"+jsid+"\">���ּ�¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/consumerecord.php"+jsid+"\">���Ѽ�¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/incomerecord.php"+jsid+"\">�����¼<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/backend\/payrecord.php"+jsid+"\">����һ�<\/a><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li><li><a href=\"\/\/my.jjwxc.net\/pay\/yeepay_zfb.php"+jsid+"\"><span><font color=\"red\">��ֵ<\/font><\/span><![if gt IE 6]><\/a><![endif]><!--[if lte IE 6]><table><tr><td><![endif]--><ul><li><a href=\"\/\/my.jjwxc.net\/pay\/yeepay_zfb.php\">֧����֧��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/pay\/weixinPay\/weixinPay.php\">΢��֧��<\/a><\/li><li><a href=\"\/\/my.jjwxc.net\/fenzhan\/yq\/action_center.html"+jsid+"\">���¿�����<\/a><\/li><!--[if lte IE 6]><iframe src=\"about:blank\"style=\"position:absolute; visibility:inherit; top:0px; left:0px; width:100%; height:102px; z-index:-1; filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';\"frameborder=\"0\"><\/iframe><![endif]--><\/li><\/ul><!--[if lte IE 6]><\/td><\/tr><\/table><\/a><![endif]--><\/li>"+examstr+"<li><a href=\""+logoutUrl+"\" title=\"�˳�����״̬\">�˳�<\/a><\/li><\/ul>";

    $("#t_user_nav").html(t_menu);
}

//��ȡ��������ʣ��
function getExamineLeft(readerid) {
    if ($('font[class^="examine_left_"]').length > 0) {
        var cache_key = 'examine_left_num_' + readerid;
        var left_num_cache = getCookie(cache_key);
        if (left_num_cache === null || left_num_cache === '') {
            $.ajax({
                url: httpProtocol+"://my.jjwxc.net/lib/ajax.php?action=getExaminLeftNum&readerid="+readerid,
                dataType: 'jsonp',
                type: "get",
                jsonp: 'callback',
                jsonpCallback: 'success_jsonpCallback20201111',
                success: function(res) {
                    if (res.status=="200") {
                        var data = res.data;
                        for (i in data) {
                            $('.examine_left_'+i).html('('+data[i]+')');
                        }
                        setCookie(cache_key, JSON.stringify(data), new Date(eval((new Date()).getTime()+60000)), '/');
                    }
                }
            });
        } else {
            left_num = JSON.parse(left_num_cache);
            for (i in left_num) {
                $('.examine_left_'+i).html('('+left_num[i]+')');
            }
        }
    }

}

//�û��ǳƵ�������
function nickname_ui() {
    var html = '<div id=nickname style=" position: absolute; left:50%; margin : 300px 0 0 -205px; width:410px;height:260px; z-index:5001;">';
    html += '<div style="background: #78B053; width: 400px; height :25px; padding: 0 0 0 10px; line-height:25px; color:#FFFFFF; font-size:13px;">';
    html += '<b style="float:left;">�����ǳ����</b> ';
    html += '<a onclick="nickname_close();return false;" style="float:right; font-size:12px; margin: 0 10px 0 0; text-decoration: none; color:#FFFFFF;" href="#">�ر�</a>';
    html += '</div>';
    html += '<div style="background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:180px;width:5px; float:left;"> </div>';
    html += '<div style="background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:180px;width:5px; float:right;"> </div>';
    html += '<div style=" width:350px;height:160px;  padding:10px 25px;  float:right; background:#fff;">';
    html += '<div style="line-height:15px ;width: 350px; float:left; margin-top: 20px; font-size:12px; text-align:center;">';
    html += '����δ�ڱ�վ�趨�ǳƣ����ڴ��趨���ǳƱ�ʾ��������վ�Ķ�����ݣ�����ʱ�޸ģ�����Ψһ�ԣ���ʮ�����ڡ�';
    html += '</div>';
    html += '<div style="height:30px ;width: 350px; float:left; margin: 20px auto 0;line-height:25px; font-size:14px;">';
    html += '<div style=" width: 50px;  float:left; margin-left:20px; line-height:25px; ">�� ��:</div>';
    html += '<div style=" width: 200px; height: 15px;border: 1px solid #333; float:right; margin-right:40px; padding:5px ">';
    html += '<input id=nicknamevalue type="text" maxlength="50" id="loginname" name="loginname" style="border:0;">';
    html += '</div>';
    html += '</div>';
    html += '<div id=nickname_notice style="padding-left:120px"></div>';
    html += '<div style="height:30px ;width: 350px; float:left; margin-top: 20px; line-height:25px; font-size:14px;">';
    html += '<a onclick="nickname_add();return false;" style=" width: 80px;  float:left; margin-left:60px;  background:#78B053; text-decoration: none; color:#FFFFFF; text-align:center;" href="#">��   ��</a>  '
    html += '<a onclick="nickname_close();return false;" style=" width: 80px;  float:right; margin-right:60px;  background:#78B053; text-decoration: none; color:#FFFFFF; text-align:center;" href="#">ȡ   ��</a> '
    html += '</div>';
    html += '</div>';
    html += '<div style="background: url(//static.jjwxc.net/images/b.png) repeat scroll 0 0 transparent; height:10px;width:410px; float:left;"> </div>';
    html += '</div>';
    $('body').prepend(html);
    return false;
}

//�ر��û��ǳ�
function nickname_close() {
    $("#nickname").remove();
}

function showUserInfo() {
    var email_string = (getCookie("email")!=null) ? getCookie("email") : '';
    ptid_string = (getCookie("ptid")!=null) ? getCookie("ptid") : '';
    readerid_string = (getCookie("readerid")!=null) ? getCookie("readerid") : '';
    islocaluser = (getCookie("islocaluser")!=null) ? getCookie("islocaluser") : '';//xwb
    var nickname = cookieNickName.get();
    if (nickname==''||nickname==null) {
        nickname = '����';
    } else if (nickname.length>8) {
        nickname = nickname.substr(0, 7)+'...';
    }
    var showNickName = $('<span><a href=\"//my.jjwxc.net/backend/userinfo.php\"><font color=\"black\"><span title=\"��ת��������Ϣ�鿴���޸�\"><span class="name-hidable"></span><span class="nickname"></span></span></font><\/a></span>');
    showNickName.find('.nickname').text(nickname);
    var showString = '��ӭ����'+showNickName.html();
    var readerLink = '';
    if (readerid_string) {
        readerLink = '<a href="//www.jjwxc.net/onereader.php?readerid='+readerid_string+'" style="color: #000;" target="_blank">'+readerid_string+'</a>';
    }
    $("#t_user_info").attr('title', '����ע�����䣺'+email_string).html('<input type="hidden" name="noallow_pop" id="noallow_pop" value="0"><strong>'+showString+'</strong><span class="readerid">(�ͻ��ţ�'+readerLink+' <img width="14px" src="//static.jjwxc.net/images/copy_readerid.png" onclick="copyReaderid('+readerid_string+');"/> )</span>');
    if ($.browser.msie&&($.browser.version=="6.0")&& !$.support.style) {
        $("#t_user_sms").css({
            'cursor': 'pointer',
            'padding-top': '8px'
        }).click(function() {
            window.location = "//my.jjwxc.net/backend/sms.php"
        })
    } else {
        $("#t_user_sms").css({
            'cursor': 'pointer'
        }).click(function() {
            window.location = "//my.jjwxc.net/backend/sms.php"
        })
    }
}

//���ƿͻ���
function copyReaderid(readerid) {
    var copyInput = document.createElement('input');
    copyInput.value = readerid;
    document.body.appendChild(copyInput);
    copyInput.select(); // ѡ�����
    document.execCommand("Copy"); // ִ���������������
    copyInput.style.display = 'none';
    $.blockUI('<strong>���Ƴɹ�</strong>');
    setTimeout(function() {
        $.unblockUI();
    }, 1500);
}

//����ǳ�Ajax  ������ 2012-3-8
function nickname_add() {
    var nickname = $('#nicknamevalue').val();
    //���пո�ͳͳ����
    nickname = nickname.replace(/ /g, '');     //Ϊ����������������ȼ��ܣ�Ȼ����php�˽��н���
    var nickname_encrypt = encodeURIComponent(nickname);
    var length = nickname.length;
    var readerid = (getCookie("readerid")!=null) ? getCookie("readerid") : '';
    if (length>15) {
        $("#nickname_notice").html("<font color='red'>��������15���ַ�Χ���ǳƣ�</font>");
        return false;
    } else if (nickname!='') {
        $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>���Ժ�...</strong>');
        $.getJSON(httpProtocol+'://my.jjwxc.net/backend/nick.php?nickname='+nickname_encrypt+'&readerid='+readerid+'&jsonp=?', function(data) {
            if (data.status==200) {
                nickname_close();
                $.blockUI('<div align="center"><br /><b>��ӳɹ���</b><br /><a href="//my.jjwxc.net/backend/userinfo.php"  style="border-bottom: 1px dashed #999">����Ե�������޸Ļ�����ǳ�</a></div><div align="center"><input type="button" id="yesbuy" value="ȷ ��" onClick="$.unblockUI()"/></div>', {
                    height: '100px'
                });
                cookieNickName.set(nickname)
                checkLogin();
            } else {
                $("#nickname_notice").html("<font color='red'>"+data.message+"</font>");
                $.unblockUI();
            }
        })
    } else if (nickname=='') {
        $("#nickname_notice").html("<font color='red'>�ǳƲ�������Ϊ�գ�</font>");
    }
}

function allow_pop() {
    var noallow_pop = parseInt($('#noallow_pop').val());
    if (noallow_pop==0) {
        return true;
    } else {
        return false;
    }
}

// �漰�ؼ����� ������ʽͳһ��װ��
function showContainSpecialWordsBlock(msg, auto_close = true) {
    var html = "<div>"+msg+"<br/><br/><div><div style='text-align: right;'><button onClick='$.unblockUI()'>ȷ��</button></div>";
    $.blockUI(html, {left: '42%', top: '30%', 'font-size': '16px', border: '1px solid rgb(170, 170, 170)'})
    if (auto_close == true) {
        setTimeout(function() {
            $.unblockUI();
        }, 1500);
    }
}

// --- ������ʾ
function getMessage(flag) {
    if (getCookie("readerid")!=null&&getCookie("ubuntu")) {
        var readerid = getCookie("readerid");
        var sms_total = jjCookie.get('sms_total', true, '.jjwxc.net');
        if (sms_total!=null) {
            if (sms_total>0) {
                if (flag==1) {
                    openplay();
                }
                $('#t_user_sms').html('<img src="//static.jjwxc.net/images/newpm.gif" border="0"><font color="red">(<span id="sms_total">'+sms_total+'</span>)</font>');
            }
        } else {
            var randid = Math.random();
            $.getJSON(httpProtocol+'://s8-static.jjwxc.net/getmessage.php?jsonp=?', {
                readerid: readerid,
                r: randid
            }, function(json) {
                $.getJSON(httpProtocol+'://s8-static.jjwxc.net/getmessage.php?jsonp=?', {
                    r: randid
                }, function(data) {
                    var total = 0;
                    var del_total = 0;
                    if (json.authorId>0) {
                        total = parseInt(data.reader_Total)+parseInt(data.author_Total);
                    } else {
                        total = parseInt(data.reader_Total);
                    }
                    $.each(data.smsId, function(i, v) {
                        if (jQuery.inArray(v, json.smsId)>=0) {
                            del_total++;
                        }
                    });

                    total = total-del_total>=0 ? total-del_total : 0;
                    total += parseInt(json.privatesms_Total);

                    jjCookie.set('sms_total', total, true, '.jjwxc.net');
                    if (total>0) {
                        $('#t_user_sms').html('<img src="//static.jjwxc.net/images/newpm.gif" border="0"><font color="red">(<span id="sms_total">'+total+'</span>)</font>');
                        if (flag==1) {
                            openplay();
                        }
                    }
                });
            })
        }
    }
}

// --- �����¶�����ʾ����
function openplay() {
    return true;
}

// --- ʢ���ܱ�������ʾ
function snda_pwder() {
    var Ekey_login = $('#Ekey_login').val();
    var Challenge_login = $('#Challenge_login').val();

    if (Ekey_login.length==0) {
        $('#Ekey_message').html('�������ܱ��������ύ���룡');
    } else {
        $('#Ekey').val(Ekey_login);
        $('#Challenge').val(Challenge_login);
        $.unblockUI();
        $('#login_form').submit();
        setTimeout($('#Ekey').val(''), 1000);
    }
}

// --- ��֤�������ʾ
function auth_num() {
    var auth_num = $('#auth_num_login').val();
    if (auth_num==0) {
        $('#auth_num_message').html('��������֤�����ύ���룡');
    } else {
        $('#auth_num').val(auth_num);
        $.unblockUI();
        $('#login_form').submit();
    }
}

// --- ��վͷ���仯
function headChange() {
    var fenzhancookie = jjCookie.get('fenzhan', true);
    if (fenzhancookie) {
        setNavigation(fenzhancookie);
    }
}

// --- ��̬���ĵ�����
function setNavigation(fenzhan) {
    // --- ������
    var navigation = {
        "yq": [{
            "name": "���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/by\/"
        }, {
            "name": "��������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/ys.html"
        }, {
            "name": "����Ԫ����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/tr.html"
        }, {
            "name": "δ����Ϸ����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/kh.html"
        }, {
            "name": "�������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/wx.html"
        }, {
            "name": "�Ŵ���Խ",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/chy.html"
        }, {
            "name": "��������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/qc.html"
        }, {
            "name": "�ִ�����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/bgx.html"
        }, {
            "name": "�Ŵ�����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/bgg.html"
        }],
        "yc": [{
            "name": "ԭ��",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/yc_light.html"
        }, {
            "name": "��CP",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/nocp.html"
        }, {
            "name": "�ٺ�",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/bh.html"
        }, {
            "name": "�Ŵ�����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/gbl.html"
        }, {
            "name": "δ���ô�",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/wlhx.html"
        }, {
            "name": "�ִ��ô�",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/blhx.html"
        }, {
            "name": "���д���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/bl.html"
        }, {
            "name": "δ��", //δ����Ϸ����
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/kh.html"
        }, {
            "name": "�������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/wx.html"
        }, {
            "name": "�Ŵ���Խ",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/chy.html"
        }, {
            "name": "��������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/qc.html"
        }, {
            "name": "�ִ�����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/bgx.html"
        }, {
            "name": "�Ŵ�����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/yq\/bgg.html"
        }],
        "noyq": [{
            "name": "���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/by\/"
        }, {
            "name": "��������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/dtr.html"
        }, {
            "name": "�Ŵ�����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/gbl.html"
        }, {
            "name": "δ�����봿��",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/wlhx.html"
        }, {
            "name": "�ִ����봿��",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/blhx.html"
        },{
            "name": "�ִ����д���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/bl.html"
        }],
        "ys": [{
            "name": "���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/by\/"
        }, {
            "name": "ԭ����С˵",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/yc_light.html"
        }, {
            "name": "������CP",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/ysnocp.html"
        }, {
            "name": "��������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/dtr.html"
        }, {
            "name": "��������",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/ys.html"
        }, {
            "name": "����Ԫ����",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/tr.html"
        }],
        "nocp_plus": [{
            "name": "���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/by\/"
        },{
            "name": "������CP",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/ysnocp.html"
        }, {
            "name": "��CP",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/nocp.html"
        }],
        "bh": [{
            "name": "���",
            "url": "\/\/www.jjwxc.net\/fenzhan\/by\/"
        },{
            "name": "�ٺ�",
            "url": "\/\/www.jjwxc.net\/fenzhan\/dm\/bh.html"
        }]
    };

    var index = '';
    switch (fenzhan) {
        case 'yq':
            index = 'yq';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titleyq.jpg?var=20161108)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg1.jpg)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg1.jpg)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg1.jpg)');
            $('.ttnav').attr('href', '//yq.jjwxc.net');
            //topenChange(0);
            break;
        case 'bq':
            index = 'bq';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titlecbqnew.jpg)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbgbq.jpg)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbgbq.jpg)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbgbq.jpg)');
            $('.ttnav').attr('href', '//www.jjwxc.net/fenzhan/bq');
            break;
        case 'yc':
            index = 'yc';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titleyq2.jpg?var=20161108)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg2.jpg)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg2.jpg)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg2.jpg)');
            $('.ttnav').attr('href', '//yq.jjwxc.net');
            //topenChange(2);
            break;
        case 'noyq':
        case 'dm':
            index = 'noyq';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titleyq3.jpg?var=20161108)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg3.jpg?var=20140617)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg3.jpg?var=20140617)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg3.jpg?var=20140617)');
            $('.ttnav').attr('href', '//yq.jjwxc.net');
            //topenChange(1);
            break;
        case 'ys':
            index = 'ys';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titleyq4.jpg?var=20161108)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbgbq.jpg)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbgbq.jpg)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbgbq.jpg)');
            $('.ttnav').attr('href', '//yq.jjwxc.net');
            // topenChange(3);
            break;

        case 'ty':
            index = 'ty';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titletw.jpg)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg1.jpg)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg1.jpg)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg1.jpg)');

            $('.ttnav').attr('href', '//ty.jjwxc.net');
            break;

        case 'by':
            index = 'by';
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titlebynew.jpg)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg3.jpg)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg3.jpg)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbg3.jpg)');
            var fenzhan_cookie = jjCookie.get("fenzhan",true)
            if(typeof fenzhan_cookie != "undefined" && fenzhan_cookie == "by"){//����
                var style = {"background-color": "#f1f1f1","color": "#c51f72","background-position": "0 -309px","border": "1px #c51f72 solid","padding": "0 4px","border-bottom": "none"};
                $('.mainnav a').eq(0).css(style)
            }

            $('.ttnav').attr('href', '//www.jjwxc.net/fenzhan/by/');
            break;
        case 'nocp_plus':
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titlenocp.jpg?var=20231123)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headnocp.jpg?var=20231123)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headnocp.jpg?var=20231123)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headnocp.jpg?var=20231123)');
            $('.ttnav').attr('href', '//www.jjwxc.net/fenzhan/by/');
            index = 'nocp_plus';
            break;
        case 'bh':
            $('.mainnav').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/headbh.jpg?var=20240401)');
            $('.nav3').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titlebh.jpg?var=20240401)');
            $('.left2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titlebh.jpg?var=20240401)');
            $('.right2').css('background-image', 'url(//static.jjwxc.net/images/channel_2010/titlebh.jpg?var=20240401)');
            index = 'bh';
            break;
        default:
            index = 'yq';
            break;
    }
    if (typeof navigation[index]!="undefined") {
        var mainnav = '';
        var fenpin = jjCookie.get("fenpin",true);
        var fenzhan_cookie = jjCookie.get("fenzhan",true);
        $.each(navigation[index], function(i, v) {
            // .title-checked {background-color: white;color: #060;background-position: 0 -309px;border: 1px #0f8107 solid;padding: 0 4px;border-bottom: none;}
            var style = '';
            if((typeof fenpin != "undefined" && typeof fenzhan_cookie != "undefined" && v['url'] == "//www.jjwxc.net/fenzhan/"+fenzhan_cookie+"/"+fenpin) || (fenzhan_cookie == "by" && v['url'] == "//www.jjwxc.net/fenzhan/by/")){
                style = "style='background-color: #fff;color: #060;background-position: 0 -309px;border: 1px #0f8107 solid;padding: 0 4px;border-bottom: none;'";
            }
            mainnav += '<a target="_blank" '+style+' href="'+v['url']+'">'+v['name']+'</a>';
        })
        $('.mainnav').html(mainnav);
    }
}

//�ı�����
var st_done = false;

function trans() {
    var url = window.location.href;
    var oldCookie = getCookie('l');
    if (!st_done) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.src = "//www.jjwxc.net/scripts/misc.trans.js";
        script.onload = script.onreadystatechange = function() {
            if (!st_done&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")) {
                st_done = true;
                setTimeout(function() {
                    stTransform(true);
                    var oldHtml = $('#S2TLink').html();
                    $("#S2TLink").html("�����")
                    //����Ǽ���ת���ɷ���
                    if (oldCookie!='t'&&url.indexOf('onebook_vip')>0) {
                        document.location.reload();
                    }
                }, 100);
                script.onload = script.onreadystatechange = null;
            }
        };
        head.appendChild(script);
    } else {
        st();
        if (url.indexOf('onebook_vip')>0) {
            document.location.reload();
        }

    }
}

// --- ҳ�����г�ʼ������
$(function() {


    $('#auth_num').val('');

    // --- AJAX�������
    if (url!='login.php') {
        $('#login_form').submit(function() {
            var USEUUID = $('#USEUUID').val();
            var loginname = encodeURI($('#loginname').val());
            var loginpassword = $('#loginpassword').val();
            var Ekey = $('#Ekey').val();
            var Challenge = $('#Challenge').val();
            var auth_num = $('#auth_num').val();
            var randid = Math.random();
            if ($('#cookietime').attr('checked')=='checked') {
                var cookietime = $('#cookietime').val();
            } else {
                var cookietime = 0;
            }
            var client_date = new Date();
            var client_time = Math.floor(client_date.getTime()/1000);

            $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>���Ժ�...</strong>');
            if (loginname==''||loginpassword=='') {
                //alert('�������û����������ٳ��Ե��룡');
                $.blockUI('<br><div align="center"><b>����������ı���/����������ٳ��Ե��룡</b><br><br><div align="center"><input type="button" id="yesbuy" value="ȷ ��" onClick="$.unblockUI()"/></div>', {
                    height: '100px'
                });
            } else {
                $.getJSON(httpProtocol+"://my.jjwxc.net/login.php?action=login&login_mode=ajax&USEUUID="+USEUUID+"&loginname="+loginname+"&loginpassword="+loginpassword+"&Ekey="+Ekey+"&Challenge="+Challenge+"&auth_num="+auth_num+"&cookietime="+cookietime+"&client_time="+client_time+"&jsonp=?", function(data) {
                    if (data.state==1) {
                        $.unblockUI();
                        checkLogin();
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
                        if (!data.loginname) {
                            var imgSrc = '//my.jjwxc.net/lib/Authimg.php?r='+randid;
                        } else {
                            var imgSrc = '//my.jjwxc.net/lib/sdoCaptchaImg.php?i='+data.loginname;
                        }
                        var html = '<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>��������֤���ٵ���</b><br><br>��֤�� <input name="auth_num_login" class="input" id="auth_num_login" size="10" maxlength="8" />&nbsp; ��ս�� <img src=\"'+imgSrc+'\"><br><br><span id="Ekey_message" style="color: red"></span><input type="button" value="�� ��" onClick="auth_num()"/>&nbsp;&nbsp;&nbsp;</div>'
                        $.blockUI(html, {
                            width: '330px',
                            height: '130px',
                            cursor: 'default'
                        });
                    } else if (data.state== -2) {
                        $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>'+data.message+'</b><br><br><br><br><input type="button" value="ȷ ��" onClick="$.unblockUI()"/></div>', {
                            width: '330px',
                            height: '100px',
                            cursor: 'default'
                        });
                    } else {
                        $.blockUI('<br><div align="center"><b>����ʧ�ܣ�</b><br />�������Ŀǰ��֧�ֽ��������������롣���ʹ��<span style="font-weight: bold; color: red;">ʢ��ͨ��֤</span>���룬<span style="border-bottom: 1px dashed #999" id="sdo_login2" onclick="show_sdo_login_block()">��������</span><br></div><div align="center"><input type="button" id="yesbuy" value="ȷ ��" onClick="$.unblockUI()"/></div>', {
                            height: '100px'
                        });
                    }
                })
            }
            return false;
        })
    }
    // --- ����
    if (getCookie('l')=='t') {
        trans();
    }

    // --- ��֤�ͻ���ʱ�䡢cookie�Ƿ�����
    var alert_message = '';
    if (!CookieEnable()) {
        alert_message = '����վ������Cookies������·�����������������������������ʾ������ʼ�����á���������Internetѡ�����˽����(�����������)��ȷ��';
    }
    if (alert_message!='') {
        $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>'+alert_message+'</b><br><br><br><input type="button" value="ȷ ��" onClick="$.unblockUI()"/></div>', {
            width: '330px',
            height: '100px',
            cursor: 'default'
        });
    }

    // --- ��̬���ĵ���վ������
    $('.link1 > a').hover(
        function() {
            var index = '';
            if ($(this).attr('class')=='a1') {
                var channeltype = 0
                index = 'yq';
            } else if ($(this).attr('class')=='a2') {
                var channeltype = 2
                index = 'yc';
            } else if ($(this).attr('class')=='a3') {
                var channeltype = 1
                index = 'noyq';
            } else if ($(this).attr('class')=='a4') {
                var channeltype = 3
                index = 'ys';
            } else if ($(this).attr('class') == 'a5') {
                var channeltype = 8;
                index = 'nocp_plus';
            }else if ($(this).attr('class') == 'a6') {
                var channeltype = 9;
                index = 'bh';
            }
            setNavigation(index);
        },
        function() {
        }
    )

    $('#login_form').hover(
        function() {
            $('#noallow_pop').val('1');
        },
        function() {
            $('#noallow_pop').val('0');
        }
    );

    if (url=='search.php') {
        $('.title').css('font-size', '12px');
    }

    //1����
    setInterval(checkBackendLogin,60000);
})

// �人�����ع�˾�Ļjs
function displayyrt(obj, css) {
    var yrt_url = '';
    yrt_url = '<a '+css+' href="//www.jjwxc.net/sp/freegold/index.html" target="_blank">[��ѵý�����]</a>';
    $(obj).html(yrt_url);
}

//ģ��php��urlencode����
function URLEncode(url) {
    var output = '';
    var x = 0;
    url = url.toString();
    var regex = /(^[a-zA-Z0-9-_.]*)/;
    while (x<url.length) {
        var match = regex.exec(url.substr(x));
        if (match!=null&&match.length>1&&match[1]!='') {
            output += match[1];
            x += match[1].length;
        } else {
            if (url.substr(x, 1)==' ') {
                output += '+';
            } else {
                var charCode = url.charCodeAt(x);
                var hexVal = charCode.toString(16);
                output += '%'+(hexVal.length<2 ? '0' : '')+hexVal.toUpperCase();
            }
            x++;
        }
    }
    return output;
}

$(function() {
    /**
     * head_opt �л�ȡ��ǩ, �빤��ʦһ����Ҫ����my��������Ȼ�������¼�ʱ�����������ȶ������û�ÿ�ζ���ȡ��Ӱ��Ч��
     */
    var url = httpProtocol+'://www.jjwxc.net/lib/getattrib.php';
    var html = '';
    $.ajax({
        url: url,
        dataType: 'jsonp',
        type: "get",
        cache: true, // ��ʼ���� ��Ȼ�����_=�����
        jsonp: 'jsonpcallback',
        jsonpCallback: 'success_jsonpCallback20140350', // ֵ�������
        success: function(data) {
            /**
             * ͷ���е���ʾ��ǩ
             */
            $.each(data, function(i, v) {
                if (typeof (v)=='object') {
                    var kee = v.tagid;
                    var vaa = v.tagname;
                } else {
                    var kee = i;
                    var vaa = v;
                }
                html += '<option value="'+kee+'">'+vaa+'</option>';
            });
            $("#ss_tags").append(html);

            /**
             * bookbase.php����ʾ���ݸ�ʽ��ͷ���еĲ�һ��
             */
            var urlStr = window.location.href;
            if (urlStr.indexOf("bookbase.php")> -1) {
                var htmlDiv = '<div id="ajaxCheck">';
                var bqHtml = '', removebqHtml = '';
                var bq = decodeURIComponent(getURLParam('bq')).split(',');
                var removebq = decodeURIComponent(getURLParam('removebq')).split(',');
                $.each(data, function(key, val) {
                    /**
                     * �˴��ж���Ϊ�˼����ϳ���
                     */
                    if (typeof (val)=='object') {
                        var ke = val.tagid;
                        var va = val.tagname;
                    } else {
                        var ke = key;
                        var va = val;
                    }
                    var choosedClass = ''
                    if (bq.indexOf(ke)!== -1) {
                        bqHtml += '<span class="tags_span del_choosed_tag"  type_name="added" tag_val="'+ke+'">'+va+'</span>';
                        choosedClass = 'choosed_tag';
                    }

                    if (removebq.indexOf(ke)!== -1) {
                        removebqHtml += '<span class="tags_span del_choosed_tag" type_name="removed" tag_val="'+ke+'">'+va+'</span>';
                        choosedClass = 'removed_tag';
                    }

                    htmlDiv += '<span class="check tags_box">';
                    htmlDiv += '<span tagname="'+va+'"><label class="tag_text tag_label_'+ke+' '+choosedClass+'">'+va+'</label><span class="add_tags" val="'+ke+'">+</span><span class="remove_tags" val="'+ke+'">-</span> </span>';
                    htmlDiv += '</span>';
                });
                htmlDiv += '</div>';
                if (bqHtml=='') {
                    bqHtml = '<span class="default_span">����</span>';
                }
                if (removebqHtml=='') {
                    removebqHtml = '<span class="default_span">����</span>';
                }
                $("#ssss_tags").append('<p style="color:rgb(140, 141, 140);float:left;margin: 8px 0;">�����ǩ�Ӻţ����������������ǩ���У������ǩ���ţ�����������ų���ǩ���У��ڡ�������ǩ���͡��ų���ǩ�������ǩ����ɾ����ǩ</p>');
                $("#ssss_tags").append(htmlDiv);
                $('.include_tags').append(bqHtml);
                $('.without_tags').append(removebqHtml);
                //$(".tag_1 .check input:checked").next("span").css("color", "red");
                var tagInputSize = $("#ajaxCheck").find("input:checked").size();
                if (tagInputSize==0) {
                    $("#text").find("input:first").attr("checked", true).next("span").css("color", "red");
                } else {
                    $("#text").find("input:first").attr("checked", false).next("span").css("color", "black");
                }
            }
        }
    })
    //����URL��ȡ���½����߰������
    var channeltype = '';
    if (/\/yq\//.test(window.location.href)) {
        channeltype = 0;
    } else if (/\/noyq\/|(gbl|bl|nocp)\.html/g.test(window.location.href)) {
        channeltype = 1;
    } else if (/\/ys\/|(ys|tr|dtr)\.html/g.test(window.location.href)) {
        channeltype = 3;
    } else if (/\/yc\//.test(window.location.href)) {
        channeltype = 2;
    } else if (/\/nocp_plus\//.test(window.location.href)) {
        channeltype = 4;
    } else if (/\/bh\.html/g.test(window.location.href)) {
        channeltype = 6;
    } else {
        channeltype = 5;
    }

    //�������ͼ��
    //�ķ�վ�����Ƶ������ƪ���Ƶ������ȨƵ����15��Ƶ���Լ�����>�ղ��б����ҳ���м��ӣ�����Ʒ����ҳ
    if (/\/fenzhan\/|(backend\/favorite)\.php|oneauthor\.php\?authorid=\d{1,10}&type=children|\/channel\/children\.php/.test(window.location.href)) {
        finishedLabel();
    }
    $('.topen a').each(function() {
        var str = $(this).attr('href');
        if (str.indexOf('orderstr=1') >= 0) {
            //���ƵĲ��滻t����
            return true;
        }
        str = str.replace(/&t=\d/g, "");
        var reg = /\?/;//�ж�һ��href���ǲ����Ѿ���?��
        var orderstr = 2; //������а�Ĭ�Ͻ���vipǿ��
        if (channeltype==6) {//�ٺϽ�vip����
            orderstr = 24;
        }
        if (channeltype==5) {
            $(this).attr('href', str);
        } else {
            if (reg.test(str)) {
                $(this).attr('href', str+'&t='+channeltype);
            } else {
                $(this).attr('href', str+'?orderstr='+orderstr+'&t='+channeltype);
            }
        }
    })


    if ($('#novelreview_div').length>0) {
        (function() {
            var novelreview_div = $('#novelreview_div');
            var novelid = novelreview_div.data('novelid');
            $.ajax({
                url: '//www.jjwxc.net/novelreview.php',
                type: "get",
                dataType: "jsonp",
                jsonpCallback: 'novelreviewCallback',
                cache: true,
                data: {action: 'getByNovelid', novelid: novelid},
                success: function(json) {
                    if (json.status!=200) {
                        novelreview_div.text(json.message)
                        return;
                    }
                    $.ajax({
                        url: '//my.jjwxc.net/novelreview.php',
                        type: "get",
                        dataType: "jsonp",
                        data: {novelid: novelid, action: 'getCurrentReview'},
                        success: function(readerjson) {
                            novelreview_div.empty();
                            var data = json.data;
                            novelreview_div.append('<div>���֣�<span class="coltext">'+data.scoreData.avgscore+'</span></div>');
                            novelreview_div.append('<div>������������<span class="coltext">'+data.scoreData.num+'</span></div>');
                            if (typeof data.scoreData.percent!="undefined") {
                                if (data.scoreData.percent>90) {
                                    novelreview_div.append('<div>�����ֱ������� <span class="coltext">90%</span></div>');
                                } else {
                                    novelreview_div.append('<div>�����ֱ���С�� <span class="coltext">'+data.scoreData.percent+'%</span></div>');
                                }
                            }
                            var chart = $(data.chart);
                            chart.find('.novelreview_chart_col').click(function() {
                                location.href = '//my.jjwxc.net/novelreview.php?novelid='+novelid+"&score="+$(this).data('score');
                            })
                            novelreview_div.append(chart);
                            let notice = data.scoreData?.score_notice ? data.scoreData.score_notice : '������������200�˷��ɲ������߷ְ�����';
                            novelreview_div.append('<div>' + notice + '</div>')
                            var my_review_div;
                            var currentReaderid = 0
                            var reviewUpdateSpan = '';
                            if (typeof readerjson.data.score!='undefined') {
                                var readerReview = readerjson.data;
                                var currentReaderid = readerReview.readerid;
                                my_review_div = $('<div class="myreview_div"><div>�ҵ����֣�'+readerReview.star+' <span class="doReview coltext">�޸�</span></div></div>');
                                my_review_div.append($('<div class="novelreview_commentbody"></div>').html(readerReview.commentbody));
                                reviewUpdateSpan = readerReview.change_time_str !== 'undefined' ? '<span style="float:left;display:inline-block;margin-left: -10px;">'+readerReview.change_time_str+'</span>' : '';
                                my_review_div.append($('<div class="button-do readcontrolbar"></div>').html(reviewUpdateSpan+'<span onclick="complaintReviewCheck('+novelid+','+currentReaderid+')">[Ͷ��]</span>'));
                            } else {
                                my_review_div = $('<div class="myreview_div">����δ���֣�<span class="doReview coltext">���ȥ����>></span></div>');
                            }
                            novelreview_div.append(my_review_div);
                            var reviewlist_div = $('<div class="reviewlist_div"></div>')
                            $.each(data.novelReviewList, function(k, v) {
                                if (v.readerid==currentReaderid) {
                                    return;
                                }
                                var readerStr = '';
                                if (typeof v['unregister'] !== 'undefined' && parseInt(v['unregister']) > 0) {
                                    readerStr = '<span style="color:#707070;">'+v.nickname+'</span>';
                                } else {
                                    readerStr = '<a href="/onereader.php?readerid='+v.readerid+'#novelreview" target="_blank">'+v.nickname+'�����֣�</a>';
                                }
                                var reviewitem_div = $('<div class="reviewlist_item" data-readerid="'+v.readerid+'"><div>'+readerStr+v.star+'</div></div>');
                                if (v.message) {
                                    reviewitem_div.append('<div class="coltext">'+v.message+'</div>')
                                }
                                reviewitem_div.append($('<div class="novelreview_commentbody"></div>').html(v.commentbody));
                                reviewUpdateSpan = v.change_time_str !== 'undefined' ? '<span style="float:left;display:inline-block;margin-left: -10px;">'+v.change_time_str+'</span>' : '';
                                reviewitem_div.append($('<div class="button-do readcontrolbar" style="margin-top:6px;"></div>').html(reviewUpdateSpan+'<span onclick="complaintReviewCheck('+novelid+','+v.readerid+')">[Ͷ��]</span>'));
                                reviewlist_div.append(reviewitem_div)
                            })
                            if (typeof window.uninterested_reader == 'object' && typeof window.uninterested_reader.getUninterestReaderData === 'function' && typeof window.uninterested_reader.hideUninterestedReaderComment === 'function') {
                                window.uninterested_reader.getUninterestReaderData().then(window.uninterested_reader.hideUninterestedReaderComment);
                            }
                            novelreview_div.append(reviewlist_div);
                            novelreview_div.append('<div><a class="coltext" href="//my.jjwxc.net/novelreview.php?novelid='+novelid+'">�鿴��������>></a></div>');

                        }
                    })

                }
            })
        })()


    }

    (function() {
        $('.doReview').live('click', function() {
            var novelid = $(this).data('novelid')
            if (!novelid) {
                novelid = getURLParam('novelid');
            }


            $.ajax({
                url: '//my.jjwxc.net/novelreview.php',
                type: "get",
                dataType: "jsonp",
                data: {novelid: novelid, action: 'checkAllowReview'},
                success: function(json) {
                    if (json.status==1004) {
                        show_login();
                        return;
                    }
                    if (json.status!=200) {
                        $.blockUI('<div style="text-align: right"><img src="//s9-static.jjwxc.net/images/close.gif" class="close" onclick="$.unblockUI()"/></div><div>'+json.message+'</div><div style="margin-top: 1em"><button onclick="$.unblockUI()">ȷ��</button></div>');
                        $('.blockUI').click(function() {
                            $.unblockUI()
                        });
                        setTimeout(function() {
                            $.unblockUI();
                        }, 2000);
                        return;
                    }
                    var review_tpl = $('<form><div><strong>����һ���������'+(json.data.novel ? '��'+json.data.novel.novelname+'��' : '')+'������ӡ��ɣ��������ʱ�����޸�Ŷ~</strong></div></form>');
                    var options = $('<div style="margin-top: 1em"><div style="margin-bottom: 8px">'+json.data.reviewNotice+'</div></div>')
                    $.each(json.data.scores, function(k, v) {
                        options.append('<div style="margin-bottom: 5px"><label><input type="radio" value="'+v.score+'" name="score" class="radio_novelreview"><span style="display: inline-block;margin-left: 3px">'+v.name+'</span></label></div>')
                    })
                    review_tpl.append(options);
                    var commentbody = $('<div style="margin-top: 1em;position: relative;"><div style="margin-bottom: 8px" >������</div><textarea id="reviewCommentBody" name="commentbody" placeholder="1.�������ֲ��ó���ȫ��������*50%��2.һ��+�������²��ó���ȫ��������*50%����������1000�֣�" style="width: 100%;max-width: 100%;height:200px;" rows="3" onkeyup="countReviewWords()" onchange="countReviewWords()"></textarea><span style="position: absolute;bottom:2px;padding-left: 5px;right:10px;background: #ffffff;" id="reviewCommentBodyCounter">0/'+maxReviewLength+'��</span></div>')
                    review_tpl.append(commentbody);
                    var errorMsg = $('<div class="errorMsg redtext" style="margin-top: 1em" id="errorMsg_novelreview"></div>');
                    review_tpl.append(errorMsg);
                    review_tpl.append('<div style="margin-top: 1em;text-align: center" class="buttons"><button style="line-height: 25px;width: 70px;border: 1px solid #999999;border-radius: 25px;" type="button" onclick="$.unblockUI()">ȡ��</button>&nbsp;<button style="line-height: 25px;width: 70px;border: 1px solid #999999;border-radius: 25px;" type="submit">�ύ</button></div>')
                    if (json.data.readerReview) {
                        options.find('[value='+json.data.readerReview.truescore+']').prop('checked', true)
                        commentbody.find('textarea').text(json.data.readerReview.commentbody);
                        setTimeout('countReviewWords()',100);
                    }

                    function postReview() {
                        var serializeArray = review_tpl.serializeArray();
                        var postdata = {novelid: novelid};
                        $.each(serializeArray, function(k, v) {
                            postdata[v.name] = v.value;
                        });
                        if (!postdata.score|| !postdata.commentbody) {
                            errorMsg.text('���ֺͼ�������Ϊ�գ�����������ύ')
                            return false;
                        }
                        $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  ���Ժ򡭡�');
                        $.ajax({
                            'url': '//my.jjwxc.net/novelreview.php?action=doReview',
                            type: "post",
                            dataType: "jsonp",
                            data: postdata,
                            success: function(json) {
                                if (json.status==200) {
                                    $.blockUI(json.message);
                                    setTimeout(function() {
                                        window.location.reload();
                                    }, 1000);
                                    return;
                                }
                                $.blockUI(review_tpl, {
                                    'text-align': 'left',
                                    'width': 500,
                                    'left': '50%',
                                    'top':'20%',
                                    'margin-left': -250
                                })
                                errorMsg.html(json.message);
                                review_tpl.submit(postReview)
                            }

                        });
                        return false;
                    }
                    ;


                    review_tpl.submit(postReview)
                    console.log(review_tpl)
                    $.blockUI(review_tpl, {
                        'text-align': 'left',
                        'width': 500,
                        'left': '50%',
                        'margin-left': -250,
                        'top':'20%'
                    })
                    // ��������
                    if (typeof getEmojiPart === 'function') {
                        getEmojiPart('reviewCommentBody');
                    }

                }
            })
        })

    })();
    $('.radio_novelreview').live('click', function() {
        $('#errorMsg_novelreview').html("");
    });

    (function() {
        if (typeof jjCookie!="object") {
            return;
        }
        var smid = jjCookie.get('shumeideviceId', true);
        if (smid) {
            return;
        }
        $.ajax({
            url: '//static.jjwxc.net/scripts/shumeiDeviceIdSdk.js?var=20230114',
            dataType: 'script',
            cache: true, // Allow caching
            success: function() {
            },
            error: function() {
            }
        });
    })();

});

/**
 * ��ȡ�����Ʒͼ��
 */
function finishedLabel() {
    var need_novelids = [];
    $('.noveldefaultimage').each(function(k, v) {
        //console.log($(this).css('width'));
        var parent_link = $(this).parent().attr('href');
        if (parent_link!='') {
            var patt = /novelid=[0-9]+/;
            var execValue = patt.exec(parent_link);
            if (execValue) {
                var novelid = execValue[0].split("=")[1];
                need_novelids.push(novelid);
                //���CLASS 
                $(this).parent().addClass('finished_box_'+novelid);
                var unique_class = 'unique_'+novelid+'_'+Math.floor(Math.random()*10);
                $(this).parent().addClass(unique_class);
                //�����һ��Ψһclass����ֹ�ظ�
                $(this).parent().attr('unique_class', unique_class);
            }
        }
    });

    var requestLabel = function(rand) {
        if (rand==undefined) {
            rand = '';
        }
        $.ajax({
            url: '//www.jjwxc.net/lib/ajax.php?rand='+rand,
            type: "POST",
            dataType: 'jsonp',
            jsonp: 'callback',
            cache: true,
            jsonpCallback: 'success_novelfinished20210208',
            data: {'action': 'getNovelFinished', 'novelids': need_novelids, 'getMonth': 1},
            success: function(res) {
                if (res.status==='200') {
                    var monthNovel = [];
                    if (res.data.finishData) {
                        var data = res.data.finishData;
                        monthNovel = res.data.monthData;
                    } else {
                        var data = res.data;
                    }
                    // key��ͼ�������޸���Ҫע��
                    var iconObj = {'month':monthNovel, 'finished':data};
                    for(var iconTypeKey in iconObj) {
                        for (i in iconObj[iconTypeKey]) {
                            //�п����м�����ͬ��С˵
                            $('.finished_box_'+i).each(function() {
                                //��ѯͼƬ�ߴ�
                                var unique_class = $(this).attr('unique_class');
                                var img_width = $('.'+unique_class).find('.noveldefaultimage').eq(0).css('width');
                                var padding_left = $('.'+unique_class).find('.noveldefaultimage').eq(0).css('padding-left');
                                var border_left = $('.'+unique_class).find('.noveldefaultimage').eq(0).css('border-left-width');
                                var padding_top = $('.'+unique_class).find('.noveldefaultimage').eq(0).css('padding-top');
                                var border_top = $('.'+unique_class).find('.noveldefaultimage').eq(0).css('border-top-width');
                                var margin_top = $('.'+unique_class).find('.noveldefaultimage').eq(0).css('margin-top');
                                var size = img_width.substring(0, img_width.length-2)=='' ? 0 : img_width.substring(0, img_width.length-2);
                                var padding_left_num = padding_left.substring(0, padding_left.length-2)=='' ? 0 : padding_left.substring(0, padding_left.length-2);
                                var border_left_num = border_left.substring(0, border_left.length-2)=='' ? 0 : border_left.substring(0, border_left.length-2);
                                var padding_top_num = padding_top.substring(0, padding_top.length-2)=='' ? 0 : padding_top.substring(0, padding_top.length-2);
                                var border_top_num = border_top.substring(0, border_top.length-2)=='' ? 0 : border_top.substring(0, border_top.length-2);
                                var margin_top_num = margin_top.substring(0, margin_top.length-2)=='' ? 0 : margin_top.substring(0, margin_top.length-2);
                                //���ͼ��ռͼƬ40%
                                if (size==0) {
                                    //��ȡ�����ߴ粻��ʾ���
                                    return;
                                }
                                //console.log(padding_top, padding_top.substring(0, padding_top.length-2), margin_top, margin_top.substring(0, margin_top.length-2), border_top, border_top.substring(0, border_top.length-2));
                                var label_size = iconTypeKey === 'month' ? size : parseInt(size*0.4);
                                //ͼƬ�ߴ�+��padding+border-left-ͼ���
                                var left = parseInt(size)+parseInt(padding_left_num)+parseInt(border_left_num)-label_size;
                                //margintop+paddingtop+border-top
                                var top = parseInt(padding_top_num)+parseInt(margin_top_num)+parseInt(border_top_num);
                                var css = "width: "+label_size+"px; height: "+label_size+"px; position: absolute; top: "+top+"px; left: "+left+"px; background: url(//static.jjwxc.net/images/"+iconTypeKey+"_icon.png) no-repeat; background-size:"+label_size+'px;';
                                $('.'+unique_class).append('<div class="finished_icon" style="'+css+'"></div>');
                                $('.'+unique_class).css({'display': 'inline-block', 'position': 'relative'});
                                //4��վ�񵥺�����Ŀ� ������inline-block ��Ȼ����ͼƬ���һ���
                                if (/(\/fenzhan\/ys\/|\/fenzhan\/yq\/|\/fenzhan\/noyq\/|\/fenzhan\/yc\/|\/fenzhan\/nocp_plus\/|\/fenzhan\/by\/)$/.test(window.location.href)) {
                                    if ($('.'+unique_class).parent().hasClass('b6boximg')) {
                                        $('.'+unique_class).css({'display': 'block', 'position': 'relative'});
                                    }
                                }
                                //�����������
                                //������Ʒ
                                if ($('.'+unique_class).next().hasClass('zhaiyao')||$('.'+unique_class).next().hasClass('special_zhaiyao')) {
                                    $('.'+unique_class).attr('style', 'display: block; position: relative');
                                }
                                //4��վ��Լ��������ǩԼ
                                if ($('.'+unique_class).parent().hasClass('ycyqt')&&/(\/fenzhan\/ys\/|\/fenzhan\/yq\/|\/fenzhan\/noyq\/|\/fenzhan\/nocp_plus\/|\/fenzhan\/yc\/)$/.test(window.location.href)) {
                                    //ֻҪ��һ��Ԫ������� 4����Ҫ�Ĳ���
                                    $('.'+unique_class).parent().siblings('.ycyqt').each(function() {
                                        $(this).attr('style', 'display: inline-block;float: left; width:'+size+'px');
                                    })
                                    $('.'+unique_class).parent().attr('style', 'display: inline-block;float: left; width:'+size+'px');
                                    $('.'+unique_class).attr('style', 'display:inline-block; position: relative');
                                }
                                if (/\/fenzhan\/dm\/|\/fenzhan\/yq\//.test(window.location.href)) {
                                    if ($('.'+unique_class).parent().get(0).tagName=='LI'&&$('.'+unique_class).next().get(0)!=undefined&&$('.'+unique_class).next().get(0).tagName=='DIV') {
                                        $('.'+unique_class).attr('style', 'display: block; position: relative');
                                    }
                                }
                                if (
                                        window.location.href.indexOf('fenzhan/dm/tr.html')>=0||window.location.href.indexOf('channel/tr.php')>=0
                                ) {
                                    if ($('.'+unique_class).parent().hasClass('ycyqt')) {
                                        $('.'+unique_class).parent().attr('style', 'display: inline-block;float: left;');
                                    }
                                }
                                //bgx.php
                                if (
                                        window.location.href.indexOf('fenzhan/yq/bgx.html')>=0||window.location.href.indexOf('channel/bgx.php')>=0
                                        ||window.location.href.indexOf('fenzhan/yq/kh.html')>=0
                                ) {
                                    if ($('.'+unique_class).parent().parent().hasClass('Over_one_pic')) {
                                        $('.'+unique_class).attr('style', 'display: inline-block; float: left; position: relative');
                                    } else if ($('.'+unique_class).parent().siblings().length===0&&$('.'+unique_class).parent().get(0).tagName=='LI') {
                                        $('.'+unique_class).attr('style', 'display: block; position: relative');
                                    }
                                }
                            });
                        }
                    }
                }
            }
        })
    }

    if (need_novelids.length>0) {
        //novelid ����md5һ�� ��ֹ����
        need_novelids.sort();
        var novelids_str = need_novelids.toString();
        var md5_novelid = '';
        $.getScript("//www.jjwxc.net/scripts/md5.js", function() {
            if (typeof hex_md5=='function') {
                md5_novelid = hex_md5(novelids_str);
            }
            requestLabel(md5_novelid);
        })
    }
}

//����ϵͳ������Ĭ��ͷ��
function loadauthordefaultimage(authorid) {
    if (typeof authorid == 'undefined') {
        authorid = 0;
    }
    $.ajax({
        "url": "/backend/setcolumn.php",
        "type": "POST",
        'data': {op: 'headpicselect',authorid:authorid},
        'async': false,
        "dataType": "json",
        "success": function(data) {
            if (data.code=='200') {
                $(".authordefaultimage").attr("src", data.data);
            }
        },
        error: function() {
            console.log('authordefaultimage ajax error');
        }
    });
}

/**
 * ���߲����Ա��Լ��������ڵ���ʾ
 */
function contractbirthday(type) {
    /**
     * �Ȳ鿴�û�����Ϣ�Ƿ񲹳���ȫ,���������ȫ������ʾ
     */
    $.post('contract_ajax.php', {action: 'checksex', type: type}, function(result) {
        if (result.status>0) {
            $.blockUI(result.message, {
                width: '450px',
                height: 'auto',
                cursor: 'default',
                left: '42%',
                top: '30%',
                'text-align': 'left'
            });
        } else {
            alert(result.message);
            $.unblockUI();
            return false;
        }
    }, 'json')
}

/**
 * �������ں��Ա����д
 */
function birthdaysub() {
    var authorsex = $("select[name='authorsex'] option:selected").val();
    var datalist = "";
    if (authorsex!=undefined) {
        var birthday = $("input[name='birthday']").val();
        var preg = /^(\d{4})-(\d{2})-(\d{2})$/;
        if (!preg.test(birthday)) {
            $("#birthdaymsg").html("�������ڸ�ʽ����ȷ����ʹ��Ӣ�������Լ��л���,���ӣ�2018-10-19").css("color", "red");
            return false;
        } else {
            datalist = {action: 'birthdaysub', authorsex: authorsex, birthday: birthday};
        }
    } else {
        datalist = {action: 'birthdaysub'};
    }
    $.post('contract_ajax.php', datalist, function(result) {
        if (result.status>0) {
            $.unblockUI();
            alert("������Ϣ�ɹ�");
            window.location.reload();
        } else {
            $("#birthdaymsg").html(result.message).css("color", "red");
            return false;
        }
    }, 'json')

}

/**
 * ���߲����ֻ��ŵ���ʾ
 * @param {str} type
 */
function contractPhone(type) {
    /**
     * �Ȳ鿴�û����ֻ���Ϣ�Ƿ񲹳���ȫ,���������ȫ������ʾ
     */
    $.post('contract_ajax.php', {action: 'checkPhone', type: type}, function(result) {
        if (result.status>0) {
            $.blockUI(result.message, {
                width: '450px',
                height: 'auto',
                cursor: 'default',
                left: '42%',
                top: '30%',
                'text-align': 'left'
            });
            $("#authorPhone").html(phoneAreaAortNew());
        } else {
            alert(result.message);
            $.unblockUI();
            return false;
        }
    }, 'json')
}

/**
 * �޸���ص��ֻ�����
 */
function phoneSub() {
    var phonetype = $("select[name='authorPhone'] option:selected").val();
    var authorphone = $("input[name='newphone']").val();
    if (authorphone==undefined) {
        alert("�ֻ��ű�����д");
        return false;
    } else {
        $.post('contract_ajax.php', {
            action: 'upPhone',
            phonetype: phonetype,
            authorphone: authorphone
        }, function(result) {
            if (result.status>0) {
                $.unblockUI();
                alert("������Ϣ�ɹ�");
                window.location.reload();
            } else {
                $("#phonemsg").html(result.message).css("color", "red");
                return false;
            }
        }, 'json')
    }

}

/**
 * ��ʯͶ����ʾ
 * @param {string} authorname ��������
 * @param {int} id ����id|����id
 * @param {int} type 1������Ͷ��ʯ  2������Ͷ��ʯ
 * @returns {undefined}
 */
function giveConinsShow(authorname, id, cointype) {
    if (is_login()) {
        id = parseInt(id);
        $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>���Ժ�...</strong>');
        $.getJSON(httpProtocol+'://my.jjwxc.net/givecoins_ajax.php?jsonp=?', {action: 'getCoinsNum'}, function(resJson) {
            $.unblockUI();
            if (resJson.code!="200") {
                if (resJson.code=="403") {
                    show_login();
                } else {
                    alert(resJson.message);
                }
                return false;
            }
            if (resJson.num<=0) {
                alert("������ʯ��������");
                return false;
            }
            var html = '<div style="text-align:left" id="forestbox">';
            html += '<h3>��ȷ����'+authorname+'��Ͷ��ʯ��</h3><br><br>';
            html += '<input id="oneCoins" type="radio" value="1" name="giveCoinType" onclick="$(\'#someCoinsNum\').val(\'\')">��Ͷһö��ʯ<br><br>';
            html += '<input id="someCoins" type="radio" value="2" name="giveCoinType" onclick="$(\'#someCoinsNum\').focus()">';
            html += '��Ͷ<input id="someCoinsNum" type="text" value="" style="width:40px" onclick="$(this).prev().attr(\'checked\',true)">ö��ʯ<br><br>';
            html += '<input id="allCoins" type="radio" value="3" name="giveCoinType" onclick="$(\'#someCoinsNum\').val(\'\')">��Ҫ��������ʯ����Ͷ�����<span id="nutritionnum">&nbsp;������ǰʣ��'+resJson.num+'��ʯ��</span><br><br>';
            html += '<input type="button" onclick="giveConinsSubmit('+id+','+cointype+','+resJson.num+')" style="width:50px;text-align:center;" id="giveConinsSub" value="ȷ��">&nbsp;&nbsp;&nbsp;';
            html += '<input type="button" onclick="$.unblockUI()" style="width:50px;text-align:center;" value="ȡ��">';
            html += '</div>';
            $.blockUI(html,{cursor:'default'});
        });
    }
}

/**
 * ִ�п�Ͷ��ʯ
 * @param {int} id ����id|����id
 * @param {int} cointype 1������Ͷ��ʯ  2������Ͷ��ʯ
 * @param {int} usercoins ��ʯ����
 * @return {Boolean}
 */
function giveConinsSubmit(id, cointype, usercoins) {
    if ($("input[name=giveCoinType][type='radio']:checked").length==0) {
        alert("��ѡ���Ͷ����");
        return false;
    }
    var type = $("input[name=giveCoinType][type='radio']:checked").val();
    var num = 1;
    if (type==2) { //�Զ�������
        num = $.trim($("#someCoinsNum").val());
        var pattern = /^[1-9]+[0-9]*$/;
        if (num.length==0|| !pattern.exec(num)) {
            alert("��������ȷ�Ŀ�Ͷ��������");
            return false;
        }
    }
    if (num>usercoins) {
        alert("������ʯ��������");
        return false;
    }
    $('#giveConinsSub').attr('disabled', 'disabled');
    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>���Ժ�...</strong>');
    $.ajax({
        url: httpProtocol+"://my.jjwxc.net/givecoins_ajax.php?action=giveCoinsSubmit&callback=?",
        type: "get",
        dataType: "jsonp",
        data: {
            id: id,
            type: type,
            cointype: cointype,
            num: num
        },
        success: function(resJson) {
            $.unblockUI();
            $.blockUI('<div  style="line-height:13px"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer;margin-top:-10px" onClick="$.unblockUI()"/></div><b>'+resJson.message+'</b><br><br><input type="button" value="ȷ ��" onClick="$.unblockUI()" style="margin:0 auto"/></div>', {
                cursor: 'text'
            });
        }
    });
}

// �Ƿ�ǩ��
function setUserSigninHtml() {
    var readerid = getCookie("readerid");
    if (readerid!=null&&getCookie("ubuntu")) {
        var signinCookieKey = 'user_signin_days';
        var user_signin = jjCookie.get(signinCookieKey, true, '.jjwxc.net');
        var signin_yes = '<span style="background: #FF5925;border: 1px solid red; padding: 2px;border-radius:2px;"><a href="//my.jjwxc.net/backend/signin.php" target="_blank" style="color:#fff;">��ǩ��</a></span>';
        var signin_no = '<span style="margin-right:2px;background: #fff;border: 1px solid #FF5925; padding: 2px;border-radius:2px;position:relative;"><div style="width: 6px;height: 6px;border-radius: 50%;position: absolute;top: -6px;right: -6px;background: red;border: 1px solid red;padding:0;"></div><a href="//my.jjwxc.net/backend/signin.php" target="_blank" style="color:red">ȥǩ��</a></span>';
        var user_signin_data = (user_signin) ? user_signin.split("_") : [];
        var d = new Date();
        var month = d.getMonth()+1;
        if (month<10) {
            month = '0'+month;
        }
        var date = d.getDate();
        if (date<10) {
            date = '0'+date;
        }
        var currentDate =d.getFullYear()+month.toString()+date.toString();
        if (user_signin_data.length==3&&user_signin_data[0]==currentDate&&user_signin_data[1]==readerid) {
            var arr = user_signin.split("_");
            $('#t_user_signin').html(arr[2]==1 ? signin_yes : signin_no);
        } else {
            $('#t_user_signin').html(signin_no);
        }
    }
}

//����˵�¼״̬
function checkBackendLogin() {
    var readerid = getCookie("readerid");
    var ubuntu = getCookie("ubuntu");
    var lastCheckLoginKey = 'lastCheckLoginTimePc';
    if (readerid!=null&&ubuntu) {
        var lastCheckLoginTime = jjCookie.get(lastCheckLoginKey, true);
        var nowDate = new Date();
        var nowTime = Math.floor(nowDate.getTime()/1000);
        if (lastCheckLoginTime==null||nowTime-lastCheckLoginTime>3600) {
            var tokenKey = readerid+'_'+ubuntu
            $.ajax({
                url: httpProtocol+"://my.jjwxc.net/lib/ajax.php?action=ajaxCheckLogin&tokenKey="+tokenKey,
                type: "get",
                dataType: "jsonp",
                success: function(data) {
                    if (data.isLogin=='no') {
                        //���cookie
                        setCookie('token', '', 0, '/', '.jjwxc.net');
                        navHeaderGuest();
                    }
                }
            });
            jjCookie.set(lastCheckLoginKey, nowTime, true, '.jjwxc.net');
        }
    } else {
        navHeaderGuest();
    }
}

function navHeaderGuest(){
    $("#t_user_signin").html('');
    $("#t_user_info").html('');
    $("#t_user_sms").html('');
    guest();
}

function complaintReviewCheck(novelid, readerid) {
    $.getJSON('/novelreview.php', {
        action: 'complaintReviewCheck',
        novelid: novelid,
        readerid: readerid
    }, function(data) {
        if (data.status==100) {
            alert('��ҪͶ�ߵ������Ѿ�����Ͷ���ˣ������ظ��ύ������Ա���ڴ���');
            return;
        } else {
            window.open('/backend/auto.php?act=9&novelreviewcomplaint='+novelid+'_'+readerid, '_blank');
        }
    })
}

//�������ͼ��
function checkSinaImg(url) {
    $('#sina_notice').text('')
    var regex = /(https?:\/\/\w+\.sinaimg\.\w+)\b/i;
    if (regex.test(url)) {
        var text = "�����ʹ������ͼ�����ӣ����ܻ����ͼƬ�޷�չʾ���������ע�⡣";
        $('#sina_notice').text(text)
    }
}

window.addEventListener('error', function(e) {
    if (e.target.tagName===undefined) {
        return false;
    }
    if (e.target.tagName.toUpperCase()==='IMG'&&e.target.className.indexOf('noveldefaultimage')>=0) {
        loadDefaultNovelCover(e.target);
    }
}, true)

// ����Ĭ�Ϸ���
function loadDefaultNovelCover(element) {
    var ele = $(element);
    var _src = ele.attr('_src');
    if (ele.attr('src')===_src) {
        return;
    }
    if (ele.attr('src').indexOf("jjwxc.")>0||ele.attr('src').indexOf("/novelimage.php?novelid")>0) {
        return false;
    }
    if (typeof (_src)!="undefined"&&_src!=='') {
        ele.attr('src', _src);
    } else {
        var img_url = ele.parent().attr('href');
        var patt = /novelid=[0-9]+/;
        var execValue = patt.exec(img_url);
        if (execValue) {
            var novelid = execValue[0].split("=")[1];
            if (novelid>0) {
                ele.attr('src', '//i9-static.jjwxc.net/novelimage.php?novelid='+novelid);
            }
        }
    }
}

//������������
function HandleWordsLimit(id,key){
    this.key = key;
    this.id = id;
    this.setCurrentWordsNum = function(){
        const text = $('#'+this.id).val();
        if(text != undefined){
            let count = text.length
            $('#'+this.id).next().find('span').eq(0).text(count)
        }
    }
    this.getCache = function(){
        return localStorage.getItem(this.key);
    }
    this.setCache = function(){
        let content =  $('#'+this.id).val();
        localStorage.setItem(this.key,content);
    }
    this.removeCache = function(){
        localStorage.removeItem(this.key);
    }
    this.initWordsNum = function(){
        const content = this.getCache();
        if(content){
            $('#'+this.id).val(content)
        }
        this.setCurrentWordsNum();
    }
}
var maxReviewLength = 1000;
function countReviewWords() {
    var ele = $('#reviewCommentBody');
    if (ele.length) {
        var reason = ele.val().toString().slice(0, maxReviewLength);
        var length = reason.length;
        ele.val(reason);
        $('#reviewCommentBodyCounter').html(length+'/'+maxReviewLength+'��')
    }
}

//PCǰ̨�����ղغ������б���������
var hideablecols = {
    hideableCols: {},
    localKey: '',
    initial: function(localKey) {
        var o = this;
        o.localKey = localKey;
        $('.hideColTable .headTr td').each(function(k, v) {
            if ($(this).hasClass('hideable')) {
                var text = $(this).text().replace(/\[\��\]/g, '');
                var colObj = $('.hideColTable td:nth-child('+(k+1)+'),.hideColTable col:nth-child('+(k+1)+')');
                colObj.addClass('hideablecol');
                if (typeof o.hideableCols[text]=='undefined') {
                    o.hideableCols[text] = {
                        show: $(this).hasClass("hide-col-default") ? false : true,
                        'text': text,
                        'right': {'col': k, colObj: colObj}
                    }
                } else {
                    o.hideableCols[text]['right'] = {'col': k, colObj: colObj}

                }
            }
        });
        o.loadLocal();
        var ctrl_div = $('#hidecol-ctrlgroup').html('');
        $.each(o.hideableCols, function(k, v) {
            var classes = v.show ? '' : 'hidecol-ctrl-hide';
            var ctrl = $('<span class="hidecol-ctrl '+classes+'">'+k+'</span>');
            if (!v.show && v.right) {
                v.right.colObj.addClass('hidecol');
            }
            ctrl.click(function() {
                o.hideableCols[k].show = !o.hideableCols[k].show;
                if (o.hideableCols[k].show) {
                    if (v.right) {
                        v.right.colObj.removeClass('hidecol');
                    }
                    $(this).removeClass('hidecol-ctrl-hide');
                } else {
                    if (v.right) {
                        v.right.colObj.addClass('hidecol');
                    }
                    $(this).addClass('hidecol-ctrl-hide');
                }
                o.saveLocal();
            });
            ctrl_div.append(ctrl);
        });
    },
    loadLocal: function() {
        var o = this;
        var local = JSON.parse(localStorage.getItem(o.localKey));
        if (local!=null) {
            $.each(o.hideableCols, function(k, v) {
                if (typeof local[k]!='undefined') {
                    v.show = local[k].show
                }
            })
        }
    },
    saveLocal: function() {
        localStorage.setItem(this.localKey, JSON.stringify(this.hideableCols))
    }
};
$(function(){
    $(".ai_del").each(function(){
        var postReader=$(this).attr("rel");
        console.log(postReader)
        var loginReader=getCookie("readerid")
        console.log(loginReader)
        if(postReader!=loginReader){
            $(this).remove();
        }
    })
})

// ͼƬ������
function setLazyLoadImg() {
    if (typeof global_observer !== 'undefined') {
        $('.lazy_load_img').each(function() {
            global_observer.observe(this);
        });
    } else {
        $('.lazy_load_img').each(function() {
            $(this).attr('src', $(this).data('src'));
        })
    }
}
var global_observer;
$(document).ready(function() {
    if ('IntersectionObserver' in window) {
        global_observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var $ele = $(entry.target);
                    if($ele.hasClass('lazy_load_img')) {
                        if (!$ele.hasClass('loaded') && $ele.attr('src') === undefined) {
                            var imgSrc = $ele.data('src');
                            $ele.attr('src', imgSrc).addClass('loaded');
                            observer.unobserve(entry.target);  // ֹͣ�����Ѽ��ص�ͼƬ
                        } else {
                            observer.unobserve(entry.target); // �Ǽ�ص�Ŀ��
                        }
                    }
                }
            });
        }, {
            rootMargin: '200px 0px',  // ��ǰ����
        });
    }
    setLazyLoadImg();
})