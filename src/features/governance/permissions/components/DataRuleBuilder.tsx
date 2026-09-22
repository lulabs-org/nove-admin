import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Empty from 'antd/es/empty';
import Input from 'antd/es/input';
import Radio from 'antd/es/radio';
import Segmented from 'antd/es/segmented';
import Select from 'antd/es/select';
import Space from 'antd/es/space';
import Tag from 'antd/es/tag';
import Tooltip from 'antd/es/tooltip';
import Typography from 'antd/es/typography';
import {
  CodeOutlined,
  DeleteOutlined,
  FormatPainterOutlined,
  InfoCircleOutlined,
  PartitionOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CONTEXT_VARIABLES,
  OPERATORS,
  PRESET_TEMPLATES,
  conditionToVisualRules,
  explainCondition,
  getResourceFields,
  visualRulesToCondition,
  type VisualConditionGroup,
  type VisualRuleItem,
} from './dataRuleConstants';

const { Text } = Typography;
const { TextArea } = Input;

export interface DataRuleBuilderProps {
  value?: string;
  onChange?: (value: string) => void;
  resource?: string;
}

export function DataRuleBuilder({ value = '{\n  \n}', onChange, resource }: DataRuleBuilderProps) {
  const [mode, setMode] = useState<'visual' | 'json'>('visual');
  const [jsonText, setJsonText] = useState(value);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Parse initial visual state
  const [visualGroup, setVisualGroup] = useState<VisualConditionGroup>(() => {
    return conditionToVisualRules(value) || { combinator: 'AND', rules: [] };
  });

  // Keep local jsonText in sync with incoming value
  useEffect(() => {
    setJsonText(value);
    const parsed = conditionToVisualRules(value);
    if (parsed) {
      setVisualGroup(parsed);
      setJsonError(null);
    } else {
      // If cannot be parsed into visual rules, switch to JSON mode so user doesn't lose complex logic
      try {
        JSON.parse(value);
        setJsonError(null);
      } catch {
        setJsonError('当前 JSON 条件格式不合法');
      }
    }
  }, [value]);

  const resourceFields = useMemo(() => getResourceFields(resource), [resource]);

  const handleApplyTemplate = (condition: string) => {
    onChange?.(condition);
    setJsonText(condition);
    const parsed = conditionToVisualRules(condition);
    if (parsed) {
      setVisualGroup(parsed);
      setJsonError(null);
    }
  };

  const syncVisualToParent = useCallback(
    (newGroup: VisualConditionGroup) => {
      setVisualGroup(newGroup);
      const generatedJson = visualRulesToCondition(newGroup);
      setJsonText(generatedJson);
      setJsonError(null);
      onChange?.(generatedJson);
    },
    [onChange]
  );

  const handleAddRule = () => {
    const defaultField = resourceFields.length > 0 ? resourceFields[0].name : '';
    const newRule: VisualRuleItem = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      field: defaultField,
      operator: '$eq',
      valueType: 'variable',
      value: '${user.id}',
    };
    const nextGroup: VisualConditionGroup = {
      ...visualGroup,
      rules: [...visualGroup.rules, newRule],
    };
    syncVisualToParent(nextGroup);
  };

  const handleRemoveRule = (id: string) => {
    const nextGroup: VisualConditionGroup = {
      ...visualGroup,
      rules: visualGroup.rules.filter((r) => r.id !== id),
    };
    syncVisualToParent(nextGroup);
  };

  const handleUpdateRule = (id: string, partial: Partial<VisualRuleItem>) => {
    const nextGroup: VisualConditionGroup = {
      ...visualGroup,
      rules: visualGroup.rules.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, ...partial };
        // If operator is isNull or isNotNull, value is not needed
        if (updated.operator === 'isNull' || updated.operator === 'isNotNull') {
          updated.value = '';
        }
        return updated;
      }),
    };
    syncVisualToParent(nextGroup);
  };

  const handleCombinatorChange = (combinator: 'AND' | 'OR') => {
    const nextGroup: VisualConditionGroup = { ...visualGroup, combinator };
    syncVisualToParent(nextGroup);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      JSON.parse(text);
      setJsonError(null);
      onChange?.(text);
      const parsedVisual = conditionToVisualRules(text);
      if (parsedVisual) {
        setVisualGroup(parsedVisual);
      }
    } catch {
      setJsonError('JSON 语法错误，请输入有效的 JSON 对象格式');
      onChange?.(text);
    }
  };

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(jsonText);
      const formatted = JSON.stringify(obj, null, 2);
      setJsonText(formatted);
      setJsonError(null);
      onChange?.(formatted);
    } catch {
      setJsonError('无法格式化：JSON 语法错误');
    }
  };

  const handleInsertVariable = (varKey: string) => {
    if (mode === 'json') {
      const inserted = jsonText ? `${jsonText}\n// 插入变量: ${varKey}` : `"${varKey}"`;
      setJsonText(inserted);
      onChange?.(inserted);
    }
  };

  const explanation = useMemo(() => {
    return explainCondition(jsonText, resource);
  }, [jsonText, resource]);

  const renderVisualBuilder = () => (
    <div className="data-rule-visual-container">
      <div className="data-rule-combinator-bar">
        <Space size="middle">
          <Text strong className="data-rule-combinator-label">
            条件匹配模式:
          </Text>
          <Radio.Group
            size="small"
            value={visualGroup.combinator}
            onChange={(e) => handleCombinatorChange(e.target.value)}
          >
            <Radio.Button value="AND">满足以下所有条件 (AND 且)</Radio.Button>
            <Radio.Button value="OR">满足任一条件 (OR 或)</Radio.Button>
          </Radio.Group>
        </Space>
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleAddRule}
        >
          添加条件
        </Button>
      </div>

      {visualGroup.rules.length === 0 ? (
        <div className="data-rule-empty-rules">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                暂未添加过滤条件，默认为 <strong>全量数据开放</strong>
              </span>
            }
          >
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={handleAddRule}>
              立即添加条件
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="data-rule-rows-list">
          {visualGroup.rules.map((rule, index) => {
            const currentFieldDef = resourceFields.find((f) => f.name === rule.field);
            const isNullOp = rule.operator === 'isNull' || rule.operator === 'isNotNull';

            return (
              <div key={rule.id} className="data-rule-row-item">
                <span className="data-rule-row-index">{index + 1}</span>

                {/* 字段选择 */}
                <Select
                  style={{ width: 170 }}
                  placeholder="选择或输入字段"
                  value={rule.field || undefined}
                  onChange={(val) => handleUpdateRule(rule.id, { field: val })}
                  showSearch
                  allowClear
                  options={
                    resourceFields.length > 0
                      ? resourceFields.map((f) => ({
                          label: `${f.label} (${f.name})`,
                          value: f.name,
                        }))
                      : [{ label: rule.field || '自定义字段', value: rule.field }]
                  }
                />

                {/* 操作符选择 */}
                <Select
                  style={{ width: 140 }}
                  value={rule.operator}
                  onChange={(val) => handleUpdateRule(rule.id, { operator: val })}
                  options={OPERATORS.map((op) => ({
                    label: op.label,
                    value: op.key,
                  }))}
                />

                {/* 取值类型切换 (变量 vs 常量) */}
                {!isNullOp && (
                  <Radio.Group
                    size="small"
                    value={rule.valueType}
                    onChange={(e) =>
                      handleUpdateRule(rule.id, {
                        valueType: e.target.value,
                        value: e.target.value === 'variable' ? '${user.id}' : '',
                      })
                    }
                  >
                    <Radio.Button value="variable">上下文变量</Radio.Button>
                    <Radio.Button value="constant">固定常量</Radio.Button>
                  </Radio.Group>
                )}

                {/* 取值输入 */}
                {!isNullOp && (
                  <div className="data-rule-value-input">
                    {rule.valueType === 'variable' ? (
                      <Select
                        style={{ width: '100%', minWidth: 190 }}
                        value={rule.value}
                        onChange={(val) => handleUpdateRule(rule.id, { value: val })}
                        options={CONTEXT_VARIABLES.map((v) => ({
                          label: (
                            <Space size="small">
                              <Tag color="geekblue">{v.key}</Tag>
                              <span>{v.label}</span>
                            </Space>
                          ),
                          value: v.key,
                        }))}
                      />
                    ) : currentFieldDef?.type === 'enum' && currentFieldDef.options ? (
                      <Select
                        style={{ width: '100%', minWidth: 170 }}
                        value={rule.value || undefined}
                        placeholder="选择枚举值"
                        onChange={(val) => handleUpdateRule(rule.id, { value: val })}
                        options={currentFieldDef.options}
                      />
                    ) : (
                      <Input
                        style={{ minWidth: 160 }}
                        placeholder="输入常量值"
                        value={rule.value}
                        onChange={(e) => handleUpdateRule(rule.id, { value: e.target.value })}
                      />
                    )}
                  </div>
                )}

                {/* 删除按钮 */}
                <Tooltip title="移除此条件">
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveRule(rule.id)}
                  />
                </Tooltip>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderJsonEditor = () => (
    <div className="data-rule-json-container">
      <div className="data-rule-json-toolbar">
        <Space size="small" wrap>
          <Text type="secondary">快捷插入变量：</Text>
          {CONTEXT_VARIABLES.map((v) => (
            <Tag
              key={v.key}
              color="processing"
              className="data-rule-variable-tag"
              onClick={() => handleInsertVariable(v.key)}
            >
              {v.key} ({v.label})
            </Tag>
          ))}
        </Space>
        <Button
          size="small"
          icon={<FormatPainterOutlined />}
          onClick={handleFormatJson}
        >
          格式化 JSON
        </Button>
      </div>
      <TextArea
        rows={8}
        value={jsonText}
        onChange={(e) => handleJsonChange(e.target.value)}
        className="permission-code data-rule-json-editor"
        placeholder='例如 {"departmentId": "${user.departmentId}"}'
      />
      {jsonError && (
        <Alert
          type="error"
          showIcon
          message={jsonError}
          style={{ marginTop: 8 }}
        />
      )}
    </div>
  );

  return (
    <div className="data-rule-builder-shell">
      {/* 预设模板工具栏 */}
      <div className="data-rule-template-bar">
        <Space size="small" wrap align="center">
          <span className="data-rule-template-label">
            <ThunderboltOutlined /> 常用规则模板：
          </span>
          {PRESET_TEMPLATES.map((tmpl) => (
            <Tooltip key={tmpl.name} title={tmpl.description}>
              <Tag
                color={tmpl.badgeColor || 'default'}
                className="data-rule-preset-tag"
                onClick={() => handleApplyTemplate(tmpl.condition)}
              >
                {tmpl.name}
              </Tag>
            </Tooltip>
          ))}
        </Space>
      </div>

      {/* 模式切换器 */}
      <div className="data-rule-mode-switch">
        <Segmented
          value={mode}
          onChange={(val) => setMode(val as 'visual' | 'json')}
          options={[
            {
              label: (
                <Space size="small">
                  <PartitionOutlined />
                  <span>可视化构建</span>
                </Space>
              ),
              value: 'visual',
            },
            {
              label: (
                <Space size="small">
                  <CodeOutlined />
                  <span>JSON 源码</span>
                </Space>
              ),
              value: 'json',
            },
          ]}
        />
      </div>

      {/* 内容区域 */}
      <div className="data-rule-body">
        {mode === 'visual' ? renderVisualBuilder() : renderJsonEditor()}
      </div>

      {/* 实时自然语言释义 Alert */}
      <div className="data-rule-explanation-box">
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message={
            <div className="data-rule-explanation-content">
              <Text strong>规则自然语言释义：</Text>
              <Text type="secondary" className="data-rule-explanation-text">
                {explanation}
              </Text>
            </div>
          }
        />
      </div>
    </div>
  );
}
