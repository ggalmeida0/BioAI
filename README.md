# Local setup

## Installations:

- Install the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Install [Docker](https://www.docker.com/)
- Install [node 18 and npm](https://nodejs.org/en)
- Install [AWS-CLI](https://aws.amazon.com/cli/)
- Install Zip cli tool (in Ubuntu: `sudo apt-get install zip`)
- Inside each directory install the dependecies by running `npm i`.

## Configuring AWS

To connect your local environment to the AWS account run `aws configure` and provide the credentials.

## Deploy infrastructure

### Create secrets in the AWS secret mananager console:

1. Google OAuth Secrets (Needed for login with Google):

   - Secret name: `googlecloud`
   - Secret key: `BIO_GOOGLE_OAUTH_CLIENT_SECRET`
   - Secret value: **Your Google OAuth Client Secret** ([Documentation](https://developers.google.com/identity/protocols/oauth2))

2. OpenAI Secrets (Needed for using GPT as the LLM)

   - Secret name: `openai`
   - Secret key: `OPENAI_API_KEY`
   - Secret value: **Your OpenAI API Key** ([Get it here](https://platform.openai.com))

### Build service lambda code.

Inside `service` directory, `npm run prod-build`

### Setup the Environment Variables

Add these in a .env file inside the root of the repo.

- `GOOGLE_CLIENT_ID`: Your Google OAuth client id (should be in the same page as the client secret). Will be used by Congnito to perform Google login.
- `OAUTH_CALLBACK_URL`: A comma separated list of URLs. These are the acceptable URLs to be redirected after performing OAuth, include localhost URLs.

### Deploy cloud resources

Inside the `infra` directory run `npx cdk deploy`. This will deploy all AWS resources.

## Running the service API locally

We can use the SAM cli to spin up a local lambda and API gateway instance. This way we don't have to waste time deploying while we are developing.

### Setup the local lambda env vars:

Create a file `service/env/dev-env-vars.json` with the form:

```json
{
  "Parameters": {
    "USER_POOL_CLIENT_ID": "<Your user pool client id in AWS>",
    "USER_POOL_ID": "<Your user pool id in AWS>"
  }
}
```

Go inside the `service` directory and run `npm start` to spin it up.

There is not local database setup, so all data interaction will be with the deployed DDB. There are [ways](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) to setup DDB locally however.

## Running the UI

Go to `ui` folder, `npm i` to install dependencies. To bring up the UI server in the web run `npm run web` inside the `ui` folder. This will run the web version of the UI with webpack.

To deploy the UI or use the UI with a deployed backend, we need to set the appropiate environment variables:

- `PROD_API_ENDPOINT` (Lambda function URL)
- `UI_PROD_AUTH_REDIRECT_URI` (Domain to redirect to after OAuth is completed)
