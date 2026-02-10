import * as repositoriesExports from './index';
import * as settingsRepositoryExports from './settings.repository';
import * as questionsRepositoryExports from './questions.repository';
import * as coinTransactionsRepositoryExports from './coin-transactions.repository';
import * as onboardingSlidesRepositoryExports from './onboarding-slides.repository';

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

    it('should export questions repository hooks', () => {
      expect(repositoriesExports.useQuestions).toBeDefined();
      expect(repositoriesExports.useAnswers).toBeDefined();
      expect(repositoriesExports.useSaveAnswer).toBeDefined();
      expect(repositoriesExports.useDeleteDependentAnswers).toBeDefined();
      expect(repositoriesExports.useDeleteAllAnswers).toBeDefined();
    });

    it('should export coin-transactions repository hooks', () => {
      expect(repositoriesExports.useUserCoins).toBeDefined();
      expect(repositoriesExports.useAwardCoins).toBeDefined();
      expect(repositoriesExports.useHasQuestionReward).toBeDefined();
      expect(repositoriesExports.useResetUserCoins).toBeDefined();
      expect(repositoriesExports.useUserCoinsFromTransactions).toBeDefined();
    });

    it('should have all exported functions from settings.repository', () => {
      const settingsExports = Object.keys(settingsRepositoryExports);
      const indexExports = Object.keys(repositoriesExports);

      settingsExports.forEach(exportName => {
        expect(indexExports).toContain(exportName);
      });
    });

    it('should export onboarding-slides repository hooks', () => {
      expect(repositoriesExports.useOnboardingSlides).toBeDefined();
      expect(typeof repositoriesExports.useOnboardingSlides).toBe('function');
    });

    it('should not export anything unexpected', () => {
      const expectedExports = [
        ...Object.keys(settingsRepositoryExports),
        ...Object.keys(questionsRepositoryExports),
        ...Object.keys(coinTransactionsRepositoryExports),
        ...Object.keys(onboardingSlidesRepositoryExports),
      ];
      const actualExports = Object.keys(repositoriesExports);

      actualExports.forEach(exportName => {
        expect(expectedExports).toContain(exportName);
      });
    });
  });
});
