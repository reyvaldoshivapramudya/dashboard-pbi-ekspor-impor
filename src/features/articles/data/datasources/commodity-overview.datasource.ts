import type { CommodityOverview } from '../../domain/entities/commodity-overview'

/**
 * Ringkasan komoditas hasil scraping berita ekspor-impor.
 *
 * Sumber data: sheet "Ringkasan Komoditas" pada workbook
 * `HasilScrapingFenomena.xlsx`. Seluruh angka (jumlah berita, jumlah poin utama,
 * poin pendukung, positif, negatif, rentang tanggal) dan poin ringkasan diambil
 * apa adanya dari sheet tersebut, termasuk baris lanjutan
 * "Lintas Komoditas - Kebijakan dan Regulasi Perdagangan (lanjutan 2)" yang
 * digabungkan ke baris induknya.
 *
 * Nilai "Poin Pendukung" dan "Rentang Tanggal" tidak dapat diturunkan dari sheet
 * "Hasil Scraping", sehingga Excel menjadi acuan utama dan tidak dihitung ulang.
 * Tanggal pada poin ringkasan memakai format pendek Excel ("1 Sep") dan dilengkapi
 * tahun 2026 sesuai periode data pada sheet "Hasil Scraping".
 */
export const COMMODITY_OVERVIEWS: CommodityOverview[] = [
  {
    commodity: 'Beras',
    articleCount: 6,
    mainPointCount: 9,
    supportingPointCount: 13,
    positiveCount: 2,
    negativeCount: 4,
    dateRange: '1 Sep - 22 Sep',
    points: [
      {
        text: 'Indonesia akan ekspor 1.000 ton beras premium ke Malaysia yang ditandai dengan penandatanganan nota kesepahaman dengan pihak Malaysia.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-01',
      },
      {
        text: 'Ini sekaligus membuka potensi ekspor ke negeri jiran hingga 200.000 ton dengan nilai Rp 3,4 triliun.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-01',
      },
      {
        text: 'Ketergantungan Indonesia terhadap impor juga tidak hanya terjadi pada beras.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-04',
      },
      {
        text: 'Sebelum swasembada, Zulhas menyebut Indonesia impor beras hampir 4,52 juta ton pada 2024.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-04',
      },
      {
        text: 'Presiden Prabowo Subianto mengungkapkan bertahun-tahun lamanya Indonesia menjadi importir bahan pangan.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Menteri Keuangan Suahasil Nazara dan Menteri Pertanian Andi Amran Sulaiman menyoroti dampak impor ilegal beras yang dinilai merugikan petani dan konsumen.',
        mediaName: 'Antara, CNBC Indonesia',
        publishedAt: '2026-09-22',
      },
      {
        text: 'Menkeu mengatakan penyelundupan impor beras menodai swasembada pangan nasional.',
        mediaName: 'Antara',
        publishedAt: '2026-09-22',
      },
      {
        text: 'Penindakan Direktorat Jenderal Bea dan Cukai Kementerian Keuangan terhadap dugaan impor ilegal beras dan garam di Pelabuhan Tanjung Perak dan Kawasan Berikat Bogor.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-22',
      },
      {
        text: 'Di Kawasan Berikat Bogor, dari 15 kontainer dengan total berat 420 ton yang diberitahukan sebagai bahan kimia untuk penyamakan kulit, ditemukan sekitar 194,9 ton beras dan 225,4 ton butiran putih yang masih dalam proses penelitian lebih lanjut.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-22',
      },
    ],
  },
  {
    commodity: 'Furnitur',
    articleCount: 4,
    mainPointCount: 10,
    supportingPointCount: 8,
    positiveCount: 3,
    negativeCount: 1,
    dateRange: '11 Sep - 30 Sep',
    points: [
      {
        text: 'Kementerian Perdagangan (Kemendag) menyebut produk furnitur Indonesia mencatatkan potensi transaksi sebesar 2,26 juta dolar AS atau Rp39,7 miliar dalam pameran INDEXPLUS 2026 di New Delhi, India.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Direktur Jenderal Pengembangan Ekspor Nasional Kemendag Fajarini Puntodewi mengatakan kementeriannya mengajak pelaku usaha Indonesia untuk melirik India sebagai salah satu pasar ekspor furnitur yang potensial.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Puntodewi menyampaikan makin terbukanya peluang ekspor furnitur Indonesia ke India sejalan dengan perkembangan preferensi konsumen urban India.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Ekspor mebel dan produk kerajinan Indonesia ditarget mencapai US$6 miliar.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-16',
      },
      {
        text: 'Himpunan Industri Mebel dan Kerajinan Indonesia (HIMKI) mencatat, saat ini nilai ekspor mebel dan kerajinan Indonesia berkisar US$2,5-2,6 miliar setahun.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-16',
      },
      {
        text: 'Memperbaiki ekosistem industrinya, terutama kepastian bahan baku, pembiayaan ekspor, restitusi pajak, energi, dan efisiensi logistik.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-16',
      },
      {
        text: 'Besarnya ketersediaan bahan baku belum cukup untuk membuat industri furnitur Indonesia unggul di pasar global.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-24',
      },
      {
        text: 'Pada 2025, Vietnam tercatat sebagai eksportir furnitur nomor dua dunia.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-24',
      },
      {
        text: 'Kinerja positif ini tercermin dari neraca perdagangan furnitur nasional yang terus mencatatkan surplus meyakinkan sejak 2021.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-30',
      },
      {
        text: 'Nilai ekspor pada 2025 sukses menembus angka USD2.390,68 juta dengan pasar Amerika Serikat sebagai penyerap utamanya.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-30',
      },
    ],
  },
  {
    commodity: 'Kereta Api',
    articleCount: 4,
    mainPointCount: 8,
    supportingPointCount: 8,
    positiveCount: 1,
    negativeCount: 3,
    dateRange: '25 Sep - 30 Sep',
    points: [
      {
        text: 'Menteri Perdagangan (Mendag) Budi Santoso mengatakan impor rangkaian kereta rel listrik (KRL) bekas dari Jepang perlu rekomendasi dari kementerian teknis.',
        mediaName: 'Antara, DetikFinance',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Komisi VI DPR RI menyetujui rencana impor rangkaian kereta rel listrik (KRL) bekas dari Jepang dengan syarat tetap meningkatkan industri perkeretaapian dalam negeri.',
        mediaName: 'Antara, DetikFinance',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Sebelumnya, Direktur Utama PT Kereta Api Indonesia (Persero) Bobby Rasyidin mengatakan KAI berencana akan mengimpor kereta bekas dari Jepang dalam rangka transisi produksi dalam negeri yang masih belum memadai.',
        mediaName: 'Antara, DetikFinance',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Menteri Perhubungan (Menhub) Dudy Purwagandhi mengatakan pengaturan rencana impor kereta rel listrik (KRL) merupakan kewenangan Kementerian Perdagangan.',
        mediaName: 'Antara',
        publishedAt: '2026-09-28',
      },
      {
        text: 'Dudy mengatakan pengaturan mengenai impor menjadi kewenangan kementerian yang membidangi perdagangan sehingga pembahasannya mengikuti ketentuan serta mekanisme pemerintah yang berlaku.',
        mediaName: 'Antara',
        publishedAt: '2026-09-28',
      },
      {
        text: 'Syarat yang ketat diterapkan Kementerian Perdagangan untuk rencana impor kereta rel listrik (KRL) bukan baru alias bekas yang mau dilakukan PT Kereta Api Indonesia (KAI).',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-28',
      },
      {
        text: 'Kini, KAI perlu mendapatkan persetujuan impor untuk KRL bekas tersebut.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-28',
      },
      {
        text: 'Impor tersebut dibutuhkan untuk memenuhi kebutuhan kapasitas angkutan KRL Jabodetabek yang terus meningkat.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-28',
      },
    ],
  },
  {
    commodity: 'Minyak dan Gas',
    articleCount: 4,
    mainPointCount: 7,
    supportingPointCount: 5,
    positiveCount: 2,
    negativeCount: 2,
    dateRange: '17 Sep - 24 Sep',
    points: [
      {
        text: 'Menteri Energi dan Sumber Daya Mineral (ESDM) Bahlil Lahadalia mengatakan impor minyak dan gas baik dari Rusia maupun Amerika Serikat (AS) ditetapkan dengan kebijakan yang melihat semua aspek, terutama anggaran pendapatan dan belanja negara (APBN).',
        mediaName: 'Antara, DetikFinance',
        publishedAt: '2026-09-17',
      },
      {
        text: 'Terkait kelanjutan rencana impor pasokan minyak mentah dari Rusia, Bahlil enggan berkomentar.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-17',
      },
      {
        text: 'Sementara mengenai kelanjutan kesepakatan impor energi dengan AS baik untuk produk LPG, minyak, maupun BBM pemerintah tetap menggunakan asas keekonomian untuk memastikan Indonesia bisa mendapatkan harga terbaik saat impor dilakukan. (hns/hns)',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-17',
      },
      {
        text: 'Asosiasi Produsen Biofuel Indonesia (Aprobi) menyatakan di kawasan Asia Tenggara, pengembangan bahan bakar nabati berbasis sawit dinilai terbukti efektif mengurangi ketergantungan pada impor bahan bakar fosil.',
        mediaName: 'Antara',
        publishedAt: '2026-09-22',
      },
      {
        text: 'Indonesia berencana melanjutkan impor minyak mentah dari Rusia untuk menjaga ketahanan energi dan memenuhi kebutuhan dalam negeri di tengah risiko kebijakan tarif Amerika Serikat (AS) terhadap negara pembeli energi Rusia.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-24',
      },
      {
        text: 'Presiden Donald Trump pada 18 September 2026 menandatangani Lindsey O. Graham Sanctioning Russia and Iran Act of 2026, yang memberikan kewenangan kepada presiden AS untuk mengenakan tarif hingga 100% terhadap barang dari negara tertentu yang menjadi pembeli besar energi Rusia atau membantu menghindari sanksi.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-24',
      },
      {
        text: 'India, yang merupakan salah satu pembeli utama minyak Rusia, telah memperingatkan bahwa tarif baru AS berpotensi memengaruhi hubungan bilateral dan pasar energi global.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-24',
      },
    ],
  },
  {
    commodity: 'Kendaraan Bermotor',
    articleCount: 2,
    mainPointCount: 4,
    supportingPointCount: 1,
    positiveCount: 1,
    negativeCount: 1,
    dateRange: '16 Sep - 30 Sep',
    points: [
      {
        text: 'Terutama pada ketersediaan bahan baku yang bergantung impor.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-16',
      },
      {
        text: 'Untuk kegiatan ekspor, kapal memuat sebanyak 2.259 unit kendaraan, terdiri atas 1.215 unit Mitsubishi Xforce dan 1.044 unit Mitsubishi Xpander, yang diberangkatkan menuju Meksiko.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-30',
      },
      {
        text: 'Sebelumnya, layanan kapal kendaraan internasional di Pelabuhan Patimban telah berjalan sejak 2021 melalui layanan Toyofuji Shipping (TFS) yang melayani kegiatan ekspor dan impor kendaraan ke sejumlah tujuan internasional.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-30',
      },
      {
        text: 'Kehadiran NYK menambah jaringan perusahaan pelayaran yang memanfaatkan Terminal Kendaraan Pelabuhan Patimban seiring berkembangnya kebutuhan layanan logistik sektor otomotif.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-30',
      },
    ],
  },
  {
    commodity: 'Sayuran dan Buah',
    articleCount: 2,
    mainPointCount: 6,
    supportingPointCount: 9,
    positiveCount: 2,
    negativeCount: 0,
    dateRange: '13 Sep - 20 Sep',
    points: [
      {
        text: 'Kolaborasi ini ditujukan untuk meningkatkan daya saing dan kinerja ekspor produk hortikultura Indonesia.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Agenda strategis ini dibahas mendalam dalam Pertemuan Kolaborasi Penguatan Ekspor dan Hilirisasi Komoditas Hortikultura.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Direktur Hilirisasi Hasil Hortikultura Kementan Freddy Lumban Gaol menyebut peningkatan ekspor membutuhkan kerja bersama lintas lembaga.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Harga kubis untuk pasar ekspor diproyeksikan mencapai Rp 7.000 hingga Rp 10.000 per kilogram.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-20',
      },
      {
        text: 'Untuk memenuhi persyaratan pasar internasional, petani didorong menerapkan Good Agricultural Practices (GAP), termasuk pengelolaan budidaya yang baik, penggunaan pestisida secara tepat, dan pengendalian residu sesuai ketentuan negara tujuan ekspor.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-20',
      },
      {
        text: 'Kubis yang dikembangkan untuk pasar ekspor ditargetkan memiliki bobot antara 1,5 hingga 2,5 kilogram per knop, sesuai dengan spesifikasi dan permintaan calon pembeli.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-20',
      },
    ],
  },
  {
    commodity: 'Tekstil dan Produk Tekstil',
    articleCount: 2,
    mainPointCount: 4,
    supportingPointCount: 7,
    positiveCount: 2,
    negativeCount: 0,
    dateRange: '16 Sep - 23 Sep',
    points: [
      {
        text: 'Kapolri mengidentifikasi tiga ancaman utama yang secara bersamaan menekan industri tekstil nasional, yakni peredaran barang impor ilegal secara masif, tekanan ekonomi global yang kian berat, dan lonjakan impor secara umum yang tidak terkendali.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-16',
      },
      {
        text: 'Meski sektor garmen Indonesia masih menjadi eksportir bersih, pemerintah mencatat industri tekstil hulu hingga menengah masih bergantung pada bahan baku impor.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-23',
      },
      {
        text: 'Airlangga menjelaskan impor bahan baku tekstil mencapai sekitar US$8,4 miliar, sedangkan ekspornya baru sekitar US$3,1 miliar.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-23',
      },
      {
        text: 'Sebaliknya, sektor pakaian jadi mencatat ekspor sekitar US$8,7 miliar, jauh lebih tinggi dibandingkan impornya yang hanya sekitar US$690 juta.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-23',
      },
    ],
  },
  {
    commodity: 'Besi / Baja',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 2,
    positiveCount: 0,
    negativeCount: 1,
    dateRange: '15 Sep',
    points: [
      {
        text: 'Indonesia melalui Komite Anti Dumping Indonesia (KADI) memulai penyelidikan antidumping terhadap impor baja lapis seng atau galvanis (BJLS) asal China.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-15',
      },
      {
        text: 'Frida menjelaskan, pada periode 1 Januari 2023—31 Desember 2025, total impor BJLS Indonesia dari dunia tercatat sebesar 2.562.407 metrik ton (MT).',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-15',
      },
      {
        text: 'Sejumlah pelaku usaha di sektor tersebut disebut mengalami kesulitan mendapatkan pinjaman, sehingga Lembaga Pembiayaan Ekspor Indonesia (LPEI) atau Indonesia Eximbank diminta turun tangan.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-15',
      },
    ],
  },
  {
    commodity: 'Elektronik',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 2,
    positiveCount: 0,
    negativeCount: 1,
    dateRange: '11 Sep',
    points: [
      {
        text: 'Terdakwa kasus impor ponsel ilegal, Dien Chih Pan (DCP) alias Peter akan menjalani sidang tuntutan di Pengadilan Negeri Jakarta Utara, pada Senin (14/9).',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Terdakwa merupakan Direktur PT Eye 1 Indo Investement yang mengimpor barang ilegal dari China berupa ponsel merek iPhone dalam keadaan tidak baru serta sejumlah barang lainnya.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Satgas Gakkum Penyelundupan Polri menggeledah enam lokasi berupa gudang, ruko, dan kantor yang digunakan sebagai tempat penyimpanan barang impor ilegal.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
    ],
  },
  {
    commodity: 'Emas / Logam Mulia',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 3,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '15 Sep',
    points: [
      {
        text: 'Pengawasan tersebut berkaitan dengan kewajiban kepabeanan dan penerapan bea keluar atas ekspor emas sejak 17 November 2025.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-15',
      },
      {
        text: 'Direktur Jenderal Bea dan Cukai, Djaka Budhi Utama mengatakan pengawasan terhadap lalu lintas emas menjadi penting untuk memastikan kewajiban kepabeanan dan penerimaan negara dari aktivitas perdagangan luar negeri tetap terpenuhi.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-15',
      },
      {
        text: 'Di Bandara Soekarno-Hatta, Bea Cukai mengamankan 10 keping emas cast bar dengan berat 10.053 gram dari dua warga negara China tujuan Hong Kong.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-15',
      },
    ],
  },
  {
    commodity: 'Gula',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 7,
    positiveCount: 0,
    negativeCount: 1,
    dateRange: '24 Sep',
    points: [
      {
        text: 'Asosiasi Petani Tebu Rakyat Indonesia (APTRI) mempersoalkan kebijakan impor gula pemerintah di tengah berlangsungnya musim giling tebu dalam negeri.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-24',
      },
      {
        text: 'Soemitro menyoroti adanya rencana impor sekitar 150 ribu ton raw sugar atau gula mentah yang nantinya diperuntukkan untuk kebutuhan gula konsumsi.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-24',
      },
      {
        text: 'Impor itu disebut dialokasikan melalui ID Food, dengan 50 ribu ton digiling di Pabrik Gula Madukismo dan 100 ribu ton lainnya di pabrik gula swasta di Bombana, Sulawesi Tenggara.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-24',
      },
    ],
  },
  {
    commodity: 'Jagung',
    articleCount: 1,
    mainPointCount: 1,
    supportingPointCount: 1,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '13 Sep',
    points: [
      {
        text: 'Presiden Prabowo Subianto mengungkapkan bertahun-tahun lamanya Indonesia menjadi importir bahan pangan.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-13',
      },
    ],
  },
  {
    commodity: 'Kayu dan Produk Kayu',
    articleCount: 1,
    mainPointCount: 1,
    supportingPointCount: 0,
    positiveCount: 0,
    negativeCount: 1,
    dateRange: '24 Sep',
    points: [
      {
        text: 'Pada 2025, Vietnam tercatat sebagai eksportir furnitur nomor dua dunia.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-24',
      },
    ],
  },
  {
    commodity: 'Makanan dan Minuman Olahan',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 4,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '18 Sep',
    points: [
      {
        text: 'Pemerintah juga mendorong peningkatan ekspor produk hilir bernilai tambah tinggi dan memperluas penetrasi ke 20 negara tujuan ekspor baru, terutama di Amerika, Eropa Timur, Timur Tengah, dan Asia Selatan.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-18',
      },
      {
        text: 'Pada 2025, ekspor mamin mencapai US$ 49,5 miliar, naik 19,5 persen dan menjadi yang tertinggi dalam lima tahun terakhir.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-18',
      },
      {
        text: 'Ekspor industri mamin mencapai US$ 24,61 miliar dengan surplus US$ 17,57 miliar.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-18',
      },
    ],
  },
  {
    commodity: 'Pakaian Bekas',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 2,
    positiveCount: 0,
    negativeCount: 1,
    dateRange: '23 Sep',
    points: [
      {
        text: 'Peredaran pakaian bekas impor ilegal atau balpres masih menjadi pekerjaan rumah bagi pemerintah.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-23',
      },
      {
        text: 'Selama permintaan tersebut masih ada, upaya memasukkan balpres secara ilegal dinilai akan terus terjadi.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-23',
      },
      {
        text: 'Pada kesempatan yang sama, Menteri Keuangan Suahasil Nazara menyebut impor ilegal akan merugikan tukang jahit hingga industri tekstil di dalam negeri.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-23',
      },
    ],
  },
  {
    commodity: 'Perikanan',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 4,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '22 Sep',
    points: [
      {
        text: 'KKP amankan 1.048 ton udang impor yang diduga salah peruntukan di Jatim.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-22',
      },
      {
        text: 'Udang tersebut seharusnya digunakan sebagai bahan pengolahan untuk kebutuhan ekspor, namun diduga masuk ke pasar domestik.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-22',
      },
      {
        text: 'Humas KKP) Menteri Kelautan dan Perikanan Sakti Wahyu Trenggono menegaskan pemerintah tidak akan membiarkan udang impor yang mendapat fasilitas untuk kebutuhan ekspor justru beredar di pasar lokal.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-22',
      },
    ],
  },
  {
    commodity: 'Pertambangan (Umum)',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 1,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '3 Sep',
    points: [
      {
        text: 'Menteri Keuangan Purbaya Yudhi Sadewa menerbitkan Peraturan Menteri Keuangan (PMK) Nomor 48 Tahun 2026 yang mengatur kriteria eksportir penerima perlakuan khusus dalam kewajiban pemasukan, penempatan, dan penggunaan Devisa Hasil Ekspor Sumber Daya Alam (DHE SDA).',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Eksportir sektor pertambangan yang memenuhi kriteria tersebut mendapatkan fleksibilitas dalam pemenuhan kewajiban DHE SDA.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Ketentuan tersebut memberikan ruang bagi eksportir untuk mengelola devisa sesuai dengan fasilitas yang ditetapkan pemerintah.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-03',
      },
    ],
  },
  {
    commodity: 'Sawit / CPO',
    articleCount: 1,
    mainPointCount: 1,
    supportingPointCount: 0,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '22 Sep',
    points: [
      {
        text: 'Asosiasi Produsen Biofuel Indonesia (Aprobi) menyatakan di kawasan Asia Tenggara, pengembangan bahan bakar nabati berbasis sawit dinilai terbukti efektif mengurangi ketergantungan pada impor bahan bakar fosil.',
        mediaName: 'Antara',
        publishedAt: '2026-09-22',
      },
    ],
  },
  {
    commodity: 'Lintas Komoditas - Kebijakan dan Regulasi Perdagangan',
    articleCount: 6,
    mainPointCount: 13,
    supportingPointCount: 7,
    positiveCount: 4,
    negativeCount: 2,
    dateRange: '1 Sep - 29 Sep',
    points: [
      {
        text: 'Diskusi tersebut melibatkan regulator dari Kementerian Perdagangan, anggota Komisi VI DPR RI, serta akademisi untuk membahas arah tata kelola ekspor komoditas strategis nasional.',
        mediaName: 'Antara',
        publishedAt: '2026-09-01',
      },
      {
        text: 'NEXT Indonesia Center mencatat berdasarkan data UN Comtrade, nilai ekspor produk minyak sawit HS 1511, batu bara HS 2701, dan lignit HS 2702 sepanjang 2025 mencapai 54,6 miliar dolar AS atau sekitar Rp968,33 triliun, setara 19,39 persen dari total ekspor nasional.',
        mediaName: 'Antara',
        publishedAt: '2026-09-01',
      },
      {
        text: 'Komite Anti Dumping Indonesia (KADI) mengakui masih ada celah dalam sistem perlindungan perdagangan Indonesia untuk menghadapi praktik penghindaran (circumvention) terhadap barang impor yang telah dikenakan Bea Masuk Antidumping (BMAD).',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Modusnya antara lain dengan mengalihkan nomor pos tarif atau HS Code, maupun menggunakan negara ketiga.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Indonesia beserta tujuh negara sahabat mendukung keputusan Inggris yang secara resmi melarang impor barang serta pembatasan layanan yang berkaitan dengan pemukiman ilegal Israel di wilayah pendudukan Palestina.',
        mediaName: 'Antara',
        publishedAt: '2026-09-10',
      },
      {
        text: 'Menurut laporan kantor berita Turki, Anadolu, Menteri Luar Negeri Inggris Ed Miliband pada Selasa (8/9) mengumumkan di hadapan Majelis Rendah Inggris terkait larangan impor dari permukiman Israel di Tepi Barat serta sanksi terhadap perusahaan dan individu yang terlibat dalam perluasan permukiman.',
        mediaName: 'Antara',
        publishedAt: '2026-09-10',
      },
      {
        text: 'Menurut Andika, pemastian kehalalan produk impor tidak semata-mata berkaitan dengan aspek perdagangan dan sertifikasi, tetapi juga menyangkut hak masyarakat untuk memperoleh produk yang sesuai dengan keyakinan dan ketentuan yang berlaku di Indonesia.',
        mediaName: 'SINDOnews',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Presiden RI Prabowo Subianto akan memperluas skema pengawasan ekspor satu pintu melalui PT Danantara Sumberdaya Indonesia (Persero) dengan menambahkan lebih banyak jenis komoditas mulai 1 Januari 2027 mendatang.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-17',
      },
      {
        text: 'Kebijakan tersebut tidak lain untuk menertibkan tata kelola perdagangan luar negeri dan menghentikan praktik manipulasi laporan ekspor yang dinilai telah merugikan keuangan negara.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-17',
      },
      {
        text: 'Dalam kurun waktu 34 tahun, akumulasi nilai kekayaan negara yang hilang akibat laporan ekspor palsu diperkirakan mencapai US$ 908 miliar atau sekitar Rp 15.000 triliun.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-17',
      },
      {
        text: 'Kementerian Perdagangan (Kemendag) menegaskan pemberlakuan kewajiban sertifikasi halal secara penuh pada Oktober 2026 bukan merupakan larangan dan pembatasan (lartas) terhadap barang impor.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-29',
      },
      {
        text: 'Direktur Fasilitasi Ekspor dan Impor Direktorat Jenderal Perdagangan Luar Negeri Kemendag, Bayu Wicaksono, menyampaikan bahwa ketentuan wajib halal tidak dirancang untuk menghambat arus perdagangan global.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-29',
      },
      {
        text: 'Bayu menuturkan bahwa Indonesia saat ini mencatat surplus neraca perdagangan lebih dari US$ 20 miliar, sehingga kepercayaan mitra dagang perlu dipertahankan melalui regulasi yang transparan.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-29',
      },
    ],
  },
  {
    commodity: 'Lintas Komoditas - Industri dan Dukungan Ekspor',
    articleCount: 4,
    mainPointCount: 11,
    supportingPointCount: 10,
    positiveCount: 2,
    negativeCount: 2,
    dateRange: '3 Sep - 13 Sep',
    points: [
      {
        text: 'Ketua Komite Antidumping Indonesia (KADI) Frida Adiati, mengungkap sektor industri baja dan produk turunannya, serta produk kimia dan petrokimia nasional sebagai sektor industri yang paling rawan mendapat tekanan serbuan produk impor dari luar negeri.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Untuk sektor baja, katanya, KADI saat ini tengah mencermati peningkatan impor dan perubahan pola perdagangan yang berpotensi menekan industri dalam negeri.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Kenaikan impor tidak otomatis menunjukkan adanya pengalihan pasar atau unfair trade, karena bisa juga dipicu peningkatan permintaan dalam negeri, harga yang lebih kompetitif, maupun kondisi pasar global.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Ketua Komite Anti Dumping Indonesia (KADI) Frida Adiati menegaskan, kekhawatiran terhadap dampak impor ke industri dalam negeri tidak semata-mata dilihat dari besarnya nilai impor suatu produk, melainkan potensi dampak struktural terhadap daya saing dan keberlangsungan industri dalam negeri.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-04',
      },
      {
        text: 'Pembuktian yang dilakukan KADI mencakup ada atau tidaknya praktik dumping, kerugian yang dialami industri dalam negeri, serta hubungan sebab-akibat antara impor yang diduga dumping dengan kerugian tersebut.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-04',
      },
      {
        text: 'Lembaga Pembiayaan Ekspor Indonesia (LPEI)/Indonesia Eximbank bersama Direktorat Jenderal Perbendaharaan (DJPb) Kementerian Keuangan RI (Kemenkeu) meresmikan 48 Desa Devisa di Provinsi Kepulauan Babel.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-08',
      },
      {
        text: 'Program Desa Devisa merupakan program pendampingan berbasis community development yang diinisiasi Indonesia Eximbank untuk meningkatkan kapasitas masyarakat lokal dan mengembangkan komoditas unggulan desa hingga mampu menembus pasar ekspor.',
        mediaName: 'DetikFinance, CNBC Indonesia',
        publishedAt: '2026-09-08',
      },
      {
        text: 'Program ini menjadi bagian dari upaya berkelanjutan LPEI untuk memastikan bahwa pertumbuhan ekspor tidak hanya bertumpu pada pelaku usaha besar, tetapi juga tumbuh dari potensi ekonomi masyarakat di berbagai daerah Indonesia. (anl/ega)',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-08',
      },
      {
        text: 'LPEI dibentuk berdasarkan Undang-Undang Nomor 2 Tahun 2009 dengan mandat menunjang kebijakan pemerintah dalam mendorong ekspor nasional.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Kategori Jawara Penggerak Desa Devisa diberikan kepada Desa Devisa Lidi Sawit Riau yang berhasil mengolah limbah pelepah sawit menjadi lidi sawit bernilai ekspor, melalui pembinaan di 33 desa yang melibatkan 925 petani serta ibu-ibu rumah tangga lokal.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-13',
      },
      {
        text: 'Melalui Coaching Program for New Exporters (CPNE), sejak 2019 hingga Juli 2026 tercatat 1.983 eksportir baru, yang mencakup penciptaan eksportir baru, pembukaan negara tujuan ekspor baru, serta perolehan pembeli baru.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-13',
      },
    ],
  },
  {
    commodity: 'Lintas Komoditas - Logistik dan Pelabuhan',
    articleCount: 3,
    mainPointCount: 9,
    supportingPointCount: 16,
    positiveCount: 2,
    negativeCount: 1,
    dateRange: '3 Sep - 23 Sep',
    points: [
      {
        text: 'Kantor Wilayah Bea Cukai Jakarta mengoptimalkan Pusat Logistik Berikat (PLB) sebagai penyangga pelabuhan untuk mempercepat arus barang, menekan dwelling time, dan mengurangi biaya logistik.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Kepala Kantor Wilayah Bea Cukai Jakarta Hendri Darnadi mengatakan, PLB dapat mengurangi keterisian kawasan pelabuhan karena fasilitas tersebut menyediakan tempat penampungan barang sebelum barang melanjutkan proses berikutnya.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Pelaku usaha juga mengeluhkan proses dokumen larangan dan pembatasan (lartas), termasuk persetujuan teknis dari Kementerian Perindustrian dan persetujuan impor dari Kementerian Perdagangan.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-03',
      },
      {
        text: 'Pemerintah mempercepat integrasi layanan perdagangan dan logistik nasional melalui penguatan Indonesia National Single Window (INSW).',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-09',
      },
      {
        text: 'Langkah ini dilakukan untuk memangkas hambatan birokrasi, memperkuat pengawasan ekspor-impor, sekaligus mendukung implementasi tata kelola ekspor sumber daya alam (SDA) strategis dan penguatan logistik nasional.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-09',
      },
      {
        text: 'Di sektor logistik, layanan SSm Pabean-Karantina telah diterapkan di 23 pelabuhan dengan tingkat utilisasi mencapai 100%.',
        mediaName: 'CNBC Indonesia',
        publishedAt: '2026-09-09',
      },
      {
        text: 'Impor ilegal kembali menjadi sorotan setelah Direktorat Jenderal Bea dan Cukai Kementerian Keuangan mengungkap sejumlah kasus penyelundupan sepanjang Agustus hingga September 2026.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-23',
      },
      {
        text: 'Peneliti Indef Ahmad Heri Firdaus sebelumnya mengingatkan bahwa barang impor ilegal dapat masuk melalui pelabuhan tikus atau pelabuhan tidak resmi.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-23',
      },
      {
        text: 'Karena itu, persoalan impor ilegal bukan hanya soal pengawasan kontainer, tetapi juga bagaimana menutup celah di sepanjang garis perbatasan dan pesisir Indonesia.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-23',
      },
    ],
  },
  {
    commodity: 'Lintas Komoditas - Perjanjian Dagang dan Diplomasi',
    articleCount: 2,
    mainPointCount: 6,
    supportingPointCount: 4,
    positiveCount: 2,
    negativeCount: 0,
    dateRange: '25 Sep - 30 Sep',
    points: [
      {
        text: 'Menteri Perdagangan (Mendag) Budi Santoso mengungkapkan pentingnya Indonesia memiliki perjanjian dagang dengan Amerika Serikat (AS) mengingat negara tersebut memiliki peluang pasar yang besar.',
        mediaName: 'Antara',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Lima besar surplus neraca perdagangan tertinggi Indonesia sepanjang tahun 2025 yakni nomor satu adalah AS sebesar 18,11 miliar dolar AS, kemudian India 13,49 miliar dolar AS, Filipina 8,42 miliar dolar AS, Belanda 4,81 miliar dolar AS dan Vietnam 4,47 miliar dolar AS.',
        mediaName: 'Antara',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Jadi kita harus mempunyai perjanjian dagang dengan AS, karena pangsa ekspor kita ke AS itu 11 persen.',
        mediaName: 'Antara',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Kementerian Perdagangan mencatat ekspor nonmigas ke Afrika Barat pada 2025 tumbuh 56,66 persen dibandingkan tahun sebelumnya, menjadikannya salah satu kawasan dengan pertumbuhan ekspor tertinggi Indonesia.',
        mediaName: 'Antara',
        publishedAt: '2026-09-25',
      },
      {
        text: 'Staf Ahli Menteri Luar Negeri (Menlu) Bidang Diplomasi Ekonomi Zelda Wulan Kartika mengatakan Trade Expo Indonesia (TEI) 2026 dapat menjadi kesempatan untuk memperluas pasar ekspor Indonesia ke Afrika.',
        mediaName: 'Antara',
        publishedAt: '2026-09-30',
      },
      {
        text: 'Kemendag juga menilai kawasan Afrika memiliki peluang pasar yang besar bagi berbagai produk unggulan Indonesia, sehingga penguatan hubungan perdagangan dengan negara-negara di kawasan tersebut dapat membuka akses lebih luas bagi pelaku usaha nasional.',
        mediaName: 'Antara',
        publishedAt: '2026-09-30',
      },
    ],
  },
  {
    commodity: 'Lintas Komoditas - Umum',
    articleCount: 2,
    mainPointCount: 5,
    supportingPointCount: 4,
    positiveCount: 2,
    negativeCount: 0,
    dateRange: '11 Sep - 25 Sep',
    points: [
      {
        text: 'PT Pelindo Terminal Petikemas menyebutkan bahwa arus peti kemas di Terminal Peti Kemas (TPK) Semarang, Jawa Tengah, saat ini didominasi kegiatan ekspor dan impor yang merupakan arus peti kemas internasional.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Untuk komponennya, kata dia, impor sebesar 309.128 TEUs, atau naik 8,14 persen dari 285.862 TEUs, sedangkan ekspor 316.159 TEUs, atau naik 8,88 persen dari 290.380 TEUs.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Ketua Indonesia National Shipowners Association (INSA) Semarang Hari Ratmoko mengatakan bahwa Pelabuhan Tanjung Mas memang "naik kelas", dalam hal muatan atau peti kemas yang diekspor maupun impor.',
        mediaName: 'Antara',
        publishedAt: '2026-09-11',
      },
      {
        text: 'Pendapatan petani ditargetkan naik 20%-25%, sementara program juga diharapkan menambah 3-6 negara tujuan ekspor dan meningkatkan nilai ekonomi lokal sekitar Rp 30 miliar-Rp 40 miliar per tahun.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-25',
      },
      {
        text: 'LPEI juga melepas ekspor kemiri tujuan Jepang dan vanilla tujuan Amerika Serikat sebanyak 1,4 ton senilai Rp 3,8 miliar.',
        mediaName: 'Liputan6',
        publishedAt: '2026-09-25',
      },
    ],
  },
  {
    commodity: 'Lintas Komoditas - Neraca Dagang',
    articleCount: 1,
    mainPointCount: 3,
    supportingPointCount: 5,
    positiveCount: 1,
    negativeCount: 0,
    dateRange: '2 Sep',
    points: [
      {
        text: 'Neraca perdagangan Indonesia kembali surplus pada Juli 2026 setelah sempat mengalami defisit pada Mei dan Juni 2026.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-02',
      },
      {
        text: 'Menurut Budi, salah satu faktor yang menyebabkan defisit neraca perdagangan pada Maret-April karena tingginya harga minyak dunia di atas US$ 100 per barel.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-02',
      },
      {
        text: 'Surplus neraca perdagangan terjadi karena ekspor lebih besar dibandingkan impor.',
        mediaName: 'DetikFinance',
        publishedAt: '2026-09-02',
      },
    ],
  },
]
