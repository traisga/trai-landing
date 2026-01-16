const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ==========================================
// AYARLAR & KATEGORİLER
// ==========================================

const ERKEK_KEYWORDS = [
    "Kazak", "Sweatshirt", "Gömlek", "Denim Gömlek", "T-Shirt", "Polo T-shirt", 
    "Hırka", "Polar Sweatshirt", "Atlet", "V Yaka Tişört", "Oversize Tişört",
    "Pantolon", "Chino Pantolon", "Denim Pantolon", "Jean", "Eşofman Altı", 
    "Şort", "Denim Şort", "Jogger", "Kargo Pantolon", "Mont", "Kaban", "Ceket", 
    "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", "Parka", "Bomber Ceket",
    "Takım Elbise", "Eşofman Takımı"
];

const KADIN_KEYWORDS = [
    "Kazak", "Sweatshirt", "Gömlek", "Bluz", "Hırka", "T-Shirt", "Polo T-shirt", 
    "Tunik", "Crop Top", "Büstiyer", "Body", "Askılı Bluz", "Pantolon", 
    "Denim Pantolon", "Jean", "Şort", "Etek", "Mini Etek", "Midi Etek", 
    "Maxi Etek", "Tayt", "Eşofman Altı", "Palazzo Pantolon", "Mont", "Kaban", 
    "Ceket", "Blazer Ceket", "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", 
    "Palto", "Parka", "Elbise", "Mini Elbise", "Midi Elbise", "Maxi Elbise", 
    "Abiye Elbise", "Tulum", "Eşofman Takımı"
];

const TESETTUR_KEYWORDS = [
    "Tesettür Elbise", "Tesettür Tunik", "Tesettür Ferace",
    "Tesettür İkili Takım", "Tesettür Üçlü Takım", "Tesettür Abiye", "Tesettür Kap"
];

function generateCategoryList() {
    const list = [];
    ERKEK_KEYWORDS.forEach(kw => list.push({ name: `Erkek - ${kw}`, keyword: kw, url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Erkek ${kw}`)}&os=1`, gender: 'male' }));
    KADIN_KEYWORDS.forEach(kw => list.push({ name: `Kadın - ${kw}`, keyword: kw, url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Kadın ${kw}`)}&os=1`, gender: 'female' }));
    TESETTUR_KEYWORDS.forEach(kw => list.push({ name: kw, keyword: kw, url: `https://www.trendyol.com/sr?q=${encodeURIComponent(kw)}&os=1`, gender: 'female' }));
    return list;
}
const CATEGORY_LIST = generateCategoryList();

// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================
function extractColor(title) {
    const colors = {'siyah':'Siyah','black':'Siyah','beyaz':'Beyaz','white':'Beyaz','ekru':'Ekru','krem':'Krem','lacivert':'Lacivert','navy':'Lacivert','mavi':'Mavi','blue':'Mavi','indigo':'İndigo','kırmızı':'Kırmızı','red':'Kırmızı','bordo':'Bordo','burgundy':'Bordo','yeşil':'Yeşil','green':'Yeşil','haki':'Haki','khaki':'Haki','gri':'Gri','grey':'Gri','gray':'Gri','antrasit':'Antrasit','kahve':'Kahverengi','kahverengi':'Kahverengi','brown':'Kahverengi','camel':'Camel','bej':'Bej','beige':'Bej','taş':'Taş','pembe':'Pembe','pink':'Pembe','pudra':'Pudra','mor':'Mor','purple':'Mor','lila':'Lila','turuncu':'Turuncu','orange':'Turuncu','sarı':'Sarı','yellow':'Sarı','hardal':'Hardal','vizon':'Vizon','füme':'Füme','petrol':'Petrol','mint':'Mint'};
    const lower = title.toLowerCase();
    for(const [k,v] of Object.entries(colors)) if(lower.includes(k)) return v;
    return 'Çok Renkli';
}

function extractType(title) {
    const types = {'kazak':'Kazak','triko':'Kazak','sweatshirt':'Sweatshirt','polar':'Polar','gömlek':'Gömlek','t-shirt':'T-shirt','tişört':'T-shirt','polo':'Polo','bluz':'Bluz','hırka':'Hırka','tunik':'Tunik','crop':'Crop Top','büstiyer':'Büstiyer','body':'Body','pantolon':'Pantolon','chino':'Chino','jean':'Jean','denim':'Jean','şort':'Şort','bermuda':'Şort','etek':'Etek','tayt':'Tayt','palazzo':'Palazzo','elbise':'Elbise','abiye':'Abiye','mont':'Mont','şişme':'Mont','kaban':'Kaban','palto':'Palto','ceket':'Ceket','blazer':'Blazer','trençkot':'Trençkot','yelek':'Yelek','parka':'Parka','bomber':'Bomber','takım':'Takım','eşofman':'Eşofman','tulum':'Tulum','ferace':'Ferace','kap':'Kap','tesettür':'Tesettür'};
    const lower = title.toLowerCase();
    for(const [k,v] of Object.entries(types)) if(lower.includes(k)) return v;
    return 'Giyim';
}

function getModoCategory(title) {
    const lower = title.toLowerCase();
    if(lower.includes('takım')||lower.includes('elbise')||lower.includes('tulum')||lower.includes('ferace')||lower.includes('set')) return 'fullbody';
    if(lower.includes('mont')||lower.includes('kaban')||lower.includes('palto')||lower.includes('ceket')||lower.includes('trençkot')||lower.includes('yelek')||lower.includes('parka')||lower.includes('kap')) return 'outerwear';
    if(lower.includes('pantolon')||lower.includes('jean')||lower.includes('denim')||lower.includes('şort')||lower.includes('etek')||lower.includes('tayt')||lower.includes('jogger')) return 'bottom';
    return 'top';
}

function generateDescription(title) {
    const d = []; const l = title.toLowerCase();
    if(l.includes('slim')) d.push('Slim fit'); else if(l.includes('oversize')) d.push('Oversize'); else if(l.includes('regular')) d.push('Regular fit');
    if(l.includes('pamuk')||l.includes('cotton')) d.push('pamuklu'); if(l.includes('keten')) d.push('keten');
    return d.length>0 ? d.join(', ') : 'Modern tasarım';
}

function parsePrice(p) {
    if(!p) return {formatted:'0 TL', numeric:0};
    const m = p.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
    if(m) {
        const n = parseFloat(m[1].replace(/\./g,'').replace(',','.'));
        if(n>0) return {formatted:`${Math.round(n).toLocaleString('tr-TR')} TL`, numeric:Math.round(n)};
    }
    return {formatted:'0 TL', numeric:0};
}

// Link'ten benzersiz ID oluştur
function generateProductId(link) {
    // Trendyol link'inden ürün ID'sini çıkar
    const match = link.match(/-p-(\d+)/);
    if (match) return `ty_${match[1]}`;
    // Fallback: link'in hash'i
    let hash = 0;
    for (let i = 0; i < link.length; i++) {
        const char = link.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `ty_${Math.abs(hash)}`;
}

// ==========================================
// MEVCUT ÜRÜNLERİ YÜKLE
// ==========================================
function loadExistingProducts() {
    const publicDir = path.join(__dirname, 'public');
    const jsonPath = path.join(publicDir, 'trendyol_products.json');
    
    if (fs.existsSync(jsonPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            console.log(`📦 Mevcut ${data.length} ürün yüklendi.`);
            return data;
        } catch (e) {
            console.log('⚠️ Mevcut dosya okunamadı, sıfırdan başlanıyor.');
            return [];
        }
    }
    console.log('📦 Mevcut ürün dosyası yok, sıfırdan başlanıyor.');
    return [];
}

// ==========================================
// AKILLI MERGE - Eski + Yeni Ürünleri Birleştir
// ==========================================
function mergeProducts(existingProducts, newProducts) {
    // Link bazlı map oluştur (mevcut ürünler)
    const productMap = new Map();
    
    // Önce mevcut ürünleri ekle
    existingProducts.forEach(p => {
        const key = p.link || p.productId || `${p.brandName}_${p.name}`;
        productMap.set(key, {
            ...p,
            lastSeen: p.lastSeen || Date.now(),
            firstSeen: p.firstSeen || Date.now()
        });
    });
    
    let newCount = 0;
    let updatedCount = 0;
    
    // Yeni ürünleri işle
    newProducts.forEach(newProduct => {
        const key = newProduct.link;
        
        if (productMap.has(key)) {
            // Mevcut ürün - fiyatı güncelle
            const existing = productMap.get(key);
            const oldPrice = existing.priceNum;
            const newPrice = newProduct.priceNum;
            
            productMap.set(key, {
                ...existing,
                price: newProduct.price,
                priceNum: newProduct.priceNum,
                image: newProduct.image, // Görsel de güncellensin
                lastSeen: Date.now(),
                priceHistory: [
                    ...(existing.priceHistory || []),
                    ...(oldPrice !== newPrice ? [{ price: oldPrice, date: existing.lastSeen }] : [])
                ].slice(-10) // Son 10 fiyat değişikliği
            });
            
            if (oldPrice !== newPrice) {
                updatedCount++;
                console.log(`   💰 Fiyat güncellendi: ${existing.name.substring(0, 30)}... (${oldPrice} → ${newPrice} TL)`);
            }
        } else {
            // Yeni ürün - ekle
            productMap.set(key, {
                ...newProduct,
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                priceHistory: []
            });
            newCount++;
        }
    });
    
    console.log(`\n📊 Özet: ${newCount} yeni ürün, ${updatedCount} fiyat güncellemesi`);
    
    // Map'i array'e çevir ve ID'leri yeniden ata
    const merged = Array.from(productMap.values());
    
    // ID'leri yeniden ata (sıralı)
    return merged.map((p, i) => ({
        ...p,
        id: i + 1,
        productId: generateProductId(p.link)
    }));
}

// ==========================================
// SCRAPER
// ==========================================
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0, distance = 350, maxScroll = 500000, stuck=0, last=0;
            const timer = setInterval(() => {
                window.scrollBy(0, distance); totalHeight += distance;
                const current = document.querySelectorAll('.p-card-wrppr, .product-card').length;
                if(current===last) stuck++; else {stuck=0; last=current;}
                if(totalHeight>=maxScroll || stuck>=30){ clearInterval(timer); resolve(); }
            }, 120);
        });
    });
}

async function scrapeCategory(page, config) {
    console.log(`➡️  ${config.name}`);
    try {
        await page.goto(config.url, {waitUntil:'networkidle2', timeout:60000});
        try{const x=await page.$x("//span[contains(text(),'KADIN')]|//span[contains(text(),'ERKEK')]");if(x.length>0)await x[0].click();}catch(e){}
    } catch(e){console.log("   ⚠️ Yükleme uyarısı (devam ediliyor)...");}

    try { await page.waitForSelector('.p-card-wrppr, .product-card', {timeout:10000}); } catch(e){return [];}
    
    await autoScroll(page);

    const products = await page.evaluate((gender, keyword) => {
        const banned = ['saat','terlik','eldiven','çorap','boxer','külot','kemer','cüzdan','parfüm','gözlük','kolye','küpe','şapka','bere','ayakkabı','bot','çizme','kılıf','çanta','bileklik','yüzük','broş'];
        const data = [];
        document.querySelectorAll('.p-card-wrppr, .product-card').forEach(n => {
            try {
                if(n.innerText.length<5) return;
                const brand = (n.querySelector('.prdct-desc-cntnr-ttl, .brand')?.innerText || '').trim();
                const title = (n.querySelector('.prdct-desc-cntnr-name, .name')?.innerText || '').trim();
                if(!title) return;
                
                const lowerT = title.toLowerCase();
                if(banned.some(b=>lowerT.includes(b))) return;
                if(gender==='male' && lowerT.includes('kadın')) return;
                if(gender==='female' && lowerT.includes('erkek')) return;

                let finalBrand = brand;
                if(!finalBrand || finalBrand.length<2) finalBrand = title.split(' ')[0].length>2 ? title.split(' ')[0] : 'Genel';

                let link = n.tagName==='A'?n.getAttribute('href'):n.querySelector('a')?.getAttribute('href');
                if(!link) return;
                if(!link.startsWith('http')) link = 'https://www.trendyol.com'+link;
                
                let img = n.querySelector('img')?.src || n.querySelector('img')?.getAttribute('data-src');
                if(!img || img.includes('placeholder')) return;

                let price = '0 TL';
                const pEl = n.querySelector('.prc-box-dscntd, .prc-box-sllng, [data-testid="price-current-price"]');
                if(pEl) price = pEl.innerText;
                else {
                     const all = n.querySelectorAll('span, div');
                     for(let s of all) if(s.innerText.includes('TL') && /\d/.test(s.innerText)) {price=s.innerText; break;}
                }

                data.push({brand:finalBrand, title, price, link, image:img, gender, keyword});
            } catch(e){}
        });
        return data;
    }, config.gender, config.keyword);
    
    console.log(`   ✓ ${products.length} ürün bulundu`);
    return products;
}

// ==========================================
// ANA FONKSİYON
// ==========================================
(async () => {
    console.log('🚀 TRENDYOL SCRAPER BAŞLIYOR...\n');
    console.log(`📅 Tarih: ${new Date().toLocaleString('tr-TR')}\n`);
    
    // Mevcut ürünleri yükle
    const existingProducts = loadExistingProducts();
    
    // Browser'ı başlat
    const browser = await puppeteer.launch({
        headless: process.env.CI ? "new" : false, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-notifications',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080'
        ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    let allNewProducts = [];
    let processedCategories = 0;
    
    for(const cat of CATEGORY_LIST) {
        try {
            const products = await scrapeCategory(page, cat);
            allNewProducts = [...allNewProducts, ...products];
            processedCategories++;
        } catch (e) {
            console.log(`   ❌ Kategori hatası: ${cat.name}`);
        }
        // Rate limiting - Trendyol'u yormayalım
        await new Promise(r => setTimeout(r, 1500));
    }
    
    await browser.close();
    console.log(`\n✅ ${processedCategories}/${CATEGORY_LIST.length} kategori işlendi.`);

    // Benzersiz ürünleri al (link bazlı)
    const uniqueNew = Array.from(new Map(allNewProducts.map(p=>[p.link, p])).values());
    console.log(`📦 ${uniqueNew.length} benzersiz yeni ürün çekildi.`);

    // Yeni ürünleri formatla
    const formattedNew = uniqueNew.map(p => {
        const price = parsePrice(p.price);
        return {
            brandId: p.brand.toLowerCase().replace(/[^a-z0-9]/g,''),
            brandName: p.brand,
            name: p.title,
            type: extractType(p.title),
            color: extractColor(p.title),
            category: getModoCategory(p.title),
            gender: p.gender,
            keyword: p.keyword,
            price: price.formatted,
            priceNum: price.numeric,
            image: p.image,
            description: generateDescription(p.title),
            link: p.link
        };
    }).filter(p => p.priceNum > 0);

    // Akıllı merge - eski + yeni
    const finalData = mergeProducts(existingProducts, formattedNew);
    
    console.log(`\n📊 SONUÇ:`);
    console.log(`   • Önceki toplam: ${existingProducts.length} ürün`);
    console.log(`   • Şimdiki toplam: ${finalData.length} ürün`);
    console.log(`   • Net artış: +${finalData.length - existingProducts.length} ürün`);

    // Dosyaları kaydet
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) { 
        fs.mkdirSync(publicDir, { recursive: true }); 
    }

    // JS dosyası
    const jsContent = `// Son güncelleme: ${new Date().toLocaleString('tr-TR')}
// Toplam: ${finalData.length} ürün

const TRENDYOL_PRODUCTS = ${JSON.stringify(finalData, null, 2)};

if (typeof window !== 'undefined') window.TRENDYOL_PRODUCTS = TRENDYOL_PRODUCTS;
if (typeof module !== 'undefined' && module.exports) module.exports = TRENDYOL_PRODUCTS;`;

    fs.writeFileSync(path.join(publicDir, 'trendyol_products.js'), jsContent);
    fs.writeFileSync(path.join(publicDir, 'trendyol_products.json'), JSON.stringify(finalData, null, 2));

    // İstatistik dosyası
    const stats = {
        lastUpdate: new Date().toISOString(),
        totalProducts: finalData.length,
        byGender: {
            male: finalData.filter(p => p.gender === 'male').length,
            female: finalData.filter(p => p.gender === 'female').length
        },
        byCategory: {
            top: finalData.filter(p => p.category === 'top').length,
            bottom: finalData.filter(p => p.category === 'bottom').length,
            outerwear: finalData.filter(p => p.category === 'outerwear').length,
            fullbody: finalData.filter(p => p.category === 'fullbody').length
        },
        priceRange: {
            min: Math.min(...finalData.map(p => p.priceNum)),
            max: Math.max(...finalData.map(p => p.priceNum)),
            avg: Math.round(finalData.reduce((a, b) => a + b.priceNum, 0) / finalData.length)
        }
    };
    fs.writeFileSync(path.join(publicDir, 'products_stats.json'), JSON.stringify(stats, null, 2));

    console.log(`\n🎉 BİTTİ! Dosyalar 'public' klasörüne kaydedildi.`);
    console.log(`   • trendyol_products.js`);
    console.log(`   • trendyol_products.json`);
    console.log(`   • products_stats.json`);
})();