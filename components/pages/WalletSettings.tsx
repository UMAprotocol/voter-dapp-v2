import { Layout } from "components";
import { useUserContext } from "hooks";

export function WalletSettings() {
  const { address } = useUserContext();

  console.log({ address });
  return (
    <Layout>
      <div>hello</div>
    </Layout>
  );
}
