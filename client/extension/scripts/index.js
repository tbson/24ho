retrieveWindowVariables();

var products = [];
var product1688 = [];
var STORAGE = '24horder_products';
var REQUEST_DATA = 'REQUEST_DATA';
var CLEAR_DATA = 'CLEAR_DATA';

var host = 'https://nguonhang1688.com';
// var host = 'https://24horder.com';

var identityClass = '24horder';
var config = {
    rate: 3500,
    urlGetRate: host + '/AdminAccount/Cart/ExchangeRate',
    urlCurrentVersion: host + '/AdminAccount/Cart/VersionTool',
    currentVer: chrome.runtime.getManifest().version,
    urlCart: host + '/AdminAccount/Cart/ProductCart',
    allowedDomains: ['TMALL', 'TAOBAO', '1688']
};

window.addEventListener(
    'message',
    function(event) {
        if (event.origin !== host) {
            return;
        }
        var emptyData = {};
        switch (event.data.type) {
            case REQUEST_DATA:
                getData(STORAGE, function(items) {
                    if (items) {
                        event.source.postMessage({error: 0, message: '', data: items}, event.origin);
                    } else {
                        event.source.postMessage({error: 1, message: msg}, event.origin);
                    }
                });
                break;
            case CLEAR_DATA:
                emptyData[STORAGE] = [];
                setData(emptyData, function() {
                    console.info('All data was cleared!');
                });
                event.source.postMessage({error: 0, message: 'All data was cleared!'}, event.origin);
                break;
            default:
                break;
        }
    },
    false
);

// Lấy tỉ giá ngoại tệ
$.post(config.urlGetRate, function(newRate) {
    newRate = parseInt(newRate);
    if (newRate > 0) {
        config.rate = newRate;
    }
});

// Lấy ra phiên bản hiện tại của plugin
$.post(config.urlCurrentVersion, function(currentVer) {
    if (currentVer.length) {
        config.currentVer = currentVer;
    }
});

setInterval(function() {
    var opSel = '[class^=addon]';
    if ($(opSel).length > 0) {
        $(opSel).remove();
    }
}, 1000);

// Determine current domain to get configurations
var currentDomain = 'TAOBAO';
var hostName = window.location.hostname;
config.allowedDomains.forEach(function(dm) {
    if (hostName.indexOf(dm.toLowerCase()) > -1) {
        currentDomain = dm;
    }
});

var tbeInventory = '';
var tbleBegin = '';

$(function() {
    'use strict';
    //lvt_20160303
    if (checkLinkWarning()) {
        return false;
    }

    //end
    if (window.location.pathname.indexOf('item') === -1 && window.location.host != 'detail.1688.com') {
        return false;
    }

    $('body').on('click', '.tbeRemoveBox', function() {
        removeBox();
    });

    // Remove currency label
    $('.tb-rmb, .tm-yen, .fd-cny').remove();
    var localConfig = localStorage.getItem('tmp_g_config');
    if (localConfig !== null) {
        config.localConfig = JSON.parse(localConfig);
    }

    // Translate
    $(rules[currentDomain].translate.originPrice).text('Giá');
    $(rules[currentDomain].translate.promoPrice).text('Giá bán');
    $(rules[currentDomain].translate.size).text('Kích thước');
    $(rules[currentDomain].translate.color).text('Màu sắc');
    $(rules[currentDomain].translate.amount).text('Số lượng');
    $(rules[currentDomain].translate.unit).text('Sản phẩm');

    var objPrice = getPrice();
    var productPrice = 0;
    var tbePrice = '';

    if (currentDomain === '1688') {
        tbeInventory = $('.mod-detail-purchasing').attr('data-mod-config');
        if (tbeInventory.length > 0) {
            tbeInventory = JSON.parse(tbeInventory);
        }
        if (typeof tbeInventory === 'object') {
            tbeInventory = parseInt(tbeInventory.max);
        }
        if (typeof tbeInventory == 'number') {
            tbePrice +=
                '<dl><dd style="width:100%"><span class="text-danger">Shop hiện còn <b>' +
                tbeInventory +
                '</b> sản phẩm</span></dd></dl>';
        }
        if (typeof objPrice == 'number') {
            productPrice = Math.round(objPrice * config.rate).format();
        } else {
            if (objPrice.length > 0) {
                if (parseInt(objPrice[0].begin) > 1) {
                    tbleBegin = objPrice[0].begin;
                    tbePrice +=
                        '<dl><dd style="width:100%"><span class="text-danger">Shop yêu cầu mua tối thiểu ' +
                        objPrice[0].begin +
                        ' sản phẩm</span></dd></dl>';
                }
                for (var i = 0; i <= objPrice.length - 1; i++) {
                    if (objPrice[i].end.length > 0) {
                        tbePrice +=
                            '<dl><dd>Mua: ' +
                            objPrice[i].begin +
                            ' - ' +
                            objPrice[i].end +
                            ' sản phẩm</dd><dd>Giá: <span class="tbe-color-price">¥' +
                            objPrice[i].price +
                            '</span></dd></dl>';
                    } else {
                        tbePrice +=
                            '<dl><dd>Mua: &gt;' +
                            objPrice[i].begin +
                            ' sản phẩm</dd><dd>Giá: <span class="tbe-color-price">¥' +
                            objPrice[i].price +
                            '</span></dd></dl>';
                    }
                }
            }
            productPrice = Math.round(objPrice[0].price * config.rate).format();
        }
    } else {
        tbeInventory = $('#J_EmStock, #J_SpanStock').text();
        if (tbeInventory.length > 0) {
            tbeInventory = retnum(tbeInventory);
            tbeInventory = parseInt(tbeInventory);
        }
        if (typeof tbeInventory == 'number') {
            if (currentDomain === 'TMALL') {
                tbePrice +=
                    '<dl><dd style="width:100%"><span class="text-danger">Shop hiện còn <b>' +
                    tbeInventory +
                    '</b> sản phẩm</span></dd></dl>';
            } else {
                tbePrice +=
                    '<dl><dd style="width:100%"><span class="text-danger">Shop giới hạn mua tối đa <b class="tbe-color-price">' +
                    tbeInventory +
                    '</b> sản phẩm</span></dd></dl>';
            }
        }
        productPrice = Math.round(objPrice.orgPrice * config.rate).format();
        // Tìm giá bán của sản phẩm
        if (
            (objPrice.orgPrice > 0 && objPrice.orgPrice > objPrice.proPrice) ||
            ((objPrice.orgPrice == 0 || isNaN(objPrice.orgPrice)) && objPrice.proPrice > 0)
        ) {
            productPrice = Math.round(objPrice.proPrice * config.rate).format();
        } else {
            if (objPrice.lowPrice > 0 && objPrice.highPrice > 0) {
                productPrice =
                    Math.round(objPrice.lowPrice * config.rate).format() +
                    ' - ' +
                    Math.round(objPrice.highPrice * config.rate).format();
            }
            if (objPrice.lowPromo > 0 && objPrice.highPromo > 0) {
                productPrice =
                    Math.round(objPrice.lowPromo * config.rate).format() +
                    ' - ' +
                    Math.round(objPrice.highPromo * config.rate).format();
            }
        }
    }

    var count = 0;
    $('#J_PromoPrice, #J_priceStd, #J_PromoWrap').on('DOMNodeInserted', function(ev) {
        // Remove currency label
        $('.tb-rmb, .tm-yen, .fd-cny').remove();
        var myTimeOut;
        var newPrice =
            $(ev.currentTarget)
                .find('.tb-rmb-num, .tm-price')
                .text() || $(rules[currentDomain].crawle.promoPrice).text();
        newPrice = parseFloat(newPrice);
        if (newPrice > 0) {
            count = newPrice;
            if ($('#tbe-warning-bar:hidden')) {
                showTbeMeasage(
                    'Thông báo',
                    '<span class="text-white"><strong>Chú ý:</strong> Sản phẩm vừa được cập nhật giá theo thuộc tính đã chọn, vui lòng kiểm tra lại thông tin!</span>'
                );
                $('#tbe-info b.tbe-rate').text(Math.round(count * config.rate).format());

                myTimeOut = setTimeout(function() {
                    $('#tbe-warning-bar').hide();
                }, 3000);
                $('#tbe-warning-bar').mouseout(function() {
                    myTimeOut = setTimeout(function() {
                        $('#tbe-warning-bar').hide();
                    }, 3000);
                });

                $('#tbe-warning-bar').mouseover(function() {
                    clearTimeout(myTimeOut);
                });
            }
        }
    });

    // Append info
    if (tbePrice.length > 0) {
        tbePrice = '<div class="bg-info">' + tbePrice + '</div>';
    }
    var tbeInfo = [
        '<div id="tbe-info" class="' + identityClass + '">',
        '<img src="' + host + '/images/icon_24horder_200.png" alt="24horder" />',
        '<ul>',
        '<li>Giá bán: <b class="tbe-rate tbe-color-price">' + productPrice + '</b> đ</li>',
        '<li>Tỷ giá: <span class="tbe-color-price">' + config.rate.format() + '</span> đ/tệ</li>',
        '</ul>',
        tbePrice,
        '<div class="tbe-info-warning">(!!) Vui lòng chọn đầy đủ thông tin sản phẩm ở bên dưới để xem giá chuẩn.</div>',
        '</div>'
    ].join('');
    $('#J_Title, .tb-detail-hd, #mod-detail-price, .mod-detail-info-price, .mod-detail-daixiao-price').append(tbeInfo);

    //favorites_20160307
    var btnNotes =
        '<div id="tbe-notes"><dl><dt>Ghi chú</dt><dd><textarea id="tbex-notes" name="tbex-notes" placeholder="Ghi chú cho sản phẩm này vào 24horder.com" rows="5" cols="50" maxlength="2000"></textarea></dd></dl></div>';
    $('#J_buyNum, .tb-sku .tb-amount, .mod-detail-purchasing .obj-leading').append(btnNotes);
    if ($('.mod-detail-purchasing .obj-leading').length === 0) {
        $('.mod-detail-purchasing').append(btnNotes);
    }

    //end
    // Menubar
    var tbexWrapper = $('<div>').attr('id', 'tbe-wrapper');
    var menubar = $('<div>');
    menubar.attr('id', 'tbe-menubar');
    menubar.attr('class', identityClass);

    // Submit add to cart button
    var btnShowCart = makeButton(
        {
            id: 'tbe-btn-show-cart',
            class: 'btn btn-sm btn-default bg-transparent bd-white text-white ' + identityClass,
            type: 'button'
        },
        '<span class="bg-img-cart"></span> Giỏ hàng',
        function(ev) {
            ev.preventDefault();
            var tab = window.open(host + '/AdminAccount/Cart/ProductCart');
            tab.focus();
        }
    );

    // Submit order button
    var btnSubmit = makeButton(
        {
            id: 'tbe-btn-submit',
            class: 'btn btn-sm btn-danger bg-ed2328 ' + identityClass,
            type: 'button'
        },
        '<span class="bg-img-add"></span> Thêm vào giỏ hàng',
        order
    );

    // Submit order button
    var btnGuide = makeButton(
        {
            id: 'tbe-btn-guide',
            class: 'btn btn-sm btn-invert bg-fff8a1',
            type: 'button'
        },
        '<span class="bg-img-help"></span>Hướng dẫn đặt hàng',
        guideToOrder
    );

    var lblWarning = $('<div>');
    lblWarning
        .attr({
            id: 'tbe-warning-bar',
            class: 'alert alert-danger',
            role: 'alert'
        })
        .html(
            '<span class="text-white"><strong>Chú ý:</strong> Sản phẩm vừa được cập nhật giá theo thuộc tính đã chọn, vui lòng kiểm tra lại thông tin!</span>'
        )
        .hide()
        .on('click', function() {
            $(this).hide();
        });
    var khuyencao2 =
        '<a title="24horder" target="_blank" href="' +
        host +
        '"><img id="tbe-logo" src="' +
        host +
        '/images/logo_24horder.png"/></a><span class="text-danger text-white"><strong>Cảnh báo: </strong>Bạn không dùng google translate khi thêm sản phẩm!</span>';
    var btnArrow = '<div id="btn-arrow" class="arrow-hide"></div>';
    menubar.append(khuyencao2, btnSubmit, btnShowCart /*, btnFavorite,boxFavorite,ifFavorite,*/);
    tbexWrapper.append(btnArrow, lblWarning, menubar);

    $('body').append(tbexWrapper);
});

/**
 * Helper to make a button
 */
function makeButton(attrs, text, callback) {
    var btn = $('<button>');
    btn.attr(attrs)
        .html(text)
        .on('click', callback);
    return btn;
}

/**
 * Handler for add to cart
 */
function addToCart(ev) {
    // Remove currency label
    $('.tb-rmb, .tm-yen', '.fd-cny').remove();
    if (currentDomain === '1688') {
        return addToCartOf1688();
    }

    //lvt_add_20160217
    if (checkElementExists()) {
        if (!checkFullProperty()) {
            return false;
        }
    }
    //end

    var shopNick = '';
    var shopUrl = '';
    var proName = '';
    if (currentDomain === 'TAOBAO') {
        proName = $('#J_ThumbView, #J_ImgBooth').attr('alt');
        if (typeof proName === 'undefined') {
            proName = $('#J_Title .tb-main-title').data('title');
        }
        shopNick = taobaoShopNick();
        shopUrl = taobaoShopLink();
    } else if (currentDomain === 'TMALL') {
        proName = $('#J_ThumbView, #J_ImgBooth').attr('alt');
        shopNick = tmallShopNick();
        shopUrl = tmallShopLink();
    }

    var size = $(rules[currentDomain].crawle.size)
            .next()
            .find('.tb-selected')
            .data('pv'),
        color = $(rules[currentDomain].crawle.color)
            .next()
            .find('.tb-selected')
            .data('pv');
    if (typeof size === 'undefined') {
        size = $(rules[currentDomain].crawle.size)
            .next()
            .find('.tb-selected')
            .data('value');
    }
    if (typeof color === 'undefined') {
        color = $(rules[currentDomain].crawle.color)
            .next()
            .find('.tb-selected')
            .data('value');
    }
    var sizetxt = $(rules[currentDomain].crawle.size)
            .next()
            .find('.tb-selected a')
            .text(),
        colortxt = $(rules[currentDomain].crawle.color)
            .next()
            .find('.tb-selected a')
            .text();

    var priceValue = $(rules[currentDomain].crawle.originPrice).text(),
        promoValue = $(rules[currentDomain].crawle.promoPrice).text();

    priceValue = fixPriceForGoogleTranslate(priceValue);
    promoValue = fixPriceForGoogleTranslate(promoValue);

    var price = priceValue;

    if (promoValue && !isNaN(promoValue)) {
        price = promoValue;
    }
    var properties = '';
    var maxValue;

    if (currentDomain === 'TAOBAO') {
        properties = taobaoSkuId(size, color);
        maxValue = isNaN(parseInt(retnum($('#J_SpanStock').html()))) ? 0 : parseInt(retnum($('#J_SpanStock').html()));
    } else if (currentDomain === 'TMALL') {
        properties = $_GET('skuId');
        maxValue = isNaN(parseInt(retnum($('#J_EmStock').html()))) ? 0 : parseInt(retnum($('#J_EmStock').html()));
    }

    var defaultProduct = {
        created: new Date(),
        updated: new Date(),
        rate: config.rate,
        name: proName,
        pro_link: changeLink(window.location.href),
        image: changeLink(correctLink($(rules[currentDomain].crawle.image).attr('src'))),
        price: price,
        price_arr: '',
        size: size,
        sizetxt: sizetxt,
        color: color,
        colortxt: colortxt,
        pro_properties: properties,
        amount: parseInt($(rules[currentDomain].crawle.amount).val()),
        beginAmount: 1,
        min: 1,
        max: maxValue,
        shop_nick: shopNick,
        shop_link: changeLink(shopUrl),
        domain: currentDomain,
        site: currentDomain,
        note: $('#tbex-notes').val(),
        count: false,
        method: 'Chrome Extension'
    };

    if (defaultProduct.amount > maxValue) {
        showTbeMeasage('Thông báo', 'Shop hiện tại chỉ còn ' + maxValue + ' sản phẩm.');
        return false;
    }

    addOrRemoveCartItem('add', defaultProduct);
}

/**
 * Add item to cart of 1688
 */
function addToCartOf1688() {
    if (!checkFor1688Com()) {
        return false;
    }

    var productList1688 = [];
    var shopNick = '';
    var shopUrl = '';
    var proName = '';
    proName = $('.mod-detail-gallery img').attr('alt');
    shopNick = com1688ShopNick();
    shopUrl = com1688ShopLink();

    var beginAmount = 1;
    var unitConfig = $('.unit-detail-freight-cost').attr('data-unit-config');

    if (typeof unitConfig !== 'undefined') {
        unitConfig = JSON.parse(unitConfig);
    }

    if (typeof unitConfig === 'object') {
        beginAmount = parseInt(unitConfig.beginAmount);
    }

    product1688 = [];
    product1688 = getProduct1688();
    if (product1688[0].list.length === 0) {
        product1688 = [];
        product1688.push(getSingleProduct1688Com());
    }
    // return false;
    product1688.forEach(function(prd) {
        // Exclude Product id & skull id from image
        //
        var ids = prd.img.split('/');
        ids = ids[ids.length - 1];
        ids = ids.split('.')[0];
        ids = ids.split('_');

        prd.list.forEach(function(item) {
            var defaultProduct = {
                created: new Date(),
                updated: new Date(),
                proId: parseInt(ids[1], 10),
                skullId: parseInt(ids[0], 10),
                rate: config.rate,
                pro_link: changeLink(window.location.href),
                image: changeLink(prd.img),
                name: proName,
                price: item.price,
                price_arr: getPrice(),
                size: item.skuName,
                sizetxt: item.skuName,
                color: item.color,
                colortxt: item.color,
                amount: item.qty,
                beginAmount: beginAmount,
                min: item.min,
                max: item.max,
                shop_nick: shopNick,
                shop_link: changeLink(shopUrl),
                site: currentDomain,
                domain: currentDomain,
                note: $('#tbex-notes').val(),
                count: false,
                method: 'Chrome Extension'
            };
            productList1688.push(defaultProduct);
        });
    });

    addOrRemoveCartItem('add', productList1688);
}

/**
 * Test & correct a link
 * @param  string link
 * @return string new link
 */
function correctLink(link) {
    if (typeof link === 'string') {
        if (link.indexOf('http') == -1) {
            link = window.location.protocol + link;
        }
    }
    return link;
}

/**
 * Send order to giaodichtq
 */
function order(ev) {
    ev.preventDefault();
    addToCart(ev);
}

/**
 * Guide to use extension to order
 */
function guideToOrder(ev) {
    ev.preventDefault();
    var tab = window.open(host + '/AdminAccount/Guide/Guide', '_blank');
    tab.focus();
}

/**
 * Handle with localStorage to add/remove product item
 * @param string action Add/Remove
 * @param mix data      Extra data
 */
function addOrRemoveCartItem(action, data) {
    getData(STORAGE, function(item) {
        products = item[STORAGE] || [];
        switch (action) {
            case 'add':
                if ($.isArray(data)) {
                    for (var i = data.length - 1; i >= 0; i--) {
                        products.push(data[i]);
                    }
                } else {
                    products.push(data);
                }
                break;
            case 'remove':
                products.removeAt(data);
                break;
        }

        var newData = {};
        newData[STORAGE] = products;
        setData(newData, function() {
            flyToCart();
        });
    });
}

/**
 * Lấy gía
 * @return array
 */
function getPrice() {
    if (currentDomain === '1688') {
        return getPriceFrom1688();
    }

    return getPriceFromTaobao();
}

/**
 * Lấy giá từ 1688
 * @return array
 */
function getPriceFrom1688() {
    var priceOf1688 = [];
    $('tr.price td[data-range]').each(function(ind, el) {
        var rangePrice = $(el).attr('data-range');
        if (typeof rangePrice == 'undefined') {
            priceOf1688 = parseFloat(
                $(el)
                    .find('.value')
                    .text()
            );
        } else {
            rangePrice = $.parseJSON(rangePrice);
            priceOf1688.push(rangePrice);
        }
    });

    // Try once get price
    if (typeof priceOf1688 == 'object' && priceOf1688.length === 0) {
        priceOf1688 = parseFloat(
            $('#mod-detail-price')
                .find('span.num')
                .text()
        );
    }

    if (isNaN(priceOf1688) && typeof priceOf1688 !== 'object') {
        priceOf1688 = $('.table-sku')
            .find('tr:first')
            .find('td.price')
            .find('em.value')
            .text();
        priceOf1688 = parseFloat(priceOf1688);
    }
    return priceOf1688;
}

/**
 * Lấy giá từ taobao và tmall
 * @return array
 */
function getPriceFromTaobao() {
    var priceWrap = $(rules[currentDomain].crawle.originPrice),
        promoWrap = $(rules[currentDomain].crawle.promoPrice),
        priceText = priceWrap.text(),
        promoText = promoWrap.text(),
        lowPrice = 0,
        highPrice = 0,
        lowPromo = 0,
        highPromo = 0;
    var priceRange;
    if (priceText.indexOf('-') > -1) {
        priceRange = priceText.split('-');
        lowPrice = parseFloat(priceRange[0]);
        highPrice = parseFloat(priceRange[1]);
        priceText = 0;
    } else {
        priceText = parseFloat(priceText);
    }

    if (promoText.indexOf('-') > -1) {
        priceRange = promoText.split('-');
        lowPromo = parseFloat(priceRange[0]);
        highPromo = parseFloat(priceRange[1]);
        promoText = 0;
    } else {
        promoText = parseFloat(promoText);
    }

    return {
        orgPrice: priceText,
        proPrice: promoText,
        lowPrice: lowPrice,
        highPrice: highPrice,
        lowPromo: lowPromo,
        highPromo: highPromo
    };
}

function removeBox() {
    $('#tbe-alert-wrapper').remove();
    $('#tbe-alert-backdrop').remove();
}
function getData(key, cb) {
    chrome.storage.local.get(key, cb);
}
function setData(data, cb) {
    chrome.storage.local.set(data, cb);
}

function retrieveWindowVariables() {
    var scriptContent =
        "if(typeof g_config !== 'undefined') localStorage.setItem('tmp_g_config', JSON.stringify(g_config));";
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $('#tmpScript').remove();
}
Number.prototype.format = function() {
    var strNumber = this + '';
    var x = strNumber.split(',');
    var x1 = x[0];
    var x2 = '';
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
};

//lvt_add_20160217
function checkElementExists() {
    var element = null;
    element = $('#J_SKU .J_SKU, .tb-sku .J_TSaleProp, #J_isku .tb-skin .tb-prop'); //taobao.com
    if (element.length > 0) {
        return true;
    } else {
        return false;
    }
}

function checkFullProperty() {
    //taobao.com, tmall.com
    var countproperty = 0;
    countproperty = $('#J_SKU dl, .tb-sku .tm-sale-prop, #J_isku .tb-skin .tb-prop').length;
    var countselected = 0;
    countselected = $(
        '#J_SKU .J_SKU.tb-selected, .tb-sku .J_TSaleProp .tb-selected, #J_isku .tb-skin .tb-prop .J_TSaleProp .tb-selected'
    ).length;
    if (countselected == 0) {
        showTbeMeasage('Thông báo', 'Bạn chưa chọn thuộc tính cho sản phẩm.');
        scrollToAlert();
        return false;
    }
    //
    if (countselected > 0 && countproperty > countselected) {
        showTbeMeasage('Thông báo', 'Bạn phải chọn đầy đủ thuộc tính cho sản phẩm.');
        scrollToAlert();
        return false;
    } else if (countselected > 0 && countproperty == countselected) {
        return true;
    }

    return false;
}

function checkFor1688Com() {
    var countselected = 0;
    var minCount = 1;
    var beginAmount = 1;
    minCount = $('.de-cal-content .amount-input').val();
    var data_unit = '';

    data_unit = $('.unit-detail-freight-cost').attr('data-unit-config');

    if (typeof data_unit !== 'undefined') {
        data_unit = JSON.parse(data_unit);
    }

    if (typeof data_unit === 'object') {
        beginAmount = parseInt(data_unit.beginAmount);
    }

    var amount = 0;
    countselected = $('.list-leading .unit-detail-spec-operator').length;
    if (countselected > 0) {
        countselected = 0;
        countselected = $('.list-leading .selected').length;
        if (countselected == 0) {
            showTbeMeasage('Thông báo', 'Bạn chưa chọn thuộc tính cho sản phẩm.');
            scrollToAlert();
            return false;
        }
    }
    var totalAmount = 0;
    var amount1688Com = $('.amount .amount-input, .obj-amount .amount-input');
    if (typeof amount1688Com !== 'undefined' && amount1688Com.length) {
        amount1688Com.each(function(ind, el) {
            totalAmount += isNaN(parseInt(el.value)) ? 0 : parseInt(el.value);
        });
    } else {
        amount1688Com = $('.area-panel .unit-detail-amount-control .amount-input');
        if (typeof amount1688Com !== 'undefined') {
            totalAmount = isNaN(parseInt(amount1688Com.val())) ? 0 : parseInt(amount1688Com.val());
        }
    }

    if (totalAmount === 0) {
        showTbeMeasage('Thông báo', 'Bạn chưa chọn số lượng sản phẩm cần mua.');
        scrollToAlert();
        return false;
    } else {
        var hasError = false;

        // Shop yêu cầu mua tối thiếu số lượng สินค้า
        //if (totalAmount < beginAmount) {
        //    showTbeMeasage('Thông báo', 'Shop yêu cầu mua tối thiểu ' + beginAmount + ' sản phẩm.');
        //    scrollToAlert();
        //    hasError = true;
        //    return false;
        //}

        // Kiểm tra số lượng vượt quá trong từng chủng loại của sản phẩm
        var tmp, qty, item, objTitle;
        var tableSku = $('.table-sku tr');
        if (tableSku.length > 0) {
            for (var i = 0; i < tableSku.length; i++) {
                item = tableSku[i];
                tmp = $(item).data('sku-config');
                qty = $(item)
                    .find('.amount-input')
                    .val();
                qty = parseInt(qty);
                objTitle = $('.obj-sku .obj-title').html();

                var maxValue = parseInt(
                    $(item)
                        .find('td.count .value')
                        .html()
                );

                if (qty > maxValue) {
                    showTbeMeasage(
                        'Thông báo',
                        'Shop chỉ còn "' + maxValue + '" ' + objTitle + ' "' + tmp.skuName + '"'
                    );
                    hasError = true;
                    return false;
                }

                if (qty < tmp.min) {
                    showTbeMeasage(
                        'Thông báo',
                        'Shop yêu cầu mua ít nhất "' + tmp.min + '" ' + objTitle + ' "' + tmp.skuName + '"'
                    );
                    hasError = true;
                    return false;
                }
            }
        }

        return hasError ? false : true;
    }
}

function retnum(str) {
    var num = str.replace(/[^0-9]/g, '');
    return num;
}

function getlocalData(key) {
    if (typeof Storage !== 'undefined') {
        return localStorage.getItem(key);
    } else {
        console.log('Sorry! No Web Storage support..');
        return false;
    }
}

function taobaoSkuId(size, color) {
    var skuid = ';' + size + ';' + color + ';';
    var unskuid = ';' + color + ';' + size + ';';
    var tmp_pro = JSON.parse(getlocalData('tmp_g_config'));
    if (typeof tmp_pro === 'object') {
        if (typeof tmp_pro.skuInfo !== 'undefined' && typeof tmp_pro.skuInfo.skuMap !== 'undefined') {
            tmp_pro = tmp_pro.skuInfo.skuMap;
            if (typeof tmp_pro === 'object') {
                $.each(tmp_pro, function(key, value) {
                    if (key == skuid) {
                        skuid = value.skuId;
                    } else if (key == unskuid) {
                        skuid = value.skuId;
                    }
                });
            } else {
                skuid = null;
            }
        } else {
            skuid = null;
        }
    }

    return skuid;
}
function taobaoShopNick() {
    var nick = '';
    var tmp_pro = JSON.parse(getlocalData('tmp_g_config'));
    if (typeof tmp_pro === 'object') {
        if (typeof tmp_pro.fav !== 'undefined' && typeof tmp_pro.fav.shopTitle !== 'undefined') {
            nick = decodeURIComponent(tmp_pro.fav.shopTitle);
        }
    }
    if (!nick.length) {
        var shop_nick = $('.tb-shop-name a, .shop-name a.shop-name-link');
        if (typeof shop_nick !== 'undefined') {
            nick = $(shop_nick).attr('title');
        }
        if (typeof nick === 'undefined' || !nick.length) {
            nick = $(shop_nick).text();
        }
    }
    return nick;
}
function taobaoShopLink() {
    var link = '';
    var shop_link = $('.tb-shop-name a, .shop-name a.shop-name-link');
    if (typeof shop_link !== 'undefined') {
        link = $(shop_link).attr('href');
    }
    link = changeLink(link);
    return link;
}
function tmallShopNick() {
    var nick = '';
    var shop_nick = $('.shopLink');
    if (typeof shop_nick !== 'undefined') {
        nick = $(shop_nick).text();
    }
    if (!nick.length) {
        var tmp_pro = JSON.parse(getlocalData('tmp_g_config'));
        if (typeof tmp_pro === 'object') {
            if (typeof tmp_pro.sellerNickName !== 'undefined') {
                nick = decodeURIComponent(tmp_pro.sellerNickName);
            }
        }
    }
    return nick;
}
function tmallShopLink() {
    var link = '';
    var shop_link = $('.shopLink');
    if (typeof shop_link === 'undefined' || !shop_link.length) {
        shop_link = $('.hd-shop-name a, .slogo-shopname');
    }
    if (typeof shop_link !== 'undefined' && shop_link.length) {
        link = $(shop_link).attr('href');
    }
    link = changeLink(link);
    return link;
}
function com1688ShopNick() {
    var nick_shop = '';
    var nick = $(
        '.app-common_supplierInfoSmall, .app-import_supplierInfoSmall, .app-smt_supplierInfoSmall, .app-offerdetail_topbar, .app-yuan_supplierInfoSmall'
    );
    if (typeof nick !== 'undefined' && nick.length) {
        nick = nick.attr('data-view-config');
        if (nick.length) {
            nick = JSON.parse(nick);
        }
        if (typeof nick === 'object' && typeof nick.loginId !== 'undefined') {
            nick_shop = nick.loginId;
        }
    }
    if (nick_shop !== 'undefined' && nick_shop.length === 0) {
        nick_shop = $("meta[property='og:product:nick']").attr('content');
        if (nick_shop.length) {
            var start = 0;
            var end = nick_shop.indexOf('url=');
            if (end > 0) {
                nick_shop = nick_shop.slice(start, end);
            }
            nick_shop = nick_shop.replace('name=', '');
            nick_shop = nick_shop.replace(';', '');
            nick_shop = nick_shop.trim();
        }
    }
    // }
    return nick_shop;
}
function com1688ShopLink() {
    var link_shop = '';
    var link = $(
        '.app-offerdetail_topbar, .app-import_topbar, .app-smt_topbar, .app-offerdetail_topbar, .app-common_topbar'
    );
    if (typeof link !== 'undefined' && link.length) {
        link = $(link).attr('data-view-config');
        if (link.length) {
            link = JSON.parse(link);
            if (typeof link === 'object' && typeof link.currentDomainUrl !== 'undefined') {
                link_shop = link.currentDomainUrl;
            }
        } else {
            link_shop = $('input.currentdomain').val();
        }
    }

    if (link_shop == null) {
        link_shop = $('a[data-tracelog="wp_widget_supplierinfo_compname"]').attr('href');
    }

    link_shop = changeLink(link_shop);
    return link_shop;
}

function $_GET(param) {
    var vars = {};
    window.location.href.replace(
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function(m, key, value) {
            // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if (param) {
        return vars[param] ? vars[param] : null;
    }
    return vars;
}

function changeLink(link) {
    if (typeof link !== 'undefined' && link.length > 0) {
        link = link.replace('http:', '');
        link = link.replace('https:', '');
        link = link.replace('//', '');
        link = 'https://' + link;
        return link;
    } else {
        return false;
    }
}

function checkLinkWarning() {
    var warn = $('.warning-info .sea-iconfont.warn-icon').length;
    if (typeof warn === 'undefined') {
        return true;
    } else if (warn) {
        return true;
    } else {
        return false;
    }
}

function getSingleProduct1688Com() {
    var newProduct = {
        img: '',
        list: []
    };
    var price = $('.price td .value:first, .price-now');
    if (typeof price !== 'undefined') {
        price = parseFloat(price.text());
    } else {
        price = 0;
    }
    var qty = $('.unit-detail-amount-control .amount-input');
    if (typeof qty !== 'undefined') {
        qty = parseInt(qty.val());
    } else {
        qty = 0;
    }

    var structure = {
        color: '',
        isMix: 'false',
        max: tbeInventory,
        min: tbleBegin,
        mixAmount: '0',
        mixBegin: '0',
        mixNumber: '0',
        price: price,
        qty: qty,
        size: '',
        skuName: '',
        wsRuleNum: '',
        wsRuleUnit: ''
    };

    newProduct.list.push(structure);
    var img = $('.mod-detail-gallery .tab-pane .box-img img');
    if (typeof img !== 'undefined') {
        img = img.attr('src');
    }
    if (typeof img !== 'undefined' && img.length) {
        newProduct.img = img;
    }
    return newProduct;
}

function flyToCart() {
    if (currentDomain === '1688') {
        return flyToCart1();
    }
    var cart = $('#tbe-btn-show-cart');
    var imgtodrag = $(rules[currentDomain].crawle.image).eq(0);
    if (imgtodrag) {
        var imgclone = imgtodrag
            .clone()
            .offset({
                top: imgtodrag.offset().top,
                left: imgtodrag.offset().left
            })
            .css({
                opacity: '0.5',
                position: 'absolute',
                height: '150px',
                width: '150px',
                'z-index': '100000000'
            })
            .appendTo($('body'))
            .animate(
                {
                    top: cart.offset().top + 10,
                    left: cart.offset().left + 10,
                    width: 75,
                    height: 75
                },
                2000,
                'easeInOutExpo'
            );

        showTbeMeasage('Thông báo', '<p>Đã thêm sản phẩm vào giỏ hàng</p>');

        imgclone.animate(
            {
                width: 0,
                height: 0
            },
            function() {
                if ($(this).detach()) {
                }
            }
        );
    }
}

function flyToCart1() {
    var cart = $('#tbe-btn-show-cart');
    var imgtofly = $(rules[currentDomain].crawle.image).eq(0);
    if (imgtofly) {
        var imgclone = imgtofly
            .clone()
            .offset({top: imgtofly.offset().top, left: imgtofly.offset().left})
            .css({opacity: '0.7', position: 'absolute', height: '150px', width: '150px', 'z-index': '100000'})
            .appendTo($('body'))
            .animate(
                {
                    top: cart.offset().top + 10,
                    left: cart.offset().left + 30,
                    width: 55,
                    height: 55
                },
                2000,
                'easeInElastic'
            );

        showTbeMeasage('Thông báo', '<p>Đã thêm sản phẩm vào giỏ hàng</p>');
        imgclone.animate({width: 0, height: 0}, function() {
            $(this).detach();
        });
    }
    return false;
}

function fixPriceForGoogleTranslate(input_price) {
    if (input_price.indexOf(',') > -1) {
        input_price = input_price.replace('.', '');
        input_price = input_price.replace(',', '.');
    }
    return parseFloat(input_price);
}

function scrollToAlert() {
    if (
        $('#J_isSku, #J_isku, .d-content .obj-sku, .tb-sku > .tb-prop').length &&
        $('#J_SKU, .mod-detail-purchasing, #J_DetailMeta .tb-sku, #J_isku>.tb-skin>.tb-prop').length
    ) {
        $('#J_isSku, #J_isku, #J_DetailMeta .tb-sku, .d-content .obj-sku').addClass('tbe-bd-width tbe-bd-warning');
        $('html, body').animate(
            {
                scrollTop: $('#detail, #J_isku, #mod-detail').offset().top
            },
            2000
        );
    }
}
//
$(document).ready(function() {
    $(
        '#J_SKU .J_SKU > a, .mod-detail-purchasing .obj-content a, .tb-prop .J_TSaleProp a, .tb-sku .J_TSaleProp a'
    ).click(function() {
        if ($('#J_isSku, #J_isku, #J_DetailMeta .tb-sku, .d-content .obj-sku').hasClass('tbe-bd-warning')) {
            $('#J_isSku, #J_isku, #J_DetailMeta .tb-sku, .d-content .obj-sku').removeClass('tbe-bd-warning');
        }
    });
});
//end

function showTbeMeasage(type, msg) {
    var myTimeOut;
    $('#tbe-warning-bar').html(msg);
    $('#tbe-warning-bar').show();
    myTimeOut = setTimeout(function() {
        $('#tbe-warning-bar').hide();
    }, 3000);
    $('#tbe-warning-bar').mouseout(function() {
        myTimeOut = setTimeout(function() {
            $('#tbe-warning-bar').hide();
        }, 3000);
    });

    $('#tbe-warning-bar').mouseover(function() {
        clearTimeout(myTimeOut);
    });
}
function getProduct1688() {
    var result = [];
    var price, size, qty;
    var list = [];
    var img1688 = $('.tab-pane img').attr('src');
    var color1688 = $('.list-leading .active .selected').attr('title');
    if (typeof color1688 === 'undefined') {
        color1688 = '';
    }
    if (typeof img1688 !== 'undefined') {
        img1688 = changeLink(img1688);
    }
    var tmp, item;
    var el_data = $('.table-sku tr');
    if (el_data.length) {
        for (var i = 0; i < el_data.length; i++) {
            item = el_data[i];
            tmp = $(item).data('sku-config');
            qty = $(item)
                .find('.amount-input')
                .val();
            qty = parseInt(qty);
            if (typeof qty !== 'undefined' && qty > 0) {
                price = $(item)
                    .find('.price .value')
                    .text();
                size = $(item)
                    .find('.name span')
                    .text();
                tmp.qty = qty;
                tmp.price = parseFloat(price);
                tmp.color = color1688;

                tmp.max = parseInt(
                    $(item)
                        .find('td.count .value')
                        .html()
                );

                list.push(tmp);
            }
        }
    }

    var structure = {
        color: color1688,
        img: img1688,
        list: list
    };
    result.push(structure);
    return result;
}

$(document).ready(function() {
    $('#btn-arrow').click(function() {
        if ($(this).hasClass('arrow-hide')) {
            $('#tbe-menubar').hide('slide', {direction: 'right'}, 2000);
            $(this).removeClass('arrow-hide');
            $(this).addClass('arrow-show');
        } else {
            $('#tbe-menubar').show('slide', {direction: 'right'}, 2000);
            $(this).removeClass('arrow-show');
            $(this).addClass('arrow-hide');
        }
    });
    //
});
