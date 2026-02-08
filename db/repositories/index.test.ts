import * as repositoriesExports from './index';
import * as settingsRepositoryExports from './settings.repository';
import * as onboardingRepositoryExports from './onboarding.repository';
import * as usersRepositoryExports from './users.repository';

describe('db/repositories/index.ts', () => {
  describe('exports', () => {
    it('should export useOnboardingStatus from settings.repository', () => {
      expect(repositoriesExports.useOnboardingStatus).toBeDefined();
      expect(typeof repositoriesExports.useOnboardingStatus).toBe('function');
      expect(repositoriesExports.useOnboardingStatus).toBe(settingsRepositoryExports.useOnboardingStatus);
    });

    it('should export useCompleteOnboarding from settings.repository', () => {
      expect(repositoriesExports.useCompleteOnboarding).toBeDefined();
      expect(typeof repositoriesExports.useCompleteOnboarding).toBe('function');
      expect(repositoriesExports.useCompleteOnboarding).toBe(settingsRepositoryExports.useCompleteOnboarding);
    });

    it('should export onboarding repository hooks', () => {
      expect(repositoriesExports.useOnboardingQuestions).toBeDefined();
      expect(repositoriesExports.useOnboardingAnswers).toBeDefined();
      expect(repositoriesExports.useSaveAnswer).toBeDefined();
      expect(repositoriesExports.useDeleteDependentAnswers).toBeDefined();
    });

    it('should export users repository hooks', () => {
      expect(repositoriesExports.useUserCoins).toBeDefined();
      expect(repositoriesExports.useIncrementCoins).toBeDefined();
    });

    it('should have all exported functions from settings.repository', () => {
      const settingsExports = Object.keys(settingsRepositoryExports);
      const indexExports = Object.keys(repositoriesExports);

      settingsExports.forEach(exportName => {
        expect(indexExports).toContain(exportName);
      });
    });

    it('should have all exported functions from onboarding.repository', () => {
      const onboardingExports = Object.keys(onboardingRepositoryExports);
      const indexExports = Object.keys(repositoriesExports);

      onboardingExports.forEach(exportName => {
        expect(indexExports).toContain(exportName);
      });
    });

    it('should have all exported functions from users.repository', () => {
      const usersExports = Object.keys(usersRepositoryExports);
      const indexExports = Object.keys(repositoriesExports);

      usersExports.forEach(exportName => {
        expect(indexExports).toContain(exportName);
      });
    });

    it('should not export anything unexpected', () => {
      const expectedExports = [
        ...Object.keys(settingsRepositoryExports),
        ...Object.keys(onboardingRepositoryExports),
        ...Object.keys(usersRepositoryExports),
      ];
      const actualExports = Object.keys(repositoriesExports);

      actualExports.forEach(exportName => {
        expect(expectedExports).toContain(exportName);
      });
    });
  });
});
