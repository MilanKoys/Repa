import { API_URL } from "../constants/api.js";

type Undefined<T> = undefined | T;
type Nullable<T> = null | T;

interface ActiveLeaf {
  season: Nullable<Leaf>;
}

interface Leaf {
  id: string;
  active: boolean;
  start: number;
}

const DEFAULT_WEEK: number = 1;
const WEEK_ADDED: number = 1;
const WEEK_MILLISECONDS: number = 604800000;
const BASE_COUNT_INDEX: number = 0;

const ACTIVE_SEASON_PATH: string = "/season/active";

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

  public static inject() {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService();
    }

    return AttendanceService.instance;
  }
}
