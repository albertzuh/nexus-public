/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
import React from 'react';
import axios from 'axios';

import {render, screen, waitForElementToBeRemoved, within} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {when} from 'jest-when';

import SystemInformation from './SystemInformation';
import TestUtils from '@sonatype/nexus-ui-plugin/src/frontend/src/interface/TestUtils';

const NESTED_SECTION = 'h3';
const NAME = '.nxrm-information--name';
const VALUE = '.nxrm-information--value';

jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('SystemInformation', () => {
  const data = {
    'nexus-status': {
      'status': 'value'
    },
    'nexus-node': {
      'node': 0
    },
    'nexus-configuration': {
      'enabled': true
    },
    'nexus-properties': {
      'property': false
    },
    'nexus-license': {
      'fingerprint': 'hash'
    },
    'nexus-bundles': {
      '0': {
        'bundleId': 0,
        'enabled': true,
        'config': 'value'
      }
    },
    'system-time': {
      'time': 'value'
    },
    'system-properties': {
      'property': 'value'
    },
    'system-environment': {
      'property': 'value'
    },
    'system-runtime': {
      'property': 'value'
    },
    'system-network': {
      'en0': {
        'enabled': true
      }
    },
    'system-filestores': {
      '/dev/null': {
        'path': '/dev/null'
      }
    }
  };

  it('renders correctly', async () => {
    when(axios.get).calledWith('/service/rest/atlas/system-information').mockResolvedValue({
      data
    });

    render(<SystemInformation/>);

    await waitForElementToBeRemoved(TestUtils.selectors.queryLoadingMask());

    for (let text in data) {
      expectSectionToMatch(text);
    }
  });

  function expectSectionToMatch(text) {
    const sectionTitle = screen.getByText(text);
    const section = within(sectionTitle.closest('.nx-tile-content'));
    expect(sectionTitle).toBeInTheDocument();

    for (let key in data[text]) {
      const isNested = typeof data[text][key] === 'object';
      if (isNested) {
        expect(section.getByText(key, {selector: NESTED_SECTION})).toBeInTheDocument();
        for (let nestedKey in data[text][key]) {
          expect(section.getByText(nestedKey, {selector: NAME})).toBeInTheDocument();
          expect(section.getByText(data[text][key][nestedKey], {selector: VALUE})).toBeInTheDocument();
        }
      }
      else {
        expect(section.getByText(key, {selector: NAME})).toBeInTheDocument();
        expect(section.getByText(data[text][key], {selector: VALUE})).toBeInTheDocument();
      }
    }
  }
});
