import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class AccessibilityHelper {
  constructor(private readonly page: Page) {}

  async expectNoViolations(): Promise<void> {
    const results = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      const summary = results.violations
        .map(v => `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`)
        .join('\n');
      throw new Error(`Accessibility violations found:\n${summary}`);
    }
  }

  async getViolations() {
    const results = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    return results.violations.map(v => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      nodes: v.nodes.length,
    }));
  }

  async expectNoViolationOfType(ruleId: string): Promise<void> {
    const violations = await this.getViolations();
    const match = violations.find(v => v.id === ruleId);
    if (match) throw new Error(`Found accessibility violation: ${ruleId}`);
  }
}
