export const baseUrlApi = (url: string) => `${import.meta.env.VITE_APP_BASE_URL}/api/${url}`;
// 获取基础API URL
export const getBaseUrl = () => {
  return import.meta.env.VITE_APP_BASE_URL || "";
};
