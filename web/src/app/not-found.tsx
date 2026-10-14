import { PackageSearch } from "lucide-react";
import Link from "next/link";

/** 全站 404：访问不存在的路径时展示（登录页等路由组外的场景也会落到这里）。 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10 text-ink">
      <div className="w-full max-w-lg rounded-card border border-line bg-surface shadow-card p-8 text-center">
        <PackageSearch className="mx-auto h-8 w-8 text-ink-soft" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-ink">页面不存在</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">你访问的地址没有对应的页面。</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-control bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-hover"
        >
          返回工作台
        </Link>
      </div>
    </main>
  );
}
