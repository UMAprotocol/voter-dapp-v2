import request from "graphql-request";

/**
 * Thegraph can only return a maximum of 1000 documents at a time and does not support pagination features whereby the client can determine the total amount of documents in the store.
 * This helper requests 1000 documents at a time until there are no more ensuring we don't miss any
 * @param endpoint the endpoint for your graphql request
 * @param query your graphql request document
 * @param dataKey the key for the data you want. this is the root key of your graphql document
 * @param pageSize Chunk size per request. 1000 is the max we get back from thegraph but you can customize this.
 * @returns a flattened array of the document[dataKey] for all requests
 */
export async function fetchAllDocuments<
  RequestType extends {
    [key: string]: unknown[];
  }
>(
  endpoint: string,
  query: string,
  dataKey: keyof RequestType,
  pageSize = 1000
) {
  let allData = new Array<RequestType[keyof RequestType][number]>();
  let skip = 0;
  let continueFetching = true;

  while (continueFetching) {
    const variables = { skip, limit: pageSize };
    const response = await request<RequestType>(endpoint, query, variables);
    allData = allData.concat(response[dataKey]);

    // if we get less than 1000 we know we got them all
    if (response[dataKey].length < pageSize) {
      continueFetching = false;
    } else {
      skip += pageSize;
    }
  }

  return allData;
}
