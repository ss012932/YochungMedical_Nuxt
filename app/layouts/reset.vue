<template>
  <main class="reset-layout"><slot /></main>
</template>

<style scoped>
.reset-layout { min-height: 100vh; background: #f8faf9; }

@media (max-width: 900px) {
  .reset-layout {
    width: 100%;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;
    background: #fff;
  }
}
</style>
