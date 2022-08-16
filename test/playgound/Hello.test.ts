import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../services/SpacesTable/Delete";

const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: "eedcc6a6-7aed-4d5a-832e-6b417670aa8a",
  },
} as any;

handler(event, {} as any).then((apiResult) => {
  const items = JSON.parse(apiResult.body);
  console.log("done");
});
