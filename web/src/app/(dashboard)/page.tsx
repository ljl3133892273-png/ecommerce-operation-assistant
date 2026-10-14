import {
  ArrowRight,
  Boxes,
  Building2,
  ClipboardList,
  Database,
  Download,
  FileText,
  ImageIcon,
  Megaphone,
  Package,
  Store as StoreIcon,
} from "lucide-react";
import Link from "next/link";

import { ProductCreateForm } from "@/components/product-create-form";
import { StoreCreateForm } from "@/components/store-create-form";
import { Badge, Tag } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, IconTile, type TileTone } from "@/components/ui/card";
import { EmptyState, Notice } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { TableBody, TableHead, TableRow, TableShell } from "@/components/ui/table";
import { getCurrentUser, getProducts, getStores } from "@/lib/api";
import { PLATFORM_FILTERS, platformLabels, parsePlatform } from "@/lib/constants";
import { getAuthToken } from "@/lib/session";
import type { Product, Store } from "@/types";

const workflow: Array<{ title: string; icon: typeof Building2; tone: TileTone; href: string }> = [
  { title: "建店建档", icon: Building2, tone: "info", href: "/" },
  { title: "导入数据", icon: ClipboardList, tone: "brand", href: "/imports" },
  { title: "补商品信息", icon: ImageIcon, tone: "success", href: "/?workflow=product" },
  { title: "投放建议", icon: Megaphone, tone: "warning", href: "/?workflow=ads" },
  { title: "周期复盘", icon: FileText, tone: "danger", href: "/?workflow=review" },
];

const PRODUCT_TABLE_COLUMNS = "1.3fr 0.9fr 0.8fr 0.7fr 1fr 96px";

type HomeProps = {
  searchParams?: Promise<{ platform?: string; store?: string; demo?: string }>;
};

/** 渲染首页页面；在服务端加载业务数据，并把交互交给对应表单或客户端组件。 */
export default async function Home({ searchParams }: HomeProps) {
  const query = searchParams ? await searchParams : {};
  const selectedPlatform = parsePlatform(query.platform);
  const selectedStoreId = parseStoreId(query.store);
  // 首页聚合商品、店铺和当前用户权限；写操作入口只在 canEdit 为 true 时展示。
  const [products, stores, token] = await Promise.all([getProducts(), getStores(), getAuthToken()]);
  const currentUser = token ? await getCurrentUser(token) : null;
  const canEdit = Boolean(currentUser?.permissions.can_edit);

  const storeById = new Map(stores.map((store) => [store.id, store]));
  const productsByStore = countProductsByStore(products);
  const activeStores = stores.filter((store) => store.status === "active").length;
  const platformCount = new Set([...stores.map((store) => store.platform), ...products.map((product) => product.platform)]).size;
  const unboundProducts = products.filter((product) => product.store_id === null).length;
  const workflowItems = buildHomeWorkflow(products, stores, unboundProducts);
  const filteredProducts = products.filter((product) => {
    if (selectedPlatform !== "all" && product.platform !== selectedPlatform) {
      return false;
    }
    if (selectedStoreId !== null && product.store_id !== selectedStoreId) {
      return false;
    }
    return true;
  });

  return (
    <PageShell
      header={
        <PageHeader
          eyebrow="Ecommerce Operation Assistant"
          title="多平台店铺运营工作台"
          description="从建店建档到周期复盘的完整单品运营闭环；可用演示数据一键跑通全链路。"
          actions={
            <>
              {canEdit ? (
                <form action="/workspace/demo-data" method="post">
                  <button type="submit" className={buttonClass("primary", "md")}>
                    <Database className="h-4 w-4" aria-hidden="true" />
                    生成演示数据
                  </button>
                </form>
              ) : null}
              <Link href="/workspace/templates/performance-records" className={buttonClass("secondary", "md")}>
                <Download className="h-4 w-4" aria-hidden="true" />
                下载导入模板
              </Link>
              {canEdit ? (
                <Link href="/imports" className={buttonClass("secondary", "md")}>
                  <Package className="h-4 w-4" aria-hidden="true" />
                  导入中心
                </Link>
              ) : null}
            </>
          }
        />
      }
    >

      {query.demo === "created" ? <Notice tone="success">演示数据已准备好。</Notice> : null}
      {query.demo === "failed" ? (
        <Notice tone="danger">演示数据创建失败，请确认当前账号有编辑权限。</Notice>
      ) : null}
      {!canEdit ? (
        <Notice tone="warning">当前账号为只读权限，只能查看数据，不能创建或导入。</Notice>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="店铺" value={stores.length} />
        <MetricCard label="活跃店铺" value={activeStores} />
        <MetricCard label="商品" value={products.length} />
        <MetricCard label="平台" value={platformCount} />
      </section>

      <section className={`grid gap-6 ${canEdit ? "xl:grid-cols-[380px_1fr]" : ""}`}>
        {canEdit ? (
          <div className="flex flex-col gap-6">
            <Card>
              <StoreCreateForm />
            </Card>
            <Card>
              <ProductCreateForm stores={stores} />
            </Card>
          </div>
        ) : null}

        <Card id="store-view" className="scroll-mt-24">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">店铺视图</h2>
              <p className="mt-1 text-sm text-ink-muted">按平台和店铺归拢商品，先把多平台运营入口铺出来</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_FILTERS.map((platform) => (
                <Link
                  key={platform.value}
                  href={platform.value === "all" ? "/" : `/?platform=${platform.value}`}
                  className={buttonClass(selectedPlatform === platform.value ? "primary" : "secondary", "md")}
                >
                  {platform.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {stores.length === 0 ? (
              <EmptyState description="还没有店铺，先在左侧创建一个平台店铺。" />
            ) : (
              stores.map((store) => (
                <StoreSummaryCard
                  key={store.id}
                  store={store}
                  productCount={productsByStore.get(store.id) ?? 0}
                  selected={store.id === selectedStoreId}
                />
              ))
            )}
            {unboundProducts > 0 ? (
              <div className="rounded-card border border-warning/20 bg-warning-soft px-4 py-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-warning" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink">未绑定店铺商品</p>
                    <p className="mt-1 text-xs text-warning">{unboundProducts} 个商品需要补店铺归属</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <Card id="product-pool" className="scroll-mt-24">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">商品池</h2>
            <p className="mt-1 text-sm text-ink-muted">围绕每个商品补竞品、出素材、做投放实验和复盘</p>
          </div>
          <Badge tone="neutral" className="h-8 px-3">
            <Boxes className="h-3.5 w-3.5" aria-hidden="true" />
            {filteredProducts.length} / {products.length}
          </Badge>
        </div>

        <TableShell className="mt-5">
          <TableHead columns={PRODUCT_TABLE_COLUMNS} labels={["商品", "店铺", "平台", "售价", "卖点", "动作"]} />

          {filteredProducts.length === 0 ? (
            <EmptyState size="lg" description="当前筛选下没有商品，可以新建商品或切换平台。" />
          ) : (
            <TableBody>
              {filteredProducts.map((product) => (
                <ProductRow key={product.id} product={product} store={product.store_id ? storeById.get(product.store_id) : null} />
              ))}
            </TableBody>
          )}
        </TableShell>
      </Card>

      <section className="grid gap-4 md:grid-cols-5">
        {workflow.map((item) => {
          const Icon = item.icon;
          const workflowItem = workflowItems.get(item.title);
          return (
            <Link
              key={item.title}
              href={workflowItem?.href ?? item.href}
              className="rounded-card border border-line bg-surface shadow-card p-4 transition hover:border-brand/40 hover:bg-brand-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <IconTile tone={item.tone} size="sm">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </IconTile>
                <Badge tone="neutral">{workflowItem?.count ?? 0}</Badge>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-ink-muted">{workflowItem?.hint ?? "查看下一步"}</p>
            </Link>
          );
        })}
      </section>
    </PageShell>
  );
}

/** 构建首页工作流，从现有业务数据推导稳定的页面展示模型，不在渲染阶段修改源数据。 */
function buildHomeWorkflow(products: Product[], stores: Store[], unboundProducts: number): Map<string, { count: number; hint: string; href: string }> {
  // 工作流卡片只用已有数据提示下一步，不自动创建诊断、素材或投放实验。
  const missingSellingPoints = products.filter((product) => product.selling_points.length === 0).length;
  const missingPlatformIds = products.filter((product) => !product.external_product_id).length;
  const productsReadyForOps = products.filter((product) => product.store_id !== null && product.selling_points.length > 0).length;

  return new Map([
    [
      "建店建档",
      {
        count: stores.length + products.length,
        hint: unboundProducts > 0 ? `${unboundProducts} 个商品待绑定店铺` : "店铺和商品入口",
        href: "/",
      },
    ],
    [
      "导入数据",
      {
        count: missingPlatformIds,
        hint: missingPlatformIds > 0 ? `${missingPlatformIds} 个商品待补平台 ID` : "导入商品/SKU/经营数据",
        href: "/imports",
      },
    ],
    [
      "补商品信息",
      {
        count: missingSellingPoints,
        hint: missingSellingPoints > 0 ? `${missingSellingPoints} 个商品待补卖点` : "进入单品运营闭环",
        href: firstProductHref(products, "overview"),
      },
    ],
    [
      "投放建议",
      {
        count: productsReadyForOps,
        hint: productsReadyForOps > 0 ? "从素材和链接生成投放建议" : "先补商品基础信息",
        href: firstProductHref(products, "ads"),
      },
    ],
    [
      "周期复盘",
      {
        count: products.length,
        hint: products.length > 0 ? "回填经营数据后生成复盘" : "先创建商品",
        href: firstProductHref(products, "review"),
      },
    ],
  ]);
}

/** 首个商品链接，从现有业务数据推导稳定的页面展示模型，不在渲染阶段修改源数据。 */
function firstProductHref(products: Product[], tab: string): string {
  return products[0] ? `/products/${products[0].id}?tab=${tab}` : "/";
}

/** 渲染 MetricCard 组件，集中展示指标卡片所需的数据、状态和操作入口。 */
function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-card border border-line bg-surface shadow-card px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

/** 渲染 StoreSummaryCard 组件，集中展示店铺汇总卡片所需的数据、状态和操作入口。 */
function StoreSummaryCard({
  store,
  productCount,
  selected,
}: {
  store: Store;
  productCount: number;
  selected: boolean;
}) {
  return (
    <div
      className={`rounded-card border px-4 py-4 transition ${
        selected ? "border-brand bg-brand-soft" : "border-line bg-surface hover:bg-surface-muted"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile tone="info">
            <StoreIcon className="h-5 w-5" aria-hidden="true" />
          </IconTile>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{store.name}</p>
            <p className="mt-1 text-xs text-ink-muted">{platformLabels[store.platform]}</p>
          </div>
        </div>
        <Badge tone={store.status === "active" ? "success" : "neutral"}>
          {store.status === "active" ? "启用" : store.status === "paused" ? "暂停" : "关闭"}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-ink-muted">商品数</p>
          <p className="mt-1 font-semibold text-ink">{productCount}</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">负责人</p>
          <p className="mt-1 truncate font-semibold text-ink">{store.owner_name ?? "-"}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/?store=${store.id}`} className={buttonClass("secondary", "sm")}>
          筛选商品
        </Link>
        <Link href={`/stores/${store.id}`} className={buttonClass("primary", "sm")}>
          店铺详情
        </Link>
      </div>
    </div>
  );
}

/** 渲染 ProductRow 组件，集中展示商品行所需的数据、状态和操作入口。 */
function ProductRow({ product, store }: { product: Product; store: Store | null | undefined }) {
  return (
    <TableRow columns={PRODUCT_TABLE_COLUMNS}>
      <div>
        <p className="font-medium text-ink">{product.name}</p>
        <p className="mt-1 text-xs text-ink-muted">{product.category ?? "未分类"}</p>
      </div>
      <span className="text-ink-muted">{store?.name ?? "未绑定"}</span>
      <span className="text-ink-muted">{platformLabels[product.platform]}</span>
      <span className="font-medium text-ink">{product.price ? `¥${product.price}` : "-"}</span>
      <div className="flex flex-wrap gap-1.5">
        {product.selling_points.slice(0, 3).map((point) => (
          <Tag key={point} tone="success">
            {point}
          </Tag>
        ))}
      </div>
      <Link href={`/products/${product.id}`} className={buttonClass("secondary", "md", "w-24")}>
        进入
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </TableRow>
  );
}

/** 统计商品by店铺，封装当前页面重复使用的转换或展示规则，并统一处理空值边界。 */
function countProductsByStore(products: Product[]): Map<number, number> {
  return products.reduce((counts, product) => {
    if (product.store_id !== null) {
      counts.set(product.store_id, (counts.get(product.store_id) ?? 0) + 1);
    }
    return counts;
  }, new Map<number, number>());
}

/** 解析店铺ID，把不可信表单或 JSON 值转换为页面逻辑可安全使用的类型。 */
function parseStoreId(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const storeId = Number(value);
  return Number.isInteger(storeId) && storeId > 0 ? storeId : null;
}
