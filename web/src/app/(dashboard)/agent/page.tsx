import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DatabaseZap,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AgentTaskAutoRefresh } from "@/components/agent-task-auto-refresh";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card, IconTile, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { CenteredShell, PageShell } from "@/components/ui/page-shell";
import { controlClass, textareaClass } from "@/components/ui/field";
import {
  AgentApiError,
  getAgentApprovals,
  getAgentCatalog,
  getAgentMemories,
  getAgentTasks,
  getCurrentUser,
  getWorkspaces,
  getWorkspaceProducts,
  getWorkspaceStores,
} from "@/lib/api";
import { getActiveWorkspaceId, getAuthToken } from "@/lib/session";
import type { AgentRiskLevel, AgentTaskStatus } from "@/types";

type AgentCenterProps = {
  searchParams?: Promise<{ workspace?: string; result?: string; section?: string }>;
};

const statusLabels: Record<AgentTaskStatus, string> = {
  queued: "排队中",
  running: "执行中",
  awaiting_approval: "待审批",
  completed: "已完成",
  failed: "失败",
  cancelled: "已取消",
};

/** 任务状态 → Badge 语义，避免每个状态各写一套背景/文字色。 */
const statusTones: Record<AgentTaskStatus, "neutral" | "brand" | "warning" | "success" | "danger"> = {
  queued: "neutral",
  running: "brand",
  awaiting_approval: "warning",
  completed: "success",
  failed: "danger",
  cancelled: "neutral",
};

/** 风险等级 → Badge 语义。 */
const riskTones: Record<AgentRiskLevel, "info" | "success" | "warning" | "danger"> = {
  R0: "info",
  R1: "success",
  R2: "warning",
  R3: "danger",
};

const harnessBoundaries: Array<[string, string]> = [
  ["身份与租户", "Workspace 强隔离"],
  ["工具策略", "Agent allowlist + 风险分级"],
  ["可靠执行", "Celery + Outbox + 幂等"],
  ["状态恢复", "PostgreSQL Checkpoint"],
  ["人工协作", "R2/R3 数据库审批"],
  ["质量闭环", "事件、评测和版本追踪"],
];

/** 渲染 AgentCenter 组件，集中展示Agent中心所需的数据、状态和操作入口。 */
export default async function AgentCenter({ searchParams }: AgentCenterProps) {
  const token = await getAuthToken();
  if (!token) {
    redirect("/login");
  }
  const query = searchParams ? await searchParams : {};
  const activeWorkspaceId = await getActiveWorkspaceId();
  let workspaces: Awaited<ReturnType<typeof getWorkspaces>>;
  let currentUser: Awaited<ReturnType<typeof getCurrentUser>>;
  try {
    [workspaces, currentUser] = await Promise.all([getWorkspaces(), getCurrentUser(token)]);
  } catch (error) {
    if (error instanceof AgentApiError && error.status === 401) redirect("/login?expired=1");
    return <AgentServiceError />;
  }
  if (!currentUser) redirect("/login?expired=1");
  const workspace = selectWorkspace(workspaces, query.workspace ?? activeWorkspaceId?.toString());
  if (!workspace) {
    return <EmptyWorkspace />;
  }
  const workspaceId = workspace.workspace.id;
  let resources;
  try {
    resources = await Promise.all([
      getAgentCatalog(workspaceId),
      getAgentTasks(workspaceId),
      getAgentApprovals(workspaceId),
      getAgentMemories(workspaceId),
      getWorkspaceProducts(workspaceId),
      getWorkspaceStores(workspaceId),
    ]);
  } catch (error) {
    if (error instanceof AgentApiError && error.status === 401) redirect("/login?expired=1");
    return <AgentServiceError />;
  }
  const [catalog, tasks, approvals, memories, products, stores] = resources;
  const canEdit = workspace.membership.role !== "viewer";
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const activeCount = tasks.filter((task) => ["queued", "running"].includes(task.status)).length;

  return (
    <PageShell
      header={
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <Bot className="h-4 w-4" aria-hidden="true" />
              Ecommerce Operations Agent
            </span>
          }
          title="统一运营 Agent 中心"
          description="由一个协调 Agent 选择受控工作流，八个专业 Agent 在 Harness 约束下协作；业务结果仍回到可编辑工作台。"
          actions={
            <Badge tone="brand" className="h-8 px-3">
              当前 Workspace：{workspace.workspace.name} · {workspace.membership.role}
            </Badge>
          }
        />
      }
    >
      <AgentTaskAutoRefresh active={activeCount > 0} />

      {query.result ? <ResultBanner result={query.result} /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Layers3} label="版本化工作流" value={catalog?.workflows.length ?? 0} />
        <Metric icon={Activity} label="进行中任务" value={activeCount} />
        <Metric icon={CheckCircle2} label="已完成任务" value={completedCount} />
        <Metric icon={ClipboardCheck} label="待处理审批" value={approvals.length} tone="text-warning" />
      </section>

      <nav className="flex flex-wrap gap-2 rounded-card border border-line bg-surface shadow-card p-2 text-sm">
        <a href="#agent-entry" className="rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-surface-muted hover:text-ink">Agent 入口</a>
        <a href="#task-center" className="rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-surface-muted hover:text-ink">任务中心</a>
        <a href="#approval-inbox" className="rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-surface-muted hover:text-ink">审批收件箱</a>
        <a href="#memory" className="rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-surface-muted hover:text-ink">结构化记忆</a>
        <a href="#catalog" className="rounded-control px-3 py-2 font-medium text-ink-muted hover:bg-surface-muted hover:text-ink">Agent 目录</a>
      </nav>

      <section id="agent-entry" className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <SectionTitle
            icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
            tone="brand"
            title="告诉协调 Agent 你的目标"
            description="协调 Agent 只从已注册工作流中路由，不会自由拼装高风险动作。"
          />
          <form action="/agent/tasks/create" method="post" className="mt-5 space-y-4">
            <input type="hidden" name="workspace_id" value={workspaceId} />
            <textarea
              name="intent"
              required
              disabled={!canEdit}
              placeholder="例如：检查这款商品近期的库存和经营风险，并给出下一步建议"
              className={`${textareaClass} min-h-28`}
            />
            <ContextSelectors products={products} stores={stores} disabled={!canEdit} />
            <button type="submit" disabled={!canEdit} className={buttonClass("primary", "lg")}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              创建受控任务
            </button>
          </form>
        </Card>

        <div className="rounded-card border border-line bg-solid p-5 text-white">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-soft">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Harness 边界
          </div>
          <h2 className="mt-3 text-xl font-semibold">不是把多个 Prompt 串在一起</h2>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {harnessBoundaries.map(([title, detail]) => (
              <div key={title} className="rounded-control border border-white/15 bg-white/5 p-3">
                <p className="font-medium text-white">{title}</p>
                <p className="mt-1 text-xs text-ink-soft">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Card>
        <SectionTitle
          title="任务模板"
          description="每个模板对应一个可版本化、可评测、可回退的 LangGraph 工作流。"
          actions={<span className="text-xs text-ink-muted">{catalog?.workflows.length ?? 0} 个已启用</span>}
        />
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {catalog?.workflows.map((workflow) => (
            <form
              key={workflow.key}
              action="/agent/tasks/create"
              method="post"
              className="flex flex-col rounded-card border border-line p-4 transition hover:border-brand/40"
            >
              <input type="hidden" name="workspace_id" value={workspaceId} />
              <input type="hidden" name="workflow_key" value={workflow.key} />
              <div className="flex items-start justify-between gap-3">
                <IconTile tone="brand" size="sm">
                  <Play className="h-4 w-4" aria-hidden="true" />
                </IconTile>
                <Badge tone={riskTones[workflow.default_risk_level]}>{workflow.default_risk_level}</Badge>
              </div>
              <h3 className="mt-4 font-semibold text-ink">{workflow.title}</h3>
              <p className="mt-2 min-h-10 text-sm leading-5 text-ink-muted">{workflow.description}</p>
              <div className="mt-3">
                <ContextSelectors products={products} stores={stores} compact disabled={!canEdit} />
              </div>
              <button
                type="submit"
                disabled={!canEdit}
                className={buttonClass("secondary", "md", "mt-4 w-full")}
              >
                启动工作流 <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          ))}
        </div>
      </Card>

      <Card>
        <div id="task-center" className="scroll-mt-6">
          <SectionTitle
            title="任务中心"
            description="Task 表达业务目标，Run 表达实际执行和重试。"
            actions={<Clock3 className="h-5 w-5 text-ink-soft" aria-hidden="true" />}
          />
          <div className="mt-5 space-y-3">
            {tasks.length === 0 ? (
              <EmptyState description="还没有 Agent Task。" />
            ) : (
              tasks.map((task) => (
                <details key={task.id} className="rounded-card border border-line p-4">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-ink">
                          #{task.id} {task.title}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {task.workflow_key} · v{task.workflow_version} · {formatDate(task.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={riskTones[task.risk_level]}>{task.risk_level}</Badge>
                        <Badge tone={statusTones[task.status]}>{statusLabels[task.status]}</Badge>
                      </div>
                    </div>
                  </summary>
                  <div className="mt-4 grid gap-4 border-t border-line pt-4 lg:grid-cols-2">
                    <JsonPanel title="上下文" value={task.context_scope} />
                    <JsonPanel title="结果摘要" value={task.result_summary} />
                  </div>
                  {task.error ? <p className="mt-3 text-sm text-danger">{task.error}</p> : null}
                  {["queued", "running", "awaiting_approval"].includes(task.status) && canEdit ? (
                    <form action={`/agent/tasks/${task.id}/cancel`} method="post" className="mt-3">
                      <input type="hidden" name="workspace_id" value={workspaceId} />
                      <button type="submit" className={buttonClass("danger", "sm")}>
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        取消任务
                      </button>
                    </form>
                  ) : null}
                </details>
              ))
            )}
          </div>
        </div>
      </Card>

      <section id="approval-inbox" className="scroll-mt-6 rounded-card border border-warning/20 bg-warning-soft/50 p-5">
        <SectionTitle
          icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
          tone="warning"
          title="审批收件箱"
          description="R2/R3 副作用必须由策略层和数据库审批共同放行。"
        />
        <div className="mt-5 space-y-3">
          {approvals.length === 0 ? (
            <EmptyState description="当前没有待审批动作。" />
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="rounded-card border border-warning/20 bg-surface p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-ink">
                      任务 #{approval.task_id} · {approval.action_key}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Run #{approval.run_id} · {formatDate(approval.created_at)}
                    </p>
                  </div>
                  <Badge tone={riskTones[approval.risk_level]}>{approval.risk_level}</Badge>
                </div>
                <div className="mt-3">
                  <JsonPanel title="审批内容" value={approval.request_payload} />
                </div>
                {canEdit ? (
                  <div className="mt-4 flex flex-col gap-2">
                    <ApprovalForm
                      approvalId={approval.id}
                      workspaceId={workspaceId}
                      decision="approve"
                      draftOutput={approval.request_payload.draft_output}
                    />
                    <ApprovalForm approvalId={approval.id} workspaceId={workspaceId} decision="reject" />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section id="memory" className="grid gap-6 scroll-mt-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <SectionTitle
            icon={<Brain className="h-5 w-5" aria-hidden="true" />}
            tone="info"
            title="确认一条长期记忆"
            description="只保存用户明确确认的结构化事实，不自动吸收全部聊天。"
          />
          <form action="/agent/memories/create" method="post" className="mt-4 space-y-3">
            <input type="hidden" name="workspace_id" value={workspaceId} />
            <select name="scope_type" className={controlClass}>
              <option value="workspace">工作区</option>
              <option value="store">店铺</option>
              <option value="product">商品</option>
              <option value="user">用户偏好</option>
            </select>
            <input name="scope_id" placeholder="范围 ID（工作区可留空）" className={controlClass} />
            <input name="memory_key" required placeholder="键，例如 brand_tone" className={controlClass} />
            <textarea name="memory_value" required placeholder="已确认的事实或偏好" className={textareaClass} />
            <button type="submit" disabled={!canEdit} className={buttonClass("primary", "md")}>
              <DatabaseZap className="h-4 w-4" aria-hidden="true" />
              保存记忆
            </button>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">有效记忆</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {memories.length === 0 ? (
              <EmptyState description="暂无已确认记忆。" />
            ) : (
              memories.map((memory) => (
                <div key={memory.id} className="rounded-card border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-ink">{memory.memory_key}</p>
                    <span className="text-xs text-ink-muted">
                      {memory.scope_type}:{memory.scope_id ?? workspaceId}
                    </span>
                  </div>
                  <pre className="mt-3 overflow-auto whitespace-pre-wrap text-xs leading-5 text-ink-muted">
                    {JSON.stringify(memory.content, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <Card>
        <div id="catalog" className="scroll-mt-6">
          <SectionTitle title="内部专业 Agent 目录" description="用户只与顶层 Agent 交互；专业 Agent 的版本和工具白名单可审计。" />
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {catalog?.agents.map((agent) => (
              <div key={agent.key} className="rounded-card border border-line p-4">
                <p className="font-medium text-ink">{humanizeAgent(agent.key)}</p>
                <p className="mt-1 text-xs text-brand">v{agent.version}</p>
                <p className="mt-3 text-sm leading-5 text-ink-muted">{agent.description}</p>
                <p className="mt-3 text-xs text-ink-soft">{agent.tools.length} 个允许工具</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

/** 渲染 ContextSelectors 组件，集中展示上下文选择器所需的数据、状态和操作入口。 */
function ContextSelectors({
  products,
  stores,
  compact = false,
  disabled = false,
}: {
  products: Array<{ id: number; name: string }>;
  stores: Array<{ id: number; name: string }>;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
      <select name="product_id" disabled={disabled} className={controlClass}>
        <option value="">选择商品上下文</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
      <select name="store_id" disabled={disabled} className={controlClass}>
        <option value="">选择店铺上下文</option>
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** 渲染 ApprovalForm 组件，集中展示审批表单所需的数据、状态和操作入口。 */
function ApprovalForm({
  approvalId,
  workspaceId,
  decision,
  draftOutput,
}: {
  approvalId: number;
  workspaceId: number;
  decision: "approve" | "reject";
  draftOutput?: unknown;
}) {
  const approve = decision === "approve";
  return (
    <form action={`/agent/approvals/${approvalId}/decision`} method="post" className="space-y-2">
      <input type="hidden" name="workspace_id" value={workspaceId} />
      <input type="hidden" name="decision" value={decision} />
      {approve ? (
        <textarea
          name="edited_output"
          defaultValue={JSON.stringify(draftOutput ?? {}, null, 2)}
          className="min-h-40 w-full rounded-control border border-line bg-surface px-3 py-2 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          aria-label="编辑后批准的结构化输出"
        />
      ) : null}
      <button type="submit" className={buttonClass(approve ? "primary" : "danger", "md")}>
        {approve ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <XCircle className="h-4 w-4" aria-hidden="true" />}
        {approve ? "编辑后批准并恢复" : "拒绝"}
      </button>
    </form>
  );
}

/** 渲染 Metric 组件，集中展示指标所需的数据、状态和操作入口。 */
function Metric({
  icon: Icon,
  label,
  value,
  tone = "text-brand",
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-surface shadow-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

/** 渲染 JsonPanel 组件，集中展示json面板所需的数据、状态和操作入口。 */
function JsonPanel({ title, value }: { title: string; value: Record<string, unknown> }) {
  return (
    <div className="rounded-card bg-surface-muted p-3">
      <p className="text-xs font-semibold text-ink-muted">{title}</p>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-5 text-ink-muted">
        {Object.keys(value).length ? JSON.stringify(value, null, 2) : "暂无"}
      </pre>
    </div>
  );
}

/** 渲染 EmptyWorkspace 组件，集中展示空状态Workspace所需的数据、状态和操作入口。 */
function EmptyWorkspace() {
  return (
    <CenteredShell>
      <div className="max-w-lg rounded-card border border-line bg-surface shadow-card p-8 text-center">
        <Bot className="mx-auto h-8 w-8 text-ink-soft" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-ink">暂无可用 Workspace</h1>
        <p className="mt-2 text-sm text-ink-muted">请先运行数据库迁移并为当前用户创建 WorkspaceMembership。</p>
      </div>
    </CenteredShell>
  );
}

/** 渲染 AgentServiceError 组件，集中展示Agent服务错误所需的数据、状态和操作入口。 */
function AgentServiceError() {
  return (
    <CenteredShell>
      <div className="max-w-lg rounded-card border border-danger/20 bg-surface p-8 text-center">
        <XCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold text-ink">Agent 服务暂不可用</h1>
        <p className="mt-2 text-sm text-ink-muted">请求未被伪装为空数据，请检查 API、权限或基础设施状态后重试。</p>
      </div>
    </CenteredShell>
  );
}

/** 渲染 ResultBanner 组件，集中展示结果提示横幅所需的数据、状态和操作入口。 */
function ResultBanner({ result }: { result: string }) {
  const failed = result === "failed";
  return (
    <div
      className={`rounded-card border px-4 py-3 text-sm ${
        failed ? "border-danger/20 bg-danger-soft text-danger" : "border-success/20 bg-success-soft text-success"
      }`}
    >
      {failed ? "操作失败，请检查输入和权限。" : "操作已提交，任务状态会持续更新。"}
    </div>
  );
}

/** 处理选择Workspace交互，维护必要状态并把副作用交给受控路由或后端 API。 */
function selectWorkspace(workspaces: Awaited<ReturnType<typeof getWorkspaces>>, requested?: string) {
  const requestedId = Number(requested);
  return workspaces.find((item) => item.workspace.id === requestedId) ?? workspaces[0] ?? null;
}

/** 格式化日期，统一空值、本地化和页面展示规则，避免各组件重复格式化。 */
function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

/** 转换显示名Agent，统一空值、本地化和页面展示规则，避免各组件重复格式化。 */
function humanizeAgent(key: string) {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
