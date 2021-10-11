import { Network } from './network';

export interface HistoryRouteParam {
  from: Network;
  sender: string;
  to: Network;
  fMode: 'native' | 'dvm';
  tMode: 'native' | 'dvm';
}
