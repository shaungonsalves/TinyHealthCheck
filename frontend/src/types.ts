export interface Status {
  up: boolean | null;
  latency: number | null;
  lastChecked: string | null;
}

export interface StatusMap {
  [url: string]: Status;
}

export interface StatusContextType {
  statuses: StatusMap;
  setStatuses: React.Dispatch<React.SetStateAction<StatusMap>>;
  error: string | null;
  setError: (error: string | null) => void;
  showError: (message: string | null) => void;
}