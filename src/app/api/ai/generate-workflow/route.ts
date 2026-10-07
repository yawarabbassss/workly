import { NextResponse } from 'next/server';
import { callGrokAI } from '@/lib/ai/grokClient';
import { validateWorkflowDefinition } from '@/lib/engine/validator';
import { WorkflowDefinition } from '@/lib/types/workflow';

const SYSTEM_PROMPT = `You are the Workly AI Workflow Architect. Convert the user's natural language automation request into a strictly validated JSON workflow definition for our workflow execution engine.

ALLOWED NODE TYPES:
1. "manual_trigger": { label, type: "manual_trigger", config: {} }
2. "webhook_trigger": { label, type: "webhook_trigger", config: {} }
3. "schedule_trigger": { label, type: "schedule_trigger", config: { cron: "0 9 * * *" } }
4. "http_request": { label, type: "http_request", config: { method: "POST"|"GET"|"PUT", url: string, headers?: {}, body?: string|{} } }
5. "grok_ai": { label, type: "grok_ai", config: { model: "grok-2-latest", prompt: string, temperature?: number } }
6. "condition": { label, type: "condition", config: { field: string, conditionOperator: "equals"|"not_equals"|"contains"|"greater_than"|"less_than", value: string } }
7. "delay": { label, type: "delay", config: { duration: number, unit: "seconds"|"minutes"|"hours"|"days" } }
8. "loop": { label, type: "loop", config: { itemsField: string } }
9. "send_email": { label, type: "send_email", config: { to: string, subject: string, body: string } }
10. "webhook_response": { label, type: "webhook_response", config: { statusCode: 200, body: {} } }

DATA MAPPING RULES:
- Use {{trigger.fieldName}} to reference trigger inputs (e.g. {{trigger.email}}, {{trigger.name}}).
- Use {{node_id.fieldName}} or {{node_id.response}} to reference prior node outputs.

OUTPUT FORMAT (Respond with valid raw JSON only, no markdown backticks):
{
  "name": "Workflow Name",
  "description": "Workflow Description",
  "nodes": [
    {
      "id": "node_1",
      "type": "customNode",
      "position": { "x": 300, "y": 50 },
      "data": { "label": "Trigger Name", "type": "webhook_trigger", "config": {} }
    }
  ],
  "edges": [
    { "id": "e1", "source": "node_1", "target": "node_2", "sourceHandle": "true" }
  ]
}`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || String(prompt).trim() === '') {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const aiResponse = await callGrokAI({
      prompt: `Generate an automated workflow for the following requirement:\n\n"${prompt}"`,
      systemPrompt: SYSTEM_PROMPT,
      model: 'grok-2-latest',
      temperature: 0.1,
      jsonMode: true,
    });

    let cleaned = aiResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: `Failed to parse AI response into JSON: ${e.message}` },
        { status: 500 }
      );
    }

    // Extract definition
    const definition: WorkflowDefinition = {
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
    };

    // Auto-arrange node layout coordinates vertically if needed
    definition.nodes = definition.nodes.map((node, index) => ({
      ...node,
      type: 'customNode',
      position: node.position?.x ? node.position : { x: 300, y: 50 + index * 140 },
    }));

    // Strict validation
    const validation = validateWorkflowDefinition(definition);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Generated workflow failed schema validation',
          validationErrors: validation.errors,
          raw: parsed,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: parsed.name || 'AI Generated Workflow',
        description: parsed.description || 'Created with Grok AI',
        definition,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
