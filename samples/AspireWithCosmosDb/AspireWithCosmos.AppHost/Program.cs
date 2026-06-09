using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

var cosmos = builder.AddAzureCosmosDB("cosmos")
    // Remove the RunAsEmulator() line should you want to use a live instance during development
    .RunAsEmulator();

cosmos.AddCosmosDatabase("tododb");

var apiService = builder.AddProject<Projects.AspireWithCosmos_ApiService>("apiservice")
    .WithReference(cosmos);

builder.AddProject<Projects.AspireWithCosmos_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithReference(apiService);

builder.Build().Run();
