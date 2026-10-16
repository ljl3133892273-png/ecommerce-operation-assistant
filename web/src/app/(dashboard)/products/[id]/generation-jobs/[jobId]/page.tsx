import { ExternalLink, RefreshCw } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState, Notice } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { getProduct } from "@/lib/api";
import type { GenerationJob } from "@/types";

type GenerationJobDetailPageProps = {
  params: Promise<{ id: string; jobId: string }>;
};

const jobStatusLabels: Record<GenerationJob["status"], string> = {
  failed: "失败",
  pending: "排队中",
  running: "生成中",
  succeeded: "已完成",
  cancelled: "已取消",
};

/** 任务状态 → Badge 语义，避免每个状态各写一套背景/文字色。 */
const jobStatusTones: Record<GenerationJob["status"], "neutral" | "warning" | "success" | "danger"> = {
  failed: "danger",
  pending: "neutral",
  running: "warning",
  succeeded: "success",
  cancelled: "neutral",
};

/** 渲染商品/生成任务jobs页面；在服务端加载业务数据，并把交互交给对应表单或客户端组件。 */
export default async function GenerationJobDetailPage({ params }: GenerationJobDetailPageProps) {
  const { id, jobId } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const job = product.generation_jobs.find((item) => item.id === Number(jobId));
  if (!job) {
    notFound();
  }

  const creativePlan = product.creative_plans.find((plan) => plan.id === job.creative_plan_id);
  const resultUrl = jobResultUrl(job);

  return (
    <PageShell
      width="narrow"
      header={
        <PageHeader
          breadcrumb={
            <Breadcrumb
              items={[
                { label: "工作台", href: "/" },
                { label: "商品池", href: "/#product-pool" },
                { label: product.name, href: `/products/${product.id}?tab=jobs` },
                { label: `任务 #${job.id}` },
              ]}
            />
          }
          eyebrow={product.name}
          title={`生成任务 #${job.id}`}
          actions={
            <Badge tone={jobStatusTones[job.status]} className="h-8 px-3">
              {jobStatusLabels[job.status]}
            </Badge>
          }
        />
      }
    >

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DetailMetric label="任务类型" value={job.kind === "video_asset" ? "视频生成" : "图片生成"} />
        <DetailMetric label="关联方案" value={creativePlan?.title ?? "未知方案"} />
        <DetailMetric label="开始时间" value={job.started_at ?? "未开始"} />
        <DetailMetric label="完成时间" value={job.finished_at ?? "未完成"} />
      </section>

      {job.error ? (
        job.status === "cancelled" ? (
          <Card>
            <h2 className="text-sm font-semibold text-ink">取消原因</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">{job.error}</p>
          </Card>
        ) : (
          <Notice tone="danger" className="flex-col">
            <h2 className="text-sm font-semibold">失败原因</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{job.error}</p>
            {/* 只有失败任务暴露重试入口；取消任务代表人工停止，不应该被误操作重新排队。 */}
            <form action={`/products/${product.id}/generation-jobs/${job.id}/retry`} method="post" className="mt-4">
              <input type="hidden" name="tab" value="jobs" />
              <button type="submit" className={buttonClass("primary", "md")}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                重试任务
              </button>
            </form>
          </Notice>
        )
      ) : null}

      {job.status === "pending" || job.status === "running" ? (
        <Card>
          <SectionTitle title="任务控制" description="取消后任务会停止排队或释放运行锁，不会继续生成素材。" />
          <form action={`/products/${product.id}/generation-jobs/${job.id}/cancel`} method="post" className="mt-4">
            <input type="hidden" name="tab" value="jobs" />
            <button type="submit" className={buttonClass("danger", "md")}>
              取消任务
            </button>
          </form>
        </Card>
      ) : null}

      {resultUrl ? (
        <Card>
          <SectionTitle
            title="生成结果"
            description={<span className="break-all text-xs">{resultUrl}</span>}
            actions={
              <a
                href={absoluteMediaUrl(resultUrl)}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("secondary", "md", "shrink-0")}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                打开结果
              </a>
            }
          />
          {job.kind === "video_asset" ? (
            <video
              src={absoluteMediaUrl(resultUrl)}
              controls
              className="mt-4 aspect-video w-full rounded-card bg-black object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={absoluteMediaUrl(resultUrl)}
              alt="生成结果"
              className="mt-4 max-h-[560px] w-full rounded-card object-contain"
            />
          )}
        </Card>
      ) : null}

      <JobEventTimeline job={job} />

      <section className="grid gap-4 lg:grid-cols-2">
        <JsonPanel title="任务结果 JSON" value={job.result} />
        <JsonPanel title="关联方案 JSON" value={creativePlan?.content ?? {}} />
      </section>
    </PageShell>
  );
}

/** 渲染 JobEventTimeline 组件，集中展示任务事件时间线所需的数据、状态和操作入口。 */
function JobEventTimeline({ job }: { job: GenerationJob }) {
  return (
    <Card>
      <SectionTitle
        title="任务事件"
        description="记录入队、开始、失败、重试和完成等生命周期节点"
        actions={<Badge tone="neutral" className="h-8 px-2.5">{job.events.length} 条</Badge>}
      />

      {job.events.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {job.events.map((event) => (
            <div key={event.id} className="rounded-card border border-line bg-surface shadow-card-muted px-3 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{generationJobEventLabel(event.event_type)}</p>
                  <p className="mt-1 text-xs text-ink-muted">{event.created_at}</p>
                </div>
                <Badge tone="neutral">
                  {event.status ? jobStatusLabels[event.status] : "无状态"}
                </Badge>
              </div>
              {event.message ? <p className="mt-2 text-sm leading-6 text-ink-muted">{event.message}</p> : null}
              {event.worker_id ? <p className="mt-1 text-xs text-ink-soft">worker: {event.worker_id}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState className="mt-4" description="暂无任务事件。新任务会在入队、执行和重试时写入事件。" />
      )}
    </Card>
  );
}

/** 渲染 DetailMetric 组件，集中展示详情指标所需的数据、状态和操作入口。 */
function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface shadow-card px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

/** 把生成任务任务事件状态映射为中文显示文本，保持页面口径一致。 */
function generationJobEventLabel(type: string): string {
  const labels: Record<string, string> = {
    failed: "执行失败",
    queued: "任务入队",
    retry_requested: "请求重试",
    retry_scheduled: "安排重试",
    started: "开始执行",
    succeeded: "执行成功",
    cancelled: "任务取消",
    timeout_checked: "超时检查",
  };
  return labels[type] ?? type;
}

/** 渲染 JsonPanel 组件，集中展示json面板所需的数据、状态和操作入口。 */
function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <pre className="mt-3 max-h-[420px] overflow-auto rounded-card bg-solid p-3 text-xs leading-5 text-white/90">
        {JSON.stringify(value, null, 2)}
      </pre>
    </Card>
  );
}

/** 任务结果URL，封装当前页面重复使用的转换或展示规则，并统一处理空值边界。 */
function jobResultUrl(job: GenerationJob): string | null {
  const value = job.result.url;
  // 生成结果可能来自不同 worker 或历史数据，详情页只认可明确的字符串 URL。
  return typeof value === "string" && value ? value : null;
}

/** 绝对地址媒体URL，封装当前页面重复使用的转换或展示规则，并统一处理空值边界。 */
function absoluteMediaUrl(url: string): string {
  // worker 可返回完整 URL 或后端媒体相对路径；展示层统一补齐 API 域名，不改写入库结果。
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}${url}`;
}
