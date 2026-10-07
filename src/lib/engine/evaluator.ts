/**
 * Workly Variable Interpolation & Expression Evaluator
 */

export interface ExecutionContext {
  trigger?: Record<string, any>;
  nodes?: Record<string, { output: any; input?: any; status?: string }>;
  workflow?: { id: string; name: string };
  variables?: Record<string, any>;
  [key: string]: any;
}

/**
 * Resolves a dotted path in a nested object, e.g. "trigger.payload.lead.score"
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  // Clean up bracket notations if any: a[0].b -> a.0.b
  const cleanPath = path.replace(/\[(\w+)\]/g, '.$1');
  const parts = cleanPath.split('.').map(p => p.trim()).filter(Boolean);
  
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Interpolates string with `{{variable.path}}` patterns
 */
export function interpolateString(template: string, context: ExecutionContext): string {
  if (typeof template !== 'string') return template;
  
  return template.replace(/\{\{\s*([a-zA-Z0-9_\-\.\[\]]+)\s*\}\}/g, (match, path) => {
    // Check in direct context
    let val = getNestedValue(context, path);
    
    // If not found, check in context.nodes if path starts with a node id or alias
    if (val === undefined && context.nodes) {
      // Try resolving directly from node output
      const parts = path.split('.');
      const firstPart = parts[0];
      if (context.nodes[firstPart]) {
        const remaining = parts.slice(1).join('.');
        val = getNestedValue(context.nodes[firstPart].output, remaining || '');
      }
    }

    if (val === undefined || val === null) {
      return '';
    }
    
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  });
}

/**
 * Deeply interpolates all string fields inside an object/array
 */
export function interpolateDeep(data: any, context: ExecutionContext): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // If exact variable match like "{{trigger.user}}", return the raw type (can be object/array/number)
    const exactMatch = data.trim().match(/^\{\{\s*([a-zA-Z0-9_\-\.\[\]]+)\s*\}\}$/);
    if (exactMatch) {
      const path = exactMatch[1];
      let val = getNestedValue(context, path);
      if (val === undefined && context.nodes) {
        const parts = path.split('.');
        const firstPart = parts[0];
        if (context.nodes[firstPart]) {
          const remaining = parts.slice(1).join('.');
          val = remaining ? getNestedValue(context.nodes[firstPart].output, remaining) : context.nodes[firstPart].output;
        }
      }
      if (val !== undefined) return val;
    }
    return interpolateString(data, context);
  }
  if (Array.isArray(data)) {
    return data.map(item => interpolateDeep(item, context));
  }
  if (typeof data === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = interpolateDeep(value, context);
    }
    return result;
  }
  return data;
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'does_not_contain'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'exists'
  | 'does_not_exist'
  | 'is_empty'
  | 'is_not_empty';

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface ConditionGroup {
  logicalOperator: 'AND' | 'OR';
  rules: ConditionRule[];
}

/**
 * Evaluates a single condition rule
 */
export function evaluateConditionRule(rule: ConditionRule, context: ExecutionContext): boolean {
  const rawFieldValue = interpolateDeep(rule.field, context);
  const rawTargetValue = rule.value !== undefined ? interpolateDeep(rule.value, context) : undefined;
  
  const fieldValue = rawFieldValue;
  const targetValue = rawTargetValue;

  switch (rule.operator) {
    case 'equals':
      return String(fieldValue).trim().toLowerCase() === String(targetValue).trim().toLowerCase();
    
    case 'not_equals':
      return String(fieldValue).trim().toLowerCase() !== String(targetValue).trim().toLowerCase();
    
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(item => String(item).toLowerCase().includes(String(targetValue).toLowerCase()));
      }
      return String(fieldValue || '').toLowerCase().includes(String(targetValue || '').toLowerCase());
    
    case 'does_not_contain':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.some(item => String(item).toLowerCase().includes(String(targetValue).toLowerCase()));
      }
      return !String(fieldValue || '').toLowerCase().includes(String(targetValue || '').toLowerCase());
    
    case 'greater_than':
      return Number(fieldValue) > Number(targetValue);
    
    case 'less_than':
      return Number(fieldValue) < Number(targetValue);
    
    case 'greater_equal':
      return Number(fieldValue) >= Number(targetValue);
    
    case 'less_equal':
      return Number(fieldValue) <= Number(targetValue);
    
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    
    case 'does_not_exist':
      return fieldValue === undefined || fieldValue === null || fieldValue === '';

    case 'is_empty':
      if (Array.isArray(fieldValue)) return fieldValue.length === 0;
      if (typeof fieldValue === 'object' && fieldValue !== null) return Object.keys(fieldValue).length === 0;
      return !fieldValue || String(fieldValue).trim() === '';

    case 'is_not_empty':
      if (Array.isArray(fieldValue)) return fieldValue.length > 0;
      if (typeof fieldValue === 'object' && fieldValue !== null) return Object.keys(fieldValue).length > 0;
      return !!fieldValue && String(fieldValue).trim() !== '';

    default:
      return false;
  }
}

/**
 * Evaluates condition groups with AND/OR logic
 */
export function evaluateCondition(config: {
  operator?: 'AND' | 'OR';
  rules?: ConditionRule[];
  groups?: ConditionGroup[];
  // Legacy / simple single rule flat format support:
  field?: string;
  conditionOperator?: ConditionOperator;
  value?: any;
}, context: ExecutionContext): boolean {
  // Simple single rule
  if (config.field && config.conditionOperator) {
    return evaluateConditionRule({
      field: config.field,
      operator: config.conditionOperator,
      value: config.value,
    }, context);
  }

  // Groups
  if (config.groups && config.groups.length > 0) {
    const groupOp = config.operator || 'AND';
    if (groupOp === 'AND') {
      return config.groups.every(group => evaluateConditionGroup(group, context));
    } else {
      return config.groups.some(group => evaluateConditionGroup(group, context));
    }
  }

  // Simple rules array
  if (config.rules && config.rules.length > 0) {
    const op = config.operator || 'AND';
    if (op === 'AND') {
      return config.rules.every(r => evaluateConditionRule(r, context));
    } else {
      return config.rules.some(r => evaluateConditionRule(r, context));
    }
  }

  return true;
}

function evaluateConditionGroup(group: ConditionGroup, context: ExecutionContext): boolean {
  if (!group.rules || group.rules.length === 0) return true;
  if (group.logicalOperator === 'OR') {
    return group.rules.some(rule => evaluateConditionRule(rule, context));
  }
  return group.rules.every(rule => evaluateConditionRule(rule, context));
}
