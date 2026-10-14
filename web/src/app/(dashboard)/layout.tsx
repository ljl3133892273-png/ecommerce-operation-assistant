import type { ReactNode } from "react";

import { AppTopBar } from "@/components/app-top-bar";
import { getCurrentUser, getWorkspaces } from "@/lib/api";
import { getActiveWorkspaceId, getAuthToken } from "@/lib/session";
import type { WorkspaceAccess } from "@/types";

/**
 * 工作台路由组布局：挂全局顶栏。
 * 登录页等不需要导航的路由放在路由组之外，天然不渲染顶栏。
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = await getAuthToken();
  const [user, activeWorkspaceId] = await Promise.all([
    token ? getCurrentUser(token) : Promise.resolve(null),
    getActiveWorkspaceId(),
  ]);

  // 顶栏只是外壳，绝不能因为后端不可用就让所有页面 500。
  let workspaces: WorkspaceAccess[] = [];
  if (token) {
    try {
      workspaces = await getWorkspaces();
    } catch {
      workspaces = [];
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppTopBar user={user} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      {children}
    </div>
  );
}
