import usePriceRequestRounds from "hooks/usePriceRequestRounds";

export function PriceRequests() {
  const { status, data, error } = usePriceRequestRounds("time", "desc", 5);

  return (
    <div>
      <h1>Price Requests</h1>
      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <p>Error: {error instanceof Error && error.message}</p>
      ) : (
        <>{JSON.stringify(data)}</>
      )}
    </div>
  );
}
