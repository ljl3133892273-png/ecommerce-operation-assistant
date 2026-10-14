import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { CenteredShell } from "@/components/ui/page-shell";
import { Card, IconTile } from "@/components/ui/card";
import { Notice } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Field, controlClass } from "@/components/ui/field";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** 渲染登录页面；在服务端加载业务数据，并把交互交给对应表单或客户端组件。 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <CenteredShell>
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <IconTile tone="solid" size="md">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </IconTile>
          <div>
            <p className="text-sm font-medium text-brand">Ecommerce Operation Assistant</p>
            <h1 className="text-xl font-semibold text-ink">登录工作台</h1>
          </div>
        </div>

        {error ? <Notice tone="danger" className="mt-5">邮箱或密码不正确，或者账号已停用。</Notice> : null}

        <form action="/login/submit" method="post" className="mt-6 space-y-4">
          <Field label="邮箱">
            <input name="email" type="email" required className={controlClass} placeholder="owner@example.com" />
          </Field>
          <Field label="密码">
            <input name="password" type="password" required className={controlClass} placeholder="输入密码" />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            登录
          </Button>
        </form>

        <Link href="/" className="mt-4 inline-flex text-sm text-ink-muted hover:text-ink">
          返回首页
        </Link>
      </Card>
    </CenteredShell>
  );
}
