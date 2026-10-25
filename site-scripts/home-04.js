
window.RS_Pixels = {
  mapEvent: function(gaEvent, params) {
    // Meta Pixel (fbq) event mapping
    const fbqMap = {
      'tambah_keranjang': 'AddToCart',
      'lihat_produk': 'ViewContent',
      'buka_kategori': 'ViewContent',
      'cari_barang': 'Search',
      'kirim_ke_admin': 'InitiateCheckout',
      'page_view': 'PageView'
    };
    // TikTok Pixel (ttq) event mapping
    const ttqMap = {
      'tambah_keranjang': 'AddToCart',
      'lihat_produk': 'ViewContent',
      'buka_kategori': 'ViewContent',
      'cari_barang': 'Search',
      'kirim_ke_admin': 'InitiateCheckout',
      'page_view': 'PageView'
    };
    const fbqEvent = fbqMap[gaEvent];
    const ttqEvent = ttqMap[gaEvent];
    const value = params?.price || params?.value || 0;
    const currency = params?.currency || 'IDR';
    const contentName = params?.nama_produk || params?.content_name || '';
    const contentCategory = params?.kategori || params?.content_category || '';
    const searchString = params?.kata_cari || params?.search_string || '';
    const contentIds = params?.content_ids || [];
    const numItems = params?.jumlah_item || 1;

    if (fbqEvent && typeof fbq === 'function') {
      const fbqParams = { currency, value };
      if (contentName) fbqParams.content_name = contentName;
      if (contentCategory) fbqParams.content_category = contentCategory;
      if (searchString) fbqParams.search_string = searchString;
      if (contentIds.length) fbqParams.content_ids = contentIds;
      fbq('track', fbqEvent, fbqParams);
    }
    if (ttqEvent && typeof ttq === 'function') {
      const ttqParams = { currency, value, content_name: contentName, content_type: 'product' };
      if (searchString) ttqParams.search_string = searchString;
      if (contentCategory) ttqParams.content_category = contentCategory;
      ttq.track(ttqEvent, ttqParams);
    }
  }
};
