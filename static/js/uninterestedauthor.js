$(document).ready(function() {
    var baseurl = '//m.jjwxc.net/app.jjwxc/UninterestedAuthor';
    var api_url = window.location.origin + '/app.jjwxc/Pc/Uninterested';

    var uninterested_reader_key = 'uninterestedreaderdata';

    $.jsonAjax = async function(settings) {
        if (typeof settings['success']=="function") {
            var successCallback = settings.success;
            delete settings.success;
        }
        if (typeof settings['error']=="function") {
            var errorCallback = settings.error;
            delete settings.error;
        }
        settings.dataType = 'json';
        settings.complete = function(jqXHR) {
            var ignoreError = typeof settings.ignoreError!=="undefined"&&settings.ignoreError;
            if (typeof jqXHR.responseJSON=='undefined'&& typeof JSON=="object"&& typeof jqXHR.responseText=="string") {
                jqXHR.responseJSON = JSON.parse(jqXHR.responseText);
            }
            if (typeof jqXHR.responseJSON=='undefined') {
                if (!ignoreError) {
                    alert('json error');
                } else {
                    errorCallback({'message': 'json error', 'status': 0})
                }
                return
            }
            var data = jqXHR.responseJSON;
            var defaultAction = true;
            if (typeof data.status === 'undefined' && typeof data.code !== 'undefined') {
                data.status = data.code;
            }
            if (data.status==200) {
                if (typeof successCallback=="function") {
                    defaultAction = successCallback(data);
                }
                if (defaultAction) {
                    window.location.reload();
                }

            } else {
                if (data.status==100&& typeof errorCallback=="function") {
                    defaultAction = errorCallback(data);
                }
                if (!ignoreError&&defaultAction) {
                    var content = '('+data.status+'.'+data.code+') '+data.message;
                    alert(content);
                }

            }
        };
        return await $.ajax(settings)

    }

    var useStorage = (typeof JSON=='object'&& typeof sessionStorage=='object');

    var loginInfo = getLoginInfo();
    if (location.pathname === '/comment.php' ||location.pathname === '/novelreview.php' || /\/review\/\d+\//.test(location.pathname)) {
        getUninterestReaderData().then(hideUninterestedReaderComment);
    }

    if ($('.uninterested-reader').length > 0) {
        getUninterestReaderData().then(bindUninterestedReader);
    }

    //��ȡ������Ȥ��������
    async function getUninterestReaderData() {
        //var loginInfo = getLoginInfo();
        if (!loginInfo.readerid) {
            return null;
        }
        console.log('getUninterestReaderData');
        var data = null;
        if (useStorage) {
            data = JSON.parse(sessionStorage.getItem(uninterested_reader_key));
            if (!data || typeof data!='object'|| typeof data.readerid=="undefined"||data.readerid!=loginInfo.readerid) {
                data = null;
            }
        }

        if (!data) {
            data = {readers: [], readerid: loginInfo.readerid};
            await $.jsonAjax({
                url: '//m.jjwxc.net/app.jjwxc/UninterestedReader/getReaderData',
                data: {'sign': loginInfo.sign, source: loginInfo.source},
                method: 'get',
                dataType: 'json',
                ignoreError: true,
                success: function(json) {
                    if (json.status != 200) {
                        return;
                    }
                    //console.log(json);
                    if (json.data.readerid != loginInfo.readerid) {
                        return;
                    }
                    //console.log(json.data.readers);
                    data.readers = json.data.readers;
                    useStorage&&sessionStorage.setItem(uninterested_reader_key, JSON.stringify(data));
                },
                error: function(json) {
                    return null;
                }
            });
        } else {
            useStorage&&sessionStorage.setItem(uninterested_reader_key, JSON.stringify(data));
        }

        return data;
    }
    //��Ӳ�����Ȥ����
    function bindUninterestedReader(data) {

        $('.uninterested-reader').click(function() {
            if (!loginInfo.readerid) {
                if (typeof show_login === 'function') {
                    show_login();
                } else {
                    alert("��δ���룬�������ٽ��в���");
                }
                return false;
            }
            var readerid = $(this).data('readerid');
            var novelid = $(this).data('novelid');
            var commentid = $(this).data('commentid');
            var replyid = $(this).data('replyid');

            if (!readerid || !novelid || !commentid) {
                return false;
            }
            if (data.readers && data.readers.indexOf(readerid) >= 0) {
                return false;
            }
           // return false;
            var comment_author = !$(this).data('nickname') ? 'TA' : $(this).data('nickname');
            var message = 'ȷ�����ٿ�'+comment_author+'�����ۺ���������𣿽����û����벻�ٿ�TA�б�����������ҵĽ���-<a style="color: blue" href="//my.jjwxc.net/backend/user_setting.php">��������</a>���й���';
            var block = $('<div>'+message+'<div class="buttons"><button onclick="$.unblockUI()">ȡ��</button><button class="add_author">ȷ��</button></div></div>')
            block.find('.add_author').click(function() {
                $.jsonAjax({
                    url: '//m.jjwxc.net/app.jjwxc/UninterestedReader/addReader',
                    data: {'sign': loginInfo.sign, readerid: readerid,novelid: novelid, commentid: commentid, replyid: !replyid ? 0 : replyid, source: loginInfo.source},
                    method: 'post',
                    dataType: 'json',
                    ignoreError: true,
                    success: function(json) {
                        if (json.status != 200) {
                            return;
                        } else {
                            data.readers.push(readerid);
                            useStorage&&sessionStorage.setItem(uninterested_reader_key, JSON.stringify(data));
                            location.reload();
                        }

                    },
                    error: function(json) {
                        return null;
                    }
                });
            });
            $.blockUI(block);
        });

    }
    //ɾ��������Ȥ����
    function delUninterestedReader(readerid) {
        if (!readerid) {
            alert("��ѡ��Ҫ�Ƴ�����TA���û���");
        }
        $.jsonAjax({
            url: '//m.jjwxc.net/app.jjwxc/UninterestedReader/deleteReader',
            data: {'sign': loginInfo.sign, readerid: readerid, source: loginInfo.source},
            method: 'post',
            dataType: 'json',
            ignoreError: true,
            success: function(json) {
                if (json.status != 200) {
                    alert(json.message);
                    return;
                } else {
                    if (useStorage) {
                        var data = JSON.parse(sessionStorage.getItem(uninterested_reader_key));
                        if (data && data.readers && data.readers.indexOf(readerid) >= 0) {
                            data.splice(data.readers.indexOf(readerid), 1);
                            sessionStorage.setItem(uninterested_reader_key, JSON.stringify(data));
                        }
                    }

                    location.reload();
                }

            },
            error: function(json) {
                return null;
            }
        });
    }

    /**
     * �������۷���
     * @param res
     * @returns {boolean}
     */
    function hideUninterestedReaderComment(res)  {
        if (!loginInfo.readerid) {
            return false;
        }
        if (!res || !res.readers || res.length === 0) {
            return false;
        }
        console.log('hideUninterestedReaderComment');
        data = res.readers;
        var getParamFromUrl = function(param, strHref) {
            var strReturn = "";
            if (strHref.indexOf("?")>-1) {  // �ж� ? �� strHref �е�һ�γ��ֵ�λ��
                var strQueryString = strHref.substr(strHref.indexOf("?")).toLowerCase();
                var aQueryString = strQueryString.split("&");
                for (var iParam = 0; iParam<aQueryString.length; iParam++) {
                    if (aQueryString[iParam].indexOf(param+"=")>-1) {
                        var aParam = aQueryString[iParam].split("=");
                        strReturn = aParam[1];
                        break;
                    }
                }
            }
            return strReturn;
        }
        //console.log(12221)
        var hideNum = 0;
        if (location.pathname === '/comment.php') {
            var novelid = getURLParam('novelid');
            $('#comments_' + novelid + ' .readtd').each(function() {
                //��������(�����) + ����
                //var comment_text = $(this).find('span[class="bigtext"]').text() + $(this).find('span[id^="mormalcomment_"]').text();
                var readerid = $(this).find('span[id^="foldlingauthor_"]').data('readerid');
                //console.log(readerid);
                if (readerid && data.indexOf(readerid) >= 0) {
                    hideNum++;
                    $(this).parent().remove();
                    return true;
                }

                //�ظ�
                if ($(this).find('.replycontent').children('.replybody').length > 0) {
                    $(this).find('.replycontent').children('.replybody').each(function() {
                        var readerid = $(this).find('span[id^="foldlingauthor_"]').data('readerid');
                        if (readerid && data.indexOf(readerid) >= 0) {
                            //console.log($(this).parent().attr('id'), filterWord.words[i], reply_text, nickname_text);
                            $(this).parent().remove();
                            return true;
                        }

                    });
                }
            });

        }else if(location.pathname === '/novelreview.php'){
            $(".novelreview_item").each(function() {
                var readerid = $(this).data('readerid').toString();
                console.log(readerid)
                if (readerid && data.indexOf(readerid) >= 0) {
                    $(this).remove();
                    return true;
                }
            });
        } else if(/(wap|m)\.jjwxc\.(net|com)/.test(location.host)){
            //console.log(111)
            if ($('#comment_list_new .comment_list_style li').length > 1) { //�½�Ŀ¼ҳ
                $('#comment_list_new > .comment_list_style li[id^="mormalcomment_"]').each(function() {
                    var readerid = $(this).data('readerid').toString();
                    if (readerid && data.indexOf(readerid) >= 0) {
                        $(this).remove();
                        return true;
                    }

                });
            } else if($('.comment_list_style li').length > 0) { //����ҳ
                $('.comment_list_style li span[id^="mormalcomment_"]').each(function(){
                    var readerid = $(this).data('readerid').toString();
                    if (readerid && data.indexOf(readerid) >= 0) {
                        $(this).remove();
                        return true;
                    }

                });
            }
            if($('.novelreview_item').length > 0){
                $('.novelreview_item').each(function(){
                    var readerid = $(this).data('readerid').toString();
                    console.log(readerid)
                    if (readerid && data.indexOf(readerid) >= 0) {
                        $(this).remove();
                        return true;
                    }
                })
            }
        } else {
            $('#comment_list .readtd').each(function() {
                //����
                var comment_reader_url = $(this).find('span[id^="foldlingauthor_"] > a').eq(0).attr('href');

                var readerid = comment_reader_url && getParamFromUrl('readerid', comment_reader_url);
                //console.log(comment_reader_url, readerid);
                if (readerid && data.indexOf(readerid) >= 0) {
                    hideNum++;
                    $(this).parent().remove();
                    return true;
                }

                //�ظ�
                if ($(this).find('.replycontent').children('.replybody').length > 0) {
                    $(this).find('.replycontent').children('.replybody').each(function() {
                        var comment_reader_url = $(this).find('span[id^="foldlingreplyauthor_"] > a').eq(0).attr('href');
                        var readerid = comment_reader_url && getParamFromUrl('readerid', comment_reader_url);
                        if (readerid && data.indexOf(readerid) >= 0) {
                            hideNum++;
                            $(this).remove();
                            return true;
                        }

                    });
                }
                $('.reviewlist_item').each(function() {
                    var readerid = $(this).data('readerid').toString();
                    if (readerid && data.indexOf(readerid) >= 0) {
                        $(this).remove();
                        return true;
                    }
                });
            });
        }
        if ($('#hide_comment_replay').length) {
            if (hideNum) {
                $('#hide_comment_replay_num').html(parseInt($('#hide_comment_replay_num').html()) + hideNum);
                $('#hide_comment_replay').show();
            }
        }
    }

    $.extend(window, {
        uninterested_reader: {
            getUninterestReaderData: getUninterestReaderData,
            hideUninterestedReaderComment: hideUninterestedReaderComment,
            bindUninterestedReader: bindUninterestedReader,
            delUninterestedReader: delUninterestedReader
        }
    })

    /**
     * ��ȡ�ͻ���
     * @returns
     */
    function getLoginInfo() {
        var token, readerid, source;
        if (typeof getcookie=='function') {
            token = getcookie('sid');
            readerid = token.split('_')[0];
            source = 'wap';
        }
        if (typeof readerid=='undefined'&& typeof getCookie=='function') {
            readerid = getCookie('readerid');
            var ubuntu = getCookie('ubuntu');
            token = readerid+'_'+ubuntu;
            source = 'pc';
        }
        if (typeof readerid!='undefined') {
            readerid = parseInt(readerid);
        }
        var sign = CryptoJS.DES.encrypt(JSON.stringify({'token': token}), CryptoJS.enc.Utf8.parse('RAFMYjun1'), {
            iv: CryptoJS.enc.Utf8.parse('Q2cWq4')
        }).toString();

        return {'readerid': parseInt(readerid), 'token': token, 'sign': sign, 'source': source};
    }

    if ($('.uninterested-author').length<=0) {
        return;
    }

    var authordata = $('.uninterested-author').data();
    if (!loginInfo.readerid) {
        $('.uninterested-author').bind('click', function() {
            alert('���ȵ���')
        });
        return;
    }

    $('.uninterested-author').bind('click', function() {
        alert('���ݻ�ȡ��δ��ɣ����Ժ��ˢ��ҳ�������')
    });

    var storageKey = 'uninterestedauthordata';

    var changeauthordata = function(data) {
        $('.uninterested-author').unbind('click');
        var uninterested_author = typeof data.authors[authordata.authorid]!='undefined';
        var uninterested_novel = (typeof authordata.novelid !== 'undefined' && typeof data.novels !== 'undefined' && typeof data.novels[authordata.novelid]!=='undefined');//����ר�����ﷵ��false
        if (uninterested_author || uninterested_novel) {
            var now = new Date();
            $('.uninterested-author.broken-heart').show()
            $('.uninterested-author').click(function() {
                var startdate;
                var message,author_message,novel_message;
                var reasonstring, reason_string_author,reason_string_novel;
                var forbid_opt_author_time = false;
                var forbid_opt_novel_time = false
                // �����߲�����Ȥ��30���ڲ��ܲ���
                if (uninterested_author) {
                    startdate = new Date(parseInt(data.authors[authordata.authorid].time)*1000);
                    forbid_opt_author_time = now.getTime()-startdate.getTime()<30*86400*1000;
                    reason_string_author = "ԭ���ǩ:"+data.authors[authordata.authorid].tags.join('��');
                    if (data.authors[authordata.authorid].note) {
                        reason_string_author += ' ��ע��'+data.authors[authordata.authorid].note;
                    }
                    reasonstring = reason_string_author;
                }
                // �����²�����Ȥ��30���ڲ��ܲ���
                if (uninterested_novel) {
                    startdate = new Date(parseInt(data.novels[authordata.novelid].time)*1000);
                    forbid_opt_novel_time = now.getTime()-startdate.getTime()<30*86400*1000;
                    reason_string_novel = "ԭ���ǩ:"+data.novels[authordata.novelid].tags.join('��');
                    if (data.novels[authordata.novelid].note) {
                        reason_string_novel += ' ��ע��'+data.novels[authordata.novelid].note;
                    }
                    reasonstring = reason_string_novel;
                }
                if (forbid_opt_author_time) {
                    author_message = '��������'+authordata.authorname+'����Ϊ������Ȥ�������в���30�죬��ʱ�޷�������';
                    var block = $('<div>'+author_message+'<br/>'+reason_string_author+'<div class="buttons"><button onclick="$.unblockUI()">��֪����</button></div></div>')
                } else if (forbid_opt_novel_time) {
                    novel_message = '�������¡�'+authordata.novelname+'������Ϊ������Ȥ�������в���30�죬��ʱ�޷�������';
                    var block = $('<div>'+novel_message+'<br/>'+reason_string_novel+'<div class="buttons"><button onclick="$.unblockUI()">��֪����</button></div></div>')
                } else {
                    var only_author = false;
                    if (uninterested_novel && !forbid_opt_novel_time) {
                        // ���Բ������£�����չʾ����
                        var checkbox_str = '';
                        if (uninterested_author && !forbid_opt_author_time) {
                            // ���Բ������ߺ����£�����ѡȡ������
                            checkbox_str = '<br><label style="display:inline-block;padding:10px 0 5px;"><input type="checkbox" name="remove_author" value="1" style="vertical-align:middle;margin-top:-2px;"/>ͬʱȡ�������ߵĲ�����Ȥ</label>'
                        }
                        message = 'ȷ�ϻָ������¡�'+authordata.novelname+'������Ȥ��' + checkbox_str;
                    } else {
                        // ��������ȡ�����߲�����Ȥ
                        message = 'ȷ�ϻָ�������'+authordata.authorname+'����Ȥ��';
                        only_author = true;
                    }
                    var block = $('<div style="text-align: left;">'+message+'<div style="margin: 5px 0 5px;">'+reasonstring+'</div><div class="buttons" style="text-align:center;"><button onclick="$.unblockUI()">ȡ��</button><button class="removeauthor">�ų�</button></div></div>')
                    block.find('.removeauthor').click(function() {
                        $.jsonAjax({
                            url: api_url+'/delUninterestedNovel',
                            method: 'post',
                            data: {'sign': loginInfo.sign, 'authorid': authordata.authorid, 'novelid': typeof authordata.novelid=='undefined' ? '' : authordata.novelid,source: loginInfo.source, 'remove_author': (block.find('[name="remove_author"]').is(':checked') || only_author) ? 1 : 0},
                            dataType: 'json',
                            success: function(json) {
                                alert('�����ɹ�')
                                if (typeof json.data.remove_author !== 'undefined' && parseInt(json.data.remove_author)) {
                                    delete data.authors[authordata.authorid]
                                }
                                if (typeof json.data.remove_novel !== 'undefined' && parseInt(json.data.remove_novel)) {
                                    delete data.novels[authordata.novelid]
                                }
                                $.unblockUI();
                                updateLocalStorage(data);
                                return true;
                            },
                            error: function(json) {
                                alert(json.message);
                                useStorage&&sessionStorage.removeItem(storageKey)
                                window.location.reload()
                            }
                        });
                    })
                }
                $.blockUI(block);
            })
            var uninterested_type = uninterested_author ? '����' : '����';
            $('#comment_list').parent().html('<td width="760" valign="top" align="center" style="width:760px;word-break:break-all;word-wrap:break-word">��Ϊ���رղ�����Ȥ��'+uninterested_type+'��������</td>');
            $('#comment_list_new').after('<div  style="padding-left:10px" >��Ϊ���رղ�����Ȥ��'+uninterested_type+'��������</div>');
            $('#comment_list_new').remove();
            $('.uninterested-hide').remove();
        } else {
            $('.uninterested-author.broken-heart').hide()
            $('.uninterested-author').click(function() {
                if (typeof authordata.novelname === 'undefined') {
                    authordata.novelname = $('span[itemprop="articleSection"]').length ? $('span[itemprop="articleSection"]').text() : '';
                }
                gettpl('addauthor', authordata).then(function(tpl) {
                    var tags = {};
                    tpl.find('.addtag').on('click', function() {
                        var tagtextArray = $('.newtag').val().split(' ');
                        $.each(tagtextArray, function(k, tagtext) {
                            if (Object.keys(tags).length>=4) {
                                alert('���ֻ�����4����ǩ');
                                return;
                            }
                            if (tagtext.length<=0) {
                                return;
                            }
                            tagtext = tagtext.substring(0, 4);
                            if (typeof tags[tagtext]!="undefined") {
                                return;
                            }
                            tags[tagtext] = 1;

                            var tagspan = $('<span class="tag"><input type="hidden" name="tags[]" value="'+tagtext+'">'+tagtext+'<span class="removetag">x</span></span>');
                            tagspan.find('.removetag').click(function() {
                                tagspan.remove();
                                delete tags[tagtext];
                            });
                            $('.tags').append(tagspan);
                        })
                        $('.newtag').val('');
                    })
                    tpl.find('form').on('submit', function() {
                        var formdata = $(this).serializeArray()
                        formdata.push({name: 'sign', value: loginInfo.sign})
                        formdata.push({name: 'referer', value: window.location.href})
                        $.jsonAjax({
                            url: api_url+'/addUninterestedNovel',
                            method: 'post',
                            data: formdata,
                            dataType: 'json',
                            success: function(json) {
                                alert('�����ɹ�')
                                if (typeof json.data['author_data'] !== 'undefined' || typeof json.data['novel_data'] !== 'undefined') {
                                    if (typeof json.data['author_data'] !== 'undefined') {
                                        data.authors[authordata.authorid] = json.data['author_data'];
                                    }
                                    if (typeof json.data['novel_data'] !== 'undefined') {
                                        data.novels[authordata.novelid] = json.data['novel_data'];
                                    }
                                } else {
                                    data.authors[authordata.authorid] = json.data;
                                }
                                updateLocalStorage(data);
                                $.unblockUI();
                                return true;
                            },
                            error: function(json) {
                                alert(json.message);
                                useStorage&&sessionStorage.removeItem(storageKey)
                                window.location.reload();
                            }
                        })
                        return false;
                    })
                    $.blockUI(tpl, {'width': '600px', 'margin': '0 -300px', 'left': '50%', 'position': 'absolute'});
                })
            })
        }
    };
    getuninterestauthordata().then(changeauthordata);

    function updateLocalStorage(data) {
        useStorage&&sessionStorage.setItem(storageKey, JSON.stringify(data));
    }

    async function getuninterestauthordata() {
        var data = null;
        if (useStorage) {
            data = JSON.parse(sessionStorage.getItem(storageKey));
            if (!data|| typeof data!='object'|| typeof data.readerid=="undefined"||data.readerid!=loginInfo.readerid) {
                data = null;
            }
        }
        var now = new Date();
        // �û��ں�̨Ҳ�����������ﳬ��10����Ҳ�������»�ȡ��
        if (!data || typeof data.cache_time === 'undefined' || (now.getTime() - data.cache_time) > 10*60*1000) {
            data = {authors: {}, readerid: loginInfo.readerid, novels:{}};
            await $.jsonAjax({
                url: baseurl+'/getArrayByReaderSign',
                data: {'sign': loginInfo.sign, source: loginInfo.source},
                method: 'get',
                dataType: 'json',
                ignoreError: true,
                success: function(json) {
                    if (json.status!=200) {
                        return;
                    }
                    if (json.data.readerid!=loginInfo.readerid) {
                        return;
                    }

                    $.each(json.data.authors, function(k, v) {
                        data.authors[v.authorid] = v;
                    });
                    $.each(json.data.novels, function(k, v) {
                        data.novels[v.novelid] = v;
                    });
                    data.cache_time = now.getTime();
                },
                error: function(json) {
                    $('.uninterested-author').unbind('click');
                    $('.uninterested-author').bind('click', function() {
                        alert(json.message)
                    });
                    return false;
                }
            });
        }
        updateLocalStorage(data);
        return data;
    }

    async function gettpl(tplname, data) {
        var tpl = null;
        var ver = '20250710';
        var tplkey = ver+'_'+tplname;
        if (useStorage) {
            tpl = sessionStorage.getItem(tplkey);
        }
        if (!tpl) {
            await $.ajax({
                url: baseurl+'/getBlockTpl',
                data: {'tplname': tplname, 'ver': ver},
                method: 'get',
                dataType: 'text',
                success: function(text) {
                    tpl = text;
                    useStorage&&sessionStorage.setItem(tplkey, tpl);
                }
            });
        }

        return $((new MyTemplate(tpl)).render(data));
    }


})