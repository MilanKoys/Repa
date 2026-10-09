import { API_URL } from "../constants/api.js";

type Undefined<T> = undefined | T;
type Nullable<T> = null | T;

export enum ReportStatus {
  Empty = "empty",
  Draft = "draft",
  Submitted = "submitted",
  Approved = "approved",
  Rejected = "rejected",
}

interface ActiveLeaf {
  season: Nullable<Leaf>;
}

interface Leaf {
  id: string;
  active: boolean;
  start: number;
}

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
  season: string;
  user: string;
  status: ReportStatus;
  comment?: string;
}

const POST_METHOD: string = "POST";

const DEFAULT_WEEK: number = 1;
const WEEK_ADDED: number = 1;
const WEEK_MILLISECONDS: number = 604800000;
const BASE_COUNT_INDEX: number = 0;

const ATTENDANCE_PATH: string = "/attendance";
const ACTIVE_SEASON_PATH: string = "/season/active";

const WEEK_HEADER: string = "week";

export class AttendanceService {
  private static instance: Undefined<AttendanceService>;

  private initialize: () => void = () => {};
  public initialized: Promise<void> = new Promise((resolve) => {
    this.initialize = resolve;
  });

  public leaf: Undefined<ActiveLeaf>;
  public weekAmount: number = DEFAULT_WEEK;

  private constructor() {
    this.fetchLeaf();
    this.calculateWeeks();
  }

  private async calculateWeeks() {
    await this.initialized;
    const leaf = this.leaf;
    if (!leaf || !leaf.season) return;

    const startTime: number = leaf.season.start;
    const currentTime: number = new Date().getTime();
    const timeElapsed: number = currentTime - startTime;
    const weekCountBase: number = timeElapsed / WEEK_MILLISECONDS + WEEK_ADDED;
    const weekCount: number = Math.round(weekCountBase);

    this.weekAmount = weekCount;
  }

  private async fetchLeaf(): Promise<ActiveLeaf> {
    const request: Response = await fetch(`${API_URL}${ACTIVE_SEASON_PATH}`);
    const leaf: ActiveLeaf = await request.json();
    this.leaf = leaf;
    this.initialize();
    return leaf;
  }

  public async saveRecord(week: number, rows: ReportRow[]) {
    const body = JSON.stringify({ week, rows });

    const response: Response = await fetch(ATTENDANCE_PATH, {
      method: POST_METHOD,
      body,
    });

    return response;
  }

  public async fetchRecord(week: number): Promise<Nullable<Report>> {
    const response: Response = await fetch(ATTENDANCE_PATH, {
      headers: { week: week.toString() },
    });

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }

  public static inject() {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }

    return AttendanceService.instance;
  }
}
