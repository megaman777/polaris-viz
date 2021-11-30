import React from 'react';
import {mount} from '@shopify/react-testing';
import {scaleLinear} from 'd3-scale';

import {HorizontalBars, HorizontalBarsProps} from '../HorizontalBars';
import {Bar} from '../../Bar';
import {Label} from '../../Label';

jest.mock('d3-scale', () => ({
  scaleLinear: () => {
    function scale(value: any) {
      return value;
    }

    scale.ticks = () => [0, 1, 2];

    return scale;
  },
}));

jest.mock('../../../../../utilities/get-text-dimensions', () => ({
  getTextWidth: jest.fn(() => 100),
}));

const SERIES = [
  {rawValue: 5, label: 'Label 01'},
  {rawValue: 10, label: 'Label 02'},
  {rawValue: 12, label: 'Label 03'},
];

const MOCK_PROPS: HorizontalBarsProps = {
  ariaLabel: '',
  barHeight: 20,
  groupIndex: 1,
  id: 'id',
  isAnimated: false,
  isSimple: false,
  labelFormatter: (value) => `${value}`,
  name: 'Bar',
  series: SERIES,
  xScale: scaleLinear(),
  zeroPosition: 0,
};

describe('<HorizontalBars />', () => {
  it('renders g', () => {
    const chart = mount(
      <svg>
        <HorizontalBars {...MOCK_PROPS} />
      </svg>,
    );

    expect(chart).toContainReactComponent('g');
  });

  describe('isSimple', () => {
    it('renders <Label /> when true', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} isSimple />
        </svg>,
      );

      expect(chart).toContainReactComponent(Label);
    });

    it('does not render <Label /> when false', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} />
        </svg>,
      );

      expect(chart).not.toContainReactComponent(Label);
    });
  });

  describe('labelFormatter', () => {
    it('renders a formatted label when provided', () => {
      const chart = mount(
        <svg>
          <HorizontalBars
            {...MOCK_PROPS}
            isSimple
            labelFormatter={(value) => `${value}%`}
          />
        </svg>,
      );

      const label = chart.findAll(Label);

      expect(label[0].props.label).toStrictEqual('5%');
    });

    it('renders an unformatted label when not provided', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} isSimple />
        </svg>,
      );
      const label = chart.findAll(Label);

      expect(label[0].props.label).toStrictEqual('5');
    });
  });

  describe('<Bar />', () => {
    it('renders <Bar />', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} />
        </svg>,
      );

      expect(chart).toContainReactComponentTimes(Bar, 3);
    });

    it('applies width', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} />
        </svg>,
      );

      const bars = chart.findAll(Bar);

      expect(bars[0].props.width).toStrictEqual(5);
    });

    it('sets tabIndex to -1 for all items except the first', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} />
        </svg>,
      );

      const bars = chart.findAll(Bar);

      expect(bars[0].props.tabIndex).toStrictEqual(0);
      expect(bars[1].props.tabIndex).toStrictEqual(-1);
    });

    it('uses default color when no color provided', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} />
        </svg>,
      );

      const bars = chart.findAll(Bar);

      expect(bars[0].props.color).toStrictEqual('url(#Default-grad--0)');
    });

    it('uses custom color when provided', () => {
      const chart = mount(
        <svg>
          <HorizontalBars
            {...MOCK_PROPS}
            series={[{rawValue: 5, label: 'Label 01', color: 'red'}]}
          />
        </svg>,
      );

      const bars = chart.findAll(Bar);

      expect(bars[0].props.color).toStrictEqual('url(#id-series-1-0)');
    });
  });

  describe('<Label />', () => {
    it('is positioned for positive values', () => {
      const chart = mount(
        <svg>
          <HorizontalBars {...MOCK_PROPS} isSimple />
        </svg>,
      );

      const labels = chart.findAll(Label);

      expect(labels[0].props.x).toStrictEqual(15);
    });

    it('is positioned for negative values', () => {
      const chart = mount(
        <svg>
          <HorizontalBars
            {...MOCK_PROPS}
            isSimple
            series={[{rawValue: -5, label: 'Label 01'}]}
          />
        </svg>,
      );

      const labels = chart.findAll(Label);

      expect(labels[0].props.x).toStrictEqual(-115);
    });
  });
});
