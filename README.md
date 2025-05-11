# Kontrol Komik - Penggesa Komik Paling Tepat

Selamat datang ke **Kontrol Komik**! Sebuah aplikasi web intuitif yang direka untuk membantu penulis dan artis komik menyusun, menyunting, dan menguruskan data naratif serta visual untuk setiap panel komik mereka dengan terperinci. Aplikasi ini memfokuskan kepada penjanaan data JSON yang kemas dan terstruktur, yang kemudiannya boleh digunakan sebagai asas untuk mencipta *prompt* yang sangat tepat bagi AI penjana imej, atau sebagai skrip kerja untuk pelukis manual.

Dengan gaya visual Pop Art yang menyeronokkan dan antaramuka yang mesra pengguna (termasuk pada peranti mudah alih), Kontrol Komik bertujuan untuk menjadikan proses perancangan komik lebih efisien dan kreatif.

## Ciri-ciri Utama

* **Editor Panel Komik Berasaskan JSON:**
    * Muat naik fail JSON sedia ada untuk mula menyunting.
    * Sokongan untuk format JSON spesifik yang merangkumi `watak`, `aksi`, `dialog`, `sudut` kamera, `gaya` visual, dan perincian `penampilan` watak (warna pakaian, jenis pakaian, aksesori, ekspresi wajah, warna kulit, gaya rambut).
    * Tambah, padam, dan susun semula panel utama dengan mudah.
* **Antaramuka Pengguna Gaya Pop Art:**
    * Reka bentuk visual yang menarik dan menyeronokkan.
    * Mesra peranti mudah alih untuk kegunaan di mana sahaja.
* **Muat Naik Fail Mudah:**
    * Klik untuk pilih fail atau gunakan fungsi **seret-dan-lepas (drag-and-drop)**.
* **Fungsi Penyuntingan Pintar:**
    * **Salin Panel Pertama Ke Semua:** Salin data dari panel utama pertama ke semua panel utama lain.
    * **Selaraskan Semua Watak:** Selaraskan data (aksi, dialog, dll.) untuk watak yang sama berdasarkan data pada kemunculan pertama watak tersebut di semua panel.
    * **Salin Data Watak Ini (Per Panel):** Butang di sebelah setiap medan watak untuk menyalin data spesifik watak tersebut (aksi, dialog, penampilan) dari panel semasa ke semua panel lain yang mempunyai watak yang sama.
    * **Kosongkan Semua Medan Panel:** Mengosongkan semua data input dalam semua panel dengan pantas.
    * **Auto Salin Dialog (Watak Sama):** Ciri yang boleh dihidup/matikan untuk menyalin dialog secara automatik ke panel lain apabila dialog untuk watak yang sama diubah.
* **Eksport Data:**
    * **Muat Turun JSON Baharu:** Simpan semua perubahan anda dalam format JSON yang kemas dan sedia untuk digunakan semula atau sebagai input kepada sistem lain.
    * **Muat Turun Lakaran TXT:** Jana fail teks ringkas yang mudah dibaca mengandungi semua data panel, sesuai untuk draf skrip atau perkongsian idea.
* **Pemberitahuan Masa Nyata:** Alert interaktif untuk maklum balas pengguna.

## Teknologi Digunakan

* **HTML5:** Untuk struktur asas aplikasi web.
* **CSS3:** Untuk penggayaan, termasuk tema Pop Art dan reka bentuk responsif.
    * **Bootstrap 5:** Digunakan sebagai kerangka kerja CSS untuk mempercepatkan pembangunan antaramuka dan memastikan keresponsifan.
    * **Bootstrap Icons:** Untuk ikonografi dalam aplikasi.
    * **Google Fonts:** Untuk tipografi khas Pop Art ('Bangers', 'Passion One').
* **JavaScript (ES6+):** Untuk semua logik aplikasi, interaksi DOM, manipulasi data JSON, dan fungsi-fungsi editor.

## Struktur Fail Projek (Asas)

/kontrol-komik/
|-- kawal.html (atau index.html)  // Fail HTML utama aplikasi
|-- script.js                     // Fail JavaScript untuk semua logik
|-- (mungkin folder /images/ untuk sebarang aset imej tambahan jika ada)


## Cara Penggunaan

1.  **Sediakan Fail:**
    * Pastikan anda mempunyai fail `kawal.html` (atau apa sahaja nama fail HTML anda) dan `script.js` dalam folder yang sama.
2.  **Buka Aplikasi:**
    * Buka fail `kawal.html` menggunakan pelayar web moden pilihan anda (cth., Chrome, Firefox, Edge, Safari).
3.  **Muat Naik JSON (Pilihan):**
    * Jika anda mempunyai fail JSON komik sedia ada yang mematuhi format yang disokong, klik pada kawasan "Klik atau Seret Fail JSON ke Sini" atau seret fail JSON anda ke kawasan tersebut.
    * Data dari JSON akan dipaparkan dalam borang suntingan di "Ruang Editor Komik".
4.  **Mula Menyunting atau Mencipta:**
    * Jika tidak memuat naik JSON, anda boleh mula dengan menambah panel baru menggunakan butang "Tambah Panel Utama Baru".
    * Isi atau ubah suai medan-medan yang disediakan untuk setiap panel: Watak, Aksi, Dialog, Sudut Kamera, Gaya Visual, dan semua perincian Penampilan Watak.
5.  **Gunakan Fungsi Kawalan:**
    * Manfaatkan butang-butang di "Panel Kawalan" untuk menyalin data, mengosongkan medan, atau menguruskan ciri auto-salin.
    * Gunakan butang "Salin Data Watak Ini" di sebelah setiap watak untuk penyalinan data watak yang lebih spesifik.
6.  **Simpan Hasil Kerja Anda:**
    * Klik "Muat Turun JSON Baharu" untuk menyimpan keseluruhan struktur komik anda dalam format JSON.
    * Klik "Muat Turun Lakaran TXT" untuk mendapatkan versi teks ringkas.

## Format JSON yang Disokong

Aplikasi ini direka untuk bekerja dengan format JSON berikut:
```json
[
  {
    "subpanel": [
      {
        "watak": "String",
        "aksi": "String",
        "dialog": "String",
        "sudut": "String",
        "gaya": "String",
        "penampilan": {
          "warna_pakaian": "String",
          "jenis_pakaian": "String",
          "aksesori": "String",
          "ekspresi_wajah": "String",
          "warna_kulit": "String",
          "gaya_rambut": "String"
        }
      }
    ]
  }
  // ... objek panel utama lain boleh ditambah di sini
]
