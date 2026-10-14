"use client";

import { Bot, Boxes, Home, LogOut, Settings, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonClass } from "@/components/ui/button";
import type { UserAccount, WorkspaceAccess } from "@/types";

const NAV_ITEMS: Array<{ href: string; label: string; icon: typeof Home }> = [
  { href: "/", label: "工作台", icon: Boxes },
  { href: "/imports", label: "导入中心", icon: Upload },
  { href: "/agent", label: "Agent 中心", icon: Bot },
  { href: "/settings", label: "模型配置", icon: Settings },
];

/**
 * 判断导航项是否处于激活态。
 * 商品详情 /products/[id] 与店铺详情 /stores/[id] 都属于「工作台」这个一级区域，
 * 所以它们激活的是工作台，而不是任何独立入口。
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/products") || pathname.startsWith("/stores");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppTopBarProps = {
  user: UserAccount | null;
  workspaces: WorkspaceAccess[];
  activeWorkspaceId: number | null;
};

/**
 * 全局顶栏：品牌 + 四个一级入口 + 账号区。
 * 账号区把原先散落在首页右上角的用户名/退出、以及 Agent 页的 Workspace 切换收拢到一处。
 */
export function AppTopBar({ user, workspaces, activeWorkspaceId }: AppTopBarProps) {
  const pathname = usePathname();
  const showWorkspaceSwitcher = workspaces.length > 1;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-5 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-control bg-brand text-xs font-semibold text-white">
            电
          </span>
          <span className="hidden text-sm font-semibold text-ink sm:inline">电商运营助手</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control px-3 text-sm font-medium transition ${
                  active ? "bg-brand-soft text-brand" : "text-ink-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {showWorkspaceSwitcher ? (
            <form action="/agent/workspaces/select" method="post" className="flex items-center gap-1.5">
              {/* 切完 Workspace 回到当前页，而不是被踢到 Agent 中心 */}
              <input type="hidden" name="redirect_to" value={pathname} />
              <select
                name="workspace_id"
                defaultValue={activeWorkspaceId ?? workspaces[0]?.workspace.id}
                aria-label="切换 Workspace"
                className="h-9 max-w-40 rounded-control border border-line bg-surface px-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              >
                {workspaces.map((item) => (
                  <option key={item.workspace.id} value={item.workspace.id}>
                    {item.workspace.name}
                  </option>
                ))}
              </select>
              <button type="submit" className={buttonClass("secondary", "md")}>
                切换
              </button>
            </form>
          ) : null}

          {user ? (
            <>
              <span
                className="hidden h-9 items-center rounded-control bg-surface-muted px-3 text-sm font-medium text-ink-muted md:inline-flex"
                title={`${user.email} · ${user.role}`}
              >
                {user.display_name}
              </span>
              <form action="/logout" method="post">
                <button type="submit" className={buttonClass("secondary", "md")}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={buttonClass("primary", "md")}>
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
