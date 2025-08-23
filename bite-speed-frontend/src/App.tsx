function App() {
  return (
    <div className=" grid grid-cols-[1fr_350px] h-screen w-full">
      {/* the chat bot flow  */}
      <div></div>

      {/* panel */}
      <div className=" bg-gray-200 h-full w-full grid grid-rows-[1fr_auto]">
        <div>
          <p className=" p-2 text-lg font-bold text-center  border-b border-black/40 ">Chat-Bot Flow Panel</p>
        </div>
        <button className=" bg-black/80 rounded-sm text-white h-10 m-2 font-bold cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default App;
