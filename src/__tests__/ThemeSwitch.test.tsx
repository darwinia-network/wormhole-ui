import React, { Suspense } from 'react';
import { mount } from '@cypress/react';
import { ThemeSwitch } from '../components/ThemeSwitch';
import '../index.scss';
import '../theme/antd/index.less';
import { THEME } from '../config';

describe('render', () => {
  before(() => {
    window.less = {
      modifyVars: () => {
        return Promise.resolve();
      },
    };

    cy.document().then(() => {
      const element = document.createElement('script');

      element.src = 'https://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.2/less.min.js';
      element.type = 'text/javascript';

      const body = document.getElementsByTagName('body')[0];
      body.appendChild(element);
    });
  });

  it('should render the language switch with network color', () => {
    mount(
      <Suspense fallback="loading">
        <ThemeSwitch network="pangolin" defaultTheme={THEME.DARK} />
      </Suspense>
    );

    cy.get('.ant-switch-checked').should('be.visible');
  });
});
