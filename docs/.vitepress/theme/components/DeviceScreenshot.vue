<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const props = defineProps<{
  src: string
  alt: string
  caption: string
  width: number
  height: number
}>()

const { localeIndex } = useData()
const imageSrc = computed(() => withBase(props.src))
const originalLabel = computed(() => localeIndex.value === 'zh'
  ? `${props.alt}（在新标签页查看原图）`
  : `${props.alt} (open full-size image in a new tab)`)
</script>

<template>
  <figure class="device-screenshot" :class="{ 'is-landscape': width > height }">
    <a :href="imageSrc" target="_blank" rel="noopener noreferrer" :aria-label="originalLabel">
      <img :src="imageSrc" :alt="alt" :width="width" :height="height" loading="lazy" decoding="async" />
    </a>
    <figcaption>{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.device-screenshot {
  width: 100%;
  max-width: 320px;
  margin: 24px auto;
}

.device-screenshot.is-landscape {
  max-width: 640px;
}

.device-screenshot a {
  display: block;
}

.device-screenshot a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
}

.device-screenshot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--vp-c-divider);
}

.device-screenshot figcaption {
  margin-top: 10px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}
</style>
