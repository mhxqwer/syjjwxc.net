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

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} - 包装后的节流函数
 */
function throttle(func, wait) {
    var lastTime = 0;
    return function () {
        var now = new Date().getTime();
        if (now - lastTime >= wait) {
            lastTime = now;
            func.apply(this, arguments);
        }
    };
}

var loadItemPropFav = true;
$(window).scroll(
    throttle(function() {
        if (loadItemPropFav === true && isEleShowInWindow($('span[itemprop="collectedCount"]'))) {
            loadItemPropFav = false;
            //文章收藏展示
            $.ajax({
                url: httpProtocol+'://my.jjwxc.net/lib/ajax.php?action=getNovelCollectedCount&novelid='+getURLParam('novelid'),
                dataType: 'jsonp',
                type: "get",
                success: function(data) {
                    $('span[itemprop="collectedCount"]').text(data.collectedCount);
                    $('span[itemprop="reviewCount"]').text(data.comment_count);
                    $('span[itemprop="scoreCount"]').text(data.novelscore);
                    $('span[itemprop="nutritionCount"]').text(data.nutritionCount);
                }
            });
        }
    }, 100)
);

function isEleShowInWindow(el) {
    if (el.length === 0) {
        return false;
    }
    var bound = el[0].getBoundingClientRect();
    // 判断元素左上角到视口顶部的距离是否小于视口高度
    return bound.top < window.innerHeight;
}

var _preCache = null;
// -- 查询IP相关地区信息接口
function get_ipaddress() {
    var myCookie = getCookie("commentSearch");
    var ip = '';
    if (myCookie!=null&&myCookie=='true') {
        $('.ip').each(function(index, value) {
            index++;
            ip = $(this).html();
            $.getJSON(httpProtocol + '://www.jjwxc.net/lib/get_ipaddress.php?jsonp=?', {
                ip: ip
            }, function(json) {
                if (json.status==200) {
                    ip = json.IP;
                    ip = ip.replace(/\./g, '');
                    if (ip) {
                        $('.'+ip).html(json.IPAddress);
                    }
                }
            });
        });
    }
}

//判断读者是否有删除这篇文章的评论以及回复的功能
function getcommentright() {
    if (getCookie("comtoken")!=null&&getCookie('readerid')!=null) {
        var commentright = getCookie("comtoken");
        commentright = utf8to16(decode64(commentright));
        commentright = commentright.split('|');
    }
    return commentright;
}



// --- 判断文章
function isMyNovel() {
    var cookieAuthorid = getCookie("authorid");
    var htmlAuthorid = $('#authorid_').text();
    var isMyNovel = false;
    if (cookieAuthorid!=null&&htmlAuthorid!=null&&htmlAuthorid!=''&&cookieAuthorid==htmlAuthorid) {
        isMyNovel = true;
    }
    return isMyNovel;
}

function getAbsoluteLeft(objectId) {
    o = document.getElementById(objectId)
    oLeft = o.offsetLeft
    while (o.offsetParent!=null) {
        oParent = o.offsetParent
        oLeft += oParent.offsetLeft
        o = oParent
    }
    return oLeft
}

function getAbsoluteTop(objectId) {
    o = document.getElementById(objectId)
    oTop = o.offsetTop
    while (o.offsetParent!=null) {
        oParent = o.offsetParent
        oTop += oParent.offsetTop
        o = oParent
    }
    return oTop
}

function isonlinered(type) {
    if (type==2) {
        return true;
    }
    if (type!=1) {
        return false;
    }
//2014.01.29-2014.02.28
    var localtime = Math.round(new Date().getTime()/1000);
    if (parseInt(localtime)>=1390924800&&parseInt(localtime)<=1393603199) {
        return true;
    }
    return false;
}

/**
 * 显示送红包按钮和批量送红包
 * @param jQuery object 需要处理的dom
 * @param 为方便将来扩展以json形式传参
 * {
 *      novelid:novelid 作品id
 * }
 */
function deployredpay(dom, param) {
    if (param['novelid']>0) {
        var commentidarr = new Array();
        $('#'+dom+' [id^="comment_"]').each(function() {
            commentidarr.push($(this).data('commentid'));
        });
        commentidstr = commentidarr.join('|');
        $.post(httpProtocol + "://my.jjwxc.net/backend/red_envelope.php?jsonp=?", {action: 'checkred', novelid: param['novelid'], commentid: commentidstr}, function(json) {
            if (json.status==200) {
                var showcomment = false;
                var commentauthor = '';
                $('#'+dom+' [id^="comment_"]').each(function() {
                    var i = $(this).data('commentid');
                    if (typeof i === 'string' && i.indexOf('ai') !== -1) {
                        console.log('跳过AI评论:', i);
                        return true;
                    }
                    var v = json.data[i]
                    commentauthor = $(this).find('.tdtitle .blacktext:first').text();
                    var commentreaderid = $(this).find('.tdtitle .redcommentreaderid').data("readerid");
                    var commentchapterid = $(this).find('.tdtitle .redcommentchapter').data("chapterid");
                    showcomment = true;
                    var redsendtype = "alone";
                    var htm = '';
                    if (!($(this).find('.delinfo').length)) {
                        // 未被删除
                        htm = '<a onclick = "showlist(\''+commentauthor+'\',\''+param['novelid']+'\','+i+',\''+redsendtype+'\')"><font color="red">[送红包]</font></a>';
                    }
                    $(this).find(".redshow_"+i).html(htm);
                    $(this).find('.tdtitle .coltext').prepend('<input type="checkbox" class="batchred" value='+i+' style="vertical-align: text-bottom; " rel="'+commentreaderid+'_'+commentchapterid+'">');
                });
                if (showcomment) {
                    var html = '<div class="batchaddcommend"> '
                            +'<span style="display:inline-block;width:60px"><button class="all" onclick="batch_red_select($(this),\'all\')" id="all">全选</button></span>'
                            +'<span style="display:inline-block;width:60px"><button class="invert" onclick="batch_red_select($(this),\'invert\')" name="invert">反选</button></span>'
                            +'<span style="display:inline-block;margin-left:170px"><button onclick="getDeleteReason('+param['novelid']+', 0,0,1,0,0, $(this),1)">批量删除</button></span>'
                            +'<span style="display:inline-block;margin-left:25px"><button  onclick="batch_red_send($(this),'+param['novelid']+')">批量送红包</button></span></div>';
                    $('#'+dom).append(html)
                }
            }
        }, 'json');
    }

}


/**
 * 送红包操作
 */
function redpay(novelid, commentid, force) {
    if (force==undefined) {
        force = 0;
    }
    $("#myredbutton").attr('disabled', 'disabled');
    // $.unblockUI();
    var novelid = novelid;
    var commentid = commentid;
    var redpayval = $('input[name="redpayradio"]').filter(':checked').val();
    var redpayreply = $('input[name="redpayreply"]').val();
    var paypsw = $('input[name="paypsw"]').val();
    var repeatenvelopes = $('input[name="repeatenvelopes"]:checked').val();//同一章节同一用户只发送一次
    var sentenvelopes = $('input[name="sentenvelopes"]:checked').val();//已经发送过的不再次发送 
    if (redpayval==''||redpayval==undefined||redpayval==null) {
        $.blockUI('<font color="red">请选择点数后再确认提交</font><br /><br /><input type="button" value=关闭 onclick=$.unblockUI()>');
        return false;
    }
    $.getJSON(httpProtocol + "://my.jjwxc.net/backend/red_envelope.php?jsonp=?", {action: "redpayComment", novelid: novelid, redpayval: redpayval, commentid: commentid, paypsw: paypsw, redpayreply: redpayreply,repeatenvelopes: repeatenvelopes, sentenvelopes: sentenvelopes, force: force}, function(data) {
        $("#myredbutton").removeAttr('disabled');
        if (data.status==100) {
            $.blockUI(data.msg+'<br /><br /><div><input type="button" value=关闭 onclick=$.unblockUI()></div>');
        } else if (data.status==91108) {
            // $.blockUI('<div  style="line-height:13px"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer;margin-top:-10px" onClick="$.unblockUI()"/></div><b>'+data.msg+'</b><br><br><input type="button" value="确认" onClick="redpay('+novelid+', ' + commentid +', 1)" style="margin:0 auto"/><input type="button" value="取消" onClick="$.unblockUI()" style="margin-left:20px;"/></div>', {
            //     cursor: 'text'
            // });
            var confirm = window.confirm(data.msg);
            if (confirm) {
                redpay(novelid, commentid, 1);
            }
        } else {
            $.blockUI('已成功送红包！<br /><br /><div><input type="button" value=关闭 onclick=$.unblockUI()></div>');
        }
    })
}

/**
 * 评论送红包选择金额
 * @param string commentbyreader 需要发送红包的第一个用户名
 * @param int novelid 作品id
 * @param newcommentid 一个或多个commentid，以|分割
 */
function showlist(commentbyreader, novelid, newcommentid,redsendtype) {
    var UIparams = new Array();
    UIparams['type'] = 'comment';
    UIparams['payname'] = commentbyreader;
    UIparams['novelid'] = novelid;
    UIparams['redsendtype'] = redsendtype;
    if ($.isArray(newcommentid)&&newcommentid.length>1) {
        UIparams['paycount'] = newcommentid.length;
    }
    if ($.isArray(newcommentid)) {
        newcommentid = newcommentid.join('|')
    }
    UIparams['commentid'] = newcommentid;
    showlistUI(UIparams)
}

/**
 * 读者专栏送红包选择金额
 * @param int authorid
 * @param int readerid
 */
function showlistReader(authorid, readerid) {
    var UIparams = new Array();
    UIparams['type'] = 'reader';
    UIparams['authorid'] = authorid;
    UIparams['payname'] = readerid;
    UIparams['readerid'] = readerid;
    showlistUI(UIparams)

}
/**
 * 显示选择红包金额的浮层blockUI
 * @params params json {
 * paycount:红包个数；
 * payname:第一个收到红包的用户名；
 * signed:送红包是否是签约作者;
 * paypsw:是否需要支付密码；
 *
 * type:comment 通过评论送红包/reader 通过读者专栏送红包
 *
 * novelid: 通过评论送红包 作品id
 * commentid：通过评论送红包 评论id，多个评论id用竖线分割
 *
 * readerid:通过读者专栏送红包 受赠读者id
 * }
 */
function showlistUI(params) {
    $.getJSON(httpProtocol + '://www.jjwxc.net/backend/red_envelope.php?jsonp=?', {action: 'checkPayCondition'}, function(json) {
        var html = '';
        html += '<style>#noteinfo,#selectpayval td{text-align:left}#noteinfo{text-indent:2em;margin-bottom:1em;}#selectpayval{margin:10px} #redpaypsw{margin:10px} </style>';
        html += '<div id="noteinfo">';
        var proprotion = ' 5% '
        if (params['paycount']>0) {
          html += '送红包给用户 <font color="red"> '+params['payname']+'等 <span id="redpaycount">'+params['paycount']+'</span>个用户 </font>，该操作会消耗您账户中的晋江币，扣除'+proprotion+'的手续费后，赠送给用户。请选择每个红包的金额。<span id="redpaytotal" style="color:red"></span>';
        } else {
            html += '送红包给用户 <font color="red"> '+params['payname']+' </font>，该操作会消耗您账户中的晋江币，扣除'+proprotion+'的手续费后，赠送给用户。请选择红包的金额。';
        }
        html += '</div>';
        if (params['type']=='comment') {
            var randreply = randomRedpayReply();
            html += '<div style="display: -webkit-box; font-size: larger" ><span>回复:</span><div><input name="redpayreply" id="redpayreply" autocomplete="new-password"  class="input_text_long" style="width:298px" value="'+randreply+'" /></div></div>';
        }
        html += '<div id="selectpayval">';
        html += '<table  align=center>';
        html += '<tr>';
        html += '<td><input type="radio" name="redpayradio" value="0" id="redpayradio0" /><label for="redpayradio0">赠送20点</label></td>';
        html += '<td><input type="radio" name="redpayradio" value="1" id="redpayradio1" /><label for="redpayradio1">赠送100点</label></td>';
        html += '<td><input type="radio" name="redpayradio" value="2" id="redpayradio2" /><label for="redpayradio2">赠送200点</label></td>';
        html += '</tr><tr>';
        html += '<td><input type="radio" name="redpayradio" value="5" id="redpayradio5" /><label for="redpayradio5">赠送500点</label></td>';
        html += '<td><input type="radio" name="redpayradio" value="10" id="redpayradio10" /><label for="redpayradio10">赠送1000点</label></td>';
        html += '<td><input type="radio" name="redpayradio" value="50" id="redpayradio50" /><label for="redpayradio50">赠送5000点</label></td>';
        html += '</tr><tr>';
        html += '<td><input type="radio" name="redpayradio" value="100" id="redpayradio100" /><label for="redpayradio100">赠送10000点</label></td>';
        html += '<td><input type="radio" name="redpayradio" value="200" id="redpayradio200" /><label for="redpayradio200">赠送20000点</label></td>';
        html += '<td><input type="radio" name="redpayradio" value="500" id="redpayradio500" /><label for="redpayradio500">赠送50000点</label></td>';
        html += '<tr>';
        html += '</table>';
        html += '</div>';
        if (json.paypwd) {
            html += '<div id="redpaypsw" > 支付密码:<input type="text" id="redpaypwd" autocomplete="new-password"  class="input_text_short" name="paypsw"/> </div>';
        }
        var onClick = '';
        if (params['type']=='comment') {
            onClick = '"redpay(\''+params['novelid']+'\','+'\''+params['commentid']+'\''+');"'
        } else if (params['type']=='reader') {
            onClick = '"readerRedPay(\''+params['authorid']+'\','+'\''+params['readerid']+'\');"'
        }
        if (params['redsendtype']=="batch") {
            html += '<div style="color:red;text-align:left;padding-left:30px;"><input type="checkbox" name="repeatenvelopes" value="1" style="vertical-align:bottom" onclick="changeBatchRedNum()"> 本次发红包，同一章节不重复给同一用户发红包<br/><br/><input type="checkbox" name="sentenvelopes" value="1" style="vertical-align:bottom""> 红包发送的时候跳过已发送的</div><br/>';
        }
        html += '<div><button class=input_submit type=button id="myredbutton"  onClick='+onClick+' >确认</button>';
        html += "&nbsp;&nbsp;&nbsp;&nbsp;";
        html += '<button class=input_submit type=button   onClick=$.unblockUI()>取消</button></div>';
        $.blockUI(html, {width: '330px', cursor: 'pointer'});
        getEmojiPart('redpayreply');
        if (params['paycount']>0) {
            $("[name='redpayradio']").bind('change', function() {
                var unit = $("[name='redpayradio']:checked").val()
                if (unit==0) {
                    unit = 20
                } else {
                    unit *= 100;
                }
                var redpaycount = $("#redpaycount").text();
                $('#redpaytotal').text('(共计'+unit*redpaycount+'点)')
            })
        }
    })
}
$("#redpaypwd").live('focus',function(){
    $("#redpaypwd").attr("type","password");
})
function randomRedpayReply() {
    x = GetRandomNum(0, replyarr.length-1);
    return replyarr[x];
}

/**
 * 批量送红包全选、反选
 * @param jQuery object 全选/反选的checkbox
 * @param string type :all 全选；invert 反选
 */
function batch_red_select(dom, type) {
    var checkboxs = dom.parents('.batchaddcommend').parent().find('input.batchred')
    if (type=='all') {
        checkboxs.each(function() {
            $(this).prop('checked', true)
        })
    } else if (type=='invert') {
        checkboxs.each(function() {
            $(this).prop('checked', !$(this).prop('checked'));
        })
    }
}
/**
 * 批量送红包
 * @param jQuery object 批量发送按钮的jQuery对象
 * @param int novelid
 */
function batch_red_send(dom, novelid) {
    var commentidarr = new Array();
    dom.parents('.batchaddcommend').parent().find('input.batchred:checked').each(function() {
        commentidarr.push($(this).val());
    })
    if (commentidarr.length==0) {
        alert('请至少勾选一个要送红包的评论')
    } else {
        $.post('//'+window.location.hostname+'/app.jjwxc/pc/RedEnvelope/haveRunningJob', {"novelid":novelid}, function(json) {
            if (json.data.have_ing != "0" && json.data.fast_tips != "") {
                if (confirm(json.data.fast_tips)) {
                    var redsendtype = "batch";
                    commentbyreader = dom.parents('.batchaddcommend').parent().find('input.batchred:checked:first').siblings('.blacktext:first').text()
                    showlist(commentbyreader, novelid, commentidarr,redsendtype);
                } else {
                    return false;
                }
            } else {
                var redsendtype = "batch";
                commentbyreader = dom.parents('.batchaddcommend').parent().find('input.batchred:checked:first').siblings('.blacktext:first').text()
                showlist(commentbyreader, novelid, commentidarr,redsendtype);
            }
        })
    }
}

function favorite_novel(obj) {
    jjCookie.set('clicktype', 'favorite_1');

    var flag = $(obj).html();
    if (flag!='收藏此文章'&&flag!='已收藏'&&flag!='收藏此章节'&&flag!='插入书签'&&flag!='收藏此章?'&&flag!='插入???') {
        return false;
    }
    var rel = $(obj).attr('rel');
    rel = rel.split('|');
    var novelId = getURLParam('novelid');
    var chapterId = getURLParam('chapterid');
    if (chapterId==null||chapterId=='null') {
        chapterId = 0;
    }
    var id = rel[0];
    var rand = Math.random();
    if (is_login()) {
      if($("#shumeideviceId").length >0){
            var shumeideviceId = $("#shumeideviceId").val();
         }else{
            var shumeideviceId = "";
        }
      var notFavorite = $(obj).data('fav') && $(obj).data('fav') === '0';
// $('#favoriteshow_'+id).html("<font color='red'>请等待.....</font>").show();
        $.getJSON(httpProtocol + '://my.jjwxc.net/insertfavorite.php?jsonp=?', {
            novelid: novelId,
            chapterid: chapterId,
            rand: rand,
            checkmaxnum: 'checkmaxnum',
            shumeideviceId: shumeideviceId
        }, function(data) {
//$.blockUI(data.message);
//  $('#favoriteshow_'+id).html(data.strtext);
            if (data.status=='nologin') {
                show_login();
                return false;
            }
            if (data.oldClassname==''||data.status=='maxlimit'||data.status==100) {                       //如果收藏章节以前没有为该小说收藏分类，那么就弹框提示分类
                if (data.strtext!='您还没有登入，所以无法使用书签功能') {  //判断是否登入
                    if (data.status=='maxlimit'||data.status==100) {
                        $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>'+data.message+'</b><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {width: '330px', height: '100px', cursor: 'default', left: '43%', top: '45%'});
                    } else {
                        showFavNovelSetClass(data);
                    }
                } else {
                    var message = ''; //初始化变量
                    message = '<span>'+data.strtext+'</span>'; //未登入的提示
                    $.blockUI(message);
                    setTimeout(function() {
                        $.unblockUI();
                    }, 1500);
                    false;
                }
            } else {
                showFavNovelSetClass(data);
            }
            //重置，防止多次操作
            jjCookie.set('clicktype', '');
        });
    }
}

function close_fav() {
    $('#mongolia_layer').hide(); //关闭蒙层
    $('#float_favorite').hide(); //关闭浮层
}

// --- 打印评论用户名
function getCommentUserName()
{
    if ($('#commentauthor').size()<=0) {
        return false;
    }
    if (getCookie("cookieofcommentusername")!=null) {
        document.getElementById("commentauthor").value = unescape(decodeURI(getCookie("cookieofcommentusername")));
    } else if (getCookie("cookieofauthorname1")!=null) {
        document.getElementById("commentauthor").value = unescape(decodeURI(getCookie("cookieofauthorname1")));
    } else if (getCookie("cookieofemail")!=null) {
        cookieofemail = getCookie("cookieofemail").split('@');
        document.getElementById("commentauthor").value = cookieofemail[0];
    } else {
        document.getElementById("commentauthor").value = '';
    }
}
// --- 验证码登入提示
function auth_num_ajax() {
    var auth_num = $('#auth_num_login_ajax').val();
    if (auth_num.length==0) {
        $('#auth_message_ajax').html('请输入验证码再提交登入！');
    } else {
        $('#auth_message_ajax').html('');
        if ($('#auth_num_ajax').size()==0) {
            $('#login_alert').append('<input type="hidden" id="auth_num_ajax" name="auth_num_ajax" value="" />');
        }
        $('#auth_num_ajax').val(auth_num);
        login_ajax()
    }
}

function setonfcous() {
    //实名认证请求判断
    if($('.check_user_identity').length > 0){
        var checked = 0;
        var msg = '';//绝大多数一个页面只有一个check_user_identity，兼容一下有评论又有回复的情况，减少请求
        $('.check_user_identity').each(function() {
            var $currentElement = $(this);
            var is_checked = $currentElement.attr('data-identity-checked');
            if(is_checked === '1'){
                checked = 1;
                msg = $currentElement.html();
            }
        });
        if(checked){
            $('.check_user_identity').each(function() {
                var $currentElement = $(this);
                $currentElement.html(msg);
                $currentElement.attr('data-identity-checked', '1');
            });
        }else{
            $.post('//'+window.location.hostname+'/app.jjwxc/pc/CheckUserIdentity/check', {}, function(json) {
                $('.check_user_identity').each(function() {
                    var $currentElement = $(this);
                    $currentElement.html(json.data.msg);
                    $currentElement.attr('data-identity-checked', '1');
                });
            });
        }
    }
    if ($(':focus').attr('id') == 'commentbody') {
        var normal_comment = $('input[name="KingTickets_radio"]:checked').length === 0 && $('input[name="nutrition_radio"]:checked').length === 0;
        if ($('#commentbody').data('auth') === 'no') {
            if (normal_comment) {
                showNoCommentAuth($('#commentbody').data('auth_tip'));
            }
        } else if ($('#commentbody').data('auth') !== 'yes') {
            $.post('//'+window.location.hostname+'/app.jjwxc/pc/Comment/chapterCommentAuth?time='+Math.random(), {}, function(json) {
                if (json.code == 200) {
                    $('#commentbody').data('auth', 'yes');
                } else if(parseInt(json.code) === 6027) {
                    $('#commentbody').data('auth', 'no');
                    $('#commentbody').data('auth_tip', json.message);
                    if (normal_comment) {
                        showNoCommentAuth(json.message);
                    }
                }
            });
        }

    }

    $("#fcous").html('on');
}

function setofffcous() {
    $("#fcous").html('off');
}


function is_login() {
    if (getCookie('readerid')==null) {
        show_login();
        window.scroll(0, 0);
        return false;
    } else {
        return true;
    }
}

// --- 评论回复展开/收起
function reply_init() {
    $('.reply_toggle').css('cursor', 'pointer');
    $('.reply_toggle').toggle(
            function() {
                var id = $(this).attr('id');
                var reply_total = $(this).attr('rel');
                $(this).html('[+展开：'+reply_total+'楼]');
                $('#reply_'+id).fadeOut("slow");
            },
            function() {
                var id = $(this).attr('id');
                $(this).html('[-收起]');
                $('#reply_'+id).fadeIn("slow");
            }
    );
}

// 回复评论提交
function reply_submit(commentid) {
    var r = 0;
    if ($("#code_random").length>0) {
        r = $("#code_random").val();
    }
    var novelid = $('#novelid').val();
    if (novelid==undefined) {
        novelid = getURLParam('novelid');
    }
    var chapterid = $('#chapterid').val();
    if(chapterid == undefined) {
        chapterid = $('#comment_' + commentid).find('.redcommentchapter').data("chapterid");
    }
    var novelname = $('#novelname').val();
    var reply_author = $('#reply_author').val();
    var reply_commentmark = 3;
    var reply_commentsubject = $('#reply_commentsubject').val();
    var reply_body = $('#reply_body').val();
    var comment_auth_num = $('#auth_num_login').val();
    var emoji_id = $('#reply_body_crack_sugar_id').val();
    var message = '';
    var html = '';
    if (reply_body.length==0) {
        message = '请输入回复内容后再提交！';
    }

    if (message!='') {
        $.blockUI('<strong>'+message+'</strong>');
        setTimeout($.unblockUI, 2000);
        return false;
    }

    if (reply_author.length>0) {
//reply_author = tt2sf(reply_author);
        reply_author = reply_author;
    }
    if (reply_body.length>0) {
// reply_body = tt2sf(reply_body);
        reply_body = reply_body;
    }

    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
    $.post('/backend/review_reply_ajax.php?type=reply', {
        novelid: novelid,
        chapterid: chapterid,
        novelname: novelname,
        commentid: commentid,
        reply_body: reply_body,
        reply_author: reply_author,
        reply_commentmark: reply_commentmark,
        reply_commentsubject: reply_commentsubject,
        comment_auth_num: comment_auth_num,
        emoji_id: emoji_id,
        r: r
    }, function(json) {
        var json = eval('('+json+')');
        if (json.code=='1005') {
            show_login();
            return false;
        } else if (json.code==200) {
            var commentmark = 0;
            if (reply_commentmark>=3) {
                commentmark = reply_commentmark-3;
            } else {
                commentmark = reply_commentmark;
            }

            var mark = json.isdel==3||json.isdel==6 ? json.readerid!=0 ? '<font color="#ABABAB">·</font>' : '<font color="black">·</font>' : '';
            if (json.author_readerid!=0&&json.readerid==json.author_readerid) {
                html = $('<div class="replybody" style="color: #009900">作者回复　发表时间：'+json.commentdate+mark+'<br>'+json.commentbody+'</div>');
            } else {
                html = $('<div class="replybody">网友：<span class="reply_author">'+json.commentAuthor+'</span>　发表时间：'+json.commentdate+mark+'<br>'+json.commentbody+'</div>');
            }
            var htmlStr = '';
            htmlStr += '<div class="readcontrolbar commentagreestyle">';
            htmlStr += '<div class="agree_block" data-agreekey="'+chapterid+'_'+commentid+'_'+json.replyid+'">';
            htmlStr += ' <span style="cursor:pointer;" onclick="addAgree(1,'+novelid+','+chapterid+','+commentid+','+json.replyid+')" data-ele="agree_'+novelid+'_'+commentid+'_'+json.replyid+'" data-number="0">' +
                    '<img src="//static.jjwxc.net/images/agree.png"><span class="numstr"></span></span>'
            htmlStr += ' <span style="cursor:pointer;" onclick="addAgree(2,'+novelid+','+chapterid+','+commentid+','+json.replyid+')" data-ele="disagree_'+novelid+'_'+commentid+'_'+json.replyid+'" >' +
                    '<img class="imgagree_not" src="//static.jjwxc.net/images/agree_not.png"></span>'
            htmlStr += '</div>';
            if(json.ip_pos!=""&&json.ip_pos!=undefined&&json.ip_pos!='undefined'){
                htmlStr+="<span >来自"+json.ip_pos+"</span>";
            }
            htmlStr += ' <a style="cursor:pointer;" onClick="complaintCheck('+json.novelid+','+commentid+','+json.replyid+')">[投诉]</a>'
            htmlStr += '</div><div style="clear: both;"></div> <div class="readcontrolbar commentreplyidstyle">';
            htmlStr += get_replyAdminPannel(json.ip, json.novelid, json.replyid, json.readerid, json.examinstatus, json.commentid, json.commentdate,json.ip_pos);
            htmlStr += '<div style="clear: both;"></div></div>';
            html.append(htmlStr)
            $('#reply_'+commentid).append(html);
            $('.reply_box').remove();
            if (json.commentid_up>0) {
                $('#comment_'+json.commentid_up).prependTo('#comment_list');
            }
            $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>评论已回复...</strong>');
            setTimeout($.unblockUI, 1000);
        } else if (json.code==10) {
            var randid = Math.random();
            $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>请输入验证码再提交</b><br><br>验证码 <input name="auth_num_login" class="input" id="auth_num_login" size="10" maxlength="8" />&nbsp; <img id="img_auth" rel="2" src=\"//my.jjwxc.net/include/checkImage.php?action=pay&r='+randid+'\"> <span id="img_auth_reload" style="cursor:pointer; color: blue; text-decoration: underline;" onClick="imgautoreload()">看不清</span><br><br><span id="Ekey_message" style="color: red"></span><br><br><input type="button" value="提 交" onClick="reply_auth_num('+commentid+')"/>&nbsp;&nbsp;&nbsp;</div>', {
                width: '350px',
                height: '130px',
                cursor: 'default'
            });
            if ($("#code_random").length>0) {
                $("#code_random").val(randid);
            } else {
                $("#publish_comment").append("<input type='hidden' value='"+randid+"' name='random' id='code_random'>");
            }
        } else {
            $.blockUI('<div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><div align="center"><b>'+json.message+'</b><br><br><br><br><div align="center"><input type="button" id="yesbuy" value="确　定" onClick="$.unblockUI()"/></div>', {
                width: '300px',
                height: '130px',
                cursor: 'default'
            });
        }
        getEmojiFromContentBody(reply_body, 'reply_body');
    })

}

function complaintCheck(novelid, commentid, replyid) {
    if (replyid==""||replyid==undefined) {
        replyid = 0;
    }
    $.getJSON('/backend/check_commentuser.php', {action: 'complaincheck', novelid: novelid, commentid: commentid, replyid: replyid}, function(data) {
        if (data.status==1) {
            alert('你要投诉的评论已经有人投诉了，请勿重复提交，管理员正在处理');
            return;
        } else {
            window.open('/backend/auto.php?act=6&commentnovel='+novelid+'_'+commentid+'_'+replyid, '_blank');
        }
    })
}

function checkCanReply(commentid) {
    var chapterid = parseInt(getURLParam('chapterid'));
    chapterid = isNaN(chapterid) ? 0 : chapterid;
    var novelid = getURLParam('novelid');
    var paragraph = parseInt(getURLParam('paragraph'));
    if (paragraph == 1 || parseInt(commentid) > 0) {
        $.getJSON('/app.jjwxc/pc/Comment/paragraphCommentAuth', {novelid: novelid, chapterid: chapterid, commentid: commentid}, function(data) {
            if (data.code !== "200" && data.code !== "6024") {
                if (data.code == "6027") {
                    showNoCommentAuth(data.message);
                } else {
                    alert(data.message);
                }
                return;
            }
        });
    }
}
// 无权限提示
function showNoCommentAuth(message) {
    var htmlStr = '<div style="text-align: left;line-height: 20px;">'+message+'<br><br><br><div style="text-align: center">' +
            '<span style="display:inline-block;width: 60px;background:#ffffff;border:1px solid #a5a5a5; padding:2px 0; border-radius:5px;cursor:pointer;" type="button" onClick="$.unblockUI(),$(\'.reply_box\').remove();">取消</span>&nbsp;&nbsp;' +
            '<span type="button" style="display:inline-block;width: 60px;background:#9fd59e;border:1px solid #9fd59e;padding:2px 0;border-radius:5px;cursor:pointer;" onClick="$.unblockUI(),$(\'.reply_box\').remove(),window.location.href=\'https://my.jjwxc.net/backend/commentshistory.php?action=commentAppeal\'">去查看</span></div>';
    $.blockUI(htmlStr, {width: '300px','margin-left':'-170px'});
}

function reply_submit_open(commentid) {
    checkCanReply(commentid);
    $('.reply_box').remove();
    $('#replacediv').remove();
    var site = $('#'+commentid).attr('rel');
    var html
    var _preCache = isMyNovel();
    var replyPlaceholder = getPlaceHolderRandom(placeholderArr);
    if (_preCache=="true") {
        html = $('<div class="replybody reply_box"><div style="width: 660px; height: 26px; color:#009900; float:left;" align="center">↓这是对评论的回复，用于读者之间交流，不会对文章的积分造成影响↑</div><div style="width: 50px; float:left" align="center"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$(\'.reply_box\').remove();"/></div><div style="clear:both;"><div><span style="color: #008F00;">作者回复　　　　</span> <input name="reply_author" id="reply_author" type="hidden" value="本文作者"/> 评论主题：<input type="text" class="input_text" name="reply_commentsubject" id="reply_commentsubject" size="28" maxlength="100" style="width: 498px" onfocus="setonfcous()" onblur="setofffcous()"/><div style="margin-top: 10px"><input type="hidden" value="" id="reply_body_crack_sugar_id" name="crack_sugar_id"/><div style="display: flex; align-items: flex-start;margin-top: 10px" class="crack_sugar_wrapper crack_sugar_reply_body"></div></div><br /><br /></div><div><div style="float:left"><textarea placeholder="'+replyPlaceholder+'" name="reply_body" class="input_textarea_short" id="reply_body" style="width:660px;height: 100px;padding:3px;" onfocus="setonfcous()" onblur="setofffcous()"></textarea><div class="check_user_identity" style="width:666px;"  data-identity-checked="0"></div></div><div style="width: 70px; float:left; padding-top: 30px" align="center"><input type="button" id="yesbuy" class="fanbutton" value="确定" onClick="reply_submit('+commentid+')"/></div><div style="clear: both;"></div></div></div>');
    } else {
        html = $('<div class="replybody reply_box"><div style="width: 660px; height: 26px; color:#009900; float:left;" align="center">↓这是对评论的回复，用于读者之间交流，不会对文章的积分造成影响↑</div><div style="width: 50px; float:left" align="center"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$(\'.reply_box\').remove();"/></div><div style="clear:both;"><div>昵称：<font id="reply_author" style="margin-right: 5px"></font> 评论主题：<input type="text" class="input_text" name="reply_commentsubject" id="reply_commentsubject" size="28" maxlength="100" style="width: 408px" onfocus="setonfcous()" onblur="setofffcous()"/><div style="margin-top: 10px"><input type="hidden" value="" id="reply_body_crack_sugar_id" name="crack_sugar_id"/><div style="display: flex; align-items: flex-start;margin-top: 10px" class="crack_sugar_wrapper crack_sugar_reply_body"></div></div><br /><br /></div><div><div style="float:left"><textarea placeholder="'+replyPlaceholder+'" name="reply_body" class="input_textarea_short" id="reply_body" style="width:660px;height: 100px;padding:3px;" onfocus="setonfcous()" onblur="setofffcous()"></textarea><div class="check_user_identity" style="width:666px;" data-identity-checked="0"></div></div><div style="width: 70px; float:left; padding-top: 30px" align="center"><input type="button" id="yesbuy" class="fanbutton" value="确定" onClick="reply_submit('+commentid+')"/></div><div style="clear: both;"></div></div></div>');
        getReaderNickname(function(commentauthor) {
            html.find('#reply_author').html(commentauthor);
        });
    }
    var commentuser = checkCommentUserHtml();
    if (commentuser!='') {
        $("textarea[name='reply_body']").replaceWith(commentuser);
        $("#yesbuy").css('display', 'none');
    }
    if (site=='end') {
        $('#reply_'+commentid).append(html);
    } else {
        $('#reply_'+commentid).prepend(html);
    }
    getEmojiPart('reply_body');
    getCrackSugarPart('reply_body');
}

function getReaderNickname(func){
    if (!getCookie('readerid')) {
        setCookie('reader_nickname', '', new Date(0), '/')
        return func('');
    }
    var cookie_nickname= getCookie("reader_nickname");
    if (cookie_nickname !== null && cookie_nickname != '') {
        return func(cookie_nickname);
    } else {
        $.ajax({
            url: '//my.jjwxc.net/lib/ajax.php?action=getReaderNickname',
            dataType: 'jsonp',
            type: "get",
            success: function(data) {
                setCookie('reader_nickname', data.nickname, new Date(eval((new Date()).getTime()+600000)), '/')
                return func(data.nickname);
            }
        });
    }
}

function get_comment_new() {
    var url = httpProtocol + '://www.jjwxc.net/comment_birthday.php';
    var info = {};
    $.ajax({
        type: "GET",
        url: url,
        dataType: 'jsonp',
        jsonp: 'jsonpCallback',
        jsonpCallback: 'commnet_onebook_birthday',
        cache: true,
        data: {authorid: parseInt($('#authorid_').text())},
        success: function(res) {
            if (res.status==200) {
                info = res['data'];
            }
            get_comment_info(info);
        },
        error: function() {
            get_comment_info(info);
        }
    });
}
function get_comment_info(authoBirthdayrInfo, commentSort) {
    if (commentSort === undefined) {
        commentSort = 0;
    }
    var url = httpProtocol + '://s8-static.jjwxc.net/comment_json.php';
    var chapterid = getURLParam('chapterid');
    var novelid = getURLParam('novelid');
    $('#comment_list').html('<img src="//s9-static.jjwxc.net/images/loadings.gif" border="0">'); //多加一行，为二次请求的时候增加一个过渡效果
    $.support.cors = true;
    var ischildren = $('#content').data('site')=='children';
    $.ajax({
        type: "GET",
        url: url,
        dataType: 'jsonp',
        timeout: 20000, //这里设置延迟的时间,当服务器出现不稳定的时候或延迟过高的时候，可能会出现大面积的评论无法显示，可以设置大一些
        jsonp: 'jsonpCallback',
        jsonpCallback: 'commnet_onebook_140421', //值随便设置
        cache: true, //开始缓存 不然会出现_=随机数
        data: chapterid && commentSort ? {novelid: novelid, chapterid: chapterid, commentSort: commentSort} : {novelid: novelid, chapterid: chapterid},
        success: function(data, textStatus, jqXHR) {
            if (data.state==200) {
                var fontstyle = '';
                if (getURLParam('chapterid')=='') {
                    fontstyle = 'smallreadbody'
                } else {
                    fontstyle = 'readbody';
                }

                $('#topics_list').html('');
                var topics_html = '';
                if (data['topics']) {
                    $.each(data['topics'], function(index, value) {
                        topics_html += '<li>★ <a href="/comment.php?commentid='+value['commentid']+'&novelid='+value['novelid']+'" target="_blank">'+value['commentbody']+'</a></li>';
                    })
                    if (topics_html!='') {
                        url = "comment.php?novelid="+getURLParam('novelid');
                        if (getURLParam('chapterid')!='') {
                            url += "&chapterid="+getURLParam('chapterid');
                        }
                        url += "&huati=1";
                        topics_html += "<li><a class='coltext' href='"+url+"' target='_blank'>查看全部话题&gt;&gt;&gt;</a></li>";
                        $('#topics_list').append(topics_html);
                    }
                }


                $('#comment_list').html('');
                var birthdayHtml = '';
                var birthdaykey = 0;
                var todaytime = new Date().getTime();
                if (authoBirthdayrInfo&&authoBirthdayrInfo['isbirthday']&&authoBirthdayrInfo['isbirthday']==1&&authoBirthdayrInfo['startDatetime']<=todaytime&&authoBirthdayrInfo['endDatetime']>=todaytime) {
                    var birthdaycommentmark = 0;
                    if (authoBirthdayrInfo['commentmark']>=3) {
                        birthdaycommentmark = authoBirthdayrInfo['commentmark']-3;
                    } else {
                        birthdaycommentmark = parseInt(authoBirthdayrInfo['commentmark']);
                    }
                    birthdaykey = 1;
                    var birthdayNovelname = "";
                    if (data['body'][0]) {
                        birthdayNovelname = data['body'][0]['novelname'];
                    } else {
                        if (/^\d/.test(chapterid)) {
                            birthdayNovelname = $("#oneboolt").find(".noveltitle:eq(0)").find("span:eq(0)").html();
                        } else {
                            birthdayNovelname = $("#oneboolt").find("span[itemprop=articleSection]:eq(0)").html();
                        }
                        if (!birthdayNovelname) {
                            birthdayNovelname = "";
                        }
                    }
                    var birthdayChapterid = /^\d/.test(chapterid) ? parseInt(chapterid) : 1;
                    var birthdayHtml = '<div><div class="readtd"><div class="tdtitle" align="left"><span class="coltext">№1 网友：<span class="blacktext"><a target="_blank" href="//www.jjwxc.net/">'+authoBirthdayrInfo['commentauthor']+'</a></span> 评论： <a href="/onebook.php?novelid='+novelid+'&amp;chapterid='+birthdayChapterid+'">《'+birthdayNovelname+'》</a> 打分：<span class="blacktext"><span class="redcommentchapter" data-chapterid="'+birthdaycommentmark+'">'+birthdaycommentmark+'</span></span> 所评章节：'+birthdayChapterid+'</span></div><div class="smallreadbody" style="overflow:hidden">'+authoBirthdayrInfo['commentbody']+'</div></div><br></div>';
                }
                $('#comment_list').append(birthdayHtml);
                var html = '';
                var firstItemIsTop = false;
                var tmpNewCommentSortDesc = '';
                var num_index = 0;
                $.each(data['body'], function(index, value) {
                    value['key'] = parseInt(value['key'])+birthdaykey;
                    num_index++;
                    var iconimg = '';
                    var commentmark = 0;
                    var novelid = value['novelid'];
                    var newcommentid = value['commentid'];
                    var commentauthor = value['commentauthor'];
                    if (value['commentmark']>=3) {
                        commentmark = value['commentmark']-3;
                    } else {
                        commentmark = parseInt(value['commentmark']);
                        value['commentmark'] = commentmark+3;
                    }
                    var ai_del_class=value['isdel']==25?'ai_del':'';
                    html += '<div id="comment_'+value['commentid']+'" class="'+ai_del_class+'" rel="'+value['readerid']+'"><div class="readtd"><div class="tdtitle" align="left"><span class="coltext">';
                    if (value['reply_total']>0&&value['reply']!=undefined && !value['comment_top_icon'] && !value['admin_comment_top_icon']) {
                        html += '<span class="toright reply_toggle" id="'+value['commentid']+'" rel="'+value['reply_total']+'">[-收起]</span>';
                    }
                    var commentauthorlist = 'id="foldlingauthor_'+value['commentid']+'" data-foldlingauthor="'+value['foldlingauthor']+'"';
                    if (value['readerid']!=0) {
                        //=====主评论 图标小达人 登入用户发评图标展示
                        if (value['iconimg']) {
                            iconimg = '<a style="float:left;clear:both;margin-right:10px"><img title="晋江十周年图标" src="//static.jjwxc.net/sp/tbdl/images/'+value['iconimg']+'" width="60" ></a>';
                        } else {
                            iconimg = '';
                        }
                        var readercolumn = '//www.jjwxc.net/onereader.php?readerid='+value['readerid'];
                        var authorcolumn = '//www.jjwxc.net/oneauthor.php?authorid='+value['book_authorid'];
                        if (ischildren) {
                            readercolumn += '&type=children';
                        }
                        if (value['isAuthor']==1 && value['is_ai_comment'] !=1) {
                            value['commentauthor'] = '<font style="color: #009900" ><a target="_blank" href=\"'+authorcolumn+'\">作者评论</a></font>';
                            html += '№'+num_index+' <span class="blacktext" '+commentauthorlist+'><a target="_blank" href=\"'+readercolumn+'\">'+value['commentauthor']+'</a></span>';
                        } else {
                            if (typeof value['unregister'] !== 'undefined' && parseInt(value['unregister']) > 0) {
                                html += '№'+num_index+' 网友：<span class="blacktext" '+commentauthorlist+' style="color: #707070;">'+value['commentauthor']+'</span>';
                            } else {
                                var favFromStr = "'"+value['novelid']+','+value['commentid']+','+value['readerid']+','+value['chapterid']+','+value['paragraph_id']+"'";
                                // var ai_comment_icon = '<img style="height: 12px;" src="'+value['ai_avatar']+'" alt="img loading..."/>';
                                var ai_comment_icon = '';
                                html += '№'+num_index+' ' +
                                    (value['is_ai_comment'] != 1 ? '网友：' : ai_comment_icon) +
                                    '<span class="blacktext" '+commentauthorlist+'>' +
                                    '<a onclick="recordFavFrom('+favFromStr+')" target="_blank" href=\"'+readercolumn+'\">'+value['commentauthor']+'</a></span>';
                            }
                        }

                    } else {
                        html += '№'+num_index+' 网友：<span class="blacktext" '+commentauthorlist+'>'+value['commentauthor']+'</span>';
                    }
                    //高校评论员图标
                    if (value['is_university']==1) {
                        html += ' <a style="display: inline-flex;align-items: center;height: 100%;" target="_blank" title="高校评论员" href="//www.jjwxc.net/universityreview.php"><img src="//s1-static.jjwxc.net/images/university/mark.png" style="height: 11px;"/></a>';
                    }
                    if (value['pic']) {
                        html += value['pic'];
                    }
                    var topIcon = value['comment_top_icon'] ? value['comment_top_icon'] : '';
                    var adminTopIcon = value['admin_comment_top_icon'] ? value['admin_comment_top_icon'] : '';
                    var isTopComment = topIcon ? 1 : 0;
                    if (value['subscriptionicon']) {
                        html += value['subscriptionicon'];
                    }
                    var beLikeIcon = value['be_like_icon'] ? value['be_like_icon'] : '';
                    html += topIcon;
                    html += adminTopIcon;
                    html += beLikeIcon;
                    html += ' 评论： <a target="_blank" href="/onebook.php?novelid='+value['novelid']+'&chapterid=';
                    html += value['chapterid']+'">《'+value['novelname']+'》</a>';
                    if (value['is_ai_comment'] != 1) {
                        html += ' 打分：<span class="blacktext">'+commentmark+'</span>';
                    }
                    
                    var mark = '';
                    if (value['isdel']==3||value['isdel']==6) {
                        if (value['readerid']!=0) {
                            mark = '<font color="#ABABAB">·</font> ';
                        } else {
                            mark = '<font color="black">·</font> ';
                        }
                    }
                    var commentDate = value['comment_date_time'] > 0 ? formatDate(value['comment_date_time']) : value['commentdate'];

                    var vipIcon = value['vip_chapter_icon'] ? value['vip_chapter_icon'] : '';
                    var paragraphDesc = value['paragraph_id'] > 0 ? ' 所评段落：' +value['paragraph_id'] : '';

                    html += ' 发表时间：'+commentDate+mark+' 所评章节：<span class="redcommentchapter" data-chapterid="'+value['chapterid']+'">'+value['chapterid']+vipIcon+paragraphDesc+'</span></span></div>';
                    html += '<div class="'+fontstyle+'" style="overflow:hidden">';
                    var str = value['commentdate'];
                    var new_str = str.replace(/:/g, '-');
                    new_str = new_str.replace(/ /g, '-');
                    var arr = new_str.split('-');
                    if (value['commentsubject']!='') {
                        html += '<div class="textcenter"><span class="bigtext">'+value['commentsubject'];
                        if (value['comment_novelid']>0) {
                            html += '-><a href="/onebook.php?novelid='+value['comment_novelid']+'" target="_blank">(评论文章)</a>';
                        }
                        html += '</span>';
                        if (value['iswonderful']==1) {
                            html += '<img src=//static.jjwxc.net/images/wonderful.gif>';
                        }
                        html += '</div>';
                    }

                    //添加图标
                    html += iconimg;
                    //添加评论内容
                    var commentStyle = value['foldlingbody']==""||value['foldlingbody']==undefined ? "" : "style='display:none'";
                    var commentShow = value['commentbody'];
                    if (value['comment_body_hide']) {
                        commentShow = value['comment_body_hide'];
                    }
                    var comment_str = "为营造更好的评论环境，近期网站要求发评须进行实名认证，未实名用户评论暂时仅在对应作者后台及发评用户后台可见，对其他人不可见，实名后评论将正常展示";
                    if(getCookie("readerid") != null && value['readerid'] != getCookie("readerid") &&  commentShow.substr(0,72) == comment_str){
                        commentShow = comment_str+'。';
                    }
                    var topCommentElementId = 'mormalcomment_'+value['commentid'];
                    html += "<span id='mormalcomment_"+value['commentid']+"' "+commentStyle+" data-topcomemnt="+isTopComment+">"+commentShow+"</span>";
                    if (value['foldlingbody']!=""&&value['foldlingbody']!=undefined) {
                        html += "<span id='foldlingcomment_"+value['commentid']+"' style='color:gray'>"+value['foldlingbody']+"&nbsp;&nbsp;<span onclick='showNormalComment("+value['commentid']+")' style='color: blue;'>【点击展开评论】</span></span>";
                    }
                    iconimg = ""; //清空变量,防止后者加上图标
                    html += '</div>';
                    html += '<div class="readcontrolbar replysubmit" id="reply_submit">';
                    // 缓存未重新生成
                    if (typeof (value['agreenum']) === 'undefined') {
                        value['agreenum'] = 0;
                        value['agreenum_str'] = '';
                    }
                    if (value['is_ai_comment']==1) {
                        html += '<div style="display:flex;justify-content:space-between;padding-top: 8px;"><div><span style="color:#199f17">' + value['ai_comment_desc'] +'</span></div>';
                        if (value['authorid'] == getCookie('authorid')) {
                            html += '<div><span onClick="optAiComment('+value['job_id']+',-1)">[对读者隐藏]</span></div>';
                        }
                        html += '</div>';
                    } else  {
                        html += '<div class="agree_block" data-agreekey="'+value['chapterid']+'_'+value['commentid']+'_0">';
                        html += ' <span style="cursor:pointer;" onclick="addAgree(1,'+novelid+','+value['chapterid']+','+value['commentid']+',0)" data-ele="agree_'+novelid+'_'+value['commentid']+'_0" data-number="'+value['agreenum_str']+'">' +
                            '<img src="//static.jjwxc.net/images/agree.png"><span class="numstr">'+value['agreenum_str']+'</span></span>'
                        html += ' <span style="cursor:pointer;margin-left: 3px;" onclick="addAgree(2,'+novelid+','+value['chapterid']+','+value['commentid']+',0)" data-ele="disagree_'+novelid+'_'+value['commentid']+'_0" >' +
                            '<img class="imgagree_not" src="//static.jjwxc.net/images/agree_not.png"></span>'
                        html += '</div>';
                        html += '<span id="myredbutton_'+index+'" style="cursor:pointer;display:inline-block"></span>';
                        if (isonlinered(2)) {
                            _preCache = isMyNovel();
                            if (_preCache==true) {
                                $.post(httpProtocol + "://my.jjwxc.net/backend/red_envelope.php?jsonp=?", {action: 'checkred', novelid: novelid, commentid: newcommentid}, function(data) {
                                    if (data.status==200&&data.data[newcommentid]!=false) {
                                        var htm = "";
                                        var redsendtype = "alone";
                                        htm = '<a onclick = "showlist(\''+commentauthor+'\',\''+novelid+'\',\''+newcommentid+'\',\''+redsendtype+'\')" ><font color="red">[送红包]&nbsp;</font></a>';
                                        $("#myredbutton_"+index).html(htm);
                                    }
                                }, 'json');
                            }
                        }

                        if (value['comment_body_hide']) {
                            html += '<div id="comment_top_toggle" style="padding-bottom: 3px;" onclick="commentTopHideToggle(\''+topCommentElementId+'\')">展开' +
                                '<div class="'+topCommentElementId+'_cut_cmt" style="display: none">'+commentShow+'</div><div style="display: none" class="'+topCommentElementId+'_full_cmt">'+value['commentbody']+'</div>'+
                                '<span style="color:#039902;"><img src="//static.jjwxc.net/images/reply_open_2.png"  width="19px" style="vertical-align: middle; margin-bottom: 4px;" alt="img loading..."/></span></div>';
                        }
                        html += get_genUserPannel(value['novelid'], value['chapterid'], value['commentid'], value['belike'], value['commentmark'], value['readerid'], value['commentsize'], value['vip_flag']);
                        if(value['ip_pos']!=""&&value['ip_pos']!=undefined&&value['ip_pos']!='undefined'){
                            html+="<span >来自"+value['ip_pos']+"</span>";
                        }
                        html += '　<span onClick="complaintCheck('+value['novelid']+','+value['commentid']+',0)">[投诉]</span>　' +
                            '<span class="uninterested-reader" data-nickname="'+commentauthor+'" data-readerid="'+value['readerid']+'" data-novelid="'+value['novelid']+'" data-commentid="'+value['commentid']+'" data-replyid="0">[不看TA的评论和完结评分]</span>' +
                            '<span name="reply_submit" class="reply_submit" style="cursor: pointer;" id="'+value['commentid']+'" rel="top" onClick="reply_submit_open('+value['commentid']+')">[回复]</span></div>';
                    }
                    if(((value['reply_total'] > 0  && value['comment_body_hide']) || (value['reply_total'] > 0 && value['is_top'] == 1)) || (value['reply_total'] > 0 && value['is_admin_top'] == 1)) {
                        var replyElementId = 'reply_'+value['commentid'];
                        var replyTotal = value['reply_total'];
                        var className = "moreTopReplyGet";
                        if (value['reply_total'] > 0 && value['is_admin_top'] == 1) {
                            className = "moreTopReplyGetAdmin"
                        }
                        html += '<div class="' + className +'" style="text-align: right;padding-right: 20px;padding-bottom: 3px;">共<span style="color: #039902;">' + value['reply_total'] + '</span>条回复 <span onclick="showMoreTopCommentReply(\''+replyElementId+'\', '+replyTotal+', 0, \''+className+'\')">查看更多<span style="color: #039902;" ><img src="//static.jjwxc.net/images/reply_open_2.png" width="19px" style="vertical-align: middle;margin-bottom: 4px;" alt="img loading..."/></span></div>';
                    }
                    if (value['author_agree'] == 1) {
                        html += '<div style="color: #009900;background-color: rgba(0, 153, 0, 0.15); width: 70px; border-radius: 5px;text-align: center;font-size: larger;margin-left:-677px;" >作者点赞</div>';
                    }
                    html += '<div style="clear: both;"></div> <div class="readcontrolbar">';
                    if (value['commentsubject']!=''&&value['commentsize']>=1000) {
                        html += get_genAdminPannel(value['ip'], value['novelid'], value['commentid'], value['iswonderful'], 1, value['key'], value['readerid'], value['examinstatus'], value['commentdate'],value['ip_pos']);
                    } else {
                        html += get_genAdminPannel(value['ip'], value['novelid'], value['commentid'], value['iswonderful'], 0, value['key'], value['readerid'], value['examinstatus'], value['commentdate'],value['ip_pos']);
                    }
                    html += '<div style="clear: both;"></div></div>';
                    html += '<div id="reply_'+value['commentid']+'" class="replycontent" '+commentStyle+'>';
                    var j = 0;
                    if (value['reply_total']>0&&value['reply']!=undefined) {
                        var replyShowStyle = (value['comment_body_hide'] || value['is_top']==1) ? ';display:none' : '';
                        if (value['is_admin_top']==1) {
                            replyShowStyle = ';display:none';
                        }
                        $.each(value['reply'], function(i, v) {
                            var mark = v.isdel==3||v.isdel==6 ? v['readerid']!=0 ? '<font color="#ABABAB">·</font>' : '<font color="black">·</font>' : '';
                            var ai_del_class=v['isdel']==25?'ai_del':'ai_del';
                            if (v['author_readerid']!=0&&v['readerid']==v['author_readerid']) {
                                html += '<div class="replybody '+ai_del_class+'" rel="'+v['readerid']+'" style="color: #009900;overflow:hidden'+replyShowStyle+'"><div class="replytitle" style="color:inherit">';
                                if (v['floor']!=undefined) {
                                    html += '['+v['floor']+'楼] ';
                                }
                                var authorcolumn = '//www.jjwxc.net/oneauthor.php?authorid='+v['book_authorid'];

                                html += '<a target="_blank" href=\"'+authorcolumn+'\"'+'>作者回复</a>　发表时间：'+v['commentdate']+mark+'</div>';
                            } else {
                                html += '<div class="replybody '+ai_del_class+'" rel="'+v['readerid']+'" style="overflow:hidden'+replyShowStyle+'"><div class="replytitle">';
                                if (v['floor']!=undefined) {
                                    html += '['+v['floor']+'楼] ';
                                }
                                if (v['readerid']!=0) {
                                    var readercolumn = '//www.jjwxc.net/onereader.php?readerid='+v['readerid'];
                                    if (ischildren) {
                                        readercolumn += '&type=children';
                                    }
                                    //== 评论回复部分
                                    if (v['iconimg']) {
                                        iconimg = '<a style="float:left;clear:both;margin-right:10px"><img title="晋江十周年图标" src="//static.jjwxc.net/sp/tbdl/images/'+v['iconimg']+'" width="60"></a>';
                                    } else {
                                        iconimg = '';
                                    }
                                    var authorStr = '';
                                    if(typeof v['unregister'] !== 'undefined' && parseInt(v['unregister']) > 0) {
                                        authorStr = '<span style="color:#707070;">'+v['commentauthor']+'</span>';
                                    } else {
                                        authorStr = '<a target="_blank" href=\"'+readercolumn+'\">'+v['commentauthor']+'</a>';
                                    }
                                    if (v['subscriptionicon']) {
                                        authorStr += v['subscriptionicon'];
                                    }
                                    html += '网友：<span id="foldlingreplyauthor_'+v['replyid']+'" data-foldlingreplyauthor="'+v['foldlingreplyauthor']+'">'+authorStr+'</span>　发表时间：'+v['commentdate']+mark+'</div>';
                                } else {
                                    html += '网友：'+v['commentauthor']+'　发表时间：'+v['commentdate']+mark+'<font color="#ABABAB">.</font></div>';
                                }
                            }
                            var strr = v['commentdate'];
                            var new_strr = strr.replace(/:/g, '-');
                            new_strr = new_strr.replace(/ /g, '-');
                            var arrr = new_strr.split('-');
                            //添加图标
                            html += '<div class="replycontent" style="color:inherit">'
                            html += iconimg;
                            //添加回复内容
                            var replyStyle = v.foldlingreplybody==''||v.foldlingreplybody==undefined ? "" : "style='display:none'";
                            var reply_str = "为营造更好的评论环境，近期网站要求发评须进行实名认证，未实名用户评论暂时仅在对应作者后台及发评用户后台可见，对其他人不可见，实名后评论将正常展示";
                            if(getCookie("readerid") != null && v.readerid != getCookie("readerid") &&  v.commentbody.substr(0,72) == reply_str){
                                v.commentbody = reply_str+'。';
                            }
                            html += "<span id='mormalreply_"+v.replyid+"' "+replyStyle+">"+v.commentbody+"</span>";
                            if (v.foldlingreplybody!=''&&v.foldlingreplybody!=undefined) {
                                html += "<span id='foldlingreply_"+v.replyid+"' style='color:gray'>"+v.foldlingreplybody+"&nbsp;&nbsp;<span onclick='showNormalReply("+v.replyid+")' style='color: blue;'>【点击展开回复】</span></span>";
                            }
                            html += '</div>';
                            iconimg = ""; //清空变量,防止后者加上图标
                            html += '<div class="readcontrolbar commentagreestyle">'
                            if (typeof (value.agreenum) !== 'undefined') {
                                if (typeof (v['agreenum_str']) === 'undefined') {
                                    v['agreenum_str'] = ''
                                }
                                html += '<div class="agree_block" data-agreekey="'+v['chapterid']+'_'+v['commentid']+'_'+v['replyid']+'">';
                                html += ' <span style="cursor:pointer;" onclick="addAgree(1,'+novelid+','+v['chapterid']+','+v['commentid']+','+v['replyid']+')" data-ele="agree_'+novelid+'_'+v['commentid']+'_'+v['replyid']+'" data-number="'+v['agreenum_str']+'">' +
                                        '<img src="//static.jjwxc.net/images/agree.png"><span class="numstr">'+v['agreenum_str']+'</span></span>'
                                html += ' <span style="cursor:pointer;" onclick="addAgree(2,'+novelid+','+v['chapterid']+','+v['commentid']+','+v['replyid']+')" data-ele="disagree_'+novelid+'_'+v['commentid']+'_'+v['replyid']+'" >' +
                                        '<img class="imgagree_not" src="//static.jjwxc.net/images/agree_not.png"></span>'
                                html += '</div>';
                            }
                            if(v['ip_pos']!=""&&v['ip_pos']!=undefined&&v['ip_pos']!='undefined'){
                                html+="<span >来自"+v['ip_pos']+"</span>";
                            }
                            html += ' <a style="cursor:pointer;" onClick="complaintCheck('+v['novelid']+','+v['commentid']+','+v['replyid']+')">[投诉]</a>'
                            html += ' <span class="uninterested-reader" data-nickname="'+v['commentauthor']+'" data-readerid="'+v['readerid']+'" data-novelid="'+v['novelid']+'" data-commentid="'+v['commentid']+'" data-replyid="'+v.replyid+'">[不看TA的评论和完结评分]</span>';
                            html += '</div><div style="clear: both;"></div> <div class="readcontrolbar commentreplyidstyle">';
                            if (v['author_agree'] == 1) {
                                html += '<div style="color: #009900;background-color: rgba(0, 153, 0, 0.15); width: 70px; border-radius: 5px;text-align: center;font-size: larger;" >作者点赞</div>';
                            }
                            html += get_replyAdminPannel(v['ip'], v['novelid'], v['replyid'], v['readerid'], v['examinstatus'], v['commentid'], v['commentdate'],v['ip_pos']);
                            html += '<div style="clear: both;"></div></div></div>';
                            j++;
                        })
                    }

                    /*if (j>=2) {
                        html += '<div class="readcontrolbar replysubmit" id="reply_submit"><span name="reply_submit" class="reply_submit" style="cursor: pointer" id="'+value['commentid']+'" rel="end" onClick="reply_submit_open('+value['commentid']+')">[回复]</span></div>'
                    }*/
                    html += '</div>';
                    if (0 == index && isTopComment) {
                        firstItemIsTop = true;
                    }
                    tmpNewCommentSortDesc = value['new_comment_sort_desc'];
                    // 产品通知，临时屏蔽下评论排序的话术展示
                    //html += (firstItemIsTop && 0 == index ? '</div><div style="text-align: left;margin-top:10px;margin-bottom:-5px;">'+value['new_comment_sort_desc']+'</div><br></div>' : '</div><br></div>');
                    html += (firstItemIsTop && 0 == index ? '</div><br></div>' : '</div><br></div>');
                });
                if(!html){
                    html = '<span style="font-weight: bold;color: #C5C5C5;">暂无评论</span>';
                    $('#comment_list').removeAttr('valign');
                }
                // 产品通知，临时屏蔽下评论排序的话术展示
                // if (!firstItemIsTop) {
                //     html = '<div style="text-align: left">'+tmpNewCommentSortDesc+'</div>'+html;
                // }
                $('#comment_list').append(html);
                getAgreeData(novelid)
                get_ipaddress();
                reply_init();
                filterComment();
                if (typeof window.uninterested_reader == 'object' && typeof window.uninterested_reader.getUninterestReaderData == 'function' &&  typeof window.uninterested_reader.hideUninterestedReaderComment) {
                    window.uninterested_reader.getUninterestReaderData().then(function(data){
                        window.uninterested_reader.hideUninterestedReaderComment(data);
                        if (typeof window.uninterested_reader.bindUninterestedReader === 'function') {
                            window.uninterested_reader.bindUninterestedReader(data);
                        }
                    });
                }
            } else {
                $('#comment_list').html(data.message);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var comment_list = $('#comment_list').html();
            if (comment_list=='<img src="//s9-static.jjwxc.net/images/loadings.gif" border="0">') {
                var divCss = "border: 1px solid green; background-color:#EEFAEE;width: 760px; height: 35px;font-size:14px;line-height:35px;";
                if ($('#comment_list').data("classtype")&&$('#comment_list').data("classtype")=="children") {
                    divCss = "border: 1px solid #83dbcb; background-color:#f0f8fa;height: 35px;font-size:14px;line-height:35px;text-align: center;";
                }
                var message = "<div style=\""+divCss+"\"><span onmouseout=\"this.style.color=''\" onmouseover=\"this.style.color='green'\" onclick=\"get_comment_new()\">评论加载失败，请点击<font color=\"red\">重新刷新</font>评论</span></div>";
                $('#comment_list').html(message);
            }
            commentfaillog(jqXHR, textStatus, errorThrown);
        }
    });
}
// 记录关注来源
function recordFavFrom(favFromInfo) {
    //novelid,commentid,readerid,chapterid,paragraph_id
    //favFrom,novelid,commentid,readerid,chapterid,paragraph_id
    //关注来源 0：未记录 1：找书书单，2：荐书书单 3：找书单评论 4：荐书书单评论 5：文章评论 6：文章段评 7：读者专栏
    let favFromStr = favFromInfo;
    var favFromType = 5;
    var elements = favFromStr.split(","); // 按','切割字符串
    var paragraph_id = elements[elements.length - 1];
    var fav_reader = elements[2];
    if (paragraph_id != 0) {
        favFromType = 6;
    }
    var favFrom = favFromType+","+favFromStr;
    clientTime = new Date();
    setCookie('favFromInfo_'+fav_reader, favFrom, new Date(eval(clientTime.getTime()+86400*1000)), '/', '.jjwxc.net');
}

// 时间格式转换工具
function formatDate(datetime) {
    t = new Date() / 1000;
    var l = t - datetime;
    if (l < 0) {
        return "刚刚";
    }
    var arrayObj = [
                [31536000, "年前"],
                [2592000, "个月前"],
                [604800, "星期前"],
                [86400, "天前"],
                [3600, "小时前"],
                [60, "刚刚"],
                [1, "刚刚"]
            ];
    for (var index in arrayObj) {
        var c = Math.floor(l / arrayObj[index][0]);
        if (0 < c) {
            if ("刚刚" == arrayObj[index][1]) {
                return arrayObj[index][1];
            } else {
                return c + arrayObj[index][1];
            }
        }
    }
}

function hideCommentWrapper(msg) {
    $('#comment_list').parents('table').eq(0).before('<div style="background-color: #f1f1f1;color: #686868;text-align: center;padding: 10px 0;width: 984px; margin: 0 auto">'+msg+'</div>');
    $('#comment_list').parents('table').eq(0).hide(); //评论的大table
    $('.close_comment_note').html(msg); //作者关闭评论区
    var comment_tip = $('.bluetext').text();
    if (comment_tip != '' && comment_tip.indexOf('以上显示的是最新的二十条评论') >= 0) {
        $('.bluetext').parents('.controlbar').eq(0).remove(); //评论超过20条的那个框
    }

}

/**
 * 关闭评论
 * @param msg
 */
function hideCommentForCloseComment(msg) {
    hideCommentWrapper(msg);
    $('#publishcomment').hide(); //发表评论与霸王票的盒子
    $('#commentOrScore').hide(); //章末
    if (window.location.href.indexOf('/comment.php') >= 0) {
        $('.readtd').eq(0).parents('table').eq(0).before('<div style="background-color: #f1f1f1;color: #686868;text-align: center;padding: 10px 0;width: 984px; margin: 0 auto">'+msg+'</div>');
        $('.readtd').eq(0).parents('table').eq(0).remove();
    }
    if (window.location.href.indexOf('/backend/novelcomment.php') >= 0 || window.location.href.indexOf('/backend/commentshistory.php') >= 0) {
        $('#content').before('<div style="background-color: #f1f1f1;color: #686868;text-align: center;padding: 10px 0;width: 984px; margin: 0 auto"><span>'+msg+'</span></div>');
        $('#content').hide();
    }
}

/**
 * 记录评论加载失败
 * @deprecated
 */
var commentfaillog = function(failjqXHR, failtextStatus, failerrorThrown) {
    return false;
    var logInfo = {
        "responseHeader": failjqXHR.getAllResponseHeaders(),
        "url": window.location.href,
        "status": failtextStatus,
        "error": failerrorThrown,
        'ver': 20180409
    };
    $.post("getCommentDefeated.php", logInfo);
}



function chapterlist_init() {
    var vip_month_flag = parseInt($('#vip_month_flag').html());
    var vip_short_flag = $('#vip_short_flag').length ? parseInt($('#vip_short_flag').html()) : 0;
    var novelId = getURLParam('novelid');
    var chapterId = parseInt(getURLParam('chapterid'));
    if ($('#chapter_list > option').size()<=1) {
        $.getJSON('/getchapterlist.php', {
            novelid: novelId
        }, function(json) {
            if (json.state==200) {
                chapter_flag = false;
                var html = '';
                var append_html = '';
                $.each(json['body'], function(index, value) {
                    if (value['chaptertype']==0) {
                        var str = '';
                        var book_url = '';
                        var style = '';
                        var selected = '';
                        if (chapterId==value['chapterId']) {
                            selected = 'selected="selected"';
                        }
                        if ((value['lockstatus']=='authorlock'||value['isLock']==1)&&vip_month_flag==0) {
                            str = '<span class="graytext">[锁]</span>';
                        } else if (value['lockstatus']=='managerlock'||value['isLock']==2) {
                            str = '<span><font color="#a73836">[锁]</font></span>';
                        } else if (vip_month_flag>0&&parseInt(value['chapterId'])>=vip_month_flag) {
                            str = '第'+value['chapterId']+'章 '+value['chapterName']+' <font color="green">[包月]</font>';
                            book_url = '//my.jjwxc.net/onebook_vip.php?novelid='+novelId+'&chapterid='+value['chapterId'];
                        } else if (vip_short_flag>0&&parseInt(value['chapterId'])>=vip_short_flag) {
                            str = '第'+value['chapterId']+'章 '+value['chapterName']+' <font color="green">[短篇]</font>';
                            book_url = '//my.jjwxc.net/onebook_vip.php?novelid='+novelId+'&chapterid='+value['chapterId'];
                        } else if (value['vip_flag']>0&&parseInt(value['chapterId'])>=parseInt(value['vip_flag'])) {
                            var extra_chapter_type = value['extra_chapter_type'] == 1 ? '福利番外' : 'VIP';
                            str = '第'+value['chapterId']+'章 '+value['chapterName']+' <font color="red">['+extra_chapter_type+']</font>';
                            book_url = '//my.jjwxc.net/onebook_vip.php?novelid='+novelId+'&chapterid='+value['chapterId'];
                        } else {
                            str = '第'+value['chapterId']+'章 '+value['chapterName'];
                            book_url = '//www.jjwxc.net/onebook.php?novelid='+novelId+'&chapterid='+value['chapterId'];
                        }

                        if (value['chapterId']<chapterId) {
                            html += '<option value="'+book_url+'" '+selected+'>'+str+'</option>';
                        } else if (value['chapterId']>chapterId) {
                            append_html += '<option value="'+book_url+'" '+selected+'>'+str+'</option>';
                        }
                    }
                });
                $('#chapter_list').prepend(html).append(append_html);
                $('#chapter_list').bind('change', function() {
                    var book_url = $(this).val();
                    var reg = /onebook_vip/i;
                    if (book_url.length>0) {
                        if (reg.test(book_url)) {
                            if (is_login()) {
                                location.href = book_url;
                            }
                        } else {
                            location.href = book_url;
                        }
                    }
                })
            }
        })
    }
}

/**
 * ################################################################################
 * 判断用户是否作者,生成管理链接
 *
 */
function get_genUserPannel(novelid, chapterid, commentid, state, mark, readerid, commentsize, novelvip) {
    if (_preCache==null) {
        _preCache = isMyNovel();
    }
    var result = '';
    if (_preCache) {
        stateText = (state==0) ? '[作者加精]' : '[取消精华]';
        stateParm = (state==0) ? '' : '&likeit=1';
        result = "<a href=\"/likeit.php?novelid="+novelid+"&chapterid="+chapterid+"&commentid="+commentid+stateParm+"\" target=\"_blank\">"+stateText+"<\/a>";
        if (mark==5) {
            result += "　<a href=\"/likeit.php?novelid="+novelid+"&commentid="+commentid+"&likeit=2\" target=\"_blank\">[删除评论]<\/a>";
        }
        if (mark>3) {
            result += "　<a  style='cursor:pointer' onclick=\"handleComment('my.jjwxc.net/zero.php',"+novelid+','+commentid+','+null+",this,'')\">[清零]<\/a>";
        }

    }
    return result;
}

function genUserPannel(novelid, commentid, state, mark, readerid, commentsize, novelvip) {
    if (_preCache==null) {
        _preCache = isMyNovel();
    }

    if (_preCache) {
        stateText = (state==0) ? '[作者加精]' : '[取消精华]';
        stateParm = (state==0) ? '' : '&likeit=1';
        document.write("<a href=\"/likeit.php?novelid="+novelid+"&commentid="+commentid+stateParm+"\" target=\"_blank\">"+stateText+"<\/a>");
        if (mark==5)
        {
            document.write("　<a href=\"/likeit.php?novelid="+novelid+"&commentid="+commentid+"&likeit=2\" target=\"_blank\">[删除评论]<\/a>");
        }
        if (mark>3)
        {
            document.write("　<a  style='cursor:pointer' onclick=\"handleComment('my.jjwxc.net/zero.php',"+novelid+','+commentid+','+null+",this,'')\">[清零]<\/a>")
        }
    }
}


/**
 * 判断用户是否有管理权限,生成管理链接
 *
 */
function genAdminPannel(ip, novelid, commentid, iswonderful, iswonderful_admin, index, readerid, examinstatus, commentdate,ip_pos) {
    var myCookie = getCookie("commentSearch");
    var url = getCookie('loginSource');
    if (!url) {
        url = 'my.jjwxc.net';
    }
    if (myCookie!=null&&myCookie=='true') {
        var ip_class = ip.replace(/\./g, '');
        var examin;
        if (examinstatus=="网审中") {
            var selectexamin = '<a onclick = "selectexamin(\''+novelid+'\',\''+commentid+'\')">[查询网审状态]</a>';
        } else {
            var selectexamin = "";
        }
        if (examinstatus!=null) {
            if (examinstatus!='评论专审通过'&&examinstatus!='正常') {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=examine_comment_reader_count&action=search&submit=%A1%BE%B2%E9%D1%AF%A1%BF&novelid="+novelid+"&commentid="+commentid+"&replyid=0&export=0\">["+examinstatus+"]<\/a>";
            } else {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=showCount&do=search&novelIdOfComment="+novelid+"&commentId="+commentid+"&replyId=0\">["+examinstatus+"]<\/a>";
            }
        } else {
            examin = null;
        }
        document.write("<span class=\"toleft\">IP：<a href=\"\/\/"+url+"\/guanli/menu.php?act=allsearch&ip="+ip+"&novelid="+novelid+"&action=search\" target=\"_blank\"> <span class=\"redtext ip\">"+ip+" 来自："+ip_pos+"<\/span> <font class='"+ip_class+"'><\/font></a><\/span>"+selectexamin+examin+"&nbsp;<a style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=allsearch&action=search&receptioncommentlist="+novelid+"_"+commentid+"_0\" target='_blank'>[删除]<\/a>  <a  style='cursor:pointer' onclick=\"handleComment('"+url+'/guanli/zero_ajax.php\','+novelid+','+commentid+','+null+",this,'')\">[清零]<\/a>");
    } else {
//判断读者是否有对这篇文章删评的权限
        var commentright = getcommentright();
        if (commentright!=null) {
            var authorid = $("#authorid_").text();
            if (commentdate>=commentright[0]&&commentright[1]>=commentdate&&commentright[2]==authorid&&commentright[3]==getCookie('readerid')) {
                document.write("<a style='cursor:pointer' onclick=\"delPowerComment('"+url+'/delcomment_ajax.php\','+novelid+','+commentid+','+null+",this,4)\">[删除评论]<\/a>");
            }
        }
        document.write("<div style='clear:both'></div>");
    }
}

function handleComment(url, novelid, commentid, type, obj, punish, readerid) {
    $.ajax({
        type: "get",
        async: true,
        url: "//"+url+"?novelid="+novelid+"&commentid="+commentid+'&type='+type+'&from=front&punish='+punish+'&readerid='+readerid+'&jsonp=?',
        cache: true,
        dataType: "jsonp",
        ifModified: false,
        success: function(json) {
            if (json.status!=1) {
                alert(json.msg);
            } else if (url.indexOf('delete')>-1) {
                if (type==null) {
                    $('#comment_'+commentid).remove();
                } else {
                    $(obj).parent().parent().remove();
                }

            } else if (url.indexOf('net/zero')>-1) {
                $(obj).parent().prev().prev().children().children().next().next().html(0);
            } else if (url.indexOf('guanli/zero')>-1) {
                $(obj).parent().prev().prev().prev().children().children().next().next().html(0);
            }
        }
    });
}
function delPowerComment(url, novelid, commentid, type, obj, likeit) {
    $.ajax({
        type: "get",
        async: true,
        url: "//"+url+"?novelid="+novelid+"&commentid="+commentid+'&likeit='+likeit+'&type='+type+'&jsonp=?',
        cache: true,
        dataType: "jsonp",
        ifModified: false,
        success: function(json) {
            if (json.status!=1) {
                alert(json.msg);
            } else if (url.indexOf('delcomment_ajax')>-1&&json.status==1) {
                if (type==null) {
                    $('#comment_'+commentid).remove();
                } else {
                    $(obj).parent().parent().remove();
                }
            }
        }
    });
}

/**
 * 判断用户是否有管理权限,生成相关的权限链接地址
 * @param {int} novelid 文章id
 * @param {int} chapterid 章节id
 */
function genExportPannel(novelid, chapterid) {
    var myCookie = getCookie("isAdmin");
    if (myCookie!=null&&myCookie=='true') {
        $('#genExportPannel').html("<a href=\"//my.jjwxc.net/comment.php?novelid="+novelid+"\">[查看全部书评]<\/a>");
        //生成锁定全文的链接地址
        $("#novelJurisdiction").html("<a target=\"_blank\" href=\"//go.jjwxc.net/guanli/menu.php?act=checknovel&type=personnal&novelid="+novelid+"\">[锁定全文]<\/a>");
        if (chapterid>0) {
            //生成锁定章节的链接地址
            $("#chapterJurisdiction").html("<a target=\"_blank\" href=\"//go.jjwxc.net/guanli/menu.php?act=checknovel&type=personnal&novelid="+novelid+"&chapterid="+chapterid+"\">[锁定章节]<\/a>");
        }

    }
}

/**
 * 判断用户是否有文章管理员权限,生成管理
 *
 */
function genWarningPannel(novelid) {
    var myCookie = getCookie("managername");
    if (myCookie!=null&&myCookie!='') {
        html = '<script type="text/javascript" src="/scripts/WdatePicker/WdatePicker.js"></script>';
        html += "<form method=\"post\" action=\"\/\/my.jjwxc.net\/guanli\/insertedit.php\"  onsubmit=\"return makesure()\">";
        html += "   <div class=\"warning\">";
        html += "    <div class=\"warningtitle\">";
        html += "    <input name=\"novelid\" type=\"hidden\" id=\"novelid\" value=\""+novelid+"\">&nbsp;&nbsp;"+myCookie+"：";
        html += "    &nbsp;&nbsp;&nbsp;&nbsp;<select name=\"cardtype\" id=\"cardtype\">";
        html += "    <option value=\"0\" selected>通知<\/option>";
        html += "    <option value=\"1\">黄牌<\/option>";
        html += "    <\/select>";
        html += "  <span id='editdateset'>生效时间：<span class='startdatecard' style='display: none'><input name='startdate' type='text' value='' onClick=\"WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm:ss'})\" placeholder='开始时间为空则立刻生效'>-</span><input name='expiredate' type='text' value='' onClick=\"WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm:ss'})\" placeholder='结束时间为空则永久生效'>   <span class='startdatecard' style='display: none'><input type='checkbox' name='sendsms' value='' style='vertical-align:sub' checked/>【通知作者】</span></span>";
        html += "    &nbsp;&nbsp;&nbsp;&nbsp;<span id='novelmodulus' style='display:none'>文章积分变化为<input name=\"modulus\" type=\"text\" id=\"modulus\" class=\"input_text_veryshort\" value=\"1\" ></span>";
        html += "    <\/div>";
        html += "    <div class=\"warningbody\">";
        html += "    <div class=\"textcenter\">";
        html += "    <span class=\"toright\">";
        html += "    <div class=\"fanbuttondiv\">";
        html += "    <input name=\"submit\" type=\"submit\" class=\"fanbutton\" id=\"submit\" value=\"确定\">";
        html += "    <\/div>";
        html += "   <\/span>";
        html += "    <textarea name=\"editbody\" cols=\"100\" rows=\"7\" class=\"input_textarea_short\" id=\"editbody\"><\/textarea>";
        html += "    <\/div>";
        html += "    <\/div>";
        html += "   <\/div>";
        html += "<\/form>";
        $("#genWarningPannel").html(html);
    }
}

/**
 * 判断用户是否有管理权限,生成管理链接
 *
 */
function get_genAdminPannel(ip, novelid, commentid, iswonderful, iswonderful_admin, index, readerid, examinstatus, commentdate,ip_pos) {
    var myCookie = getCookie("commentSearch");
    var result = '';
    var url = getCookie('loginSource');
    if (!url) {
        url = 'my.jjwxc.net';
    }
    if (myCookie!=null&&myCookie=='true' && ip !=undefined) {
        var ip_class = ip.replace(/\./g, '');
        var examin;
        if (examinstatus=="网审中") {
            var selectexamin = '<a onclick = "selectexamin(\''+novelid+'\',\''+commentid+'\')">[查询网审状态]</a>';
        } else {
            var selectexamin = "";
        }
        if (examinstatus!=null) {
            if (examinstatus!='评论专审通过'&&examinstatus!='正常') {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=examine_comment_reader_count&action=search&submit=%A1%BE%B2%E9%D1%AF%A1%BF&novelid="+novelid+"&commentid="+commentid+"&replyid=0&export=0\">["+examinstatus+"]<\/a>";
            } else {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=showCount&do=search&novelIdOfComment="+novelid+"&commentId="+commentid+"&replyId=0\">["+examinstatus+"]<\/a>";
            }
        } else {
            examin = null;
        }
        result = "<span class=\"toleft\">IP：<a href=\"\/\/"+url+"\/guanli/menu.php?act=allsearch&ip="+ip+"&novelid="+novelid+"&action=search\" target=\"_blank\"> <span class=\"redtext ip\">"+ip+"<\/span> <font class='"+ip_class+"'><\/font></a><\/span>"+selectexamin+examin+"&nbsp;<a style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=allsearch&action=search&receptioncommentlist="+novelid+"_"+commentid+"_0\" target='_blank'>[删除]<\/a>";
    } else {
//判断读者是否有对这篇文章删评的权限
        var commentright = getcommentright();
        if (commentright!=null) {
            var authorid = $("#authorid_").text();
            if (commentdate>=commentright[0]&&commentright[1]>=commentdate&&commentright[2]==authorid&&commentright[3]==getCookie('readerid')) {
                result += "<a style='cursor:pointer' onclick=\"delPowerComment('"+url+'/delcomment_ajax.php\','+novelid+','+commentid+','+null+",this,4)\">[删除评论]<\/a>";
            }
        }
        result+="<div style='clear:both'></div>";
    }
    return result;
}

/**
 * 判断用户是否有管理权限,生成管理链接(回复评论)
 *
 */
function get_replyAdminPannel(ip, novelid, replyid, readerid, examinstatus, commentid, commentdate,ip_pos) {
    var myCookie = getCookie("isAdmin");
    var result = '';
    var url = getCookie('loginSource');
    if (!url) {
        url = 'my.jjwxc.net';
    }
    if (myCookie!=null&&myCookie=='true') {
        var ip_class = ip.replace(/\./g, '');
        var examin;
        if (examinstatus=="网审中") {
            var selectexamin = '<a onclick = "selectexamin(\''+novelid+'\',\''+commentid+'\')">[查询网审状态]</a>';
        } else {
            var selectexamin = "";
        }
        if (examinstatus!=null) {
            if (examinstatus!='评论专审通过'&&examinstatus!='正常') {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=examine_comment_reader_count&action=search&submit=%A1%BE%B2%E9%D1%AF%A1%BF&novelid="+novelid+"&commentid="+commentid+"&replyid="+replyid+"&export=0\">["+examinstatus+"]<\/a>";
            } else {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=showCount&do=search&novelIdOfComment="+novelid+"&commentId="+commentid+"&replyId="+replyid+"\">["+examinstatus+"]<\/a>";
            }
        } else {
            examin = null;
        }
        result = "<span class=\"toleft\">IP：<a href=\"\/\/"+url+"\/guanli/menu.php?act=allsearch&ip="+ip+"&novelid="+novelid+"&action=search&tablename=reply\" target=\"_blank\"> <span class=\"redtext ip\">"+ip+"<\/span> <font class='"+ip_class+"'><\/font></a><\/span>"+selectexamin+examin+"&nbsp;<a style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=allsearch&action=search&receptioncommentlist="+novelid+"_"+commentid+"_"+replyid+"\" target='_blank'>[删除]<\/a>  <a  style='cursor:pointer' onclick=\"handleComment('"+url+'/guanli/zero_ajax.php\','+novelid+','+replyid+",\'reply\',this,'')\">[清零]<\/a> ";
    } else {
//判断读者是否有对这篇文章删评的权限
        var commentright = getcommentright();
        if (commentright!=null) {
            var authorid = $("#authorid_").text();
            if (commentdate>=commentright[0]&&commentright[1]>=commentdate&&commentright[2]==authorid&&commentright[3]==getCookie('readerid')) {
                result += "<a style='cursor:pointer' onclick=\"delPowerComment('"+url+'/delcomment_ajax.php\','+novelid+','+replyid+",\'reply\',this,4)\">[删除回复]<\/a>";
            }
        }
        result+="<div style='clear:both'></div>";
    }
    return result;
}

/**
 * 判断用户是否有管理权限,生成管理链接(回复评论)
 *
 */
function replyAdminPannel(ip, novelid, replyid, readerid, examinstatus, commentid, commentdate,ip_pos) {
    var myCookie = getCookie("isAdmin");
    var result = '';
    var url = getCookie('loginSource');
    if (!url) {
        url = 'my.jjwxc.net';
    }
    if (myCookie!=null&&myCookie=='true') {
        var ip_class = ip.replace(/\./g, '');
        var examin;
        if (examinstatus=="网审中") {
            var selectexamin = '<a onclick = "selectexamin(\''+novelid+'\',\''+commentid+'\')">[查询网审状态]</a>';
        } else {
            var selectexamin = "";
        }
        if (examinstatus!=null) {
            if (examinstatus!='评论专审通过'&&examinstatus!='正常') {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=examine_comment_reader_count&action=search&submit=%A1%BE%B2%E9%D1%AF%A1%BF&novelid="+novelid+"&commentid="+commentid+"&replyid="+replyid+"&export=0\">["+examinstatus+"]<\/a>";
            } else {
                examin = "<a target='_blank' style='cursor:pointer' href=\"//go.jjwxc.net/guanli/menu.php?act=showCount&do=search&novelIdOfComment="+novelid+"&commentId="+commentid+"&replyId="+replyid+"\">["+examinstatus+"]<\/a>";
            }
        } else {
            examin = null;
        }
        result = "<span class=\"toleft\">IP：<a href=\"\/\/"+url+"\/guanli/menu.php?act=allsearch&ip="+ip+"&novelid="+novelid+"&action=search&tablename=reply\" target=\"_blank\"> <span class=\"redtext ip\">"+ip+" 来自："+ip_pos+"<\/span> <font class='"+ip_class+"'><\/font></a><\/span>"+selectexamin+examin+"&nbsp;<a style='cursor:pointer' onclick=\"handleComment('"+url+'/guanli/delete.php\','+novelid+','+replyid+",\'reply\',this,'')\">[删除]<\/a>&nbsp;<a style='cursor:pointer' onclick=\"handleComment('"+url+'/guanli/zero_ajax.php\','+novelid+','+replyid+",\'reply\',this,'')\">[清零]<\/a>";
    } else {
//判断读者是否有对这篇文章删评的权限
        var commentright = getcommentright();
        if (commentright!=null) {
            var authorid = $("#authorid_").text();
            if (commentdate>=commentright[0]&&commentright[1]>=commentdate&&commentright[2]==authorid&&commentright[3]==getCookie('readerid')) {
                result += "<a style='cursor:pointer' onclick=\"delPowerComment('"+url+'/delcomment_ajax.php\','+novelid+','+replyid+",\'reply\',this,4)\">[删除回复]<\/a>";
            }
        }
        result+="<div style='clear:both'></div>";
    }
    document.write(result);
}


// --- 评论延迟加载方案
var offset_show = (function() {
    var comment_count = 1;
    return function() {
        if (comment_count<=0) {
            return;
        }
        if ($('#comment_list').length<=0) {
            comment_count = 0;
            return;
        }
        var viewtop = $('#comment_list').offset()['top']-$(window).scrollTop()-$(window).height();
        if (viewtop>500) {
            setTimeout(offset_show, 200);
            return;
        }
        setFilterWord();
        get_comment_new();
        comment_count--;
        return;
    }
})();

function setFilterWord() {
    if (getCookie('readerid') != null && isSupportLocalStorage()) {
        var serverFilterVersion = getCookie('commentfilterversion_key');
        if (!serverFilterVersion) {
            return false;
        }
        var nowFilterWord = JSON.parse(localStorage.getItem('commentfilterword_version' + getCookie('readerid')));
        if (!nowFilterWord || parseInt(nowFilterWord.version) < parseInt(serverFilterVersion)) {
            $.getJSON('//my.jjwxc.net/backend/user_setting.php?action=getFilterWord&jsonp=?&r='+Math.random(), function(info) {
                if (info.status == 200 && info.data.version != undefined) {
                    localStorage.setItem('commentfilterword_version' + getCookie('readerid'), JSON.stringify(info.data));
                }
            });
        }
    }
}

function filterComment() {
    if (getCookie('readerid') != null && isSupportLocalStorage()) {
        console.log('filterComment');
        var filterWord = JSON.parse(localStorage.getItem('commentfilterword_version' + getCookie('readerid')));
        var hideNum = 0;
        if (filterWord && filterWord.words != undefined && filterWord.words.length > 0) {
            if (location.pathname === '/comment.php') {
                var novelid = getURLParam('novelid');
                $('#comments_' + novelid + ' .readtd').each(function() {
                    //长评标题(如果有) + 评论
                    var comment_text = $(this).find('span[class="bigtext"]').text() + $(this).find('span[id^="mormalcomment_"]').text();
                    //昵称
                    var nickname_text = $(this).find('span[id^="foldlingauthor_"]').data('foldlingauthor');
                    nickname_text = !nickname_text ? '': nickname_text;
                    for(var i in filterWord.words) {
                        if (comment_text.toString().indexOf(filterWord.words[i]) >= 0 || nickname_text.toString().indexOf(filterWord.words[i]) >= 0) {
                            //console.log($(this).parent().attr('id'), filterWord.words[i], comment_text, nickname_text);
                            hideNum++;
                            $(this).parent().remove();
                            return true;
                        }
                    }
                    //回复
                    if ($(this).find('.replycontent').children('.replybody').length > 0) {
                        $(this).find('.replycontent').children('.replybody').each(function() {
                            var reply_text = $(this).find("span[id^='mormalreply_']").text();
                            //昵称
                            var nickname_text = $(this).find('span[id^="foldlingauthor_"]').data('foldlingauthor');
                            nickname_text = !nickname_text ? '': nickname_text;
                            for(var i in filterWord.words) {
                                if (reply_text.toString().indexOf(filterWord.words[i]) >= 0 || nickname_text.toString().indexOf(filterWord.words[i]) >= 0) {
                                    //console.log($(this).parent().attr('id'), filterWord.words[i], reply_text, nickname_text);
                                    $(this).parent().remove();
                                    return true;
                                }
                            }
                        });
                    }
                });
                $('.rightul2 li').each(function(){ //加精
                    var comment_text = $(this).find('span').eq(0).text();
                    for(var i in filterWord.words) {
                        if (comment_text.indexOf(filterWord.words[i]) >= 0) {
                            //console.log(filterWord.words[i], comment_text);
                            $(this).remove();
                            return true;
                        }
                    }
                });
            } else {
                $('#comment_list .readtd').each(function() {
                    //评论
                    var comment_text = $(this).find('span[id^="mormalcomment_"]').eq(0).text();
                    //昵称
                    var nickname_text = $(this).find('span[id^="foldlingauthor_"]').data('foldlingauthor');
                    nickname_text = !nickname_text ? '': nickname_text;
                    for(var i in filterWord.words) {
                        if (comment_text.toString().indexOf(filterWord.words[i]) >= 0 || nickname_text.toString().indexOf(filterWord.words[i]) >= 0) {
                            //console.log(filterWord.words[i], comment_text, nickname_text);
                            hideNum++;
                            $(this).parent().remove();
                            return true;
                        }
                    }
                    //回复
                    if ($(this).find('.replycontent').children('.replybody').length > 0) {
                        $(this).find('.replycontent').children('.replybody').each(function() {
                            var nickname_text = $(this).find('span[id^="foldlingauthor_"]').data('foldlingauthor');
                            nickname_text = !nickname_text ? '': nickname_text;
                            var reply_text = $(this).find('span[id^="mormalreply_"]').eq(0).text();
                            //console.log($(this).parent().attr('id'), reply_text);
                            for(var i in filterWord.words) {
                                if (reply_text.toString().indexOf(filterWord.words[i]) >= 0 || nickname_text.toString().indexOf(filterWord.words[i]) >= 0) {
                                    //console.log(filterWord.words[i], reply_text, nickname_text);
                                    hideNum++;
                                    $(this).remove();
                                    return true;
                                }
                            }
                        });
                    }
                });
                if (location.pathname === '/onebook.php' || location.pathname === '/onebook_vip.php') {
                    $('.rightul2 li').each(function(){ //加精
                        var comment_text = $(this).find('span').eq(0).text();
                        for(var i in filterWord.words) {
                            if (comment_text.toString().indexOf(filterWord.words[i]) >= 0) {
                                //console.log(filterWord.words[i], comment_text);
                                $(this).remove();
                                return true;
                            }
                        }
                    });
                    if ($('#comment_list').length > 0) {
                        $('#comment_list').nextAll('.readtd').find('.rightul li').each(function() {//长评
                            var comment_text = $(this).find('a').eq(0).text();
                            for(var i in filterWord.words) {
                                if (comment_text.toString().indexOf(filterWord.words[i]) >= 0) {
                                    //console.log(filterWord.words[i], comment_text);
                                    $(this).remove();
                                    return true;
                                }
                            }
                        });
                        $('#comment_list').nextAll('.readtd').find('.rightul2 li').each(function() {//话题
                            var comment_text = $(this).find('a').eq(0).text();
                            for(var i in filterWord.words) {
                                if (comment_text.toString().indexOf(filterWord.words[i]) >= 0) {
                                    //console.log(filterWord.words[i], comment_text);
                                    $(this).remove();
                                    return true;
                                }
                            }
                        });
                    }
                }
            }

            if ($('#hide_comment_replay').length) {
                if (hideNum) {
                    $('#hide_comment_replay_num').html(parseInt($('#hide_comment_replay_num').html()) + hideNum);
                    $('#hide_comment_replay').show();
                }
            }

        }
    }
}

// --- 验证码刷评提示
function comment_auth_num(commentWithNut) {
    var auth_num = $('#auth_num_login').val();
    if (auth_num==0) {
        $('#auth_num_message').html('请输入验证码再提交登入！');
    } else {
        $('#comment_auth_num').val(auth_num);
        $.unblockUI();
        if (commentWithNut !== undefined && commentWithNut === true) {
            commentWithKingNNutrition();
        } else {
            insert_comment();
        }
    }
}
function reply_auth_num(commentid) {
    var auth_num = $('#reply_num_login').val();
    if (auth_num==0) {
        $('#auth_num_message').html('请输入验证码再提交登入！');
    } else {
        $.unblockUI();
        reply_submit(commentid);
    }
}

//vip  xwb
function payclick(id) {
    var obj = $('#'+id)
    if (getCookie('readerid')==null) {
        setClickType(obj);
    }
    if (is_login()) {
        window.location = $('#'+id).attr('rel');
    }
}


function vip_buy(id) {
    pop = id;
    var obj = $('#'+id)
    if (getCookie('readerid')==null) {
        setClickType(obj);
    }
    if (is_login()) {
        window.location = $('#'+id).attr('rel');
    }
}

function imgautoreload() {
    var r = Math.random();
    $('#img_auth').attr('src', '//my.jjwxc.net/include/checkImage.php?action=pay&r='+r);
    if ($("#code_random").length>0) {
        $("#code_random").val(r);
    } else {
        $("#publish_comment").append("<input type='hidden' value='"+r+"' name='random' id='code_random'>");
    }
}

$(function() {
    // 复制的时候添加文章来源链接(IE) 
    document.body.oncopy = function() {
        var urlText = "\r\n本文转自晋江文学城，原文地址："+window.location.href;
        if (window.clipboardData) {
            setTimeout(function() {
                if (clipboardData.getData("text")) {
                    clipboardData.setData("text", clipboardData.getData("text")+urlText);
                    copy2Clipboard(clipboardData.getData("text"));
                }
            }, 100);
        }
    }

    if (getCookie('userclosecomment') == '1') {
        hideCommentForCloseComment('您已关闭评论，如需参与评论互动，可前往我的晋江-其他设置-评论区自行开启');
    }

    UserCloseNovelComment();

    $(".bigtext").click(function() {
        $('#message').html("请稍候，正在获取文章").css("color", "red").fadeIn("slow");
    })

    $(".payclick").click(function() {
        if (is_login()) {
            window.location = $('#'+$(this).attr('id')).attr('rel');
        }
    })

    $(".load-local").hover(function() {
        var id = $(this).attr('rel');
        var left = getAbsoluteLeft($(this).attr('id'))-290;
        var top = getAbsoluteTop($(this).attr('id'));
        $('#cluetip').css('left', left+'px').css('top', top);
        $('#cluetip').html($(id).html());
        $('#cluetip').toggle();
    }, function() {
        $('#cluetip').toggle();
    })


    $(".vip_month_package").click(function() {
        if (getCookie('readerid')==null) {
            setClickType(this);
        }

        var novelid = getURLParam('novelid');
        if (is_login()) {
            window.location = '//my.jjwxc.net/backend/buynovel.php?novelid='+novelid+'&chapterid='+$(this).attr('chapterid');
        }
    });
    $(".vip_buy").click(function() {
        if (is_login()) {
            window.location = $(this).attr('ref');
        }
    });
    $('#chapter_list').bind('mouseover', function() {
        chapterlist_init();
    })
//   加载评论
    if (url=='onebook.php'||url=='onebook_vip.php'||url.indexOf('book/')!=-1||url.indexOf('vip/')!=-1) {
        offset_show();
        if (url == 'onebook.php' && $('#favorite_1').length > 0) {
            getNovelFavStatus(getURLParam('novelid'),'favorite_1')
        }
    } else if (url=='comment.php') {
// --- 加载回复评论提交行为
        $('.reply_submit').bind('click', function() {
            $('.reply_box').remove();
            $('#replacediv').remove();
            var id = $(this);
            var commentid = id.attr('id');
            reply_submit_open(commentid)
        })
    }

    $('body').focus();
    // 加载文章收藏行为  注意这里是收藏章节。上面是收藏文章作品。
    $('.favorite_novel').bind('click', function() {
        var clicktype = jjCookie.get('clicktype');
        if (clicktype=='favorite_2'||clicktype=='favorite_3') {
//当用户没登入时，点击触发登入，异步登入后，收藏章节和书签执行此段 xwb
            var flag = $('#'+clicktype).html();
            var rel = $('#'+clicktype).attr('rel');
        } else {
            var flag = $(this).html();
            var rel = $(this).attr('rel');
        }

        if (flag!='收藏此文章'&&flag!='收藏此章节'&&flag!='插入书签'&&flag!='收藏此章?'&&flag!='插入??') {
            return false;
        }

        rel = rel.split('|');
        var novelId = getURLParam('novelid');
        var chapterId = getURLParam('chapterid');
        if (chapterId==null||chapterId=='null') {
            chapterId = 0;
        }
        var id = rel[0];
        jjCookie.set('bookFavoriteClass', 'favorite_'+id);
        jjCookie.set('clicktype', 'favorite_'+id); //这设置的clicktype为favorite_2 即收藏章节 favorite_3为加入书签 xwb
        var chapterbookmarks = "yes"; //点击 收藏章节，插入书签标识
        var rand = Math.random();
        if (is_login()) {
//$('#favoriteshow_'+id).html("<font color='red'>请等待.....</font>").show();
            $.getJSON('/insertfavorite.php', {
                novelid: novelId,
                chapterid: chapterId,
                chapterbookmarks: chapterbookmarks,
                rand: rand,
                checkmaxnum: 'checkmaxnum'
            }, function(data) {
//  $('#favoriteshow_'+id).html(data.strtext);
                if (data.status=='nologin') {
                    show_login();
                    return false;
                }
                if (data.oldClassname==''||data.status=='maxlimit'||data.status==100) {                       //如果收藏章节以前没有为该小说收藏分类，那么就弹框提示分类
                    if (data.strtext!='您还没有登入，所以无法使用书签功能') {  //判断是否登入
                        if (data.status=='maxlimit'||data.status==100) {
                            $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>'+data.message+'</b><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {width: '330px', height: '100px', cursor: 'default', left: '43%', top: '45%'});
                        } else {
                            if (chapterId && data.favMax && data.favMax == '1') {
                                jjCookie.set('clicktype', '');
                                $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>'+data.strtext+'</b><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {width: '330px', height: '100px', cursor: 'default', left: '43%', top: '45%'});
                                setTimeout('$.unblockUI()',3000);
                                return;
                            }
                            $('#float_message').html(data.strtext); //提示收藏成功信息
                            var html = ''; //初始化html;
                            var favorite = new Array();
                            var classid = new Array();
                            favorite = data.favoriteClass.split('|'); //使用|分割分类的数据
                            classid = data.favoriteClassid.split('|'); //使用|分割分类的数据
                            if (favorite!='') {                        //如果读者有收藏分类，就循环输出分类
                                for (i = 0; i<favorite.length; i++) {
                                    var class_id = classid[i];
                                    var title = favorite[i];
                                    if (favorite[i].length>8) {
                                        favorite[i] = favorite[i].substr(0, 7)+'…';
                                    }
                                    html += '<li style="white-space: nowrap;overflow: hidden;"><font style="cursor:pointer;color:green;" id="'+class_id+'" title="'+title+'" onmouseout=\"this.style.textDecoration=\'none\'\" onmouseover=\"this.style.textDecoration=\'underline\'\">'+favorite[i]+'</font></li>';
                                }
                            } else {
                                html = '<span style="float:left;margin:38px 0 0 -16px;color:red;">~~您还没有【定制收藏类别】哦！点击定制收藏类别，增加分类吧！</span>';
                            }

                            $('#float_comment_ul').html(html);
                            var clicktype = jjCookie.get('clicktype');
                            if ($('#float_favorite').css('display')=='none'&&clicktype=='favorite_2') {
                                var yOffset = 14; //定义y的偏移量
                                var y = getAbsoluteTop('favorite_2');
                                var top = y+yOffset;
                                $('#mongolia_layer').show();
                                var left = (document.body.clientWidth-$('#float_favorite').outerWidth())/2;
                                $('#float_favorite').css({
                                    left: left+'px',
                                    top: top+'px'
                                }).show();
                            } else {
                                var yOffset = -120; //定义y的偏移量
                                var y = getAbsoluteTop('favorite_3');
                                var top = y+yOffset;
                                $('#mongolia_layer').show();
                                var left = (document.body.clientWidth-$('#float_favorite').outerWidth())/2;
                                $('#float_favorite').css({
                                    left: left+'px',
                                    top: top+'px'
                                }).show();
                            }
                        }
                    } else {
                        var message = ''; //初始化变量
                        message = '<span>'+data.strtext+'</span>'; //未登入的提示
                        $.blockUI(message);
                        setTimeout(function() {
                            $.unblockUI();
                        }, 1500);
                        false;
                    }
                } else {
                    $('#favoriteshow_'+id).html(data.strtext).show(); //文章《novelname》novleid 之前已经被成功收藏，您可以在收藏列表的【oldClassname】 类别当中找到^_^
                }
                $('#float_comment_ul font').click(function() {
                    var spans = $(this).attr('id');
                    var readerid = getCookie("readerid");
                    var action = 'articlesCategory';
                    $.post('/insertfavorite.php?rand='+rand, {
                        action: action,
                        novelid: novelId,
                        chapterid: chapterId,
                        classid: spans
                    }, function(result) {
                        if (result=='200') {
                            $('#float_comment_ul').html('<span style="margin:35px 0 0 0;margin:35px 0 0 120px\\9;float:left;font-size:14px;">文章收藏分类<font color="green">成功</font></span>');
                        } else {
                            $('#float_comment_ul').html('<span style="margin:35px 0 0 0;margin:35px 0 0 120px\\9;float:left;font-size:14px;">文章收藏分类<font color="red">失败</font></span>');
                        }
                        setTimeout(close_fav, 2000);
                    });
                })
                //清空cookie防止冲突 xwb
                jjCookie.set('clicktype', '');
            });
        }
    }).css({
        'cursor': 'pointer',
        'font-size': '12px'
    });
    $('#report_menu1').hover(
            function() {
                $('#report_list1').show();
            },
            function() {
                $('#report_list1').hide();
            }
    )

    $('#report_list1 > li').css({
        'list-style-type': 'none',
        'background-color': '#FFFFFF',
        'color': '#8B8C8B'
    }).hover(
            function() {
                $(this).css({
                    'background-color': '#ECF1E9',
                    'color': '#E6211A'
                });
            },
            function() {
                $(this).css({
                    'background-color': '#FFFFFF',
                    'color': '#8B8C8B'
                });
            }
    );
    $('#report_menu2').hover(
            function() {
                $('#report_list2').show();
            },
            function() {
                $('#report_list2').hide();
            }
    )

    $('#report_list2 > li').css({
        'list-style-type': 'none',
        'background-color': '#FFFFFF',
        'color': '#8B8C8B'
    }).hover(
            function() {
                $(this).css({
                    'background-color': '#ECF1E9',
                    'color': '#E6211A'
                });
            },
            function() {
                $(this).css({
                    'background-color': '#FFFFFF',
                    'color': '#8B8C8B'
                });
            }
    );
    var novelintronum = 0;
    if ($('#novelintro').size()>0) {
        var novelintro = $('#novelintro').html();
        if (novelintro!='') {
            if (novelintro.indexOf("http://product.dangdang.com/")!=-1) {
                novelintronum++;
                novelintro = novelintro.replace(/http:\/\/product.dangdang.com\//g, "http://count.chanet.com.cn/click.cgi?a=38707&d=155762&u=&e=&url=http://product.dangdang.com/");
            }
            if (novelintro.indexOf("http://www.amazon.cn/")!=-1) {
                novelintronum++;
                novelintro = novelintro.replace(/http:\/\/www.amazon.cn\//g, "http://count.chanet.com.cn/click.cgi?a=38707&d=155754&u=&e=&url=http://www.amazon.cn/");
            }
            if (novelintronum>0) {
                $('#novelintro').html(novelintro);
            }
        }
    }

    $(document).on('click', '.block_novel_comment', function() {

        if (!is_login()) {
            return false;
        }

        var novelid = $(this).data('novelid');
        var html = '<div style="text-align: left">'+
                '                ①设置不看本文评论后，您将无法查看、发布、回复本文评论，投雷时系统自动生成的评论仍会正常发布；<br>\n'+
                '                ②设置会在PC、wap、App保持同步；<br>'+
                '                ③修改设置后，重启App、刷新PC/wap页面或重新登录账号，设置将生效。<br>'+
                '            </div>'+
                '            <div style="margin-top: 10px;">'+
                '                <button onclick="$.unblockUI()">再想想</button>\n'+
                '                <button data-novelid="0" onclick="closeNovelComment('+novelid+')">不看本文评论</button>'+
                '            </div>';
        $.blockUI(html, {'width' : '400px'});

    });

    $(document).on('click', '.recovery_block_novel_comment', function() {
        var novelid = $(this).data('novelid');
        if (!getCookie('readerid')) {
            alert("请先登入");
            return false;
        }
        if (novelid) {
            $.ajax({
                url: '//my.jjwxc.net/backend/user_setting.php?action=delCloseNovelComment&novelids='+novelid+'&jsonp=?',
                type: 'GET',
                dataType: 'jsonp',
                cache: false,
                success: function(res) {
                    if (res.status == 200) {
                        location.reload();
                    } else {
                        alert(res.message);
                        return false;
                    }
                },
                error: function() {
                    alert("请求异常，请稍后重试");
                    return false;
                }
            });
        }
    });

    (function() {

        if (location.pathname === '/comment.php') {
            //这里需要await 不然会出现初次进页面敏感词版本落后问题
            setFilterWord();
            filterComment();
        }

        if (!(location.pathname=='/onebook_vip.php'||location.pathname=='/onebook.php')) {
            return;
        }

        var desid = jjCookie.get('desid', true);
        var readerid = getCookie('readerid');
        if (!readerid) {
            return;
        }
        var novelid = parseInt(getURLParam('novelid'));
        var chapterid = parseInt(getURLParam('chapterid'));
        if (!novelid||!chapterid) {
            return;
        }

        var progressKey = 'readingProgress';
        var str = sessionStorage.getItem(progressKey);
        var novelidArr = [];
        if (str) {
            novelidArr = str.split(',')
        }
        if (novelidArr.indexOf(novelid+'') !== -1) {
            // 文章是否已经校验过阅读进度
            setTimeout(function(){
                uploadReadingProgress();
            },10000);
        } else {
            // 校验阅读进度
            var sid = encode64(readerid + '_' + getCookie('ubuntu'));
            $.ajax({
                url: '//my.jjwxc.net/app.jjwxc/Pc/ReadingProgress/getReadingProgress',
                type: "POST",
                dataType: 'jsonp',
                jsonp: "jsonp",
                data: {'novelid': novelid, 'chapterid':chapterid, 'source':'pc', 'token': sid},
                success: function(json) {
                    novelidArr.push(novelid);
                    sessionStorage.setItem(progressKey,novelidArr.join(','));
                    if (json.code == 200 && parseInt(json.data.chapterid)) {
                        var htmlStr = '<div>' +
                                '<div style="width: 100%;text-align: center;font-size:16px;color:#3a3a3a;font-weight:bold;margin-bottom:10px;">阅读进度同步（beta）</div>' +
                                '<div style="color:#787878;text-align: left;font-size:14px;line-height: 18px;">' +
                                '   <div style="position:relative;"><img src="//static.jjwxc.net/images/currentPosition.png" style="width: 30px;">' +
                                '       <div style="position: absolute;top:10px;left:39px;width: 210px;line-height: 23px;">当前进度<div>第'+chapterid+'章<div style="float: right;"><button type="button" style="font-size: 12px;" id="progressCancel">第'+chapterid+'章 &gt;</button></div> </div></div>' +
                                '   </div>' +
                                '   <div style="position:relative;margin-top:20px;clear: both;"><img src="//static.jjwxc.net/images/cloudPosition.png" style="width: 30px;">' +
                                '       <div style="position: absolute;top:10px;left:39px;width: 210px;line-height: 23px;">云端进度<div>第'+json.data.chapterid+'章<div style="float: right;"><button type="button" style="font-size: 12px;" onclick="window.location.href=\'//www.jjwxc.net/onebook.php?novelid='+novelid+'&chapterid='+json.data.chapterid+'\'">第'+json.data.chapterid+'章 &gt;</button></div></div></div>' +
                                '   </div>' +
                                '   <div style="padding-left: 40px;clear:both;margin-top: 2.3em;">'+json.data.readingtime+'&nbsp;&nbsp;来自'+json.data.source+'</div>' +
                                '</div>' +
                                '<div style="margin-top: 10px;text-align: left;padding-left: 39px;"><label><input type="radio" style="vertical-align:middle;margin-top: -3px;" id="closeProgress">不再提示</label>' +
                                '   <div style="margin-top:10px;">可在【我的晋江】-【其他设置】中再次开启</div>' +
                                '</div>' +
                                '</div>';
                        $.blockUI(htmlStr,{width:'280px'});
                        $('#closeProgress').live("click", function() {
                            $.ajax({
                                url: '/backend/user_setting.php?action=updateSetting',
                                dataType: 'json',
                                type: 'post',
                                data: {
                                    setting_type: 7,
                                    content: 0
                                },
                                success: function(res) {
                                    if (res.status!=200) {
                                        alert(res.message);
                                    }
                                },
                                error: function() {
                                    alert("失败请稍后重试");
                                }
                            });
                        });
                        $('#progressCancel').live("click", function() {
                            // 取消时上传阅读进度
                            $.unblockUI();
                            uploadReadingProgress();
                        });
                    } else {
                        setTimeout(function(){
                            uploadReadingProgress();
                        }, 10000);
                    }
                },
                error:function(xhr, status, error) {
                    console.log({xhr:xhr,status:status,error:error});
                }
            })
        }
        // 上传阅读进度
        function uploadReadingProgress() {
            var timestamp = Date.parse(new Date())/1000;
            var processStr = '[{"readerid":'+readerid+',"novelid":'+novelid+',"chapterid":'+chapterid+',"position":1,"text":"","readingtime":"'+timestamp+'","source":"pc","versioncode":"","phonemodel":"","dateline":'+timestamp+'}]';
            var sid = encode64(readerid + '_' + getCookie('ubuntu'));
            $.ajax({
                url: '//android.jjwxc.net/readingProgressAndroid/readingProgress',
                type: "POST",
                dataType: 'json',
                data: {'readingprogressstring': processStr, 'user_token': sid},
                success: function(json) {
                    console.dir(json)
                },
                error:function(xhr, status, error) {
                    console.log({xhr:xhr,status:status,error:error});
                }
            })
        }

        var isLastRead = checkLastRead(novelid, chapterid);
        if (isLastRead) {
            return;
        }
        if (Math.random()<=0.01) {
            $.ajax({
                url: '//my.jjwxc.net/lib/ajax.php',
                type: "POST",
                dataType: 'jsonp',
                data: {'action': 'readHistory', 'novelid': novelid, 'chapterid': chapterid, 'source': 'pc'}
            })
        }

        function checkLastRead(novelid, chapterid) {
            var useStorage = (typeof JSON=='object'&&typeof sessionStorage=='object');
            if (!useStorage) {
                return false;
            }
            var storagekey = 'jjreadlast';
            var history = JSON.parse(sessionStorage.getItem(storagekey));
            var now = (new Date()).getTime();
            var isLastRead = false;
            if (history&&history.novelid==novelid&&history.chapterid==chapterid&&(now-history.readtime)<600000) {
                isLastRead = true;
            }
            if (!isLastRead) {
                history = {
                    'novelid': novelid,
                    'chapterid': chapterid,
                    'readtime': now
                };
            }
            sessionStorage.setItem(storagekey, JSON.stringify(history));
            return isLastRead;
        }

    })();

    //指定文章章节全部评论-评论按照回复时间排序[https://www.jjwxc.net/comment.php?novelid=4868058&chapterid=4&page=2]
    $('#comment_more_sort').live('change', function() {
        var commentSort = $('#comment_more_sort').val();
        // commentSort = commentSort ? 0 : 1;
        locationUrl = window.location.href;
        sortPositionIndex = locationUrl.indexOf('&commentSort');
        if (sortPositionIndex != -1) {
            locationUrl = locationUrl.substr(0, sortPositionIndex);
        }
        var novelid = getURLParam('novelid');
        setCookie(novelid, commentSort, new Date(eval(clientTime.getTime()+86400*1000)), '/', '.jjwxc.net');
        window.location.href = locationUrl + '&commentSort='+commentSort;
    });
});
// 获取文章收藏状态
function getNovelFavStatus(novelid, eleId) {
    var readerid = parseInt(getCookie('readerid'));
    if (!isNaN(readerid) && readerid > 0 && !isNaN(parseInt(novelid))) {
        $.ajax({
            url: '/app.jjwxc/Pc/Favorite/favoriteStatus',
            type: 'post',
            dataType: 'json',
            data: {'favnovelid': novelid},
            success: function(json) {
                if (json.code == 200) {
                    var favInfo = json.data[0];
                    $('#'+eleId).data('fav',favInfo.status);
                    if (favInfo.status === '1') {
                        $('#'+eleId).html('已收藏').attr('title',favInfo.class_name && parseInt(favInfo.classid)  ? '该文收藏在分类【'+favInfo.class_name+'】中~' : '该文尚未分类');
                    }
                }
            }
        })
    }
}
// 删除收藏文章
function cancelFavNovel(novelid) {
    $.ajax({
        url: '/app.jjwxc/Pc/Favorite/deleteNovelFavorite',
        type: 'post',
        dataType: 'json',
        data: {'novelids': novelid,'isread':0},
        success: function(json) {
            if (json.code == 200) {
                $('#float_comment_ul').html('<span style="margin:35px 0 0 120px;float:left;font-size:14px;">文章删除收藏<font color="green">成功</font></span>');
                $('#favorite_1').data('fav','0').html('收藏此文章').removeAttr('title');
                setTimeout(close_fav, 1000);
            } else if(json.code == 223001 ) {
                show_login();
            } else {
                alert(json.message)
            }
        },
        error: function(xhr, status, error) {
            alert('请求异常，稍候请重试');
            console.log({xhr:xhr,status:status,error:error});
        }
    })
}
// 弹窗选择收藏分类
function showFavNovelSetClass(data) {
    var novelid = getURLParam('novelid');
    var chapterId = getURLParam('chapterid');
    if (chapterId==null||chapterId=='null') {
        chapterId = 0;
    }
    var html = ''; //初始化html;
    var favorite = new Array();
    var classid = new Array();
    favorite = data.favoriteClass.split('|'); //使用|分割分类的数据
    classid = data.favoriteClassid.split('|'); //使用|分割分类的数据
    var isCurrentClass = false;
    if (favorite!='') {                        //如果读者有收藏分类，就循环输出分类
        if (parseInt(classid[0]) !== 0) {
            isCurrentClass = !data.oldClassid && !data.oldClassname;
            html += '<li class="fav_class_li '+(isCurrentClass ? 'active' : '')+'" style="white-space: nowrap;overflow: hidden;box-shadow: 2px 2px 5px #D3D6DA;line-height:22px;height:22px;background: '+(isCurrentClass ? '#b3e19d' : '#e0f0fa')+';"><font style="cursor:pointer;color:green;white-space: nowrap;overflow: hidden;" id="0" title="尚未分类" onmouseout=\"this.style.textDecoration=\'none\'\" onmouseover=\"this.style.textDecoration=\'underline\'\">尚未分类</font></li>';
        }
        for (var i = 0; i<favorite.length; i++) {
            var class_id = classid[i];
            var title = favorite[i];
            if (favorite[i].length>8) {
                favorite[i] = favorite[i].substr(0, 7)+'…';
            }
            isCurrentClass = class_id === data.oldClassid || data.oldClassname === favorite[i];
            html += '<li class="fav_class_li '+(isCurrentClass ? 'active' : '')+'" style="white-space: nowrap;overflow: hidden;box-shadow: 2px 2px 5px #D3D6DA;line-height:22px;height:22px;background: '+(isCurrentClass ? '#b3e19d' : '#e0f0fa')+';"><font style="cursor:pointer;color:green;white-space: nowrap;overflow: hidden;" id="'+class_id+'" title="'+title+'" onmouseout=\"this.style.textDecoration=\'none\'\" onmouseover=\"this.style.textDecoration=\'underline\'\">'+favorite[i]+'</font></li>';
        }
    } else {
        html = '<span style="float:left;margin:38px 0 0 -16px;color:red;">~~您还没有【定制收藏类别】哦！点击定制收藏类别，增加分类吧！</span>';
    }
    var readerid = parseInt(getCookie('readerid'));
    var novelname = '《'+$('span[itemprop="articleSection"]').text()+'》';
    $('.float_title').css({'border-radius':'10px 10px 0 0'})
    $('.float_favorite').css({'min-height':'330px','height':'auto','border-radius':'10px'});
    $('#showFavoritClassBtn').remove();
    var timeStamp = new Date().getTime();
    var jsid = isNaN(readerid) ? '' : '?jsid=' + readerid + '.' + timeStamp;
    var optBtnStr = '<div class="favGroup0315" style="clear:both;color:green;margin-left:20px;font-size:14px;text-align: left;padding-top: 8px;">' +
            '<span onclick="showFavoriteClassForm()" id="showFavoritClassBtn">【新建收藏分类】</span>&nbsp;' +
            '<a style="color: green;" href="//my.jjwxc.net/backend/fav_class.php'+jsid+'" target="_blank">【定制收藏类别】</a>&nbsp;' +
            '<a style="color: green;" href="//my.jjwxc.net/backend/favorite.php'+jsid+'" target="_blank">【查看收藏列表】</a>' +
            '</div>';
    $('.favGroup0315').remove();
    $('.float_comment').after(optBtnStr);
    // 提交部分
    var subBtnStyle = 'background:#b3e19d;color:green;border-radius:3px;width:90px;line-height:28px;display:inline-block;cursor:pointer;font-size:16px;';
    var greyBtnStyle = 'background:#c5c5c5;color:#303030;border-radius:3px;width:90px;line-height:28px;display:inline-block;cursor:pointer;font-size:16px;';
    var submitStr = '';

    $('.float_message').css({'padding':'0px 15px','box-sizing':'border-box'}).html('<img src="//static.jjwxc.net/images/right.gif" width="13" height="14" /> 已成功收藏文章'+novelname+'（文章ID：'+novelid+'），您可以在【收藏列表】-【'+(data.oldClassname ? data.oldClassname : '尚未分类')+'】中查看~如需更换分类，请在下方进行选择。');
    $('.float_comment_title').find('font').html('修改文章分类至');
    if (parseInt($('#favorite_1').data('fav')) !== 1) {
        $('#favorite_1').data('fav','1').html('已收藏').attr('title','该文收藏在分类【尚未分类】中~');
        submitStr = '<span onclick="close_fav()" style="'+greyBtnStyle+'margin-right:20px;">取消</span><span id="set_novel_fav" style="'+subBtnStyle+'">确定</span>';
    } else {
        submitStr = '<span onclick="cancelFavNovel('+novelid+')" style="'+greyBtnStyle+'margin-right:20px;">取消收藏</span><span id="set_novel_fav" style="'+subBtnStyle+'">修改分类</span>';
    }
    $('.float_foot').html(submitStr);
    $('#float_comment_ul').html(html);
    if ($('#float_favorite').css('display')=='none') {
        var left = (document.body.clientWidth-$('#float_favorite').outerWidth())/2;
        $('#mongolia_layer').show();
        if (!$('#mongolia_layer').attr('onclick')) {
            $('#mongolia_layer').attr('onclick','close_fav()');
        }
        $('#float_favorite').css({
            left: left+'px'
        }).show();
    }
    // 分类点击
    $('#float_comment_ul li').click(function() {
        $(this).addClass('active').siblings('.fav_class_li').removeClass('active');
        $(this).css('background','#b3e19d').siblings('.fav_class_li').css('background','#e0f0fa');
    })
    $('#set_novel_fav').click(function() {
        var classid = $('.fav_class_li.active').find('font').attr('id');
        var classname = $('.fav_class_li.active').find('font').text();
        // 修改分类
        var action = 'articlesCategory';
        if($("#shumeideviceId").length >0){
            var shumeideviceId = $("#shumeideviceId").val();
        }else{
            var shumeideviceId = "";
        }
        $.getJSON(httpProtocol + '://my.jjwxc.net/insertfavorite.php?jsonp=?', {
            action: action,
            novelid: novelid,
            chapterid: chapterId,
            classid: classid,
            shumeideviceId: shumeideviceId
        }, function(result) {
            if (result.status==200) {
                close_fav();
                $('#favorite_1').data('fav','1').html('已收藏').attr('title','该文收藏在分类【'+classname+'】中~');
                $.blockUI('已收藏至分类【'+classname+'】');
                setTimeout('$.unblockUI()', 3000);
            } else {
                $('#float_comment_ul').html('<span style="margin:35px 0 0 120px;float:left;font-size:14px;">文章收藏分类<font color="red">失败</font></span>');
                setTimeout(close_fav, 1000);
            }
        });
        jjCookie.set('clicktype', '');
    })
}
// 文章详情页-评论按照回复时间排序【记住用户排序】
$(document).ready(function() {
        var novelid = $('#comment_sort').data('novelid');
        var commentSortCookie = parseInt(getCookie(novelid));
        $('#comment_sort').data('commentSort', commentSortCookie);
        if (commentSortCookie && commentSortCookie != undefined && !isNaN(commentSortCookie)) {
            $('#comment_sort').val(commentSortCookie);
        } else {
            $('#comment_sort').val(0);
        }
});

if (isMyNovel()) {
    document.write("<style type=\"text\/css\">.manageArea{display:block}<\/style>")
}

function windowOpen(url, width, height) {
    window.open(url, 'mb', ['toolbar=0,status=0,resizable=1,width='+width+',height='+height+',left=', (screen.width-width)/2, ',top=', (screen.height-height)/2].join(''));
}

function closeNovelComment(novelid) {
    if (!novelid) {
        alert("请先选择要不看评论的文章");
        return false;
    }
    if (!getCookie('readerid')) {
        alert("请先登入");
        return false;
    }
    $.ajax({
        url: '//my.jjwxc.net/backend/user_setting.php?action=closeNovelComment&novelid='+novelid+'&jsonp=?',
        type: 'GET',
        dataType: 'jsonp',
        cache: false,
        success: function(res) {

            if (res.status == 200) {
                $.blockUI("操作成功");
                setTimeout(function() {
                    $.unblockUI();
                }, 3000)
            } else if (res.status == '11007') {
                var html = '<div style="text-align: left">'+res.message+'</div>'+
                        '            <div style="margin-top: 10px;">'+
                        '                <button onclick="$.unblockUI()">再想想</button>\n'+
                        '                <a href="//my.jjwxc.net/backend/user_setting.php"><button>去设置</button></a>'+
                        '            </div>';
                $.blockUI(html, {width: '300px'});

                return false;
            } else {
                alert(res.message);
                return false;
            }
        },
        error: function() {
            alert("请求异常，请稍后重试");
            return false;
        }
    });
}

function blockOpen(url, width, height) {
    $.unblockUI();
    if (/Firefox/.test(navigator.userAgent)) {
        setTimeout("windowOpen('"+url+"', "+width+", "+height+")", 0);
    } else {
        windowOpen(url, width, height);
    }
}
//检测是否使用支付密码
function checkpaypwd(id, comment) {
    if (is_login()) {
        var readerid = getCookie("readerid");
        $.ajax({
            type: "GET",
            url: 'backend/kingTicketsPay_ajax.php?action=checkpaypwd&readerid='+readerid+'&jsonp=?',
            dataType: 'jsonp',
            async: false,
            success: function(json) {
                if (json.status==200) {//需要验证码
                    $.blockUI('<div><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>请输入您设定的支付密码（格式为6位纯数字)</b><br><br><input name="paypwd" type="password" id="paypwd" maxlength="6" /><br/><br/><input type="button" onclick="kingTicketsPay(\''+id+'\','+comment+');" value="确 定" />&nbsp;&nbsp;<input type="button" value="取消" onclick="$.unblockUI();"/><br><br><center><a href="//help.jjwxc.net/user/password/2">[忘记支付密码?]</a></center></div>', {width: '330px',
                        height: '150px',
                        cursor: 'default'
                    });
                } else {//不需要
                    kingTicketsPay(id, comment);
                }
            }
        })
    }
}

//检测霸王票是否需要支付密码
function checkpaypwdV2(resolve, reject) {
    if (is_login()) {
        var readerid = getCookie("readerid");
        $.ajax({
            type: "GET",
            url: 'backend/kingTicketsPay_ajax.php?action=checkpaypwd&readerid='+readerid+'&jsonp=?',
            dataType: 'jsonp',
            async: false,
            success: function(json) {
                if (json.status==200) {//需要验证码
                    typeof resolve === 'function' && resolve();
                } else {//不需要
                    typeof reject === 'function' && reject();
                }
            }
        })
    }
}

//加入第二个参数,目录页投霸王票将发评
function kingTicketsPay(id) {
    var comment = arguments[1] ? arguments[1] : false;
    var novelid = getURLParam('novelid');
    var t = $('#'+id).attr('rel');
    //霸王票数量,默认为1
    var num = 1;
    if ($('#'+id).next().attr('id')=='KingTickets_deeptorpedo_num') {
        num = $('#'+id).next().val();
    }
    var paypwd = $('#paypwd').val();
    var r = 0;
    if ($("#code_random").length>0) {
        r = $("#code_random").val();
    }
    if (is_login()) {
        $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
        //评论信息参数
        var chapterid, commentmark, commentbody, comment_auth_num, commentsubject;
        if (comment===true) {//目录页
            chapterid = 0;
            commentmark = 5;
            commentbody = $("#ticket_comment").val();
            comment_auth_num = ''; //验证码
            commentsubject = '';
        } else {//章节页
            var subObj = $("#publish_comment");
            $('#submit_comment').html('<img src="//static.jjwxc.net/images/loading.gif">');
            chapterid = subObj.find("#chapterid").val();
            commentmark = subObj.find("#commentmark").val();
            commentsubject = subObj.find("#commentsubject").val();
            commentbody = subObj.find("#commentbody").val().replace(/^\s+|\s+$/g, '');
            if (commentbody=='') {
                commentbody = $("#ticket_comment").val();
            }
            comment_auth_num = subObj.find('#comment_auth_num').val();
        }
        var commentauthor = cookieNickName.get();
        var datapost = {
            novelid: novelid,
            chapterid: chapterid,
            commentauthor: commentauthor,
            commentmark: commentmark,
            commentsubject: commentsubject,
            commentbody: commentbody,
            comment_auth_num: comment_auth_num,
            r: r
        };
        $.ajax({
            url: 'backend/kingTicketsPay_ajax.php?action=pay&num='+num+'&t='+t+'&paypwd='+paypwd+'&jsonp=?',
            data: datapost,
            method: 'post',
            dataType: 'jsonp',
            success: function(json) {
                if (json.status==200) {
                    $.blockUI('<div align="center" style="font-size: 12px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>'+json.message+'</b><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {
                        width: '330px',
                        height: '250px',
                        cursor: 'default'
                    });
                    //重新加载霸王票排行
                    if (((window.location.href).indexOf("onebook.php")>=0||(window.location.href).indexOf("onebook_vip.php")>=0)&&$("#ticketsort").length>0) {
                        $("#allrank").html(json.ticketSort.ranking);
                        $("#diffrank").html(json.ticketSort.gap);
                    }
                    if ((window.location.href).indexOf("noveloverlist.php")>=0&&$("#tickettd").length>0) {
                        if (json.ticketSort.lastid!=0) {
                            var lasthtml = '上一名:<a href="//www.jjwxc.net/onebook.php?novelid='+json.ticketSort.lastid+'">《'+json.ticketSort.last_novel_name+'》</a><a href="//www.jjwxc.net/oneauthor.php?authorid='+json.ticketSort.last_authorid+'">'+json.ticketSort.last_author_name+'</a>';
                        } else {
                            var lasthtml = '';
                        }

                        if (json.ticketSort.nextid!=0) {
                            var nexthtml = '下一名:<a href="//www.jjwxc.net/onebook.php?novelid='+json.ticketSort.nextid+'">《'+json.ticketSort.next_novel_name+'》</a><a href="//www.jjwxc.net/oneauthor.php?authorid='+json.ticketSort.next_authorid+'">'+json.ticketSort.next_author_name+'</a>';
                        } else {
                            var nexthtml = '';
                        }

                        var tickethtml = '';
                        if (json.ticketSort.ranking=='暂无排名'&&parseInt(json.ticketSort.gap)==0) {
                            tickethtml = '当前霸王票全站排行<span style="font-size:2em;font-weight:bold;">暂无</span>，投<span style="font-size:2em;font-weight:bold;">1</span>颗地雷就有名次啦';
                            var lasthtml = '';
                            var nexthtml = '';
                        } else {
                            tickethtml = '当前霸王票全站排行<span style="font-size:2em;font-weight:bold;">'+json.ticketSort.ranking+'</span>，还差<span style="font-size:2em;font-weight:bold;">'+json.ticketSort.gap+'</span>颗地雷就可以前进一名';
                        }
                        $("#lasttd").html(lasthtml);
                        $("#nexttd").html(nexthtml);
                        $("#tickettd").html(tickethtml);
                    }
                    if (((window.location.href).indexOf("onebook.php")>=0||(window.location.href).indexOf("onebook_vip.php")>=0)&&$("#tickets_box").length>0) {
                        var listring = '<li><a target="_blank" href=\"//www.jjwxc.net/onereader.php?readerid='+json.readerid+'\">'+json.consumers+'</a>扔了一颗'+json.ticketdesc+'</li>';
                        if ($("#addlist").html()==undefined) {
                            $("#tickets_box").html('<ul id="addlist">'+listring+'</ul>');
                        } else {
                            if ($("#addlist li").length>6) {
                                $("#addlist li:last-child").remove();
                            }
                            $("#addlist").prepend(listring);
                        }
                    }
                    setCookie('comment_submit', '', 0, '/'); //清除发评2分限制
                } else if (json.status==10) {
                    var randid = Math.random();
                    $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>请输入验证码再提交</b><br><br>验证码 <input name="auth_num_login" class="input" id="auth_num_login" size="10" maxlength="8" />&nbsp; <img id="img_auth" rel="2" src=\"//my.jjwxc.net/include/checkImage.php?action=pay&r='+randid+'\"> <span id="img_auth_reload" style="cursor:pointer; color: blue; text-decoration: underline;" onClick="imgautoreload()">看不清</span><br><br><span id="Ekey_message" style="color: red"></span><br><br><input type="button" value="提 交" onClick="comment_auth_num()"/>&nbsp;&nbsp;&nbsp;</div>', {
                        width: '350px',
                        height: '130px',
                        cursor: 'default'
                    });
                    if ($("#code_random").length>0) {
                        $("#code_random").val(randid);
                    } else {
                        $("#publish_comment").append("<input type='hidden' value='"+randid+"' name='random' id='code_random'>");
                    }
                    $('#submit_comment').html('<input type="button" value="确定" tabindex="7" class="fanbutton" name="button1" onclick="insert_comment()"/>');
                } else if (json.status==1022) {
                    // 读者ID缺失，js中cookie未清理掉
                    show_login();
                    window.scroll(0, 0);
                } else {
                    $.blockUI('<div align="center" style="font-size: 12px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+json.message+'</b><br><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {
                        width: '330px',
                        height: '200px',
                        cursor: 'default'
                    });
                }
                $('#submit_comment').html('<input type="button" value="确定" tabindex="7" class="fanbutton" name="button1" onclick="insert_comment()"/>');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var errorinfo = {
                    errorMsg: errorThrown.toString(),
                    xhrStatus: jqXHR.status,
                    textStatus: textStatus,
                    responseText: jqXHR.responseText
                }
                var msg = $('<pre></pre>')
                msg.text(JSON.stringify(errorinfo, null, "\n"));
                msg.prepend('系统异常，请将以下内容截图或复制后通过站短等方式发送给管理员:<br/>')
                $.blockUI(msg, {'text-align': 'left', 'width': 'auto'})

            }
        });
    }
}

//末章下一页的霸王票显示
if ($("#lastticketList").length>0) {
    getLastTicketList();
}
if ($("#lastnutritionList").length>0) {
    getLastNutritionRank();
}

function getLastTicketList() {
    /**
     * 修改此处的版本号,请同步修改
     * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
     * 请将这些版本号都修改成一致的
     */
    var host = httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519';
    $('#lastticketList').html('<div style="margin-left:90px;margin-top:100px"><img src="//static.jjwxc.net/images/loading.gif"></div>');
    var novelid=getURLParam('novelid');
    $.ajax({
        url: host,
        data: {novelid: novelid, action: 'lastchapter', type: 'new'},
        dataType: 'jsonp',
        type: "get",
        cache: true, //开始缓存 不然会出现_=随机数
        jsonp: 'jsonpcallback',
        jsonpCallback: 'ticketlastchapter', //值随便设置
        success: function(json) {
            $('#lastticketList').html(json.html);
            getKingNNutritionLv(novelid);
        }
    })

}

function getKingNNutritionLv(novelid, format_func) {
    var get_data = typeof format_func === 'function';
    $.ajax({
        url: '//'+location.host+'/app.jjwxc/Pc/KingTickets/getKingNNutritionLv',
        data: {novelid: novelid, get_data: get_data ? 1 : 0},
        dataType: 'json',
        type: "get",
        success: function(json) {
            if (json.code =='200') {
                if (get_data) {
                    format_func(json.data);
                } else{
                    $('#lastticketList').append(json.data.king_html);
                    $('#lastnutritionList').append(json.data.nutrition_html);
                }
            }
        }
    })
}

function getLastNutritionRank() {
    var readerid = getCookie("readerid");
    $.ajax({
        url: '//'+location.host+'/app.jjwxc/Pc/NutritionSort/getNovelTop10Html',
        data: {novelid: getURLParam('novelid'), readerid: readerid},
        dataType: 'json',
        type: "get",
        success: function(json) {
            $('#lastnutritionList').html(json.data.html + $('#lastnutritionList').html());
        }
    })

}

//onebook 加载霸王票排行
function onebook_ticketsort() {
    /**
     * 修改此处的版本号,请同步修改
     * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
     * 请将这些版本号都修改成一致的
     */
    var host = httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519';
    $.ajax({
        url: host,
        data: {novelid: getURLParam('novelid'), action: 'ticketsort', type: 0},
        dataType: 'jsonp',
        type: "get",
        cache: true, //开始缓存 不然会出现_=随机数
        jsonp: 'jsonpcallback',
        jsonpCallback: 'kingticketsortAll', //值随便设置
        success: function(data) {
            if (data.ranking=='暂无排名'&&parseInt(data.gap)==0) {
                var tickethtml = '当前霸王票全站排行<span style="font-size:2em;font-weight:bold;" id="allrank">暂无</span>，投<span style="font-size:2em;font-weight:bold;" id="diffrank">1</span>颗地雷就有名次啦';
            } else {
                var tickethtml = '当前霸王票全站排行<span style="font-size:2em;font-weight:bold;" id="allrank">'+data.ranking+'</span>，还差<span style="font-size:2em;font-weight:bold;" id="diffrank">'+data.gap+'</span>颗地雷就可以前进一名';
            }
            $("#ticketsort").html(tickethtml);
        }
    })
}

//霸王票显示
function onebook_ticketrankall() {
    /**
     * 修改此处的版本号,请同步修改
     * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
     * 请将这些版本号都修改成一致的
     */
    var host = httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519';
    $.ajax({
        url: host,
        data: {novelid: getURLParam('novelid'), page: 1},
        dataType: 'jsonp',
        type: "get",
        cache: true, //开始缓存 不然会出现_=随机数
        jsonp: 'jsonpcallback',
        jsonpCallback: 'ticketrankall', //值随便设置
        success: function(json) {
            if (json.total>0) {
                var html = '<ul id="addlist">';
                $.each(json.tickets, function(index, v) {
                    if (index>6) {
                        return false;
                    }
                    html += '<li><a target="_blank" href=\"//www.jjwxc.net/onereader.php?readerid='+v['readerid']+'\">'+v['consumers']+'</a>扔了一颗'+v['desc']+'</li>';
                })
                $('#tickets_box').html(html);
            }
        }
    })
}

//最后章节下一章 霸王票总排行加载
function novelover_ticketSort() {
    /**
     * 修改此处的版本号,请同步修改
     * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
     * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
     * 请将这些版本号都修改成一致的
     */
    var host = httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519';
    $.ajax({
        url: host,
        data: {novelid: getURLParam('novelid'), action: 'ticketsort', type: 1},
        dataType: 'jsonp',
        type: "get",
        cache: true, //开始缓存 不然会出现_=随机数
        jsonp: 'jsonpcallback',
        jsonpCallback: 'kingticketsortAll', //值随便设置
        success: function(data) {
            if (data.lastid != 0) {
                var lasthtml = '上一名:<a href="//www.jjwxc.net/onebook.php?novelid='+data.lastid+'">《'+data.last_novel_name+'》</a><a href="//www.jjwxc.net/oneauthor.php?authorid='+data.last_authorid+'">'+data.last_author_name+'</a>';
            } else {
                var lasthtml = '';
            }

            if (data.nextid != 0) {
                var nexthtml = '下一名:<a href="//www.jjwxc.net/onebook.php?novelid='+data.nextid+'">《'+data.next_novel_name+'》</a><a href="//www.jjwxc.net/oneauthor.php?authorid='+data.next_authorid+'">'+data.next_author_name+'</a>';
            } else {
                var nexthtml = '';
            }
            if (data.ranking=='暂无排名'&&parseInt(data.gap)==0) {
                var tickethtml = '当前霸王票全站排行<span style="font-size:2em;font-weight:bold;">暂无</span>，投<span style="font-size:2em;font-weight:bold;">1</span>颗地雷就有名次啦';
                var lasthtml = '';
                var nexthtml = '';
            } else {
                var tickethtml = '当前霸王票全站排行<span style="font-size:2em;font-weight:bold;">'+data.ranking+'</span>，还差                <span style="font-size:2em;font-weight:bold;">'+data.gap+'</span>颗地雷就可以前进一名';
            }
            $("#lasttd").html(lasthtml);
            $("#nexttd").html(nexthtml);
            $("#tickettd").html(tickethtml);
        }
    })
}

// --- 加载评论提交行为
//评论发表函数
function comment_submit() {
    var r = 0;
    if ($("#code_random").length>0) {
        r = $("#code_random").val();
    }
    var subObj = $("#publish_comment");
    $('#submit_comment').html('<img src="//static.jjwxc.net/images/loading.gif">');
    var novelid = subObj.find("#novelid").val();
    var chapterid = subObj.find("#chapterid").val();
    var novelname = subObj.find("#novelname").val();
    var commentauthor = subObj.find("#commentauthor").val().replace(/^\s+|\s+$/g, '');
    var commentmark = subObj.find("#commentmark").val();
    var commentsubject = subObj.find("#commentsubject").val();
    var commentbody = subObj.find("#commentbody").val().replace(/^\s+|\s+$/g, '');
//    var comment_novel = subObj.find('#comment_novel').val();
    var comment_auth_num = subObj.find('#comment_auth_num').val();
    var emoji_id = subObj.find('#commentbody_crack_sugar_id').val();
    if (subObj.find('#comment_auth_num').size()==0) {
        $('#publish_comment').append('<input type="hidden" name="comment_auth_num" id="comment_auth_num" value="" />');
    } else {
        $('#comment_auth_num').val('');
    }


    if (commentbody=='') {
        alert('评论内容不能为空');
        $('#submit_comment').html('<input type="button" value="确定" tabindex="7" class="fanbutton" name="button1" onclick="insert_comment()"/>');
        return false;
    }
    if($("#shumeideviceId").length >0){
        var shumeideviceId = $("#shumeideviceId").val();
     }else{
        var shumeideviceId = "";
    }
    $.post('/backend/review_reply_ajax.php?type=comment', {//D:\jjwxc\jjwxc.net\www.jjwxc\backend\review_reply_ajax.php
        novelid: novelid,
        chapterid: chapterid,
        commentauthor: commentauthor,
        commentmark: commentmark,
        commentsubject: commentsubject,
        commentbody: commentbody,
        comment_auth_num: comment_auth_num,
        shumeideviceId: shumeideviceId,
        emoji_id: emoji_id,
        r: r
    }, function(data) {
        getEmojiFromContentBody(commentbody, 'commentbody');
        if (data.code=='1005') {
            show_login();
            return false;
        } else if (data.code==200) {
            if (data.nextid>chapterid) {
                $('#commentbody_message').html('<img src="//static.jjwxc.net/images/ok.gif" style="margin-bottom:-2px"> 评论/打分成功，显示会有延迟，感谢您的支持！您还可以选择进入下一章。');
                window.location = data.url+'?novelid='+data.novelid+'&chapterid='+data.nextid;
            } else {
                window.location.href = window.location.href;
            }
            return false;
        } else if (data.code==10) {
            var randid = Math.random();
            $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>请输入验证码再提交</b><br><br>验证码 <input name="auth_num_login" class="input" id="auth_num_login" size="10" maxlength="8" />&nbsp; <img id="img_auth" rel="2" src=\"//my.jjwxc.net/include/checkImage.php?action=pay&r='+randid+'\"> <span id="img_auth_reload" style="cursor:pointer; color: blue; text-decoration: underline;" onClick="imgautoreload()">看不清</span><br><br><span id="Ekey_message" style="color: red"></span><br><br><input type="button" value="提 交" onClick="comment_auth_num()"/>&nbsp;&nbsp;&nbsp;</div>', {
                width: '350px',
                height: '130px',
                cursor: 'default'
            });
            if ($("#code_random").length>0) {
                $("#code_random").val(randid);
            } else {
                $("#publish_comment").append("<input type='hidden' value='"+randid+"' name='random' id='code_random'>");
            }
            $('#submit_comment').html('<input type="button" value="确定" tabindex="7" class="fanbutton" name="button1" onclick="insert_comment()"/>');
        } else {
            $.blockUI('<div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><div align="center"><b>'+data.message+'</b><br><br><br><br><div align="center"><input type="button" id="yesbuy" value="确　定" onClick="$.unblockUI()"/></div>', {
                width: '300px',
                height: '130px',
                cursor: 'default'
            });
            // alert(data.message);
            $('#submit_comment').html('<input type="button" value="确定" tabindex="7" class="fanbutton" name="button1" onclick="insert_comment()"/>');
        }
    }, 'json');
    return false;
}







//滚动插件
(function($) {
//页面加载完后 加载霸王票总排行
    var url = window.location.href;
    if (((window.location.href).indexOf("onebook.php")>=0||(window.location.href).indexOf("onebook_vip.php")>=0)&&$("#ticketsort").length>0) {
        if (location.href.indexOf("chapterid=") < 0) {
            onebook_ticketsort();
        } else {
            var loadKingSort = true;
            $(window).scroll(
                throttle(function() {
                    //目录页标题下的菜单和阅读页 作话展示区域需要加载不看本文数据了
                    if (loadKingSort === true) {
                        if (isEleShowInWindow($('#ticketsort'))) {
                            loadKingSort = false;
                            onebook_ticketsort();
                        }
                    }
                }, 100)
            );
        }

    } else if (url.indexOf("noveloverlist.php")>=0&&$("#tickettd").length>0) {
        novelover_ticketSort();
    }
    if (((window.location.href).indexOf("onebook.php")>=0||(window.location.href).indexOf("onebook_vip.php")>=0||(window.location.href).indexOf("noveloverlist.php")>=0)&&$("#tickets_box").length>0) {
        if (location.href.indexOf("chapterid=") < 0) {
            onebook_ticketrankall();
        } else {
            var loadKingSortRank = true;
            $(window).scroll(
                throttle(function() {
                    //目录页标题下的菜单和阅读页 作话展示区域需要加载不看本文数据了
                    if (loadKingSortRank === true) {
                        if (isEleShowInWindow($('#tickets_box'))) {
                            loadKingSortRank = false;
                            onebook_ticketrankall();
                        }
                    }
                }, 100)
            );
        }
    }

    $.fn.extend({
        Scroll: function(opt, callback) {
//参数初始化
            if (!opt)
                var opt = {};
            var _this = this.eq(0).find("ul:first");
            var lineH = _this.find("li:first").height(), //获取行高
                    line = opt.line ? parseInt(opt.line, 10) : parseInt(this.height()/lineH, 10), //每次滚动的行数，默认为一屏，即父容器高度
                    speed = opt.speed ? parseInt(opt.speed, 10) : 1000, //卷动速度，数值越大，速度越慢（毫秒）
                    timer = opt.timer ? parseInt(opt.timer, 10) : 5000; //滚动的时间间隔（毫秒）
            if (line==0)
                line = 1;
            var upHeight = 0-line*lineH;
            //滚动函数
            scrollUp = function() {
                _this.animate({
                    marginTop: upHeight
                }, speed, function() {
                    for (i = 1; i<=line; i++) {
                        _this.find("li:first").appendTo(_this);
                    }
                    _this.css({
                        marginTop: 0
                    });
                });
            }
//鼠标事件绑定
            _this.hover(function() {
                clearInterval(timerID);
            }, function() {
                timerID = setInterval("scrollUp()", timer);
            }).mouseout();
        }
    })
})(jQuery);
function showpage(novelid) {
    $.ajax({
        /**
         * 修改此处的版本号,请同步修改
         * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
         * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
         * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
         * 请将这些版本号都修改成一致的
         */
        url: httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519', //采用s8-static.jjwxc.net缓存管理
        data: {novelid: getURLParam('novelid'), page: 1},
        dataType: 'jsonp',
        type: "get",
        cache: true, //开始缓存 不然会出现_=随机数
        jsonp: 'jsonpcallback',
        jsonpCallback: 'ticketrankall', //值随便设置
        success: function(json) {
            var html = '<h4 style="border-bottom:2px dashed #B8DAD6; text-align:left; line-height:22px; height:24px; color:#426E69;font-siaze:13px; margin:0 0 8px 0;">霸王票萌物<span onclick="$.unblockUI();"><img src = "//s9-static.jjwxc.net/images/x_alt_32x32.png" width="15" height="15" style="float:right; margin-top:3px;" /></span></h4><ul id="moreticket" style="text-align:left; overflow:hidden;">';
            $.each(json.tickets, function(index, v) {
                html += '<li style="float:left; width:100%; height:20px; line-height:20px; border-bottom:1px dashed #ccc; overflow:hidden;"><a target="_blank" href=\"//www.jjwxc.net/onereader.php?readerid='+v['readerid']+'\">'+v['consumers']+'</a>扔了一颗'+v['desc']+'</li>';
            })
            html += json.pagelist+'</ul>';
            $.blockUI(html, {border: '2px solid #aaa', background: '#DDF0EE', width: '200px', left: '50%', top: '30%', cursor: 'text'});
        }
    })
}

function openpage(url) {
    var a = url.split('=');
    var page = parseInt(a.pop());
    $.ajax({
        /**
         * 修改此处的版本号,请同步修改
         * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
         * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
         * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
         * 请将这些版本号都修改成一致的
         */
        url: httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519', //采用s8-static.jjwxc.net缓存管理
        data: {novelid: getURLParam('novelid'), page: page},
        dataType: 'jsonp',
        type: "get",
        cache: true, //开始缓存 不然会出现_=随机数
        jsonp: 'jsonpcallback',
        jsonpCallback: 'ticketrankall', //值随便设置
        success: function(json) {
            var html = '';
            $.each(json.tickets, function(index, v) {
                html += '<li style="float:left; width:100%; height:20px; line-height:20px; border-bottom:1px dashed #ccc; overflow:hidden;"><a target="_blank" href=\"//www.jjwxc.net/onereader.php?readerid='+v['readerid']+'\">'+v['consumers']+'</a>扔了一颗'+v['desc']+'</li>';
            })
            html += json.pagelist;
            $("#moreticket").html(html)
        }
    })
}
function showTicketCount(ob) {
    $('#ticketCount').remove();
    var leftPx = $(ob).offset().left-20+"px";
    var topPx = $(ob).offset().top-2+"px";
    var count = $(ob).attr('rel');
    var html = "<div id='ticketCount' style='position:absolute;left:"+leftPx+";top:"+topPx+";z-index: 1002; height: 15px; min-width: 30px;text-align: center; color: rgb(0, 0, 0); background-color: rgb(255, 255, 247); border: 1px solid rgb(255, 204, 0); '><p style='padding:1px'>"+count+"</p></div>";
    $('body').append(html)
}
function closeTicketCount() {
    $('#ticketCount').remove();
}
//随机数函数
function GetRandomNum(Min, Max) {
    var Range = Max-Min;
    var Rand = Math.random();
    return(Min+Math.round(Rand*Range));
}

var ticket_comment_list = [];
var placeholderArr = [];
var replyarr = [];
var nutrition_cmt_list = [];
function getPlaceholderConfig() {
    $.ajax({
        url: "//www.jjwxc.net/backend/comment_agree_ajax.php?action=getPlaceholder",
        type: "GET",
        async: true,
        data: {},
        dataType: "jsonp",
        success: function(data) {
            if(data.status == 200) {
                placeholderArr = data.data[1];
                nutrition_cmt_list = data.data[2];
                ticket_comment_list = data.data[3];
                replyarr = data.data[4];
                if($('#commentmark').length > 0) {
                    isMinusPosint('#commentmark');
                    // 插入表情包
                    getEmojiPart('commentbody');
                    getCrackSugarPart('commentbody');
                }
            }
        },
        error:function(e){
            // 打印数据
            console.dir(e)
        }
    });
}

$(function() {
    // 设置内置提示
    getPlaceholderConfig();
//读者霸王票排行榜
    if ($('#ticketsrank_box').size()>0) {
        $.ajax({
            /**
             * 修改此处的版本号,请同步修改
             * pc站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
             * wap站：Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY与Net_Web_KingticketCacheClear::KINGTICKET_CACHE_CLEAR_KEY_OLD
             * 以及wap.main.js与author_kingtickets.js中有关getKingTickets.php
             * 请将这些版本号都修改成一致的
             */
            url: httpProtocol + '://s8-static.jjwxc.net/getKingTickets.php?ver=20170519',
            data: {novelid: getURLParam('novelid'), action: 'readerrank'},
            dataType: 'jsonp',
            type: "get",
            cache: true, //开始缓存 不然会出现_=随机数
            jsonp: 'jsonpcallback',
            jsonpCallback: 'kingticketsort', //值随便设置
            success: function(json) {
                if (json.total>0) {
                    var html;
                    if ($('#ticketsrank_box').data('type')=='children') {
                        html = '';
                        $.each(json.tickets, function(index, v) {
                            if (index>2) {
                                return false
                            }
                            html += '<span>'+v['rank']+' '+v['consumers']+'</span>';
                        })

                    } else {
                        html = '<table width="170">';
                        $.each(json.tickets, function(index, v) {
                            if (index>9) {
                                return false;
                            }
                            if (v['rank']<=3) {
                                v['rank'] = "<span style='color:red;font-weight:bold'>"+v['rank']+"</span>";
                            }
                            var readerStr = '';
                            if (typeof v['unregister'] !== 'undefined' && parseInt(v['unregister']) > 0) {
                                readerStr = '<span style="color:#707070;">'+v['consumers']+'</span>';
                            } else {
                                readerStr = '<a target="_blank" href=\"//www.jjwxc.net/onereader.php?readerid='+v['readerid']+'\">'+v['consumers']+'</a>';
                            }
                            html += '<tr><td style="text-align:right;">'+v['rank']+'.</td><td>'+readerStr+'</td><td style="text-align:right;cursor: pointer" rel="'+v['score']+'" onmouseover="showTicketCount(this)" onmouseout="closeTicketCount()">'+v['name']+'</td></tr>';
                        })
                        html += '</table><div style="margin-top:8px;display:block;cursor: pointer;clear:both"><a style="margin-left:15px;color:#4C5A5A" href="//www.jjwxc.net/reader_kingticket.php?novelid='+getURLParam('novelid')+'#rank" target="_blank">[更多排行]</a><a style="margin-left:40px;color:#4C5A5A;cursor: pointer" href="//my.jjwxc.net/reader_kingticket.php?novelid='+getURLParam('novelid')+'#info" target="_blank">[等级说明]</a></div>';
                    }
                    $('#ticketsrank_box').html(html);
                } else {
                    $('#ticketsrank_box').html('等你来支持');

                }
            }
        });
    }


//生成随机的霸王票评论
    function ticket_comment(i) {
        x = GetRandomNum(0, ticket_comment_list.length-1);
        return ticket_comment_list[x].replace('s%', i);
    }

//投霸王票相关事件
    if ($("input[name='KingTickets_radio']").length>0) {
        $("input[name='KingTickets_radio']").change(function() {
            var kingcomment = $(this).parents().parents().prev().attr("rel");
            var ticketvalue = $(this).val();
            ticketvalue = parseInt(ticketvalue);
            var ticketname = '';
            if (ticketvalue===0) {
                ticketname = '地雷';
            } else if (ticketvalue===1) {
                ticketname = '手榴弹';
            } else if (ticketvalue===2) {
                ticketname = '火箭炮';
            } else if (ticketvalue===3) {
                ticketname = '潜水炸弹';
            } else if (ticketvalue===4) {
                ticketname = '深水鱼雷';
            }
            $("#commentmark").val(5);
            var html = ticket_comment(ticketname);
            if ($("#commentbody").length>0&&kingcomment!=="nocomment") {
                var preHtml = $("#commentbody").val();
                if (preHtml.length>0) {
                    html = preHtml+'||'+html;
                }
                if ($("#commentbody").val().length<=10) {
                    $("#commentbody").val(html);
                }
            }
            $("#ticket_comment").val(html);
        });
    }
    //获取营养液评论
    function nutrition_comment() {
        x = GetRandomNum(0, nutrition_cmt_list.length - 1);
        return nutrition_cmt_list[x];
    }

    if ($("input[name='nutrition_radio']").length>0) {
        $("input[name='nutrition_radio']").change(function() {
            html = nutrition_comment();
            if ($("#commentbody").length>0 && $("#commentbody").val().length <= 10) {
                var preHtml = $("#commentbody").val();
                if (preHtml.length>0) {
                    html = preHtml + '||' + html;
                }
                $("#commentbody").val(html);
            }
        });
    }
// 社交网站分享
    $('.social_share').click(function() {
        socialShare(this);
    }).css('cursor', 'pointer')





    //目录页投霸王票
    $('#sendKingTickets_button').bind('click', function() {
        var sendKingTicketstype = $("#sendKingTickets2").attr("rel");
        if (sendKingTicketstype=="nocomment") {
            ticketsubmit();
        } else {
            ticketsubmit(true);
        }

    })

    //发评及霸王票+发评
    $('#publish_comment').submit(function() {
        if ($("#ticketsort").length>0||$("#tickettd").length>0) {
            var ticketval = $("input:checked[name='KingTickets_radio']").val();
            var nutrition = $("input:checked[name='nutrition_radio']").length;
            if (nutrition > 0) {
                if (ticketval !== undefined) {
                    //先判断是否有支付密码，
                    checkpaypwdV2(function() {
                        $.blockUI('<div><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>请输入您设定的支付密码（格式为6位纯数字)</b><br><br><input name="paypwd" type="password" id="paypwd" maxlength="6" /><br/><br/><input type="button" onclick="commentWithKingNNutrition()" value="确 定" />&nbsp;&nbsp;<input type="button" value="取消" onclick="$.unblockUI();"/><br><br><center><a href="//help.jjwxc.net/user/password/2">[忘记支付密码?]</a></center></div>'
                                , {
                                    width: '330px',
                                    height: '150px',
                                    cursor: 'default'
                                });
                    }, commentWithKingNNutrition);
                } else {
                    commentWithKingNNutrition()
                }
            } else if (ticketval !== undefined) {
                ticketsubmit();
            } else {
                comment_submit();
            }
        } else {
            comment_submit();
        }
        return false;
    });

    $('#report_action').bind('mousemove', function() {
        if ($('#report_box').css('display')=='none') {
            var xOffset = 0; //定义x的偏移量
            var yOffset = 13; //定义y的偏移量
            var x = getAbsoluteLeft($(this).attr('id'));
            var y = getAbsoluteTop($(this).attr('id'));
            var left = x+xOffset;
            var top = y+yOffset;
            $('#report_box').css({
                left: left+'px',
                top: top+'px',
                width:'100px'
            }).show();
        }
    })


    $('#report_action').bind('mouseleave', function() {
        $('#report_box').hide()
    })
    $('#report_box').bind('mouseover', function() {
        $('#report_box').show()
    })
    $('#report_box').bind('mouseleave', function() {
        $('#report_box').hide()
    })

    $('#sendKingTickets').bind('mousemove', function() {
        if ($('#sendKingTickets_box').css('display')=='none') {
            var xOffset = 0; //定义x的偏移量
            var yOffset = 13; //定义y的偏移量
            var x = getAbsoluteLeft($(this).attr('id'));
            var y = getAbsoluteTop($(this).attr('id'));
            var left = x+xOffset;
            var top = y+yOffset;
            $('#sendKingTickets_box').css({
                left: left+'px',
                top: top+'px'
            }).show();
        }
    })

    $('#sendKingTickets2').bind('mousemove', function() {
        if ($('#sendKingTickets_box').css('display')=='none') {
            var xOffset = -50; //定义x的偏移量
            var yOffset = 13; //定义y的偏移量
            var x = getAbsoluteLeft($(this).attr('id'));
            var y = getAbsoluteTop($(this).attr('id'));
            var left = x+xOffset;
            var top = y+yOffset;
            $('#sendKingTickets_box').css({
                left: left+'px',
                top: top+'px'
            }).show();
        }
    })

    $('#sendKingTickets').bind('mouseleave', function() {
        $('#sendKingTickets_box').hide()
    })
    $('#sendKingTickets2').bind('mouseleave', function() {
        $('#sendKingTickets_box').hide()
    })
    $('#sendKingTickets_box').bind('mouseover', function() {
        $('#sendKingTickets_box').show()
    })
    $('#sendKingTickets_box').bind('mouseleave', function() {
        $('#sendKingTickets_box').hide()
    })



    $('#invite').bind('click', function() {

        var id = $(this).attr('id');
        var novelId = getURLParam('novelid');
        var chapterId = getURLParam('chapterid');
        if (chapterId=='') {
            chapterId = 1;
        }
        if (getCookie('readerid') != null) {
            $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
            $.getJSON(httpProtocol + '://my.jjwxc.net/backend/import_msn.php?action=copy_invite&invite_type=1&novelid='+novelId+'&chapterid='+chapterId+'&jsonp=?', function(json) {
                if (json.status==200&&json.inviteId>0) {
                    var InviteUrl = 'https://www.jjwxc.net/backend/invite.php?inviteId='+json.inviteId;
                    inviteShare(InviteUrl);
                } else {
                    $.blockUI('<br><div align="center"><b>对不起，请重新操作</b><br><br><br><br><div align="center"><input type="button" value="确　定" onClick="$.unblockUI()"/></div>', {width: '300px', height: '100px', cursor: 'default'});
                }
            });
        } else {
            //不登录显示不给奖励的链接
            var InviteUrl = httpProtocol + '://www.jjwxc.net/onebook.php?novelid='+novelId;
            inviteShare(InviteUrl);
        }
    });



    //加载 TXT下载 行为
    $('#download_text').bind('click', function() {
        if (is_login()) {
            var point = 0;
            var novelid = $('#download_text').attr('rel');
            $.getJSON(httpProtocol + '://my.jjwxc.net/backend/download_text.php?jsonp=?', {
                action: 'balance',
                novelid: novelid,
                r: Math.random()
            }, function(json) {
                if (json.status==200) {
                    point = json.point;
                    rows = json.rows;
                    var message = '<div style="font-size:14px;">下载当前作品所需花费为1月石。<br />重复下载不会扣除月石。<br/>您的月石为'+point+'<br /><a target="_blank" href="//help.jjwxc.net/user/article/157" style="color:blue;text-decoration:underline;">TXT下载说明</a><br><a target="_blank" href="//help.jjwxc.net/user/article/156" style="color:red;text-decoration:underline;">如何获取月石？</a><br><br><br><input type="button" id="addsubmit" ';
                    if (point==0&&rows=='0') {
                        message += ' disabled="disabled" ';
                    }
                    message += 'value="下载"/>&nbsp;&nbsp;&nbsp;<input type="button" value="取消" onclick="javaScript:$.unblockUI();"/></div>';
                    $.blockUI(message, {
                        cursor: 'default'
                    });
                    $('#addsubmit').click(function() {
                        $.unblockUI();
                        var novelid = $('#download_text').attr('rel');
                        $.getJSON(httpProtocol + '://my.jjwxc.net/backend/download_text.php?jsonp=?', {
                            action: 'charge',
                            novelid: novelid,
                            r: Math.random()
                        }, function(json) {
                            if (json.status==200) {
                                $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
                                $.getJSON(httpProtocol + '://my.jjwxc.net/backend/download_text.php?jsonp=?', {
                                    action: 'export',
                                    novelid: novelid,
                                    r: Math.random()
                                }, function(json) {
                                    if (json.status==1) {
                                        location.href = json.path
                                        $.unblockUI();
                                    } else {
                                        $.blockUI('<br><div align="center"><b>'+json.message+'</b><br><br><br><br><div align="center"><input type="button" id="yesbuy" value="确　定" onClick="$.unblockUI()"/></div>', {
                                            width: '300px',
                                            height: '100px',
                                            cursor: 'default'
                                        });
                                    }
                                })
                            } else {
                                $.blockUI('<br><div align="center"><b>'+json.message+'</b><br><br><br><br><div align="center"><input type="button" id="yesbuy" value="确　定" onClick="$.unblockUI()"/></div>', {
                                    width: '300px',
                                    height: '100px',
                                    cursor: 'default'
                                });
                            }
                        })
                    })
                } else {
                    if (typeof (json.message)=="undefined") {
                        var msg = "位置错误，请稍候重试！";
                    } else {
                        var msg = json.message
                    }
                    $.blockUI('<br><div align="center"><b>'+msg+'</b><br><br><br><br><div align="center"><input type="button" id="yesbuy" value="确　定" onClick="$.unblockUI()"/></div>', {
                        width: '300px',
                        height: '100px',
                        cursor: 'default'
                    });
                }
            })
        }
    })
    if ($("#copyrightlist").length>0) {
        $.ajax({
            type: "GET",
            url: httpProtocol + '://www.jjwxc.net/adsmanage.php',
            data: {action: 'getChannelList'},
            dataType: 'jsonp',
            jsonp: 'jsonpCallback',
            jsonpCallback: 'copyrightlist_190411', //值随便设置
            cache: true,
            success: function(data) {
                $("#copyrightlist").html(data.imgpath);
            }
        })
    }
})


// --- 作品推荐功能
var unBlock = function() {
    $('#copy_invite_click').remove();
    $.unblockUI();
}

var import_msn = function() {
    $('#copy_invite_click').remove();
    var html = '';
    html += '<div style="font-size: 12px;">';
    html += '<div style="padding: 0 10px 0 10px;;background: none repeat scroll 0 0 #53B61B; height: 30px; border-bottom: 1px solid #565656;"><div style="float:right; padding: 5px;"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI();"/></div>';
    html += '<div align="left" style="font-size: 14px; color: #FFFFFF; ; font-weight: bold; line-height: 30px;">推荐给朋友</div></div>';
    html += '<div align="left" style="height: 250px; padding: 10px; line-height: 30px;">'
    html += '<div style="float: left; line-height: 48px;"><b>从我的MSN导入朋友名单，选择待推荐人并发送推荐邮件</b></div>';
    html += '<div style="float: left;"><img alt="导入MSN朋友名单" src="//static.jjwxc.net/images/msnlg.gif"></div>';
    html += '<div style="clear: both;">';
    html += 'MSN账号：<input id="msn_name" type="text" style="border: 1px solid black; width: 150px; height: 20px;" value="" name="account" size="33"><br>';
    html += 'MSN密码：<input id="msn_pwd" type="password" style="border: 1px solid black; width: 150px; height: 20px;" name="passwd" size="20"><br>';
    html += '<div style="height: 30px;"><div class="import_submit"><input type="button" value="　导　入　" onclick="import_msn_start()" /></div>';
    html += '<div class="import_loading" style="display: none; color: red;"><img alt="导入中" src="//static.jjwxc.net/images/loading_2010.gif"> 导入名单需要一会时间，请耐心等待</div></div>';
    html += '<div class="import_message" style="color: red;"></div>';
    html += '晋江不会存储你的MSN密码，请放心使用。'
    html += '</div>';
    html += '</div>';
    html += '</div>';
    $.blockUI(html, {
        left: ($(window).width()-300)/2+'px',
        top: ($(window).height()-200)/2+'px',
        width: '500px',
        height: '250px',
        cursor: 'default',
        padding: '0',
        border: '1px solid #565656'
    });
}

var import_msn_start = function() {
    var msn_name = $('#msn_name').val();
    var msn_pwd = $('#msn_pwd').val();
    if (msn_name.length==0||msn_pwd.length==0) {
        $('.import_message').html('请输入MSN账号和密码再导入').show();
    } else {
        $('.import_message').html('').hide();
        $('.import_submit').hide();
        $('.import_loading').show();
        $('#msn_name').attr('disabled', true);
        $('#msn_pwd').attr('disabled', true);
        $.getJSON(httpProtocol + '://my.jjwxc.net/backend/import_msn.php?action=get&msn_name='+msn_name+'&msn_pwd='+msn_pwd+'&jsonp=?', function(json) {
            if (json.status==200) {
                var html = '';
                html += '<div style="font-size: 12px;">';
                html += '<div style="padding: 0 10px 0 10px;;background: none repeat scroll 0 0 #53B61B; height: 30px; border-bottom: 1px solid #565656;"><div style="float:right; padding: 5px;"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI();"/></div>';
                html += '<div align="left" style="font-size: 14px; color: #FFFFFF; ; font-weight: bold; line-height: 30px;">推荐给朋友</div></div>';
                html += '<div align="left" style="height: 250px; padding: 10px;">'
                html += '<div style="height: 30px; line-height: 30px;">以下是该通讯录里的其他联系人，请选择推荐对象</div>';
                html += '<div style="border: 1px solid #808080; display: table;">';
                html += '<div style="background: none repeat scroll 0 0 #FFFFFF; height: 200px; margin-bottom: 10px; overflow-y: scroll; padding: 2px 1px 2px 2px; border-left: 1px solid #000000; border-top: 1px solid #000000; color: #333333;">';
                html += '<div style="background: none repeat scroll 0 0 #EDEDED; border-bottom: 1px solid #C0C0C0; padding-bottom: 4px;"><input type="checkbox" onclick="selallemail()" id="allClick">全选</div>';
                $.each(json.body, function(i, v) {
                    html += '<div style="'+v['style']+'"><p style="float: left; width: 220px;"><input type="checkbox" value="'+v['email']+'" name="email"> '+v['user']+'</p><p style="float: left;">&lt;'+v['email']+'&gt;</p><p style="clear: both;"></p></div>';
                })
                html += '</div>';
                html += '</div>';
                html += '<div style="height: 35px; line-height: 35px;">您的姓名：<input id="send_name" type="text" style="border: 1px solid black; width: 100px; height: 20px;" value="" name="send_name" size="33"></div>';
                html += '<div style="clear: both; height: 30px; line-height: 30px; text-align: center;"><span class="send_invite_submit"><input class="send_invite" type="button" value="发送推荐" onclick="send_invite()"/></span><span class="send_invite_loading" style="display: none;"><img alt="发送中" src="//static.jjwxc.net/images/loading_2010.gif"></span>&nbsp;</div>';
                html += '<div style="height: 30px; line-height: 30px; display: none; color: red; text-align: center;" class="send_message">请选择联系人后再发送</div>';
                html += '</div>';
                html += '</div>';
                $.blockUI(html, {
                    left: ($(window).width()-300)/2+'px',
                    top: ($(window).height()-200)/2+'px',
                    width: '500px',
                    height: '400px',
                    cursor: 'default',
                    padding: '0',
                    border: '1px solid #565656'
                });
            } else {
                $('.import_message').html(json.message).show();
                $('.import_submit').show();
                $('.import_loading').hide();
                $('#msn_name').attr('disabled', false);
                $('#msn_pwd').attr('disabled', false);
            }
        })
    }

}

var selallemail = function() {
    if ($('#allClick').attr('checked')=='checked'||$(this).attr('checked')=='checked') {
        $('input[name=email]').attr('checked', true);
    } else {
        $('input[name=email]').attr('checked', false);
    }

}

var send_invite = function() {
    var send_email = '';
    var send_name = $('#send_name').val();
    var novelId = getURLParam('novelid');
    $('.send_invite_loading').show();
    $('.send_invite_submit').hide();
    $('.send_message').hide();
    $('input[name=email]').each(function() {
        if ($(this).attr('checked')=='checked'||$(this).attr('checked')=='checked') {
            if (send_email=='') {
                send_email += $(this).val();
            } else {
                send_email += '|'+$(this).val();
            }
        }
    })

    if (send_email=='') {
        $('.send_invite_submit').show();
        $('.send_message').html('请选择联系人后再发送').show();
        $('.send_invite_loading').hide();
    } else if (send_name=='') {
        $('.send_invite_submit').show();
        $('.send_message').html('请输入您的姓名再发送').show();
        $('.send_invite_loading').hide();
    } else {
        $.getJSON(httpProtocol + '://my.jjwxc.net/backend/import_msn.php?action=send_invite&novelid='+novelId+'&send_name='+send_name+'&send_email='+send_email+'&jsonp=?', function(json) {
            if (json.status==200) {
                var html = '';
                html += '<div style="font-size: 12px;">';
                html += '<div style="padding: 0 10px 0 10px;;background: none repeat scroll 0 0 #53B61B; height: 30px; border-bottom: 1px solid #565656;"><div style="float:right; padding: 5px;"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="unBlock();"/></div>';
                html += '<div align="left" style="font-size: 14px; color: #FFFFFF; ; font-weight: bold; line-height: 30px;">推荐给朋友</div></div>';
                html += '<div align="left" style="height: 250px; padding: 10px; line-height: 30px; font-size: 14px;">'
                html += '<div style="height: 150px; text-align: center; font-size: 12px; font-weight: bold;">'+json.message+'</div>';
                html += '<div style="text-align: center;"><input type="button" value="　确　定　" onclick="$.unblockUI()" /></div>';
                html += '</div>';
                html += '</div>';
                $.blockUI(html, {
                    left: ($(window).width()-300)/2+'px',
                    top: ($(window).height()-200)/2+'px',
                    width: '500px',
                    height: '250px',
                    cursor: 'default',
                    padding: '0',
                    border: '1px solid #565656'
                });
            } else {
                $('.send_invite_loading').hide();
                $('.send_invite_submit').show();
                $('.send_message').html(json.message).show();
            }
        })
    }
}

var copy_invite = function() {
    var novelId = getURLParam('novelid');
    var reg = /([0-9]{4})\-([0-9]{2})\-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/;
    var favorite_novel = $('#favorite_1').attr('rel');
    favorite_novel = favorite_novel.split('|');
    var novelName = favorite_novel[1]
    if (!reg.test(favorite_novel[4])) {
        var authorName = favorite_novel[4];
    } else {
        var authorName = favorite_novel[5];
    }

    $.getJSON(httpProtocol + '://my.jjwxc.net/backend/import_msn.php?action=copy_invite&novelid='+novelId+'&jsonp=?', function(json) {
        if (json.status==200&&json.inviteId>0) {
            $('#copy_invite_body').html('<div style="padding: 5px; font-size: 13px; border: 5px double #53B61B;">'+authorName+'的《'+novelName+'》很好看，推荐给你，不注册就能免费看，晋江文学城阅读链接：https://www.jjwxc.net/backend/invite.php?inviteId='+json.inviteId+'</div><br><b>请复制此邀请内容，用QQ、MSN等发送给你的朋友</b>');
        }
    });
}

var alert_invite = function(html) {
    $.blockUI(html, {
        left: ($(window).width()-300)/2+'px',
        top: ($(window).height()-200)/2+'px',
        width: '500px',
        height: '250px',
        cursor: 'default',
        padding: '0',
        border: '1px solid #565656'
    });
}


setTimeout(offset_show, 500);
//当用户点击某事件触发登入后，登入成功后自动触发点击的事件
$(function() {
    var clicktype = jjCookie.get('clicktype');
    jjCookie.set('clicktype', '');
    //收藏和书签
    if (clicktype=='favorite_2'||clicktype=='favorite_3') {
        $('#'+clicktype).click();
    } else if (clicktype=='favorite_1') {
        favorite_novel('favorite_1');
    } else if (clicktype=='yrt') {
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
//充值页面自动跳
                location.href = rel[1];
            }
        }
    }
    checkCommentUser();
});
//设置激活登入，登入后触发之前点的功能 主要是vip阅读，obj是点击的对象
function setClickType(obj) {
    var id = obj.attr('id');
    var res = id.split('_');
    var chapterid = res[1];
    var novelid = getURLParam('novelid');
    var key = 'vip|'+novelid+'|'+chapterid;
    jjCookie.set('clicktype', key); //为了点击登入成功后自动跳转
}

//当页面加载完成，去获取用户的昵称，判断是否设置，设置则显示昵称
$(document).ready(function() {
    if (typeof cookieNickName=='undefined') {
        $.post('/lib/deprelog.php', {'message': 'cookieNickName undefined'});
    }
    getReaderNickname(function(nickname) {
        $('#commentauthor').html(nickname);
        $('#reply_author').html(nickname);
    });

    (function() {
        var chapters = $(".chapterclick");
        if (chapters.length<=0) {
            return;
        }
        // 章节点击展示
        var clickNovelid = getURLParam('novelid');
        $.ajax({
            url: httpProtocol + '://s8-static.jjwxc.net/getnovelclick.php?novelid='+clickNovelid,
            dataType: 'jsonp',
            type: "get",
            cache: true, //开始缓存 不然会出现_=随机数
            jsonp: 'jsonpcallback',
            jsonpCallback: 'novelclick', //值随便设置
            success: function(data) {
                //获取需展示的地方  chapterid  clickchapterid   chapterclick
                var totleclick = 0;
                var chapternum = 0;
                for (var i = 0; i<chapters.length; i++) {
                    chapternum = data[chapters.eq(i).attr('clickchapterid')];
                    if (typeof (chapternum)=='undefined') {
                        chapternum = 0;
                    }
                    chapters.eq(i).text(chapternum);
                    totleclick = Number(chapternum)+Number(totleclick);
                }
                //章均点击
                var click = parseInt(totleclick/chapters.length);
                $("#totleclick").text(click);
            }
        });

    })()
});
//返回顶部功能
var current_url = document.location.href;
var exp = /onebook/;
if (exp.test(current_url)) {
    (function() {
        var $backToTopTxt = "返回顶部";
        var classText = "display: none;width: 18px;line-height: 1.2;padding: 5px 0;background-color: #000;color: #fff;font-size: 12px;text-align: center;position: fixed;_position: absolute;right: 10px;bottom: 100px;_bottom: auto;cursor: pointer;opacity: .6;filter: Alpha(opacity=60);"
        var $backToTopEle = $('<div style="'+classText+'"></div>').appendTo($("body"))
                .text($backToTopTxt).attr("title", $backToTopTxt).click(function() {
            $("html, body").animate({
                scrollTop: 0
            }, 120);
        }), $backToTopFun = function() {
            var st = $(document).scrollTop(), winh = $(window).height();
            (st>0) ? $backToTopEle.show() : $backToTopEle.hide();
            //IE6下的定位
            if (!window.XMLHttpRequest) {
                $backToTopEle.css("top", st+winh-166);
            }
        };
        $(window).bind("scroll", $backToTopFun);
        $(function() {
            $backToTopFun();
        });
    })();
}

/**
 * 营养液投放程序
 * @param {int} obj 文章ID
 * @returns {undefined}
 */
function getforest(obj) {
    if (is_login()) {
        var html = '';
        var readerid = getCookie('readerid');
        $.getJSON(httpProtocol + '://my.jjwxc.net/givenutrition_ajax.php?jsonp=?', {readerid: readerid, action: 'getnutritionnum'}, function(json) {
            var disableStr = parseInt(json.num) > 0 ? '' : 'disabled style="pointer-events:none;"';
            var pClick = parseInt(json.num) > 0 ? '' : 'onclick="$.blockUI(\'您当前没有营养液哦\');setTimeout(\'$.unblockUI()\',1000)"';
            html += '<div style="text-align:left" id="forestbox">';
            html += '<h3>您确定给本文灌溉营养液吗？</h3><br><br>';
            html += '<div '+pClick+' ><input id="onebottle" type="radio" value="1" name="sendBottleNum" '+disableStr+' onclick="$(\'#writeNum\').val(\'\')">灌溉一瓶营养液</div><br>';
            html += '<div '+pClick+' ><input id="somebottle" type="radio" value="2" name="sendBottleNum" '+disableStr+' onclick="$(\'#writeNum\').focus()">';
            html += '灌溉<input id="writeNum" type="text" name="bottlenum" value="" style="width:30px" onclick="$(this).prev().attr(\'checked\',true)">瓶营养液</div><br>';
            html += '<div '+pClick+' ><input id="allbottle" type="radio" value="3" name="sendBottleNum" '+disableStr+' onclick="$(\'#writeNum\').val(\'\')">我要把所有营养液都灌溉给大大<span id="nutritionnum">&nbsp;（您当前剩余'+json.num+'瓶营养液）</span></div><br>';
            html += '<input type="button" onclick="sendforest('+obj+')" style="width:50px;text-align:center;" id="nutritionSend" value="确认">&nbsp;&nbsp;&nbsp;';
            html += '<input type="button" onclick="$.unblockUI()" style="width:50px;text-align:center;" value="取消">';
            html += '</div>';
            $.blockUI(html);
        });
    }
}
function getNutritionNum() {
    var readerid = getCookie('readerid');
    $.getJSON('//my.jjwxc.net/givenutrition_ajax.php?jsonp=?', {readerid: readerid, action: 'getnutritionnum'}, function(json) {
        $('.ajax_fill_data.nutrition_num').html(json.num);
        var today = new Date();
        var dayOfMonth = today.getDate();
        if (dayOfMonth >= 25 && json.expire_nutrition > 0) {
            $('.ajax_fill_data.expire_nutrition').html('，其中'+json.expire_nutrition+'瓶即将过期');
        }
        if (parseInt(json.num) <= 0) {
            $('input[name="nutrition_radio"]').attr('disabled','disabled').css('pointer-events','none');
            $('.nutrition_radio_parent').attr('onclick','$.blockUI(\'您当前没有营养液哦\');setTimeout(\'$.unblockUI()\',1000)')
        }
    });
}

function sendforest(obj, force, forcetype, forcenum) {
    if (force==undefined) {
        force = 0;
    }
    if (forcetype==undefined) {
        forcetype = '';
    }
    if (forcenum==undefined) {
        forcetype = '';
    }
    $('#nutritionSend').attr('disabled', 'disabled');
    var type = '';
    var num = '';
    $('input[name=sendBottleNum]').each(function(i, v) {
        if ($(this).attr('checked')=='checked') {
            type = $(this).val();
            if ($(this).next().attr('id')=='writeNum') {
                num = $(this).next().val();
            }
        }
    })
    type = type ? type : forcetype;
    num = num ? num : forcenum;
    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
    $.ajax({
        type: "get", //使用get方法访问后台
        dataType: "jsonp", //返回json格式的数据
        data: {novelid: obj, type: type, num: num, force: force},
        jsonpCallback: "person",
        url: httpProtocol + "://my.jjwxc.net/givenutrition_ajax.php?callback=?", //要访问的后台地址
        complete: function() {
        }, //AJAX请求完成时隐藏loading提示
        success: function(data) {//msg为返回的数据，在这里做数据绑定
            if (data.status == 108) {
                $.blockUI('<div  style="line-height:13px"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer;margin-top:-10px" onClick="$.unblockUI()"/></div><b>'+data.msg+'</b><br><br><input type="button" value="确认" onClick="sendforest('+obj+', 1,'+type+', '+num+')" style="margin:0 auto"/><input type="button" value="取消" onClick="$.unblockUI()" style="margin-left:20px;"/></div>', {
                    cursor: 'text'
                });
            } else {
                $.blockUI('<div  style="line-height:13px"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer;margin-top:-10px" onClick="$.unblockUI()"/></div><b>'+data.msg+'</b><br><br><input type="button" value="确认" onClick="$.unblockUI()" style="margin:0 auto"/></div>', {
                    cursor: 'text'
                });
            }

        }
    });
}
//封装投霸王票事件
function ticketsubmit() {
    var comment = arguments[0] ? arguments[0] : false;
    var id = '';
    var t = '';
    var num = 1;
    var novelId = getURLParam('novelid');
    $('input[name=KingTickets_radio]').each(function(i, v) {
        if ($(this).attr('checked')=='checked'||$(this).attr('checked')=='checked') {
            id = $(this).attr('id');
            t = $(this).attr('rel');
            if ($(this).next().attr('id')=='KingTickets_deeptorpedo_num') {
                num = $(this).next().val();
            }
        }
    })
    if (t==''&&id=='') {
        $.blockUI('请选择霸王票类型，点击<b>【确定】</b>返回!<br><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/>', {
            width: '330px',
            height: '70px',
            cursor: 'default'
        });
        return false;
    }
    if (is_login()) {
        $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
        $.ajax({
            type: "GET",
            url: 'backend/kingTicketsPay_ajax.php?action=check&novelid='+novelId+'&t='+t+'&num='+num+'&jsonp=?',
            dataType: 'jsonp',
            async: false,
            success: function(json) {
                if (json.status==200) {
                    $.blockUI('<div align="center" style="font-size: 12px;line-height:15px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+json.message+'</b><br><br><br><input type="button" value="确 定" onClick="checkpaypwd(\''+id+'\','+comment+')"/>　　　　<input type="button" value="取 消" onClick="$.unblockUI()"/></div>', {
                        width: '330px',
                        height: '160px',
                        cursor: 'default'
                    });
                } else if (json.status==108) {
                    $.blockUI('<div align="center" style="font-size: 12px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+json.message+'</b><br><br><br><input type="button" value="确 定" onClick="checkpaypwd(\''+id+'\','+comment+')"/>　　　　<input type="button" value="取 消" onClick="$.unblockUI()"/></div>', {
                        width: '330px',
                        height: '100px',
                        cursor: 'default'
                    });
                } else if (json.status==100) {
                    $.blockUI('<div align="center" style="font-size: 12px;line-height:15px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+json.message+'</b><br><br><br><input type="button" value="确 定" onClick="$.unblockUI();window.open(\'//my.jjwxc.net/pay/\');"/></div>', {
                        width: '330px',
                        height: '130px',
                        cursor: 'default'
                    });
                } else if (json.status==1013) {
                    $.blockUI('<div align="center" style="font-size: 12px;line-height:15px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+json.message+'</b><br><br><br><input type="button" value="确 定" onClick="$.unblockUI();window.open(\'//my.jjwxc.net/pay/\');"/></div>', {
                        width: '330px',
                        height: '130px',
                        cursor: 'default'
                    });
                } else if (json.status==1022) {
                    // 读者ID缺失，js中cookie未清理掉
                    show_login();
                    window.scroll(0, 0);
                } else {
                    $.blockUI('<div align="center" style="font-size: 12px;line-height:15px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+json.message+'</b><br><br><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {
                        width: '330px',
                        height: '120px',
                        cursor: 'default'
                    });
                }
            }
        });
    }
}

//发评及霸王票+营养液+发评
function insert_comment() {
    var kingobj = $("input:checked[name='KingTickets_radio']");
    var nutrition = $("input:checked[name='nutrition_radio']");
    if (kingobj.length > 0 || nutrition.length > 0) {
        var ticketval = kingobj.val();
        if (nutrition.length > 0) {
            if (ticketval !== undefined) {
                //先判断是否有支付密码，
                checkpaypwdV2(function() {
                    $.blockUI('<div><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><b>请输入您设定的支付密码（格式为6位纯数字)</b><br><br><input name="paypwd" type="password" id="paypwd" maxlength="6" /><br/><br/><input type="button" onclick="commentWithKingNNutrition()" value="确 定" />&nbsp;&nbsp;<input type="button" value="取消" onclick="$.unblockUI();"/><br><br><center><a href="//help.jjwxc.net/user/password/2">[忘记支付密码?]</a></center></div>'
                            , {
                                width: '330px',
                                height: '150px',
                                cursor: 'default'
                            });
                }, commentWithKingNNutrition);
            } else {
                commentWithKingNNutrition()
            }
        } else if (ticketval !== undefined) {
            ticketsubmit();
        } else {
            comment_submit();
        }
    } else {
        comment_submit();
    }
}

function commentWithKingNNutrition() {
    if (!is_login()) {
        return false;
    }
    var kingobj = $("input:checked[name='KingTickets_radio']");
    var nutrition = $("input:checked[name='nutrition_radio']");

    var ticket_type = '';
    var nutrition_type = '';
    var isHaveKingtTickets = 0;
    var isHaveNutrition = 0;
    var ticket_num = 1;
    var nutrution_num = 1;
    var novelId = getURLParam('novelid');
    var KingTickets_radio = $('input[name=KingTickets_radio]:checked');
    if (KingTickets_radio.length > 0) {
        ticket_type = KingTickets_radio.attr('rel');
        isHaveKingtTickets = 1;
        if (KingTickets_radio.next().attr('id') === 'KingTickets_deeptorpedo_num') {
            ticket_num = KingTickets_radio.next().val();
        }
    }
    var nutrution_radio = $('input[name=nutrition_radio]:checked');
    if (nutrution_radio.length > 0) {
        isHaveNutrition = 1;
        nutrition_type = nutrution_radio.attr('rel');
        if (nutrution_radio.next().attr('id') === 'manual_nutrition_num') {
            nutrution_num = nutrution_radio.next().val();
        }
    }


    var r = 0;
    if ($("#code_random").length>0) {
        r = $("#code_random").val();
    }
    var subObj = $("#publish_comment");
    var submit_btn_copy = $('#submit_comment').html();
    $('#submit_comment').html('<img src="//static.jjwxc.net/images/loading.gif">');
    var novelid = subObj.find("#novelid").val();
    var chapterid = subObj.find("#chapterid").val();
    var novelname = subObj.find("#novelname").val();
    var commentauthor = subObj.find("#commentauthor").val().replace(/^\s+|\s+$/g, '');
    var commentmark = subObj.find("#commentmark").val();
    var commentsubject = subObj.find("#commentsubject").val();
    var commentbody = subObj.find("#commentbody").val().replace(/^\s+|\s+$/g, '');
    var comment_auth_num = subObj.find('#comment_auth_num').val();
    var emoji_id = subObj.find('#commentbody_crack_sugar_id').val();
    var paypwd = $('#paypwd').val();
    if (subObj.find('#comment_auth_num').size()==0) {
        $('#publish_comment').append('<input type="hidden" name="comment_auth_num" id="comment_auth_num" value="" />');
    } else {
        $('#comment_auth_num').val('');
    }

    if (commentbody=='') {
        alert('评论内容不能为空');
        $('#submit_comment').html('<input type="button" value="确定" tabindex="7" class="fanbutton" name="button1" onclick="commentWithKingNNutrition()"/>');
        return false;
    }

    if($("#shumeideviceId").length > 0){
        var shumeideviceId = $("#shumeideviceId").val();
    }else{
        var shumeideviceId = "";
    }
    $.getJSON('//my.jjwxc.net/app.jjwxc/Pc/Comment/writeComment?jsonp=?', {
        novelid: novelid,
        chapterid: chapterid,
        commentAuthor: encodeURIComponent(commentauthor),
        commentMark: commentmark,
        commentSubject: encodeURIComponent(commentsubject),
        commentBody: encodeURIComponent(commentbody),
        paypassword: paypwd,
        comment_auth_num: comment_auth_num,
        shumeideviceId: shumeideviceId,
        r: r,
        isHaveNutrition: isHaveNutrition,
        nutrition_type: nutrition_type,
        nutrition_num: nutrution_num,
        isHaveKingtTickets: isHaveKingtTickets,
        ticket_num: ticket_num,
        ticket_type: ticket_type,
        emoji_id: emoji_id

    }, function(data) {
        if (data.code=='1004') {
            show_login();
            return false;
        } else if (data.code==200) {
            $.blockUI('<div align="center" style="font-size: 12px;line-height:15px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="location.reload()"/></div><br><br><b>'+data.message+'</b><br><br><br><br><input type="button" value="确 定" onClick="location.reload()"/></div>', {
                width: '330px',
                height: '120px',
                cursor: 'default'
            });
            setTimeout(function(){
                location.reload();
            }, 2500);
            return false;
        } else if (data.code==10) {
            var randid = Math.random();
            $.blockUI('<div align="center"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><b>请输入验证码再提交</b><br><br>验证码 <input name="auth_num_login" class="input" id="auth_num_login" size="10" maxlength="8" />&nbsp; <img id="img_auth" rel="2" src=\"//my.jjwxc.net/include/checkImage.php?action=pay&r='+randid+'\"> <span id="img_auth_reload" style="cursor:pointer; color: blue; text-decoration: underline;" onClick="imgautoreload()">看不清</span><br><br><span id="Ekey_message" style="color: red"></span><br><br><input type="button" value="提 交" onClick="comment_auth_num(true)"/>&nbsp;&nbsp;&nbsp;</div>', {
                width: '350px',
                height: '130px',
                cursor: 'default'
            });
            if ($("#code_random").length>0) {
                $("#code_random").val(randid);
            } else {
                $("#publish_comment").append("<input type='hidden' value='"+randid+"' name='random' id='code_random'>");
            }
        } else {
            $.blockUI('<div align="center" style="font-size: 12px;line-height:15px;"><div style="float:right"><img src="//static.jjwxc.net/images/close.gif" width="12" height="12" style="cursor:pointer" onClick="$.unblockUI()"/></div><br><br><b>'+data.message+'</b><br><br><br><br><input type="button" value="确 定" onClick="$.unblockUI()"/></div>', {
                width: '330px',
                cursor: 'default'
            });
        }
        $('#submit_comment').html(submit_btn_copy);
    });
}
//审核中评论状态
function selectexamin(novelid, commentid) {
    $.getJSON("getexamin.php", {novelid: novelid, commentid: commentid}, function(json) {
        if (json.isdel) {
            alert(json.isdel);
        } else {
            alert("排队等待审核中---尚未进入审核表,等待进入中");
        }
    })
}
//推荐给朋友弹框
function inviteShare(ShareUrl) {
    var coverImg = $(".noveldefaultimage:eq(0)").attr('src');
    var html = '<div style="text-align:left;">分享到：';
    var novelname = $.trim($('span[itemprop="articleSection"]').text());
    html += '<a id="sina" title="分享到新浪微博" class="social_share" novelname="' + novelname + '" rel="'+coverImg+'" style="background:url(//static.jjwxc.net/images/sharesina16.png) no-repeat scroll 0 0 transparent;line-height:normal;padding:3px 5px 0 20px;color:#1A66B3;">新浪微博</a>';
//    html += '<a id="sina" title="分享到微信" onclick="inviteShareByWeChat();" rel="' + coverImg + '" style="background:url(\'//static.jjwxc.net/images/login/weixin_new.png?ver=20190423\')no-repeat scroll 0 0 transparent;background-size:16px; line-height:normal;padding:3px 5px 0 20px;color:#1A66B3;"><font>微信</font></a>';
    html += '<div style="margin-top:20px;">推荐链接：<input type="text" value="'+ShareUrl+'" style="width:280px;" id="ShareUrl"/><input style="margin-left:5px;" type="button" value="复制链接" id="copyShareUrl" /></div>';
    html += '<div style="margin-top:10px;">登入后，推荐作品给朋友，你和朋友都将获得月石资励哦！<a target="_blank" href="//help.jjwxc.net/user/article/156" onmouseover="this.style.color=\'#090\';" onmouseout="this.style.color=\'#000\';" onclick="this.style.color=\'#000\';">了解更多>></a></div>';
    html += '<div style="margin-top:15px;" id="copyShareUrlNotice">&nbsp;</div>';
    html += '</div>';
    html += '<div style="margin-top:15px;"><button onclick="$.unblockUI()">关闭</button></div>';
    var __width = 410;//弹框宽度
    var __left = ($(window).width()-__width)/2;//弹框居中
    $.blockUI(html, {width: __width+'px', margin: '0px', cursor: 'default', left: __left+'px'});
    $("#copyShareUrl").click(function() {
        $("#ShareUrl").select();
        var copyRes = document.execCommand("Copy");
        if (copyRes) {
            $("#copyShareUrlNotice").html("<font color='green'>复制链接成功！</font>");
        } else if (window.clipboardData) {
            window.clipboardData.setData("Text", $("#ShareUrl").val());
            $("#copyShareUrlNotice").html("<font color='green'>复制链接成功！</font>");
        } else {
            $("#copyShareUrlNotice").html("<font color='red'>复制链接失败！您的浏览器不支持一键复制哦，请选择链接并按Ctrl+C进行复制！</font>");
        }
    });
    // 社交网站分享
    $('.social_share').click(function() {
        socialShare(this);
    }).css('cursor', 'pointer');
}
//推荐给朋友-微信
function inviteShareByWeChat() {
    var ShareUrl = 'https://wap.jjwxc.net/book2/shareNovel/'+getURLParam('novelid');
    if (getCookie('readerid')!='null'&&getCookie('readerid')!='') {
        ShareUrl += '/'+getCookie('readerid');
    }
    var __width = 300;//弹框宽度
    var __left = ($(window).width()-__width)/2;//弹框居中
    var __html = '<div style="text-align:center;">';
    __html += '<div id="inviteShareCodeDiv" style="padding:20px;"></div>';
    __html += '<div>微信扫描二维码，分享给朋友</div>';
    __html += '<div><br/></div>';
    __html += '<div><button onclick="$.unblockUI()">关闭</button></div>';
    __html += '</div>';
    __html += '<script type="text/javascript">jQuery("#inviteShareCodeDiv").qrcode({render: "canvas",width: 256,height: 256, text:" '+ShareUrl+'"})</script>';
    $.blockUI(__html, {width: __width+'px', top: '10%', margin: '0px', cursor: 'default', left: __left+'px', height: '356px'});
}
//社交网站分享
function socialShare(self) {
    var id = $(self).attr('id');
    var novelId = getURLParam('novelid');
    var chapterId = getURLParam('chapterid');
    if (chapterId=='') {
        chapterId = 1;
    }
    var InviteUrl = '';
    var d = '';
    var title = '';
    if (getCookie('readerid')) {
        $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
        $.getJSON(httpProtocol + '://my.jjwxc.net/backend/import_msn.php?action=copy_invite&invite_type=1&novelid='+novelId+'&chapterid='+chapterId+'&jsonp=?', function(json) {
            if (json.status==200&&json.inviteId>0) {
                var novelName = json.data.novelname;
                var chapterName = json.data.chaptername;
                var authorName = json.data.authorname;
                var cover = json.data.coverImg;
                InviteUrl = 'https://www.jjwxc.net/backend/invite.php?inviteId='+json.inviteId;
                switch (id) {
                    case 'sina':
                        title = encodeURIComponent('我在晋江文学城阅读《'+novelName+'》。小伙伴们不来看看么？ 文章简介：'+json.data.novelintroshort+'（分享自 @晋江文学城）');
                        var source = encodeURIComponent('晋江文学城');
                        var sourceUrl = 'https://www.jjwxc.net';
                        d = 'https://service.weibo.com/share/share.php?ralateUid=1732420735&appkey=1409224402&url='+InviteUrl+'&title='+title+'&source='+source+'&sourceUrl='+sourceUrl+'&content=gb2312&pic='+cover;
                        $.blockUI('<br><div align="center"><b>您确认要分享这篇作品到新浪微博上吗？</b><br><br><br><br><div align="center"><input type="button" value="确　定" onClick="blockOpen(\''+d+'\', 440, 430)"/></div>', {
                            width: '300px',
                            height: '100px',
                            cursor: 'default'
                        });
                        break;
                }

            } else {
                $.blockUI('<br><div align="center"><b>'+json.message+'</b><br><br><br><br><div align="center"><input type="button" value="确　定" onClick="$.unblockUI()"/></div>', {width: '300px', height: '100px', cursor: 'default'});
            }
        });
    } else {
        //没登陆分享链接显示
        switch (id) {
            case 'sina':
                var url = 'https://www.jjwxc.net/onebook.php?novelid=' + novelId;
                var novelname = $(self).attr("novelname");
                title = encodeURIComponent('我在晋江文学城阅读《'+novelname+'》。小伙伴们不来看看么？ （分享自 @晋江文学城）');
                var source = encodeURIComponent('晋江文学城');
                var sourceUrl = 'https://www.jjwxc.net';
                d = 'https://service.weibo.com/share/share.php?ralateUid=1732420735&appkey=1409224402&url='+url+'&title='+title+'&source='+source+'&sourceUrl='+sourceUrl+'&content=gb2312';
                $.blockUI('<br><div align="center"><b>您确认要分享这篇作品到新浪微博上吗？</b><br><br><br><br><div align="center"><input type="button" value="确　定" onClick="blockOpen(\''+d+'\', 440, 430)"/></div>', {
                    width: '300px',
                    height: '100px',
                    cursor: 'default'
                });
                break;
        }
    }
}

function isMinusPosint(select) {
    var value = $(select).val();
    if (value==6) {    // 选中捉虫选项
        $('#commentbody').attr('placeholder', '为大大捉虫，人人有责！');
    } else {
        if (!getCookie('readerid')) {
            $('#commentbody').attr('placeholder', '根据国家相关法律法规规定，请您先登入后再发言');
        } else {
            placeholderStr = getPlaceHolderRandom(placeholderArr);
            $('#commentbody').attr('placeholder', placeholderStr);
        }
    }
    if (value>2) {
        $('#minusPointTip').css('display', 'none');
    }
}

// 定义获取随机placeholder提示语
function getPlaceHolderRandom(placeholderTypeArr) {
    var placeholderStr = '';
    if (placeholderTypeArr.length) {
        var index = GetRandomNum(0, placeholderTypeArr.length-1);
        placeholderStr = placeholderTypeArr[index];
    }
    return placeholderStr
}

/**
 * 判断是否登陆，未登陆给出提示去登陆
 * @returns {undefined}
 */
function checkCommentUser() {
    var commentuser = checkCommentUserHtml();
    if (commentuser!="") {
        $("textarea[name='commentbody']").replaceWith(commentuser);
        $("#comment_submit").css('display', 'none');
    } else {
        var textarea = '<textarea onBlur="setofffcous()" onFocus="setonfcous()" tabindex="6" class="input_textarea_short" rows="7" cols="100" name="commentbody" id="commentbody" style="width:100%; height:110px;padding:3px;" placeholder=""/></textarea>';
        $("#replacediv").replaceWith(textarea);
        $("#comment_submit").css('display', 'block');
    }
}
/**
 * 新增收藏分类
 */
function addFavoriteClass() {
    var classname_new = $("#addFavoritClassForm #classname_new").val();
    var isNewFav = $('.favGroup0315').length > 0;
    $.ajax({
        url: "//my.jjwxc.net/backend/favoriteclass.php?act=addclass&callback=?&rand="+Math.random(),
        type: "GET",
        data: {classname_new: classname_new},
        dataType: "jsonp",
        success: function(res) {
            if (res.status==200) {
                cancelFavoriteClass();
                if(res.data.favId) {
                    if (isNewFav) {
                        $('#float_comment_ul').append('<li style="white-space: nowrap;overflow: hidden;box-shadow: 2px 2px 5px #D3D6DA;line-height:22px;height:22px;background:#e0f0fa;"><font style="cursor:pointer;color:green;white-space: nowrap;overflow: hidden;" id="'+res.data.favId+'" title="'+classname_new+'" onmouseout="this.style.textDecoration=\'none\'" onmouseover="this.style.textDecoration=\'underline\'">'+classname_new+'</font></li>');
                    } else {
                        $('#float_comment_ul').append('<li style="white-space: nowrap;overflow: hidden;"><font style="cursor:pointer;color:green;white-space: nowrap;overflow: hidden;" id="'+res.data.favId+'" title="'+classname_new+'" onmouseout="this.style.textDecoration=\'none\'" onmouseover="this.style.textDecoration=\'underline\'">'+classname_new+'</font></li>');
                    }
                }
                var id = $("#favoriteAddId").val();
                if (id=="favorite_1") {//文章收藏
                    if (!isNewFav) {
                        $("#"+id).click();
                    }
                } else {//章节收藏
                    $('#float_favorite').hide();
                    var clickKey = jjCookie.get('bookFavoriteClass');
                    $("#"+clickKey).click();
                }
            } else {
                $("#favoritClassMsg").html(res.message);
            }
        }
    });
}
/**
 * 隐藏收藏分类表单
 */
function cancelFavoriteClass() {
    $("#addFavoritClassForm #classname_new").val("");
    $("#addFavoritClassForm #favoritClassMsg").html("");
    $("#addFavoritClassForm").hide();
    $("#showFavoritClassBtn").show();
    $(".favGroup0315").show();
}
/**
 * 显示收藏分类表单
 */
function showFavoriteClassForm() {
    $("#addFavoritClassForm").show();
    $("#showFavoritClassBtn").hide();
    $(".favGroup0315").hide();
}
/**
 * 检查评论框中应该输入的提示
 * @returns {String}
 */
function checkCommentUserHtml() {
    var commentuser = "";
    if (!getCookie('readerid')) {
        commentuser = '<div id="replacediv" style="border:1px solid gray;width:100%; height:110px;padding:3px;background-color: #fff;font-size:13px"><div style="line-height:26px;text-align:left;color:gray;padding-left:3px;">根据国家相关法律法规规定，请您先登入后再发言！<a onclick="show_login();return false;" href="#">登入</a> | <a href="//my.jjwxc.net/register/index.html" target=_blank>注册</a></div></div>';
    }
    return commentuser;
}
/**
 * 评论折叠的功能
 * @param {int} commentid 评论id
 */
function showNormalComment(commentid) {
    $("#foldlingcomment_"+commentid).css("display", "none");
    $("#mormalcomment_"+commentid).css("display", "block");
    $("#reply_"+commentid).css("display", "block");
    var foldlingauthor = $("#foldlingauthor_"+commentid).data("foldlingauthor");
    if (foldlingauthor!=undefined&&foldlingauthor!='undefined') {
        $("#foldlingauthor_"+commentid).text(foldlingauthor);
    }
}
/**
 * 回复折叠的功能
 * @param {int} replyid 回复id
 */
function showNormalReply(replyid) {
    $("#foldlingreply_"+replyid).css("display", "none");
    $("#mormalreply_"+replyid).css("display", "block");
    var foldlingreplyauthor = $("#foldlingreplyauthor_"+replyid).data("foldlingreplyauthor");
    if (foldlingreplyauthor!=undefined&&foldlingreplyauthor!='undefined') {
        $("#foldlingreplyauthor_"+replyid).text(foldlingreplyauthor);
    }
}
/**
 * 判断本次发红包，同一章节不重复给同一用户发红包 选择是否勾选上了
 * @returns {undefined}
 */
function changeBatchRedNum() {
    var repeatenvelopes = $("input[name='repeatenvelopes']:checked").val();
    //查询input所有选中的值
    var commentidarr = new Array();//所有的评论
    var repeatcommentidarr = new Array();//同一用户同一个章节只保留一个
    var repeatcommentidlist = "|";
    $('.batchaddcommend').parent().find('input.batchred:checked').each(function() {
        commentidarr.push($(this).val());
        var commentRel = $(this).attr("rel");
        if (repeatcommentidlist.indexOf("|"+commentRel+"|")==-1) {
            repeatcommentidarr.push(commentRel);
            repeatcommentidlist += commentRel+"|";
        }
    })
    var redpaycount = repeatcommentidarr.length;
    if (repeatenvelopes==undefined) {//勾选去掉了 重新计算
        redpaycount = commentidarr.length;
    }
    $("#redpaycount").text(redpaycount);
    //计算总的需要扣除的晋江币
    var unit = $("input[name='redpayradio']:checked").val();
    if (unit!=undefined) {
        if (unit==0) {
            unit = 20
        } else {
            unit *= 100;
        }
        $('#redpaytotal').text('(共计'+unit*redpaycount+'点)')
    }

}

function optAiComment(job_id, opt_type) {
    // 判断是否登录
    if (!getCookie('readerid')) {
        show_login();
        return;
    }
    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
    $.ajax({
        url: '//'+window.location.hostname+'/app.jjwxc/Pc/aiComment/opt',
        type: "GET",
        async: true,
        data: {
            job_id:job_id,
            opt_type:opt_type
        },
        success: function(data) {
            $.unblockUI();
            if(data.code == 200) {
                $.blockUI(data.message);
            } else if (data.code == -1022 || data.code == 1022) {
                // 读者ID缺失，js中cookie未清理掉
                show_login();
            } else {
                $.blockUI(data.message);
            }
            setTimeout('$.unblockUI()',1000);
            location.reload(true);
        },
        error:function(e){
            $.blockUI('操作失败，请稍候再试！');
            setTimeout('$.unblockUI()',1000);
            console.dir(e)
        }
    });
}

/**
 * 点赞/拍砖
 */
function addAgree(agreetype,novelid,chapterid,commentid,replyid,isFormatNum) {
    // 判断是否登录
    if (!getCookie('readerid')) {
        show_login();
        return;
    }
    $.blockUI('<img src="//static.jjwxc.net/images/loading.gif">  <strong>请稍候...</strong>');
    // 默认格式化点赞数据
    if(typeof(isFormatNum) === 'undefined'){
        isFormatNum = true
    }
    var agreeEleStr = "[data-ele='agree_" + novelid + '_' + commentid + "_" + replyid + "']";
    var disagreeEleStr = "[data-ele='disagree_" + novelid + '_' + commentid + "_" + replyid + "']";
    if (agreetype == 1 && $(agreeEleStr).data('hasclick') == 1) {
        agreetype = -1;
    } else if(agreetype == 2 && $(disagreeEleStr).data('hasclick') == 1) {
        agreetype = -2;
    }
    $.ajax({
        url: '//'+window.location.hostname+'/app.jjwxc/Pc/Comment/addAgree',
        type: "GET",
        async: true,
        data: {
            agreetype:agreetype,
            novelid:novelid,
            chapterid:chapterid,
            commentid:commentid,
            replyid:replyid
        },
        success: function(data) {
            $.unblockUI();
            if(data.code == 200) {
                // 样式切换
                if (agreetype == 1) {
                    // 点赞成功
                    var agreenum = $(agreeEleStr).data('number')
                    agreenum ++ ;
                    $(agreeEleStr).data('number',agreenum)
                    var newAgreeNum = isFormatNum ? formatAgreeNum(agreenum) : agreenum;
                    $(agreeEleStr).data('hasclick',1);
                    $(agreeEleStr).find('img').attr('src','//static.jjwxc.net/images/agree_did.png')
                    $(agreeEleStr).find('.numstr').css('color','#009900').html(newAgreeNum);
                    // 设置未操作过
                    $(disagreeEleStr).data('hasclick',0);
                    $(disagreeEleStr).find('img').attr('src','//static.jjwxc.net/images/agree_not.png')

                } else if (agreetype == 2) {
                    // 拍砖成功
                    $(disagreeEleStr).data('hasclick',1);
                    $(disagreeEleStr).find('img').attr('src','//static.jjwxc.net/images/agree_not_did.png')
                    // 拍砖前是否赞过，赞过则减掉已赞数
                    if ($(agreeEleStr).data('hasclick') == 1) {
                        var agreenum = $(agreeEleStr).data('number')
                        agreenum--;
                        $(agreeEleStr).data('number',agreenum)
                        var newAgreeNum = (isFormatNum || agreenum <= 0)  ? formatAgreeNum(agreenum) : agreenum;
                        $(agreeEleStr).data('hasclick',0);
                        $(agreeEleStr).find('img').attr('src','//static.jjwxc.net/images/agree.png')
                        $(agreeEleStr).find('.numstr').css('color','#000000').html(newAgreeNum);
                    }
                } else if (agreetype == -1) {
                    var agreenum = $(agreeEleStr).data('number')
                    agreenum--;
                    $(agreeEleStr).data('number',agreenum)
                    var newAgreeNum = (isFormatNum || agreenum <= 0)  ? formatAgreeNum(agreenum) : agreenum;
                    $(agreeEleStr).data('hasclick',0);
                    $(agreeEleStr).find('img').attr('src','//static.jjwxc.net/images/agree.png')
                    $(agreeEleStr).find('.numstr').css('color','#000000').html(newAgreeNum);
                } else if (agreetype == -2) {
                    $(disagreeEleStr).data('hasclick',0);
                    $(disagreeEleStr).find('img').attr('src','//static.jjwxc.net/images/agree_not.png')
                }

            } else if (data.code == -1022 || data.code == 1022) {
                // 读者ID缺失，js中cookie未清理掉
                show_login();
            } else {
                $.blockUI(data.message);
                setTimeout('$.unblockUI()',1000)
            }
        },
        error:function(e){
            $.blockUI('操作失败，请稍候再试！');
            setTimeout('$.unblockUI()',1000);
            console.dir(e)
        }
    });
}

// 文章详情页-评论按照回复时间排序[
// https://www.jjwxc.net/onebook.php?novelid=4868058&chapterid=4 
// https://my.jjwxc.net/onebook_vip.php?novelid=4737103&chapterid=16]
$('#comment_sort').change(function (e) {
    var sortClickValue = $('#comment_sort').val();
    var novelid = $(this).data('novelid')
    // var commentSortCookie = getCookie(novelid);
    setCookie(novelid, sortClickValue, new Date(eval(clientTime.getTime()+86400*1000)), '/', '.jjwxc.net');
    get_comment_info({}, sortClickValue);
})

function commentTopHideToggle(topCommentElementId) {
    var commentShowDes =$('#comment_top_toggle').html();
    var topHideContent = $('.'+topCommentElementId+'_cut_cmt').html();
    var topFullContent = $('.'+topCommentElementId+'_full_cmt').html();
    if (commentShowDes.indexOf('收起') != -1) {
        $('#comment_top_toggle').html(
            '<div id="comment_top_toggle" style="padding-bottom: 3px;">展开<span style="display: none" class="'+topCommentElementId+'_cut_cmt">'+topHideContent+'</span><span style="display: none" class="'+topCommentElementId+'_full_cmt">'+topFullContent+'</span><span style="color:#039902; "><img src="//static.jjwxc.net/images/reply_open_2.png" width="19px" style="vertical-align: middle; margin-bottom: 4px;" alt="img loading..." /></span></div>'
        );
        $('#' + topCommentElementId).html(
            topHideContent
        );
        
    } else {
        $('#' + topCommentElementId).html(
            topFullContent
        );
        $('#comment_top_toggle').html(
            '<div id="comment_top_toggle" style="padding-bottom: 3px;">收起<span style="display: none" class="'+topCommentElementId+'_cut_cmt">'+topHideContent+'</span><span style="display: none" class="'+topCommentElementId+'_full_cmt">'+topFullContent+'</span><span style="color:#039902;"><img src="//static.jjwxc.net/images/reply_close_2.png" width="19px" style="vertical-align: middle;margin-bottom: 4px;" alt="img loading..."/></span></div>'
        );
    }
}

function showMoreTopCommentReply(replyElementId, replyTotal, replyOffset, moreTopReplyGet) {
    var maxReplyOffset = parseInt(replyOffset) + 20;
    $('#' + replyElementId + ' .replybody').each(function(index, v) {
        if (replyOffset == index && (replyOffset < (maxReplyOffset))) {
            $(this).show();
            ++replyOffset;
        }
        $('.' + moreTopReplyGet).hide();
        if (index > maxReplyOffset) {
            //在最后一个元素 增加查看更多入口
            var eqIndex = (index - 2) < 0 ? 0 : (index - 2);
            if (replyOffset != replyTotal -1) {
                var display = '<div class="' + moreTopReplyGet + '" style="text-align: right;padding-right: 20px; padding-bottom: 3px;">共<span style="color: #039902;">' + replyTotal + '</span>条回复 <span onclick="showMoreTopCommentReply(\''+replyElementId+'\', \''+replyTotal+'\', \''+replyOffset+'\', \''+moreTopReplyGet+'\')">查看更多<span style="color: #039902;" ><img src="//static.jjwxc.net/images/reply_open_2.png" width="19px" style="vertical-align: middle;margin-bottom: 4px;" alt="img loading..."/></span></span></div>';
                $('#' + replyElementId + ' .replybody').eq(eqIndex).append(display);
            }
            return false;
        }
    });
}

/**
 * 设置点赞数据
 */
function getAgreeData(novelid, isauthor) {
    if (isauthor == undefined) isauthor = false;
    var chapteridArr = [];
    $(".agree_block").each(function(index,ele){
        chapteridArr.push($(this).data('agreekey'))
    })
    if (getCookie('readerid')) {
        // 用户点赞效果
        $.ajax({
            url: "//my.jjwxc.net/backend/comment_agree_ajax.php?action=getagree&rand="+Math.random(),
            type: "GET",
            async: true,
            data: {novelid:novelid, chapterids:chapteridArr},
            dataType: "jsonp",
            success: function(data) {
                if(data.status == 200) {
                    $.each(data.data,function(i,e){
                        if (e == 1) {
                            // 点赞
                            if ($("[data-ele='agree_"+novelid+"_"+i+"']").length) {
                                $("[data-ele='agree_"+novelid+"_"+i+"']").data('hasclick',1);
                                $("[data-ele='agree_"+novelid+"_"+i+"']").find('img').attr('src','//static.jjwxc.net/images/agree_did.png')
                                $("[data-ele='agree_"+novelid+"_"+i+"']").find('.numstr').css('color','#009900');
                            }
                        } else if (e == 2) {
                            // 拍砖
                            if ($("[data-ele='disagree_"+novelid+"_"+i+"']").length) {
                                $("[data-ele='disagree_"+novelid+"_"+i+"']").data('hasclick',1);
                                $("[data-ele='disagree_"+novelid+"_"+i+"']").find('img').attr('src','//static.jjwxc.net/images/agree_not_did.png')
                            }
                        }
                    })
                }
            },
            error:function(e){
                // 打印数据
                console.dir(e)
            }
        });
    }

    var isNew = 1;
    // 动态加载评论踩赞数量获取展示出的章节id(防止js更新但页面未更新获取不到chapteridArr)
    if (chapteridArr.length <= 0) {
        $(".redcommentchapter").each(function(index,ele){
            var comment_chapterid = $(ele).data('chapterid')
            if (chapteridArr.indexOf(comment_chapterid) == -1) chapteridArr.push(comment_chapterid)
        })
        isNew = 0;
    }
    $.ajax({
        url: "//my.jjwxc.net/backend/comment_agree_ajax.php?action=getNovelAgreeData&rand="+Math.random(),
        type: "GET",
        async: true,
        data: {novelid:novelid,chapterids:chapteridArr,isnew:isNew},
        dataType: "jsonp",
        success: function(data) {
            if(data.status == 200) {
                if (data.data && data.data.agree) {
                    $.each(data.data.agree, function(i, e) {
                        // 不存在的key设置默认值为0
                        e = e === '' ? 0 : parseInt(e);
                        $("[data-ele='agree_"+novelid+"_"+i+"']").data('number',e);
                        // 作者后台显示原始数字
                        var num = isauthor ? e : formatAgreeNum(e);
                        $("[data-ele='agree_"+novelid+"_"+i+"']").find('.numstr').html(num);
                    })
                }
            }
        },
        error:function(e){
            // 打印数据
            console.dir(e)
        }
    });
}

/**
 * 格式化数量显示
 * @param number
 */
function formatAgreeNum(number) {
    var numberStr = number.toString();
    if (isNaN(number) || number < 1) {
        return '';
    } else if (number < 10000) {
        return number;
    } else if (number < 1000000) {
        return numberStr.substr(0,numberStr.length - 4) + '.' +numberStr.substr(-4,1) + '万';
    } else {
        return numberStr.substr(0,numberStr.length - 6) + '百万';
    }
}

function addCheckSimilarFun(id) {
    var sender = document.getElementById(id);
    if (!sender) {
        return;
    }
    sender.addEventListener('paste',function(ev){
        var ev= ev|| Event,clipboardData= ev.clipboardData;
        var pasteStr = clipboardData.getData('Text').replace(/(\r)*\n/g, "").replace(/(\s*)|(\s*$)/g, "");
        var textStr = $('#'+id).val().toString();
        if (!$('#temp_copy_chapter').length) {
            $('body').append('<textarea id="temp_copy_chapter" style="display: none;"></textarea>')
        }
        $('#temp_copy_chapter').val(textStr);
        var oldStr = textStr.replace(/(\r)*\n/g, "").replace(/(\s*)|(\s*$)/g, "");
        var oldStrLen = oldStr ? oldStr.length : 0;
        var pasteStrLen = pasteStr ? pasteStr.length : 0;
        if (!oldStrLen || !pasteStrLen) {
            return;
        }
        var similarNum = 0;
        var tips = '本次粘贴内容与本章已有内容重复度较高，请留意';
        var showBlock = false;

        var shortStr = oldStrLen >= pasteStrLen ? pasteStr : oldStr;
        var longStr = oldStrLen >= pasteStrLen ? oldStr : pasteStr;
        var paramsNum = longStr.length / shortStr.length;
        if (pasteStrLen >= 300) {
            console.dir(paramsNum)
            // 字符串切割
            for (let i = 0; i <= paramsNum; i++) {
                var cutEnd = Math.min((i+1)*shortStr.length, longStr.length)
                var tempStr = oldStr.substring(i*shortStr.length, cutEnd);
                similarNum = checkSimilar(tempStr, shortStr, 2);
                console.dir(similarNum);
                if (similarNum>=40) {
                    showBlock = true;
                    break;
                }
            }
        }
        if (showBlock) {
            $.blockUI('<div style="text-align: center"> <div>'+tips+'</div><div style="margin-top:20px;"><button onclick="$(\'#temp_copy_chapter\').remove(),$.unblockUI()" type="button">继续粘贴</button>&nbsp;&nbsp;<button onclick="$(\'#'+id+'\').val($(\'#temp_copy_chapter\').val()),$(\'#temp_copy_chapter\').remove(),$.unblockUI()" type="button">取消粘贴</button></div></div>');
        }

    })
}
/**
 * 根据编辑距离获取文本相似度
 * @param s1 字符串1
 * @param s2 字符串2
 * @param f 小数位数
 * @returns {string|number|*}
 */
function checkSimilar(s1, s2, f) {
    if (!s1 || !s2) {
        return 0
    }
    if(s1 === s2){
        return 100;
    }
    var l = s1.length > s2.length ? s1.length : s2.length
    var n = s1.length
    var m = s2.length
    var d = []
    f = f || 2
    var i, j, si, tj, cost
    if (n === 0) return m
    if (m === 0) return n
    for (i = 0; i <= n; i++) {
        d[i] = []
        d[i][0] = i
    }
    for (j = 0; j <= m; j++) {
        d[0][j] = j
    }
    for (i = 1; i <= n; i++) {
        si = s1.charAt(i - 1)
        for (j = 1; j <= m; j++) {
            tj = s2.charAt(j - 1)
            if (si === tj) {
                cost = 0
            } else {
                cost = 1
            }
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
        }
    }
    let res = (1 - d[n][m] / l) *100
    return res.toFixed(f)
}

function isSupportLocalStorage() {
    return 'localStorage' in window && window['localStorage'] !== null && typeof localStorage.setItem === 'function';
}

function UserCloseNovelComment() {
    //特定的几个域名生效
    var now_url = window.location.pathname;
    var allow_url = [
        '/comment.php',
        '/onebook.php',
        '/onebook_vip.php',
        '/noveloverlist.php'
    ];

    if (allow_url.indexOf(now_url) < 0) {
        return false;
    }

    var novelid = parseInt(getURLParam('novelid'));
    if (!novelid) {
        return false;
    }
    if(getCookie('readerid')) {
        var loadCloseCmt = true;
        var loadData = function () {
            $.ajax({
                url: '//my.jjwxc.net/backend/user_setting.php?action=getUserCloseCommentNovel&jsonp=?',
                type: 'GET',
                cache: false,
                dataType: 'jsonp',
                success: function(res) {
                    if (res.status == 200) {
                        //console.log(res.data, res.data.length, getURLParam('novelid'), res.data.indexOf(getURLParam('novelid')));
                        if (res.data.length > 0 && res.data.indexOf(getURLParam('novelid')) >= 0) {
                            if (getCookie('userclosecomment') != '1') {
                                hideCommentForCloseComment('您已关闭本文评论，如需参与评论互动，可前往其他设置修改')
                            }
                            if ('/onebook.php' === now_url && $('#favorite_type').length > 0) {
                                $('#favorite_type').before('<span class="recovery_block_novel_comment" data-novelid="'+novelid+'">[恢复评论互动]</span>');
                            }
                        } else {
                            if ('/onebook.php' === now_url && $('#favorite_type').length > 0) {
                                $('#favorite_type').before('<span class="block_novel_comment" data-novelid="'+novelid+'">[不看本文评论]</span>');
                            }
                        }
                    }
                },
                error: function() {
                    console.log("请求不看文章评论数据异常");
                    return false;
                }
            });
        }
        if (now_url === '/comment.php' || now_url === '/noveloverlist.php') {
            loadData();
        } else{
            $(window).scroll(
                throttle(function() {
                    //目录页标题下的菜单和阅读页 作话展示区域需要加载不看本文数据了
                    if (loadCloseCmt === true) {
                        if (($('#favorite_1').length > 0 && isEleShowInWindow($('#favorite_1'))) || ($('#note_danmu_wrapper').length > 0 && isEleShowInWindow($('#note_danmu_wrapper')))) {
                            loadCloseCmt = false;
                            loadData();
                        }
                    }
                }, 100)
            );
        }

    } else {
        if ('/onebook.php' === now_url && $('#favorite_type').length > 0) {
            $('#favorite_type').before('<span class="block_novel_comment" data-novelid="'+novelid+'">[不看本文评论]</span>');
        }
    }

}