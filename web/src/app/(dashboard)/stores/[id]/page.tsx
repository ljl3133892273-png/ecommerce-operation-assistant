import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Package,
  Store as StoreIcon,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InventoryAdvicePanel } from "@/components/inventory-advice-panel";
import { Badge, Tag } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/button";
import { Card, IconTile, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { TableBody, TableHead, TableRow, TableShell } from "@/components/ui/table";
import { getCurrentUser, getProducts, getStore, getStoreInventoryMovements, getStoreInventorySummary } from "@/lib/api";
import { platformLabels } from "@/lib/constants";
import { getAuthToken } from "@/lib/session";
import type { StoreInventoryMovementRow, StoreInventoryRow } from "@/types";
import type { Product } from "@/types";

const STORE_PRODUCT_COLUMNS = "1.4fr 0.8fr 0.8fr 1fr 96px";
const INVENTORY_COLUMNS = "1.2fr 0.9fr 0.7fr 0.7fr 0.7fr 0.8fr";
const MOVEMENT_COLUMNS = "0.8fr 1fr 0.9fr 0.7fr 0.7fr 1fr";

type StorePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ inventory?: string }>;
};

/** 渲染stores页面；在服务端加载业务数据，并把交互交给对应表单或客户端组件。 */
export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [store, products, inventorySummary, inventoryMovements, token] = await Promise.all([
    getStore(id),
    getProducts(),
    getStoreInventorySummary(id),
    getStoreInventoryMovements(id),
    getAuthToken(),
  ]);

  if (!store) {
    notFound();
  }

  const storeProducts = products.filter((product) => product.store_id === store.id);
  const activeProducts = storeProducts.filter((product) => product.platform_status !== "offline").length;
  const unmappedProducts = storeProducts.filter((product) => !product.external_product_id).length;
  const lowStockRows = inventorySummary?.rows.filter((row) => row.is_low_stock) ?? [];
  const inventoryRows = query.inventory === "low" ? lowStockRows : inventorySummary?.rows ?? [];
  const workflowSteps = buildStoreWorkflowSteps(store.id, storeProducts, inventorySummary?.rows ?? [], lowStockRows, unmappedProducts);
  const currentUser = token ? await getCurrentUser(token) : null;
  const canEdit = Boolean(currentUser?.permissions.can_edit);

  return (
    <PageShell
      header={
        <PageHeader
          breadcrumb={
            <Breadcrumb
              items={[
                { label: "工作台", href: "/" },
                { label: "店铺视图", href: "/#store-view" },
                { label: store.name },
              ]}
            />
          }
          eyebrow={platformLabels[store.platform]}
          title={store.name}
          description={store.owner_name ? `负责人：${store.owner_name}` : "未设置负责人"}
          actions={
            <Badge tone={store.status === "active" ? "success" : "neutral"} className="h-8 px-3">
              {store.status === "active" ? "启用" : store.status === "paused" ? "暂停" : "关闭"}
            </Badge>
          }
        />
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="店铺商品" value={storeProducts.length} icon={Package} />
        <MetricCard label="在营商品" value={activeProducts} icon={Boxes} />
        <MetricCard label="待补平台映射" value={unmappedProducts} icon={ArrowRight} />
        <MetricCard label="可用库存" value={inventorySummary?.total_available_quantity ?? 0} icon={Warehouse} />
      </section>

      <StoreWorkflowPanel steps={workflowSteps} />

      {lowStockRows.length > 0 ? (
        <section className="rounded-card border border-warning/20 bg-warning-soft p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-3">
              <IconTile tone="warning">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </IconTile>
              <div>
                <h2 className="text-base font-semibold text-ink">库存异常提示</h2>
                <p className="mt-1 text-sm text-warning">
                  {lowStockRows.length} 个 SKU 可用库存已低于或等于预警线，建议优先补货或调整投放节奏。
                </p>
              </div>
            </div>
            <Link href={`/stores/${store.id}?inventory=low`} className={buttonClass("primary", "md", "w-fit")}>
              只看低库存
            </Link>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {lowStockRows.slice(0, 4).map((row) => (
              <Link
                key={row.sku_id}
                href={`/products/${row.product_id}?tab=overview`}
                className="rounded-card border border-warning/20 bg-surface px-3 py-2 text-sm transition hover:bg-warning-soft"
              >
                <span className="font-medium text-ink">{row.product_name}</span>
                <span className="ml-2 text-ink-muted">{row.sku_code}</span>
                <span className="ml-2 text-warning">可用 {row.available_quantity}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <InventoryWorkflowPanel storeId={store.id} inventoryRows={inventorySummary?.rows ?? []} lowStockRows={lowStockRows} />

      <InventoryAdvicePanel storeId={store.id} canEdit={canEdit} />

      <Card>
        <SectionTitle
          title="店铺商品"
          description="从店铺维度进入单品运营闭环"
          actions={
            <Link href={`/?store=${store.id}`} className={buttonClass("secondary", "md")}>
              回首页筛选
            </Link>
          }
        />

        <TableShell className="mt-5">
          <TableHead columns={STORE_PRODUCT_COLUMNS} labels={["商品", "平台状态", "售价", "卖点", "动作"]} />
          {storeProducts.length === 0 ? (
            <EmptyState size="lg" description="这个店铺还没有绑定商品，可以回到首页创建商品并选择该店铺。" />
          ) : (
            <TableBody>
              {storeProducts.map((product) => (
                <StoreProductRow key={product.id} product={product} />
              ))}
            </TableBody>
          )}
        </TableShell>
      </Card>

      <Card>
        <SectionTitle
          title="库存概览"
          description="按 SKU 汇总库存、锁定量、可用量和低库存风险"
          actions={<Badge tone="neutral" className="h-8 px-3">低库存 {inventorySummary?.low_stock_count ?? 0}</Badge>}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/stores/${store.id}`}
            className={buttonClass(query.inventory === "low" ? "secondary" : "primary", "sm")}
          >
            全部库存
          </Link>
          <Link
            href={`/stores/${store.id}?inventory=low`}
            className={buttonClass(query.inventory === "low" ? "primary" : "secondary", "sm")}
          >
            低库存
          </Link>
        </div>

        <TableShell className="mt-5">
          <TableHead columns={INVENTORY_COLUMNS} labels={["SKU", "商品", "现货", "锁定", "可用", "状态"]} />
          {!inventorySummary || inventoryRows.length === 0 ? (
            <EmptyState
              size="lg"
              description={
                query.inventory === "low"
                  ? "当前没有低库存 SKU。"
                  : "这个店铺还没有 SKU 库存数据，后续可从商品详情创建 SKU 并登记库存。"
              }
            />
          ) : (
            <TableBody>
              {inventoryRows.map((row) => (
                <InventoryRow key={row.sku_id} row={row} />
              ))}
            </TableBody>
          )}
        </TableShell>
      </Card>

      <Card>
        <SectionTitle
          title="库存流水"
          description="集中查看店铺最近库存变化"
          actions={<Badge tone="neutral" className="h-8 px-3">最近 {inventoryMovements.length}</Badge>}
        />

        <TableShell className="mt-5">
          <TableHead columns={MOVEMENT_COLUMNS} labels={["类型", "商品", "SKU", "现货变化", "锁定变化", "原因"]} />
          {inventoryMovements.length === 0 ? (
            <EmptyState description="暂无库存流水。" />
          ) : (
            <TableBody>
              {inventoryMovements.map((movement) => (
                <InventoryMovementRow key={movement.id} movement={movement} />
              ))}
            </TableBody>
          )}
        </TableShell>
      </Card>
    </PageShell>
  );
}

/** 渲染 MetricCard 组件，集中展示指标卡片所需的数据、状态和操作入口。 */
function MetricCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
  return (
    <div className="rounded-card border border-line bg-surface shadow-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">{label}</p>
        <Icon className="h-4 w-4 text-ink-soft" aria-hidden="true" />
      </div>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

type StoreWorkflowStep = {
  key: string;
  title: string;
  href: string;
  done: boolean;
  hint: string;
};

/** 渲染 StoreWorkflowPanel 组件，集中展示店铺工作流面板所需的数据、状态和操作入口。 */
function StoreWorkflowPanel({ steps }: { steps: StoreWorkflowStep[] }) {
  const nextStep = steps.find((step) => !step.done) ?? steps[steps.length - 1];

  return (
    <Card>
      <SectionTitle
        icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
        tone="brand"
        title="店铺运营流程"
        description={nextStep.done ? "店铺基础流程已跑通。" : `下一步：${nextStep.title}`}
        actions={
          <Link href={nextStep.href} className={buttonClass("primary", "md")}>
            继续处理
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {steps.map((step) => (
          <Link
            key={step.key}
            href={step.href}
            className={`rounded-card border px-3 py-3 transition ${
              step.done ? "border-success/20 bg-success-soft" : "border-line bg-surface hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{step.title}</p>
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-muted">{step.hint}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/** 构建店铺工作流steps，从现有业务数据推导稳定的页面展示模型，不在渲染阶段修改源数据。 */
function buildStoreWorkflowSteps(
  storeId: number,
  products: Product[],
  inventoryRows: StoreInventoryRow[],
  lowStockRows: StoreInventoryRow[],
  unmappedProducts: number,
): StoreWorkflowStep[] {
  return [
    {
      key: "store",
      title: "建店",
      href: `/stores/${storeId}`,
      done: true,
      hint: "店铺档案已创建",
    },
    {
      key: "products",
      title: "商品",
      href: `/?store=${storeId}`,
      done: products.length > 0,
      hint: products.length > 0 ? `${products.length} 个商品已归属店铺` : "创建或导入商品",
    },
    {
      key: "inventory",
      title: "SKU/库存",
      href: `/stores/${storeId}`,
      done: inventoryRows.length > 0,
      hint: inventoryRows.length > 0 ? `${inventoryRows.length} 个 SKU 有库存记录` : "进入商品维护 SKU 和库存",
    },
    {
      key: "mapping",
      title: "数据映射",
      href: "/imports",
      done: products.length > 0 && unmappedProducts === 0,
      hint: unmappedProducts > 0 ? `${unmappedProducts} 个商品待补平台映射` : "导入经营数据或字段映射",
    },
    {
      key: "risk",
      title: "异常处理",
      href: lowStockRows.length > 0 ? `/stores/${storeId}?inventory=low` : `/stores/${storeId}`,
      done: inventoryRows.length > 0 && lowStockRows.length === 0,
      hint: lowStockRows.length > 0 ? `${lowStockRows.length} 个 SKU 低库存` : "库存异常入口",
    },
  ];
}

/** 渲染 InventoryWorkflowPanel 组件，集中展示库存工作流面板所需的数据、状态和操作入口。 */
function InventoryWorkflowPanel({
  storeId,
  inventoryRows,
  lowStockRows,
}: {
  storeId: number;
  inventoryRows: StoreInventoryRow[];
  lowStockRows: StoreInventoryRow[];
}) {
  const hasInventory = inventoryRows.length > 0;
  const hasLowStock = lowStockRows.length > 0;
  const steps = [
    {
      title: "发现低库存",
      done: hasInventory,
      hint: hasLowStock ? `${lowStockRows.length} 个 SKU 需要处理` : "当前无低库存风险",
      href: hasLowStock ? `/stores/${storeId}?inventory=low` : `/stores/${storeId}`,
    },
    {
      title: "分析销量",
      done: false,
      hint: "导入经营数据后判断补货优先级",
      href: "/imports",
    },
    {
      title: "生成建议",
      done: false,
      hint: "使用库存异常 AI/规则建议",
      href: `/stores/${storeId}`,
    },
    {
      title: "人工确认",
      done: !hasLowStock && hasInventory,
      hint: "补货、调拨和投放节奏由人工确认",
      href: `/stores/${storeId}`,
    },
  ];

  return (
    <Card>
      <SectionTitle
        title="库存处理流程"
        description="围绕低库存、销量数据、补货建议和人工确认推进"
        actions={
          <Link
            href={hasLowStock ? `/stores/${storeId}?inventory=low` : "/imports"}
            className={buttonClass("secondary", "md")}
          >
            {hasLowStock ? "查看低库存" : "导入经营数据"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map((step) => (
          <Link
            key={step.title}
            href={step.href}
            className={`rounded-card border px-3 py-3 transition ${
              step.done ? "border-success/20 bg-success-soft" : "border-line bg-surface hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">{step.title}</p>
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-muted">{step.hint}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/** 渲染 StoreProductRow 组件，集中展示店铺商品行所需的数据、状态和操作入口。 */
function StoreProductRow({ product }: { product: Product }) {
  return (
    <TableRow columns={STORE_PRODUCT_COLUMNS}>
      <div>
        <p className="font-medium text-ink">{product.name}</p>
        <p className="mt-1 text-xs text-ink-muted">{product.category ?? "未分类"}</p>
      </div>
      <span className="text-ink-muted">{product.platform_status ?? "未同步"}</span>
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

/** 渲染 InventoryRow 组件，集中展示库存行所需的数据、状态和操作入口。 */
function InventoryRow({ row }: { row: StoreInventoryRow }) {
  return (
    <TableRow columns={INVENTORY_COLUMNS}>
      <div>
        <p className="font-medium text-ink">{row.sku_name}</p>
        <p className="mt-1 text-xs text-ink-muted">{row.sku_code}</p>
      </div>
      <span className="text-ink-muted">{row.product_name}</span>
      <span className="font-medium text-ink">{row.quantity}</span>
      <span className="text-ink-muted">{row.locked_quantity}</span>
      <span className="font-medium text-ink">{row.available_quantity}</span>
      <Badge tone={row.is_low_stock ? "warning" : "success"}>
        {row.is_low_stock ? `低库存 <= ${row.warning_threshold}` : "正常"}
      </Badge>
    </TableRow>
  );
}

/** 渲染 InventoryMovementRow 组件，集中展示库存流水行所需的数据、状态和操作入口。 */
function InventoryMovementRow({ movement }: { movement: StoreInventoryMovementRow }) {
  return (
    <TableRow columns={MOVEMENT_COLUMNS} className="lg:min-h-14">
      <span className="font-medium text-ink">{movementTypeLabel(movement.movement_type)}</span>
      <Link href={`/products/${movement.product_id}?tab=overview`} className="text-brand hover:text-brand-hover">
        {movement.product_name}
      </Link>
      <span className="text-ink-muted">{movement.sku_code}</span>
      <span className="font-medium text-ink">{formatSigned(movement.quantity_delta)}</span>
      <span className="text-ink-muted">{formatSigned(movement.locked_delta)}</span>
      <span className="truncate text-ink-muted">{movement.reason ?? movement.created_at}</span>
    </TableRow>
  );
}

/** 把流水type状态映射为中文显示文本，保持页面口径一致。 */
function movementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    inbound: "入库",
    outbound: "出库",
    adjustment: "盘点",
    lock: "锁定",
    release: "释放",
  };
  return labels[type] ?? type;
}

/** 格式化带符号，统一空值、本地化和页面展示规则，避免各组件重复格式化。 */
function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}
