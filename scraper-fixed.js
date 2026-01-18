const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

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
    ERKEK_KEYWORDS.forEach(kw => list.push({ 
        name: `Erkek - ${kw}`, 
        keyword: kw, 
        url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Erkek ${kw}`)}&qt=${encodeURIComponent(`Erkek ${kw}`)}&st=${encodeURIComponent(`Erkek ${kw}`)}&os=1`, 
        gender: 'male' 
    }));
    KADIN_KEYWORDS.forEach(kw => list.push({ 
        name: `Kadın - ${kw}`, 
        keyword: kw, 
        url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Kadın ${kw}`)}&qt=${encodeURIComponent(`Kadın ${kw}`)}&st=${encodeURIComponent(`Kadın ${kw}`)}&os=1`, 
        gender: 'female' 
    }));
    TESETTUR_KEYWORDS.forEach(kw => list.push({ 
        name: kw, 
        keyword: kw, 
        url: `https://www.trendyol.com/sr?q=${encodeURIComponent(kw)}&qt=${encodeURIComponent(kw)}&st=${encodeURIComponent(kw)}&os=1`, 
        gender: 'female' 
    }));
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

// ==========================================
// DOSYA İŞLEMLERİ
// ==========================================
function loadExistingProducts() {
    const filePath = path.join(__dirname, 'public', 'products.json');
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`📦 Mevcut ${data.length} ürün yüklendi.`);
            return data;
        }
    } catch (e) {
        console.log('⚠️ Mevcut ürünler yüklenemedi, sıfırdan başlanıyor.');
    }
    return [];
}

function mergeProducts(existing, newProducts) {
    const productMap = new Map();
    let priceUpdates = 0;
    
    existing.forEach(p => productMap.set(p.link, p));
    
    newProducts.forEach(p => {
        if (productMap.has(p.link)) {
            const old = productMap.get(p.link);
            if (old.priceNum !== p.priceNum) {
                priceUpdates++;
                if (!old.priceHistory) old.priceHistory = [];
                old.priceHistory.push({ price: old.priceNum, date: old.lastSeen || old.firstSeen });
                if (old.priceHistory.length > 10) old.priceHistory.shift();
                old.price = p.price;
                old.priceNum = p.priceNum;
            }
            old.lastSeen = Date.now();
            productMap.set(p.link, old);
        } else {
            p.firstSeen = Date.now();
            p.lastSeen = Date.now();
            productMap.set(p.link, p);
        }
    });
    
    const merged = Array.from(productMap.values());
    merged.forEach((p, i) => p.id = i + 1);
    
    return { merged, priceUpdates, newCount: newProducts.length - priceUpdates };
}

// ==========================================
// EKRAN GÖRÜNTÜSÜ ALMA (YENİ FONKSİYON)
// ==========================================
async function takeDebugScreenshot(page, name) {
    try {
        const debugDir = path.join(__dirname, 'public', 'debug_screenshots');
        if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
        
        const cleanName = name.replace(/[^a-z0-9]/gi, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenPath = path.join(debugDir, `error_${cleanName}_${timestamp}.jpg`);
        
        await page.screenshot({ path: screenPath, fullPage: true });
        console.log(`   📸 Hata görüntüsü kaydedildi: ${screenPath}`);
    } catch (e) {
        console.log(`   ⚠️ Screenshot alınamadı: ${e.message}`);
    }
}

// ==========================================
// SCRAPER (GÜNCELLENMİŞ)
// ==========================================
async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0, distance = 250;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight || totalHeight > 15000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 250);
        });
    });
}

async function scrapeCategory(page, config, retryCount = 0) {
    console.log(`➡️  ${config.name}`);
    
    try {
        await delay(2000 + Math.random() * 2000);
        
        // Timeout 30 saniyeye düşürüldü (Çok beklememek için)
        await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const pageTitle = await page.title();
        if (pageTitle.includes("Robot") || pageTitle.includes("Security")) {
             console.log("   ⛔ BOT TESPİT EDİLDİ");
             await takeDebugScreenshot(page, "BOT_DETECTED_" + config.name);
             throw new Error("Bot Detected");
        }

        const selectors = ['.p-card-wrppr', '.product-card', '[data-testid="product-card"]', '.prdct-cntnr-wrppr'];
        let found = false;
        
        for (const sel of selectors) {
            try {
                await page.waitForSelector(sel, { timeout: 8000 });
                found = true;
                break;
            } catch (e) { continue; }
        }
        
        if (!found) {
            console.log(`   ⚠️ Ürün bulunamadı (Selector timeout)`);
            await takeDebugScreenshot(page, "NOT_FOUND_" + config.name);

            if (retryCount < 1) {
                console.log(`   ⏳ Tekrar deneniyor...`);
                await delay(3000);
                return await scrapeCategory(page, config, retryCount + 1);
            }
            return [];
        }
        
        await autoScroll(page);
        await delay(1500);

        const products = await page.evaluate((gender, keyword) => {
            const banned = ['saat', 'terlik', 'eldiven', 'çorap', 'boxer', 'külot', 'kemer', 'cüzdan', 'parfüm', 'gözlük', 'kolye', 'küpe', 'şapka', 'bere', 'ayakkabı', 'bot', 'çizme', 'kılıf', 'çanta', 'cüzdan'];
            const data = [];
            const cards = document.querySelectorAll('.p-card-wrppr, .product-card, [data-testid="product-card"]');
            
            cards.forEach(n => {
                try {
                    if (n.innerText.length < 5) return;
                    
                    const brand = (n.querySelector('.prdct-desc-cntnr-ttl, .brand, [data-testid="brand"]')?.innerText || '').trim();
                    const title = (n.querySelector('.prdct-desc-cntnr-name, .name, [data-testid="product-name"]')?.innerText || '').trim();
                    if (!title) return;
                    
                    const lowerT = title.toLowerCase();
                    if (banned.some(b => lowerT.includes(b))) return;
                    if (gender === 'male' && lowerT.includes('kadın')) return;
                    if (gender === 'female' && !lowerT.includes('tesettür') && lowerT.includes('erkek')) return;

                    let finalBrand = brand;
                    if (!finalBrand || finalBrand.length < 2) {
                        finalBrand = title.split(' ')[0].length > 2 ? title.split(' ')[0] : 'Genel';
                    }

                    let link = n.tagName === 'A' ? n.getAttribute('href') : n.querySelector('a')?.getAttribute('href');
                    if (!link) return;
                    if (!link.startsWith('http')) link = 'https://www.trendyol.com' + link;
                    
                    let img = n.querySelector('img')?.src || n.querySelector('img')?.getAttribute('data-src');
                    if (!img || img.includes('placeholder') || img.includes('data:image')) return;
                    if (img.startsWith('//')) img = 'https:' + img;

                    let price = '0 TL';
                    const priceSelectors = ['.prc-box-dscntd', '.prc-box-sllng', '[data-testid="price-current-price"]', '.product-price'];
                    for (const sel of priceSelectors) {
                        const pEl = n.querySelector(sel);
                        if (pEl && pEl.innerText.includes('TL')) {
                            price = pEl.innerText;
                            break;
                        }
                    }
                    if (price === '0 TL') {
                        const all = n.querySelectorAll('span, div');
                        for (let s of all) {
                            if (s.innerText.includes('TL') && /\d/.test(s.innerText)) {
                                price = s.innerText; break;
                            }
                        }
                    }

                    data.push({ brand: finalBrand, title, price, link, image: img, gender, keyword });
                } catch (e) {}
            });
            return data;
        }, config.gender, config.keyword);
        
        console.log(`   ✓ ${products.length} ürün bulundu`);
        return products;
        
    } catch (e) {
        console.log(`   ❌ Hata (${config.name}): ${e.message}`);
        // BURASI ÇOK ÖNEMLİ: HATA ANINDA DA FOTOĞRAF ÇEK
        await takeDebugScreenshot(page, "CRASH_" + config.name);
        return [];
    }
}

// ==========================================
// ANA FONKSİYON
// ==========================================
(async () => {
    console.log('🚀 TRENDYOL SCRAPER BAŞLIYOR (DEBUG MODE)...');
    console.log(`\n📅 Tarih: ${new Date().toLocaleString('tr-TR')}\n`);
    
    const existingProducts = loadExistingProducts();
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    let allNewProducts = [];
    let successCount = 0;
    
    for (const cat of CATEGORY_LIST) {
        try {
            const products = await scrapeCategory(page, cat);
            if (products.length > 0) {
                allNewProducts = [...allNewProducts, ...products];
                successCount++;
            }
        } catch (e) {
            console.log(`   ❌ Kritik Kategori Hatası: ${cat.name}`);
        }
    }
    
    await browser.close();
    
    console.log(`\n✅ ${successCount}/${CATEGORY_LIST.length} kategori işlendi.`);

    const uniqueNew = Array.from(new Map(allNewProducts.map(p => [p.link, p])).values());
    console.log(`📦 ${uniqueNew.length} benzersiz yeni ürün çekildi.`);

    const processedNew = uniqueNew.map(p => {
        const price = parsePrice(p.price);
        return {
            id: 0,
            brandId: p.brand.toLowerCase().replace(/[^a-z0-9]/g, ''),
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

    const { merged, priceUpdates, newCount } = mergeProducts(existingProducts, processedNew);
    
    console.log(`\n📊 Özet: ${newCount} yeni ürün, ${priceUpdates} fiyat güncellemesi`);

    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    fs.writeFileSync(path.join(publicDir, 'products.json'), JSON.stringify(merged, null, 2));

    const jsContent = `const TRENDYOL_PRODUCTS = ${JSON.stringify(merged, null, 2)};
if (typeof window !== 'undefined') window.TRENDYOL_PRODUCTS = TRENDYOL_PRODUCTS;
if (typeof module !== 'undefined' && module.exports) module.exports = TRENDYOL_PRODUCTS;`;
    fs.writeFileSync(path.join(publicDir, 'trendyol_products.js'), jsContent);

    const stats = {
        lastUpdated: new Date().toISOString(),
        totalProducts: merged.length,
        previousTotal: existingProducts.length,
        newProducts: newCount,
        priceUpdates: priceUpdates,
        categoriesProcessed: successCount,
        byGender: {
            male: merged.filter(p => p.gender === 'male').length,
            female: merged.filter(p => p.gender === 'female').length
        },
        byCategory: {
            top: merged.filter(p => p.category === 'top').length,
            bottom: merged.filter(p => p.category === 'bottom').length,
            outerwear: merged.filter(p => p.category === 'outerwear').length,
            fullbody: merged.filter(p => p.category === 'fullbody').length
        },
        priceRange: {
            min: Math.min(...merged.map(p => p.priceNum)),
            max: Math.max(...merged.map(p => p.priceNum)),
            avg: Math.round(merged.reduce((a, p) => a + p.priceNum, 0) / merged.length)
        }
    };
    fs.writeFileSync(path.join(publicDir, 'products_stats.json'), JSON.stringify(stats, null, 2));

    console.log(`\n📊 SONUÇ:`);
    console.log(`   • Önceki toplam: ${existingProducts.length} ürün`);
    console.log(`   • Şimdiki toplam: ${merged.length} ürün`);
    console.log(`   • Net artış: +${merged.length - existingProducts.length} ürün`);

    console.log(`\n🎉 BİTTİ! Dosyalar 'public' klasörüne kaydedildi.`);
})();
