# Onboarding UX Improvements - iOS Manual Testing Plan

**Date:** 2026-02-08
**Task:** Task 8 - Manual Testing on iOS Simulator
**Status:** Environment Limitation - GUI Access Required
**Tester:** Claude Code Agent

---

## Environment Limitation

**Issue:** iOS Simulator requires GUI interaction to trigger the Metro bundler to load the app bundle. The current testing environment is running in CLI mode without direct access to the simulator's GUI.

**Evidence:**
- Simulator successfully booted: iPhone 17 Pro (F1FD81D4-4D38-45D2-A63B-592F44FD1AAD)
- Metro bundler started and waiting on http://localhost:8081
- App opening command executed: `Opening exp://192.168.2.16:8081 on iPhone 17 Pro`
- Bundle stuck in "Waiting" state - requires user interaction in simulator to proceed

**Recommendation:** Manual testing should be performed by a human tester with GUI access to the iOS Simulator.

---

## Test Plan for Human Tester

### Prerequisites

1. **Start the iOS Simulator:**
   ```bash
   npm run ios
   ```

2. **Device Selection:**
   - Use iPhone 14 or newer (iPhone 14, 14 Pro, 15, 15 Pro, 16, 17, etc.)
   - These devices have notch/Dynamic Island for proper SafeAreaView testing

3. **Reset Onboarding (if needed):**
   - If you've already completed onboarding, you'll need to reset it
   - Option 1: Delete and reinstall the app
   - Option 2: Clear app data via simulator settings
   - Option 3: Use developer menu to reset onboarding state

---

## Test Cases

### Test 1: SafeAreaView on Device with Notch

**Objective:** Verify that content respects safe areas on devices with notch/Dynamic Island

**Steps:**
1. Launch app on iPhone 14 or newer in simulator
2. Navigate to onboarding screen
3. Observe header area (top of screen)
4. Observe footer area (bottom of screen)

**Expected Results:**
- ✅ Header content is not hidden behind the notch/Dynamic Island
- ✅ Progress bar is fully visible below the status bar
- ✅ Footer button is not hidden behind the home indicator
- ✅ Footer button has adequate padding from bottom edge
- ✅ All content is within the safe area boundaries

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 2: Auto-Focus on Text Input

**Objective:** Verify that text input fields automatically receive focus with 300ms delay

**Steps:**
1. Navigate to the first onboarding question (should be a text input - "Qual é o seu nome?")
2. Observe the input field after question loads
3. Count approximately 300ms delay
4. Check if keyboard appears automatically
5. Verify cursor is visible in the input field

**Expected Results:**
- ✅ Input field receives focus after ~300ms delay
- ✅ Keyboard appears automatically (standard iOS keyboard)
- ✅ Cursor is visible and blinking in the input field
- ✅ User can immediately start typing without tapping the input

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 3: Auto-Focus on Number Input

**Objective:** Verify that number input fields automatically receive focus with numeric keyboard

**Steps:**
1. Navigate to a number input question (e.g., "Quantos anos você tem?")
2. Observe the input field after question loads
3. Count approximately 300ms delay
4. Check if numeric keyboard appears automatically
5. Verify cursor is visible in the input field

**Expected Results:**
- ✅ Input field receives focus after ~300ms delay
- ✅ Numeric keyboard appears automatically (iOS numeric keypad)
- ✅ Cursor is visible and blinking in the input field
- ✅ Keyboard only shows numbers and decimal point (no letters)

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 4: KeyboardAvoidingView Behavior

**Objective:** Verify that keyboard does not cover input fields or footer button

**Steps:**
1. Navigate to a text or number input question
2. Wait for keyboard to appear (auto-focus)
3. Observe the position of:
   - The input field
   - The question text
   - The footer button (if answered)
4. Try scrolling if needed

**Expected Results:**
- ✅ Input field is fully visible above the keyboard
- ✅ Question text remains visible at the top
- ✅ Footer button (if present) is visible above the keyboard
- ✅ No content is obscured by the keyboard
- ✅ Layout adjusts smoothly when keyboard appears
- ✅ Layout returns to normal when keyboard dismisses

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 5: ScrollView with Many Options

**Objective:** Verify that questions with many options scroll properly while keeping header/footer fixed

**Steps:**
1. Navigate to a SINGLE_CHOICE or MULTIPLE_CHOICE question with many options
   - Example: "Quais sintomas você sente?" (should have 10+ options)
2. Observe the question text at the top
3. Scroll through the option cards
4. Answer the question to reveal the footer button
5. Scroll while footer button is visible

**Expected Results:**
- ✅ Question text stays fixed at the top (does not scroll)
- ✅ Option cards scroll smoothly in the middle section
- ✅ Footer button stays fixed at the bottom (does not scroll)
- ✅ All options are accessible via scrolling
- ✅ No visual glitches during scroll
- ✅ Scroll indicators appear when content overflows

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 6: Back Button Navigation - Appearance

**Objective:** Verify that back button appears only when currentIndex > 0

**Steps:**
1. Start onboarding from the beginning (first question)
2. Observe the header area
3. Answer the first question
4. Tap "Próxima →" to move to second question
5. Observe the header area again

**Expected Results:**
- ✅ No back button on the first question (index 0)
- ✅ Back button "← Voltar" appears on the second question
- ✅ Back button is in the header area (top-left or top area)
- ✅ Back button is easily tappable with adequate hit area

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 7: Back Button Navigation - Functionality

**Objective:** Verify that back button navigates to previous question and preserves answers

**Steps:**
1. Navigate to the second question (ensure first question is answered)
2. Note the answer you gave to the first question
3. Optionally answer the second question
4. Tap the "← Voltar" button
5. Observe the first question screen
6. Check if your previous answer is still displayed

**Expected Results:**
- ✅ Back button navigates to the previous question
- ✅ Previous answer is preserved and displayed correctly
- ✅ Input field shows the saved answer
- ✅ Back button disappears on first question (index 0)
- ✅ Progress bar reflects correct position
- ✅ Can navigate forward again with "Próxima →"

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 8: Complete Flow - Next Button

**Objective:** Verify navigation through all questions using Next button

**Steps:**
1. Start onboarding from the beginning
2. Answer each question one by one
3. For each question:
   - Answer the question
   - Observe the "Próxima →" button appears
   - Tap the button to move to next question
4. Continue until the last question

**Expected Results:**
- ✅ "Próxima →" button appears only after answering each question
- ✅ "Próxima →" button is fixed at the bottom in footer area
- ✅ Button is always accessible (not hidden by keyboard or scroll)
- ✅ Navigation is smooth between questions
- ✅ Progress bar updates correctly
- ✅ Each question type (text, number, choice) works correctly

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 9: Complete Flow - Finish Button

**Objective:** Verify that finish button appears on last question and navigates to main tabs

**Steps:**
1. Navigate to the last onboarding question
2. Answer the last question
3. Observe the button that appears
4. Note the button text and color
5. Tap the finish button
6. Observe navigation behavior

**Expected Results:**
- ✅ "✓ Concluir" button appears instead of "Próxima →"
- ✅ Finish button has different visual style (green/success color)
- ✅ Finish button is fixed at the bottom in footer area
- ✅ Tapping finish button navigates to main tab screen
- ✅ User is taken to the default tab (likely home or dashboard)
- ✅ Onboarding is marked as complete (won't show again on restart)

**Pass/Fail:** _______

**Notes:** _______________________________________

---

### Test 10: Overall UX and Accessibility

**Objective:** Evaluate overall user experience and accessibility

**Steps:**
1. Complete entire onboarding flow from start to finish
2. Evaluate the following aspects:

**Expected Results:**
- ✅ Smooth transitions between questions
- ✅ No visual glitches or layout issues
- ✅ Text is readable (proper contrast, size, spacing)
- ✅ Touch targets are adequate size (minimum 44x44 points)
- ✅ Haptic feedback on selections (if applicable)
- ✅ Loading states are clear
- ✅ Error states are handled gracefully
- ✅ Consistent visual language throughout
- ✅ Animations are smooth (60fps)
- ✅ No performance issues or lag

**Pass/Fail:** _______

**Notes:** _______________________________________

---

## Additional Test Scenarios

### Edge Cases

1. **Rotate Device (if supported):**
   - Rotate simulator to landscape mode
   - Verify layout adapts correctly
   - Return to portrait mode

2. **Interrupt and Resume:**
   - Minimize app (Cmd+Shift+H)
   - Reopen app
   - Verify onboarding state is preserved

3. **Very Long Text Input:**
   - Enter very long name or text (50+ characters)
   - Verify input handles overflow correctly

4. **Rapid Navigation:**
   - Quickly answer and navigate through multiple questions
   - Verify no race conditions or state issues

5. **Network Interruption (if applicable):**
   - Disable network
   - Continue onboarding
   - Verify local-first behavior works

---

## Known Limitations

### Current Environment
- **CLI-only access:** Cannot interact with simulator GUI from current environment
- **Background process:** Metro bundler started but requires GUI interaction to load bundle
- **No screenshot capability:** Cannot capture screenshots for documentation

### For Future Testing
- Consider adding automated E2E tests using Detox or Maestro
- Create video recordings of manual testing sessions
- Use accessibility inspector to verify VoiceOver support

---

## Test Results Summary

**Testing Date:** _______
**Tester Name:** _______
**Device Used:** _______
**iOS Version:** _______

**Overall Pass/Fail:** _______

**Total Tests:** 10
**Passed:** _______
**Failed:** _______
**Blocked:** _______

### Issues Found

| Issue # | Severity | Description | Steps to Reproduce | Screenshot |
|---------|----------|-------------|-------------------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Recommendations

_______________________________________

---

## Sign-off

**Tester Signature:** _______________________
**Date:** _______________________
**Approved for Production:** Yes / No

---

## Next Steps

1. If all tests pass: Proceed to Task 9 (Android testing)
2. If issues found: Create bug tickets and prioritize fixes
3. If major issues: Consider rolling back changes
4. Update this document with actual test results and findings
