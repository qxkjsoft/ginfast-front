
// 是否开启本地mock, 可根据该配置调整url
// const MOCK_FLAG = import.meta.env.VITE_APP_OPEN_MOCK === "true";

export const baseUrlApi = (url: string) => `${import.meta.env.VITE_APP_BASE_URL}/api/${url}`;
// 获取基础API URL
export const getBaseUrl = () => {
  return import.meta.env.VITE_APP_BASE_URL || "";
};
