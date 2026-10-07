'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Workflow, WorkflowNode, WorkflowEdge, NodeType, WorkflowDefinition } from '@/lib/types/workflow';
import { UnifiedCustomNode } from './CustomNodes/UnifiedNode';
import { NodeConfigPanel } from './NodeConfigPanel';
import { CanvasToolbar } from './CanvasToolbar';
import { AiWorkflowModal } from './AiWorkflowModal';
import { TestRunModal } from './TestRunModal';

interface WorkflowCanvasProps {
  initialWorkflow: Workflow;
  onSaveWorkflow: (updated: Partial<Workflow>) => Promise<void>;
}

export function WorkflowCanvas({ initialWorkflow, onSaveWorkflow }: WorkflowCanvasProps) {
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(initialWorkflow.definition.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(initialWorkflow.definition.edges || []);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTestRunOpen, setIsTestRunOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Custom node types registry for React Flow
  const nodeTypes = useMemo(() => ({ customNode: UnifiedCustomNode }), []);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Connect edges
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges(eds => addEdge({ ...params, animated: true }, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  // Node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Add new node from palette
  const handleAddNode = useCallback((type: NodeType, label: string) => {
    const newNodeId = `node_${type}_${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: 'customNode',
      position: {
        x: 300 + Math.floor(Math.random() * 60) - 30,
        y: 80 + nodes.length * 130,
      },
      data: {
        label,
        type,
        config: {},
      },
    };

    setNodes(nds => [...nds, newNode]);
    setSelectedNodeId(newNodeId);
    setHasUnsavedChanges(true);
  }, [nodes.length, setNodes]);

  // Update node config
  const handleUpdateNode = useCallback((nodeId: string, updatedData: Partial<WorkflowNode['data']>) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedData,
            },
          };
        }
        return node;
      })
    );
    setHasUnsavedChanges(true);
  }, [setNodes]);

  // Delete node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setHasUnsavedChanges(true);
  }, [selectedNodeId, setEdges, setNodes]);

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedDefinition: WorkflowDefinition = {
        nodes,
        edges,
      };
      await onSaveWorkflow({
        definition: updatedDefinition,
        isActive: workflow.isActive,
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active state
  const handleToggleActive = async () => {
    const nextState = !workflow.isActive;
    setWorkflow(prev => ({ ...prev, isActive: nextState }));
    await onSaveWorkflow({ isActive: nextState });
  };

  // Apply AI generated/edited workflow
  const handleApplyAiWorkflow = (generated: { name: string; description: string; definition: WorkflowDefinition }) => {
    setWorkflow(prev => ({
      ...prev,
      name: generated.name || prev.name,
      description: generated.description || prev.description,
      definition: generated.definition,
    }));
    setNodes(generated.definition.nodes || []);
    setEdges(generated.definition.edges || []);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-950">
      {/* React Flow Canvas Area */}
      <div className="relative flex-1 h-full">
        <CanvasToolbar
          onAddNode={handleAddNode}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onSave={handleSave}
          onRunTest={() => setIsTestRunOpen(true)}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          isActive={workflow.isActive}
          onToggleActive={handleToggleActive}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="bg-[#0b0f19]"
        >
          <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-300" />
          <MiniMap
            nodeColor="#6366f1"
            maskColor="rgba(11, 15, 25, 0.75)"
            className="!bg-slate-950 !border-slate-800 !rounded-xl overflow-hidden"
          />
        </ReactFlow>
      </div>

      {/* Dynamic Side Configuration Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          allNodes={nodes}
          webhookToken={workflow.webhookToken}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* AI Modal */}
      <AiWorkflowModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentDefinition={{ nodes, edges }}
        currentName={workflow.name}
        onApplyWorkflow={handleApplyAiWorkflow}
      />

      {/* Test Run Execution Modal */}
      <TestRunModal
        isOpen={isTestRunOpen}
        onClose={() => setIsTestRunOpen(false)}
        workflow={{ ...workflow, definition: { nodes, edges } }}
        onExecutionComplete={() => {
          // Sync any execution visual feedback if needed
        }}
      />
    </div>
  );
}
