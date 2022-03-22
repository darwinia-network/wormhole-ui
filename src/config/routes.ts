import { RouteProps } from 'react-router-dom';
import { Page404 } from '../components/widget/Page404';
import { Airdrop } from '../pages/Airdrop';
import { AirdropHistory } from '../pages/AirdropHistory';
import { Configure } from '../pages/Configure';
import { HistoryRecords } from '../pages/CrossHistory';
import { Dashboard } from '../pages/Dashboard';
import { Erc20Register } from '../pages/Erc20Register';
import { Explorer } from '../pages/Explorer';
import { Home } from '../pages/Home';
import { Path } from './constant';

export const routes: RouteProps[] = [
  {
    exact: true,
    path: Path.root,
    children: Home,
  },
  {
    exact: true,
    path: Path.history,
    children: HistoryRecords,
  },
  {
    exact: true,
    path: Path.airdrop,
    component: Airdrop,
  },
  {
    exact: true,
    path: Path.airdropHistory,
    children: AirdropHistory,
  },
  {
    exact: true,
    path: Path.register,
    component: Erc20Register,
  },
  {
    exact: true,
    path: Path.configure,
    children: Configure,
  },
  {
    exact: true,
    path: Path.dashboard,
    children: Dashboard,
  },
  {
    exact: true,
    path: Path.explorer,
    children: Explorer,
  },
  {
    path: '*',
    children: Page404,
  },
];
