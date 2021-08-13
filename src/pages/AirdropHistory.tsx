import { Card } from 'antd';
import { Trans } from 'react-i18next';
import { AirdropRecords } from '../components/records/AirdropRecords';

export function AirdropHistory() {
  return (
    <Card
      className="xl:w-1/3 lg:1/2 md:w-2/3 w-full mx-auto drop-shadow"
      style={{ maxWidth: 520, borderColor: 'transparent' }}
      title={<Trans>Airdrop History</Trans>}
    >
      <AirdropRecords from="darwinia" to="crab" />
    </Card>
  );
}