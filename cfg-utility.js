/*
 * Custom Field GUI Utility 3.1
 *
 * Copyright (c) 2008-2009 Tomohiro Okuwaki
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Since:       2008-10-15
 * Last Update: 2010-04-22
 *
 * jQuery v1.4.4
 * Facebox 1.2
 * cookie.js
 */

jQuery(function($){

// Functions

    function getMediaURL (str) {
        return str.replace(/^(\[[0-9]+\])(.+)/,'$2');
/*
        var media_url;
        if (str.match(/^<img/)) {
            media_url = str.replace(/(<img src=")([^"]+)(".+)/,'$2');
        } else if (str.match(/^<a/)) {
            media_url = str.replace(/(<a href=")([^"]+)(".+)/,'$2');
        } else if (str.match(/^[0-9]/)) {
            media_url = str.replace(/([0-9]+\|)(.+)/,'$2');
        } else {
            media_url = str;
        }
        return media_url;
*/
    }
    
    function getMediaType (str) {
        var media_type = str.match(/[a-z]{2,5}$/i);
        if ((media_type == 'pdf')||(media_type == 'PDF')) {
            media_type = 'pdf';
        } else if ((media_type == 'jpg')||(media_type == 'JPG')||(media_type == 'gif')||(media_type == 'GIF')||(media_type == 'png')||(media_type == 'PNG')) {
            media_type = 'image';
        } else if ((media_type == 'html')||(media_type == 'HTML')||(media_type == 'htm')||(media_type == 'HTM')||(media_type == 'shtml')||(media_type == 'SHTML')||(media_type == 'php')||(media_type == 'PHP')) {
            media_type = 'web';
        } else if ((media_type == 'atom')||(media_type == 'ATOM')||(media_type == 'rss')||(media_type == 'RSS')||(media_type == 'rdf')||(media_type == 'RDF')) {
            media_type = 'feed';
        } else if ((media_type == 'doc')||(media_type == 'DOC')||(media_type == 'docx')||(media_type == 'DOCX')) {
            media_type = 'word';
        } else if ((media_type == 'xls')||(media_type == 'XLS')||(media_type == 'xlsx')||(media_type == 'XLSX')) {
            media_type = 'excel';
        } else {
            media_type = 'file';
        }
        return media_type;
    }
    
    // getPageScroll() by quirksmode.com
    function getPageScroll() {
        var xScroll, yScroll;
        if (self.pageYOffset) {
            yScroll = self.pageYOffset;
            xScroll = self.pageXOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {   // Explorer 6 Strict
            yScroll = document.documentElement.scrollTop;
            xScroll = document.documentElement.scrollLeft;
        } else if (document.body) {// all other Explorers
            yScroll = document.body.scrollTop;
            xScroll = document.body.scrollLeft; 
        }
        return new Array(xScroll,yScroll) 
    }
    
    // Adapted from getPageSize() by quirksmode.com
    function getPageHeight() {
        var windowHeight
        if (self.innerHeight) {   // all except Explorer
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowHeight = document.body.clientHeight;
        } 
        return windowHeight
    }
    
    function insert_btn (id) {
        var imf_ins_btns = 
//            '<span title="#' + id + '">カスタムフィールドに挿入 : </span>' + 
            '<button title="#' + id + '" class="button imf_ins_url" type="button">カスタムフィールドに挿入</button>';
//            '<span title="#' + id + '" class="button imf_ins_url">カスタムフィールドに挿入</span><br />';
//            '<span title="#' + id + '" class="button imf_ins_img">imgタグ</span>' +
//            '<span title="#' + id + '" class="button imf_ins_a">aタグ</span><br />';

        return imf_ins_btns;
    }
    
    function get_thumb_url (id) {
        var imaze_size_item = $(id + ' tr.image-size td.field div.image-size-item:has(input:checked)');
        var thumb_size = imaze_size_item.find('label.help').text();
            thumb_size = thumb_size.replace(/(\()([0-9]+)([^0-9]+)([0-9]+)(\))/,'-$2x$4');
    
        var thumb_url = $(id + ' tr.url td.field button.urlfile').attr('title');
        var thumb_ext = thumb_url.match(/\.[a-z]{2,5}$/i);
            thumb_ext = thumb_ext[0].toLowerCase().toString();
            thumb_url = thumb_url.replace(/(\.[a-z]{2,5}$)/i,thumb_size + thumb_ext);
        return thumb_url;
    }

    // cookieのセット
    function setCookie(key, val, days){
        var cookie = escape(key) + "=" + escape(val);
        if(days != null){
            var expires = new Date();
            expires.setDate(expires.getDate() + days);
            cookie += ";expires=" + expires.toGMTString();
        }
        document.cookie = cookie;
    }
    
    // cookieの取得
    function getCookie(key) {
        if(document.cookie){
            var cookies = document.cookie.split(";");
            for(var i=0; i<cookies.length; i++){
                var cookie = cookies[i].replace(/\s/g,"").split("=");
                if(cookie[0] == escape(key)){
                    return unescape(cookie[1]);
                }
            }
        }
        return "";
    }

    var css_static = {
        'position':'static'
    };
    var css_required = {
        'position': 'absolute',
        'z-index': '9',
        'width': '580px',
        'left': '50%',
        'margin-left': '-290px'
    };

    var file_type;
    var admin_url = location.href;
    var images_url = admin_url.replace(/(http.+)(wp-admin)(.+)/,'$1') + 'wp-content/plugins/custom-field-gui-utility/images/';
    var cancel_png = images_url + 'cancel.png';
    var must_png = images_url + 'must.png';

    // Multi Checkbox [start]
    $('div.multi_checkbox').each(function(){
    
        var self = $(this);

        var checkboxs  = self.find('input:checkbox');
        var data_elm = self.find('input.data');
        var data_val = data_elm.val();
        var data_def = self.find('span.default').text().replace(/[ 　]*#[ 　]*/g,',');

        var data_arry = new Array;
        if (data_val) {
            data_arry = data_val.split(',');
            checkboxs.val(data_arry);
        }
        
        checkboxs.click(function(){
            var data_arry = new Array;
            self.find('input:checked').each(function(){
                data_arry.push($(this).val());
            });
            self.find('input.data').val(data_arry.join());
        });
    });
    // Multi Checkbox [end]



    // イメージフィールド・ファイルフィールド周りのliveイベントを設定 [start]
    $('img.cfg_add_media').live('click', function(){
        var self = $(this);
        
        // アップローダーをクリック(clc)したイメージフィールドのidをcookieに保存
        var clc_id = self.parents('div.imagefield').attr('id');
        setCookie('imf_clc_id',clc_id);
        
        // WPオリジナルのアップローダーを起動
        if ($('#add_media').length > 0) {
            $('#add_media').click();
        } else {
            $('#media-buttons a').click();
        }
        
        // アップローダーを閉じるときにカスタムフィールドに値を挿入する動き
        $('#TB_closeWindowButton').click(function(){
    
            // cookieからidと値を取得して変数に代入後にリセット
            var imf_clc_id = '#' + getCookie('imf_clc_id');
            var imf_elm = $(imf_clc_id);
            var imf_val  = getCookie('imf_value');
            setCookie('imf_clc_id','');
            setCookie('imf_value','');
            
            // カスタムフィールドに値を入れる
            if (imf_val) {
                $(imf_clc_id).find('input.data').val(imf_val);
                // テキストフィールドにファイルの種類のアイコンとキャンセルボタンを表示
                var media_url = getMediaURL (imf_val);
                var media_type = getMediaType (media_url);
                if (media_type) {
                    imf_elm
                        .find('input.data')
                            .css('background','url(' + images_url + media_type + '.png) no-repeat 3px center')
                            .css('padding-left','20px')
                        .end()
                        .find('a.image')
                            .attr('href',media_url)
                            .html('<img src="' + media_url + '" width="150" />');
                } else {
                    imf_elm.find('input.data').removeAttr('style');          
                }
                imf_elm.find('img.cancel').attr('src', cancel_png).show();
            }
        });
    });
    // イメージフィールド・ファイルフィールド周りのliveイベントを設定 [end]

    // アップローダーにカスタムフィールド用ボタンを追加 [start]
    $('#media-items div.media-item').each(function(){
        var id = $(this).find('thead').attr('id');
        $(this).find('tr.submit td.savesend').prepend(insert_btn(id));
    }).live('mouseover', function(){
        var id = $(this).find('thead').attr('id');
        if (!($(this).find('tr.submit td.savesend button.imf_ins_url').length)){
            $(this).find('tr.submit td.savesend').prepend(insert_btn(id));
        }
    });
/*
    $('#media-items').live('mouseover', function(){
        $(this).find('div.media-item').each(function(){
            var id = $(this).attr('id');
            var imf_ins_btns = insert_btn (id);
            if (!($(this).find('tr.submit td.savesend button.imf_ins_url').length)){
                $(this).find('tr.submit td.savesend').prepend(imf_ins_btns);
                $(this).find('tr.url td.field p.help').before('<button type="button" class="button use_thumb" title="#' + id + '">サムネイルの URL</button>');
            }
        });
    });
*/
    // アップローダーにカスタムフィールド用ボタンを追加 [end]

    // カスタムフィールドに挿入するボタンのイベント [start]
    $('button.imf_ins_url').live('click', function(){
        var id = $(this).attr('title').replace(/#media-head-/,'');
        var media_url = $(this).closest('tr.submit').prevAll('tr.url').find('td.field input.urlfield').val();
        setCookie('imf_value','[' + id + ']' + media_url);
        $('p.ml-submit input:submit').click();
    });
    // カスタムフィールドに「URL」を挿入するボタンのイベント [end]

    // [start]カスタムフィールドに「imgタグ」を挿入するボタンのイベント
/*
    $('span.imf_ins_img').live('click', function(){
        var id = $(this).attr('title');

        var media_url = $(id + ' tr.url td.field input.urlfield').val();
        var media_type = media_url.match(/[a-z]{2,5}$/i);
        var media_ttl = $(id + ' tr.post_title td.field input').val();
        var media_exc = $(id + ' tr.post_excerpt td.field input').val();
        var media_ctt = $(id + ' tr.post_content td.field textarea').val();
        
        var media_atr_alt = media_ttl;
        var media_atr_ttl = '';
        var media_elm;
        
        if (media_exc) {
            media_atr_alt = media_exc;
        }
        if (media_ctt) {
            media_atr_ttl = ' title="' + media_ctt + '"';
        }
        
        media_elm = '<img src="' + media_url + '" alt="' + media_atr_alt + '"' + media_atr_ttl + ' class="cfg_img" />';

        $.cookie('imf_value',media_elm);

        $('p.ml-submit input:submit').click();
        
    });
*/
    // [end]カスタムフィールドに「imgタグ」を挿入するボタンのイベント
    
    // [start]カスタムフィールドに「aタグ」を挿入するボタンのイベント
/*
    $('span.imf_ins_a').live('click', function(){
        var id = $(this).attr('title');
        
        var media_url = $(id + ' tr.url td.field input.urlfield').val();
        var media_type = media_url.match(/[a-z]{2,5}$/i);
        var media_ttl = $(id + ' tr.post_title td.field input').val();
        var media_exc = $(id + ' tr.post_excerpt td.field input').val();
        var media_ctt = $(id + ' tr.post_content td.field textarea').val();
        
        var media_atr_ttl = '';
        var media_elm;
        if (media_exc) {
            media_ttl = media_exc;
        }
        if (media_ctt) {
            media_atr_ttl = ' title="' + media_ctt + '"';
        }
        
        if ((media_type == 'jpg') || (media_type == 'gif') || (media_type == 'png') || (media_type == 'jpeg') || (media_type == 'bmp')) {
            var thumb_url = get_thumb_url(id);
            var original_url = $(id + ' tr.url td.field button.urlfile').attr('title');
            media_elm = '<a href="' + original_url + '"' + media_atr_ttl + ' class="cfg_link"><img src="' + thumb_url + '" alt="' + media_ttl + '" class="cfg_img" /></a>';
        } else {
            media_elm = '<a href="' + media_url + '"' + media_atr_ttl + ' class="cfg_link">' + media_ttl + '</a>';
        }

        $.cookie('imf_value',media_elm);

        $('p.ml-submit input:submit').click();
        
    });
*/
    // [end]カスタムフィールドに「aタグ」を挿入するボタンのイベント

    // [start]サムネイルのURLを「リンクURL」に挿入
/*
    $('tr.url button.use_thumb').live('click', function(){
        var id = $(this).attr('title');
        var thumb_url = get_thumb_url(id);
        $(this).prevAll('input.urlfield').val(thumb_url);
    });
*/
    // [end]サムネイルのURLを「リンクURL」に挿入

    // 管理画面にサムネイルを表示 [start]
    $('div.imagefield').each(function(){  
        var div = $(this);
        var imf_data = div.find('input.data');
        var imf_val = imf_data.val();
        var imf_cancel = div.find('img.cancel');
        
        if (imf_val) {
            imf_cancel.attr('src', cancel_png).show();

            var media_url = getMediaURL(imf_val);
            var media_type = getMediaType(media_url);
            
            imf_data.css({
                'background':'url(' + images_url + media_type + '.png) no-repeat 3px center',
                'padding-left':'20px'
            });
            div.find('a.image').attr('href', media_url).html('<img src="' + media_url + '" width="150" />');
        } else {
            imf_data.removeAttr('style');
        }

        imf_data.change(function(){
            var imf_val = $(this).val();

            if (imf_val) {
                var images_url = getMediaURL(imf_val);
                var media_type = getMediaType(media_url);
                $(this)
                    .css({
                        'background':'url(' + images_url + media_type + '.png) no-repeat 3px center',
                        'padding-left':'20px'
                    })
                    .next('img.cancel').attr('src', cancel_png).show();
            } else {
                $(this)
                    .removeAttr('style')
                    .nextAll('img.cancel').attr('src', '').hide();
            }

            $(this)
                .nextAll('span.thumb')
                .find('a.image').attr('href', media_url).html('<img src="' + media_url + '" width="150" />');
        });     
    });
    // 管理画面にサムネイルを表示 [end]

    // キャンセル」ボタンを押したときの動作の設定 [start]
    $('img.cancel').live('click', function() {
        $(this)
            .next('span')
                .find('a.image').removeAttr('href')
                .end()
                .find('img').fadeOut('slow', function(){
                    $(this).remove();
                })
                .end()
            .end()
            .prev().val('').removeAttr('style')
            .end()
            .hide();
    });
    // キャンセル」ボタンを押したときの動作の設定 [end]

    // [start]必須要素の入力チェック
    var required_boxs = 
        '<div id="required_bg"></div>' +
        '<div id="required_box"><p id="required_msg">以下の必須項目が入力されていません</p></div>';
    
    $('body').append(required_boxs);

    $('div.postbox.must h4').css({
        'padding-left': '20px',
        'background': 'url(' + must_png + ') no-repeat left top'
    });
    
    // 「公開」ボタンを押したときのイベント
    $('#publishing-action #original_publish, #publishing-action #publish').live('click', function(){
        var slug = $('#edit-slug-box #sample-permalink').text();
        if (slug) {
            var add_height = 0, check = 0;
            var total_height = getPageScroll()[1] + (getPageHeight() / 20) + 80;
            
            $('div.postbox.must:visible').each(function(){
                $(this).removeAttr('style');
                
                var textfield = $(this).hasClass('textfield');
                var imagefield = $(this).hasClass('imagefield');
                var filefield = $(this).hasClass('filefield');
                var checkbox = $(this).hasClass('checkbox');
                var multi_checkbox = $(this).hasClass('multi_checkbox');
                var radio = $(this).hasClass('radio');
                var select = $(this).hasClass('select');
                var textarea = $(this).hasClass('textarea');

                // テキストフィールド・イメージフィールド・ファイルフィールド・複数選択チェックボックスの入力チェック
                if (textfield || imagefield || filefield || multi_checkbox || textarea) {
                    if (!($(this).find('.data').val())) {
                        $(this).css({'top': total_height}).addClass('required_err requireds');
                        add_height = $(this).height() + 30;
                        total_height += add_height;
                        check = 1;
                    }
                }
    
                // チェックボックス・ラジオボタンの入力チェック
                if (checkbox || radio) {
                    if (!($(this).find('input.data:checked').length)) {
                        $(this).css({'top': total_height}).addClass('required_err requireds');
                        add_height = $(this).height() + 30;
                        total_height += add_height;
                        check = 1;
                    }
                }
    
                // セレクトメニューの入力チェック
                if (select) {
                    if (!($(this).find('option.data:selected'))) {
                        $(this).css({'top': total_height}).addClass('required_err requireds');
                        add_height = $(this).height() + 30;
                        total_height += add_height;
                        check = 1;
                    }
                }
            });
            
            if (check) {
                $('#cfg_utility').css(css_static);
                $('#required_bg').css({'height': $('#wpwrap').height() }).fadeIn();
                $('#required_box').css({
                    'top':  getPageScroll()[1] + (getPageHeight() / 20),
                    'left': '50%',
                    'height': total_height - getPageScroll()[1] - 30
                }).fadeIn();
                
                $('#adminmenu, #favorite-actions, #side-info-column, #submitdiv, #pagesubmitdiv').css({
                    'position': 'static'
                }).addClass('requireds');
                
                $(this).css({
                    'position': 'absolute',
                    'top':  getPageScroll()[1] + (getPageHeight() / 20) + 30,
                    'left': '50%',
                    'margin-left': '200px',
                    'z-index': '10'
                }).addClass('requireds');
                return false;
            } else {
                $('.requireds').removeAttr('style');
                $('#required_bg, #required_box').fadeOut();
                return true;
            }
        } else {
            return true;
        }
    });
    // 必須要素の入力チェック [end]
    
    // フォーカスしたテキストフィールドの初期値を消す [start]
    $('div.postbox.textfield').find('input.data').each(function(){
        $(this).focus(function(){
            var default_val = $(this).attr('title');
            var current_val = $(this).val();
            if (default_val == current_val) {
                $(this).val('');
            }
        });
        $(this).blur(function(){
            var default_val = $(this).attr('title');
            var current_val = $(this).val();
            if (current_val == '') {
                $(this).val(default_val);
            }
        });
    });
    // フォーカスしたテキストフィールドの初期値を消す [end]
    
    // for facebox.js
    $("a[rel*=facebox]").facebox();

});
