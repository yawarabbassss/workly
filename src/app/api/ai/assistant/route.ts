import { NextResponse } from 'next/server';
import { callGrokAI } from '@/lib/ai/grokClient';

export async function POST(request: Request) {
  try {
    const { message, workflowContext, errorContext } = await request.json();

    const systemPrompt = `You are Workly Assistant, an expert AI workflow automation co-pilot.
Help the user build, debug, optimize, and understand workflows.
Keep your explanations clear, concise, actionable, and structured.`;

    const prompt = `User Query: "${message}"
${workflowContext ? `\nCurrent Workflow Context:\n${JSON.stringify(workflowContext, null, 2)}` : ''}
${errorContext ? `\nExecution Error Details:\n${JSON.stringify(errorContext, null, 2)}` : ''}`;

    const reply = await callGrokAI({
      prompt,
      systemPrompt,
      model: 'grok-2-latest',
      temperature: 0.3,
    });

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
