import { useApi } from '~/composables/utils/api'
export default defineNuxtRouteMiddleware(async()=>{
  if(import.meta.server) return
  try{const api=useApi();const res:any=await api.get('/auth/me');if(!res.data?.authenticated)return navigateTo('/login')}catch{return navigateTo('/login')}
})
