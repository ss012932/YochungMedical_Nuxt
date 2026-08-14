<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'member-auth' })
const route = useRoute()
await navigateTo({ path: '/member', query: { ...route.query, tab: 'profile' } }, { replace: true })
</script>
