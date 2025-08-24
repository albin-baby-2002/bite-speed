import { ArrowLeft, MessageSquareText } from "lucide-react";
import {
  useState,
  useCallback,
  type JSX,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  useReactFlow,
  type EdgeChange,
  type NodeChange,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeTypeItem from "./components/node-type-item";
import { useDrop } from "react-dnd";
import TextMessageNode from "./components/text-message-node";
import { toast } from "sonner";

//---------------------------------------------------------------

// types

export type TTypeOfNodes = "text";

export interface TNodeType {
  type: TTypeOfNodes;
  icon: JSX.Element;
  label: string;
}

interface TEdgeData {
  id: string;
  source: string;
  target: string;
}

interface TNodeData {
  id: string;
  position: { x: number; y: number };
  data: { message: string };
  type: TTypeOfNodes;
}

//---------------------------------------------------------------

const NODE_DATA_KEY = "CHAT_FLOW_NODES";
const EDGE_DATA_KEY = "CHAT_FLOW_EDGES";

const NODES: TNodeType[] = [
  {
    type: "text",
    icon: <MessageSquareText />,
    label: "Message",
  },
];

const nodeComponents: Record<TTypeOfNodes, (props: NodeProps) => JSX.Element> =
  {
    text: TextMessageNode,
  };

//---------------------------------------------------------------

// main component

function App() {
  const [nodes, setNodes] = useState<TNodeData[]>([]);
  const [edges, setEdges] = useState<TEdgeData[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<TNodeData[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const { sources, targets } = useMemo(() => {
    return edges.reduce<{ sources: string[]; targets: string[] }>(
      (acc, curr) => {
        return {
          sources: Array.from(new Set([...acc.sources, curr.source])),
          targets: Array.from(new Set([...acc.targets, curr.target])),
        };
      },
      { sources: [], targets: [] },
    );
  }, [edges]);

  // useEffect to get data from localstorge intially to set to local state

  useEffect(() => {
    const nodes = JSON.parse(localStorage.getItem(NODE_DATA_KEY) || "[]");
    const edges = JSON.parse(localStorage.getItem(EDGE_DATA_KEY) || "[]");
    setNodes(nodes as TNodeData[]);
    setEdges(edges as TEdgeData[]);
  }, []);

  // hook to handle the drop of the node type item

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "NODE-TYPE",
    drop: (item: TNodeType, monitor) => {
      const offset = monitor.getClientOffset();
      const bounds = ref.current?.getBoundingClientRect();

      if (!offset || !bounds) return;

      // translate from client coords → relative to flow div
      const position = screenToFlowPosition({
        x: offset.x - bounds.left,
        y: offset.y - bounds.top,
      });

      setNodes((prev) => [
        ...prev,
        {
          id: `n${prev.length + 1}`,
          position,
          type: item.type,
          data: { message: "New Node" },
        },
      ]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const onNodesChange = useCallback(
    (changes: NodeChange<TNodeData>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback((changes: EdgeChange<TEdgeData>[]) => {
    setEdges((edgesSnapshot) => {
      return applyEdgeChanges(changes, edgesSnapshot);
    });
  }, []);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => {
        const alreadyHasEdge = edgesSnapshot.some(
          (e) => e.source === params.source,
        );

        if (alreadyHasEdge) {
          toast.error("One source can connect to one node only");
          return edgesSnapshot;
        }
        return addEdge(params, edgesSnapshot);
      }),
    [],
  );

  const handleNodeUpdate = (text: string, id: string) => {
    setNodes((item) => {
      return item.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, message: text } }
          : node,
      );
    });
  };

  const unselectAll = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  };

  const handleGoBack = () => unselectAll();

  const handleSave = () => {
    const error = nodes.some((item) => {
      return !sources.includes(item.id) && !targets.includes(item.id);
    });

    if (error) {
      return toast.error("Cannot save flow", {
        description: "Every node should have a connection",
      });
    }
    localStorage.setItem(NODE_DATA_KEY, JSON.stringify(nodes));
    localStorage.setItem(EDGE_DATA_KEY, JSON.stringify(edges));
    toast.success("Successfully saved");
  };

  dropRef(ref);

  return (
    <div className="grid h-screen max-h-screen w-screen grid-cols-[1fr_350px_10px] overflow-hidden">
      {/* the chat bot flow  */}
      <div
        ref={ref}
        style={{
          background: isOver ? "azure" : "",
        }}
        className="relative"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeComponents}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={(params) => {
            setSelectedNodes(params.nodes);
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 1.3 }}
        >
          <Background />
          <Controls />
        </ReactFlow>
        {/* added simple info for user to how to start with */}
        {nodes.length === 0 && (
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            Drag and drop a node from right panel to start building chat flow
          </p>
        )}
      </div>

      {/* panel */}

      <div className="grid h-full w-full grid-rows-[1fr_65px] overflow-hidden border-r border-l border-black/40 bg-white">
        <div className="grid h-full grid-rows-[45px_1fr] overflow-hidden">
          <div className="border-b border-black/40 p-2 text-center text-lg font-bold text-black/80">
            {selectedNodes.length > 0 ? (
              <div className="flex items-center">
                <ArrowLeft
                  onClick={handleGoBack}
                  className="cursor-pointer"
                  size={18}
                />
                <p className="mr-4 flex-1">Message</p>
              </div>
            ) : (
              <p>Chat Panel</p>
            )}
          </div>

          {/* react flow allow selecting multiple nodes at a time so giving option to edit mulitple nodes at a time */}

          {selectedNodes.length > 0 ? (
            <div className="flex max-h-full flex-col gap-4 overflow-y-auto p-4">
              {selectedNodes.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 font-medium capitalize"
                  >
                    <p>{item.type}</p>
                    <textarea
                      onChange={(e) => {
                        handleNodeUpdate(e.target.value, item.id);
                      }}
                      defaultValue={item.data.message}
                      className="rouded-sm w-full border border-black/60 p-2"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid max-h-full grid-cols-2 gap-2 overflow-y-auto p-4">
              {/* looping through available types of nodes */}

              {NODES.map((item, idx) => (
                <NodeTypeItem key={item.type + idx} node={item} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center border-t border-black/40 px-4">
          <button
            onClick={handleSave}
            className="h-10 w-full cursor-pointer rounded-sm bg-black/80 font-bold text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
