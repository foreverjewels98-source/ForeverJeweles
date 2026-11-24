/**
 * ForeverJewells — Translation Dictionary
 * Supports: English (US/UK), Hindi, Japanese, Spanish, French, German, Arabic
 */

export type LanguageCode = 'en' | 'hi' | 'ja' | 'es' | 'fr' | 'de' | 'ar';

export interface Translations {
  nav: {
    home: string; shop: string; rings: string; bands: string;
    necklaces: string; earrings: string; bracelets: string;
    search: string; cart: string; settings: string;
  };
  common: {
    loading: string; noResults: string; back: string; viewAll: string;
    addToCart: string; buyNow: string; save: string; cancel: string;
    close: string; filter: string; sortBy: string; price: string;
    priceAsc: string; priceDesc: string; newest: string; popular: string;
    clearAll: string; page: string; of: string; next: string; prev: string;
    copy: string; share: string; inStock: string; outOfStock: string;
  };
  home: {
    heroTitle: string; heroSubtitle: string; heroTagline: string;
    exploreBtn: string; ctaBtn: string; featuredTitle: string;
    featuredSubtitle: string; categoriesTitle: string; whyUsTitle: string;
    trustBadge1: string; trustBadge2: string; trustBadge3: string;
    trustBadge4: string; testimonialTitle: string; newArrivalsTitle: string;
  };
  product: {
    details: string; selectSize: string; selectMetal: string;
    addToCartBtn: string; buyNowBtn: string; shareWhatsApp: string;
    certifiedBy: string; lifetimeBuyback: string; freeDelivery: string;
    description: string; specifications: string; careInstructions: string;
    relatedProducts: string; chooseOptions: string; ringSize: string;
    metal: string; quantity: string; sku: string; category: string;
    tags: string; inStock: string; lowStock: string; deliveryIn: string;
  };
  cart: {
    title: string; empty: string; total: string; checkout: string;
    continueShopping: string; remove: string; qty: string;
    orderSummary: string; subtotal: string; shipping: string;
    freeShipping: string; tax: string; whatsappOrder: string;
  };
  search: {
    placeholder: string; results: string; noResults: string; tryDifferent: string;
  };
  contact: {
    title: string; subtitle: string; name: string; email: string;
    message: string; send: string; whatsapp: string;
  };
  settings: {
    title: string; subtitle: string; region: string; language: string;
    currency: string; saveBtn: string; cancelBtn: string; saved: string;
  };
  footer: {
    description: string; quickLinks: string; collections: string;
    support: string; policies: string; copyright: string;
    contactUs: string; followUs: string;
  };
  categories: {
    all: string; rings: string; bands: string; ringSets: string;
    necklaces: string; earrings: string; bracelets: string;
    prideRings: string; noseRings: string;
  };
  trust: {
    certified: string; buyback: string; delivery: string;
    hallmark: string; exchange: string;
  };
}

const en: Translations = {
  nav: { home:'Home', shop:'Shop All', rings:'Rings', bands:'Bands', necklaces:'Necklaces', earrings:'Earrings', bracelets:'Bracelets', search:'Search', cart:'Cart', settings:'Language & Currency' },
  common: { loading:'Loading…', noResults:'No results found', back:'Back', viewAll:'View All', addToCart:'Add to Cart', buyNow:'Buy Now', save:'Save', cancel:'Cancel', close:'Close', filter:'Filter', sortBy:'Sort by', price:'Price', priceAsc:'Price: Low to High', priceDesc:'Price: High to Low', newest:'Newest', popular:'Popular', clearAll:'Clear All', page:'Page', of:'of', next:'Next', prev:'Prev', copy:'Copy', share:'Share', inStock:'In Stock', outOfStock:'Out of Stock' },
  home: { heroTitle:'Crafted for Eternity', heroSubtitle:'VVS1 D-Color Moissanite Fine Jewelry', heroTagline:'GRA Certified · Lifetime Buyback · Free Insured Delivery', exploreBtn:'Explore Collection', ctaBtn:'Shop Now', featuredTitle:'Featured Collections', featuredSubtitle:'Handcrafted with love, certified for life', categoriesTitle:'Shop by Category', whyUsTitle:'Why ForeverJewells', trustBadge1:'GRA Certified', trustBadge2:'Lifetime Buyback', trustBadge3:'Free Delivery', trustBadge4:'Hallmarked Gold', testimonialTitle:'What Our Customers Say', newArrivalsTitle:'New Arrivals' },
  product: { details:'Product Details', selectSize:'Select Size', selectMetal:'Select Metal', addToCartBtn:'Add to Cart', buyNowBtn:'Buy Now', shareWhatsApp:'Share on WhatsApp', certifiedBy:'GRA Certified', lifetimeBuyback:'Lifetime Buyback', freeDelivery:'Free Insured Delivery', description:'Description', specifications:'Specifications', careInstructions:'Care Instructions', relatedProducts:'You May Also Like', chooseOptions:'Choose Options', ringSize:'Ring Size', metal:'Metal', quantity:'Quantity', sku:'SKU', category:'Category', tags:'Tags', inStock:'In Stock', lowStock:'Only a few left!', deliveryIn:'Delivered in 5–7 days' },
  cart: { title:'Your Cart', empty:'Your cart is empty', total:'Total', checkout:'Checkout via WhatsApp', continueShopping:'Continue Shopping', remove:'Remove', qty:'Qty', orderSummary:'Order Summary', subtotal:'Subtotal', shipping:'Shipping', freeShipping:'Free', tax:'Tax', whatsappOrder:'Place Order on WhatsApp' },
  search: { placeholder:'Search rings, necklaces, earrings…', results:'results found', noResults:'No products found for', tryDifferent:'Try a different search term or browse our collections.' },
  contact: { title:'Get in Touch', subtitle:"We'd love to hear from you", name:'Your Name', email:'Email Address', message:'Message', send:'Send Message', whatsapp:'Chat on WhatsApp' },
  settings: { title:'Update your settings', subtitle:'Set your region, language, and currency.', region:'Region / Country', language:'Language', currency:'Currency', saveBtn:'Save', cancelBtn:'Cancel', saved:'Saved!' },
  footer: { description:'Crafting timeless moissanite jewelry with love from India.', quickLinks:'Quick Links', collections:'Collections', support:'Support', policies:'Policies', copyright:'© 2025 ForeverJewells. All rights reserved.', contactUs:'Contact Us', followUs:'Follow Us' },
  categories: { all:'All Products', rings:'Solitaire Rings', bands:'Wedding Bands', ringSets:'Bridal Sets', necklaces:'Necklaces', earrings:'Earrings', bracelets:'Bracelets', prideRings:'Pride Rings', noseRings:'Nose Jewelry' },
  trust: { certified:'GRA Certified Moissanite', buyback:'100% Lifetime Buyback', delivery:'Free Insured Delivery', hallmark:'BIS Hallmarked Gold', exchange:'30-Day Easy Exchange' },
};

const hi: Translations = {
  nav: { home:'होम', shop:'सभी खरीदें', rings:'अंगूठियाँ', bands:'बैंड', necklaces:'हार', earrings:'कान के टॉप्स', bracelets:'कंगन', search:'खोजें', cart:'कार्ट', settings:'भाषा और मुद्रा' },
  common: { loading:'लोड हो रहा है…', noResults:'कोई परिणाम नहीं मिला', back:'वापस', viewAll:'सभी देखें', addToCart:'कार्ट में जोड़ें', buyNow:'अभी खरीदें', save:'सहेजें', cancel:'रद्द करें', close:'बंद करें', filter:'फ़िल्टर', sortBy:'क्रमबद्ध करें', price:'मूल्य', priceAsc:'मूल्य: कम से अधिक', priceDesc:'मूल्य: अधिक से कम', newest:'नए', popular:'लोकप्रिय', clearAll:'सभी हटाएं', page:'पृष्ठ', of:'में से', next:'अगला', prev:'पिछला', copy:'कॉपी करें', share:'शेयर करें', inStock:'स्टॉक में', outOfStock:'स्टॉक में नहीं' },
  home: { heroTitle:'अनंत काल के लिए बनाया गया', heroSubtitle:'VVS1 D-रंग मॉइसनाइट फाइन ज्वेलरी', heroTagline:'GRA प्रमाणित · आजीवन बायबैक · निःशुल्क बीमा डिलीवरी', exploreBtn:'कलेक्शन देखें', ctaBtn:'अभी खरीदें', featuredTitle:'विशेष संग्रह', featuredSubtitle:'प्यार से हस्तनिर्मित, जीवन भर के लिए प्रमाणित', categoriesTitle:'श्रेणी के अनुसार खरीदें', whyUsTitle:'ForeverJewells क्यों?', trustBadge1:'GRA प्रमाणित', trustBadge2:'आजीवन बायबैक', trustBadge3:'निःशुल्क डिलीवरी', trustBadge4:'हॉलमार्क सोना', testimonialTitle:'ग्राहक क्या कहते हैं', newArrivalsTitle:'नए आगमन' },
  product: { details:'उत्पाद विवरण', selectSize:'साइज़ चुनें', selectMetal:'धातु चुनें', addToCartBtn:'कार्ट में जोड़ें', buyNowBtn:'अभी खरीदें', shareWhatsApp:'WhatsApp पर शेयर करें', certifiedBy:'GRA प्रमाणित', lifetimeBuyback:'आजीवन बायबैक', freeDelivery:'निःशुल्क बीमा डिलीवरी', description:'विवरण', specifications:'विशेषताएं', careInstructions:'देखभाल के निर्देश', relatedProducts:'आपको यह भी पसंद आ सकता है', chooseOptions:'विकल्प चुनें', ringSize:'अंगूठी का साइज़', metal:'धातु', quantity:'मात्रा', sku:'SKU', category:'श्रेणी', tags:'टैग्स', inStock:'स्टॉक में', lowStock:'केवल कुछ बचे हैं!', deliveryIn:'5-7 दिनों में डिलीवरी' },
  cart: { title:'आपकी कार्ट', empty:'आपकी कार्ट खाली है', total:'कुल', checkout:'WhatsApp से ऑर्डर करें', continueShopping:'खरीदारी जारी रखें', remove:'हटाएं', qty:'मात्रा', orderSummary:'ऑर्डर सारांश', subtotal:'उप-कुल', shipping:'शिपिंग', freeShipping:'निःशुल्क', tax:'कर', whatsappOrder:'WhatsApp पर ऑर्डर करें' },
  search: { placeholder:'अंगूठी, हार, कान के टॉप्स खोजें…', results:'परिणाम मिले', noResults:'कोई उत्पाद नहीं मिला', tryDifferent:'अलग खोज शब्द आज़माएं या हमारा संग्रह देखें।' },
  contact: { title:'संपर्क करें', subtitle:'हम आपसे सुनना चाहते हैं', name:'आपका नाम', email:'ईमेल पता', message:'संदेश', send:'संदेश भेजें', whatsapp:'WhatsApp पर चैट करें' },
  settings: { title:'सेटिंग्स अपडेट करें', subtitle:'अपना क्षेत्र, भाषा और मुद्रा सेट करें।', region:'क्षेत्र / देश', language:'भाषा', currency:'मुद्रा', saveBtn:'सहेजें', cancelBtn:'रद्द करें', saved:'सहेजा गया!' },
  footer: { description:'भारत से प्यार के साथ अनंत मॉइसनाइट ज्वेलरी बनाना।', quickLinks:'त्वरित लिंक', collections:'संग्रह', support:'सहायता', policies:'नीतियां', copyright:'© 2025 ForeverJewells. सर्वाधिकार सुरक्षित।', contactUs:'संपर्क करें', followUs:'फॉलो करें' },
  categories: { all:'सभी उत्पाद', rings:'सोलिटेयर अंगूठियाँ', bands:'वेडिंग बैंड', ringSets:'ब्राइडल सेट', necklaces:'हार', earrings:'कान के टॉप्स', bracelets:'कंगन', prideRings:'प्राइड रिंग्स', noseRings:'नोज़ ज्वेलरी' },
  trust: { certified:'GRA प्रमाणित मॉइसनाइट', buyback:'100% आजीवन बायबैक', delivery:'निःशुल्क बीमा डिलीवरी', hallmark:'BIS हॉलमार्क सोना', exchange:'30 दिन आसान एक्सचेंज' },
};

const ja: Translations = {
  nav: { home:'ホーム', shop:'すべて購入', rings:'指輪', bands:'バンド', necklaces:'ネックレス', earrings:'イヤリング', bracelets:'ブレスレット', search:'検索', cart:'カート', settings:'言語と通貨' },
  common: { loading:'読み込み中…', noResults:'結果が見つかりません', back:'戻る', viewAll:'すべて見る', addToCart:'カートに追加', buyNow:'今すぐ購入', save:'保存', cancel:'キャンセル', close:'閉じる', filter:'フィルター', sortBy:'並び替え', price:'価格', priceAsc:'価格：低い順', priceDesc:'価格：高い順', newest:'新着', popular:'人気', clearAll:'すべてクリア', page:'ページ', of:'/', next:'次へ', prev:'前へ', copy:'コピー', share:'シェア', inStock:'在庫あり', outOfStock:'在庫切れ' },
  home: { heroTitle:'永遠のために作られた', heroSubtitle:'VVS1 Dカラー モアサナイト ファインジュエリー', heroTagline:'GRA認定 · 生涯買取保証 · 無料保険配送', exploreBtn:'コレクションを見る', ctaBtn:'今すぐ購入', featuredTitle:'おすすめコレクション', featuredSubtitle:'愛を込めた手作り、一生涯の証明書付き', categoriesTitle:'カテゴリーから選ぶ', whyUsTitle:'ForeverJewellsを選ぶ理由', trustBadge1:'GRA認定', trustBadge2:'生涯買取', trustBadge3:'無料配送', trustBadge4:'金の刻印', testimonialTitle:'お客様の声', newArrivalsTitle:'新着商品' },
  product: { details:'商品詳細', selectSize:'サイズを選択', selectMetal:'素材を選択', addToCartBtn:'カートに追加', buyNowBtn:'今すぐ購入', shareWhatsApp:'WhatsAppでシェア', certifiedBy:'GRA認定', lifetimeBuyback:'生涯買取保証', freeDelivery:'無料保険配送', description:'説明', specifications:'仕様', careInstructions:'お手入れ方法', relatedProducts:'こちらもおすすめ', chooseOptions:'オプションを選択', ringSize:'指輪のサイズ', metal:'素材', quantity:'数量', sku:'SKU', category:'カテゴリー', tags:'タグ', inStock:'在庫あり', lowStock:'残りわずか！', deliveryIn:'5〜7日以内にお届け' },
  cart: { title:'カート', empty:'カートは空です', total:'合計', checkout:'WhatsAppで注文', continueShopping:'ショッピングを続ける', remove:'削除', qty:'数量', orderSummary:'注文概要', subtotal:'小計', shipping:'配送', freeShipping:'無料', tax:'税金', whatsappOrder:'WhatsAppで注文する' },
  search: { placeholder:'指輪、ネックレス、イヤリングを検索…', results:'件の結果', noResults:'商品が見つかりません', tryDifferent:'別の検索ワードを試すか、コレクションをご覧ください。' },
  contact: { title:'お問い合わせ', subtitle:'ご連絡をお待ちしております', name:'お名前', email:'メールアドレス', message:'メッセージ', send:'メッセージを送る', whatsapp:'WhatsAppでチャット' },
  settings: { title:'設定を更新', subtitle:'地域、言語、通貨を設定してください。', region:'地域 / 国', language:'言語', currency:'通貨', saveBtn:'保存', cancelBtn:'キャンセル', saved:'保存しました！' },
  footer: { description:'インドから愛を込めて永遠のモアサナイトジュエリーを制作。', quickLinks:'クイックリンク', collections:'コレクション', support:'サポート', policies:'ポリシー', copyright:'© 2025 ForeverJewells. All rights reserved.', contactUs:'お問い合わせ', followUs:'フォロー' },
  categories: { all:'全商品', rings:'ソリティアリング', bands:'ウェディングバンド', ringSets:'ブライダルセット', necklaces:'ネックレス', earrings:'イヤリング', bracelets:'ブレスレット', prideRings:'プライドリング', noseRings:'ノーズジュエリー' },
  trust: { certified:'GRA認定モアサナイト', buyback:'100%生涯買取保証', delivery:'無料保険配送', hallmark:'BIS刻印金', exchange:'30日間簡単交換' },
};

const es: Translations = {
  nav: { home:'Inicio', shop:'Tienda', rings:'Anillos', bands:'Alianzas', necklaces:'Collares', earrings:'Pendientes', bracelets:'Pulseras', search:'Buscar', cart:'Carrito', settings:'Idioma y Moneda' },
  common: { loading:'Cargando…', noResults:'Sin resultados', back:'Volver', viewAll:'Ver todo', addToCart:'Agregar al carrito', buyNow:'Comprar ahora', save:'Guardar', cancel:'Cancelar', close:'Cerrar', filter:'Filtrar', sortBy:'Ordenar por', price:'Precio', priceAsc:'Precio: menor a mayor', priceDesc:'Precio: mayor a menor', newest:'Más nuevos', popular:'Populares', clearAll:'Limpiar todo', page:'Página', of:'de', next:'Siguiente', prev:'Anterior', copy:'Copiar', share:'Compartir', inStock:'En stock', outOfStock:'Agotado' },
  home: { heroTitle:'Creado para la Eternidad', heroSubtitle:'Joyería Fina de Moissanite VVS1 Color D', heroTagline:'Certificado GRA · Recompra de por Vida · Envío Asegurado Gratis', exploreBtn:'Explorar Colección', ctaBtn:'Comprar Ahora', featuredTitle:'Colecciones Destacadas', featuredSubtitle:'Hecho a mano con amor, certificado para siempre', categoriesTitle:'Comprar por Categoría', whyUsTitle:'Por qué ForeverJewells', trustBadge1:'Certificado GRA', trustBadge2:'Recompra de por Vida', trustBadge3:'Envío Gratis', trustBadge4:'Oro con Sello', testimonialTitle:'Lo que Dicen Nuestros Clientes', newArrivalsTitle:'Nuevas Llegadas' },
  product: { details:'Detalles del Producto', selectSize:'Seleccionar Talla', selectMetal:'Seleccionar Metal', addToCartBtn:'Agregar al Carrito', buyNowBtn:'Comprar Ahora', shareWhatsApp:'Compartir en WhatsApp', certifiedBy:'Certificado GRA', lifetimeBuyback:'Recompra de por Vida', freeDelivery:'Entrega Asegurada Gratis', description:'Descripción', specifications:'Especificaciones', careInstructions:'Instrucciones de Cuidado', relatedProducts:'También te Puede Gustar', chooseOptions:'Elegir Opciones', ringSize:'Talla del Anillo', metal:'Metal', quantity:'Cantidad', sku:'SKU', category:'Categoría', tags:'Etiquetas', inStock:'En Stock', lowStock:'¡Quedan pocos!', deliveryIn:'Entrega en 5-7 días' },
  cart: { title:'Tu Carrito', empty:'Tu carrito está vacío', total:'Total', checkout:'Pedir por WhatsApp', continueShopping:'Seguir Comprando', remove:'Eliminar', qty:'Cant.', orderSummary:'Resumen del Pedido', subtotal:'Subtotal', shipping:'Envío', freeShipping:'Gratis', tax:'Impuesto', whatsappOrder:'Hacer Pedido por WhatsApp' },
  search: { placeholder:'Buscar anillos, collares, pendientes…', results:'resultados encontrados', noResults:'No se encontraron productos para', tryDifferent:'Intenta con otro término o explora nuestras colecciones.' },
  contact: { title:'Contáctanos', subtitle:'Nos encantaría escucharte', name:'Tu Nombre', email:'Correo Electrónico', message:'Mensaje', send:'Enviar Mensaje', whatsapp:'Chatear por WhatsApp' },
  settings: { title:'Actualizar tu configuración', subtitle:'Establece tu región, idioma y moneda.', region:'Región / País', language:'Idioma', currency:'Moneda', saveBtn:'Guardar', cancelBtn:'Cancelar', saved:'¡Guardado!' },
  footer: { description:'Creando joyería de moissanite eterna con amor desde India.', quickLinks:'Enlaces Rápidos', collections:'Colecciones', support:'Soporte', policies:'Políticas', copyright:'© 2025 ForeverJewells. Todos los derechos reservados.', contactUs:'Contáctanos', followUs:'Síguenos' },
  categories: { all:'Todos los Productos', rings:'Anillos Solitario', bands:'Alianzas de Boda', ringSets:'Sets de Novia', necklaces:'Collares', earrings:'Pendientes', bracelets:'Pulseras', prideRings:'Anillos Pride', noseRings:'Joyería Nariz' },
  trust: { certified:'Moissanite Certificado GRA', buyback:'100% Recompra de por Vida', delivery:'Entrega Asegurada Gratis', hallmark:'Oro con Sello BIS', exchange:'Cambio Fácil en 30 Días' },
};

const fr: Translations = {
  nav: { home:'Accueil', shop:'Boutique', rings:'Bagues', bands:'Alliances', necklaces:'Colliers', earrings:"Boucles d'oreilles", bracelets:'Bracelets', search:'Rechercher', cart:'Panier', settings:'Langue et Devise' },
  common: { loading:'Chargement…', noResults:'Aucun résultat', back:'Retour', viewAll:'Voir tout', addToCart:'Ajouter au panier', buyNow:'Acheter maintenant', save:'Enregistrer', cancel:'Annuler', close:'Fermer', filter:'Filtrer', sortBy:'Trier par', price:'Prix', priceAsc:'Prix : croissant', priceDesc:'Prix : décroissant', newest:'Nouveautés', popular:'Populaires', clearAll:'Tout effacer', page:'Page', of:'sur', next:'Suivant', prev:'Précédent', copy:'Copier', share:'Partager', inStock:'En stock', outOfStock:'Épuisé' },
  home: { heroTitle:"Créé pour l'Éternité", heroSubtitle:'Bijoux fins en Moissanite VVS1 couleur D', heroTagline:'Certifié GRA · Rachat à vie · Livraison assurée gratuite', exploreBtn:'Explorer la Collection', ctaBtn:'Acheter Maintenant', featuredTitle:'Collections Vedettes', featuredSubtitle:'Fait à la main avec amour, certifié pour la vie', categoriesTitle:'Acheter par Catégorie', whyUsTitle:'Pourquoi ForeverJewells', trustBadge1:'Certifié GRA', trustBadge2:'Rachat à Vie', trustBadge3:'Livraison Gratuite', trustBadge4:'Or Poinçonné', testimonialTitle:'Ce que disent nos clients', newArrivalsTitle:'Nouveautés' },
  product: { details:'Détails du Produit', selectSize:'Choisir la Taille', selectMetal:'Choisir le Métal', addToCartBtn:'Ajouter au Panier', buyNowBtn:'Acheter Maintenant', shareWhatsApp:'Partager sur WhatsApp', certifiedBy:'Certifié GRA', lifetimeBuyback:'Rachat à Vie', freeDelivery:'Livraison Assurée Gratuite', description:'Description', specifications:'Spécifications', careInstructions:"Instructions d'entretien", relatedProducts:'Vous pourriez aussi aimer', chooseOptions:'Choisir les Options', ringSize:'Taille de la Bague', metal:'Métal', quantity:'Quantité', sku:'Référence', category:'Catégorie', tags:'Tags', inStock:'En Stock', lowStock:'Plus que quelques-uns !', deliveryIn:'Livraison en 5-7 jours' },
  cart: { title:'Votre Panier', empty:'Votre panier est vide', total:'Total', checkout:'Commander via WhatsApp', continueShopping:'Continuer les Achats', remove:'Supprimer', qty:'Qté', orderSummary:'Récapitulatif de la Commande', subtotal:'Sous-total', shipping:'Livraison', freeShipping:'Gratuit', tax:'Taxe', whatsappOrder:'Commander sur WhatsApp' },
  search: { placeholder:'Rechercher bagues, colliers, boucles…', results:'résultats trouvés', noResults:'Aucun produit trouvé pour', tryDifferent:'Essayez un autre terme ou parcourez nos collections.' },
  contact: { title:'Contactez-nous', subtitle:'Nous serions ravis de vous entendre', name:'Votre Nom', email:'Adresse Email', message:'Message', send:'Envoyer le Message', whatsapp:'Chatter sur WhatsApp' },
  settings: { title:'Mettre à jour vos paramètres', subtitle:'Définissez votre région, langue et devise.', region:'Région / Pays', language:'Langue', currency:'Devise', saveBtn:'Enregistrer', cancelBtn:'Annuler', saved:'Enregistré !' },
  footer: { description:"Créer des bijoux en moissanite intemporels avec amour depuis l'Inde.", quickLinks:'Liens Rapides', collections:'Collections', support:'Assistance', policies:'Politiques', copyright:'© 2025 ForeverJewells. Tous droits réservés.', contactUs:'Contactez-nous', followUs:'Suivez-nous' },
  categories: { all:'Tous les Produits', rings:'Bagues Solitaire', bands:'Alliances', ringSets:'Ensembles Mariée', necklaces:'Colliers', earrings:"Boucles d'Oreilles", bracelets:'Bracelets', prideRings:'Bagues Pride', noseRings:'Bijoux de Nez' },
  trust: { certified:'Moissanite Certifiée GRA', buyback:'100% Rachat à Vie', delivery:'Livraison Assurée Gratuite', hallmark:'Or Poinçonné BIS', exchange:'Échange Facile sous 30 Jours' },
};

const de: Translations = {
  nav: { home:'Startseite', shop:'Alle kaufen', rings:'Ringe', bands:'Bänder', necklaces:'Halsketten', earrings:'Ohrringe', bracelets:'Armbänder', search:'Suchen', cart:'Warenkorb', settings:'Sprache & Währung' },
  common: { loading:'Wird geladen…', noResults:'Keine Ergebnisse', back:'Zurück', viewAll:'Alle anzeigen', addToCart:'In den Warenkorb', buyNow:'Jetzt kaufen', save:'Speichern', cancel:'Abbrechen', close:'Schließen', filter:'Filtern', sortBy:'Sortieren nach', price:'Preis', priceAsc:'Preis: aufsteigend', priceDesc:'Preis: absteigend', newest:'Neueste', popular:'Beliebt', clearAll:'Alle löschen', page:'Seite', of:'von', next:'Weiter', prev:'Zurück', copy:'Kopieren', share:'Teilen', inStock:'Auf Lager', outOfStock:'Ausverkauft' },
  home: { heroTitle:'Für die Ewigkeit gefertigt', heroSubtitle:'VVS1 D-Farbe Moissanit Feinschmuck', heroTagline:'GRA-zertifiziert · Lebenslanger Rückkauf · Kostenloser Versand', exploreBtn:'Kollektion erkunden', ctaBtn:'Jetzt kaufen', featuredTitle:'Ausgewählte Kollektionen', featuredSubtitle:'Handgefertigt mit Liebe, lebenslang zertifiziert', categoriesTitle:'Nach Kategorie kaufen', whyUsTitle:'Warum ForeverJewells', trustBadge1:'GRA-zertifiziert', trustBadge2:'Lebenslanger Rückkauf', trustBadge3:'Kostenloser Versand', trustBadge4:'Goldstempel', testimonialTitle:'Was unsere Kunden sagen', newArrivalsTitle:'Neuheiten' },
  product: { details:'Produktdetails', selectSize:'Größe auswählen', selectMetal:'Metall auswählen', addToCartBtn:'In den Warenkorb', buyNowBtn:'Jetzt kaufen', shareWhatsApp:'Auf WhatsApp teilen', certifiedBy:'GRA-zertifiziert', lifetimeBuyback:'Lebenslanger Rückkauf', freeDelivery:'Kostenloser Versicherter Versand', description:'Beschreibung', specifications:'Spezifikationen', careInstructions:'Pflegehinweise', relatedProducts:'Das könnte Ihnen auch gefallen', chooseOptions:'Optionen wählen', ringSize:'Ringgröße', metal:'Metall', quantity:'Menge', sku:'Artikelnummer', category:'Kategorie', tags:'Tags', inStock:'Auf Lager', lowStock:'Nur noch wenige übrig!', deliveryIn:'Lieferung in 5-7 Tagen' },
  cart: { title:'Ihr Warenkorb', empty:'Ihr Warenkorb ist leer', total:'Gesamt', checkout:'Über WhatsApp bestellen', continueShopping:'Weiter einkaufen', remove:'Entfernen', qty:'Menge', orderSummary:'Bestellübersicht', subtotal:'Zwischensumme', shipping:'Versand', freeShipping:'Kostenlos', tax:'Steuer', whatsappOrder:'Über WhatsApp bestellen' },
  search: { placeholder:'Ringe, Halsketten, Ohrringe suchen…', results:'Ergebnisse gefunden', noResults:'Keine Produkte gefunden für', tryDifferent:'Versuchen Sie einen anderen Suchbegriff oder entdecken Sie unsere Kollektionen.' },
  contact: { title:'Kontaktieren Sie uns', subtitle:'Wir freuen uns von Ihnen zu hören', name:'Ihr Name', email:'E-Mail-Adresse', message:'Nachricht', send:'Nachricht senden', whatsapp:'Über WhatsApp chatten' },
  settings: { title:'Einstellungen aktualisieren', subtitle:'Legen Sie Ihre Region, Sprache und Währung fest.', region:'Region / Land', language:'Sprache', currency:'Währung', saveBtn:'Speichern', cancelBtn:'Abbrechen', saved:'Gespeichert!' },
  footer: { description:'Zeitlose Moissanit-Schmuckstücke mit Liebe aus Indien.', quickLinks:'Schnelllinks', collections:'Kollektionen', support:'Support', policies:'Richtlinien', copyright:'© 2025 ForeverJewells. Alle Rechte vorbehalten.', contactUs:'Kontakt', followUs:'Folgen Sie uns' },
  categories: { all:'Alle Produkte', rings:'Solitär-Ringe', bands:'Eheringe', ringSets:'Brautsets', necklaces:'Halsketten', earrings:'Ohrringe', bracelets:'Armbänder', prideRings:'Pride-Ringe', noseRings:'Nasenschmuck' },
  trust: { certified:'GRA-zertifizierter Moissanit', buyback:'100% lebenslanger Rückkauf', delivery:'Kostenloser versicherter Versand', hallmark:'BIS-gestempeltes Gold', exchange:'30 Tage einfacher Umtausch' },
};

const ar: Translations = {
  nav: { home:'الرئيسية', shop:'تسوق الكل', rings:'الخواتم', bands:'أطواق الزفاف', necklaces:'القلائد', earrings:'الأقراط', bracelets:'الأساور', search:'بحث', cart:'السلة', settings:'اللغة والعملة' },
  common: { loading:'جارٍ التحميل…', noResults:'لا توجد نتائج', back:'رجوع', viewAll:'عرض الكل', addToCart:'أضف إلى السلة', buyNow:'اشترِ الآن', save:'حفظ', cancel:'إلغاء', close:'إغلاق', filter:'تصفية', sortBy:'ترتيب حسب', price:'السعر', priceAsc:'السعر: من الأقل إلى الأعلى', priceDesc:'السعر: من الأعلى إلى الأقل', newest:'الأحدث', popular:'الأكثر شعبية', clearAll:'مسح الكل', page:'صفحة', of:'من', next:'التالي', prev:'السابق', copy:'نسخ', share:'مشاركة', inStock:'متوفر', outOfStock:'غير متوفر' },
  home: { heroTitle:'صُنع للأبد', heroSubtitle:'مجوهرات راقية من الموزانيت VVS1 اللون D', heroTagline:'معتمد GRA · استرداد مدى الحياة · توصيل مجاني مؤمَّن', exploreBtn:'استكشف المجموعة', ctaBtn:'تسوق الآن', featuredTitle:'المجموعات المميزة', featuredSubtitle:'مصنوع يدوياً بحب، معتمد مدى الحياة', categoriesTitle:'تسوق حسب الفئة', whyUsTitle:'لماذا ForeverJewells', trustBadge1:'معتمد GRA', trustBadge2:'استرداد مدى الحياة', trustBadge3:'توصيل مجاني', trustBadge4:'ذهب موسوم', testimonialTitle:'ماذا يقول عملاؤنا', newArrivalsTitle:'وصل حديثاً' },
  product: { details:'تفاصيل المنتج', selectSize:'اختر المقاس', selectMetal:'اختر المعدن', addToCartBtn:'أضف إلى السلة', buyNowBtn:'اشترِ الآن', shareWhatsApp:'مشاركة على واتساب', certifiedBy:'معتمد GRA', lifetimeBuyback:'استرداد مدى الحياة', freeDelivery:'توصيل مجاني مؤمَّن', description:'الوصف', specifications:'المواصفات', careInstructions:'تعليمات العناية', relatedProducts:'قد يعجبك أيضاً', chooseOptions:'اختر الخيارات', ringSize:'مقاس الخاتم', metal:'المعدن', quantity:'الكمية', sku:'الرمز', category:'الفئة', tags:'العلامات', inStock:'متوفر', lowStock:'بضع قطع فقط!', deliveryIn:'التوصيل خلال 5-7 أيام' },
  cart: { title:'سلة التسوق', empty:'سلتك فارغة', total:'المجموع', checkout:'الطلب عبر واتساب', continueShopping:'مواصلة التسوق', remove:'حذف', qty:'الكمية', orderSummary:'ملخص الطلب', subtotal:'المجموع الفرعي', shipping:'الشحن', freeShipping:'مجاني', tax:'الضريبة', whatsappOrder:'طلب عبر واتساب' },
  search: { placeholder:'ابحث عن الخواتم والقلائد والأقراط…', results:'نتيجة', noResults:'لا توجد منتجات لـ', tryDifferent:'جرب كلمة بحث أخرى أو تصفح مجموعاتنا.' },
  contact: { title:'تواصل معنا', subtitle:'يسعدنا سماعك', name:'اسمك', email:'البريد الإلكتروني', message:'الرسالة', send:'إرسال الرسالة', whatsapp:'الدردشة على واتساب' },
  settings: { title:'تحديث الإعدادات', subtitle:'حدد منطقتك ولغتك وعملتك.', region:'المنطقة / الدولة', language:'اللغة', currency:'العملة', saveBtn:'حفظ', cancelBtn:'إلغاء', saved:'تم الحفظ!' },
  footer: { description:'نصنع مجوهرات الموزانيت الخالدة بحب من الهند.', quickLinks:'روابط سريعة', collections:'المجموعات', support:'الدعم', policies:'السياسات', copyright:'© 2025 ForeverJewells. جميع الحقوق محفوظة.', contactUs:'تواصل معنا', followUs:'تابعنا' },
  categories: { all:'جميع المنتجات', rings:'خواتم سوليتير', bands:'أطواق الزفاف', ringSets:'طقم العروس', necklaces:'القلائد', earrings:'الأقراط', bracelets:'الأساور', prideRings:'خواتم برايد', noseRings:'مجوهرات الأنف' },
  trust: { certified:'موزانيت معتمد GRA', buyback:'100% استرداد مدى الحياة', delivery:'توصيل مجاني مؤمَّن', hallmark:'ذهب موسوم BIS', exchange:'استبدال سهل خلال 30 يوماً' },
};

export const TRANSLATIONS: Record<LanguageCode, Translations> = { en, hi, ja, es, fr, de, ar };

export const LANGUAGE_NAME_TO_CODE: Record<string, string> = {
  "English (US)": "en",
  "English (UK)": "en-GB",
  "हिंदी (Hindi)": "hi",
  "日本語 (Japanese)": "ja",
  "Español (Spanish)": "es",
  "Français (French)": "fr",
  "Deutsch (German)": "de",
  "عربي (Arabic)": "ar",
  "中文 (Simplified Chinese)": "zh-CN",
  "繁體中文 (Traditional Chinese)": "zh-TW",
  "한국어 (Korean)": "ko",
  "Italiano (Italian)": "it",
  "Português (Portuguese)": "pt",
  "Русский (Russian)": "ru",
  "বাংলা (Bengali)": "bn",
  "اردو (Urdu)": "ur",
  "Bahasa Indonesia (Indonesian)": "id",
  "Tiếng Việt (Vietnamese)": "vi",
  "Türkçe (Turkish)": "tr",
  "ไทย (Thai)": "th",
  "Nederlands (Dutch)": "nl",
  "Polski (Polish)": "pl",
  "Svenska (Swedish)": "sv",
  "Suomi (Finnish)": "fi",
  "Dansk (Danish)": "da",
  "Norsk (Norwegian)": "no",
  "Ελληνικά (Greek)": "el",
  "עברית (Hebrew)": "he",
  "Bahasa Melayu (Malay)": "ms",
  "Tagalog (Filipino)": "tl"
};

const BROWSER_LANG_TO_CODE: Record<string, LanguageCode> = {
  en: 'en', hi: 'hi', ja: 'ja', es: 'es', fr: 'fr', de: 'de', ar: 'ar',
};

export function detectBrowserLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.split('-')[0]?.toLowerCase() ?? 'en';
  return BROWSER_LANG_TO_CODE[lang] ?? 'en';
}

export function getTranslations(languageName: string): Translations {
  const code = LANGUAGE_NAME_TO_CODE[languageName] ?? 'en';
  return TRANSLATIONS[code as LanguageCode] ?? TRANSLATIONS.en;
}

export const RTL_LANGUAGES: string[] = ['ar', 'he', 'ur'];

export function isRTL(languageName: string): boolean {
  const code = LANGUAGE_NAME_TO_CODE[languageName] ?? 'en';
  return RTL_LANGUAGES.includes(code);
}
