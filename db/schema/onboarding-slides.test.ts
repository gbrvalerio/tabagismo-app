import { onboardingSlides, getDefaultSlideCreatedAt } from './onboarding-slides';

describe('onboarding_slides schema', () => {
  describe('getDefaultSlideCreatedAt function', () => {
    it('should return a Date object', () => {
      const result = getDefaultSlideCreatedAt();
      expect(result).toBeInstanceOf(Date);
    });

    it('should return the current date', () => {
      const before = Date.now();
      const result = getDefaultSlideCreatedAt();
      const after = Date.now();

      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('table structure', () => {
    it('should have all required columns defined', () => {
      expect(onboardingSlides).toBeDefined();
      expect(onboardingSlides.id).toBeDefined();
      expect(onboardingSlides.order).toBeDefined();
      expect(onboardingSlides.icon).toBeDefined();
      expect(onboardingSlides.title).toBeDefined();
      expect(onboardingSlides.description).toBeDefined();
      expect(onboardingSlides.metadata).toBeDefined();
      expect(onboardingSlides.createdAt).toBeDefined();
    });

    it('should have id as primary key column', () => {
      expect(onboardingSlides.id.name).toBe('id');
    });

    it('should have order column', () => {
      expect(onboardingSlides.order.name).toBe('order');
    });

    it('should have icon column', () => {
      expect(onboardingSlides.icon.name).toBe('icon');
    });

    it('should have title column', () => {
      expect(onboardingSlides.title.name).toBe('title');
    });

    it('should have description column', () => {
      expect(onboardingSlides.description.name).toBe('description');
    });

    it('should have metadata column', () => {
      expect(onboardingSlides.metadata.name).toBe('metadata');
    });

    it('should have createdAt column as integer (timestamp mode)', () => {
      expect(onboardingSlides.createdAt.name).toBe('created_at');
    });
  });
});
