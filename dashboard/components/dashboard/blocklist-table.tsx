"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { Blocklist } from "@/lib/types";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function BlocklistTable({ blocklists }: { blocklists: Blocklist[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("blocklists").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Site removed from blocklist");
      router.refresh();
    } catch (error) {
      const err = error as Error;
      console.error("Error deleting from blocklist:", error);
      toast.error(err.message || "Failed to remove site");
    } finally {
      setDeleting(null);
    }
  };

  if (blocklists.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No sites in blocklist yet. Add your first site to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Website</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Added</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blocklists.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <span>{item.site_url}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  item.category === "adult"
                    ? "destructive"
                    : item.category === "distraction"
                    ? "default"
                    : "secondary"
                }
              >
                {item.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-500 text-sm">
              {new Date(item.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
