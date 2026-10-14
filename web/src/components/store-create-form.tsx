import { Plus, Store as StoreIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { Field, controlClass } from "@/components/ui/field";
import { PLATFORMS } from "@/lib/constants";

/** 渲染 StoreCreateForm 组件，集中展示店铺创建表单所需的数据、状态和操作入口。 */
export function StoreCreateForm() {
  return (
    <form action="/stores/create" method="post" className="space-y-4">
      <SectionTitle
        icon={<StoreIcon className="h-5 w-5" aria-hidden="true" />}
        tone="brand"
        title="新建店铺"
        description="为多平台商品、SKU 和库存建立归属"
      />

      <Field label="店铺名称">
        <input name="name" required className={controlClass} placeholder="例如：抖音旗舰店" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="平台">
          <select name="platform" defaultValue="douyin" className={controlClass}>
            {PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="负责人">
          <input name="owner_name" className={controlClass} placeholder="运营负责人" />
        </Field>
      </div>

      <Button type="submit" size="lg" className="w-full">
        <Plus className="h-4 w-4" aria-hidden="true" />
        创建店铺
      </Button>
    </form>
  );
}
