This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```
## Generating the Approved Identifiers Table

We use a JSON file to look up titles, descriptions and URLs for approved price identifiers for display in the UI. The list of approved identifiers can be found [in our docs](https://docs.umaproject.org/resources/approved-price-identifiers). 

These approved identifiers are updated periodically in the docs, and when this happens, the JSON file will need to be re-generated.

To generate the JSON file, run the following command in the root directory of the project:

`yarn update-approved-identifiers`

This will download the raw file of the approved identifiers from the UMA docs (on GitHub), and then re-generate a JSON file.