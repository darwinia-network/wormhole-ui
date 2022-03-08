import { useTranslation } from 'react-i18next';
import { CrossChainPayload } from '../../model';
import { IDescription } from '../widget/IDescription';

export function ApproveConfirm({ value }: { value: CrossChainPayload<{ sender: string }> }) {
  const { t } = useTranslation();

  return (
    <IDescription
      title={
        <span className="capitalize">{t('{{network}} Network Address', { network: value.direction.from?.name })}</span>
      }
      content={value.sender}
    ></IDescription>
  );
}