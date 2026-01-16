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

// ==========================================
// SCRAPER
// ==========================================
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0, distance = 350, maxScroll = 800000, stuck=0, last=0;
            const timer = setInterval(() => {
                window.scrollBy(0, distance); totalHeight += distance;
                const current = document.querySelectorAll('.p-card-wrppr, .product-card').length;
                if(current===last) stuck++; else {stuck=0; last=current;}
                if(totalHeight>=maxScroll || stuck>=40){ clearInterval(timer); resolve(); }
            }, 100);
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

    return await page.evaluate((gender) => {
        const banned = ['saat','terlik','eldiven','çorap','boxer','külot','kemer','cüzdan','parfüm','gözlük','kolye','küpe','şapka','bere','ayakkabı','bot','çizme','kılıf'];
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

                data.push({brand:finalBrand, title, price, link, image:img});
            } catch(e){}
        });
        return data;
    }, config.gender);
}

(async () => {
    console.log('🚀 OTOMATİK TRENDYOL SCRAPER BAŞLIYOR...');
    
    // HEADLESS MOD: Sunucuda çalışırken 'new', bilgisayarında çalışırken 'false'
    // process.env.CI GitHub'da otomatik tanımlıdır.
    const browser = await puppeteer.launch({
        headless: process.env.CI ? "new" : false, 
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    let allProducts = [];
    for(const cat of CATEGORY_LIST) {
        const p = await scrapeCategory(page, cat);
        allProducts = [...allProducts, ...p];
        await new Promise(r=>setTimeout(r, 1000));
    }
    await browser.close();

    const unique = Array.from(new Map(allProducts.map(p=>[p.link, p])).values());
    console.log(`\n✅ Toplam ${unique.length} ürün çekildi.`);

    const finalData = unique.map((p,i) => {
        const price = parsePrice(p.price);
        return {
            id: i+1,
            brandId: p.brand.toLowerCase().replace(/[^a-z0-9]/g,''),
            brandName: p.brand,
            name: p.title,
            type: extractType(p.title),
            color: extractColor(p.title),
            category: getModoCategory(p.title),
            gender: p.gender, // EKLENDİ: app.html filtrelemesi için gerekli
            price: price.formatted,
            priceNum: price.numeric,
            image: p.image,
            description: generateDescription(p.title),
            link: p.link
        };
    }).filter(p => p.priceNum > 0);

    // DOSYALARI PUBLIC KLASÖRÜNE KAYDETME
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)){ fs.mkdirSync(publicDir); }

    const jsContent = `const TRENDYOL_PRODUCTS = ${JSON.stringify(finalData, null, 2)};
if (typeof window !== 'undefined') window.TRENDYOL_PRODUCTS = TRENDYOL_PRODUCTS;
if (typeof module !== 'undefined' && module.exports) module.exports = TRENDYOL_PRODUCTS;`;

    fs.writeFileSync(path.join(publicDir, 'trendyol_products.js'), jsContent);
    fs.writeFileSync(path.join(publicDir, 'trendyol_products.json'), JSON.stringify(finalData, null, 2));

    console.log(`🎉 BİTTİ! Dosyalar 'public' klasörüne kaydedildi.`);
})();