"use client";

import useSWR from "swr";
import { getReports } from "./service";

export function useReports(live = true) {
  return useSWR("roma:reports", getReports, {
    revalidateOnFocus: true,
    refreshInterval: live ? 5_000 : 0,
    keepPreviousData: true,
  });
}
