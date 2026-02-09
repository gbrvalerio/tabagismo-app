import { db } from '../client';
import { onboardingSlides } from '../schema/onboarding-slides';
import type { NewOnboardingSlide } from '../schema/onboarding-slides';

export const onboardingSlidesData: NewOnboardingSlide[] = [
  {
    order: 1,
    icon: '@/assets/images/onboarding-1.svg',
    title: 'Parar de fumar é difícil sozinho',
    description:
      'Você não está sozinho. Milhares de pessoas enfrentam essa mesma batalha todos os dias.',
    metadata: null,
  },
  {
    order: 2,
    icon: '@/assets/images/onboarding-2.svg',
    title: 'Nós ajudamos você nessa jornada',
    description: 'Com ferramentas práticas e suporte personalizado:',
    metadata: JSON.stringify({
      showBenefits: true,
      benefits: [
        'Acompanhe seu progresso em tempo real',
        'Ganhe moedas e conquiste metas',
        'Receba lembretes motivacionais',
      ],
    }),
  },
  {
    order: 3,
    icon: '@/assets/images/onboarding-3.svg',
    title: 'Vamos começar juntos',
    description:
      'Responda algumas perguntas rápidas e inicie sua jornada livre do cigarro.',
    metadata: null,
  },
];

export async function seedOnboardingSlides() {
  await db.delete(onboardingSlides).execute();
  await db.insert(onboardingSlides).values(onboardingSlidesData);
  console.log(
    `[SEED] Inserted ${onboardingSlidesData.length} onboarding slides`
  );
}
