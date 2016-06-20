import { expect } from 'chai';
import * as sinon from 'sinon';
import '../../utils/test-utils/index';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as TestUtils from 'react-addons-test-utils';
import { EssenceMock, StageMock } from '../../../common/models/mocks';

import { $, Expression } from 'plywood';
import { BarChart } from './bar-chart';

describe('BarChart', () => {
  it.skip('adds the correct class', () => {
    var renderedComponent = TestUtils.renderIntoDocument(
      <BarChart
        clicker={null}
        essence={EssenceMock.wiki()}
        stage={StageMock.defaultA()}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
    expect((ReactDOM.findDOMNode(renderedComponent) as any).className, 'should contain class').to.contain('bar-chart');
  });

});
