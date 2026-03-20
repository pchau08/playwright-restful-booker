import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * AccessibilityHelper
 *
 * Wraps @axe-core/playwright to provide WCAG 2.1 AA accessibility
 * testing across all major pages.
 *
 * axe-core is the industry standard engine used by Deque, Google,
 * Microsoft, and most Fortune 500 QA teams. Integrating it into
 * Playwright is a differentiator that shows awareness of modern
 * QA practices beyond functional testing.
 */

export interface A11yViolation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
}

export class AccessibilityHelper {
  constructor(private readonly page: Page) {}

  /**
   * Run a full axe-core scan and return all violations.
   * Returns an empty array if the page is fully accessible.
   */
  async getViolations(options?: {
    tags?: string[];
    exclude?: string[];
  }): Promise<A11yViolation[]> {
    let builder = new AxeBuilder({ page: this.page });

    // Default to WCAG 2.1 AA — the most common compliance target
    const tags = options?.tags ?? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
    builder = builder.withTags(tags);

    if (options?.exclude) {
      for (const selector of options.exclude) {
        builder = builder.exclude(selector);
      }
    }

    const results = await builder.analyze();

    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    }));
  }

  /**
   * Assert zero violations. Throws with a formatted violation
   * report if any are found — much more useful than a raw assertion.
   */
  async expectNoViolations(options?: { tags?: string[]; exclude?: string[] }): Promise<void> {
    const violations = await this.getViolations(options);

    if (violations.length > 0) {
      const report = violations
        .map(
          (v) =>
            `  [${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}: ${v.description}\n` +
            `    Affects ${v.nodes} element(s) — ${v.helpUrl}`
        )
        .join('\n\n');

      throw new Error(
        `Found ${violations.length} accessibility violation(s):\n\n${report}`
      );
    }
  }

  /**
   * Get violations filtered by impact level.
   * Useful when you want to assert no critical/serious violations
   * while allowing minor/moderate ones during remediation.
   */
  async getCriticalViolations(): Promise<A11yViolation[]> {
    const all = await this.getViolations();
    return all.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  }

  /**
   * Scan a specific region of the page rather than the whole thing.
   */
  async getViolationsInRegion(selector: string): Promise<A11yViolation[]> {
    const results = await new AxeBuilder({ page: this.page })
      .include(selector)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    return results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    }));
  }
}
