# Scholar Profile Collector — JavaScript untuk Vercel

Mengambil profil peneliti dan daftar publikasinya melalui SerpApi Google Scholar Author API. Cukup tempel URL seperti https://scholar.google.com/citations?user=S2oIBtYAAAAJ&hl=id . ID diambil otomatis dari parameter user; aplikasi hanya memanggil endpoint SerpApi yang tetap.

Fitur: nama/afiliasi, metrik sitasi yang tersedia, daftar publikasi (judul, penulis, tahun, sumber publikasi, jumlah sitasi, tautan), halaman lanjutan, koleksi lokal, deduplikasi, CSV/RIS, backup/pemulihan JSON. JavaScript/HTML/CSS tanpa dependency npm. Backend Vercel Node.js Functions.

## Deploy ke Vercel

1. Ekstrak ZIP. Unggah **isi folder scholar-tool** ke repository GitHub baru, termasuk `api`, `public`, `package.json`, dan `vercel.json`. Jangan unggah ZIP sebagai satu-satunya isi repo.
2. Di Vercel, pilih **Add New → Project**, lalu impor repository tersebut.
3. Framework Preset: **Other**. Root Directory: folder yang memuat `package.json`. Build Command: `npm run build`. Output Directory: `public`. Node.js: **22.x**. Tidak perlu menambahkan dependency.
4. Di **Environment Variables**, tambahkan:
   - `SERPAPI_API_KEY`: API key dari dashboard akun SerpApi Anda.
   - `APP_PASSWORD`: password pribadi yang panjang untuk akses pencarian. Buat sendiri, misalnya dengan password manager.
5. Aktifkan variabel untuk Production (dan Preview bila perlu), lalu klik **Deploy**.
6. Buka URL aplikasi. Tempelkan tautan profil Google Scholar, dan password yang sama dengan `APP_PASSWORD`. Klik **Ambil profil**.
7. Untuk halaman lanjutan, klik **Ambil halaman berikutnya**. Untuk profil lain, ubah tautan dan klik **Ambil profil** lagi. Artikel baru digabungkan ke koleksi.

Jika environment variable ditambahkan/diubah setelah deploy, lakukan **Redeploy**. Jangan menggunakan awalan `NEXT_PUBLIC_`, jangan menaruh API key di frontend, dan jangan commit `.env`. Password hanya berada di memori halaman dan dikirim melalui HTTPS ke backend; aplikasi tidak menyimpannya di localStorage. API key hanya digunakan backend.

## Cara memakai

1. Tempel tautan profil publik dan masukkan password akses aplikasi.
2. Klik Ambil profil: mengambil hingga 100 publikasi dalam satu permintaan.
3. Bila masih ada halaman berikutnya, klik Ambil halaman berikutnya sampai selesai.
4. Ekspor CSV/RIS atau Backup JSON. Koleksi beberapa profil digabung; profil sumber pertama dipertahankan jika artikel duplikat.

## Batasan

- Maksimum 100 publikasi per halaman sesuai API. Setiap halaman dapat menggunakan kuota permintaan. Cache/kuota aktual mengikuti SerpApi; tidak ada upgrade otomatis.
- API key hanya disimpan di backend. APP_PASSWORD wajib untuk melindungi kuota; jangan sebarkan password. Ini akses sederhana, bukan sistem akun multiuser/rate limit terdistribusi.
- Metrik profil berasal dari SerpApi, bukan dihitung dari koleksi yang mungkin baru sebagian. Ringkasan profil menampilkan profil terakhir yang berhasil diambil, sedangkan koleksi dapat memuat beberapa profil.
- Daftar penulis dapat terpotong; publikasi disimpan sesuai profil. Tidak mengambil abstrak, DOI, isi PDF, atau detail artikel satu per satu. RIS bertipe GEN dengan tahun jika tersedia. Penulis yang terlihat diekspor; periksa kelengkapannya sebelum membuat daftar pustaka final.
- Deduplikasi berdasarkan ID publikasi atau judul ternormalisasi. Publikasi berbeda dengan judul sama dapat tergabung; tinjau manual. Catatan pertama dipertahankan; bukan sinkronisasi/pembaruan sitasi catatan lama.
- Koleksi tersimpan pada browser/perangkat/domain yang sama. Hapus data browser dapat menghapus koleksi. Backup JSON untuk pemulihan. Password tidak disimpan di localStorage. Ringkasan profil dan posisi halaman tidak dipulihkan setelah reload; publikasi tetap tersedia.
- Profil harus dapat diakses publik. Tidak menjamin hasil lengkap bila profil/penyedia membatasi akses.

## Jalankan lokal

Node.js 22. Salin .env.example ke .env dan isi SERPAPI_API_KEY serta APP_PASSWORD.

```
npm run dev
```

Buka http://localhost:3000 . Jangan membuka HTML langsung karena backend harus berjalan.

## Verifikasi

```
npm test
npm run build
```

Pengujian memakai respons simulasi tanpa mengonsumsi kuota. Uji akun nyata memerlukan API key Anda di Vercel.

Dokumentasi: https://serpapi.com/google-scholar-author-api
