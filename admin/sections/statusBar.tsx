export const StatusBar = ({ configured }: { configured: boolean }) => {
  return (
    <div className="w-full items-center justify-between font-mono text-sm">
      <p className="fixed left-0 top-0 flex max-w-8xl justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
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
