import { MessageSquareText } from 'lucide-react';

const NODES = [
  {
    type: 'message',
    icon: <MessageSquareText />,
  },
];

function App() {
  return (
    <div className=" grid grid-cols-[1fr_350px] h-screen max-h-screen overflow-hidden w-screen">
      {/* the chat bot flow  */}
      <div></div>

      {/* panel */}
      <div className=" bg-gray-200 h-full w-full overflow-hidden grid grid-rows-[1fr_55px]">
        <div className=" h-full  overflow-hidden grid grid-rows-[45px_1fr]">
          <div className=" p-2 text-lg font-bold text-center text-black/80  border-b border-black/40 ">
            <p>Chat-Bot Flow Panel</p>
          </div>
          <div className=" grid gap-2 grid-cols-2 p-4 max-h-full overflow-y-auto">
            {/* looping through available types of nodes */}

            {NODES.map((item, idx) => {
              return (
                <div
                  className="flex-col capitalize w-full h-20 gap-2 flex items-center justify-center border-2 rounded-sm border-black/40 font-bold text-black/70 "
                  key={item.type + idx}
                >
                  {item.icon}
                  {item.type}
                </div>
              );
            })}
          </div>
        </div>
        <button className=" bg-black/80 rounded-sm text-white h-10 m-2 font-bold cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default App;
