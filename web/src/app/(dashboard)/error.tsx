"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonClass } from "@/components/ui/button";

/**
 * 路由组级错误边界：页面渲染或数据读取抛错时兜底，避免整页崩成 Next 默认错误页。
 * 注意：error.tsx 只能捕获同级 page 及更深层的错误，捕获不到同级 layout 的错误，
 * 因此顶栏 layout 内部已自行做了容错。
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-canvas px-5 py-10">
      <div className="w-full max-w-lg rounded-card border border-danger/20 bg-surface p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-ink">页面渲染出错</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          请求没有被伪装成空数据。请检查后端 API 是否可用，然后重试。
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-ink-soft">错误标识：{error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            重试
          </Button>
          <Link href="/" className={buttonClass("secondary", "lg")}>
            返回工作台
          </Link>
        </div>
      </div>
    </main>
  );
}
