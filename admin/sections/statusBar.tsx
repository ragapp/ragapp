export const StatusBar = ({ configured }: { configured: boolean }) => {
  return (
    <div className="w-full items-center flex justify-center p-4 border-b bg-gray-200">
      <p className="font-mono text-sm">
        {configured ? (
          <>
            Successfully configured.&nbsp;<b>Add knowledge</b>&nbsp;or&nbsp;
            <b>chat with the app</b>&nbsp;below.
          </>
        ) : (
          <>
            Get started by updating the&nbsp;
            <code className="font-mono font-bold">OpenAI API Key</code>
          </>
        )}
      </p>
    </div>
  );
};
