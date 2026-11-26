"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function NgMajorIssuesPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/ng_major_issues/form"); }, [router]);
  return null;
}
