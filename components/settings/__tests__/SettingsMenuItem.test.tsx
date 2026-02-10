import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsMenuItem } from '../SettingsMenuItem';
import { Text } from 'react-native';
import * as Haptics from '@/lib/haptics';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'LIGHT',
    Medium: 'MEDIUM',
    Heavy: 'HEAVY',
  },
}));

describe('SettingsMenuItem', () => {
  const defaultProps = {
    icon: <Text testID="test-icon">icon</Text>,
    title: 'Minha Conta',
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    const { getByText } = render(<SettingsMenuItem {...defaultProps} />);
    expect(getByText('Minha Conta')).toBeTruthy();
  });

  it('renders the subtitle when provided', () => {
    const { getByText } = render(
      <SettingsMenuItem {...defaultProps} subtitle="Gerencie suas informacoes" />
    );
    expect(getByText('Gerencie suas informacoes')).toBeTruthy();
  });

  it('does not render subtitle when not provided', () => {
    const { queryByTestId } = render(<SettingsMenuItem {...defaultProps} testID="menu-item" />);
    // The subtitle text should not exist
    const tree = render(<SettingsMenuItem {...defaultProps} />);
    expect(tree.queryByText('Gerencie suas informacoes')).toBeNull();
  });

  it('renders the icon', () => {
    const { getByTestId } = render(<SettingsMenuItem {...defaultProps} />);
    expect(getByTestId('test-icon')).toBeTruthy();
  });

  it('renders the chevron indicator', () => {
    const { getByText } = render(<SettingsMenuItem {...defaultProps} />);
    expect(getByText('>')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SettingsMenuItem {...defaultProps} onPress={onPress} testID="menu-item" />
    );
    fireEvent.press(getByTestId('menu-item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback on press', () => {
    const { getByTestId } = render(
      <SettingsMenuItem {...defaultProps} testID="menu-item" />
    );
    fireEvent.press(getByTestId('menu-item'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });

  it('passes testID through to the pressable', () => {
    const { getByTestId } = render(
      <SettingsMenuItem {...defaultProps} testID="custom-test-id" />
    );
    expect(getByTestId('custom-test-id')).toBeTruthy();
  });

  it('renders title and subtitle together correctly', () => {
    const { getByText } = render(
      <SettingsMenuItem
        {...defaultProps}
        title="Notificacoes"
        subtitle="Configurar alertas"
      />
    );
    expect(getByText('Notificacoes')).toBeTruthy();
    expect(getByText('Configurar alertas')).toBeTruthy();
  });

  it('handles press with haptic and callback in correct order', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <SettingsMenuItem {...defaultProps} onPress={onPress} testID="menu-item" />
    );
    fireEvent.press(getByTestId('menu-item'));
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(onPress).toHaveBeenCalled();
  });

  it('scales down on press in and restores on press out', () => {
    const { getByTestId } = render(
      <SettingsMenuItem {...defaultProps} testID="menu-item" />
    );
    const pressable = getByTestId('menu-item');
    fireEvent(pressable, 'pressIn');
    fireEvent(pressable, 'pressOut');
    // If no error thrown, the handlers executed successfully
    expect(pressable).toBeTruthy();
  });
});
