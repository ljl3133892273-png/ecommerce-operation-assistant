import { Upload } from "lucide-react";

type PerformanceImportFormProps = {
  canEdit?: boolean;
  productId: number;
};

/** 渲染 PerformanceImportForm 组件，集中展示经营数据导入表单所需的数据、状态和操作入口。 */
export function PerformanceImportForm({ canEdit = true, productId }: PerformanceImportFormProps) {
  if (!canEdit) {
    // 只读账号隐藏上传入口；服务端 route 仍会携带 token 调后端，由后端最终鉴权。
    return (
      <div>
        <h2 className="text-base font-semibold text-ink">鎵归噺瀵煎叆鏁版嵁</h2>
        <p className="mt-2 rounded-card border border-warning/20 bg-warning-soft px-3 py-2 text-sm text-warning">
          当前账号为只读权限，不能导入 CSV。
        </p>
      </div>
    );
  }

  return (
    <form
      action={`/products/${productId}/performance-records/import`}
      method="post"
      encType="multipart/form-data"
      className="space-y-4"
    >
      {/* CSV 上传走服务端 action，由 route 解析表格并转发给后端 bulk API，避免在客户端持有鉴权细节。 */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-card bg-info text-white">
          <Upload className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">批量导入数据</h2>
          <p className="text-sm text-ink-muted">上传 CSV，一次导入多天或多素材的投放表现</p>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-ink-muted">CSV 文件</span>
        <input
          name="csv_file"
          required
          type="file"
          accept=".csv,text/csv"
          className="mt-2 block w-full rounded-card border border-line bg-surface shadow-card px-3 py-2 text-sm text-ink file:mr-3 file:rounded-card file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
      </label>

      <div className="rounded-card border border-line bg-surface shadow-card-muted px-3 py-3 text-xs leading-5 text-ink-muted">
        <p className="font-medium text-ink-muted">表头示例</p>
        <p className="mt-1 break-all">
          period_start, period_end, creative_plan_id, promotion_link_id, generated_asset_id, impressions, clicks, conversions, spend, revenue, notes
        </p>
      </div>

      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-card bg-brand px-4 text-sm font-semibold text-white transition hover:bg-brand-hover"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        导入 CSV
      </button>
    </form>
  );
}
