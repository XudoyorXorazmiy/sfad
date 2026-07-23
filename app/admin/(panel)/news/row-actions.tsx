"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteArticle } from "./actions";

export function ArticleRowActions({
  id, title, slug,
}: {
  id: string; title: string; slug: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded p-1.5 hover:bg-neutral-100">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem nativeButton={false} render={<Link href={`/admin/news/${id}`} />}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Tahrirlash
          </DropdownMenuItem>
          <DropdownMenuItem
            nativeButton={false}
            render={<Link href={`/yangiliklar/${slug}?preview=1`} target="_blank" />}
          >
            <Eye className="mr-2 h-3.5 w-3.5" /> Ko'rib chiqish
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="mr-2 h-3.5 w-3.5" /> O'chirish
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Maqolani o'chirish</DialogTitle>
            <DialogDescription>«{title}» butunlay o'chiriladi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteArticle(id);
                  if (res.ok) {
                    toast.success("O'chirildi");
                    setConfirmOpen(false);
                    router.refresh();
                  } else toast.error(res.error);
                })
              }
            >
              {pending ? "…" : "O'chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
