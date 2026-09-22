export interface ResourceField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'userRef' | 'deptRef';
  options?: Array<{ label: string; value: string }>;
  description?: string;
}

export interface ResourceDefinition {
  resource: string;
  label: string;
  description: string;
  fields: ResourceField[];
}

export interface ContextVariable {
  key: string;
  label: string;
  description: string;
  type: 'string' | 'array';
  example: string;
}

export interface OperatorDefinition {
  key: string;
  label: string;
  symbol: string;
  applicableTypes?: Array<ResourceField['type']>;
}

export interface PresetTemplate {
  name: string;
  description: string;
  resource?: string;
  condition: string;
  badgeColor?: string;
}

export interface VisualRuleItem {
  id: string;
  field: string;
  operator: string;
  valueType: 'variable' | 'constant';
  value: string;
}

export interface VisualConditionGroup {
  combinator: 'AND' | 'OR';
  rules: VisualRuleItem[];
}

export const SYSTEM_RESOURCES: ResourceDefinition[] = [
  {
    resource: 'order',
    label: '订单 (Order)',
    description: '交易订单、履约及权益记录',
    fields: [
      { name: 'currentOwnerId', label: '负责人 ID', type: 'userRef', description: '当前处理/跟进此订单的员工 ID' },
      { name: 'purchaserId', label: '购买者 ID', type: 'userRef', description: '发起下单或购买的企业/个人客户 ID' },
      { name: 'departmentId', label: '部门 ID', type: 'deptRef', description: '订单归属的业务部门' },
      { name: 'supplierId', label: '供货商 ID', type: 'string', description: '供应商或履约方 ID' },
      {
        name: 'status',
        label: '订单状态',
        type: 'enum',
        options: [
          { label: '待支付 (PENDING_PAYMENT)', value: 'PENDING_PAYMENT' },
          { label: '已支付 (PAID)', value: 'PAID' },
          { label: '已完成 (COMPLETED)', value: 'COMPLETED' },
          { label: '已取消 (CANCELLED)', value: 'CANCELLED' },
          { label: '已冻结 (FROZEN)', value: 'FROZEN' },
        ],
      },
      { name: 'amount', label: '订单金额', type: 'number', description: '订单总金额 (以元为单位)' },
      { name: 'currency', label: '币种', type: 'string', description: '货币类型如 CNY、USD' },
    ],
  },
  {
    resource: 'user',
    label: '用户 (User)',
    description: '企业员工、用户账号及档案',
    fields: [
      { name: 'id', label: '用户 ID', type: 'userRef' },
      { name: 'departmentId', label: '所属部门 ID', type: 'deptRef' },
      { name: 'role', label: '角色编码', type: 'string' },
      {
        name: 'status',
        label: '账号状态',
        type: 'enum',
        options: [
          { label: '正常 (ACTIVE)', value: 'ACTIVE' },
          { label: '禁用 (DISABLED)', value: 'DISABLED' },
        ],
      },
    ],
  },
  {
    resource: 'project',
    label: '项目 (Project)',
    description: '协同项目、研发交付及工单',
    fields: [
      { name: 'ownerId', label: '项目负责人 ID', type: 'userRef' },
      { name: 'departmentId', label: '归属部门 ID', type: 'deptRef' },
      {
        name: 'status',
        label: '项目状态',
        type: 'enum',
        options: [
          { label: '规划中 (PLANNING)', value: 'PLANNING' },
          { label: '进行中 (IN_PROGRESS)', value: 'IN_PROGRESS' },
          { label: '已完成 (COMPLETED)', value: 'COMPLETED' },
          { label: '已归档 (ARCHIVED)', value: 'ARCHIVED' },
        ],
      },
    ],
  },
  {
    resource: 'product',
    label: '商品/服务 (Product)',
    description: '商城商品、SKU 及标的物',
    fields: [
      { name: 'creatorId', label: '创建人 ID', type: 'userRef' },
      {
        name: 'status',
        label: '上架状态',
        type: 'enum',
        options: [
          { label: '已上架 (ON_SHELF)', value: 'ON_SHELF' },
          { label: '已下架 (OFF_SHELF)', value: 'OFF_SHELF' },
        ],
      },
    ],
  },
  {
    resource: 'minute',
    label: '会议纪要 (Minute)',
    description: '会议转写、纪要与待办事项',
    fields: [
      { name: 'creatorId', label: '发起人 ID', type: 'userRef' },
      { name: 'departmentId', label: '关联部门 ID', type: 'deptRef' },
      {
        name: 'privacyLevel',
        label: '保密级别',
        type: 'enum',
        options: [
          { label: '全员公开 (PUBLIC)', value: 'PUBLIC' },
          { label: '部门可见 (INTERNAL)', value: 'INTERNAL' },
          { label: '机密私有 (CONFIDENTIAL)', value: 'CONFIDENTIAL' },
        ],
      },
    ],
  },
];

export const CONTEXT_VARIABLES: ContextVariable[] = [
  {
    key: '${user.id}',
    label: '当前登录用户 ID',
    description: '运行时动态匹配当前操作人自身的 ID',
    type: 'string',
    example: 'usr_clq0a...',
  },
  {
    key: '${user.departmentId}',
    label: '当前用户所属部门 ID',
    description: '运行时动态匹配当前操作人所在的直属部门 ID',
    type: 'string',
    example: 'dept_dev_01',
  },
  {
    key: '${user.departmentIds}',
    label: '本部门及所有子部门 IDs',
    description: '包含当前用户直属部门及其下辖所有层级子部门的数组',
    type: 'array',
    example: '["dept_01", "dept_02"]',
  },
  {
    key: '${user.roles}',
    label: '当前用户所属角色列表',
    description: '当前用户被授予的所有角色标识列表',
    type: 'array',
    example: '["SALES", "MANAGER"]',
  },
  {
    key: '${user.companyId}',
    label: '当前企业/租户 ID',
    description: '当前登录人归属的企业机构编码',
    type: 'string',
    example: 'org_main',
  },
];

export const OPERATORS: OperatorDefinition[] = [
  { key: '$eq', label: '等于 (=)', symbol: '=' },
  { key: '$ne', label: '不等于 (≠)', symbol: '!=' },
  { key: '$in', label: '包含于 (IN)', symbol: 'IN' },
  { key: '$nin', label: '不包含于 (NOT IN)', symbol: 'NOT IN' },
  { key: '$gt', label: '大于 (>)', symbol: '>' },
  { key: '$gte', label: '大于等于 (≥)', symbol: '>=' },
  { key: '$lt', label: '小于 (<)', symbol: '<' },
  { key: '$lte', label: '小于等于 (≤)', symbol: '<=' },
  { key: 'isNull', label: '为空 (IS NULL)', symbol: 'IS NULL' },
  { key: 'isNotNull', label: '不为空 (NOT NULL)', symbol: 'IS NOT NULL' },
];

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    name: '全量开放 (无限制)',
    description: '允许访问此资源下的所有数据行',
    condition: '{\n  \n}',
    badgeColor: 'blue',
  },
  {
    name: '仅本人负责',
    description: '只能访问由当前操作人员负责的数据',
    condition: JSON.stringify({ currentOwnerId: '${user.id}' }, null, 2),
    badgeColor: 'green',
  },
  {
    name: '仅本人购买/创建',
    description: '只能访问当前操作人购买或创建的数据',
    condition: JSON.stringify({ purchaserId: '${user.id}' }, null, 2),
    badgeColor: 'cyan',
  },
  {
    name: '本部门数据',
    description: '仅能访问当前用户所属直属部门的数据',
    condition: JSON.stringify({ departmentId: '${user.departmentId}' }, null, 2),
    badgeColor: 'orange',
  },
  {
    name: '本部门及下级部门',
    description: '允许访问当前部门及其下属所有子部门的数据',
    condition: JSON.stringify({ departmentId: { $in: '${user.departmentIds}' } }, null, 2),
    badgeColor: 'purple',
  },
  {
    name: '金额限额 (<= 10万)',
    description: '仅能访问金额在 100,000 元及以下的订单',
    condition: JSON.stringify({ amount: { $lte: 100000 } }, null, 2),
    badgeColor: 'magenta',
  },
];

export function getResourceFields(resourceName?: string): ResourceField[] {
  if (!resourceName) return [];
  const found = SYSTEM_RESOURCES.find(
    (item) => item.resource.toLowerCase() === resourceName.trim().toLowerCase()
  );
  return found ? found.fields : [];
}

export function getFieldLabel(fieldKey: string, resourceName?: string): string {
  const fields = getResourceFields(resourceName);
  const found = fields.find((f) => f.name === fieldKey);
  return found ? `${found.label} (${found.name})` : fieldKey;
}

export function getVariableLabel(variableKey: string): string {
  const found = CONTEXT_VARIABLES.find((v) => v.key === variableKey);
  return found ? `${found.label} (${variableKey})` : variableKey;
}

export function getOperatorLabel(opKey: string): string {
  const found = OPERATORS.find((op) => op.key === opKey);
  return found ? found.label : opKey;
}

/**
 * Parses a condition JSON string into visual rule rows.
 * Returns null if the JSON is too deeply nested or cannot be mapped cleanly.
 */
export function conditionToVisualRules(conditionJson?: string): VisualConditionGroup | null {
  if (!conditionJson || !conditionJson.trim()) {
    return { combinator: 'AND', rules: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(conditionJson);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const obj = parsed as Record<string, any>;
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    return { combinator: 'AND', rules: [] };
  }

  // Check if top-level is $or or OR
  if (keys.length === 1 && (keys[0] === '$or' || keys[0] === 'OR') && Array.isArray(obj[keys[0]])) {
    const list = obj[keys[0]] as any[];
    const rules: VisualRuleItem[] = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (typeof item !== 'object' || item === null) return null;
      const subKeys = Object.keys(item);
      if (subKeys.length !== 1) return null;
      const field = subKeys[0];
      const parsedRule = parseSingleFieldCondition(field, item[field], `rule_or_${i}`);
      if (!parsedRule) return null;
      rules.push(parsedRule);
    }
    return { combinator: 'OR', rules };
  }

  // Check if top-level is $and or AND
  if (keys.length === 1 && (keys[0] === '$and' || keys[0] === 'AND') && Array.isArray(obj[keys[0]])) {
    const list = obj[keys[0]] as any[];
    const rules: VisualRuleItem[] = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (typeof item !== 'object' || item === null) return null;
      const subKeys = Object.keys(item);
      if (subKeys.length !== 1) return null;
      const field = subKeys[0];
      const parsedRule = parseSingleFieldCondition(field, item[field], `rule_and_${i}`);
      if (!parsedRule) return null;
      rules.push(parsedRule);
    }
    return { combinator: 'AND', rules };
  }

  // Top level standard object: { field1: val1, field2: { $lte: 100 } }
  const rules: VisualRuleItem[] = [];
  let index = 0;
  for (const field of keys) {
    if (field.startsWith('$')) {
      return null;
    }
    const val = obj[field];
    const parsedRule = parseSingleFieldCondition(field, val, `rule_${index++}`);
    if (!parsedRule) return null;
    rules.push(parsedRule);
  }

  return { combinator: 'AND', rules };
}

function parseSingleFieldCondition(field: string, val: any, id: string): VisualRuleItem | null {
  if (val === null) {
    return { id, field, operator: 'isNull', valueType: 'constant', value: '' };
  }

  if (typeof val === 'object' && !Array.isArray(val)) {
    const opKeys = Object.keys(val);
    if (opKeys.length !== 1) return null;
    const op = opKeys[0];
    const innerVal = val[op];

    if (op === '$ne' && innerVal === null) {
      return { id, field, operator: 'isNotNull', valueType: 'constant', value: '' };
    }

    const matchedOp = OPERATORS.find((o) => o.key === op || o.key === `$${op}`);
    const actualOp = matchedOp ? matchedOp.key : op;

    const valStr = typeof innerVal === 'string' ? innerVal : JSON.stringify(innerVal);
    const isVariable = CONTEXT_VARIABLES.some((v) => v.key === valStr);

    return {
      id,
      field,
      operator: actualOp,
      valueType: isVariable ? 'variable' : 'constant',
      value: valStr,
    };
  }

  // Primitive direct equality
  const valStr = typeof val === 'string' ? val : JSON.stringify(val);
  const isVariable = CONTEXT_VARIABLES.some((v) => v.key === valStr);

  return {
    id,
    field,
    operator: '$eq',
    valueType: isVariable ? 'variable' : 'constant',
    value: valStr,
  };
}

/**
 * Converts visual rule rows into formatted condition JSON.
 */
export function visualRulesToCondition(group: VisualConditionGroup): string {
  const validRules = group.rules.filter((r) => r.field && r.field.trim());
  if (validRules.length === 0) {
    return '{\n  \n}';
  }

  const buildSingleField = (r: VisualRuleItem): any => {
    let finalVal: any = r.value;
    if (r.operator === 'isNull') {
      return null;
    }
    if (r.operator === 'isNotNull') {
      return { $ne: null };
    }

    if (r.valueType === 'constant') {
      // Try to parse number or boolean if applicable
      if (finalVal === 'true') finalVal = true;
      else if (finalVal === 'false') finalVal = false;
      else if (finalVal !== '' && !Number.isNaN(Number(finalVal))) {
        finalVal = Number(finalVal);
      } else {
        // Try JSON parse if user typed array or object
        try {
          if (finalVal.startsWith('[') || finalVal.startsWith('{')) {
            finalVal = JSON.parse(finalVal);
          }
        } catch {
          // Keep as string
        }
      }
    }

    if (r.operator === '$eq') {
      return finalVal;
    }

    return { [r.operator]: finalVal };
  };

  if (group.combinator === 'OR') {
    const orList = validRules.map((r) => ({ [r.field]: buildSingleField(r) }));
    return JSON.stringify({ $or: orList }, null, 2);
  }

  // AND combinator: merge fields
  const result: Record<string, any> = {};
  for (const r of validRules) {
    result[r.field] = buildSingleField(r);
  }

  return JSON.stringify(result, null, 2);
}

/**
 * Generates human-friendly Chinese natural language explanation of the rule condition.
 */
export function explainCondition(conditionJson?: string, resourceName?: string): string {
  if (!conditionJson || !conditionJson.trim()) {
    return '全量开放：允许访问该资源下的所有数据';
  }

  let parsed: any;
  try {
    parsed = JSON.parse(conditionJson);
  } catch {
    return '规则格式无效 (非标准 JSON)';
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return '全量开放';
  }

  const keys = Object.keys(parsed);
  if (keys.length === 0) {
    return '全量开放：允许访问该资源下的所有数据';
  }

  const explainValue = (val: any): string => {
    if (val === null) return '空 (null)';
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    const variable = CONTEXT_VARIABLES.find((v) => v.key === str);
    if (variable) {
      return variable.label;
    }
    return `"${str}"`;
  };

  const explainFieldRule = (field: string, val: any): string => {
    const fieldLabel = getFieldLabel(field, resourceName);
    if (val === null) {
      return `【${fieldLabel}】为空`;
    }
    if (typeof val === 'object' && !Array.isArray(val)) {
      const subKeys = Object.keys(val);
      if (subKeys.length === 1) {
        const op = subKeys[0];
        const innerVal = val[op];
        if (op === '$ne' && innerVal === null) {
          return `【${fieldLabel}】不为空`;
        }
        const opName = getOperatorLabel(op);
        return `【${fieldLabel}】${opName} ${explainValue(innerVal)}`;
      }
    }
    return `【${fieldLabel}】等于 ${explainValue(val)}`;
  };

  if ((keys[0] === '$or' || keys[0] === 'OR') && Array.isArray(parsed[keys[0]])) {
    const list = parsed[keys[0]] as any[];
    const parts = list.map((item) => {
      const itemKeys = Object.keys(item);
      if (itemKeys.length === 1) {
        return explainFieldRule(itemKeys[0], item[itemKeys[0]]);
      }
      return JSON.stringify(item);
    });
    return `满足以下任一条件：${parts.join(' 或 ')}`;
  }

  if ((keys[0] === '$and' || keys[0] === 'AND') && Array.isArray(parsed[keys[0]])) {
    const list = parsed[keys[0]] as any[];
    const parts = list.map((item) => {
      const itemKeys = Object.keys(item);
      if (itemKeys.length === 1) {
        return explainFieldRule(itemKeys[0], item[itemKeys[0]]);
      }
      return JSON.stringify(item);
    });
    return `必须同时满足：${parts.join(' 且 ')}`;
  }

  const parts = keys.map((key) => explainFieldRule(key, parsed[key]));
  return `限制条件：${parts.join(' 且 ')}`;
}

/**
 * Simulates how context variables inside conditionJson will be substituted into a concrete query object.
 */
export function simulateCondition(
  conditionJson: string,
  mockContext: Record<string, any> = {
    '${user.id}': 'usr_demo_888',
    '${user.departmentId}': 'dept_sales_01',
    '${user.departmentIds}': ['dept_sales_01', 'dept_sales_north'],
    '${user.roles}': ['SALES_REPRESENTATIVE'],
    '${user.companyId}': 'org_enterprise_01',
  }
): Record<string, any> {
  if (!conditionJson || !conditionJson.trim()) {
    return {};
  }

  let parsed: any;
  try {
    parsed = JSON.parse(conditionJson);
  } catch {
    return { _error: 'Invalid JSON' };
  }

  const replaceVariables = (val: any): any => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string') {
      if (mockContext[val] !== undefined) {
        return mockContext[val];
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(replaceVariables);
    }
    if (typeof val === 'object') {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        out[k] = replaceVariables(v);
      }
      return out;
    }
    return val;
  };

  return replaceVariables(parsed);
}
