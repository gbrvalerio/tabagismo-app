import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from './icon-symbol';

describe('IconSymbol', () => {
  describe('Rendering', () => {
    it('should render with required name prop', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" />);
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });

    it('should render with size prop', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={24} />);
      const icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.width).toBe(24);
      expect(icon.props.style.height).toBe(24);
    });

    it('should render with color prop', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" color="#FF0000" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.tintColor).toBe('#FF0000');
    });

    it('should render with both size and color props', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" size={28} color="#0000FF" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.width).toBe(28);
      expect(icon.props.style.height).toBe(28);
      expect(icon.props.style.tintColor).toBe('#0000FF');
    });
  });

  describe('Icon Name Variations', () => {
    it('should render with SF Symbol icon name', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" />);
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });

    it('should render with different SF Symbol icon names', () => {
      const iconNames = [
        'house.fill',
        'paperplane.fill',
        'gear',
        'person.fill',
        'heart',
        'star.fill',
      ];

      iconNames.forEach((name) => {
        const { getByTestId } = render(<IconSymbol name={name} />);
        expect(getByTestId('icon-symbol')).toBeTruthy();
      });
    });

    it('should handle icon names with dots', () => {
      const { getByTestId } = render(<IconSymbol name="icloud.and.arrow.down" />);
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });

    it('should handle simple icon names without modifiers', () => {
      const { getByTestId } = render(<IconSymbol name="gear" />);
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });
  });

  describe('Size Prop Variations', () => {
    it('should render with small size', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={16} />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(16);
      expect(icon.props.style.height).toBe(16);
    });

    it('should render with medium size', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={24} />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(24);
      expect(icon.props.style.height).toBe(24);
    });

    it('should render with large size', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={32} />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(32);
      expect(icon.props.style.height).toBe(32);
    });

    it('should render with extra large size', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={48} />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(48);
      expect(icon.props.style.height).toBe(48);
    });

    it('should not apply size styles when size prop is undefined', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBeUndefined();
      expect(icon.props.style.height).toBeUndefined();
    });
  });

  describe('Color Prop Variations', () => {
    it('should render with hex color', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" color="#FF0000" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.tintColor).toBe('#FF0000');
    });

    it('should render with rgb color', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" color="rgb(255, 0, 0)" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.tintColor).toBe('rgb(255, 0, 0)');
    });

    it('should render with named color', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" color="red" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.tintColor).toBe('red');
    });

    it('should render with different color values', () => {
      const colors = ['#000000', '#FFFFFF', '#00FF00', 'blue', 'transparent'];

      colors.forEach((color) => {
        const { getByTestId } = render(
          <IconSymbol name="house.fill" color={color} />
        );
        const icon = getByTestId('icon-symbol');
        expect(icon.props.style.tintColor).toBe(color);
      });
    });

    it('should not apply color styles when color prop is undefined', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.tintColor).toBeUndefined();
    });
  });

  describe('Prop Combinations', () => {
    it('should render with common tab bar icon usage pattern', () => {
      const { getByTestId } = render(
        <IconSymbol size={28} name="house.fill" color="#007AFF" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.width).toBe(28);
      expect(icon.props.style.height).toBe(28);
      expect(icon.props.style.tintColor).toBe('#007AFF');
    });

    it('should render with another common tab bar icon usage pattern', () => {
      const { getByTestId } = render(
        <IconSymbol size={28} name="paperplane.fill" color="#34C759" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.width).toBe(28);
      expect(icon.props.style.height).toBe(28);
      expect(icon.props.style.tintColor).toBe('#34C759');
    });

    it('should render with size and no color', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={20} />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(20);
      expect(icon.props.style.height).toBe(20);
      expect(icon.props.style.tintColor).toBeUndefined();
    });

    it('should render with color and no size', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" color="#007AFF" />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.tintColor).toBe('#007AFF');
      expect(icon.props.style.width).toBeUndefined();
      expect(icon.props.style.height).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should render with empty string name', () => {
      const { getByTestId } = render(<IconSymbol name="" />);
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });

    it('should render with numeric size of 0', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" size={0} />);
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(0);
      expect(icon.props.style.height).toBe(0);
    });

    it('should render with very large size number', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" size={999} />
      );
      const icon = getByTestId('icon-symbol');
      expect(icon.props.style.width).toBe(999);
      expect(icon.props.style.height).toBe(999);
    });

    it('should handle rapid prop changes', () => {
      const { rerender, getByTestId } = render(
        <IconSymbol name="house.fill" size={24} color="#FF0000" />
      );

      let icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.width).toBe(24);
      expect(icon.props.style.tintColor).toBe('#FF0000');

      rerender(<IconSymbol name="gear" size={32} color="#0000FF" />);

      icon = getByTestId('icon-symbol');
      expect(icon).toBeTruthy();
      expect(icon.props.style.width).toBe(32);
      expect(icon.props.style.tintColor).toBe('#0000FF');
    });
  });

  describe('Type Safety', () => {
    it('should accept required name prop', () => {
      const { getByTestId } = render(<IconSymbol name="house.fill" />);
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });

    it('should accept optional size prop as number', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" size={24} />
      );
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });

    it('should accept optional color prop as string', () => {
      const { getByTestId } = render(
        <IconSymbol name="house.fill" color="#FF0000" />
      );
      expect(getByTestId('icon-symbol')).toBeTruthy();
    });
  });
});
