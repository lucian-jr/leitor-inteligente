export type StreamItem = {
  id: number; antena: 1 | 2 | number; rf_id: string;
  chave_pix?: string | number | null;
};
export type StreamResponse = { status: number; message: string; data: StreamItem[]; };

export type ReturnRequest = { rf_id: string; return_id?: number }; // manter

export type AssignRequest = {
  chave_pix: number; // 1..4
  rf_ids: string[];
};
export type AssignResponse = {
  status: number;
  message: string;
  success: string[];
  conflicts: string[];
};

export type ReturnResponse = {
  status: number;
  message: string;
  chave_pix?: number | string;
};

export type HistoryResponse = {
  status: number;
  message: string;
};
