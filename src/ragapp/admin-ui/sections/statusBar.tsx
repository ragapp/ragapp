import { getBaseURL } from "@/client/utils";

export const StatusBar = ({ configured }: { configured: boolean }) => {
  return (
    <div className="w-full items-center flex justify-center p-4 border-b bg-gray-200">
      <p className="font-mono text-sm">
        {configured ? (
          <>
            <b>Add knowledge</b>&nbsp;or&nbsp;
            <b>test the chat</b>&nbsp;below. Once you&apos;re satisfied,&nbsp;
            <a
              className="text-blue-500 hover:underline decoration-blue-500"
              href={getBaseURL()}
              target="_blank"
            >
              start the app
            </a>
            &nbsp;or&nbsp;
            <a
              className="text-blue-500 hover:underline decoration-blue-500"
              href={`${getBaseURL()}/docs`}
              target="_blank"
            >
              use the API
            </a>
            .
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
