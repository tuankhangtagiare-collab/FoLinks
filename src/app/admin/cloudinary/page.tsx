"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderOpen,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  HardDrive,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface CloudAsset {
  id: string;
  publicId: string;
  url: string;
  folder: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  uploader: string;
}

interface FolderStat {
  name: string;
  count: number;
}

interface AdminMediaResponse {
  assets: CloudAsset[];
  stats: {
    totalImages: number;
    totalBytes: number;
    folders: FolderStat[];
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminMediaManagerPage() {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<AdminMediaResponse>({
    queryKey: ["admin-media-list", page, folder],
    queryFn: async () => {
      const res = await fetch(`/api/admin/cloudinary?page=${page}&folder=${folder}`);
      if (!res.ok) throw new Error("Failed to load media assets");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (publicId: string) => {
      const res = await fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete asset");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media-list"] });
    },
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Thư viện ảnh (Media Manager)</h2>
          <p className="text-slate-500 dark:text-slate-400">Xem dung lượng lưu trữ Cloudinary, quản lý thư mục và xóa ảnh rác.</p>
        </div>

        <select
          value={folder}
          onChange={(e) => {
            setFolder(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none"
        >
          <option value="ALL">Tất cả thư mục</option>
          <option value="avatars">avatars/</option>
          <option value="backgrounds">backgrounds/</option>
          <option value="banners">banners/</option>
          <option value="logos">logos/</option>
          <option value="ads">ads/</option>
          <option value="proofs">proofs/</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      ) : error || !data ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed rounded-xl p-8">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-sm font-semibold text-red-650">Lỗi hệ thống khi tải thư viện media.</h3>
        </div>
      ) : (
        <>
          {/* Usage Stats widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Tổng số tệp</CardTitle>
                <ImageIcon className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.totalImages} tệp ảnh</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Tổng dung lượng sử dụng</CardTitle>
                <HardDrive className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(data.stats.totalBytes)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Thư mục hoạt động</CardTitle>
                <FolderOpen className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.folders.length} thư mục</div>
              </CardContent>
            </Card>
          </div>

          {/* Grid Layout files */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {data.assets.map((asset) => (
              <Card key={asset.id} className="group relative overflow-hidden flex flex-col justify-between">
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center border-b">
                  <img
                    src={asset.url}
                    alt={asset.publicId}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <span className="absolute bottom-1 left-1 text-[9px] bg-slate-900/60 px-1 py-0.5 rounded text-white font-semibold">
                    {asset.format.toUpperCase()}
                  </span>
                </div>
                <CardContent className="p-3 space-y-1">
                  <div className="text-xs font-semibold truncate" title={asset.publicId}>
                    {asset.publicId.split("/").pop()}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{formatBytes(asset.bytes)}</span>
                    <span>@{asset.uploader}</span>
                  </div>
                </CardContent>

                {/* Operations overlay */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xóa tệp ảnh này khỏi Cloudinary?")) {
                        deleteMutation.mutate(asset.publicId);
                      }
                    }}
                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 shadow-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl">
              <span className="text-xs text-slate-500">
                Hiển thị trang {data.pagination.page} trên {data.pagination.totalPages}
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
