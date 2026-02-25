# Koleksiyon şablonu – plan ve gereksinimler

Bu doc, shop’ta koleksiyon sayfası ve seller central’da koleksiyon yönetimi için istenen özellikleri toplar.

## Mevcut durum

- **Backend:** `admin_hub_collections` tablosu var (id, title, handle, created_at, updated_at). Standalone koleksiyon oluşturma/güncelleme API’leri mevcut.
- **Shop:** `/collections/[slug]` sayfası **kategori** (category) ile çalışıyor: `getCategoryBySlug(slug)` + `getProducts({ collection_id: slug })`. Koleksiyon slug’ı category slug ile eşleşiyor.
- **Seller central:** Menüde link_type olarak collection seçilebiliyor; koleksiyonlar listelenip seçilebiliyor.

## İstenen shop koleksiyon sayfası

1. **Koleksiyon ana görseli**  
   - 1 adet. Second menü gibi dropdown’larda “menü görseli” olarak kullanılacak.  
   - **DB:** `admin_hub_collections`’a `image_url` (veya `thumbnail_url`) alanı.

2. **Koleksiyon adı**  
   - Seller central’da menü bağlamada kullanılacak. Zaten var: `title`.

3. **Handle ve ID**  
   - Zaten var: `handle`, `id`.

4. **Banner görseli**  
   - Navbar’ın hemen altında, tam genişlik, 1920×300 px.  
   - **DB:** `banner_image_url` (veya `banner_url`).  
   - Yükleme: 1920×300; görüntüleme tamamı kırpılmadan (object-fit ile).

5. **Başlık**  
   - Banner’ın altında, ürünlerin üstünde tek bir **h1**.

6. **Sol filtreler**  
   - Koleksiyondaki ürünlerin **eigenschaften** ve **meta** alanlarından türetilecek (renk, beden, materyal, uzunluk vb.).  
   - Backend: Ürün listesinde bu alanları döndürmek veya ayrı filter facets endpoint’i.

7. **Ürünler**  
   - Filtrelerin sağında, başlığın altında.  
   - 3 ürün card yan yana, sayfa başına en fazla 18 ürün (pagination).

8. **Richtext**  
   - Sayfanın en altında, footer’ın üstünde.  
   - Ürün eklemedeki description gibi zengin metin (HTML girişi mümkün).  
   - **DB:** `richtext` veya `description_html`.  
   - Başlıklar h2 ile.

9. **SEO metadata**  
   - **DB:** `meta_title`, `meta_description`, `keywords`.  
   - Sayfa head’inde kullanılacak.

## Seller central tarafı

- Koleksiyonlar **sayfa ile** eklenip düzenlensin (ürünler gibi): liste → yeni/düzenle sayfası.
- Form alanları (hepsi opsiyonel olabilir, aşamalı eklenebilir):  
  - Koleksiyon adı, handle  
  - Ana görsel  
  - Banner görseli (1920×300)  
  - Başlık (ve gerekirse HTML düzenleme)  
  - Richtext (zengin metin / HTML)  
  - SEO: meta title, meta description, keywords  

## Backend yapılacaklar (kısa)

1. **Migration**  
   - `admin_hub_collections`’a:  
     `image_url`, `banner_image_url`, `title_display` (veya h1 için ayrı alan), `richtext` / `description_html`, `meta_title`, `meta_description`, `keywords`  
   - Gerekirse `admin_hub_products`’ta filter için kullanılacak alanlar (eigenschaften / metadata) netleştirilecek.

2. **Store API**  
   - `GET /store/collections/:handle` (veya `?handle=...`):  
     Koleksiyon detayı (banner, başlık, richtext, SEO) + sayfalanmış ürünler + filtre için kullanılacak attribute listesi.

3. **Admin Hub**  
   - Koleksiyon create/update’te yeni alanların kaydedilmesi ve medya yükleme (banner, ana görsel) entegrasyonu.

## Öncelik sırası (öneri)

1. Migration + backend’de yeni alanların PATCH/POST’ta okunması.  
2. Store’da `GET /store/collections/:handle` ve shop’ta bu endpoint’i kullanan koleksiyon sayfası (banner, h1, ürün grid, pagination).  
3. Seller central’da koleksiyon sayfası (form + medya).  
4. Filtreler (eigenschaften/meta).  
5. Richtext + SEO alanları ve head’te kullanımı.

Bu plan, “Koleksiyon: sellercentral sayfa + shop şablonu” işinin yol haritası olarak kullanılabilir.
