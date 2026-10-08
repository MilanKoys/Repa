import type { ReportStatus } from "#enums";
import type { Undefined } from "@types";
import type { UUID } from "crypto";

export interface ReportRow {
  type: string;
  about: Undefined<string>;
  duration: number;
  comment?: string;
}

export interface CreateReport {
  rows: ReportRow[];
  week: number;
}

export interface Report {
  rows: ReportRow[];
  week: number;
  season: UUID;
  user: string;
  status: ReportStatus;
  comment?: string;
}
