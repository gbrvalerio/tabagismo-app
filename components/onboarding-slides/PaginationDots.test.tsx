import React from 'react';
import { render } from '@testing-library/react-native';
import { PaginationDots } from './PaginationDots';
import { colors } from '@/lib/theme/tokens';

describe('PaginationDots', () => {
  it('should render correct number of dots', () => {
    const { getAllByTestId } = render(
      <PaginationDots total={3} activeIndex={0} />
    );
    const dots = getAllByTestId('pagination-dot');
    expect(dots).toHaveLength(3);
  });

  it('should render different number of dots', () => {
    const { getAllByTestId } = render(
      <PaginationDots total={5} activeIndex={0} />
    );
    const dots = getAllByTestId('pagination-dot');
    expect(dots).toHaveLength(5);
  });

  it('should highlight active dot with primary color', () => {
    const { getAllByTestId } = render(
      <PaginationDots total={3} activeIndex={1} />
    );
    const dots = getAllByTestId('pagination-dot');
    expect(dots[1].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: colors.primary.base,
        }),
      ])
    );
  });

  it('should render inactive dots with gray color', () => {
    const { getAllByTestId } = render(
      <PaginationDots total={3} activeIndex={1} />
    );
    const dots = getAllByTestId('pagination-dot');
    expect(dots[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: colors.neutral.gray[300],
        }),
      ])
    );
    expect(dots[2].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: colors.neutral.gray[300],
        }),
      ])
    );
  });

  it('should highlight first dot when activeIndex is 0', () => {
    const { getAllByTestId } = render(
      <PaginationDots total={3} activeIndex={0} />
    );
    const dots = getAllByTestId('pagination-dot');
    expect(dots[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: colors.primary.base,
        }),
      ])
    );
    expect(dots[1].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: colors.neutral.gray[300],
        }),
      ])
    );
  });

  it('should highlight last dot when activeIndex is last', () => {
    const { getAllByTestId } = render(
      <PaginationDots total={3} activeIndex={2} />
    );
    const dots = getAllByTestId('pagination-dot');
    expect(dots[2].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: colors.primary.base,
        }),
      ])
    );
  });

  it('should render no dots when total is 0', () => {
    const { queryAllByTestId } = render(
      <PaginationDots total={0} activeIndex={0} />
    );
    const dots = queryAllByTestId('pagination-dot');
    expect(dots).toHaveLength(0);
  });
});
