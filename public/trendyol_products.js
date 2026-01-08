const puppeteer = require('puppeteer');
const fs = require('fs');

// ==========================================
// 1. KATEGORİ LİSTESİ 📋
// ==========================================

const ERKEK_KEYWORDS = [
    "Kazak", "Sweatshirt", "Pantolon", "Chino Pantolon", "Gömlek", 
    "Hırka", "Polar Sweatshirt", "Denim Pantolon", "Denim Gömlek", 
    "T-Shirt", "Polo T-shirt", "Takım Elbise", "Eşofman", "Şort", 
    "Denim Şort", "Mont", "Kaban", "Ceket", "Şişme Mont", 
    "Deri Ceket", "Trençkot", "Yelek"
];

const KADIN_KEYWORDS = [
    "Kazak", "Elbise", "Sweatshirt", "Gömlek", "Pantolon", 
    "Denim Pantolon", "Hırka", "Bluz", "Blazer Ceket", "Etek", 
    "T-Shirt", "Eşofman Takımı", "Atlet", "Polo T-shirt", 
    "Abiye Elbise", "Şort", "Tayt", "Mont", "Kaban", "Ceket", 
    "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", "Palto"
];

function generateCategoryList() {
    const list = [];
    
    ERKEK_KEYWORDS.forEach(kw => {
        const query = `Erkek ${kw}`;
        const encoded = encodeURIComponent(query);
        list.push({
            name: `Erkek - ${kw}`,
            keyword: kw,
            url: `https://www.trendyol.com/sr?q=${encoded}&qt=${encoded}&st=${encoded}&os=1`,
            gender: 'male'  // MODO format
        });
    });

    KADIN_KEYWORDS.forEach(kw => {
        const query = `Kadın ${kw}`;
        const encoded = encodeURIComponent(query);
        list.push({
            name: `Kadın - ${kw}`,
            keyword: kw,
            url: `https://www.trendyol.com/sr?q=${encoded}&qt=${encoded}&st=${encoded}&os=1`,
            gender: 'female'  // MODO format
        });
    });

    return list;
}

const CATEGORY_LIST = generateCategoryList();
console.log(`🤖 Toplam ${CATEGORY_LIST.length} farklı kategori taranacak!`);

const SELECTORS = {
    container: '.p-card-wrppr, .search-prodct-card, .product-card, .prdct-cntnr-wrppr, .product-item, .image-container, div[data-id]', 
    brand: '.prdct-desc-cntnr-ttl, .product-brand, .brand-name, .product-item-brand, .brand',
    title: '.prdct-desc-cntnr-name, .product-name, .name, .product-item-name, .product-desc',
    price: '.prc-box-dscntd, .prc-box-sllng, .product-price, .product-item-price, .price',
    image: '.p-card-img, .product-image, img',
    link: 'a'
};

// ==========================================
// 2. MODO FORMAT DÖNÜŞTÜRÜCÜ 🔄
// ==========================================

// Renk çıkarma fonksiyonu
function extractColor(title) {
    const colors = {
        'siyah': 'Siyah', 'black': 'Siyah',
        'beyaz': 'Beyaz', 'white': 'Beyaz', 'ekru': 'Ekru', 'krem': 'Krem',
        'lacivert': 'Lacivert', 'navy': 'Lacivert',
        'mavi': 'Mavi', 'blue': 'Mavi', 'indigo': 'İndigo',
        'kırmızı': 'Kırmızı', 'red': 'Kırmızı', 'bordo': 'Bordo', 'burgundy': 'Bordo',
        'yeşil': 'Yeşil', 'green': 'Yeşil', 'haki': 'Haki', 'khaki': 'Haki',
        'gri': 'Gri', 'grey': 'Gri', 'gray': 'Gri', 'antrasit': 'Antrasit',
        'kahve': 'Kahverengi', 'kahverengi': 'Kahverengi', 'brown': 'Kahverengi', 'camel': 'Camel',
        'bej': 'Bej', 'beige': 'Bej', 'taş': 'Taş',
        'pembe': 'Pembe', 'pink': 'Pembe', 'pudra': 'Pudra',
        'mor': 'Mor', 'purple': 'Mor', 'lila': 'Lila',
        'turuncu': 'Turuncu', 'orange': 'Turuncu',
        'sarı': 'Sarı', 'yellow': 'Sarı', 'hardal': 'Hardal',
        'vizon': 'Vizon', 'füme': 'Füme', 'petrol': 'Petrol'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, value] of Object.entries(colors)) {
        if (lowerTitle.includes(key)) {
            return value;
        }
    }
    return 'Çok Renkli';
}

// Ürün tipi çıkarma
function extractType(title) {
    const types = {
        'kazak': 'Kazak', 'triko': 'Kazak',
        'sweatshirt': 'Sweatshirt', 'polar': 'Polar',
        'gömlek': 'Gömlek',
        't-shirt': 'T-shirt', 'tişört': 'T-shirt',
        'polo': 'Polo',
        'bluz': 'Bluz',
        'hırka': 'Hırka',
        'pantolon': 'Pantolon', 'chino': 'Chino',
        'jean': 'Jean', 'denim': 'Jean',
        'şort': 'Şort', 'bermuda': 'Şort',
        'etek': 'Etek',
        'tayt': 'Tayt',
        'elbise': 'Elbise', 'abiye': 'Elbise',
        'mont': 'Mont', 'şişme': 'Mont',
        'kaban': 'Kaban', 'palto': 'Palto',
        'ceket': 'Ceket', 'blazer': 'Blazer',
        'trençkot': 'Trençkot',
        'yelek': 'Yelek',
        'deri ceket': 'Deri Ceket',
        'takım elbise': 'Takım Elbise',
        'eşofman': 'Eşofman'
    };
    
    const lowerTitle = title.toLowerCase();
    for (const [key, value] of Object.entries(types)) {
        if (lowerTitle.includes(key)) {
            return value;
        }
    }
    return 'Giyim';
}

// MODO kategori belirleme (top, bottom, outerwear, fullbody)
function getModoCategory(title) {
    const lowerTitle = title.toLowerCase();
    
    // Fullbody (tek parça)
    if (lowerTitle.includes('elbise') || lowerTitle.includes('abiye') || 
        lowerTitle.includes('takım elbise') || lowerTitle.includes('tulum') ||
        lowerTitle.includes('eşofman takım')) {
        return 'fullbody';
    }
    
    // Outerwear (dış giyim)
    if (lowerTitle.includes('mont') || lowerTitle.includes('kaban') || 
        lowerTitle.includes('palto') || lowerTitle.includes('ceket') ||
        lowerTitle.includes('blazer') || lowerTitle.includes('trençkot') ||
        lowerTitle.includes('yelek') || lowerTitle.includes('şişme') ||
        lowerTitle.includes('deri ceket') || lowerTitle.includes('parka')) {
        return 'outerwear';
    }
    
    // Bottom (alt giyim)
    if (lowerTitle.includes('pantolon') || lowerTitle.includes('jean') || 
        lowerTitle.includes('denim') || lowerTitle.includes('şort') ||
        lowerTitle.includes('etek') || lowerTitle.includes('tayt') ||
        lowerTitle.includes('chino') || lowerTitle.includes('bermuda')) {
        return 'bottom';
    }
    
    // Top (üst giyim) - default
    return 'top';
}

// Açıklama oluştur
function generateDescription(title) {
    const descriptors = [];
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('slim fit') || lowerTitle.includes('slim-fit')) descriptors.push('Slim fit');
    else if (lowerTitle.includes('regular fit') || lowerTitle.includes('regular-fit')) descriptors.push('Regular fit');
    else if (lowerTitle.includes('oversize')) descriptors.push('Oversize');
    else if (lowerTitle.includes('relaxed')) descriptors.push('Relaxed fit');
    
    if (lowerTitle.includes('pamuk') || lowerTitle.includes('cotton')) descriptors.push('pamuklu');
    if (lowerTitle.includes('keten') || lowerTitle.includes('linen')) descriptors.push('keten');
    if (lowerTitle.includes('yün') || lowerTitle.includes('wool')) descriptors.push('yün karışımlı');
    if (lowerTitle.includes('deri') || lowerTitle.includes('leather')) descriptors.push('deri');
    if (lowerTitle.includes('kadife')) descriptors.push('kadife');
    if (lowerTitle.includes('saten')) descriptors.push('saten');
    
    if (lowerTitle.includes('kapüşon') || lowerTitle.includes('kapşon')) descriptors.push('kapüşonlu');
    if (lowerTitle.includes('fermuarlı') || lowerTitle.includes('fermuar')) descriptors.push('fermuarlı');
    if (lowerTitle.includes('düğmeli')) descriptors.push('düğmeli');
    if (lowerTitle.includes('cepli')) descriptors.push('cepli');
    
    if (lowerTitle.includes('bisiklet yaka')) descriptors.push('bisiklet yaka');
    else if (lowerTitle.includes('v yaka') || lowerTitle.includes('v-yaka')) descriptors.push('V yaka');
    else if (lowerTitle.includes('balıkçı')) descriptors.push('balıkçı yaka');
    else if (lowerTitle.includes('polo yaka')) descriptors.push('polo yaka');
    else if (lowerTitle.includes('dik yaka')) descriptors.push('dik yaka');
    
    return descriptors.length > 0 ? descriptors.join(', ') : 'Şık tasarım';
}

// Fiyat parse
function parsePrice(priceStr) {
    if (!priceStr) return { formatted: '0 TL', numeric: 0 };
    
    // "1.299,99 TL" -> 1299.99
    const cleaned = priceStr
        .replace(/[^\d.,]/g, '')  // Sadece sayı, nokta, virgül
        .replace(/\./g, '')       // Binlik ayracı kaldır
        .replace(',', '.');       // Virgülü noktaya çevir
    
    const numeric = parseFloat(cleaned) || 0;
    const formatted = numeric > 0 ? `${Math.round(numeric).toLocaleString('tr-TR')} TL` : '0 TL';
    
    return { formatted, numeric: Math.round(numeric) };
}

// ==========================================
// 3. SCRAPER
// ==========================================

async function scrapeCategory(page, categoryConfig) {
    console.log(`\n➡️  TARANIYOR: ${categoryConfig.name}`);
    
    try {
        await page.goto(categoryConfig.url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Pop-up temizliği
        const targets = await page.$x(`//span[contains(text(), 'KADIN')] | //div[contains(text(), 'KADIN')] | //span[contains(text(), 'ERKEK')]`);
        if(targets.length > 0) { await targets[0].click(); await new Promise(r => setTimeout(r, 500)); }
        await page.keyboard.press('Escape');

    } catch(e) { console.log("   ⚠️ Sayfa yükleme uyarısı (Devam)..."); }

    try {
        await page.waitForSelector('.p-card-wrppr, .prdct-cntnr-wrppr, .product-card', { timeout: 10000 });
    } catch (e) {
        console.log(`   ❌ HATA: Ürün bulunamadı.`);
        return [];
    }

    console.log('   ⬇️  Sayfa kaydırılıyor...');
    await autoScroll(page, 150);

    const products = await page.evaluate((sels, targetKeyword) => {
        function cleanText(text) {
            if (!text) return "";
            return text
                .replace(/â/g, 'a').replace(/Â/g, 'A')
                .replace(/î/g, 'i').replace(/Î/g, 'I')
                .replace(/û/g, 'u').replace(/Û/g, 'U')
                .replace(/Ã§/g, 'ç').replace(/Ã‡/g, 'Ç')
                .replace(/Ä±/g, 'ı').replace(/Ä°/g, 'İ')
                .replace(/ÄŸ/g, 'ğ').replace(/Ä/g, 'Ğ')
                .replace(/Ã¶/g, 'ö').replace(/Ã–/g, 'Ö')
                .replace(/ÅŸ/g, 'ş').replace(/Å/g, 'Ş')
                .replace(/Ã¼/g, 'ü').replace(/Ãœ/g, 'Ü')
                .replace(/&amp;/g, '&')
                .trim();
        }

        const nodes = document.querySelectorAll(sels.container);
        const data = [];
        
        nodes.forEach((node) => {
            try {
                if (node.innerText.length < 10) return;

                let rawBrand = node.querySelector(sels.brand)?.innerText || '';
                let rawTitle = node.querySelector(sels.title)?.innerText || '';
                const rawPrice = node.querySelector(sels.price)?.innerText || '0 TL';
                
                const brand = cleanText(rawBrand);
                const title = cleanText(rawTitle);

                if (!title.toLocaleLowerCase('tr').includes(targetKeyword.toLocaleLowerCase('tr'))) {
                    return;
                }

                let link = '';
                if (node.tagName === 'A') link = node.getAttribute('href');
                else {
                    const linkEl = node.querySelector('a');
                    if (linkEl) link = linkEl.getAttribute('href');
                }

                if(link) {
                    if(!link.startsWith('http')) link = 'https://www.trendyol.com' + link;
                    if(link.includes('?')) link = link.split('?')[0];
                } else return;

                const imgEl = node.querySelector(sels.image);
                let img = '';
                if (imgEl) img = imgEl.src || imgEl.getAttribute('data-src') || '';

                if (!img || img === 'GORSEL_YOK') return;  // Görselsiz ürün alma

                data.push({ brand, title, price: rawPrice, link, image: img });
            } catch(e){}
        });
        return data;
    }, SELECTORS, categoryConfig.keyword);

    console.log(`   ✅ ${products.length} ürün bulundu.`);
    
    return products.map(p => ({
        brand: p.brand,
        title: p.title,
        price: p.price,
        link: p.link,
        image: p.image,
        gender: categoryConfig.gender
    }));
}

// ==========================================
// 4. ANA DÖNGÜ & EXPORT
// ==========================================

(async () => {
    console.log('🚀 TRENDYOL SCRAPER (MODO FORMAT) BAŞLATILIYOR...\n');

    const browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: null,
        args: [
            '--start-maximized', 
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-notifications',
        ]
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    let rawProducts = [];

    for (const category of CATEGORY_LIST) {
        const categoryProducts = await scrapeCategory(page, category);
        
        if (categoryProducts.length > 0) {
            rawProducts = [...rawProducts, ...categoryProducts];
        }
        
        const randomWait = Math.floor(Math.random() * 3000) + 2000;
        console.log(`   ☕ Dinleniyor (${(randomWait/1000).toFixed(1)}sn)...`);
        await new Promise(r => setTimeout(r, randomWait));
    }

    await browser.close();

    if (rawProducts.length === 0) {
        console.log('⚠️ Hiçbir veri çekilemedi.');
        return;
    }

    // Duplicate temizleme (link bazlı)
    const uniqueMap = new Map();
    rawProducts.forEach(p => {
        if (!uniqueMap.has(p.link)) {
            uniqueMap.set(p.link, p);
        }
    });
    const uniqueProducts = Array.from(uniqueMap.values());

    console.log(`\n🧹 Duplicate temizlendi: ${rawProducts.length} -> ${uniqueProducts.length} ürün`);

    // MODO formatına dönüştür
    const modoProducts = uniqueProducts.map((p, index) => {
        const priceData = parsePrice(p.price);
        
        return {
            id: index + 1,
            brandId: 'trendyol',
            brandName: p.brand || 'Trendyol',
            name: p.title,
            type: extractType(p.title),
            color: extractColor(p.title),
            category: getModoCategory(p.title),
            gender: p.gender,
            price: priceData.formatted,
            priceNum: priceData.numeric,
            image: p.image,
            description: generateDescription(p.title),
            link: p.link
        };
    });

    // Tarihi al
    const now = new Date();
    const dateStr = now.toLocaleString('tr-TR', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // products.js olarak kaydet
    const jsContent = `// OTOMATİK OLUŞTURULDU: ${dateStr}
// Toplam Ürün: ${modoProducts.length}
// Format: MODO Compatible

const TRENDYOL_PRODUCTS = ${JSON.stringify(modoProducts, null, 2)};

// Browser için
if (typeof window !== 'undefined') {
    window.TRENDYOL_PRODUCTS = TRENDYOL_PRODUCTS;
}

// Node.js için
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TRENDYOL_PRODUCTS;
}
`;

    fs.writeFileSync('trendyol_products.js', jsContent, 'utf8');

    // Ayrıca JSON olarak da kaydet (yedek)
    fs.writeFileSync('trendyol_products.json', JSON.stringify(modoProducts, null, 2), 'utf8');

    console.log(`\n🎉 TAMAMLANDI!`);
    console.log(`📁 trendyol_products.js - ${modoProducts.length} ürün (MODO format)`);
    console.log(`📁 trendyol_products.json - Yedek JSON`);

    // Özet istatistikler
    const stats = {
        male: modoProducts.filter(p => p.gender === 'male').length,
        female: modoProducts.filter(p => p.gender === 'female').length,
        top: modoProducts.filter(p => p.category === 'top').length,
        bottom: modoProducts.filter(p => p.category === 'bottom').length,
        outerwear: modoProducts.filter(p => p.category === 'outerwear').length,
        fullbody: modoProducts.filter(p => p.category === 'fullbody').length,
    };

    console.log(`\n📊 İSTATİSTİKLER:`);
    console.log(`   👨 Erkek: ${stats.male}`);
    console.log(`   👩 Kadın: ${stats.female}`);
    console.log(`   👕 Üst Giyim (top): ${stats.top}`);
    console.log(`   👖 Alt Giyim (bottom): ${stats.bottom}`);
    console.log(`   🧥 Dış Giyim (outerwear): ${stats.outerwear}`);
    console.log(`   👗 Tek Parça (fullbody): ${stats.fullbody}`);

})();

// Auto scroll helper
async function autoScroll(page, minItemCount){
    await page.evaluate(async (targetCount) => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 250;
            var maxScrollHeight = 30000;

            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                var currentCount = document.querySelectorAll('.p-card-wrppr, .product-card, .prdct-cntnr-wrppr').length;

                if(currentCount >= targetCount || totalHeight >= maxScrollHeight || totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, minItemCount);
}