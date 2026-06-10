import { createBuilder } from './.aspire/modules/aspire.mjs';

const builder = await createBuilder();

// Add Azure Cosmos DB and run as the local emulator during development.
const cosmos = builder.addAzureCosmosDB("cosmos").runAsEmulator();

// Add a database named "tododb" to the Cosmos DB account.
const tododb = cosmos.addCosmosDatabase("tododb");

// Run the Python FastAPI app and expose its HTTP endpoint externally.
// Pass the Cosmos DB connection to the API so it can store TODO items.
const app = await builder
    .addUvicornApp("app", "./app", "main:app")
    .withUv()
    .withExternalHttpEndpoints()
    .withHttpHealthCheck({ path: "/health" })
    .withReference(cosmos)
    .waitFor(tododb);

// Run the Vite frontend after the API and inject the API URL for local proxying.
const frontend = await builder
    .addViteApp("frontend", "./frontend")
    .withReference(app)
    .waitFor(app);

// Bundle the frontend build output into the API container for publish/deploy.
await app.publishWithContainerFiles(frontend, "./static");

await builder.build().run();
