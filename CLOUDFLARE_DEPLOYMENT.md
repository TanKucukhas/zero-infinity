# Cloudflare Pages Deployment Guide

Bu proje Cloudflare Pages için OpenNext adapter kullanarak deploy edilmiştir.

## Build Ayarları

Cloudflare Pages dashboard'unda aşağıdaki ayarları yapın:

### Build Settings
- **Framework preset**: `Next.js (Static HTML Export)` veya `Custom`
- **Build command**: `npm run build:cf`
- **Build output directory**: `.open-next/assets`
- **Root directory**: `/` (proje root'u)

### Environment Variables
Aşağıdaki environment variable'ları Cloudflare Pages dashboard'unda ayarlayın:

```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.pages.dev
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
```

## Local Test

Build'i local'de test etmek için:

```bash
npm run build:cf
npm run preview
```

## Troubleshooting

### Build Hatası: "ENOENT: no such file or directory, lstat '/opt/buildhome/repo/.next/server/app/(dashboard)/page_client-reference-manifest.js'"

Bu hata eski `@cloudflare/next-on-pages` paketinin kullanılmasından kaynaklanır. Çözüm:

1. `package.json`'da build script'inin `npm run build:cf` olduğundan emin olun
2. Cloudflare Pages'de build command'i `npm run build:cf` olarak ayarlayın
3. Build output directory'i `.open-next/assets` olarak ayarlayın

### OpenNext Adapter Kullanımı

Bu proje artık `@opennextjs/cloudflare` adapter kullanıyor. Bu adapter:
- Daha stabil build süreci sağlar
- Cloudflare Workers ile daha iyi uyumluluk
- Daha iyi performans
- Daha az build hatası

## Deploy

Deploy için:

```bash
npm run deploy
```

Bu komut otomatik olarak build yapar ve Cloudflare Pages'e deploy eder.
