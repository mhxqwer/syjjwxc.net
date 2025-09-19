// 接入emoji入口方法，在需要放表情包提供下ID标识（常规接入，直接从这调用这个方法即可）

function getEmojiPart(id, recentlyMaxWidth = 300, cssCustom = "") {
    setEmojiPart(getAllEmojiList(), id, recentlyMaxWidth, cssCustom);
}

/**
 *  设置磕糖表情
 * @param id 目标元素得id
 * @param target_novelid 检测是否开启嗑糖得文章id 不传会从checkbox中获取，需要确保其中至少有一个novelid
 */
function getCrackSugarPart(id, target_novelid) {
    getAllCrackSugarList(function(sugar_list) {
        setCrackSugarPart(sugar_list, id)
    })

    isDisplayCrackSugar(target_novelid)
    $(document).off('change', '.display_crack_sugar_cb');
    $(document).on('change', '.display_crack_sugar_cb', function(event){
        var novelid = $(this).val();
        if ($(event.target).prop('checked')) {
            //展示
            $('.display_crack_sugar_cb').prop('checked', true);

            var hide_crack_sugar = getHideCrackSugarCookie();

            if (hide_crack_sugar) {
                var hide_crack_sugar_json = JSON.parse(hide_crack_sugar);
                var index = hide_crack_sugar_json.indexOf(novelid);
                if (index > -1) {
                    hide_crack_sugar_json.splice(index, 1);
                }
            } else {
                hide_crack_sugar_json = [];
            }
            $('.crack_sugar_wrapper').css('display', 'flex');
        } else {
            //隐藏
            $('.display_crack_sugar_cb').prop('checked', false);
            var hide_crack_sugar = getHideCrackSugarCookie();
            if (hide_crack_sugar) {
                var hide_crack_sugar_json = JSON.parse(hide_crack_sugar);
                hide_crack_sugar_json.push(novelid);
            } else {
                hide_crack_sugar_json = [novelid];
            }
            $('.crack_sugar_wrapper').hide();
        }
        if (isWap()) {
            setcookie('hide_crack_sugar', JSON.stringify(hide_crack_sugar_json), new Date('9999-12-31 23:59:59'), '/', '.jjwxc.net');
        } else {
            setCookie('hide_crack_sugar', JSON.stringify(hide_crack_sugar_json), new Date('9999-12-31 23:59:59'), '/', '.jjwxc.net');
        }
    })
}
// 设置表情部分
function setEmojiPart(allEmojiArr, id, maxWidth=300, cssCustom = "") {
    if (typeof allEmojiArr !== 'object') {
        return false;
    }
    var emojiArr = [];
    var floatDiv = '<div class="emoji_all emoji_all_' + id + '" style="position: absolute;top:0;display:none;max-width:280px;border-radius:5px;z-index:5555;min-height: 40px;max-height: 225px;box-sizing:border-box;overflow-x:hidden;overflow-y:auto;border:1px solid #e3e5e7;background:#ffffff;">' +
        '<div class="emoji_all_' + id + '_content" style="width: 280px;padding:7px 0 0 7px;box-sizing:border-box;">';
    allEmojiArr.forEach(function (group, index) {
        group.emoji_list.forEach(function (v, i) {
            emojiArr.push(v);
            floatDiv += '<span style="margin:0 3px 8px 5px;display: inline-block;" onclick="addEmojiPic(\'' + v.emoji_name + '\', \'' + id + '\')"><img src="' + v.emoji_url + '" style="width: 28px;" alt="" title="' + v.emoji_name + '"></span>';
        })
    });
    floatDiv += '</div></div>';
    var recentlyArr = getRecentlyEmoji(emojiArr);
    assemblyRecentlyEmoji(recentlyArr, emojiArr, id, floatDiv, maxWidth, cssCustom);
}
// 设置磕糖部分
function setCrackSugarPart(allSugarArr, target_element) {
    if (typeof allSugarArr !== 'object') {
        return false;
    }
    var html = '<div class="all_crack_sugar" style="display: flex; flex-wrap: wrap; overflow: hidden; max-height: 30px;">';
    var sugar_bg = isWap() ? '#f4faf9' : '#ffffff';
    allSugarArr.forEach(function (group, index) {
        group.emoji_list.forEach(function (v, i) {
            var sugar_text = '['+v.emoji_name+']'+v.short_desc;
            html += '<div class="crack_sugar_box" style="color: #303030; padding: 2px 6px; background: '+sugar_bg+'; border-radius: 50px; display: flex; align-items: center; margin-right: 10px; margin-bottom: 10px;" onclick="addCrackSugarPic(\''+sugar_text+'\', \''+target_element+'\', \''+v.emoji_id+'\')"><img width="20px" src="' + v.emoji_url + '" alt="'+v.short_desc+'"><span>'+v.short_desc+'</span></div>';
        })
    });
    html += '</div><div>';
    if (isWap()) {
        html += '<div style="color: blue;min-width: 40px" onclick="toggleSugarExpend(this)">[展开]</div>'
    } else {
        html += '<img data-expend="0" onclick="toggleSugarExpend(this)" src="//static.jjwxc.net/images/basic/circle_down_arrow.png"  width="20px" alt="展开/收起">'
    }
    html += '</div>';
    $('.crack_sugar_wrapper.crack_sugar_'+target_element).html(html);

    //判断元素数量是否需要展示展开按钮
    if($('.all_crack_sugar').prop('scrollHeight') < 40) {
        $('.all_crack_sugar').next().hide();
    }
}
// 添加表情到评论内容
function addEmojiPic(emojiText, id) {
    emojiText = '[' + emojiText + ']';
    var myField = document.querySelector('#'+id)
    if (myField && (myField.selectionStart || myField.selectionStart === 0)) {
        var startPos = myField.selectionStart
        var endPos = myField.selectionEnd
        var content = myField.value.substring(0, startPos) + emojiText + myField.value.substring(endPos, myField.value.length);
        $('#'+id).val(content);
        myField.focus();
        myField.setSelectionRange(endPos + emojiText.length, endPos + emojiText.length)
    } else {
        $('#'+id).val($('#'+id).val() + emojiText);
    }

    // 手动触发 input 事件
    $('#' + id).trigger('input');
}
//添加磕糖到输入框
function addCrackSugarPic(text, ele_id, pic_id) {
    emojiText = text;
    var myField = document.querySelector('#'+ele_id)
    if (myField && (myField.selectionStart || myField.selectionStart === 0)) {
        var startPos = myField.selectionStart
        var endPos = myField.selectionEnd
        var content = myField.value.substring(0, startPos) + emojiText + myField.value.substring(endPos, myField.value.length);
        $('#'+ele_id).val(content);
        myField.focus();
        myField.setSelectionRange(endPos + emojiText.length, endPos + emojiText.length)
    } else {
        $('#'+ele_id).val($('#'+ele_id).val() + emojiText);
    }

    // 手动触发 input 事件
    $('#' + ele_id).trigger('input');
    $('#'+ele_id+'_crack_sugar_id').val($('#'+ele_id+'_crack_sugar_id').val()+pic_id+',');
}

// 从发送的文本中提取出最近的7个表情
function getEmojiFromContentBody(contentBody, id) {
    var readerid = getLoginReaderId();
    var storageRecentlyUseEmojiListKey = 'recently_use_emoji_list_'+readerid;
    var regex = /\[(.*?)\]/g; // 使用 'g' 标志来启用全局搜索
    var matches = contentBody.match(regex);
    var recentlyUseEmojiArr = [];
    var allEmojiArr = formatAllEmojiList(getAllEmojiList());
    if (matches) {
        // matches 将包含所有匹配的子串
        console.log("找到以下匹配项：");
        matches.forEach(function(match) {
            // 去除方括号，仅输出括号内的内容
            var matchItem = match.substring(1, match.length - 1);
            console.log('matchItem'+matchItem);
            console.dir('allEmojiArr'+allEmojiArr);
            // 不在我们的表情列表的，不进行本地数据添加
            allEmojiArr.forEach(function(v, i) {
                if (v.emoji_name == matchItem) {
                    recentlyUseEmojiArr.unshift(matchItem);
                    allEmojiArr.splice(i,1);
                }
            })
        });
        recentlyUseEmojiArr = [...new Set(recentlyUseEmojiArr)];
        // 如果数组长度超过7，移除超出部分的元素
        if (recentlyUseEmojiArr.length > 7) {
            recentlyUseEmojiArr.splice(7);
        }
        console.dir('localStory'+recentlyUseEmojiArr);
        // 先获取本地localStory 缓存，不为空，则向里面进行追加
        var recentlyUseEmojiObj = JSON.parse(localStorage.getItem(storageRecentlyUseEmojiListKey));
        if (recentlyUseEmojiObj !== null && typeof recentlyUseEmojiObj === 'object' &&  typeof recentlyUseEmojiObj != 'undefined' && recentlyUseEmojiObj !== 'null') {
            recentlyUseEmojiArr = recentlyUseEmojiArr.reverse();
            recentlyUseEmojiArr.forEach(function(v, i) {
                console.dir('getEmojiFromContentBody'+v);
                recentlyUseEmojiObj.unshift(v);
            })
            recentlyUseEmojiObj = [...new Set(recentlyUseEmojiObj)];
            localStorage.setItem(storageRecentlyUseEmojiListKey,JSON.stringify(recentlyUseEmojiObj));
        } else {
            localStorage.setItem(storageRecentlyUseEmojiListKey,JSON.stringify(recentlyUseEmojiArr));
        }
    } else {
        console.log("没有找到匹配项");
    }
    getRecentlyEmoji(allEmojiArr);
    onlyDealRecentlyElement(id);
}

// 获取全部的emoji列表
function getAllEmojiList() {
    // 从本地获取下，如果有本地缓存，缓存是最新的，name
    var storageKey = 'emoji_data_20250516';
    var emojiArr = [];
    if (typeof localStorage === 'object') {
        var valObj = JSON.parse(localStorage.getItem(storageKey));
        if (valObj && typeof (valObj) == 'object' && valObj.dateline) {
            var currentTime =  new Date().getTime();
            // 10分钟之内不重新请求
            //if (new Date().getTime() - valObj.dateline < 600000) {
                return valObj.data;
            //}
        }
    }
    // 从接口获取
    $.ajax({
        url: "//www.jjwxc.net/app.jjwxc/Pc/Emoji/getList?jsonp=emojiCallback",
        type: "GET",
        async: true,
        cache: true,
        data: {},
        dataType: "jsonp",
        jsonpCallback: 'emojiCallback',
        success: function(data) {
            if(data.code === '200') {
                var currentTime =  new Date().getTime();
                typeof localStorage === 'object' && localStorage.setItem(storageKey,JSON.stringify({data:data.data, dateline:currentTime}));
                return data.data;
            } else {
                console.dir(data)
            }
        },
        error:function(e, d, r){
            // 打印数据
            console.dir(e)
            console.log(d, r)
        }
    });
}
//获取磕糖列表
function getAllCrackSugarList(func) {
    // 从本地获取下，如果有本地缓存，缓存是最新的，name
    var storageKey = 'crack_sugar_data';
    if (typeof localStorage === 'object') {
        var valObj = JSON.parse(localStorage.getItem(storageKey));
        if (valObj && typeof (valObj) == 'object' && valObj.dateline) {
            var currentTime =  new Date().getTime();
            // 10分钟之内不重新请求
            if (new Date().getTime() - valObj.dateline < 600000) {
                return func(valObj.data);
            }
        }
    }
    // 从接口获取
    $.ajax({
        url: "//www.jjwxc.net/app.jjwxc/Pc/Emoji/getCrackSugarList?jsonp=sugarCallback",
        type: "GET",
        async: true,
        cache: true,
        data: {},
        dataType: "jsonp",
        jsonpCallback: 'sugarCallback',
        success: function(data) {
            if(data.code === '200') {
                var currentTime =  new Date().getTime();
                typeof localStorage === 'object' && localStorage.setItem(storageKey,JSON.stringify({data:data.data, dateline:currentTime}));
                return func(data.data);
            } else {
                //console.dir(data)
            }
        },
        error:function(e){
            // 打印数据
            //console.dir(e)
        }
    });
}
// 格式化emoji列表
function formatAllEmojiList(allEmojiArr) {
    var emojiArr = [];
    allEmojiArr= typeof allEmojiArr === 'undefined' ? [] : allEmojiArr;
    allEmojiArr.forEach(function (group, index) {
        group.emoji_list.forEach(function (v, i) {
            emojiArr.push(v);
        })
    });
    return emojiArr;
}
// 获取用户使用的最近7个表情（输入框下的7个表情取用户最近使用的7个emoji，记在本地即可，如无数据、丢失数，据或不够7个，则从全部可使用的表情中随机取，补足7个。
function getRecentlyEmoji(emojiArr) {
    var readerid = getLoginReaderId();
    var storageRecentlyUseEmojiListKey = 'recently_use_emoji_list_'+readerid;
    var recentlyUseEmojiObj = JSON.parse(localStorage.getItem(storageRecentlyUseEmojiListKey));
    console.dir('recentlyUseEmojiObj'+recentlyUseEmojiObj);
    // 默认需要获取的随机头像数量
    var needGetRandEmojiNum = 7;
    var recentlyArr = [];
    if  (recentlyUseEmojiObj !== null && typeof recentlyUseEmojiObj === 'object' &&  typeof recentlyUseEmojiObj != 'undefined' && recentlyUseEmojiObj !== 'null') {
        // 获取最近使用的7个表情
        needGetRandEmojiNum = 7 - recentlyUseEmojiObj.length;
        if (emojiArr.length) {
            recentlyUseEmojiObj.forEach(function(v, i) {
                let tmpName = v.replace('[', '');
                tmpName = tmpName.replace(']', '');
                // alert(tmpName);
                emojiArr.forEach(function(v, i) {
                    if (v.emoji_name == tmpName) {
                        if (recentlyArr.length <7) {
                            recentlyArr.push(emojiArr[i]);
                            emojiArr.splice(i,1);
                        }
                    }
                })
            })
        }
    }
    console.dir('recently'+recentlyArr);
    for(var i=1;i<=needGetRandEmojiNum;i++) {
        var tempIndex = Math.floor(Math.random()*emojiArr.length);
        recentlyArr.push(emojiArr[tempIndex]);
        emojiArr.splice(tempIndex,1);
    }
    return recentlyArr;
}
// 最近常用到表情包html元素拼接
function recentlyEmojiHtml(recentlyArr, id = ''){
    var htmlStr = '';
    recentlyArr.forEach(function(v,i){
        if(v!==undefined){
            htmlStr += '<span style="margin:0 4px 0 3px" onclick="addEmojiPic(\''+v.emoji_name+'\', \''+id+'\')"><img src="'+v.emoji_url+'" style="width: 30px;" alt="" title="' + v.emoji_name + '"></span>';
        }
    })
    return htmlStr;
}
// 仅仅替换最近7个表情
function onlyDealRecentlyElement(id) {
    var recentlyEmojiList = getRecentlyEmoji(formatAllEmojiList(getAllEmojiList()));
    return recentlyEmojiHtml(recentlyEmojiList, id);
}
// 组装最近常用到用户使用表情列表
function assemblyRecentlyEmoji(recentlyArr, emojiArr, id, floatDiv, maxWidth = 300, cssCustom = "") {
    // 随机取指定个数的表情
    if (emojiArr.length) {
        var upPath = '//static.jjwxc.net/images/basic/circle_up_arrow.png';
        var downPath = '//static.jjwxc.net/images/basic/circle_down_arrow.png';
        var htmlStr = '<div class="recent_emoji_wrapper" style="display:flex;align-items: center;margin-top:5px;'+cssCustom+'max-width:'+maxWidth+'px;"><div style="display: inline-block;position: relative;width: 280px;"><div class="recently_list">';
        htmlStr += recentlyEmojiHtml(recentlyArr, id);
        htmlStr +=  '</div>' + floatDiv + '</div>';
        htmlStr += '<img onclick="$(this).attr(\'title\') === \'展开\' ? ($(this).attr(\'title\',\'收起\'),$(\'.emoji_all_'+id+'\').show(),$(\'.recently_list\').show(),$(this).attr(\'src\',\''+upPath+'\')) : ($(this).attr(\'title\',\'展开\'),$(\'.emoji_all_'+id+'\').hide(),$(\'.recently_list\').show(),$(this).attr(\'src\',\''+downPath+'\'))" ' +
            'src="'+downPath+'" data-expend="0" width="20px" title="展开" alt="expend"></div>'
        $('#'+id).after(htmlStr);
        $('body').append('<style>.emoji_all::-webkit-scrollbar { width: 0;  height: 0;}</style>');
    }
}
//展开收起磕糖面板
function toggleSugarExpend(that) {
    var now_status = $(that).data('expend');
    var is_wap = isWap();
    if (now_status == 0) {
        $(that).parent().siblings('.all_crack_sugar').css('maxHeight', 'unset');
        $(that).data('expend', 1);
        if (is_wap) {
            $(that).html('[收起]');
        } else {
            $(that).attr('src', '//static.jjwxc.net/images/basic/circle_up_arrow.png');
        }
    } else {
        $(that).data('expend', 0);
        $(that).parent().siblings('.all_crack_sugar').css('maxHeight', '30px');
        if (is_wap) {
            $(that).html('[展开]');
        } else {
            $(that).attr('src', '//static.jjwxc.net/images/basic/circle_down_arrow.png');
        }
    }

}
// 获取登录用户的readerid
function getLoginReaderId() {
    if (isWap()) {
        var sidInfo = getcookie('sid').split("_");
        return ~~sidInfo[0];
    } else {
        return ~~getCookie('readerid');
    }
}

// 验证是否是wap请求
function isWap() {
    // 获取当前页面的完整URL
    var currentUrl = window.location.href;
    var wapDomainArr = ['wap.jjwxc.com', 'wap.jjwxc.net', 'm.jjwxc.net', 'm.jjwxc.com'];
    // 提取域名
    var domain = extractDomain(currentUrl);
    // 判断域名是否在列表中
    if ($.inArray(domain, wapDomainArr) !== -1) {
        return true;
    } else {
        return false;
    }
}

// 辅助函数，用于从URL中提取域名
function extractDomain(url) {
    var domain;
    // 使用正则表达式提取域名
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    // 去除端口（如果有的话）
    domain = domain.split(':')[0];
    return domain;
}

// 火狐浏览器兼容
function isFirefox() {
    return typeof window !== 'undefined' && /firefox/i.test(navigator.userAgent);
}
//判断是否打开磕糖功能
function isDisplayCrackSugar(target_novelid) {
    var ele = $('.display_crack_sugar_cb');
    if(ele.length === 0 && target_novelid === undefined) {
        return false;
    }
    if (target_novelid === undefined) {
        var novelid = ele.val();
    } else {
        var novelid = target_novelid;
    }

    var hide_crack_sugar = getHideCrackSugarCookie();

    if (hide_crack_sugar) {
        var hide_crack_sugar_json = JSON.parse(hide_crack_sugar);
        var is_close = hide_crack_sugar_json.indexOf(novelid) >= 0;
    }
    if (ele.length > 0) {
        ele.prop('checked', !is_close);
    }
    if (is_close) {
        $('.crack_sugar_wrapper').hide();
    }
    return !is_close;
}

function getHideCrackSugarCookie() {
    if (isWap()) {
        return getcookie('hide_crack_sugar');
    } else {
        return getCookie('hide_crack_sugar')
    }
}
