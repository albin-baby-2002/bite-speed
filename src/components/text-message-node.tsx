import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquareText } from "lucide-react";
import WhatsApp from "../assets/whatsapp";

// we can setup the update if need inside the node itself
// but for that we need to create the nodes's state in redux
// node props don't provide the function to update it

const TextMessageNode = (props: NodeProps) => {
  const { data, selected } = props;

  return (
    <div
      className={`min-h-[70px] max-w-[220px] min-w-[220px] rounded-md border bg-white shadow-md ${
        selected ? "border-blue-500" : "border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between bg-teal-400/30 px-2 py-1.5">
        <div className="flex items-center gap-1 text-xs font-bold">
          <MessageSquareText size={12} />
          <p>Send Message</p>
        </div>
        <div className="rounded-full bg-white p-[2px]">
          <WhatsApp />
        </div>
      </div>
      {/* text message */}

      <div className=" p-2.5 text-xs ">
        <p className="font-semibold text-black/60">{data?.["message"] as string}</p>
      </div>

      {/* left side source handle */}

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#555" }}
      />

      {/* right side source handle */}

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#555" }}
      />
    </div>
  );
};

export default TextMessageNode;
