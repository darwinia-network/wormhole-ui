import { EllipsisOutlined } from '@ant-design/icons';
import { Affix, Button, Dropdown, Layout, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, Route, Switch } from 'react-router-dom';
import { Connection } from './components/Connection';
import { Language } from './components/Language';
import { ThemeSwitch } from './components/ThemeSwitch';
import { THEME } from './config';
import { Path, routes } from './config/routes';
import { useApi } from './hooks';

const { Header, Content } = Layout;

function App() {
  const { t } = useTranslation();
  const { isDev, enableTestNetworks, setEnableTestNetworks } = useApi();
  const net = 'pangolin';

  return (
    <Layout style={{ height: '100vh' }} className="overflow-scroll">
      <Affix offsetTop={1}>
        <Header className="flex items-center justify-between sm:px-8 px-1" style={{ marginTop: -1 }}>
          <div className="flex items-center gap-4">
            <Link to={Path.root}>
              <img src="/image/logo.png" alt="" className="h-6" />
            </Link>
            <span className="text-white text-md">{t('Cross-chain transfer')}</span>
          </div>

          <div className="flex justify-end items-center flex-1 md:pl-8">
            <Connection />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="guide" onClick={() => window.open('', '_blank')}>
                    {t('User Guide')}
                  </Menu.Item>
                  <Menu.Item key="faq" onClick={() => window.open('', '_blank')}>
                    {t('FAQ')}
                  </Menu.Item>
                  <Menu.Item key="submit" onClick={() => window.open('', '_blank')}>
                    {t('Submit Your Token')}
                  </Menu.Item>
                  {!isDev && (
                    <Menu.Item key="tests" onClick={() => setEnableTestNetworks(!enableTestNetworks)}>
                      {t('{{enable}} Test Network', { enable: enableTestNetworks ? 'Disable' : 'Enable' })}
                    </Menu.Item>
                  )}
                  <Menu.Item key="claim">
                    <Button type="primary">{t('Claim Airdrop')}</Button>
                  </Menu.Item>
                </Menu>
              }
            >
              <EllipsisOutlined
                className="text-4xl"
                style={{
                  // color: (net && NETWORK_LIGHT_THEME[net]['@project-main-bg']) || 'inherit',
                  color: '#fff',
                }}
              />
            </Dropdown>

            <ThemeSwitch network={net} defaultTheme={THEME.DARK} />
          </div>
        </Header>
      </Affix>

      <Content className="sm:px-16 sm:py-8 px-2 py-1">
        <Switch>
          {routes.map((item, index) => (
            <Route key={index} {...item}></Route>
          ))}
        </Switch>
        <Language className="fixed bottom-8 right-8" network={net} />
      </Content>
    </Layout>
  );
}

export default App;
