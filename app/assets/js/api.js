import axios from 'axios';
import Swal from 'sweetalert2';

const apiClient = axios.create({
  baseURL: 'https://yochung-api.christylove.com.tw/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((config)=>{
  if (config.url?.includes('/upload')) config.headers['Content-Type']='multipart/form-data';
  return config;
},(error)=>Promise.reject(error));

let isShowing401=false;
let isRedirecting=false;
apiClient.interceptors.response.use((response)=>response,async(error)=>{
  const status=error.response?.status;
  const currentPath=typeof window!=='undefined'?window.location.pathname:'';
  const requestUrl=error.config?.url||'';
  const skipAuth401Pages=['/products','/','/video','/contact'];
  const skipAuth401APIs=['/reset-password','/cart'];
  const shouldSkip401=skipAuth401Pages.includes(currentPath)||skipAuth401APIs.some((api)=>requestUrl.includes(api));
  if(currentPath==='/login'||isRedirecting||shouldSkip401) return Promise.reject(error);
  if(status===401&&!isShowing401&&typeof window!=='undefined'){
    isShowing401=true;isRedirecting=true;
    await Swal.fire({icon:'warning',title:'登入逾時',text:'您的登入憑證已過期，請重新登入。',confirmButtonText:'確定'});
    document.cookie='token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href='/login';
    setTimeout(()=>{isShowing401=false;isRedirecting=false;},500);
  }
  return Promise.reject(error);
});

export default {
  get(endpoint,params={},config={}){return apiClient.get(endpoint,{params,...config});},
  post(endpoint,data,config={}){return apiClient.post(endpoint,data,config);},
  put(endpoint,data,config={}){return apiClient.put(endpoint,data,config);},
  delete(endpoint,data={},config={}){return apiClient.delete(endpoint,{data,...config});},
};
