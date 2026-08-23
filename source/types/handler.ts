export interface HandlerResponse {
  write: (data: string) => void;
  json: (object: Object) => void;
  end: () => void;
}
