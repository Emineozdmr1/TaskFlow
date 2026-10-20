# ⚡ TaskFlow — Modern Project & Task Management SaaS

<p align="center">
  <b>TaskFlow</b>, ekiplerin ve bireylerin projelerini, görevlerini ve zaman çizelgelerini gerçek zamanlı olarak planlayıp yönetmelerini sağlayan modern bir SaaS platformudur.
</p>

<p align="center">
  <a href="https://taskflow-bb26b.web.app" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Canlı_Demo-taskflow--bb26b.web.app-2563EB?style=for-the-badge" alt="Canlı Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Firebase_Hosting-Live-FFA000?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Hosting" />
  <img src="https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Framer_Motion-Animation-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

---

## 📌 Proje Hakkında

TaskFlow, proje ve iş akış süreçlerini sadeleştirmek için geliştirilmiştir. Anlık veri akışı, etkileşimli Kanban panosu, takvim planlama modülü ve görev bazlı dosya/yorum desteği ile uçtan uca eksiksiz bir iş yönetim deneyimi sunar.

---

## 🚀 Öne Çıkan Özellikler

- **Gerçek Zamanlı Veri Senkronizasyonu:** Firebase Firestore dinleyicileri (`onSnapshot`) ile sayfa yenilemeye gerek kalmadan anlık veri akışı.
- **Çoklu Çalışma Alanı Görünümleri:**
  - 📋 **Liste Görünümü:** Öncelik, durum, etiket ve teslim tarihi bazlı detaylı görev listeleme.
  - 📌 **Etkileşimli Kanban Panosu:** `@hello-pangea/dnd` ile sütunlar arası akıcı sürükle-bırak (Drag-and-Drop) yönetimi.
  - 📅 **Görsel Takvim:** Görevlerin teslim tarihlerine göre organize edildiği aylık planlama takvimi.
- **Kapsamlı Görev & Proje Mimarisi:**
  - Görev öncelikleri (Düşük, Orta, Yüksek) ve renkli etiketleme sistemi.
  - Başlangıç ve bitiş tarihi takibi, gecikmiş/tamamlanmış görev durum uyarıları.
  - Alt görevler (Subtasks) ve dinamik ilerleme yüzdesi.
  - Görev düzeyinde yorumlaşma desteği.
- **Hibrit Dosya Yönetimi (Cloudinary + Firestore):**
  - Dosyalar (Görsel, Video, PDF, Word, Excel) Cloudinary REST API üzerinden asenkron yüklenir ve gerçek zamanlı yükleme yüzdesi (`onProgress`) gösterilir.
  - Dosya metaverileri (boyut, URL, tür, `public_id`) Firestore üzerinde depolanır.
- **Modern Kullanıcı Deneyimi (UX):**
  - **Skeleton Screens:** Klasik spinner'lar yerine sayfa yapısını taklit eden shimmer iskelet ekranlar.
  - **Bildirimler:** `Sonner` ile interaktif toast bildirimleri.
  - **Tema Desteği:** Koyu (Dark) ve Açık (Light) mod desteği.
  - **Çoklu Dil:** Türkçe ve İngilizce (TR/EN) dil desteği.
  - **Responsive Arayüz:** Mobil çekmece (drawer) navigasyonu ile tüm cihazlara tam uyum.

---

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** React 18, TypeScript, Vite
- **Stil & UI:** Tailwind CSS, Lucide React, Framer Motion
- **Sürükle-Bırak:** `@hello-pangea/dnd`
- **Backend & Auth:** Firebase (Authentication, Cloud Firestore)
- **Barındırma & Dağıtım:** Firebase Hosting
- **Medya Depolama:** Cloudinary REST API
- **Form & Doğrulama:** React Hook Form, Zod
- **Bildirim:** Sonner

---
