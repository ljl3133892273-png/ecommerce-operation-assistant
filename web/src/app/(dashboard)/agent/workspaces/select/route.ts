import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { WORKSPACE_COOKIE_NAME } from "@/lib/session";

/**
 * 只接受站内相对路径，挡掉 //evil.com 这类协议相对形式的开放重定向。
 */
function safeRedirectTarget(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/agent";
  }
  return value;
}

/** 处理Agent/Workspace/选择请求：读取表单和路径参数，调用后端 API，并按结果响应或重定向。 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const workspaceId = Number(formData.get("workspace_id"));
  const redirectTo = safeRedirectTarget(String(formData.get("redirect_to") ?? ""));
  if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
    return NextResponse.redirect(new URL("/agent?result=failed", request.url), 303);
  }
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE_NAME, String(workspaceId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  // 从顶栏切换时回到当前页，而不是被踢到 Agent 中心。
  return NextResponse.redirect(new URL(redirectTo, request.url), 303);
}
