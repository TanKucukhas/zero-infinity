"use client";
import { useEffect, useState } from "react";
import { Chip, Tooltip } from "@mui/material";

type HealthResponse = { ok: boolean; source?: 'mock' | 'sqlite' | 'prod'; message?: string };

export default function DbBadge() {
  const [source, setSource] = useState<HealthResponse["source"] | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health/db").then(async (r) => {
      const data: HealthResponse = await r.json();
      if (mounted) setSource(data.source);
    }).catch(() => {
      if (mounted) setSource(undefined);
    });
    return () => { mounted = false; };
  }, []);

  let color: "default" | "success" | "info" | "warning" = "default";
  let label = "DB";
  if (source === 'mock') { color = 'warning'; label = 'Mock'; }
  else if (source === 'sqlite') { color = 'info'; label = 'SQLite'; }
  else if (source === 'prod') { color = 'success'; label = 'Prod'; }

  return (
    <Tooltip title="Active database source">
      <Chip size="small" color={color} label={label} variant={color === 'default' ? 'outlined' : 'filled'} />
    </Tooltip>
  );
}



