import { Download, FileSpreadsheet, Upload } from "lucide-react";
import Link from "next/link";

import { PerformanceImportCenterPanel, ProductImportPanel, SkuInventoryImportPanel } from "@/components/product-import-panel";
import { buttonClass } from "@/components/ui/button";
import { Card, IconTile, SectionTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

const templates = [
  {
    title: "商品档案模板",
    description: "用于导入店铺商品、平台、价格、受众、卖点和平台商品 ID。",
    href: "/workspace/templates/products",
  },
  {
    title: "SKU 库存模板",
    description: "用于导入 SKU 编码、规格、初始库存、预警线、仓位和平台 SKU ID。",
    href: "/workspace/templates/sku-inventory",
  },
  {
    title: "经营数据模板",
    description: "用于导入曝光、点击、成交、花费、成交额等投放复盘数据。",
    href: "/workspace/templates/performance-records",
  },
  {
    title: "字段映射模板",
    description: "用于把淘宝、天猫、拼多多、京东、抖音等平台字段映射到系统字段。",
    href: "/workspace/templates/field-mapping",
  },
];

/** 渲染导入页面；在服务端加载业务数据，并把交互交给对应表单或客户端组件。 */
export default function ImportCenterPage() {
  return (
    <PageShell
      header={
        <PageHeader
          eyebrow="Data Import"
          title="导入中心"
          description="汇总商品、SKU 库存、经营数据和平台字段映射模板，后续承接导入预览和错误行提示。"
          actions={
            <div className="flex items-start gap-4">
              <IconTile tone="solid" size="lg">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </IconTile>
              <p className="pt-1 text-sm text-ink-muted">四种模板覆盖建档、库存、经营数据与字段映射。</p>
            </div>
          }
        />
      }
    >

      <section className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.href}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <IconTile tone="brand">
                  <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                </IconTile>
                <div>
                  <h2 className="text-base font-semibold text-ink">{template.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{template.description}</p>
                </div>
              </div>
              <Link href={template.href} className={buttonClass("secondary", "md", "shrink-0")}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                下载
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <ProductImportPanel />
      <SkuInventoryImportPanel />
      <PerformanceImportCenterPanel />

      <Card>
        <SectionTitle title="已接入能力" description="导入链路的当前完成度。" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <StatusCard title="经营数据 CSV" status="已支持预览" />
          <StatusCard title="字段映射模板" status="已提供" />
          <StatusCard title="商品/SKU 导入预览" status="已接入" />
        </div>
      </Card>
    </PageShell>
  );
}

/** 渲染 StatusCard 组件，集中展示状态卡片所需的数据、状态和操作入口。 */
function StatusCard({ title, status }: { title: string; status: string }) {
  return (
    <div className="rounded-card border border-line bg-surface shadow-card-muted p-4">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink-muted">{status}</p>
    </div>
  );
}
