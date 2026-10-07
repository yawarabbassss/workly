import { NextResponse } from 'next/server';
import { db } from '@/lib/db/storage';
import { workflowEngine } from '@/lib/engine/workflowEngine';

export async function POST(request: Request, props: { params: Promise<{ token: string }> }) {
  try {
    const params = await props.params;
    const token = params.token;

    const workflow = db.getWorkflowByWebhookToken(token);
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired webhook token.' },
        { status: 404 }
      );
    }

    if (!workflow.isActive) {
      return NextResponse.json(
        { success: false, error: 'Workflow is currently paused or inactive.' },
        { status: 400 }
      );
    }

    // Capture incoming payload
    let payload: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        payload = await request.json();
      } catch {
        payload = {};
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      const text = await request.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { rawText: text };
      }
    }

    // Extract query parameters
    const url = new URL(request.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      queryParams[k] = v;
    });

    const fullTriggerPayload = {
      ...payload,
      _query: queryParams,
      _receivedAt: new Date().toISOString(),
    };

    // Execute workflow automatically
    const execution = await workflowEngine.execute({
      workflow,
      triggerType: 'webhook',
      triggerPayload: fullTriggerPayload,
    });

    // Check if there is a webhook_response node with a custom output
    const webhookResponseNode = execution.nodeExecutions.find(
      n => n.nodeType === 'webhook_response' && n.status === 'SUCCESS'
    );

    if (webhookResponseNode && webhookResponseNode.outputData) {
      const status = webhookResponseNode.outputData.statusCode || 200;
      const body = webhookResponseNode.outputData.body || { success: true };
      return NextResponse.json(body, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook received and workflow executed',
      executionId: execution.id,
      status: execution.status,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Allow GET for webhook testing and verification
export async function GET(request: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const workflow = db.getWorkflowByWebhookToken(params.token);
  if (!workflow) {
    return NextResponse.json({ success: false, error: 'Webhook endpoint not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    workflowName: workflow.name,
    status: workflow.isActive ? 'active' : 'paused',
    message: 'Webhook endpoint is active. Send POST requests with JSON payload to trigger this workflow.',
  });
}
