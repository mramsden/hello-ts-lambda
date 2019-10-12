import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let message;
    if (event.queryStringParameters && event.queryStringParameters['name']) {
        message = `Hello, ${event.queryStringParameters['name']}!`;
    } else {
        message = `Hello, World!`;
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message }),
    };
};
