import type { Question } from '@/db/schema';
import { OnboardingTextInput } from './inputs/TextInput';
import { OnboardingNumberInput } from './inputs/NumberInput';
import { SingleChoiceCards } from './inputs/SingleChoiceCards';
import { MultipleChoiceCards } from './inputs/MultipleChoiceCards';

type QuestionValue = string | number | string[] | null;

interface QuestionMetadata {
  choices?: string[];
}

interface QuestionInputProps {
  question: Question;
  value: QuestionValue;
  onChange: (value: QuestionValue) => void;
}

export function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const metadata = question.metadata as QuestionMetadata | null;

  switch (question.type) {
    case 'TEXT':
      return (
        <OnboardingTextInput
          value={(value as string) ?? ''}
          onChange={onChange}
          placeholder="Digite sua resposta"
        />
      );

    case 'NUMBER':
      return (
        <OnboardingNumberInput
          value={value as number | null}
          onChange={onChange}
          placeholder="Digite um número"
        />
      );

    case 'SINGLE_CHOICE':
      return (
        <SingleChoiceCards
          choices={metadata?.choices ?? []}
          value={value as string | null}
          onChange={onChange}
        />
      );

    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoiceCards
          choices={metadata?.choices ?? []}
          value={(value as string[]) ?? []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}
