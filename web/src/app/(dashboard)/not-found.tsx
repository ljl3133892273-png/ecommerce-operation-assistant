import { PackageSearch } from "lucide-react";
import Link from "next/link";

import { buttonClass } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

/** 工作台内的 404：商品或店铺不存在（notFound()）时展示。 */
export default function DashboardNotFound() {
  return (
    <PageShell width="narrow">
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full rounded-card border border-line bg-surface shadow-card p-8 text-center">
          <PackageSearch className="mx-auto h-8 w-8 text-ink-soft" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold text-ink">没有找到这个对象</h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            商品、店铺或任务可能已被删除，或者链接里的 ID 不正确。
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className={buttonClass("primary", "lg")}>
              返回工作台
            </Link>
            <Link href="/imports" className={buttonClass("secondary", "lg")}>
              去导入中心
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
