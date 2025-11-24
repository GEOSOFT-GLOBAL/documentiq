import { useState, useCallback } from "react";
import { FlowChartWithState } from "@mrblenny/react-flow-chart";

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

const FlowDiagram = () => {
  const [chart, setChart] = useState(chartSimple);

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
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-800 p-3 flex gap-2 border-b border-gray-700 items-center">
        <div className="text-white text-sm font-semibold">
          Flow Diagram Editor
        </div>
        <div className="ml-auto text-gray-400 text-sm">
          💡 Drag nodes to reposition • Click ports to connect • Double-click to
          edit
        </div>
      </div>

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
              return (
                <div
                  style={{
                    padding: "20px",
                    background: "#4A90E2",
                    color: "white",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: "120px",
                  }}
                  onDoubleClick={() => stateActions.onNodeDoubleClick(node.id)}
                >
                  {node.id}
                </div>
              );
            },
          }}
        />
      </div>
    </div>
  );
};

export default FlowDiagram;
