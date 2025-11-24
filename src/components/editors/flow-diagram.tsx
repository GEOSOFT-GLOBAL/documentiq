/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { FlowChartWithState, type IChart } from "@mrblenny/react-flow-chart";
import { GripVertical } from "lucide-react";

const chartSimple = {
  offset: {
    x: 0,
    y: 0,
  },
  scale: 1,
  nodes: {
    node1: {
      id: "node1",
      type: "output-only",
      position: {
        x: 300,
        y: 100,
      },
      ports: {
        port1: {
          id: "port1",
          type: "output",
          properties: {
            value: "yes",
          },
        },
        port2: {
          id: "port2",
          type: "output",
          properties: {
            value: "no",
          },
        },
      },
    },
    node2: {
      id: "node2",
      type: "input-output",
      position: {
        x: 300,
        y: 300,
      },
      ports: {
        port1: {
          id: "port1",
          type: "input",
        },
        port2: {
          id: "port2",
          type: "output",
        },
      },
    },
    node3: {
      id: "node3",
      type: "input-output",
      position: {
        x: 500,
        y: 300,
      },
      ports: {
        port1: {
          id: "port1",
          type: "input",
        },
        port2: {
          id: "port2",
          type: "output",
        },
      },
    },
    node4: {
      id: "node4",
      type: "input-only",
      position: {
        x: 400,
        y: 500,
      },
      ports: {
        port1: {
          id: "port1",
          type: "input",
        },
      },
    },
  },
  links: {
    link1: {
      id: "link1",
      from: {
        nodeId: "node1",
        portId: "port1",
      },
      to: {
        nodeId: "node2",
        portId: "port1",
      },
    },
    link2: {
      id: "link2",
      from: {
        nodeId: "node1",
        portId: "port2",
      },
      to: {
        nodeId: "node3",
        portId: "port1",
      },
    },
    link3: {
      id: "link3",
      from: {
        nodeId: "node2",
        portId: "port2",
      },
      to: {
        nodeId: "node4",
        portId: "port1",
      },
    },
    link4: {
      id: "link4",
      from: {
        nodeId: "node3",
        portId: "port2",
      },
      to: {
        nodeId: "node4",
        portId: "port1",
      },
    },
  },
  selected: {},
  hovered: {},
};

const nodeTemplates = [
  { id: "start", label: "Start Node", type: "output-only", color: "#10B981" },
  {
    id: "process",
    label: "Process Node",
    type: "input-output",
    color: "#3B82F6",
  },
  {
    id: "decision",
    label: "Decision Node",
    type: "input-output",
    color: "#F59E0B",
  },
  { id: "end", label: "End Node", type: "input-only", color: "#EF4444" },
];

const FlowDiagram = () => {
  const [chart, setChart] = useState<IChart>(chartSimple);
  const [nodeCounter, setNodeCounter] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const addNodeToCanvas = useCallback(
    (template: (typeof nodeTemplates)[0]) => {
      const newNodeId = `node${nodeCounter}`;

      let ports: Record<string, { id: string; type: string }> = {};

      if (template.type === "output-only") {
        ports = {
          port1: { id: "port1", type: "output" },
        };
      } else if (template.type === "input-only") {
        ports = {
          port1: { id: "port1", type: "input" },
        };
      } else {
        ports = {
          port1: { id: "port1", type: "input" },
          port2: { id: "port2", type: "output" },
        };
      }

      const newNode = {
        id: newNodeId,
        type: template.type,
        position: {
          x: 200 + Math.random() * 200,
          y: 100 + Math.random() * 200,
        },
        ports,
        properties: {
          label: template.label,
          color: template.color,
        },
      };

      setChart((prevChart: IChart) => ({
        ...prevChart,
        nodes: {
          ...prevChart.nodes,
          [newNodeId]: newNode as any,
        },
      }));
      setNodeCounter(nodeCounter + 1);
    },
    [nodeCounter]
  );

  const stateActions = {
    onNodeDoubleClick: useCallback(
      (nodeId: string) => {
        const node = chart.nodes[nodeId as keyof typeof chart.nodes];
        if (!node) return;

        const newLabel = window.prompt("Enter node label:", nodeId);
        if (newLabel) {
          setChart((prevChart) => ({
            ...prevChart,
            nodes: {
              ...prevChart.nodes,
              [nodeId]: {
                ...node,
                id: newLabel,
              },
            },
          }));
        }
      },
      [chart]
    ),
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col w-full">
      {/* Toolbar */}
      <div className="bg-gray-800 p-3 flex gap-2 border-b border-gray-700 items-center">
        <div className="text-white text-sm font-semibold">
          Flow Diagram Editor
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="ml-4 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
        >
          {isSidebarOpen ? "Hide" : "Show"} Sidebar
        </button>
        <div className="ml-auto text-gray-400 text-sm">
          💡 Drag nodes from sidebar • Click ports to connect • Double-click to
          edit
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Flow Diagram Canvas */}
        <div className="flex-1 bg-white">
          <FlowChartWithState
            initialValue={chart}
            config={{
              readonly: false,
              snapToGrid: true,
            }}
            Components={{
              NodeInner: ({ node }) => {
                const nodeColor =
                  (node.properties as Record<string, string>)?.color ||
                  "#4A90E2";
                const nodeLabel =
                  (node.properties as Record<string, string>)?.label || node.id;
                return (
                  <div
                    style={{
                      padding: "20px",
                      background: nodeColor,
                      color: "white",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      textAlign: "center",
                      minWidth: "120px",
                    }}
                    onDoubleClick={() =>
                      stateActions.onNodeDoubleClick(node.id)
                    }
                  >
                    {nodeLabel}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Floating Sidebar */}
        {isSidebarOpen && (
          <div className="absolute top-4 right-4 w-64 bg-white border border-gray-300 rounded-lg shadow-2xl z-50">
            <div className="bg-gray-800 text-white px-4 py-3 font-semibold rounded-t-lg flex items-center justify-between">
              <span>Node Templates</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {nodeTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border-2 border-gray-200 rounded-lg p-3 cursor-move hover:border-gray-400 hover:shadow-md transition-all"
                  onClick={() => addNodeToCanvas(template)}
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-gray-400" />
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: template.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {template.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-6">
                    Click to add to canvas
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowDiagram;
