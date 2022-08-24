import { IdentifierDetailsT } from "types/global";
import approvedIdentifiersTable from "./approvedIdentifiersTable.json";

const approvedIdentifiers: Record<string, IdentifierDetailsT> = approvedIdentifiersTable;

export default approvedIdentifiers;
