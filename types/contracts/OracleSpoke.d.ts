// THIS IS A TEMPORARY PATCH
import {
  ethers,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface OracleSpokeInterface extends ethers.utils.Interface {
  functions: {
    "childRequestIds(bytes32)": FunctionFragment;
    "compressAncillaryData(bytes,address,uint256)": FunctionFragment;
    "finder()": FunctionFragment;
    "getChildMessenger()": FunctionFragment;
    "getPrice(bytes32,uint256,bytes)": FunctionFragment;
    "hasPrice(bytes32,uint256)": FunctionFragment;
    "processMessageFromParent(bytes)": FunctionFragment;
    "requestPrice(bytes32,uint256,bytes)": FunctionFragment;
    "resolveLegacyRequest(bytes32,uint256,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "childRequestIds",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "compressAncillaryData",
    values: [BytesLike, string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "finder", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getChildMessenger",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPrice",
    values: [BytesLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "hasPrice",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "processMessageFromParent",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "requestPrice",
    values: [BytesLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "resolveLegacyRequest",
    values: [BytesLike, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "childRequestIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "compressAncillaryData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "finder", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getChildMessenger",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "hasPrice", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "processMessageFromParent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "requestPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "resolveLegacyRequest",
    data: BytesLike
  ): Result;

  events: {
    "PriceRequestAdded(bytes32,uint256,bytes,bytes32)": EventFragment;
    "PriceRequestBridged(address,bytes32,uint256,bytes,bytes32,bytes32)": EventFragment;
    "PushedPrice(bytes32,uint256,bytes,int256,bytes32)": EventFragment;
    "ResolvedLegacyRequest(bytes32,uint256,bytes,int256,bytes32,bytes32)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "PriceRequestAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PriceRequestBridged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PushedPrice"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ResolvedLegacyRequest"): EventFragment;
}

export type PriceRequestAddedEvent = TypedEvent<
  [string, BigNumber, string, string] & {
    identifier: string;
    time: BigNumber;
    ancillaryData: string;
    requestHash: string;
  }
>;

export type PriceRequestBridgedEvent = TypedEvent<
  [string, string, BigNumber, string, string, string] & {
    requester: string;
    identifier: string;
    time: BigNumber;
    ancillaryData: string;
    childRequestId: string;
    parentRequestId: string;
  }
>;

export type PushedPriceEvent = TypedEvent<
  [string, BigNumber, string, BigNumber, string] & {
    identifier: string;
    time: BigNumber;
    ancillaryData: string;
    price: BigNumber;
    requestHash: string;
  }
>;

export type ResolvedLegacyRequestEvent = TypedEvent<
  [string, BigNumber, string, BigNumber, string, string] & {
    identifier: string;
    time: BigNumber;
    ancillaryData: string;
    price: BigNumber;
    requestHash: string;
    legacyRequestHash: string;
  }
>;

export class OracleSpoke extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  listeners(eventName?: string): Array<Listener>;

  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  off(eventName: string, listener: Listener): this;

  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on(eventName: string, listener: Listener): this;

  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once(eventName: string, listener: Listener): this;

  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener(eventName: string, listener: Listener): this;

  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: OracleSpokeInterface;

  functions: {
    childRequestIds(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    compressAncillaryData(
      ancillaryData: BytesLike,
      requester: string,
      requestBlockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    finder(overrides?: CallOverrides): Promise<[string]>;

    getChildMessenger(overrides?: CallOverrides): Promise<[string]>;

    "getPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "getPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "hasPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    "hasPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    processMessageFromParent(
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "requestPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "requestPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    resolveLegacyRequest(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  childRequestIds(arg0: BytesLike, overrides?: CallOverrides): Promise<string>;

  compressAncillaryData(
    ancillaryData: BytesLike,
    requester: string,
    requestBlockNumber: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  finder(overrides?: CallOverrides): Promise<string>;

  getChildMessenger(overrides?: CallOverrides): Promise<string>;

  "getPrice(bytes32,uint256,bytes)"(
    identifier: BytesLike,
    time: BigNumberish,
    ancillaryData: BytesLike,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "getPrice(bytes32,uint256)"(
    identifier: BytesLike,
    time: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "hasPrice(bytes32,uint256)"(
    identifier: BytesLike,
    time: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  "hasPrice(bytes32,uint256,bytes)"(
    identifier: BytesLike,
    time: BigNumberish,
    ancillaryData: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  processMessageFromParent(
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "requestPrice(bytes32,uint256,bytes)"(
    identifier: BytesLike,
    time: BigNumberish,
    ancillaryData: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "requestPrice(bytes32,uint256)"(
    identifier: BytesLike,
    time: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  resolveLegacyRequest(
    identifier: BytesLike,
    time: BigNumberish,
    ancillaryData: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    childRequestIds(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    compressAncillaryData(
      ancillaryData: BytesLike,
      requester: string,
      requestBlockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    finder(overrides?: CallOverrides): Promise<string>;

    getChildMessenger(overrides?: CallOverrides): Promise<string>;

    "getPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "hasPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "hasPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    processMessageFromParent(
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "requestPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "requestPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    resolveLegacyRequest(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "PriceRequestAdded(bytes32,uint256,bytes,bytes32)"(
      identifier?: BytesLike | null,
      time?: null,
      ancillaryData?: null,
      requestHash?: BytesLike | null
    ): TypedEventFilter<
      [string, BigNumber, string, string],
      {
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        requestHash: string;
      }
    >;

    PriceRequestAdded(
      identifier?: BytesLike | null,
      time?: null,
      ancillaryData?: null,
      requestHash?: BytesLike | null
    ): TypedEventFilter<
      [string, BigNumber, string, string],
      {
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        requestHash: string;
      }
    >;

    "PriceRequestBridged(address,bytes32,uint256,bytes,bytes32,bytes32)"(
      requester?: string | null,
      identifier?: null,
      time?: null,
      ancillaryData?: null,
      childRequestId?: BytesLike | null,
      parentRequestId?: BytesLike | null
    ): TypedEventFilter<
      [string, string, BigNumber, string, string, string],
      {
        requester: string;
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        childRequestId: string;
        parentRequestId: string;
      }
    >;

    PriceRequestBridged(
      requester?: string | null,
      identifier?: null,
      time?: null,
      ancillaryData?: null,
      childRequestId?: BytesLike | null,
      parentRequestId?: BytesLike | null
    ): TypedEventFilter<
      [string, string, BigNumber, string, string, string],
      {
        requester: string;
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        childRequestId: string;
        parentRequestId: string;
      }
    >;

    "PushedPrice(bytes32,uint256,bytes,int256,bytes32)"(
      identifier?: BytesLike | null,
      time?: null,
      ancillaryData?: null,
      price?: null,
      requestHash?: BytesLike | null
    ): TypedEventFilter<
      [string, BigNumber, string, BigNumber, string],
      {
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        price: BigNumber;
        requestHash: string;
      }
    >;

    PushedPrice(
      identifier?: BytesLike | null,
      time?: null,
      ancillaryData?: null,
      price?: null,
      requestHash?: BytesLike | null
    ): TypedEventFilter<
      [string, BigNumber, string, BigNumber, string],
      {
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        price: BigNumber;
        requestHash: string;
      }
    >;

    "ResolvedLegacyRequest(bytes32,uint256,bytes,int256,bytes32,bytes32)"(
      identifier?: BytesLike | null,
      time?: null,
      ancillaryData?: null,
      price?: null,
      requestHash?: BytesLike | null,
      legacyRequestHash?: BytesLike | null
    ): TypedEventFilter<
      [string, BigNumber, string, BigNumber, string, string],
      {
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        price: BigNumber;
        requestHash: string;
        legacyRequestHash: string;
      }
    >;

    ResolvedLegacyRequest(
      identifier?: BytesLike | null,
      time?: null,
      ancillaryData?: null,
      price?: null,
      requestHash?: BytesLike | null,
      legacyRequestHash?: BytesLike | null
    ): TypedEventFilter<
      [string, BigNumber, string, BigNumber, string, string],
      {
        identifier: string;
        time: BigNumber;
        ancillaryData: string;
        price: BigNumber;
        requestHash: string;
        legacyRequestHash: string;
      }
    >;
  };

  estimateGas: {
    childRequestIds(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compressAncillaryData(
      ancillaryData: BytesLike,
      requester: string,
      requestBlockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    finder(overrides?: CallOverrides): Promise<BigNumber>;

    getChildMessenger(overrides?: CallOverrides): Promise<BigNumber>;

    "getPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "hasPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "hasPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    processMessageFromParent(
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "requestPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "requestPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    resolveLegacyRequest(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    childRequestIds(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compressAncillaryData(
      ancillaryData: BytesLike,
      requester: string,
      requestBlockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    finder(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getChildMessenger(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "getPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "hasPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "hasPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    processMessageFromParent(
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "requestPrice(bytes32,uint256,bytes)"(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "requestPrice(bytes32,uint256)"(
      identifier: BytesLike,
      time: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    resolveLegacyRequest(
      identifier: BytesLike,
      time: BigNumberish,
      ancillaryData: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
