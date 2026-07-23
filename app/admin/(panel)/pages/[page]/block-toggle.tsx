"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleBlock } from "../actions";

export function BlockToggle({
  page, blockKey, isActive,
}: {
  page: string; blockKey: string; isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex items-center gap-1.5 text-xs text-neutral-500">
      {isActive ? "Faol" : "Yashirin"}
      <Switch
        checked={isActive}
        disabled={pending}
        onCheckedChange={(v) =>
          startTransition(async () => {
            const res = await toggleBlock(page, blockKey, v);
            if (res.ok) router.refresh();
            else toast.error(res.error);
          })
        }
      />
    </label>
  );
}
