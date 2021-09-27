import React from 'react';
import {mount} from '@shopify/react-testing';
import {scaleLinear} from 'd3-scale';

import {shouldRoundScaleUp} from '../../../../utilities';
import {DEFAULT_MAX_Y} from '../../../../constants';
import {useYScale} from '../use-y-scale';

jest.mock('d3-scale', () => ({
  scaleLinear: jest.fn(() => {
    const scale = (value: any) => value;
    scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
    scale.range = (range: any) => (range ? scale : range);
    scale.domain = (domain: any) => (domain ? scale : domain);
    scale.nice = () => scale;
    scale.copy = () => scale;
    return scale;
  }),
}));

jest.mock('../../../../utilities', () => ({
  ...jest.requireActual('../../../../utilities'),
  shouldRoundScaleUp: jest.fn(() => true),
}));

const mockProps = {
  drawableHeight: 500,
  formatYAxisLabel: jest.fn(),
  integersOnly: false,
  data: [
    {rawValue: 1000, label: ''},
    {rawValue: -89, label: ''},
    {rawValue: 300, label: ''},
  ],
};

describe('useYScale', () => {
  afterEach(() => {
    (scaleLinear as jest.Mock).mockReset();
  });

  it("provides a best estimate number of ticks to d3's ticks utility to choose the ideal number of ticks", () => {
    const ticksSpy = jest.fn(() => [0, 25, 50]);
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = ticksSpy;
      scale.range = (range: any) => (range ? scale : range);
      scale.domain = (domain: any) => (domain ? scale : domain);
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    function TestComponent() {
      useYScale(mockProps);

      return null;
    }

    mount(<TestComponent />);

    expect(ticksSpy).toHaveBeenCalledWith(6);
  });

  it('creates a y scale with a domain corresponding to the minimum and maximum values in the data set', () => {
    let domainSpy = jest.fn();
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
      scale.range = (range: any) => (range ? scale : range);
      domainSpy = jest.fn((domain: any) => (domain ? scale : domain));
      scale.domain = domainSpy;
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    function TestComponent() {
      useYScale(mockProps);

      return null;
    }

    mount(<TestComponent />);

    expect(domainSpy).toHaveBeenCalledWith([-89, 1000]);
  });

  it('creates a y scale with 0 as the max value if all input values are negative', () => {
    let domainSpy = jest.fn();
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
      scale.range = (range: any) => (range ? scale : range);
      domainSpy = jest.fn((domain: any) => (domain ? scale : domain));
      scale.domain = domainSpy;
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    function TestComponent() {
      useYScale({
        ...mockProps,
        data: [
          {rawValue: -1000, label: 'test'},
          {rawValue: -89, label: 'test'},
          {rawValue: -300, label: 'test'},
        ],
      });

      return null;
    }

    mount(<TestComponent />);

    expect(domainSpy).toHaveBeenCalledWith([-1000, 0]);
  });

  it('creates a y scale with the domain maximum set to the default max y for a data set with all zero values', () => {
    let domainSpy = jest.fn();
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
      scale.range = (range: any) => (range ? scale : range);
      domainSpy = jest.fn((domain: any) => (domain ? scale : domain));
      scale.domain = domainSpy;
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    function TestComponent() {
      useYScale({
        ...mockProps,
        data: [
          {rawValue: 0, label: 'test'},
          {rawValue: 0, label: 'test'},
          {rawValue: 0, label: 'test'},
        ],
      });

      return null;
    }

    mount(<TestComponent />);

    expect(domainSpy).toHaveBeenCalledWith([0, DEFAULT_MAX_Y]);
  });

  it('creates a y scale with range equal to the drawable height', () => {
    let rangeSpy = jest.fn();
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
      rangeSpy = jest.fn((range: any) => (range ? scale : range));
      scale.range = rangeSpy;
      scale.domain = (domain: any) => (domain ? scale : domain);
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    function TestComponent() {
      useYScale({
        ...mockProps,
        drawableHeight: 250,
      });

      return null;
    }

    mount(<TestComponent />);

    expect(rangeSpy).toHaveBeenCalledWith([250, 0]);
  });

  it('formats the tick label using the provided formatYAxisLabel function', () => {
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = () => [50];
      scale.range = (range: any) => (range ? scale : range);
      scale.domain = (domain: any) => (domain ? scale : domain);
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    function TestComponent() {
      const {ticks} = useYScale({
        ...mockProps,
        formatYAxisLabel: jest.fn((value) => `Formatted value: ${value}`),
      });

      const {formattedValue} = ticks[0];

      return <p>{formattedValue}</p>;
    }

    const wrapper = mount(<TestComponent />);

    expect(wrapper).toContainReactText('Formatted value: 50');
  });

  it('does not update the domain if shouldRoundScaleUp is true', () => {
    let domainSpy = jest.fn();
    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
      scale.range = (range: any) => (range ? scale : range);
      domainSpy = jest.fn((domain: any) => (domain ? scale : domain));
      scale.domain = domainSpy;
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    (shouldRoundScaleUp as jest.Mock).mockImplementation(jest.fn(() => true));

    function TestComponent() {
      useYScale(mockProps);

      return null;
    }

    mount(<TestComponent />);

    // Check it's only called once
    expect(domainSpy).toHaveBeenCalledTimes(1);

    // Check it's called with the min and max data
    expect(domainSpy).toHaveBeenNthCalledWith(1, [-89, 1000]);
  });

  it('updates the domain is shouldRoundScaleUp is false', () => {
    let domainSpy = jest.fn();
    const firstTick = 50;

    (scaleLinear as jest.Mock).mockImplementation(() => {
      const scale = (value: any) => value;
      scale.ticks = () => [firstTick];
      scale.range = (range: any) => (range ? scale : range);
      domainSpy = jest.fn((domain: any) => (domain ? scale : domain));
      scale.domain = domainSpy;
      scale.nice = () => scale;
      scale.copy = () => scale;
      return scale;
    });

    (shouldRoundScaleUp as jest.Mock).mockImplementation(jest.fn(() => false));

    function TestComponent() {
      useYScale(mockProps);

      return null;
    }

    mount(<TestComponent />);

    // Check that it's called with the min and max data
    expect(domainSpy).toHaveBeenNthCalledWith(1, [-89, 1000]);

    // Check that it's called with the first tick and max data the second time
    expect(domainSpy).toHaveBeenNthCalledWith(2, [-89, 1000]);
  });

  describe('integersOnly', () => {
    it('only returns ticks for integers if true', () => {
      (scaleLinear as jest.Mock).mockImplementation(() => {
        const scale = (value: any) => value;
        scale.ticks = () => [0, 0.5, 1];
        scale.range = (range: any) => (range ? scale : range);
        scale.domain = (domain: any) => (domain ? scale : domain);
        scale.nice = () => scale;
        scale.copy = () => scale;
        return scale;
      });

      function TestComponent() {
        const {ticks} = useYScale({
          ...mockProps,
          integersOnly: true,
        });

        return <p>{ticks.map(({value}) => `${value.toString()}-`)}</p>;
      }

      const wrapper = mount(<TestComponent />);

      expect(wrapper).toContainReactText('0-1-');
    });

    it('rounds min domain down and max domain up to the nearest integer if true', () => {
      let domainSpy = jest.fn();
      (scaleLinear as jest.Mock).mockImplementation(() => {
        const scale = (value: any) => value;
        scale.ticks = (numTicks: number) => Array.from(Array(numTicks));
        scale.range = (range: any) => (range ? scale : range);
        domainSpy = jest.fn((domain: any) => (domain ? scale : domain));
        scale.domain = domainSpy;
        scale.nice = () => scale;
        scale.copy = () => scale;
        return scale;
      });

      function TestComponent() {
        useYScale({
          ...mockProps,
          integersOnly: true,
          data: [
            {rawValue: 0.1, label: 'test'},
            {rawValue: 0.9, label: 'test'},
          ],
        });

        return null;
      }

      mount(<TestComponent />);

      expect(domainSpy).toHaveBeenCalledWith([0, 1]);
    });
  });
});
