# PBI Ekspor Impor — Monitoring Ekspor & Impor

Dashboard admin berbasis Vue 3 + Vite untuk memantau **fenomena berita ekspor dan impor
Indonesia**. Aplikasi ini menggantikan halaman pengelolaan artikel lama dengan tampilan
**Daftar Komoditas** yang seluruh datanya bersumber dari workbook hasil scraping
`HasilScrapingFenomena.xlsx`.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Sumber Data Excel](#sumber-data-excel)
- [Role Pengguna](#role-pengguna)
- [Responsivitas dan Branding](#responsivitas-dan-branding)
- [Palet Warna](#palet-warna)
- [Halaman Manajemen Artikel Berita (Admin)](#halaman-manajemen-artikel-berita-admin)
- [Riwayat Perubahan (Admin)](#riwayat-perubahan-admin)
- [Halaman Artikel Berita (User)](#halaman-artikel-berita-user)
- [Struktur Proyek](#struktur-proyek)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Skrip NPM](#skrip-npm)
- [Catatan Pengembangan](#catatan-pengembangan)

---

## Tech Stack

| Kategori      | Teknologi                                        |
| ------------- | ------------------------------------------------ |
| Framework     | Vue 3.5 (`<script setup>` + TypeScript)          |
| Build tool    | Vite 8                                           |
| Styling       | Tailwind CSS 4 (`@tailwindcss/vite`)             |
| State         | Pinia 4                                          |
| Routing       | Vue Router 5                                     |
| Ikon          | `@lucide/vue` (dibungkus `AppIcon.vue`)          |
| Chart         | Chart.js 4 + `vue-chartjs`                       |
| Test          | Vitest 4 + `@vue/test-utils` (environment jsdom) |
| Lint & format | ESLint + oxlint + Prettier                       |

Persyaratan Node.js: `^22.18.0 || >=24.12.0`.

---

## Fitur Utama

1. **Dashboard** — ringkasan statistik (total artikel, media terpantau, komoditas spesifik,
   sentimen positif) plus grafik Top 5 Komoditas, distribusi sentimen, artikel per media, dan
   distribusi kategori fenomena. Dapat difilter per periode (bulan/tahun).
2. **Daftar Komoditas (Excel-driven)** — tabel komoditas pada halaman Manajemen Artikel Berita
   dan halaman Artikel Berita. Setiap baris dapat diklik untuk membuka pop-up daftar artikel
   yang otomatis difilter berdasarkan komoditas tersebut.
3. **Pencarian & filter artikel** — panel filter lengkap (periode + nama komoditas) di halaman
   dan **satu search bar** di dalam pop-up.
4. **CRUD artikel (Admin)** — tambah, ubah, dan hapus artikel melalui formulir di dalam pop-up.
5. **Crawling berita (Admin)** — simulasi pengambilan berita per periode dan portal, dengan
   riwayat crawling serta deduplikasi berdasarkan URL.
6. **Download Excel** — ekspor artikel per periode ke berkas `.xlsx` (13 kolom, sudah diformat
   lebar kolomnya).
7. **Riwayat Perubahan (Admin)** — pencatatan aktivitas tambah, ubah, dan hapus artikel dengan
   filter jenis aksi serta periode bulan/tahun.
8. **Simulasi role** — pengalih role Admin/User pada header untuk menguji kedua tampilan.
9. **Tampilan responsif** — kartu digunakan pada perangkat ponsel dan tablet, sedangkan tabel
   lengkap digunakan pada layar desktop yang lebih lebar.

---

## Sumber Data Excel

Workbook acuan: **`HasilScrapingFenomena.xlsx`**.

Workbook ini memiliki lebih dari dua sheet, yaitu `Ringkasan`, `Ringkasan Komoditas`,
`Hasil Scraping`, `Rekap Proses`, `Validasi Sentimen`, dan `Metodologi`. Aplikasi hanya memakai
dua sheet berikut:

| Sheet                 | Dipakai untuk                                                                                                                       | Hasil                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `Ringkasan Komoditas` | Angka ringkasan per komoditas dan poin ringkasannya                                                                                 | `commodity-overview.datasource.ts` |
| `Hasil Scraping`      | Detail artikel: tanggal, kategori fenomena, judul, media, komoditas, negara terkait, ringkasan, sentimen, skor sentimen, dan tautan | `articles.mock.ts`                 |

Proses konversi sudah dilakukan sekali di luar aplikasi, sehingga **tidak ada parser Excel pada
runtime**. Kedua berkas di atas adalah hasil generate yang menjadi sumber kebenaran data.

Catatan penting:

- Nilai **Poin Pendukung** dan **Rentang Tanggal** tidak dapat diturunkan dari sheet
  `Hasil Scraping`, sehingga tetap disimpan pada entitas `CommodityOverview` sebagai data Excel
  asli — namun **tidak lagi ditampilkan** pada tabel komoditas.
- Baris lanjutan seperti `Lintas Komoditas - Kebijakan dan Regulasi Perdagangan (lanjutan 2)`
  sudah digabungkan ke baris induknya saat konversi.
- Komoditas **lintas komoditas** (mis. `Lintas Komoditas - Logistik dan Pelabuhan`) diperlakukan
  sebagai baris tersendiri; artikel dengan banyak komoditas muncul di lebih dari satu baris
  komoditas, dan artikel tanpa komoditas tidak dimasukkan ke komoditas mana pun.
- Bila admin menambah artikel dengan komoditas yang belum ada di Excel, baris komoditas baru
  dihitung dari artikel tersebut sebagai **fallback**, dan **tidak pernah menimpa** angka Excel.

Data komoditas yang tersedia saat ini (24 baris): Beras, Furnitur, Kereta Api, Minyak dan Gas,
Kendaraan Bermotor, Sayuran dan Buah, Tekstil dan Produk Tekstil, Besi / Baja, Elektronik,
Emas / Logam Mulia, Gula, Jagung, Kayu dan Produk Kayu, Makanan dan Minuman Olahan, Pakaian
Bekas, Perikanan, Pertambangan (Umum), Sawit / CPO, serta enam kelompok
`Lintas Komoditas - ...`.

Penyimpanan artikel yang dapat diubah (create/update/delete) menggunakan `localStorage` dengan
kunci `eksim-insight:articles:v1`; bila kosong, dataset awal dari `articles.mock.ts` digunakan.

---

## Role Pengguna

Role disimpan pada `auth.store.ts` (Pinia) dan **default-nya `admin`**. Pengalih role
("Simulasi role") tersedia di header `AppLayout.vue`.

| Role    | Menu sidebar                                                       | Halaman artikel                                 | CRUD  |
| ------- | ------------------------------------------------------------------ | ----------------------------------------------- | ----- |
| `admin` | Dashboard, **Manajemen Artikel Berita**, Download, Crawling Berita, **Riwayat Perubahan** | `CommodityOverviewTable` (`can-manage="true"`)  | Ya    |
| `user`  | Dashboard, **Artikel Berita**, Download                            | `CommodityOverviewTable` (`can-manage="false"`) | Tidak |

Guard router (`src/app/router/index.ts`):

- Route dengan `meta.requiresAdmin` (`crawling`, `article-management`, `article-changes`) dialihkan ke
  `dashboard`
  bila role bukan admin.
- Route `articles` dialihkan ke `article-management` bila role admin, sehingga tidak ada halaman
  duplikat yang bisa dibuka bersamaan.

Kedua halaman artikel **memakai satu komponen yang sama** (`CommodityOverviewTable`) dan hanya
berbeda pada prop `canManage`. Prop ini diteruskan ke `ArticleExplorer`, yang menyembunyikan
seluruh elemen pengelolaan (tombol _Tambah Artikel_, kolom _Aksi_, dan modal formulir) saat
`canManage` bernilai `false`. Hasilnya, tampilan User identik dengan Admin kecuali fitur CRUD.

---

## Responsivitas dan Branding

- Halaman daftar komoditas menampilkan kartu pada perangkat ponsel dan tablet agar nama
  komoditas, statistik, serta poin ringkasan tetap mudah dibaca tanpa memaksa pengguna
  menggeser tabel yang terlalu lebar.
- Pop-up artikel menampilkan kartu detail pada layar kecil dan menengah. Pada layar desktop,
  tabel artikel lengkap tetap digunakan untuk perbandingan antar kolom.
- Kolom **Tanggal** pada tabel detail artikel dapat diklik untuk mengurutkan artikel secara
  descending (terbaru ke terlama) atau ascending (terlama ke terbaru).
- Dialog dan formulir mengikuti tinggi viewport dinamis, sehingga tetap dapat di-scroll pada
  layar pendek atau browser mobile.
- Sidebar menggunakan logo BPS tanpa latar tambahan, dengan branding **RITME** berwarna putih
  solid dan subjudul **Rekap Informasi & Tren Media** di sampingnya.
- Sidebar menggunakan warna solid, bukan gradasi. Lebarnya menyesuaikan viewport pada mobile,
  sementara menu navigasi, label fitur, dan panel status dapat membungkus secara aman pada layar
  yang lebih sempit.
- Seluruh antarmuka menggunakan font stack yang konsisten berbasis Inter/system UI, dengan skala
  ukuran standar, line-height yang seragam, dan spacing tipografi yang dikontrol oleh layout.
  Standardisasi ini diterapkan pada header, sidebar, dashboard, tabel, form, dan halaman crawling.
- Card utama pada seluruh halaman non-dashboard (Manajemen Artikel, Artikel Berita, Crawling,
  Download, dan Riwayat Perubahan) mengikuti skala Dashboard: radius `rounded-xl`, padding
  ringkas `p-4` hingga `p-5`, judul `text-sm`, deskripsi `text-xs`, dan angka ringkasan `text-2xl`.
  Popup kalender, modal formulir, dan dialog detail tetap dapat menggunakan ukuran internal yang
  lebih besar agar nyaman digunakan.

## Palet Warna

Antarmuka menggunakan palet yang ringkas agar dashboard tetap konsisten dan tidak terlalu ramai.
Token warna utama tersedia di `src/assets/main.css`.

| Peran | Warna | Penggunaan |
| --- | --- | --- |
| Primary BPS | `#1688C7` (`bps-blue`) | Tombol utama, link, ikon aktif, dan aksen navigasi |
| Primary gelap | `#006B9C` (`bps-blue-dark`) | Teks atau state hover pada aksen biru |
| Biru soft | `blue-50` / `blue-100` | Background badge, panel informasi, dan state aktif yang ringan |
| Netral | `slate-*`, putih | Background halaman, card, tabel, teks, dan border |
| Status positif | `emerald-*` | Sentimen atau indikator berhasil |
| Status perhatian | `orange-*` | Sentimen atau indikator perhatian |

Metadata sumber dan tanggal berita ditampilkan sebagai badge biru soft, bukan sebagai warna aksen
baru. Warna status hijau dan orange tetap dipertahankan karena memiliki makna informasi yang
berbeda dari warna utama.

### Dark mode

Dark mode dapat dipilih melalui kontrol tema pada sidebar. Paletnya menggunakan latar netral
gelap dan solid agar teks tidak menyatu dengan latar biru:

| Elemen | Warna dark mode | Keterangan |
| --- | --- | --- |
| Latar halaman | `#0B0B0B` | Latar utama yang hampir hitam |
| Latar card dan panel | `#1B1B1B` hingga `#202020` | Permukaan solid dengan pemisahan jelas |
| Sidebar | `#111111` | Latar sidebar netral |
| Teks utama dan sekunder | `#F8FAFC` / `#F1F5F9` | Kontras tinggi terhadap permukaan gelap |
| Placeholder | `#E5E7EB` | Tetap terbaca pada input dark mode |
| Border dan grid grafik | `#666666` / `#737373` | Garis pemisah dan grid lebih terlihat |
| Batang dan irisan grafik | Biru, hijau, dan orange terang | Mempertahankan perbedaan visual antar data |
| Menu aktif | `#1E3A8A` | State aktif sidebar yang tegas |

Teks label sumbu, deskripsi kartu, tooltip, placeholder, dan banner sumber menggunakan warna
terang. Tombol mode terang aktif menggunakan latar putih dengan ikon biru agar tetap terlihat saat
kursor dipindahkan maupun saat memperoleh fokus keyboard.

---

## Halaman Manajemen Artikel Berita (Admin)

Halaman ini berisi dua bagian utama.

### 1. Panel "Filter dan pencarian"

- Deskripsi: _Cari berdasarkan nama komoditas atau periode._
- **Periode** — pemilih bulan/tahun berbentuk dialog (`Semua Periode` atau label bulan-tahun
  tertentu).
- **Nama komoditas** — input teks untuk menyaring daftar komoditas (mis. `beras`, `furnitur`,
  `kereta api`).
- **Baris per halaman** — 20 / 50 / 100, dengan tombol `Reset Filter` dan `Cari Komoditas`.
- Tombol **Tambah Artikel** — hanya tampil untuk Admin. Tombol ini membuka pop-up yang sama
  dalam mode formulir artikel baru tanpa filter komoditas, sehingga artikel baru dapat dibuat
  untuk komoditas apa pun. Pada halaman Artikel Berita (User) tombol ini tidak ada.

### 2. Tabel "Daftar Komoditas"

Kolom, sesuai urutan tampil:

| Kolom             | Keterangan                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Komoditas         | Nama komoditas beserta ikon                                                                      |
| Jumlah Berita     | Jumlah artikel komoditas tersebut                                                                |
| Positif           | Jumlah artikel bersentimen positif (badge hijau)                                                 |
| Negatif           | Jumlah artikel bersentimen negatif (badge oranye)                                                |
| Jumlah Poin Utama | Jumlah poin utama hasil ekstraksi                                                                |
| Poin Ringkasan    | **Seluruh** poin ringkasan (tanpa pemotongan `+N poin lainnya`) lengkap dengan media dan tanggal |

Kolom **Jumlah Poin Pendukung** dan **Rentang Tanggal** dihilangkan dari tabel.

Setiap baris bersifat interaktif (`role="button"`, dapat difokus dan diaktifkan dengan
`Enter`/`Space`), memiliki efek hover, dan membuka pop-up. Label aksesibilitas baris berbeda
sesuai role (`Kelola artikel komoditas …` vs `Lihat artikel komoditas …`).

### 3. Pop-up "Daftar dan Kelola Artikel"

- Berbentuk persegi panjang, di-teleport ke `body`, dengan tinggi `94vh`, lebar maksimum
  `1700px`, dan overlay gelap berblur. Dapat ditutup lewat tombol silang, klik area overlay,
  atau tombol `Escape`.
- Header menampilkan eyebrow `DAFTAR DAN KELOLA ARTIKEL` (Admin) atau `DAFTAR ARTIKEL` (User)
  serta judul `Komoditas <nama>` (atau `Semua Komoditas` saat menambah artikel).
- Di dalamnya dirender `ArticleExplorer` dengan `compact-search`, `commodity`, dan
  `auto-create`, sehingga artikel otomatis difilter ke komoditas yang dipilih. Contoh: klik
  baris **Beras** hanya menampilkan artikel dengan komoditas Beras.
- `popupKey` memaksa komponen di-_remount_ saat mode berubah (daftar ↔ formulir). Setiap kali
  pop-up ditutup, ringkasan komoditas dimuat ulang agar jumlah artikel tetap konsisten.
- Kolom tabel artikel di dalam pop-up: Tanggal, Kategori, Kata Kunci, Judul Berita, Media,
  Komoditas, Negara Terkait, Ringkasan, Tautan, Sentimen, Skor, dan **Aksi** (khusus Admin,
  berisi tombol edit dan hapus).
- Bagian pencarian di pop-up **hanya berupa satu search bar** dengan tombol `Reset` dan `Cari`;
  panel filter lengkap tidak dirender pada mode ini. Formulir tambah/ubah artikel juga muncul di
  dalam pop-up ini.

---

## Riwayat Perubahan (Admin)

Menu **Riwayat Perubahan** hanya tersedia untuk role Admin dan mencatat seluruh aktivitas CRUD
artikel yang dilakukan melalui aplikasi:

- **Ditambahkan** — artikel baru berhasil dibuat.
- **Diubah** — data artikel berhasil diperbarui.
- **Dihapus** — artikel berhasil dihapus.

Setiap catatan menyimpan ID artikel, judul artikel, jenis aksi, dan waktu perubahan. Riwayat
disimpan secara lokal pada browser dengan kunci `eksim-insight:article-changes:v1` dan dibatasi
hingga 100 aktivitas terbaru.

Halaman ini menyediakan dua filter yang dapat digunakan bersamaan:

- **Jenis perubahan** — Semua, Ditambahkan, Diubah, atau Dihapus.
- **Periode** — pemilih bulan/tahun dengan dialog kalender yang tampilannya konsisten dengan filter
  periode pada halaman Manajemen Artikel Berita, termasuk navigasi tahun dan opsi `Semua Periode`.

Route `/article-changes` dilindungi dengan `meta.requiresAdmin`, sehingga User tidak dapat
membuka halaman ini maupun melihat menunya.

---

## Halaman Artikel Berita (User)

Halaman ini merender komponen yang sama dengan Admin memakai `can-manage="false"`:

- Panel "Filter dan pencarian" tanpa tombol Tambah Artikel.
- Tabel "Daftar Komoditas" dengan kolom dan urutan yang identik.
- Pop-up `DAFTAR ARTIKEL` dengan 11 kolom artikel (tanpa kolom `Aksi`), satu search bar, dan
  tanpa modal formulir.
- Teks bantuan berubah menjadi _Klik baris untuk membuka daftar artikel._

Deskripsi route: _Cari, filter, dan telusuri data artikel berita ekspor impor_ (tanpa kata
"kelola").

---

## Struktur Proyek

Arsitektur mengikuti pola **feature-based + clean architecture** ringan: setiap fitur dipisah
menjadi lapisan `domain` (entity, repository interface, use case), `data` (datasource,
implementasi repository), dan `presentation` (komponen, halaman).

```text
src/
├── app/
│   ├── container.ts              # Dependency injection manual (repository + use case)
│   ├── layouts/AppLayout.vue     # Sidebar, header, pengalih role
│   ├── router/index.ts           # Definisi route + guard role
│   └── stores/auth.store.ts      # Role admin/user
├── assets/main.css               # Tailwind + token warna BPS
├── features/
│   ├── article-management/
│   │   └── presentation/
│   │       ├── components/CommodityOverviewTable.vue        # Halaman bersama Admin & User
│   │       └── pages/ArticleManagementPage.vue              # can-manage = true
│   ├── articles/
│   │   ├── data/
│   │   │   ├── datasources/articles.mock.ts                 # Sheet "Hasil Scraping"
│   │   │   ├── datasources/commodity-overview.datasource.ts # Sheet "Ringkasan Komoditas"
│   │   │   └── repositories/…                               # Implementasi repository
│   │   ├── domain/
│   │   │   ├── entities/news-article.ts, commodity-overview.ts
│   │   │   ├── entities/article-change.ts                 # Entitas riwayat perubahan artikel
│   │   │   ├── repositories/…
│   │   │   └── use-cases/…                                  # search, create, update, delete,
│   │   │                                                    # get-commodity-overview
│   │   └── presentation/
│   │       ├── components/ArticleExplorer.vue               # Tabel artikel + CRUD opsional
│   │       ├── pages/ArticlesPage.vue                       # can-manage = false
│   │       └── pages/ArticleChangesPage.vue                 # Riwayat perubahan Admin
│   ├── crawling/                 # Simulasi crawling + riwayat
│   ├── dashboard/                # Statistik & grafik (StatCard, BaseBarChart, dll.)
│   └── downloads/                # DownloadPage.vue
└── shared/
    ├── components/AppIcon.vue    # Pemetaan nama ikon → Lucide
    └── utils/xlsx-export.ts      # Helper ekspor .xlsx
```

Use case `GetCommodityOverview` menggabungkan baris Excel dengan baris turunan dari artikel yang
komoditasnya belum ada di Excel, lalu mengurutkannya berdasarkan nama komoditas.

---

## Menjalankan Aplikasi

```sh
npm install
```

### Compile dan hot-reload untuk pengembangan

```sh
npm run dev
```

Vite berjalan di `http://localhost:5173`. Bila port tersebut terpakai, jalankan dengan port
eksplisit:

```sh
npm run dev -- --port 5174 --strictPort
```

### Type-check dan build untuk produksi

```sh
npm run build
```

Perintah ini menjalankan `vue-tsc --build` (type-check) dan `vite build` secara paralel.

### Pratinjau hasil build

```sh
npm run preview
```

### Menjalankan unit test dengan [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint dengan [ESLint](https://eslint.org/) dan [oxlint](https://oxc.rs/docs/guide/usage/linter)

```sh
npm run lint
```

### Format dengan [Prettier](https://prettier.io/)

```sh
npm run format
```

---

## Skrip NPM

| Skrip                | Perintah                                   |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Menjalankan dev server Vite                |
| `npm run build`      | `run-p type-check build-only`              |
| `npm run build-only` | `vite build` saja                          |
| `npm run preview`    | Pratinjau hasil build                      |
| `npm run type-check` | `vue-tsc --build`                          |
| `npm run test:unit`  | `vitest`                                   |
| `npm run lint`       | `run-s lint:oxlint lint:eslint`            |
| `npm run format`     | `prettier --write --experimental-cli src/` |

---

## Catatan Pengembangan

- **Type support untuk import `.vue`** — TypeScript tidak menangani tipe untuk berkas `.vue`
  secara bawaan, sehingga `tsc` digantikan `vue-tsc` dan editor memerlukan ekstensi
  [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vetur
  dinonaktifkan).
- **`withDefaults` adalah compiler macro** — jangan mengimpornya dari `vue`; mengimpornya akan
  memunculkan peringatan bahwa macro tersebut tidak perlu diimpor lagi.
- **Urutan kolom tabel** — saat mengubah urutan kolom, sel `<th>` dan `<td>` pasangannya harus
  dipindahkan bersamaan agar header dan isi tabel tidak bergeser diam-diam.
- **Lint yang sudah ada sebelumnya** — `npm run lint` masih melaporkan satu error yang tidak
  berkaitan dengan perubahan ini:
  `src/shared/utils/xlsx-export.ts:25:16 error eslint(no-control-regex)`.

### Recommended IDE & browser setup

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar).
- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  untuk Chromium, atau [versi Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/).
  Aktifkan _Custom Object Formatter_ di DevTools agar tampilan objek lebih mudah dibaca.

### Konfigurasi

Lihat [Vite Configuration Reference](https://vite.dev/config/).
