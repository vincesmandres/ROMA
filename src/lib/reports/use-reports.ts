"use client";

import useSWR from "swr";
import { getReports } from "./service";

export function useReports() {
  return useSWR("roma:reports", getReports, {
    revalidateOnFocus: true,
    refreshInterval: 60_000,
    keepPreviousData: true,
  });
}
