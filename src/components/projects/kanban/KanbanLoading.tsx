
export const KanbanLoading = () => {
  return (
    <div className="flex justify-center p-8">
      <div className="animate-pulse flex flex-col w-full gap-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-64 w-72 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};
