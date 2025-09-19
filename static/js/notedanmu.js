var icon_type_sp = 4;
var load_data = false;
var note_novelid, note_chapterid;
var danmu_data = [];
var danmu_is_marquee = false
var timer;
var rendered = false;
function getDanmu(novelid, chapterid) {
    note_novelid = novelid;
    note_chapterid = chapterid;
    if (chapterid === undefined || !chapterid || chapterid < 0) {
        return ;
    }
    if (!isDisplay(novelid, chapterid)) {
        console.log('hide zuohua');
        return;
    }

    //��������չʾ����Ⱦ
    $(window).scroll(
        throttle(function() {
            if (isDanmuWrapperShow()&&rendered===false) {
                rendered = true;
                $.ajax({
                    url: "//m.jjwxc.net/app.jjwxc/Pc/Chapters/getNoteData",
                    type: "get",
                    data: {"novelid": novelid, "chapterid": chapterid},
                    success: function(res) {
                        load_data = true;
                        if (res.code == 200) {
                            var data = res.data;
                            $('.danmu_total_str').html(data.prize_info.prize_total_str);
                            $('.note_main').html($('#note_str').html());
                            if (data.prize_info.prize_arr.length === 0) {
                                $('#danmu_main').remove();
                                $('.marquee').remove();
                            } else {
                                var u = navigator.userAgent;
                                var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
                                danmu_data = data.prize_info.prize_arr;
                                if (isIOS && ["wap.jjwxc.com", "wap.jjwxc.net", "m.jjwxc.com", "m.jjwxc.net", "m-static.jjwxc.net"].indexOf(location.host) >= 0) {
                                    $('#danmu_main').remove();
                                    danmu_is_marquee = true;
                                    renderQueue(data.prize_info.prize_arr);
                                } else {
                                    $('.marquee').remove();
                                    renderDanmu(data.prize_info.prize_arr);
                                }
                            }
                            if (data.prize_info.prize_total_str == '' ) {
                                $('.danmu_total_str').remove();
                            }
                            if (data.recommend_info.novel.length > 0) {
                                $('.recommend_novel_tip').html(data.recommend_info.tip);
                                data.recommend_info.novel.forEach(function(val) {
                                    var is_wap = false;
                                    if (["wap.jjwxc.com", "wap.jjwxc.net", "m.jjwxc.com", "m.jjwxc.net", "m-static.jjwxc.net"].indexOf(location.host) >= 0) {
                                        book_url = window.location.hostname+'/book2/'+val.novelid;
                                        is_wap = true;
                                    } else {
                                        book_url = window.location.hostname+'/onebook.php?novelid='+val.novelid;
                                    }
                                    var nameFontSize = is_wap ? '' : 'font-size:16px;';
                                    var classFontSize = is_wap ? '' : 'font-size:15px;';
                                    var html = '<span class="one_rec_novel">'+
                                        '<div class="rec_novel_cover">'+
                                        '<a href="//'+book_url+'" target="_blank"><img class="noveldefaultimage"  src="'+val.novel_cover+'" _src="'+val.local_img+'" alt="" referrerpolicy="no-referrer"></a>'+
                                        '</div>'+
                                        '<div class="rec_novel_info">'+
                                        '<div class="rec_novel_name" style="'+nameFontSize+'"><a href="//'+book_url+'" target="_blank">'+val.novelname+'</a></div>';
                                    if (!is_wap) {
                                        html += '<div class="rec_novel_class" style="'+classFontSize+'"><a href="//'+book_url+'" target="_blank">'+val.novelclass_str+'</a></div>'+
                                            '<div class="rec_novel_novelintro"><a href="//'+book_url+'" target="_blank">'+val.novelintroshort+'</a></div>';
                                        if (val.tags) {
                                            html += '<div style="color: #FF5656;font-size: 12px;">��ǩ��'+val.tags_link_str+'</div>';
                                        }
                                    }

                                    html += '</div></span>';
                                    $('.rec_novel').append(html);
                                });
                            }
                        }
                    },
                    error: function() {
                        load_data = true;
                    }
                });
            }
        }, 100)
    );

}

/**
 * ��������
 * @param {Function} func - Ҫִ�еĺ���
 * @param {number} wait - �ȴ�ʱ�䣨���룩
 * @returns {Function} - ��װ��Ľ�������
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

function renderQueue(wish_list) {
    for (var i in wish_list) {
        var one_danmu = wish_list[i];
        if (one_danmu['prize_type'] == 'kingticket') {
            var class_name = 'danmu_king';
            if (one_danmu['icon_type'] == icon_type_sp) {
                class_name = 'danmu_king_sp';
            }
            $('.marquee').eq(i%2).find('marquee').append('<div style="display: inline-block;" class="danmu '+class_name+'"><div><img class="king_sp_img" src="//static.jjwxc.net/images/kingticket/king_sp.png?v=0322" alt="">'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/kingtickets_'+one_danmu['icon_type']+'.gif?var=20140327" alt="">'+(one_danmu['num'] > 1 ? ' ��'+one_danmu['num'] : '')+'</div></div>')
           // $('.marquee').eq(i%2).find('marquee').append('<div style="display: inline-block; margin-right: 14px">'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/kingtickets_'+one_danmu['icon_type']+'.gif?var=20140327" alt="">'+(one_danmu['num'] > 1 ? ' ��'+one_danmu['num'] : '')+'</div>')
        } else {
            $('.marquee').eq(i%2).find('marquee').append('<div style="display: inline-block;" class="danmu danmu_nutrition"><div>'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/nutrition_icon.png?var=20140327" alt=""> ��'+one_danmu['num']+'</div></div>')
            //$('.marquee').eq(i%2).find('marquee').append('<div  style="display: inline-block; margin-right: 14px">'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/nutrition_icon.png?var=20140327" alt=""> ��'+one_danmu['num']+'</div>')
        }

    }

}

function isDanmuWrapperShow () {
    if ($('#note_danmu_wrapper').length === 0) {
        return false;
    }
    var bound = $('#note_danmu_wrapper')[0].getBoundingClientRect();
    // �ж�Ԫ�����Ͻǵ��ӿڶ����ľ����Ƿ�С���ӿڸ߶�
    return bound.top < window.innerHeight;
}

function renderDanmu (wish_list) {
    var index = 0;
    var row = 0;
    var len = wish_list.length;
    if (len === 0) {
        return;
    }

    var renderOne = function(one_danmu, row, speed) {
        if (one_danmu['prize_type'] == 'kingticket') {
            var class_name = 'danmu_king';
            if (one_danmu['icon_type'] == icon_type_sp) {
                class_name = 'danmu_king_sp';
            }
            info = $('<div class="danmu '+class_name+'"><div><img class="king_sp_img" src="//static.jjwxc.net/images/kingticket/king_sp.png?v=0322" alt="">'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/kingtickets_'+one_danmu['icon_type']+'.gif?var=20140327" alt="">'+(one_danmu['num'] > 1 ? ' ��'+one_danmu['num'] : '')+'</div></div>');
        } else {
            info = $('<div class="danmu danmu_nutrition"><div>'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/nutrition_icon.png?var=20140327" alt=""> ��'+one_danmu['num']+'</div></div>');
        }

        $('.danmu_row').eq(row).append(info);
        //���ö���
        info.animate({
            left: '-30%',
        }, speed, 'linear', function() {
            //������ɺ��ɾ��
            $(this).remove();
            if ($('.danmu_row').children().length === 0) {
                //��Ļû�� ���չʾ������ʽ
                for (var i = 0; i < Math.min(len, 20); i++) {
                    //ȡ20����Ļչʾҳ����
                    dis_info = wish_list[i];
                    if (dis_info['prize_type'] == 'kingticket') {
                        var class_name = 'danmu_king';
                        if (dis_info['icon_type'] == icon_type_sp) {
                            class_name = 'danmu_king_sp';
                        }
                        var temp = $('<div style="display: inline-block;position: relative; margin-right: 10px" class="danmu '+class_name+'"><div><img class="king_sp_img" src="//static.jjwxc.net/images/kingticket/king_sp.png?v=0322" alt="">'+dis_info['nickname']+' <img src="//static.jjwxc.net/images/kingtickets_'+dis_info['icon_type']+'.gif?var=20140327" alt="">'+(dis_info['num'] > 1 ? ' ��'+dis_info['num'] : '')+'</div></div>');
                    } else {
                        var temp = $('<div style="display: inline-block;position: relative;margin-right: 10px" class="danmu danmu_nutrition"><div>'+dis_info['nickname']+' <img src="//static.jjwxc.net/images/nutrition_icon.png?var=20140327" alt=""> ��'+dis_info['num']+'</div></div>');
                        //$('.danmu_row').eq(i%2).append('<div style="display: inline-block;position: relative;left: 0; margin-right: 10px" class="danmu danmu_nutrition"><div>'+one_danmu['nickname']+' <img src="//static.jjwxc.net/images/nutrition_icon.png?var=20140327" alt=""> ��'+one_danmu['num']+'</div></div>')
                    }
                    $('.danmu_row').eq(i%2).append(temp);
                    temp.animate({
                        left: '0',
                    }, speed, 'linear', function() {

                    });

                }
            }
        });
    }

    var  getOffsetRightOfParent = function(ele) {
        var parent = ele.offsetParent();
        if (parent === undefined || ele.position() === undefined) {
            return 0;
        }
        var ele_right = ele.position().left + ele.width() + 20;
        var parent_right = parent.width();
        return parent_right - ele_right;
    }
    if (['m.jjwxc.net', 'wap.jjwxc.net', 'm.jjwxc.com', 'wap.jjwxc.com'].indexOf(location.host) >= 0) {
        var interval = 800;
    } else {
        var interval = 500;
    }

   timer = setInterval(function() {
        if (index >= len) {
            clearInterval(timer);
            //��Ҫ�ֲ�������Ĵ���
            /*console.log('restart danmu');
            setTimeout(function() {
                renderDanmu(wish_list);
            }, 1500)*/
            return;
        }
        var one_danmu = wish_list[index];
        if (one_danmu == undefined) {
            return;
        }
        if (row > 1) {
            row = 0;
        }
        //�鿴��ǰ��� ���һ��Ԫ���Ƿ��Ѿ���ȫչʾ��չʾ��ϲ���Ⱦ��һ��
        var last_danmu = $('.danmu_row').eq(row).children().last();
        if (last_danmu !== undefined) {
            if (index > 1 && getOffsetRightOfParent(last_danmu) < 0) {
                ++row;
                return;
            }
        }
        //console.log(last_danmu);
        renderOne(one_danmu, row, row > 0 ? 34000 : 40000);
        ++row;
        index++;
    }, interval);

}

function isDisplay() {
    if($('#display_zuohua_cb').length === 0) {
        return true;
    }
    if (isSupportLocalStorage()) {
        var is_close = localStorage.getItem('hide_zuohua') == '1';
    } else {
        var is_close = getCookie("hide_zuohua") == '1';
    }
    $('#display_zuohua_cb').prop('checked', !is_close);
    if (is_close) {
        $('#note_danmu_wrapper > div').not('.note_chapter_title').hide();
    }
    return !is_close;
}

$(document).on('change', '#display_zuohua_cb', function () {

    if ($('#display_zuohua_cb').prop('checked')) {
        //չʾ
        if (isSupportLocalStorage()) {
            localStorage.removeItem('hide_zuohua');
        } else {
            setCookie('hide_zuohua', '1', new Date('2000-01-01'), '/');
        }
        $('#note_danmu_wrapper > div').not('#note_str').show();
        //�Ƿ������ݼ���
        if (!load_data) {
            getDanmu(note_novelid, note_chapterid);
        } else {
            //������Ⱦ����
            $('.danmu_row').html('');
            clearInterval(timer);
            renderDanmu(danmu_data);

        }

    } else {
        //����
        if (isSupportLocalStorage()) {
            localStorage.setItem('hide_zuohua', '1') ;
        } else {
            setCookie('hide_zuohua', '1', 0, '/');
        }
        $('#note_danmu_wrapper > div').not('.note_chapter_title').hide();
    }
});