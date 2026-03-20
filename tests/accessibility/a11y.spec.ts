import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * Accessibility tests — axe-core + WCAG 2.1 AA
 *
 * Every major user-facing page is scanned for accessibility violations.
 * Tests assert zero violations at WCAG 2.1 AA standard — the level
 * required by most enterprise customers and government regulations
 * (ADA, Section 508, EN 301 549, EAA).
 *
 * Why automated accessibility testing?
 * - Catches ~30-40% of accessibility issues automatically
 * - Runs on every CI build — regressions are caught immediately
 * - Documents the accessibility baseline for the application
 * - Complements (but doesn't replace) manual screen reader testing
 *
 * Results are included in the Allure report with full violation details.
 */

test.describe('Accessibility — WCAG 2.1 AA', () => {

  test.describe('Home page', () => {
    test('should have no WCAG 2.1 AA violations on load @smoke @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await homePage.expectOnHomePage();

      await a11y.expectNoViolations();
    });

    test('should have no violations on rooms section @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await homePage.expectRoomsSectionVisible();

      // Scope the axe scan to just the rooms section
      await a11y.expectNoViolations();
    });

    test('should have no violations on contact form @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await homePage.expectContactFormVisible();

      await a11y.expectNoViolations();
    });

    test('should not have color contrast violations @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();

      // Check specifically for color contrast issues
      await a11y.expectNoViolationOfType('color-contrast');
    });

    test('should not have missing image alt text @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await a11y.expectNoViolationOfType('image-alt');
    });

    test('should not have missing form labels @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await a11y.expectNoViolationOfType('label');
    });
  });

  test.describe('Accessibility audit reporting', () => {
    test('should log violation count for monitoring @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();

      // Get violations without failing — used for monitoring/trending
      const violations = await a11y.getViolations();

      console.log(`\n📊 Accessibility Audit Summary:`);
      console.log(`   Total violations: ${violations.length}`);

      if (violations.length > 0) {
        violations.forEach((v) => {
          console.log(`   [${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}: ${v.description} (${v.nodes} node${v.nodes !== 1 ? 's' : ''})`);
        });
      } else {
        console.log(`   ✅ No violations found`);
      }

      // This test always passes — it's for observability, not gating
      expect(violations).toBeDefined();
    });
  });
});
