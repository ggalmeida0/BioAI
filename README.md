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

## Running the service API locally

We can use the SAM cli to spin up a local lambda and API gateway instance. This way we don't have to waste time deploying while we are developing.

Go inside the `service` directory and run `npm start` to spin it up.

There is not local database setup, so all data interaction will be with the prod DDB. There are ways to setup DDB locally when we need to however.

## Running the UI

To bring up the UI server in the web run `npm run web` inside the `ui` folder. This will run the web version of the UI with webpack.

# Deploying to AWS

Once done developing locally we can deploy infrastructure and lambda code changes to the cloud.

## Deploying lambda code

Inside the `service` directory run `npm run deploy`. This will also deploy the infra changes.

## Deploy infra

Inside the `infra` directory run `npx cdk deploy`. This will only deploy infra change, not lambda code.
