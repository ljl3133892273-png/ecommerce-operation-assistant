import { Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { Field, controlClass, textareaClass } from "@/components/ui/field";
import { PLATFORMS } from "@/lib/constants";
import type { Store } from "@/types";

type ProductCreateFormProps = {
  stores?: Store[];
};

/** 渲染 ProductCreateForm 组件，集中展示商品创建表单所需的数据、状态和操作入口。 */
export function ProductCreateForm({ stores = [] }: ProductCreateFormProps) {
  return (
    <form action="/products/create" method="post" className="space-y-5">
      <SectionTitle
        icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
        tone="success"
        title="新建单品"
        description="先把一个商品跑完整运营链路"
      />

      <Field label="商品名称">
        <input name="name" required className={controlClass} placeholder="例如：低糖燕麦饼干" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="所属店铺">
          <select name="store_id" className={controlClass}>
            <option value="">暂不绑定</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="平台">
          <select name="platform" defaultValue="douyin" className={controlClass}>
            {PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="类目">
          <input name="category" className={controlClass} placeholder="食品 / 家居 / 美妆" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="售价">
          <input name="price" className={controlClass} placeholder="29.90" inputMode="decimal" />
        </Field>

        <Field label="目标人群">
          <input name="target_audience" className={controlClass} placeholder="年轻上班族" />
        </Field>
      </div>

      <Field label="核心卖点">
        <textarea
          name="selling_points"
          className={textareaClass}
          placeholder="用逗号或换行分隔，例如：低糖、饱腹、独立包装"
        />
      </Field>

      <Button type="submit" size="lg" className="w-full">
        <Plus className="h-4 w-4" aria-hidden="true" />
        创建商品
      </Button>
    </form>
  );
}
