
export const ProjectListLoading = () => {
  return (
    <div className="text-center py-10">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <p className="mt-4 text-gray-600">Projekte werden geladen...</p>
    </div>
  );
};
