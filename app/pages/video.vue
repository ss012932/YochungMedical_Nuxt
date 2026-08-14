<template>
  <div class="video-page">
    <!-- Hero：沿用真實影片資料，不使用設計稿中的範例內容 -->
    <section class="video-hero">
      <div class="video-hero-copy">
        <p class="video-eyebrow">{{ $ui('產品影片') }}</p>
        <h1>{{ $ui('產品影片') }}</h1>
        <h2>{{ $ui('專業設備操作與應用分享') }}</h2>
        <p class="video-hero-desc">{{ $ui('透過實際產品影片快速了解設備功能、影像表現與臨床應用， 提供更直覺的產品資訊與操作參考。') }}</p>
      </div>

      <div class="video-hero-media video-hero-image">
        <img src="@/assets/image/video.webp" :alt="$ui('影片專區')" />
      </div>
    </section>

    <main class="video-content">
      <!-- 精選影片 -->
      <section class="featured-section">
        <div class="section-heading featured-heading">
          <div>
            <p class="section-kicker">Featured</p>
            <h2>{{ $ui('精選影片') }}</h2>
          </div>
        </div>

        <div class="featured-card">
          <button type="button" class="featured-media" @click="openVideo(featuredVideo)">
            <img :src="youtubeThumb(featuredVideo.youtubeId)" :alt="$ui(featuredVideo.title)" decoding="async" @error="handleYoutubeThumbError($event, featuredVideo.youtubeId)" />
            <span class="media-shade"></span>
            <span class="play-button large" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M9 7.5 17 12l-8 4.5z" /></svg>
            </span>
          </button>

          <div class="featured-copy">
            <span class="video-type">{{ $ui('產品影片') }}</span>
            <h3>{{ $ui(featuredVideo.title) }}</h3>
            <p>{{ $ui(featuredVideo.description || '透過影片快速了解產品功能與實際應用。') }}</p>
          </div>
        </div>
      </section>

      <!-- 所有影片 -->
      <section id="allVideos" class="all-videos-section">
        <div class="section-heading all-videos-heading">
          <div>
            <p class="section-kicker">Videos</p>
            <h2>{{ $ui('所有影片') }}</h2>
          </div>

          <div class="video-tools">
            <label class="video-search">
              <input v-model="searchKeyword" type="search" :placeholder="$ui('搜尋影片標題或關鍵字')" />
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </label>
          </div>
        </div>

        <div v-if="paginatedVideos.length" class="video-grid">
          <article v-for="video in paginatedVideos" :key="video.id" class="video-card">
            <button type="button" class="video-thumb" @click="openVideo(video)">
              <img :src="youtubeThumb(video.youtubeId)" :alt="$ui(video.title)" loading="lazy" decoding="async" @error="handleYoutubeThumbError($event, video.youtubeId)" />
              <span class="video-thumb-shade"></span>
              <span class="play-button" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M9 7.5 17 12l-8 4.5z" /></svg>
              </span>
            </button>
            <div class="video-card-copy">
              <span class="video-type">{{ $ui('產品影片') }}</span>
              <h3>{{ $ui(video.title) }}</h3>
              <p v-if="video.description">{{ truncate($ui(video.description), 72) }}</p>
            </div>
          </article>
        </div>

        <div v-else class="video-empty">{{ $ui('目前沒有符合條件的影片。') }}</div>

        <nav v-if="totalPages > 1" class="video-pagination" :aria-label="$ui('影片分頁')">
          <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹</button>
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">›</button>
        </nav>
      </section>
    </main>
    <!-- 影片播放 Modal：Teleport 到 body，避免頁面動畫 transform 影響 fixed 定位。 -->
    <Teleport to="body">
      <div v-if="selectedVideo" class="video-modal">
      <div class="video-modal-panel">
        <button type="button" class="video-modal-close" @click="closeVideo" :aria-label="$ui('關閉影片')">×</button>
        <div class="video-player">
          <iframe
            :src="youtubeEmbed(selectedVideo.youtubeId)"
            :title="$ui(selectedVideo.title)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="video-modal-copy">
          <span>{{ $ui('產品影片') }}</span>
          <h2>{{ $ui(selectedVideo.title) }}</h2>
          <p v-if="selectedVideo.description">{{ $ui(selectedVideo.description) }}</p>
        </div>
      </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface VideoItem {
  id: number
  title: string
  youtubeId: string
  description?: string
}

/* 功能：沿用舊 VideoPage 的真實影片資料，不加入設計稿範例資料。 */
const videos: [VideoItem, ...VideoItem[]] = [
  {
    id: 1,
    title: 'DRF 40 數位X光+透視一體式系統',
    youtubeId: 'jJ9_higsSHE',
    description:
      '結合「數位X光攝影（DR）」與「即時透視影像（Fluoroscopy）」功能於一機的高階影像系統。其設計著重於臨床多功能應用、空間利用效率與操作便利性。',
  },
  { id: 2, title: '動物CT齒科成像', youtubeId: 'PZAB0MDBRYQ' },
  { id: 3, title: '動物CT腹腔成像', youtubeId: '6Ik3VaXF_Og' },
  { id: 4, title: '動物CT腹部成像-30KG犬', youtubeId: 'Um-FVMPMK0E' },
  { id: 5, title: '動物CT血管造影', youtubeId: 'eJ_KmFhXxSg' },
  { id: 6, title: '動物CT胸腔成像', youtubeId: 'QA3FhWigxtU' },
  { id: 7, title: '動物CT 3D渲染-貓', youtubeId: 'YzVCmdwWYKI' },
  { id: 8, title: '動物CT 3D渲染-烏龜', youtubeId: 'W1_L0y6UrGI' },
]

const featuredVideo = videos[0]
const searchKeyword = ref('')
const sortBy = ref<'default' | 'titleAsc' | 'titleDesc'>('default')
const currentPage = ref(1)
const pageSize = 8
const selectedVideo = ref<VideoItem | null>(null)
let lockedScrollY = 0

/* 功能：依搜尋與排序取得影片列表。 */
const filteredVideos = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  let result = videos.filter((video) => {
    if (!keyword) return true
    return `${video.title} ${video.description ?? ''}`.toLowerCase().includes(keyword)
  })

  result = [...result]
  if (sortBy.value === 'titleAsc') {
    result.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'))
  } else if (sortBy.value === 'titleDesc') {
    result.sort((a, b) => b.title.localeCompare(a.title, 'zh-Hant'))
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredVideos.value.length / pageSize)))
const paginatedVideos = computed(() =>
  filteredVideos.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize),
)
const visiblePages = computed(() => Array.from({ length: totalPages.value }, (_, index) => index + 1))

watch([searchKeyword, sortBy], () => {
  currentPage.value = 1
})

function youtubeThumb(videoId: string, quality = 'hqdefault') {
  return `https://i.ytimg.com/vi_webp/${videoId}/${quality}.webp`
}

function handleYoutubeThumbError(event: Event, videoId: string) {
  const image = event.currentTarget as HTMLImageElement
  const fallbackUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  if (image.src !== fallbackUrl) image.src = fallbackUrl
}

function youtubeEmbed(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text
}

function openVideo(video: VideoItem) {
  selectedVideo.value = video
  if (!import.meta.client) return

  lockedScrollY = window.scrollY

  // 功能：移除全站 scrollbar-gutter 預留區，避免捲軸隱藏後右側留下白色空白。
  document.documentElement.style.scrollbarGutter = 'auto'
  document.documentElement.style.overflow = 'hidden'

  // 功能：固定背景頁面，影片 Modal 開啟期間禁止上下滑動。
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

function closeVideo() {
  selectedVideo.value = null
  if (!import.meta.client) return

  // 功能：恢復 app.vue 的 scrollbar-gutter 與原本頁面捲動位置。
  document.documentElement.style.scrollbarGutter = ''
  document.documentElement.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  window.scrollTo(0, lockedScrollY)
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  nextTick(() => {
    document.getElementById('allVideos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function scrollToAllVideos() {
  document.getElementById('allVideos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onBeforeUnmount(() => {
  if (!import.meta.client) return

  // 功能：離開影片頁時保證解除 Modal 捲動鎖定，避免影響下一個頁面。
  document.documentElement.style.scrollbarGutter = ''
  document.documentElement.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
})

useSeoMeta({
  title: '影片專區｜祐強醫療儀器有限公司',
  description: '瀏覽祐強醫療儀器有限公司產品影片與醫療設備應用內容。',
})
</script>

<style scoped>
.video-page {
  --video-ink: #173047;
  --video-muted: #687b87;
  --video-purple: #8b347f;
  --video-purple-dark: #742a6b;
  --video-line: #e4eaeb;
  min-height: 100vh;
  color: var(--video-ink);
  background: #fff;
}

.video-hero {
  display: grid;
  grid-template-columns: minmax(0, 44%) minmax(0, 56%);
  min-height: 430px;
  overflow: hidden;
  background:
    radial-gradient(circle at 2% 14%, rgba(115, 169, 115, 0.08), transparent 22%),
    radial-gradient(circle at 0 74%, rgba(139, 52, 127, 0.08), transparent 18%),
    #fafcfc;
}

.video-hero-copy {
  display: flex;
  padding: clamp(52px, 6vw, 92px) clamp(38px, 6vw, 104px);
  flex-direction: column;
  justify-content: center;
}

.video-breadcrumb {
  margin-bottom: 30px;
  color: #765073;
  font-size: 13px;
  font-weight: 700;
}

.video-breadcrumb span {
  margin: 0 8px;
  color: #9aa8ae;
}

.video-eyebrow {
  display: none;
}

.video-hero h1 {
  margin: 0;
  color: #132c43;
  font-size: clamp(44px, 4vw, 66px);
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.08;
}

.video-hero h2 {
  margin: 24px 0 20px;
  color: var(--video-purple);
  font-size: clamp(21px, 2vw, 30px);
  font-weight: 800;
  line-height: 1.4;
}

.video-hero-desc {
  max-width: 560px;
  margin: 0;
  color: #566c79;
  font-size: 15px;
  line-height: 1.9;
}

.video-hero-media {
  position: relative;
  display: block;
  width: 100%;
  min-height: 430px;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: #dfe6e7;
  border: 0;
}

.video-hero-media img {
  width: 100%;
  height: 100%;
  min-height: 430px;
  object-fit: cover;
  object-position: center;
  transition: transform 0.5s ease;
}

.video-hero-media:hover img {
  transform: scale(1.025);
}

.video-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(250, 252, 252, 0.36), rgba(15, 32, 42, 0.08));
}

.hero-play-button,
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 64px;
  height: 64px;
  color: #fff;
  background: rgba(23, 48, 71, 0.58);
  border: 2px solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(4px);
  place-items: center;
}

.hero-play-button {
  width: 76px;
  height: 76px;
}

.hero-play-button svg,
.play-button svg {
  width: 32px;
  height: 32px;
  fill: currentColor;
}

.video-content {
  width: min(calc(100% - 48px), 1420px);
  margin: 0 auto;
  padding: 58px 0 76px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.section-heading h2 {
  position: relative;
  margin: 0;
  padding-bottom: 14px;
  color: #173047;
  font-size: 30px;
  font-weight: 800;
}

.section-heading h2::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 38px;
  height: 3px;
  content: '';
  background: var(--video-purple);
  border-radius: 999px;
}

.section-kicker {
  display: none;
}

.all-video-link,
.card-watch-link {
  padding: 0;
  cursor: pointer;
  color: var(--video-purple);
  background: transparent;
  border: 0;
  font-weight: 800;
}

.all-video-link {
  font-size: 14px;
}

.all-video-link span,
.card-watch-link span,
.watch-video-btn span {
  margin-left: 8px;
}

.featured-card {
  display: grid;
  grid-template-columns: minmax(0, 58%) minmax(0, 42%);
  margin-top: 30px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--video-line);
  border-radius: 18px;
  box-shadow: 0 14px 34px rgba(30, 59, 68, 0.045);
}

.featured-media,
.video-thumb {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: #e7ecec;
  border: 0;
}

.featured-media {
  min-height: 390px;
}

.featured-media img,
.video-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.featured-media:hover img,
.video-thumb:hover img {
  transform: scale(1.035);
}

.media-shade,
.video-thumb-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 28, 38, 0.02), rgba(12, 28, 38, 0.18));
}

.play-button.large {
  width: 76px;
  height: 76px;
}

.featured-copy {
  display: flex;
  padding: clamp(32px, 4vw, 58px);
  flex-direction: column;
  justify-content: center;
}

.video-type {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 14px;
  padding: 6px 11px;
  color: var(--video-purple);
  background: #f8eff7;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.featured-copy h3 {
  margin: 0 0 18px;
  color: #173047;
  font-size: clamp(25px, 2.6vw, 38px);
  line-height: 1.35;
}

.featured-copy p {
  margin: 0;
  color: #667a85;
  font-size: 14px;
  line-height: 1.9;
}

.watch-video-btn {
  width: fit-content;
  min-width: 154px;
  min-height: 48px;
  margin-top: 28px;
  padding: 0 22px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #95388a, #76276c);
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

.all-videos-section {
  scroll-margin-top: 110px;
  margin-top: 68px;
}

.all-videos-heading {
  align-items: center;
}

.video-tools {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 160px;
  gap: 14px;
}

.video-search {
  position: relative;
  display: block;
}

.video-search input,
.video-sort {
  width: 100%;
  height: 46px;
  color: #435966;
  background: #fff;
  border: 1px solid #dce5e6;
  border-radius: 8px;
  outline: none;
}

.video-search input {
  padding: 0 44px 0 14px;
  font-size: 13px;
}

.video-search svg {
  position: absolute;
  top: 50%;
  right: 14px;
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #31546a;
  stroke-width: 1.7;
  transform: translateY(-50%);
}

.video-sort {
  padding: 0 12px;
  font-size: 13px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;
  margin-top: 28px;
}

.video-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8e9;
  border-radius: 12px;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.video-card:hover {
  box-shadow: 0 14px 28px rgba(33, 63, 72, 0.075);
  transform: translateY(-3px);
}

.video-thumb {
  aspect-ratio: 16 / 9;
}

.video-card-copy {
  padding: 17px 17px 18px;
}

.video-card-copy .video-type {
  margin-bottom: 8px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  font-size: 11px;
}

.video-card h3 {
  min-height: 48px;
  margin: 0;
  color: #173047;
  font-size: 16px;
  line-height: 1.5;
}

.video-card-copy p {
  display: -webkit-box;
  min-height: 42px;
  margin: 10px 0 0;
  overflow: hidden;
  color: #708089;
  font-size: 12px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-watch-link {
  margin-top: 14px;
  font-size: 12px;
}

.video-empty {
  display: grid;
  min-height: 260px;
  margin-top: 28px;
  color: #798a92;
  background: #fafcfc;
  border: 1px solid #e4eaeb;
  border-radius: 12px;
  place-items: center;
}

.video-pagination {
  display: flex;
  margin-top: 34px;
  justify-content: center;
  gap: 8px;
}

.video-pagination button {
  width: 38px;
  height: 38px;
  cursor: pointer;
  color: #586c76;
  background: #fff;
  border: 1px solid #dfe6e7;
  border-radius: 7px;
}

.video-pagination button.active {
  color: #fff;
  background: var(--video-purple);
  border-color: var(--video-purple);
}

.video-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.video-modal {
  position: fixed;
  /* 功能：高於全站 Header，讓影片遮罩從瀏覽器最上層完整覆蓋。 */
  z-index: 12000;
  inset: 0 auto 0 0;
  /* 功能：完整覆蓋 viewport，包含原本 scrollbar 所在區域。 */
  width: 100vw;
  min-height: 100dvh;
  display: grid;
  padding: 28px;
  background: rgba(14, 28, 36, 0.7);
  backdrop-filter: blur(10px);
  place-items: center;
}

.video-modal-panel {
  position: relative;
  width: min(100%, 1080px);
  max-height: 92dvh;
  overflow-y: auto;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 32px 80px rgba(7, 20, 27, 0.32);
}

.video-modal-close {
  position: absolute;
  z-index: 2;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  cursor: pointer;
  color: #29434f;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #dbe4e5;
  border-radius: 50%;
  font-size: 27px;
}

.video-player {
  aspect-ratio: 16 / 9;
  background: #0b1115;
}

.video-player iframe {
  width: 100%;
  height: 100%;
}

.video-modal-copy {
  padding: 28px 32px 32px;
}

.video-modal-copy > span {
  color: var(--video-purple);
  font-size: 12px;
  font-weight: 800;
}

.video-modal-copy h2 {
  margin: 8px 0 12px;
  color: #173047;
  font-size: 28px;
}

.video-modal-copy p {
  margin: 0;
  color: #667a85;
  font-size: 14px;
  line-height: 1.85;
}

@media (max-width: 1180px) {
  .video-hero {
    grid-template-columns: 48% 52%;
    min-height: 380px;
  }

  .video-hero-media,
  .video-hero-media img {
    min-height: 380px;
  }

  .video-hero-copy {
    padding-inline: clamp(34px, 5vw, 64px);
  }

  .video-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .video-hero {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .video-hero-copy {
    padding: 52px 34px 46px;
  }

  .video-hero-media {
    min-height: 320px;
  }

  .video-hero-media img {
    min-height: 320px;
  }

  .featured-card {
    grid-template-columns: 1fr;
  }

  .featured-media {
    min-height: 340px;
  }

  .all-videos-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .video-tools {
    width: 100%;
    grid-template-columns: minmax(0, 1fr) 160px;
  }

  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .video-hero-copy {
    padding: 38px 20px 34px;
  }

  .video-breadcrumb {
    margin-bottom: 22px;
    font-size: 12px;
  }

  .video-hero h1 {
    font-size: 38px;
  }

  .video-hero h2 {
    margin: 18px 0 14px;
    font-size: 21px;
  }

  .video-hero-desc {
    font-size: 13px;
    line-height: 1.8;
  }

  .video-hero-media,
  .video-hero-media img {
    min-height: 230px;
  }

  .hero-play-button {
    width: 62px;
    height: 62px;
  }

  .video-content {
    width: calc(100% - 28px);
    padding: 40px 0 54px;
  }

  .section-heading h2 {
    font-size: 25px;
  }

  .featured-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .featured-card {
    margin-top: 22px;
    border-radius: 14px;
  }

  .featured-media {
    min-height: 230px;
  }

  .featured-copy {
    padding: 24px 20px 26px;
  }

  .featured-copy h3 {
    font-size: 24px;
  }

  .featured-copy p {
    font-size: 13px;
    line-height: 1.8;
  }

  .all-videos-section {
    margin-top: 48px;
  }

  .video-tools {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .video-card h3 {
    min-height: auto;
    font-size: 17px;
  }

  .video-modal {
    padding: 12px;
  }

  .video-modal-panel {
    border-radius: 16px;
  }

  .video-modal-copy {
    padding: 22px 20px 24px;
  }

  .video-modal-copy h2 {
    font-size: 22px;
  }
}


/* ===== Video Hero Compact Final ===== */
/* 功能：將影片專區 Hero 縮成實際網站適合的高度，同時保留設計稿左文右圖構圖。 */
.video-page .video-hero {
  grid-template-columns: minmax(0, 42%) minmax(0, 58%) !important;
  min-height: 360px !important;
  height: 360px !important;
}
.video-page .video-hero-copy {
  padding: 40px clamp(34px, 4.5vw, 72px) !important;
}
.video-page .video-breadcrumb {
  margin-bottom: 20px !important;
  font-size: 12px !important;
}
.video-page .video-hero h1 {
  font-size: clamp(40px, 3.3vw, 52px) !important;
  line-height: 1.08 !important;
}
.video-page .video-hero h2 {
  margin: 18px 0 14px !important;
  font-size: clamp(19px, 1.55vw, 24px) !important;
  line-height: 1.4 !important;
}
.video-page .video-hero-desc {
  max-width: 500px !important;
  font-size: 13px !important;
  line-height: 1.8 !important;
}
.video-page .video-hero-media,
.video-page .video-hero-media img {
  min-height: 360px !important;
  height: 360px !important;
}
.video-page .hero-play-button {
  width: 60px !important;
  height: 60px !important;
}
.video-page .hero-play-button svg {
  width: 26px !important;
  height: 26px !important;
}
@media (max-width: 1180px) {
  .video-page .video-hero {
    grid-template-columns: 44% 56% !important;
    min-height: 330px !important;
    height: 330px !important;
  }
  .video-page .video-hero-media,
  .video-page .video-hero-media img {
    min-height: 330px !important;
    height: 330px !important;
  }
  .video-page .video-hero-copy {
    padding: 34px clamp(28px, 4vw, 52px) !important;
  }
  .video-page .video-hero h1 { font-size: clamp(36px, 4vw, 46px) !important; }
  .video-page .video-hero h2 { font-size: clamp(18px, 2vw, 22px) !important; }
}
@media (max-width: 900px) {
  .video-page .video-hero {
    grid-template-columns: 1fr !important;
    height: auto !important;
  }
  .video-page .video-hero-copy { padding: 38px 28px 32px !important; }
  .video-page .video-hero-media,
  .video-page .video-hero-media img {
    min-height: 260px !important;
    height: 260px !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero-copy { padding: 30px 20px 28px !important; }
  .video-page .video-breadcrumb { margin-bottom: 16px !important; }
  .video-page .video-hero h1 { font-size: 34px !important; }
  .video-page .video-hero h2 { margin: 14px 0 12px !important; font-size: 19px !important; }
  .video-page .video-hero-desc { font-size: 12.5px !important; }
  .video-page .video-hero-media,
  .video-page .video-hero-media img {
    min-height: 210px !important;
    height: 210px !important;
  }
  .video-page .hero-play-button { width: 52px !important; height: 52px !important; }
}


/* ===== Video Hero Static Image ===== */
/* 功能：Hero 改用靜態 video.webp，不顯示影片播放遮罩與播放按鈕。 */
.video-page .video-hero-image {
  cursor: default !important;
}
.video-page .video-hero-image img {
  object-fit: cover !important;
  object-position: center !important;
  transform: none !important;
}
.video-page .video-hero-image:hover img {
  transform: none !important;
}


/* ===== Video Hero Design Match Final ===== */
/* 功能：讓 Hero 更接近設計稿，縮短文字與圖片距離並維持適當網站高度。 */
.video-page .video-hero {
  grid-template-columns: minmax(0, 43%) minmax(0, 57%) !important;
  min-height: 350px !important;
  height: 350px !important;
  background:
    radial-gradient(circle at 2% 16%, rgba(122, 171, 126, .08), transparent 22%),
    radial-gradient(circle at 0 78%, rgba(139, 52, 127, .08), transparent 18%),
    linear-gradient(90deg, #f8faf9 0%, #fff 100%) !important;
}
.video-page .video-hero-copy {
  padding: 38px 26px 38px clamp(48px, 5vw, 76px) !important;
  justify-content: center !important;
}
.video-page .video-breadcrumb {
  margin-bottom: 18px !important;
  font-size: 12px !important;
}
.video-page .video-hero h1 {
  margin: 0 !important;
  font-size: clamp(40px, 3vw, 50px) !important;
  line-height: 1.08 !important;
}
.video-page .video-hero h2 {
  margin: 16px 0 12px !important;
  font-size: clamp(19px, 1.45vw, 23px) !important;
  line-height: 1.4 !important;
}
.video-page .video-hero-desc {
  max-width: 470px !important;
  font-size: 13px !important;
  line-height: 1.8 !important;
}
.video-page .video-hero-image,
.video-page .video-hero-image img {
  min-height: 350px !important;
  height: 350px !important;
}
.video-page .video-hero-image img {
  object-fit: cover !important;
  object-position: center !important;
}
@media (max-width: 1180px) {
  .video-page .video-hero {
    grid-template-columns: 45% 55% !important;
    min-height: 320px !important;
    height: 320px !important;
  }
  .video-page .video-hero-copy {
    padding: 32px 22px 32px 42px !important;
  }
  .video-page .video-hero-image,
  .video-page .video-hero-image img {
    min-height: 320px !important;
    height: 320px !important;
  }
}
@media (max-width: 900px) {
  .video-page .video-hero {
    grid-template-columns: 1fr !important;
    height: auto !important;
  }
  .video-page .video-hero-copy {
    padding: 34px 28px 30px !important;
  }
  .video-page .video-hero-image,
  .video-page .video-hero-image img {
    min-height: 250px !important;
    height: 250px !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero-copy {
    padding: 28px 20px 26px !important;
  }
  .video-page .video-hero h1 { font-size: 34px !important; }
  .video-page .video-hero h2 { font-size: 18px !important; }
  .video-page .video-hero-desc { font-size: 12.5px !important; }
  .video-page .video-hero-image,
  .video-page .video-hero-image img {
    min-height: 205px !important;
    height: 205px !important;
  }
}


/* ===== Video Hero Soft Gradient Blend ===== */
/* 功能：讓 Hero 文字區與圖片區之間以白色漸層柔和銜接，貼近設計稿。 */
.video-page .video-hero {
  position: relative !important;
  isolation: isolate !important;
}
.video-page .video-hero-copy {
  position: relative !important;
  z-index: 2 !important;
  background:
    radial-gradient(circle at 6% 18%, rgba(117, 172, 123, .08), transparent 26%),
    radial-gradient(circle at 2% 82%, rgba(139, 52, 127, .08), transparent 22%),
    linear-gradient(90deg, #fafcfb 0%, #ffffff 68%, rgba(255,255,255,.96) 100%) !important;
}
.video-page .video-hero-copy::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  right: -150px !important;
  bottom: 0 !important;
  width: 190px !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,.94) 28%, rgba(255,255,255,.58) 66%, rgba(255,255,255,0) 100%) !important;
  z-index: -1 !important;
}
.video-page .video-hero-image {
  position: relative !important;
  z-index: 1 !important;
}
.video-page .video-hero-image::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 auto 0 0 !important;
  width: 130px !important;
  pointer-events: none !important;
  background: linear-gradient(90deg, rgba(255,255,255,.62) 0%, rgba(255,255,255,.28) 45%, rgba(255,255,255,0) 100%) !important;
  z-index: 2 !important;
}
@media (max-width: 900px) {
  .video-page .video-hero-copy::after,
  .video-page .video-hero-image::before {
    display: none !important;
  }
}


/* ===== Video Hero Copy Shift Right ===== */
/* 功能：將 Hero 左側文字整體往右靠，讓版面更貼近設計稿。 */
.video-page .video-hero-copy {
  padding-left: clamp(72px, 7vw, 112px) !important;
  padding-right: 24px !important;
}
@media (max-width: 1180px) {
  .video-page .video-hero-copy {
    padding-left: clamp(52px, 6vw, 76px) !important;
    padding-right: 20px !important;
  }
}
@media (max-width: 900px) {
  .video-page .video-hero-copy {
    padding-left: 28px !important;
    padding-right: 28px !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero-copy {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}


/* ===== Video Hero Copy Shift Further Right ===== */
/* 功能：將桌機版 Hero 文字再往右推，讓文字區更靠近圖片。 */
.video-page .video-hero-copy {
  padding-left: clamp(118px, 10vw, 170px) !important;
  padding-right: 18px !important;
}
@media (max-width: 1180px) {
  .video-page .video-hero-copy {
    padding-left: clamp(78px, 8vw, 108px) !important;
    padding-right: 18px !important;
  }
}
@media (max-width: 900px) {
  .video-page .video-hero-copy {
    padding-left: 28px !important;
    padding-right: 28px !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero-copy {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}


/* ===== Video Hero Copy Shift Even Further Right ===== */
/* 功能：桌機版 Hero 文字再往右推一段，讓文字更靠近圖片。 */
.video-page .video-hero-copy {
  padding-left: clamp(150px, 12vw, 300px) !important;
  padding-right: 14px !important;
}
@media (max-width: 1180px) {
  .video-page .video-hero-copy {
    padding-left: clamp(92px, 9vw, 124px) !important;
    padding-right: 16px !important;
  }
}
@media (max-width: 900px) {
  .video-page .video-hero-copy {
    padding-left: 28px !important;
    padding-right: 28px !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero-copy {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }
}


/* ===== Video Hero Medium Small Polish ===== */
/* 功能：優化 900px 以下的影片 Hero，讓文字與圖片更像完整卡片而不是上下硬切。 */
@media (max-width: 900px) {
  .video-page .video-hero {
    width: min(calc(100% - 28px), 820px) !important;
    margin: 18px auto 0 !important;
    overflow: hidden !important;
    background: #fff !important;
    border: 1px solid #edf1f2 !important;
    border-radius: 24px !important;
    box-shadow: 0 18px 42px rgba(29, 52, 61, .08) !important;
  }
  .video-page .video-hero-copy {
    padding: 34px 34px 28px !important;
    background:
      radial-gradient(circle at 8% 14%, rgba(117, 172, 123, .10), transparent 28%),
      radial-gradient(circle at 12% 100%, rgba(139, 52, 127, .08), transparent 28%),
      linear-gradient(180deg, #fbfcfc 0%, #fff 100%) !important;
  }
  .video-page .video-breadcrumb {
    margin-bottom: 14px !important;
  }
  .video-page .video-hero h1 {
    font-size: clamp(36px, 7vw, 46px) !important;
  }
  .video-page .video-hero h2 {
    margin: 14px 0 10px !important;
    font-size: clamp(18px, 3vw, 21px) !important;
  }
  .video-page .video-hero-desc {
    max-width: 620px !important;
    font-size: 13px !important;
    line-height: 1.75 !important;
  }
  .video-page .video-hero-image {
    min-height: 0 !important;
    height: auto !important;
    aspect-ratio: 16 / 7.2 !important;
    background: #111 !important;
  }
  .video-page .video-hero-image img {
    min-height: 0 !important;
    height: 100% !important;
    object-fit: cover !important;
    object-position: center 48% !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero {
    width: calc(100% - 20px) !important;
    margin-top: 10px !important;
    border-radius: 20px !important;
  }
  .video-page .video-hero-copy {
    padding: 26px 20px 22px !important;
  }
  .video-page .video-breadcrumb {
    margin-bottom: 12px !important;
    font-size: 11px !important;
  }
  .video-page .video-hero h1 {
    font-size: clamp(32px, 10vw, 38px) !important;
    letter-spacing: .01em !important;
  }
  .video-page .video-hero h2 {
    margin: 12px 0 9px !important;
    font-size: 18px !important;
  }
  .video-page .video-hero-desc {
    font-size: 12.5px !important;
    line-height: 1.7 !important;
  }
  .video-page .video-hero-image {
    aspect-ratio: 4 / 2.35 !important;
  }
  .video-page .video-hero-image img {
    object-position: center 52% !important;
  }
}


/* ===== Video Hero Medium Small Text Only ===== */
/* 功能：900px 以下隱藏 Hero 圖片，改成純文字品牌卡片。 */
@media (max-width: 900px) {
  .video-page .video-hero {
    width: min(calc(100% - 28px), 820px) !important;
    margin: 18px auto 0 !important;
    display: block !important;
    overflow: hidden !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .video-page .video-hero-image {
    display: none !important;
  }
  .video-page .video-hero-copy {
    position: relative !important;
    min-height: 0 !important;
    padding: 42px 42px 38px !important;
    overflow: hidden !important;
    background:
      radial-gradient(circle at 8% 12%, rgba(117, 172, 123, .14), transparent 28%),
      radial-gradient(circle at 92% 88%, rgba(139, 52, 127, .10), transparent 30%),
      linear-gradient(135deg, #fbfcfb 0%, #ffffff 70%) !important;
    border: 1px solid #e8eeee !important;
    border-radius: 24px !important;
    box-shadow: 0 14px 34px rgba(29, 52, 61, .07) !important;
  }
  .video-page .video-hero-copy::before {
    content: '' !important;
    position: absolute !important;
    left: 42px !important;
    bottom: 26px !important;
    width: 44px !important;
    height: 3px !important;
    background: #8b347f !important;
    border-radius: 999px !important;
  }
  .video-page .video-hero-copy::after { display: none !important; }
  .video-page .video-breadcrumb {
    margin: 0 0 16px !important;
    color: #795574 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
  }
  .video-page .video-hero h1 {
    margin: 0 !important;
    font-size: clamp(38px, 6.5vw, 48px) !important;
    line-height: 1.08 !important;
    letter-spacing: .02em !important;
  }
  .video-page .video-hero h2 {
    margin: 16px 0 12px !important;
    font-size: clamp(19px, 2.6vw, 22px) !important;
    line-height: 1.45 !important;
  }
  .video-page .video-hero-desc {
    max-width: 650px !important;
    margin: 0 0 20px !important;
    font-size: 13px !important;
    line-height: 1.8 !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero {
    width: calc(100% - 20px) !important;
    margin-top: 10px !important;
  }
  .video-page .video-hero-copy {
    padding: 30px 24px 34px !important;
    border-radius: 20px !important;
  }
  .video-page .video-hero-copy::before {
    left: 24px !important;
    bottom: 22px !important;
    width: 38px !important;
  }
  .video-page .video-breadcrumb {
    margin-bottom: 12px !important;
    font-size: 11px !important;
  }
  .video-page .video-hero h1 {
    font-size: clamp(34px, 11vw, 42px) !important;
  }
  .video-page .video-hero h2 {
    margin: 12px 0 10px !important;
    font-size: 18px !important;
  }
  .video-page .video-hero-desc {
    margin-bottom: 18px !important;
    font-size: 12.5px !important;
    line-height: 1.75 !important;
  }
}


/* ===== Video Hero Medium Small Plain Tight ===== */
/* 功能：900px 以下移除 Hero 背景/卡片效果，並縮短與精選影片的距離。 */
@media (max-width: 900px) {
  .video-page .video-hero {
    width: min(calc(100% - 28px), 820px) !important;
    margin: 10px auto 0 !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .video-page .video-hero-copy {
    padding: 24px 10px 18px !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .video-page .video-hero-copy::before {
    left: 10px !important;
    bottom: 0 !important;
  }
  .video-page .video-content {
    padding-top: 20px !important;
  }
  .video-page .featured-section {
    margin-top: 0 !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero {
    width: calc(100% - 20px) !important;
    margin-top: 6px !important;
  }
  .video-page .video-hero-copy {
    padding: 20px 6px 16px !important;
  }
  .video-page .video-hero-copy::before {
    left: 6px !important;
    bottom: 0 !important;
  }
  .video-page .video-content {
    padding-top: 14px !important;
  }
}


/* ===== Video Hero Medium Small Tight No Line ===== */
/* 功能：900px 以下移除 Hero 紫色短線，並縮短 Hero 與精選影片之間的距離。 */
@media (max-width: 900px) {
  .video-page .video-hero-copy::before {
    display: none !important;
  }
  .video-page .video-hero-copy {
    padding-bottom: 8px !important;
  }
  .video-page .video-content {
    padding-top: 4px !important;
  }
  .video-page .featured-section {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-hero-copy {
    padding-bottom: 6px !important;
  }
  .video-page .video-content {
    padding-top: 2px !important;
  }
}


/* ===== Video Featured Pull Up ===== */
/* 功能：中小尺寸將精選影片區塊往上拉，縮短與 Hero 文字區的距離。 */
@media (max-width: 900px) {
  .video-page .video-content {
    padding-top: 0 !important;
  }
  .video-page .featured-section {
    margin-top: -52px !important;
    padding-top: 0 !important;
  }
}
@media (max-width: 640px) {
  .video-page .featured-section {
    margin-top: -6rem !important;
  }
}


/* ===== Video Search Align Right ===== */
/* 功能：所有影片搜尋框固定靠工具列最右側，移除原本多餘的空 Grid 欄位。 */
.video-page .all-videos-heading {
  width: 100% !important;
}
.video-page .video-tools {
  width: min(360px, 100%) !important;
  margin-left: auto !important;
  display: grid !important;
  grid-template-columns: minmax(0, 360px) !important;
  justify-content: end !important;
}
.video-page .video-search {
  width: 100% !important;
}
@media (max-width: 900px) {
  .video-page .all-videos-heading {
    align-items: stretch !important;
  }
  .video-page .video-tools {
    width: min(360px, 100%) !important;
    margin-left: auto !important;
    align-self: flex-end !important;
  }
}
@media (max-width: 640px) {
  .video-page .video-tools {
    width: 100% !important;
  }
}

/* ============================================================
   影片頁內容物淡入
   功能：背景直接顯示，只讓文字、圖片、搜尋框與影片卡片進場。
============================================================ */
.video-hero-copy > *,
.video-hero-image img,
.section-heading > *,
.featured-card,
.video-tools,
.video-card { animation: video-content-fade-in .68s cubic-bezier(.22,1,.36,1) backwards; }
.video-hero-image img { animation-name: video-media-fade-in; animation-duration: .8s; }
.featured-card { animation-delay: .06s; }
.video-card:nth-child(2) { animation-delay: .05s; }
.video-card:nth-child(3) { animation-delay: .10s; }
.video-card:nth-child(4) { animation-delay: .15s; }
@keyframes video-content-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes video-media-fade-in { from { opacity: 0; } to { opacity: 1; } }

/* 影片播放視窗：固定在真正 viewport，並限制尺寸避免超出畫面。 */
.video-modal {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  min-height: 0 !important;
  padding: clamp(12px, 3vh, 28px) clamp(12px, 3vw, 28px) !important;
  overflow-y: auto !important;
  align-items: center !important;
  justify-items: center !important;
}
.video-modal-panel {
  width: min(100%, 960px) !important;
  max-height: calc(100dvh - clamp(24px, 6vh, 56px)) !important;
  margin: auto !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
}
.video-player { width: 100% !important; aspect-ratio: 16 / 9 !important; min-height: 0 !important; }
.video-player iframe { display: block !important; width: 100% !important; height: 100% !important; border: 0 !important; }
@media (max-width: 640px) {
  .video-modal { padding: 10px !important; }
  .video-modal-panel { max-height: calc(100dvh - 20px) !important; }
  .video-modal-copy { padding: 18px 16px 20px !important; }
}
@media (prefers-reduced-motion: reduce) {
  .video-hero-copy > *, .video-hero-image img, .section-heading > *, .featured-card, .video-tools, .video-card { animation: none !important; }
}

</style>