var rules = {
	TAOBAO: {
		translate: {
			'originPrice': '#J_PriceName',
			'promoPrice': '#J_PriceName',
			'size': 'dt:contains("尺碼"), dt:contains("尺寸"), dt:contains("尺码"), dt:contains("参考身高"), dt:contains("鞋码"), dt:contains("大小描述")',
			'color': 'dt:contains("顏色"), dt:contains("颜色分类"), dt:contains("颜色")',
			'amount': 'dt:contains("數量"), dt:contains("数量")',
			'unit': '.tb-amount-widget .mui-amount-unit',
		},
		crawle: {
			'originPrice': '#J_priceStd .tb-rmb-num, #J_StrPrice',
			'promoPrice': '#J_PromoPrice .tb-rmb-num, #J_PromoPriceNum',
			'image': '#J_ThumbView, #J_ImgBooth',
			'shop_nick': '.tb-shop-name a',
			'shop_link': '.tb-shop-name a',
			'amount': '#J_IptAmount',
			'size': 'dt:contains("Kích thước"), dt:contains("kích thước"), dt:contains("Size"), dt:contains("size")',
			'color': 'dt:contains("Màu sắc"), dt:contains("màu sắc"), dt:contains("màu số"), dt:contains("Color"), dt:contains("color")',
			'lowPrice': 'span[itemprop="lowPrice"]',
			'highPrice': 'span[itemprop="highPrice"]'
		}
	},
	TMALL: {
		translate: {
			'originPrice': 'dt:contains("價格"), dt:contains("专柜价")',
			'promoPrice': 'dt:contains("促銷價")',
			'size': 'dt:contains("尺碼"), dt:contains("尺寸"), dt:contains("尺码"), dt:contains("套餐類型"), dt:contains("参考身高"), dt:contains("鞋码"), dt:contains("大小描述")',
			'color': 'dt:contains("顏色"), dt:contains("颜色")',
			'amount': 'dt:contains("數量"), dt:contains("数量")',
			'unit': '.tb-amount-widget .mui-amount-unit',
		},
		crawle: {
			'originPrice': '#J_DetailMeta > div.tm-clear > div.tb-property > div > div.tm-fcs-panel > dl.tm-tagPrice-panel > dd > span, #J_StrPriceModBox > dd > span',
			'promoPrice': '#J_PromoPrice > dd > div > span, #J_PromoBox > div > span',
			'image': '#J_ThumbView, #J_ImgBooth',
			'shop_nick': '.shopLink',
			'shop_link': '.shopLink',
			'amount': '#J_Amount input',
			'size': 'dt:contains("Kích thước"), dt:contains("kích thước"), dt:contains("Size"), dt:contains("size")',
			'color': 'dt:contains("Màu sắc"), dt:contains("màu sắc"), dt:contains("màu số"), dt:contains("Color"), dt:contains("color")',
			'lowPrice': '#J_PromoPrice .tm-price',
			'highPrice': '#J_PromoPrice .tm-price'
		}
	},
	'1688': {
		translate: {
			'originPrice': 'tr.price > td.price-title',
			'promoPrice': 'tr.price > td.price-title',
			'size': '.d-content .obj-sku .obj-title',
			'color': '.d-content .obj-leading .obj-title',
			'amount': '',
			'unit': '',
		},
		crawle: {
			'originPrice': '.tm-price-panel .tm-price',
			'promoPrice': '.tm-promo-panel .tm-price',
			'image': '.mod-detail-gallery img',
			'shop_nick': '#usermidid',
			'shop_link': '.currentdomain, .enname',
			'amount': '#J_Amount input',
			'size': '',
			'color': 'span.obj-title:contains("Màu sắc"), span.obj-title:contains("màu sắc"), dt:contains("Color"), dt:contains("color")',
			'lowPrice': '#J_PromoPrice .tm-price',
			'highPrice': '#J_PromoPrice .tm-price'
		}
	}
};
