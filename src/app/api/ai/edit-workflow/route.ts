import { NextResponse } from 'next/server';
import { callGrokAI } from '@/lib/ai/grokClient';
import { validateWorkflowDefinition } from '@/lib/engine/validator';
import { WorkflowDefinition } from '@/lib/types/workflow';

const EDIT_SYSTEM_PROMPT = `You are the Workly AI Workflow Editor. Modify the existing workflow JSON based on the user's specific request (e.g. adding a node, changing a condition, inserting a delay, renaming nodes).

RULES:
- Retain existing valid node IDs and connections where applicable.
- Ensure new nodes have unique IDs (e.g. node_delay_1, node_email_2).
- Return ONLY the updated workflow JSON object with { "name", "description", "nodes", "edges", "changeSummary" }.`;

export async function POST(request: Request) {
  try {
    const { instruction, currentDefinition, currentName, currentDescription } = await request.json();

    if (!instruction || !currentDefinition) {
      return NextResponse.json(
        { success: false, error: 'Instruction and current workflow definition are required' },
        { status: 400 }
      );
    }

    const prompt = `Current Workflow:
Name: "${currentName}"
Description: "${currentDescription}"
Definition:
${JSON.stringify(currentDefinition, null, 2)}

User Modification Request:
"${instruction}"

Return the updated workflow JSON:`;

    const aiResponse = await callGrokAI({
      prompt,
      systemPrompt: EDIT_SYSTEM_PROMPT,
      model: 'grok-2-latest',
      temperature: 0.1,
      jsonMode: true,
    });

    let cleaned = aiResponse.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();

    const parsed = JSON.parse(cleaned);
    const updatedDefinition: WorkflowDefinition = {
      nodes: parsed.nodes || currentDefinition.nodes,
      edges: parsed.edges || currentDefinition.edges,
    };

    // Auto fix node types
    updatedDefinition.nodes = updatedDefinition.nodes.map(n => ({
      ...n,
      type: 'customNode',
    }));

    const validation = validateWorkflowDefinition(updatedDefinition);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Modified workflow failed validation',
          validationErrors: validation.errors,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: parsed.name || currentName,
        description: parsed.description || currentDescription,
        definition: updatedDefinition,
        changeSummary: parsed.changeSummary || 'Workflow updated successfully by Grok AI.',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
