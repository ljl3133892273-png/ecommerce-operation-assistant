import { LinkIcon, Plus } from "lucide-react";

import type { Platform, PlatformProductMapping, ProductSku, Store } from "@/types";

const platformLabels: Record<Platform, string> = {
  douyin: "抖音",
  taobao: "淘宝",
  tmall: "天猫",
  pinduoduo: "拼多多",
  jd: "京东",
  tiktok_shop: "TikTok",
  amazon: "Amazon",
  other: "其他",
};

const platforms: Array<{ label: string; value: Platform }> = [
  { label: "抖音", value: "douyin" },
  { label: "淘宝", value: "taobao" },
  { label: "天猫", value: "tmall" },
  { label: "拼多多", value: "pinduoduo" },
  { label: "京东", value: "jd" },
  { label: "TikTok", value: "tiktok_shop" },
  { label: "Amazon", value: "amazon" },
  { label: "其他", value: "other" },
];

/** 渲染 PlatformMappingPanel 组件，集中展示平台mapping面板所需的数据、状态和操作入口。 */
export function PlatformMappingPanel({
  productId,
  productPlatform,
  productStoreId,
  stores,
  skus,
  mappings,
  mappingStatus,
  canEdit = true,
}: {
  productId: number;
  productPlatform: Platform;
  productStoreId: number | null;
  stores: Store[];
  skus: ProductSku[];
  mappings: PlatformProductMapping[];
  mappingStatus?: string;
  canEdit?: boolean;
}) {
  return (
    <div className="rounded-card border border-line bg-surface shadow-card p-6">
      {/* 平台映射把内部商品/SKU 和平台商品 ID 分开维护，为多平台库存和经营数据对账预留入口。 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">平台映射</h2>
          <p className="mt-1 text-sm text-ink-muted">维护平台商品 ID、平台 SKU ID 和商品链接</p>
        </div>
        <span className="rounded-card bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted">
          {mappings.length} 条映射
        </span>
      </div>

      {mappingStatus === "created" ? (
        <p className="mt-3 text-xs font-medium text-success">平台映射已创建。</p>
      ) : null}
      {mappingStatus === "failed" ? (
        <p className="mt-3 text-xs font-medium text-danger">平台映射创建失败，请检查店铺、SKU 和链接格式。</p>
      ) : null}

      {canEdit ? (
        <form action={`/products/${productId}/platform-mappings/create`} method="post" className="mt-5 grid gap-3">
        {/* 这里仅保存平台侧标识和链接，不接收平台账号密码或授权 token。 */}
        <div className="grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">平台</span>
            <select
              name="platform"
              defaultValue={productPlatform}
              className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">店铺</span>
            <select
              name="store_id"
              defaultValue={productStoreId ?? ""}
              className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            >
              <option value="">不绑定店铺</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">SKU</span>
            <select
              name="sku_id"
              className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            >
              <option value="">商品级映射</option>
              {skus.map((sku) => (
                <option key={sku.id} value={sku.id}>
                  {sku.sku_code} · {sku.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">平台商品 ID</span>
            <input
              name="external_product_id"
              required
              className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              placeholder="item_id"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">平台 SKU ID</span>
            <input
              name="external_sku_id"
              className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              placeholder="sku_id"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-muted">平台状态</span>
            <input
              name="status"
              className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
              placeholder="online / offline"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-ink-muted">商品链接</span>
          <input
            name="listing_url"
            type="url"
            className="mt-1 h-9 w-full rounded-card border border-line bg-surface shadow-card px-2 text-xs text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
            placeholder="https://..."
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-card bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          添加映射
        </button>
        </form>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-card border border-line">
        <div className="hidden grid-cols-[0.7fr_1fr_1fr_0.8fr_0.8fr] bg-surface-muted px-4 py-3 text-xs font-semibold text-ink-muted lg:grid">
          <span>平台</span>
          <span>平台商品 ID</span>
          <span>平台 SKU ID</span>
          <span>状态</span>
          <span>链接</span>
        </div>
        {mappings.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-ink-muted">还没有平台映射。</div>
        ) : (
          <div className="divide-y divide-line">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                className="grid gap-2 px-4 py-3 text-sm lg:grid-cols-[0.7fr_1fr_1fr_0.8fr_0.8fr] lg:items-center"
              >
                <span className="text-ink-muted">{platformLabels[mapping.platform]}</span>
                <span className="font-medium text-ink">{mapping.external_product_id}</span>
                <span className="text-ink-muted">{mapping.external_sku_id ?? "-"}</span>
                <span className="text-ink-muted">{mapping.status ?? "-"}</span>
                {mapping.listing_url ? (
                  <a
                    href={mapping.listing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-info hover:text-info"
                  >
                    <LinkIcon className="h-3 w-3" aria-hidden="true" />
                    打开
                  </a>
                ) : (
                  <span className="text-ink-soft">-</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
