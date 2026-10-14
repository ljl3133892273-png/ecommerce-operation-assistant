import type { Platform } from "@/types";

/** 平台枚举的唯一事实源；页面、表单、映射面板统一从这里取，避免多处重复定义后口径漂移。 */
export const PLATFORMS: Array<{ value: Platform; label: string }> = [
  { value: "douyin", label: "抖音" },
  { value: "taobao", label: "淘宝" },
  { value: "tmall", label: "天猫" },
  { value: "pinduoduo", label: "拼多多" },
  { value: "jd", label: "京东" },
  { value: "tiktok_shop", label: "TikTok" },
  { value: "amazon", label: "Amazon" },
  { value: "other", label: "其他" },
];

/** 平台 value → 中文名的查表结果，用于列表、卡片等只读展示。 */
export const platformLabels: Record<Platform, string> = PLATFORMS.reduce(
  (labels, platform) => {
    labels[platform.value] = platform.label;
    return labels;
  },
  {} as Record<Platform, string>,
);

/** 首页平台筛选条使用的选项，all 表示不过滤。 */
export const PLATFORM_FILTERS: Array<{ value: "all" | Platform; label: string }> = [
  { value: "all", label: "全部平台" },
  { value: "douyin", label: "抖音" },
  { value: "taobao", label: "淘宝" },
  { value: "tmall", label: "天猫" },
  { value: "pinduoduo", label: "拼多多" },
  { value: "jd", label: "京东" },
];

/** 店铺启用状态的中文口径。 */
export const STORE_STATUS_LABELS: Record<string, string> = {
  active: "启用",
  paused: "暂停",
  closed: "关闭",
};

/** 安全地把 URL 参数转成受支持的平台值，非法值统一回落为 all。 */
export function parsePlatform(value: string | undefined): "all" | Platform {
  if (!value || value === "all") {
    return "all";
  }
  return value in platformLabels ? (value as Platform) : "all";
}
