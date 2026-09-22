import { describe, expect, it } from 'vitest';
import {
  conditionToVisualRules,
  visualRulesToCondition,
  explainCondition,
  simulateCondition,
  getResourceFields,
  SYSTEM_RESOURCES,
  PRESET_TEMPLATES,
} from './dataRuleConstants';

describe('dataRuleConstants', () => {
  it('defines known system resources with valid schema fields', () => {
    expect(SYSTEM_RESOURCES.length).toBeGreaterThanOrEqual(5);
    const orderFields = getResourceFields('order');
    expect(orderFields.map((f) => f.name)).toContain('currentOwnerId');
    expect(orderFields.map((f) => f.name)).toContain('amount');
  });

  describe('conditionToVisualRules', () => {
    it('handles empty or blank conditions as empty rules', () => {
      expect(conditionToVisualRules('')).toEqual({ combinator: 'AND', rules: [] });
      expect(conditionToVisualRules('{}')).toEqual({ combinator: 'AND', rules: [] });
    });

    it('parses single direct equality with context variable', () => {
      const json = JSON.stringify({ currentOwnerId: '${user.id}' });
      const res = conditionToVisualRules(json);
      expect(res).not.toBeNull();
      expect(res?.combinator).toBe('AND');
      expect(res?.rules).toHaveLength(1);
      expect(res?.rules[0].field).toBe('currentOwnerId');
      expect(res?.rules[0].operator).toBe('$eq');
      expect(res?.rules[0].valueType).toBe('variable');
      expect(res?.rules[0].value).toBe('${user.id}');
    });

    it('parses operator conditions like $lte or $in', () => {
      const json = JSON.stringify({
        departmentId: { $in: '${user.departmentIds}' },
        amount: { $lte: 5000 },
      });
      const res = conditionToVisualRules(json);
      expect(res).not.toBeNull();
      expect(res?.rules).toHaveLength(2);

      const deptRule = res?.rules.find((r) => r.field === 'departmentId');
      expect(deptRule?.operator).toBe('$in');
      expect(deptRule?.valueType).toBe('variable');

      const amountRule = res?.rules.find((r) => r.field === 'amount');
      expect(amountRule?.operator).toBe('$lte');
      expect(amountRule?.value).toBe('5000');
    });

    it('parses $or top-level grouping', () => {
      const json = JSON.stringify({
        $or: [{ currentOwnerId: '${user.id}' }, { purchaserId: '${user.id}' }],
      });
      const res = conditionToVisualRules(json);
      expect(res).not.toBeNull();
      expect(res?.combinator).toBe('OR');
      expect(res?.rules).toHaveLength(2);
      expect(res?.rules[0].field).toBe('currentOwnerId');
      expect(res?.rules[1].field).toBe('purchaserId');
    });

    it('returns null for invalid JSON or unsupported deeply nested objects', () => {
      expect(conditionToVisualRules('not a json')).toBeNull();
      expect(conditionToVisualRules(JSON.stringify([1, 2, 3]))).toBeNull();
    });
  });

  describe('visualRulesToCondition', () => {
    it('serializes AND rules into standard JSON', () => {
      const json = visualRulesToCondition({
        combinator: 'AND',
        rules: [
          {
            id: '1',
            field: 'currentOwnerId',
            operator: '$eq',
            valueType: 'variable',
            value: '${user.id}',
          },
          {
            id: '2',
            field: 'amount',
            operator: '$lte',
            valueType: 'constant',
            value: '100000',
          },
        ],
      });
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({
        currentOwnerId: '${user.id}',
        amount: { $lte: 100000 },
      });
    });

    it('serializes OR rules into $or array', () => {
      const json = visualRulesToCondition({
        combinator: 'OR',
        rules: [
          {
            id: '1',
            field: 'currentOwnerId',
            operator: '$eq',
            valueType: 'variable',
            value: '${user.id}',
          },
          {
            id: '2',
            field: 'purchaserId',
            operator: '$eq',
            valueType: 'variable',
            value: '${user.id}',
          },
        ],
      });
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({
        $or: [{ currentOwnerId: '${user.id}' }, { purchaserId: '${user.id}' }],
      });
    });

    it('returns empty json for blank rules', () => {
      expect(visualRulesToCondition({ combinator: 'AND', rules: [] })).toBe('{\n  \n}');
    });
  });

  describe('explainCondition', () => {
    it('explains empty condition as full access', () => {
      expect(explainCondition('{}')).toContain('全量开放');
    });

    it('explains owner equality condition in human-readable terms', () => {
      const explanation = explainCondition(
        JSON.stringify({ currentOwnerId: '${user.id}' }),
        'order'
      );
      expect(explanation).toContain('负责人 ID');
      expect(explanation).toContain('当前登录用户 ID');
    });

    it('explains $or condition clearly', () => {
      const explanation = explainCondition(
        JSON.stringify({
          $or: [{ currentOwnerId: '${user.id}' }, { purchaserId: '${user.id}' }],
        }),
        'order'
      );
      expect(explanation).toContain('满足以下任一条件');
      expect(explanation).toContain('负责人 ID');
      expect(explanation).toContain('购买者 ID');
    });
  });

  describe('simulateCondition', () => {
    it('replaces context variables with mock values', () => {
      const simulated = simulateCondition(
        JSON.stringify({
          currentOwnerId: '${user.id}',
          departmentId: { $in: '${user.departmentIds}' },
          status: 'PAID',
        }),
        {
          '${user.id}': 'test_user_1',
          '${user.departmentIds}': ['dept_a', 'dept_b'],
        }
      );

      expect(simulated).toEqual({
        currentOwnerId: 'test_user_1',
        departmentId: { $in: ['dept_a', 'dept_b'] },
        status: 'PAID',
      });
    });
  });

  describe('preset templates', () => {
    it('all preset templates have valid JSON conditions', () => {
      for (const t of PRESET_TEMPLATES) {
        expect(() => JSON.parse(t.condition)).not.toThrow();
      }
    });

    it('exposes public-pool access only as an explicit order template', () => {
      const template = PRESET_TEMPLATES.find((item) => item.name === '公海未认领订单');

      expect(template).toMatchObject({ resource: 'order' });
      expect(JSON.parse(template?.condition || '{}')).toEqual({ currentOwnerId: null });
    });
  });
});
