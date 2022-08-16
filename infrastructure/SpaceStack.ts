import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { join } from "path";
import { GenericTable } from "./GenericTable";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class SpaceStack extends Stack {
  private api = new RestApi(this, "SpaceApi");
  private spaceTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "Create",
    readLambdaPath: "Read",
    updateLambdaPath: "Update",
    deleteLambdaPath: "Delete",
    secondaryIndexes: ["location"],
  });

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const helloLambdaNodeJs = new NodejsFunction(this, "helloLambdaNodeJs", {
      entry: join(__dirname, "..", "services", "node-lambda", "hello.ts"),
      handler: "handler",
    });
    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions("s3:ListAllMyBuckets");
    s3ListPolicy.addResources("*");
    helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

    const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs);
    const helloLambdaResource = this.api.root.addResource("hello");
    helloLambdaResource.addMethod("GET", helloLambdaIntegration);

    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spaceTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spaceTable.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.spaceTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spaceTable.deleteLambdaIntegration);
  }
}
