import { ModalProps, message } from 'antd';
import { FunctionComponent, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Unit } from 'web3-utils';
import { useHistory } from 'react-router-dom';
import { Path } from '../config/constant';
import { CrossChainPayload, Tx, TxHashType, TxSuccessComponentProps } from '../model';
import { TxContext, TxCtx } from '../providers';
import { applyModal, convertToSS58, genHistoryRouteParams, getNetworkMode, isEthereumNetwork } from '../utils';
import { useApi } from './api';

export const useTx = () => useContext(TxContext) as Exclude<TxCtx, null>;

export function useAfterTx<T extends CrossChainPayload<{ sender: string; recipient?: string }>>() {
  const { t } = useTranslation();
  const history = useHistory();
  const { chain } = useApi();

  const afterCrossChain = useCallback(
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: FunctionComponent<TxSuccessComponentProps<CrossChainPayload<any>>>,
        {
          onDisappear,
          unit,
          hashType = 'txHash',
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
          unit?: Unit;
        }
      ) =>
      (value: T) =>
      (tx: Tx) =>
      () => {
        const { destroy } = applyModal({
          content: <Comp tx={tx} value={value} hashType={hashType} unit={unit} />,
          okText: t('Cross-chain history'),
          okButtonProps: {
            size: 'large',
            onClick: () => {
              destroy();

              const { from, to } = value.direction;
              const fMode = getNetworkMode(from);
              const sender =
                isEthereumNetwork(value.direction.from.name) || fMode === 'dvm'
                  ? value.sender
                  : convertToSS58(value.sender, +chain.ss58Format);

              history.push(
                Path.history +
                  '?' +
                  genHistoryRouteParams({
                    from: from.name,
                    fMode,
                    sender,
                    to: to.name,
                    tMode: getNetworkMode(to),
                  })
              );
            },
          },
          onCancel: (close) => {
            onDisappear(value, tx);
            close();
          },
        });
      },
    [chain.ss58Format, history, t]
  );

  const afterApprove = useCallback(
    (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Comp: FunctionComponent<TxSuccessComponentProps<CrossChainPayload<any>>>,
        {
          onDisappear,
          unit,
          hashType = 'txHash',
        }: Exclude<ModalProps, 'onCancel'> & {
          onDisappear: (value: T, tx: Tx) => void;
          hashType?: TxHashType;
          unit?: Unit;
        }
      ) =>
      (value: T) =>
      (tx: Tx) =>
      () => {
        message.success({
          content: <Comp tx={tx} value={value} hashType={hashType} unit={unit} />,
          onClose: onDisappear,
        });
      },
    []
  );

  return { afterCrossChain, afterApprove };
}
