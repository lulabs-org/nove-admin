/* eslint-disable react-hooks/set-state-in-effect -- synchronize Ant Design Form's external value with the editor draft */
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
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CONTEXT_VARIABLES,
  OPERATORS,
  PRESET_TEMPLATES,
  MAX_CONDITION_DEPTH,
  MAX_CONDITION_NODES,
  conditionToVisualRules,
  createEmptyConditionGroup,
  explainCondition,
  getResourceFields,
  validateConditionJson,
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
  const [mode, setMode] = useState<'visual' | 'json'>(() =>
    conditionToVisualRules(value) ? 'visual' : 'json'
  );
  const [jsonText, setJsonText] = useState(value);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const lastEmittedValue = useRef<string | null>(null);
  const nodeCounter = useRef(0);

  const [visualGroup, setVisualGroup] = useState<VisualConditionGroup>(() => {
    return conditionToVisualRules(value) || createEmptyConditionGroup();
  });

  useEffect(() => {
    if (value === lastEmittedValue.current) {
      lastEmittedValue.current = null;
      setJsonError(validateConditionJson(value, resource));
      return;
    }
    setJsonText(value);
    const parsed = conditionToVisualRules(value);
    if (parsed) {
      setVisualGroup(parsed);
      setJsonError(validateConditionJson(value, resource));
    } else {
      setMode('json');
      setJsonError(validateConditionJson(value, resource));
    }
  }, [value, resource]);

  const resourceFields = useMemo(() => getResourceFields(resource), [resource]);

  const handleApplyTemplate = (condition: string) => {
    lastEmittedValue.current = condition;
    onChange?.(condition);
    setJsonText(condition);
    const parsed = conditionToVisualRules(condition);
    if (parsed) {
      setVisualGroup(parsed);
      setMode('visual');
    }
    setJsonError(validateConditionJson(condition, resource));
  };

  const syncVisualToParent = useCallback(
    (newGroup: VisualConditionGroup) => {
      setVisualGroup(newGroup);
      const generatedJson = visualRulesToCondition(newGroup);
      setJsonText(generatedJson);
      setJsonError(validateConditionJson(generatedJson, resource));
      lastEmittedValue.current = generatedJson;
      onChange?.(generatedJson);
    },
    [onChange, resource]
  );

  const updateGroup = (
    group: VisualConditionGroup,
    id: string,
    update: (target: VisualConditionGroup) => VisualConditionGroup
  ): VisualConditionGroup => {
    if (group.id === id) return update(group);
    return {
      ...group,
      children: group.children.map((child) =>
        child.kind === 'group' ? updateGroup(child, id, update) : child
      ),
    };
  };

  const handleAddRule = (groupId: string) => {
    const defaultField = resourceFields.length > 0 ? resourceFields[0].name : '';
    const newRule: VisualRuleItem = {
      kind: 'rule',
      id: `new_rule_${++nodeCounter.current}`,
      field: defaultField,
      operator: '$eq',
      valueType: 'variable',
      value: '${user.id}',
    };
    syncVisualToParent(
      updateGroup(visualGroup, groupId, (group) => ({
        ...group,
        children: [...group.children, newRule],
      }))
    );
  };

  const handleAddGroup = (groupId: string) => {
    const newGroup: VisualConditionGroup = {
      kind: 'group',
      id: `new_group_${++nodeCounter.current}`,
      combinator: 'AND',
      children: [],
    };
    syncVisualToParent(
      updateGroup(visualGroup, groupId, (group) => ({
        ...group,
        children: [...group.children, newGroup],
      }))
    );
  };

  const handleRemoveNode = (id: string) => {
    const remove = (group: VisualConditionGroup): VisualConditionGroup => ({
      ...group,
      children: group.children
        .filter((child) => child.id !== id)
        .map((child) => (child.kind === 'group' ? remove(child) : child)),
    });
    syncVisualToParent(remove(visualGroup));
  };

  const handleUpdateRule = (id: string, partial: Partial<VisualRuleItem>) => {
    const update = (group: VisualConditionGroup): VisualConditionGroup => ({
      ...group,
      children: group.children.map((child) => {
        if (child.kind === 'group') return update(child);
        if (child.id !== id) return child;
        const updated: VisualRuleItem = { ...child, ...partial };
        if (
          partial.value !== undefined ||
          partial.operator !== undefined ||
          partial.valueType !== undefined
        ) {
          delete updated.originalValue;
        }
        if (updated.operator === 'isNull' || updated.operator === 'isNotNull') updated.value = '';
        return updated;
      }),
    });
    syncVisualToParent(update(visualGroup));
  };

  const handleCombinatorChange = (id: string, combinator: 'AND' | 'OR') => {
    syncVisualToParent(updateGroup(visualGroup, id, (group) => ({ ...group, combinator })));
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    setJsonError(validateConditionJson(text, resource));
    lastEmittedValue.current = text;
    onChange?.(text);
    const parsedVisual = conditionToVisualRules(text);
    if (parsedVisual) setVisualGroup(parsedVisual);
  };

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(jsonText);
      const formatted = JSON.stringify(obj, null, 2);
      setJsonText(formatted);
      setJsonError(validateConditionJson(formatted, resource));
      lastEmittedValue.current = formatted;
      onChange?.(formatted);
    } catch {
      setJsonError('无法格式化：JSON 语法错误');
    }
  };

  const handleInsertVariable = (varKey: string) => {
    if (mode === 'json') {
      void navigator.clipboard.writeText(`"${varKey}"`);
    }
  };

  const explanation = useMemo(() => {
    return explainCondition(jsonText, resource);
  }, [jsonText, resource]);

  const countNodes = (group: VisualConditionGroup): number =>
    1 +
    group.children.reduce(
      (total, child) => total + (child.kind === 'group' ? countNodes(child) : 1),
      0
    );
  const canAddNode = countNodes(visualGroup) < MAX_CONDITION_NODES;

  const renderRule = (rule: VisualRuleItem, index: number) => {
    const currentFieldDef = resourceFields.find((field) => field.name === rule.field);
    const isNullOp = rule.operator === 'isNull' || rule.operator === 'isNotNull';
    return (
      <div key={rule.id} className="data-rule-row-item">
        <span className="data-rule-row-index">{index + 1}</span>
        {resourceFields.length === 0 ? (
          <Input
            style={{ width: 170 }}
            placeholder="输入字段名"
            value={rule.field}
            onChange={(event) => handleUpdateRule(rule.id, { field: event.target.value })}
          />
        ) : (
          <Select
            style={{ width: 170 }}
            placeholder="选择字段"
            value={rule.field || undefined}
            onChange={(field) => handleUpdateRule(rule.id, { field })}
            showSearch
            allowClear
            options={[
              ...resourceFields.map((field) => ({
                label: `${field.label} (${field.name})`,
                value: field.name,
              })),
              ...(rule.field && !resourceFields.some((field) => field.name === rule.field)
                ? [{ label: rule.field, value: rule.field }]
                : []),
            ]}
          />
        )}
        <Select
          style={{ width: 140 }}
          value={rule.operator}
          onChange={(operator) => handleUpdateRule(rule.id, { operator })}
          options={OPERATORS.map((operator) => ({ label: operator.label, value: operator.key }))}
        />
        {!isNullOp && (
          <Radio.Group
            size="small"
            value={rule.valueType}
            onChange={(event) =>
              handleUpdateRule(rule.id, {
                valueType: event.target.value,
                value: event.target.value === 'variable' ? '${user.id}' : '',
              })
            }
          >
            <Radio.Button value="variable">上下文变量</Radio.Button>
            <Radio.Button value="constant">固定常量</Radio.Button>
          </Radio.Group>
        )}
        {!isNullOp && (
          <div className="data-rule-value-input">
            {rule.valueType === 'variable' ? (
              <Select
                style={{ width: '100%', minWidth: 190 }}
                value={rule.value}
                onChange={(selectedValue) => handleUpdateRule(rule.id, { value: selectedValue })}
                options={CONTEXT_VARIABLES.map((variable) => ({
                  label: (
                    <Space size="small">
                      <Tag color="geekblue">{variable.key}</Tag>
                      <span>{variable.label}</span>
                    </Space>
                  ),
                  value: variable.key,
                }))}
              />
            ) : currentFieldDef?.type === 'enum' && currentFieldDef.options ? (
              <Select
                style={{ width: '100%', minWidth: 170 }}
                value={rule.value || undefined}
                placeholder="选择枚举值"
                onChange={(selectedValue) => handleUpdateRule(rule.id, { value: selectedValue })}
                options={currentFieldDef.options}
              />
            ) : (
              <Input
                style={{ minWidth: 160 }}
                placeholder="输入常量值"
                value={rule.value}
                onChange={(event) => handleUpdateRule(rule.id, { value: event.target.value })}
              />
            )}
          </div>
        )}
        <Tooltip title="移除此条件">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveNode(rule.id)}
          />
        </Tooltip>
      </div>
    );
  };

  const renderGroup = (group: VisualConditionGroup, depth: number): ReactNode => (
    <div key={group.id} className={`data-rule-condition-group${depth > 1 ? ' is-nested' : ''}`}>
      <div className="data-rule-combinator-bar">
        <Space size="middle" wrap>
          <Text strong className="data-rule-combinator-label">
            {depth === 1 ? '条件匹配模式:' : `第 ${depth} 层条件组:`}
          </Text>
          <Radio.Group
            size="small"
            value={group.combinator}
            onChange={(event) => handleCombinatorChange(group.id, event.target.value)}
          >
            <Radio.Button value="AND">满足所有条件 (AND 且)</Radio.Button>
            <Radio.Button value="OR">满足任一条件 (OR 或)</Radio.Button>
          </Radio.Group>
        </Space>
        <Space size="small">
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            disabled={!canAddNode}
            onClick={() => handleAddRule(group.id)}
          >
            添加条件
          </Button>
          <Button
            type="dashed"
            size="small"
            icon={<PartitionOutlined />}
            disabled={!canAddNode || depth >= MAX_CONDITION_DEPTH - 1}
            onClick={() => handleAddGroup(group.id)}
          >
            添加条件组
          </Button>
          {depth > 1 && (
            <Tooltip title="移除此条件组">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveNode(group.id)}
              />
            </Tooltip>
          )}
        </Space>
      </div>
      {group.children.length === 0 ? (
        depth === 1 ? (
          <div className="data-rule-empty-rules">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span>暂无条件；此规则将开放全部数据</span>}
            >
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleAddRule(group.id)}
              >
                立即添加条件
              </Button>
            </Empty>
          </div>
        ) : (
          <Text type="danger">空条件组无法保存，请添加条件或删除此组。</Text>
        )
      ) : (
        <div className="data-rule-rows-list">
          {group.children.map((child, index) =>
            child.kind === 'group' ? renderGroup(child, depth + 1) : renderRule(child, index)
          )}
        </div>
      )}
    </div>
  );

  const renderVisualBuilder = () => (
    <div className="data-rule-visual-container">{renderGroup(visualGroup, 1)}</div>
  );

  const renderJsonEditor = () => (
    <div className="data-rule-json-container">
      <div className="data-rule-json-toolbar">
        <Space size="small" wrap>
          <Text type="secondary">快捷插入变量：</Text>
          {CONTEXT_VARIABLES.map((v) => (
            <Tag
              key={v.key}
              title="点击复制变量，可粘贴到 JSON 字符串值中"
              color="processing"
              className="data-rule-variable-tag"
              onClick={() => handleInsertVariable(v.key)}
            >
              {v.key} ({v.label})
            </Tag>
          ))}
        </Space>
        <Button size="small" icon={<FormatPainterOutlined />} onClick={handleFormatJson}>
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
      {jsonError && <Alert type="error" showIcon title={jsonError} style={{ marginTop: 8 }} />}
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
          {PRESET_TEMPLATES.filter(
            (template) => !template.resource || template.resource === resource
          ).map((tmpl) => (
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
          onChange={(nextMode) => {
            if (nextMode === 'visual') {
              const parsed = conditionToVisualRules(jsonText);
              if (!parsed) return;
              setVisualGroup(parsed);
            }
            setMode(nextMode as 'visual' | 'json');
          }}
          options={[
            {
              label: (
                <Space size="small">
                  <PartitionOutlined />
                  <span>可视化构建</span>
                </Space>
              ),
              value: 'visual',
              disabled: mode === 'json' && conditionToVisualRules(jsonText) === null,
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
          title={
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
