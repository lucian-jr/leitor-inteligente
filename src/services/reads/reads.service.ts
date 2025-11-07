import { api } from '../api';
// import type { StreamItem } from './reads.types';

export async function getRfStream(antena: 1 | 2) {
  const res = await api.get('rf_stream', { params: { antena } });
  return res.data;
}

export async function assignRfids(payload: { chave_pix: number; rf_ids: string[] }) {
  const res = await api.post('rf_assign', payload);
  return res.data;
}

export async function returnCup(payload: { rf_id: string }) {
  const res = await api.post('rf_return', payload);
  return res.data;
}
