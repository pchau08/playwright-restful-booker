import { test, expect } from '../../src/fixtures/base.fixture';

/**
 * Accessibility tests — axe-core + WCAG 2.1 AA
 *
 * The Restful Booker platform has known accessibility violations
 * (color-contrast, missing labels, link-name issues).
 * These tests document the violations for awareness rather than
 * gating CI — this is a common pattern when testing third-party
 * or legacy applications you cannot modify.
 *
 * In a production codebase you own, these would be hard failures.
 */

test.describe('Accessibility — WCAG 2.1 AA', () => {

  test.describe('Home page', () => {
    test('should audit WCAG 2.1 AA violations on load @smoke @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await homePage.expectOnHomePage();

      const violations = await a11y.getViolations();
      console.log('Violations found: ' + violations.length);
      violations.forEach(v => console.log('  [' + v.impact + '] ' + v.id + ': ' + v.nodes + ' nodes'));
    });

    test('should audit violations on rooms section @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await homePage.expectRoomsSectionVisible();

      const violations = await a11y.getViolations();
      console.log('Rooms section violations: ' + violations.length);
      violations.forEach(v => console.log('  [' + v.impact + '] ' + v.id));
    });

    test('should audit violations on contact form @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await homePage.expectContactFormVisible();

      const violations = await a11y.getViolations();
      console.log('Contact form violations: ' + violations.length);
      violations.forEach(v => console.log('  [' + v.impact + '] ' + v.id));
    });

    test('should document color contrast violations @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      const violations = await a11y.getViolations();
      const colorContrast = violations.filter(v => v.id === 'color-contrast');
      console.log('Color contrast violations: ' + colorContrast.length);
    });

    test('should not have missing image alt text @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      await a11y.expectNoViolationOfType('image-alt');
    });

    test('should document missing form labels @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();
      const violations = await a11y.getViolations();
      const labels = violations.filter(v => v.id === 'label');
      console.log('Missing label violations: ' + labels.length);
    });
  });

  test.describe('Accessibility audit reporting', () => {
    test('should log violation count for monitoring @regression', async ({
      homePage,
      a11y,
    }) => {
      await homePage.navigate();

      const violations = await a11y.getViolations();

      console.log('\n Accessibility Audit Summary:');
      console.log('   Total violations: ' + violations.length);

      if (violations.length > 0) {
        violations.forEach(v => {
          console.log('   [' + (v.impact ? v.impact.toUpperCase() : 'UNKNOWN') + '] ' + v.id + ': ' + v.description + ' (' + v.nodes + ' node' + (v.nodes !== 1 ? 's' : '') + ')');
        });
      } else {
        console.log('    No violations found');
      }

      expect(violations).toBeDefined();
    });
  });
});
