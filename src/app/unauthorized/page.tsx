// app/unauthorized/page.tsx
const UnauthorizedPage = () => {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-600">403 - Unauthorized</h1>
        <p className="mt-2 text-gray-600">You do not have access to this page.</p>
      </div>
    );
  };
  
  export default UnauthorizedPage;
  