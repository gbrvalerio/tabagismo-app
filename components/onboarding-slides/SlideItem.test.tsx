import React from 'react';
import { render } from '@testing-library/react-native';
import { SlideItem } from './SlideItem';

describe('SlideItem', () => {
  it('should render title and description', () => {
    const { getByText } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Test Title"
        description="Test Description"
      />
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
  });

  it('should render benefits card when showBenefits is true', () => {
    const benefits = ['Benefit 1', 'Benefit 2', 'Benefit 3'];
    const { getByText, getByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-2.svg"
        title="Title"
        description="Description"
        showBenefits={true}
        benefits={benefits}
      />
    );

    expect(getByTestId('benefits-card')).toBeTruthy();
    expect(getByText('Benefit 1')).toBeTruthy();
    expect(getByText('Benefit 2')).toBeTruthy();
    expect(getByText('Benefit 3')).toBeTruthy();
  });

  it('should not render benefits when showBenefits is false', () => {
    const benefits = ['Benefit 1'];
    const { queryByText, queryByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
        showBenefits={false}
        benefits={benefits}
      />
    );

    expect(queryByTestId('benefits-card')).toBeNull();
    expect(queryByText('Benefit 1')).toBeNull();
  });

  it('should not render benefits when showBenefits is true but benefits is undefined', () => {
    const { queryByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
        showBenefits={true}
      />
    );

    expect(queryByTestId('benefits-card')).toBeNull();
  });

  it('should not render benefits when showBenefits is true but benefits is empty', () => {
    const { queryByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
        showBenefits={true}
        benefits={[]}
      />
    );

    expect(queryByTestId('benefits-card')).toBeNull();
  });

  it('should render icon placeholder', () => {
    const { getByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
      />
    );

    expect(getByTestId('icon-placeholder')).toBeTruthy();
  });

  it('should render checkmarks for each benefit', () => {
    const benefits = ['Benefit A', 'Benefit B'];
    const { getAllByText } = render(
      <SlideItem
        icon="@/assets/images/onboarding-2.svg"
        title="Title"
        description="Description"
        showBenefits={true}
        benefits={benefits}
      />
    );

    const checkmarks = getAllByText('✓');
    expect(checkmarks).toHaveLength(2);
  });

  it('should not render benefits when showBenefits is not provided', () => {
    const { queryByTestId } = render(
      <SlideItem
        icon="@/assets/images/onboarding-1.svg"
        title="Title"
        description="Description"
      />
    );

    expect(queryByTestId('benefits-card')).toBeNull();
  });
});
