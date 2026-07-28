# 📱 Guia de Ícones PWA - neoflowoff.agency

## 📂 Estrutura Ativa

### **Pasta Principal: `/public/icons/`**

Ícones WebP usados pelo `public/manifest.webmanifest`.

### **Ícones na Raiz: `/`**

Favicons, Apple Touch Icon e fallbacks PNG referenciados no HTML e no
manifest.

### **Splash screens iOS: `/public/splash_screens/`**

Arquivos PNG declarados como `apple-touch-startup-image` em
`src/layouts/Base.astro`.

---

## 🎯 Ícones Necessários

### **1. Ícones PWA WebP**

```text
/public/icons/
├── icon-192x192.webp
├── icon-512x512.webp
├── maskable-512x512.webp
├── logo_app_engine.webp
├── logo_app_engine_bco.webp
├── logo_app_engine_pto.webp
├── logo_app_engine_vde.webp
└── logo_app_engine_vde.svg
```

### **2. Ícones PWA PNG e favicons**

```text
/public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
└── maskable-512.png
```

### **3. Splash screens**

```text
/public/splash_screens/
└── *.png
```

---

## ✅ Checklist Mínimo

Para PWA funcionar corretamente, você precisa de pelo menos:

- ✅ `/public/icons/icon-192x192.webp`
- ✅ `/public/icons/icon-512x512.webp`
- ✅ `/public/icons/maskable-512x512.webp`
- ✅ `/public/icon-192.png`
- ✅ `/public/icon-512.png`
- ✅ `/public/maskable-512.png` (recomendado para Android)
- ✅ `/public/favicon.ico`
- ✅ `/public/favicon-16x16.png`
- ✅ `/public/favicon-32x32.png`
- ✅ `/public/apple-touch-icon.png`
- ✅ `/public/splash_screens/*.png`

---

## 🎨 Especificações Técnicas

### **Formato WebP (Recomendado)**

- Formato: WebP
- Qualidade: 90-95%
- Background: Transparente ou sólido (#050508)

### **Formato PNG (Fallback)**

- Formato: PNG-24
- Background: Transparente ou sólido (#050508)
- Compressão: Otimizada (TinyPNG, ImageOptim)

### **Maskable Icon (Android)**

- Tamanho: 512x512px
- Safe Zone: 384x384px (centro)
- Background: Sólido (#050508)
- Formato: PNG

### **Favicon**

- Formato: ICO (multi-size) ou PNG
- Tamanhos: 16x16, 32x32, 48x48
- Background: Transparente

---

## 📝 Notas Importantes

1. **WebP é preferido** no manifest, com PNG como fallback
2. **Maskable icon** é essencial para Android Adaptive Icons
3. **Apple Touch Icon** deve ser exatamente 180x180px
4. **Favicon** deve existir como ICO multi-size e PNGs 16/32px
5. Todos os ícones devem ter **mesmo design visual** para consistência
6. Em Astro, assets de `public/` devem ser referenciados por caminho
   absoluto, como `/icons/icon-512x512.webp`
