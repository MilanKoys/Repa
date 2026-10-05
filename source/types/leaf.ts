import type { UUID } from "crypto";

export interface Leaf {
  id: UUID;
  start: number;
  active: boolean;
}

export interface CreateLeaf {
  start: number;
}

export interface DeleteLeaf {
  id: UUID;
}
