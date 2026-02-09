# Onboarding UX Improvements Design

**Date:** 2026-02-08
**Status:** Approved
**Branch:** feat/onboarding

## Overview

Improve the onboarding flow UX with better navigation layout, keyboard handling, auto-focus for inputs, safe area support, and scrolling for long option lists.

## Problems Addressed

1. **No auto-focus** - Text/number inputs require manual tap to bring up keyboard
2. **Poor navigation layout** - Back and Next buttons share bottom space, not following mobile conventions
3. **Missing safe area** - Content can be covered by notches/home indicators
4. **No scrolling** - Questions with many options push buttons off screen
5. **No keyboard avoidance** - Keyboard covers inputs and action buttons

## Design Goals

- Follow iOS/Android navigation conventions (back at top, action at bottom)
- Auto-focus text/number inputs for faster completion
- Support devices with notches and home indicators
- Allow scrolling through long option lists
- Keep keyboard from covering inputs and buttons

---

## Layout Architecture

### Structure

```
┌─────────────────────────────┐
│  Safe Area Top              │
│  ┌───────────────────────┐  │
│  │ Back Button           │  │ ← Fixed Header
│  │ Progress Bar          │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ Question Text (fixed) │  │ ← Sticky Question
│  ├───────────────────────┤  │
│  │                       │  │
│  │   Scrollable Area     │  │ ← ScrollView
│  │   (inputs/options)    │  │
│  │                       │  │
│  │                       │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ Next/Finish Button    │  │ ← Fixed Footer
│  └───────────────────────┘  │
│  Safe Area Bottom           │
└─────────────────────────────┘
```

### Component Hierarchy

```typescript
<SafeAreaView style={{ flex: 1 }}>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <Header>
      {currentIndex > 0 && <BackButton />}
      <ProgressBar />
    </Header>

    <Content style={{ flex: 1 }}>
      <QuestionText /> {/* Fixed at top */}
      <ScrollView>
        <QuestionInput /> {/* Scrollable */}
      </ScrollView>
    </Content>

    <Footer>
      {isAnswered && <NextButton />}
    </Footer>
  </KeyboardAvoidingView>
</SafeAreaView>
```

### Key Changes

- **Three fixed zones:** Header, Content, Footer
- **SafeAreaView:** Respects notches and home indicators
- **KeyboardAvoidingView:** Prevents keyboard from covering content
- **ScrollView:** Allows scrolling through long option lists
- **Fixed question text:** Always visible while options scroll

---

## Auto-Focus for Text/Number Inputs

### Behavior

When a question of type `TEXT` or `NUMBER` is displayed, the input automatically receives focus and brings up the keyboard.

### Implementation

```typescript
// In OnboardingTextInput.tsx and OnboardingNumberInput.tsx
const inputRef = useRef<TextInput>(null);

useEffect(() => {
  // Small delay to ensure smooth transition from previous question
  const timer = setTimeout(() => {
    inputRef.current?.focus();
  }, 300);

  return () => clearTimeout(timer);
}, []);
```

### Edge Cases

- If user navigates backward to a text/number question, it auto-focuses again
- If user manually dismisses keyboard (swipe down), it stays dismissed until next question
- Auto-focus only happens once per question render (not on every state change)
- 300ms delay allows question card animation to complete before keyboard slides up

---

## Keyboard Avoidance Strategy

### Implementation

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={0}
>
  {/* Content */}
</KeyboardAvoidingView>
```

### How It Works

1. Question renders → input auto-focuses → keyboard slides up
2. `KeyboardAvoidingView` detects keyboard → adjusts layout padding
3. Footer button shifts up to sit above keyboard
4. User can scroll within the content area if needed
5. Tapping Next → saves answer → new question renders → process repeats

### Platform Differences

- **iOS:** Uses `padding` behavior to push content up
- **Android:** Uses `height` behavior (Android handles keyboard more automatically)

---

## Scrollable Options Area

### Structure

```typescript
<View style={{ flex: 1 }}>
  {/* Fixed question text - stays at top */}
  <View style={styles.questionHeader}>
    <QuestionText text={currentQuestion.questionText} />
  </View>

  {/* Scrollable options/input area */}
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingBottom: spacing.xl }}
    showsVerticalScrollIndicator={false}
  >
    <QuestionInput ... />
  </ScrollView>
</View>
```

### Key Behaviors

- `ScrollView` has `flex: 1` to take remaining space between header and footer
- Question text is outside the `ScrollView` in a fixed header
- Content padding bottom (`spacing.xl`) prevents last option from being cut off
- `showsVerticalScrollIndicator={false}` for cleaner aesthetic
- For text/number inputs, scroll isn't needed but structure stays consistent

### When Many Options Exist

- User can scroll through all options comfortably
- Footer button stays fixed at bottom (outside ScrollView)
- Question text remains visible at all times
- Scroll indicator hidden but scrolling works via touch gestures

---

## Header Design with Back Button

### Structure

```typescript
<View style={styles.header}>
  {/* Back button - only shows when currentIndex > 0 */}
  {currentIndex > 0 && (
    <TouchableOpacity
      onPress={handleBack}
      style={styles.backButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.backButtonText}>← Voltar</Text>
    </TouchableOpacity>
  )}

  {/* Progress bar */}
  <ProgressBar
    progress={progress}
    currentStep={answeredCount + 1}
    totalSteps={applicableQuestions.length}
  />
</View>
```

### Visual Hierarchy

```
┌─────────────────────────────┐
│ [Safe area top padding]     │
│ ← Voltar                    │  ← Simple text button
│                             │
│ ███████░░░░░░░ 7/12         │  ← Progress bar
│                             │
└─────────────────────────────┘
```

### Styling Changes

- Back button: Left-aligned, minimal styling (just text with arrow, no background/border)
- Progress bar: Full width below the back button
- Header padding: Safe area insets for top, plus standard horizontal padding
- Height: Auto-sized based on content
- Remove white background, border, and rounded corners from back button
- Simpler, less prominent styling (it's a secondary action)

---

## Footer Design with Action Button

### Structure

```typescript
<View style={styles.footer}>
  {isAnswered && !isLastQuestion && (
    <TouchableOpacity
      onPress={handleNext}
      style={styles.nextButton}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Próxima →</Text>
    </TouchableOpacity>
  )}

  {isAnswered && isLastQuestion && (
    <TouchableOpacity
      onPress={handleFinish}
      style={styles.finishButton}
      activeOpacity={0.7}
    >
      <Text style={styles.finishButtonText}>✓ Concluir</Text>
    </TouchableOpacity>
  )}
</View>
```

### Visual Layout

```
┌─────────────────────────────┐
│                             │
│   [Scrollable content]      │
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │    Próxima →            │ │  ← Full width button
│ └─────────────────────────┘ │
│ [Safe area bottom padding]  │
└─────────────────────────────┘
```

### Styling Details

- Footer: Fixed at bottom with safe area padding
- Full-width button with horizontal margins for breathing room
- Height: Auto-sized based on button + padding (~80-100px total)
- Button maintains existing rounded, shadowed style
- Same colors: primary blue for Next, success green for Finish

### Button Behavior

- Only appears when question is answered (unchanged logic)
- Switches between "Próxima →" and "✓ Concluir" on last question
- Button always in same position - predictable tap target
- Safe area padding ensures it's never behind home indicator/notch

---

## Dependencies

### Required Packages

```bash
npm install react-native-safe-area-context
```

This library is likely already installed (standard Expo dependency).

### Version Requirements

- React Native: 0.81.5+ (current)
- Expo: 54+ (current)
- react-native-safe-area-context: 4.x+

---

## Component Modifications

### Major Changes

**`OnboardingContainer.tsx`:**
- Split into Header/Content/Footer sections
- Wrap with `SafeAreaView` and `KeyboardAvoidingView`
- Move back button to header
- Add `ScrollView` in content area with fixed question text above it
- Move Next/Finish button to footer
- Update styles for new layout

### Minor Changes

**`OnboardingTextInput.tsx`:**
- Add `useRef` and auto-focus logic
- 300ms delay for smooth transition

**`OnboardingNumberInput.tsx`:**
- Add `useRef` and auto-focus logic
- 300ms delay for smooth transition

### No Changes Needed

- `QuestionCard.tsx` - animations still work
- `SingleChoiceCards.tsx` / `MultipleChoiceCards.tsx` - scrolling handled by parent
- `ProgressBar.tsx` - just moves to header
- Question flow logic and data layer - unchanged

---

## Testing Strategy

### Unit Tests

- Test text/number auto-focus on mount
- Test back button visibility logic (currentIndex > 0)
- Test button text switching (Próxima vs Concluir)
- Test scroll behavior with mocked long option lists

### Integration Tests

- Test complete flow with keyboard interactions
- Test navigation (back/next) with state preservation
- Test answer saving with keyboard dismissal

### Manual Testing Checklist

- [ ] Test text/number auto-focus on iOS and Android
- [ ] Test keyboard avoidance on iOS and Android
- [ ] Test scrolling with 10+ choice options
- [ ] Test safe area on devices with notches (iPhone 14+)
- [ ] Test safe area on devices with home indicators
- [ ] Test back button appearance/disappearance
- [ ] Test button positioning with keyboard open/closed
- [ ] Test landscape orientation (if supported)
- [ ] Test with accessibility settings (large text, voice over)

---

## Implementation Notes

### Order of Implementation

1. Install/verify `react-native-safe-area-context` dependency
2. Refactor `OnboardingContainer.tsx` layout (Header/Content/Footer)
3. Add auto-focus to text/number inputs
4. Update tests for new component structure
5. Manual testing on iOS and Android devices
6. Update CLAUDE.md documentation

### Migration Safety

- Existing answer data unchanged (database layer not affected)
- Question flow logic unchanged
- Only UI/UX layer changes
- Backwards compatible with existing onboarding state

### Performance Considerations

- Auto-focus delay (300ms) prevents animation jank
- ScrollView only renders visible options (React Native optimization)
- KeyboardAvoidingView built-in, no performance impact
- SafeAreaView negligible overhead

---

## Success Criteria

- ✅ Text/number inputs auto-focus on question render
- ✅ Back button appears at top when currentIndex > 0
- ✅ Next/Finish button fixed at bottom, always accessible
- ✅ Safe area properly respected on all devices
- ✅ Long option lists scroll without pushing buttons off screen
- ✅ Keyboard never covers inputs or action buttons
- ✅ All existing tests pass with updated component structure
- ✅ 90% test coverage maintained

---

## Future Enhancements (Out of Scope)

- Swipe gestures for next/back navigation
- Animated transitions between questions beyond current slide-in
- Voice input for text questions
- Progress persistence with visual indicators for completed questions
- Accessibility improvements (screen reader optimization, haptic feedback patterns)
