import type { Question } from '@/db/schema';
import { OnboardingTextInput } from './inputs/TextInput';
import { OnboardingNumberInput } from './inputs/NumberInput';
import { SingleChoiceCards } from './inputs/SingleChoiceCards';
import { MultipleChoiceCards } from './inputs/MultipleChoiceCards';

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  switch (question.type) {
    case 'TEXT':
      return (
        <OnboardingTextInput
          value={value ?? ''}
          onChange={onChange}
          placeholder="Digite sua resposta"
        />
      );

    case 'NUMBER':
      return (
        <OnboardingNumberInput
          value={value}
          onChange={onChange}
          placeholder="Digite um número"
        />
      );

    case 'SINGLE_CHOICE':
      return (
        <SingleChoiceCards
          choices={(question.metadata as any)?.choices ?? []}
          value={value}
          onChange={onChange}
        />
      );

    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoiceCards
          choices={(question.metadata as any)?.choices ?? []}
          value={value ?? []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}
